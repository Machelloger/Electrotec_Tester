import { app, BrowserWindow, ipcMain, dialog } from 'electron';
import path from 'path';
import fs from 'fs-extra';

let mainWindow: BrowserWindow | null = null;
const userDataPath = app.getPath('userData');
const appDataPath = path.join(userDataPath, 'testing_system_data');

// Флаг для отслеживания регистрации обработчиков
let ipcHandlersRegistered = false;

// Инициализация структуры папок
async function initializeDataStructure() {
  const dataPath = path.join(appDataPath, 'data');
  
  try {
    await fs.ensureDir(dataPath);
    
    // Папки курсов
    await fs.ensureDir(path.join(dataPath, '2kurs'));
    await fs.ensureDir(path.join(dataPath, '3kurs'));
    
    // Папка студентов
    const studentsPath = path.join(dataPath, 'Students');
    await fs.ensureDir(studentsPath);
    
    // Примерные файлы студентов (если не существуют)
    const students2Path = path.join(studentsPath, '2.txt');
    if (!await fs.pathExists(students2Path)) {
      await fs.writeFile(students2Path, `# Файл студентов кафедры информатики
# Создан: ${new Date().toLocaleDateString('ru-RU')}
# Формат: ФИО | Группа

ИТ-21
Иванов Иван Иванович | ИТ-21
Петров Петр Петрович | ИТ-21

ПМИ-22
Сидорова Анна Сергеевна | ПМИ-22`);
    }
    
    const students3Path = path.join(studentsPath, '3.txt');
    if (!await fs.pathExists(students3Path)) {
      await fs.writeFile(students3Path, `# Файл студентов кафедры информатики
# Создан: ${new Date().toLocaleDateString('ru-RU')}
# Формат: ФИО | Группа

ФИИТ-31
Попов Денис Олегович | ФИИТ-31

ИВТ-32
Николаев Сергей Владимирович | ИВТ-32`);
    }
    
    console.log('✅ Структура данных инициализирована:', dataPath);
    return dataPath;
  } catch (error) {
    console.error('❌ Ошибка инициализации:', error);
    throw error;
  }
}

// Функция для регистрации IPC обработчиков (вызывается один раз)
function registerIpcHandlers() {
  if (ipcHandlersRegistered) {
    console.log('⚠️ IPC handlers already registered, skipping...');
    return;
  }
  
  console.log('📡 Регистрация IPC обработчиков...');
  
  ipcMain.handle('get-data-path', () => {
    return path.join(appDataPath, 'data');
  });

  ipcMain.handle('list-directory', async (event, dirPath) => {
    try {
      const fullPath = path.join(appDataPath, 'data', dirPath);
      
      if (!await fs.pathExists(fullPath)) {
        return [];
      }
      
      const items = await fs.readdir(fullPath, { withFileTypes: true });
      const result = [];
      
      for (const item of items) {
        const itemPath = path.join(dirPath, item.name);
        const stats = await fs.stat(path.join(fullPath, item.name));
        
        result.push({
          name: item.name,
          isDirectory: item.isDirectory(),
          path: itemPath,
          extension: item.isDirectory() ? undefined : path.extname(item.name).slice(1),
          size: stats.size,
          modified: stats.mtime
        });
      }
      
      return result.sort((a, b) => {
        if (a.isDirectory && !b.isDirectory) return -1;
        if (!a.isDirectory && b.isDirectory) return 1;
        return a.name.localeCompare(b.name);
      });
    } catch (error) {
      console.error('Error listing directory:', error);
      return [];
    }
  });

  ipcMain.handle('read-file', async (event, filePath) => {
    try {
      const fullPath = path.join(appDataPath, 'data', filePath);
      const content = await fs.readFile(fullPath, 'utf-8');
      return { success: true, content };
    } catch (error) {
      return { success: false, error: String(error) };
    }
  });

  ipcMain.handle('export-data', async () => {
    try {
      const { filePath, canceled } = await dialog.showSaveDialog({
        title: 'Экспорт данных',
        defaultPath: path.join(app.getPath('downloads'), 'testing-system-backup.zip'),
        filters: [{ name: 'ZIP Archive', extensions: ['zip'] }]
      });

      if (canceled || !filePath) {
        return { success: false, error: 'Отменено' };
      }

      const archiver = require('archiver');
      const output = fs.createWriteStream(filePath);
      const archive = archiver('zip', { zlib: { level: 9 } });

      return new Promise((resolve) => {
        output.on('close', () => resolve({ success: true, filePath }));
        archive.on('error', (error: Error) => resolve({ success: false, error: error.message }));
        archive.pipe(output);
        archive.directory(path.join(appDataPath, 'data'), false);
        archive.finalize();
      });
    } catch (error) {
      return { success: false, error: String(error) };
    }
  });

  ipcMain.handle('import-data', async () => {
    try {
      const { filePaths, canceled } = await dialog.showOpenDialog({
        title: 'Импорт данных',
        filters: [{ name: 'ZIP Archive', extensions: ['zip'] }],
        properties: ['openFile']
      });

      if (canceled || filePaths.length === 0) {
        return { success: false, error: 'Отменено' };
      }

      const extract = require('extract-zip');
      const dataPath = path.join(appDataPath, 'data');
      
      // Удаляем старые данные
      await fs.remove(dataPath);
      
      // Распаковываем новые
      await extract(filePaths[0], { dir: dataPath });
      
      return { success: true };
    } catch (error) {
      return { success: false, error: String(error) };
    }
  });

  // Обработчик для изображений
  ipcMain.handle('read-image', async (event, imagePath) => {
    try {
      const fullPath = path.join(appDataPath, 'data', imagePath);
      
      if (!await fs.pathExists(fullPath)) {
        return { success: false, error: 'Image not found' };
      }
      
      // Читаем файл как buffer
      const imageBuffer = await fs.readFile(fullPath);
      
      // Конвертируем в base64
      const base64Image = imageBuffer.toString('base64');
      
      // Определяем MIME тип по расширению
      const ext = path.extname(fullPath).toLowerCase();
      let mimeType = 'image/png';
      
      if (ext === '.jpg' || ext === '.jpeg') {
        mimeType = 'image/jpeg';
      } else if (ext === '.gif') {
        mimeType = 'image/gif';
      } else if (ext === '.bmp') {
        mimeType = 'image/bmp';
      }
      
      return { 
        success: true, 
        data: `data:${mimeType};base64,${base64Image}` 
      };
    } catch (error) {
      return { success: false, error: String(error) };
    }
  });

  // Обработчик для проверки типа файла
  ipcMain.handle('get-file-type', async (event, filePath) => {
    try {
      const fullPath = path.join(appDataPath, 'data', filePath);
      
      if (!await fs.pathExists(fullPath)) {
        return { success: false, error: 'File not found' };
      }
      
      const stats = await fs.stat(fullPath);
      const ext = path.extname(fullPath).toLowerCase();
      
      let fileType = 'unknown';
      if (stats.isDirectory()) {
        fileType = 'directory';
      } else if (['.png', '.jpg', '.jpeg', '.gif', '.bmp', '.svg'].includes(ext)) {
        fileType = 'image';
      } else if (['.txt', '.json', '.md', '.csv'].includes(ext)) {
        fileType = 'text';
      } else if (['.pdf'].includes(ext)) {
        fileType = 'pdf';
      }
      
      return { success: true, fileType };
    } catch (error) {
      return { success: false, error: String(error) };
    }
  });

  ipcHandlersRegistered = true;
  console.log('✅ IPC обработчики зарегистрированы');
}

// Создание окна
async function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    show: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    }
  });

  mainWindow.maximize();

  // Инициализация данных
  await initializeDataStructure();

  // Регистрация обработчиков (только один раз)
  registerIpcHandlers();

  // Загрузка приложения
  if (process.env.NODE_ENV === 'development') {
    await mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
    mainWindow.show();
  } else {
    await mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
    mainWindow.show();
  }

  // Очистка при закрытии окна
  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// Обработчики событий приложения
app.whenReady().then(() => {
  createWindow();
  
  // Обработка для macOS
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Очистка IPC обработчиков при выходе (опционально)
app.on('will-quit', () => {
  console.log('🧹 Очистка IPC обработчиков...');
  // Удаляем все обработчики
  ipcMain.removeHandler('get-data-path');
  ipcMain.removeHandler('list-directory');
  ipcMain.removeHandler('read-file');
  ipcMain.removeHandler('export-data');
  ipcMain.removeHandler('import-data');
  ipcMain.removeHandler('read-image');
  ipcMain.removeHandler('get-file-type');
  ipcHandlersRegistered = false;
});