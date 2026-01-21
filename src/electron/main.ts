import { app, BrowserWindow, ipcMain, dialog, protocol } from 'electron';
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

  // Результаты тестов
  ipcMain.handle('fs:save-test-result', async (event, result) => {
    return await saveTestResult(result);
  });

  ipcMain.handle('fs:get-test-results', async () => {
    return await getTestResults();
  });
  
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
      await clearTestResults();
      
      // Распаковываем новые
      await extract(filePaths[0], { dir: dataPath });
      
      return { success: true };
    } catch (error) {
      return { success: false, error: String(error) };
    }
  });

  ipcMain.handle('write-file', async (event, filePath, content) => {
    try {
      const fullPath = path.resolve(process.cwd(), filePath);
      
      // Создаем директории если их нет
      const dir = path.dirname(fullPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      
      await fs.promises.writeFile(fullPath, content, 'utf8');
      return { success: true };
    } catch (error) {
      console.error('Ошибка записи файла:', error);
      return { success: false, error: error };
    }
  });

  // Обработчик для изображений
  // ДОБАВЛЯЕМ ОБРАБОТЧИК ДЛЯ ЧТЕНИЯ ИЗОБРАЖЕНИЙ
ipcMain.handle('read-image', async (event, imagePath, labInfo) => {
  try {
    console.log('Чтение изображения:', imagePath, 'для лабы:', labInfo);
    
    const appDataPath = app.getPath('userData');
    const dataPath = path.join(appDataPath, 'testing_system_data', 'data');
    
    let fullPath;
    
    // Вариант 1: Если передано только имя файла (image1.png)
    if (!imagePath.includes('/') && !imagePath.includes('\\')) {
      // Пытаемся найти в структуре курса/лабы
      if (labInfo && labInfo.course && labInfo.labName) {
        // Ищем в: data/{course}kurs/{labName}/images/{fileName}
        fullPath = path.join(
          dataPath, 
          `${labInfo.course}kurs`, 
          labInfo.labName, 
          'images', 
          imagePath
        );
        console.log('Путь с лабой:', fullPath);
      } else {
        // Ищем во всех images
        fullPath = path.join(dataPath, 'images', imagePath);
      }
    } 
    // Вариант 2: Если путь относительный (../images/image1.png)
    else if (imagePath.includes('../') && labInfo) {
      // Преобразуем: ../images/image1.png → {course}kurs/{labName}/images/image1.png
      const normalized = imagePath.replace('../', '');
      fullPath = path.join(
        dataPath,
        `${labInfo.course}kurs`,
        labInfo.labName,
        normalized
      );
    }
    // Вариант 3: Если путь уже содержит курс/лабу
    else {
      fullPath = path.join(dataPath, imagePath);
    }
    
    console.log('Ищем по пути:', fullPath);
    
    if (!fs.existsSync(fullPath)) {
      console.error('Файл не найден, пробуем поиск...');
      
      // Попробуем найти файл рекурсивно
      const found = findImageRecursive(dataPath, path.basename(imagePath));
      if (found) {
        console.log('Найден рекурсивно:', found);
        fullPath = found;
      } else {
        return { 
          success: false, 
          error: 'Файл не найден: ' + fullPath 
        };
      }
    }
    
    // Читаем файл
    const imageBuffer = fs.readFileSync(fullPath);
    const base64 = imageBuffer.toString('base64');
    
    const ext = path.extname(fullPath).toLowerCase();
    let mimeType = 'image/jpeg';
    if (ext === '.png') mimeType = 'image/png';
    else if (ext === '.gif') mimeType = 'image/gif';
    
    const dataUrl = `data:${mimeType};base64,${base64}`;
    
    console.log('✓ Изображение загружено');
    return { success: true, dataUrl };
    
  } catch (error) {
    console.error('Ошибка:', error);
    return { success: false, error: error };
  }
});

// Функция для рекурсивного поиска изображения
function findImageRecursive(dir:any, fileName:any):any {
  try {
    const files = fs.readdirSync(dir, { withFileTypes: true });
    
    for (const file of files) {
      const fullPath = path.join(dir, file.name);
      
      if (file.isDirectory()) {
        const found = findImageRecursive(fullPath, fileName);
        if (found) return found;
      } else if (file.name === fileName) {
        return fullPath;
      }
    }
  } catch (err) {
    console.error('Ошибка поиска:', err);
  }
  return null;
}

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

// === ПРОСТОЙ КОД ДЛЯ РЕЗУЛЬТАТОВ ТЕСТОВ ===

const resultsFilePath = path.join(appDataPath, 'data', 'test_results.json');

// Сохранить результат теста
async function saveTestResult(result: any): Promise<{ success: boolean; error?: string }> {
  try {
    // Читаем существующие результаты
    let allResults: any[] = [];
    if (await fs.pathExists(resultsFilePath)) {
      const content = await fs.readFile(resultsFilePath, 'utf-8');
      allResults = JSON.parse(content);
    }
    
    // Добавляем новый результат
    allResults.push({
      ...result,
      id: `result_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      date: new Date().toISOString()
    });
    
    // Сохраняем
    await fs.writeFile(resultsFilePath, JSON.stringify(allResults, null, 2), 'utf-8');
    return { success: true };
  } catch (error) {
    return { success: false, error: String(error) };
  }
}

// Получить все результаты
async function getTestResults(): Promise<any[]> {
  try {
    if (!await fs.pathExists(resultsFilePath)) {
      return [];
    }
    
    const content = await fs.readFile(resultsFilePath, 'utf-8');
    return JSON.parse(content);
  } catch (error) {
    console.error('Error reading results:', error);
    return [];
  }
}

// Очистить результаты (при импорте)
async function clearTestResults(): Promise<void> {
  try {
    if (await fs.pathExists(resultsFilePath)) {
      await fs.remove(resultsFilePath);
    }
  } catch (error) {
    console.error('Error clearing results:', error);
  }
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
      preload: path.join(__dirname, 'preload.js'),
      webSecurity: false,  // ← ВАЖНО: добавляем эту строку
      allowRunningInsecureContent: true,  // ← И эту строку тоже
    }
  });

  mainWindow.webContents.session.webRequest.onBeforeSendHeaders((details, callback) => {
    // Разрешаем загрузку локальных файлов - правильный синтаксис
    if (details.requestHeaders.Origin) {
      delete details.requestHeaders.Origin;
    }
    callback({ cancel: false, requestHeaders: details.requestHeaders });
  });

  mainWindow.maximize();
  mainWindow.setFocusable(true);
  mainWindow.focus();

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
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
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