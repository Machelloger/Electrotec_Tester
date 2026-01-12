import React, { useState, useEffect } from 'react';
import { useFileSystem } from '../hooks/useFileSystem';
import './FileViewer.css';
import Exit from '../assets/exit.svg'
import CheckLastTester from './CheckLastTesters'

interface FileItem {
  name: string;
  isDirectory: boolean;
  path: string;
  extension?: string;
}

  type ParentProps = {
    changePage: (pageName: string) => void
  }

function FileViewer(props: ParentProps) {
  const {
    listDirectory,
    readFile,
    getDataPath,
    exportData,
    importData,
    parseStudents,
    isLoading,
    error
  } = useFileSystem();

  const [files, setFiles] = useState<FileItem[]>([]);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [fileContent, setFileContent] = useState<string>('');
  const [currentPath, setCurrentPath] = useState<string>('');
  const [pathHistory, setPathHistory] = useState<string[]>(['']);
  const [dataPath, setDataPath] = useState<string>('');
  const [students, setStudents] = useState<any[]>([]);

  // Загрузка начальных данных
  useEffect(() => {
    initApp();
  }, []);

  const initApp = async () => {
    const path = await getDataPath();
    if (path) {
      setDataPath(path);
      await loadDirectory('');
    }
  };

  const loadDirectory = async (path: string) => {
    const files = await listDirectory(path);
    console.log(files);
    setFiles(files);
    setCurrentPath(path);
    setSelectedFile(null);
    setFileContent('');
    
    // Если это корень, загружаем студентов
    if (path === '' || path === '/') {
      loadStudents();
    }
  };

  const loadStudents = async () => {
    try {
      // Читаем файлы студентов
      const students2 = await readFile('Students/2.txt');
      const students3 = await readFile('Students/3.txt');
      
      const allStudents = [];
      
      if (students2) {
        const parsed = parseStudents(students2, 2);
        allStudents.push(...parsed);
      }
      
      if (students3) {
        const parsed = parseStudents(students3, 3);
        allStudents.push(...parsed);
      }
      
      setStudents(allStudents);
    } catch (err) {
      console.error('Ошибка загрузки студентов:', err);
    }
  };

  const handleFileClick = async (file: FileItem) => {
    if (file.isDirectory) {
      setPathHistory(prev => [...prev, currentPath]);
      await loadDirectory(file.path);
    } else {
      setSelectedFile(file.path);
      const content = await readFile(file.path);
      if (content) {
        setFileContent(content);
      }
    }
  };

  const handleBack = () => {
    if (pathHistory.length > 0) {
      const prevPath = pathHistory[pathHistory.length - 1];
      setPathHistory(prev => prev.slice(0, -1));
      loadDirectory(prevPath);
    }
  };

  const handleExport = async () => {
    const result = await exportData();
    if (result.success) {
      alert(`✅ Данные экспортированы в:\n${result.filePath}`);
    } else {
      alert(`❌ Ошибка: ${result.error}`);
    }
  };

  const handleImport = async () => {
    if (confirm('Внимание! Текущие данные будут заменены. Продолжить?')) {
      const result = await importData();
      if (result.success) {
        alert('✅ Данные успешно импортированы');
        // Перезагружаем данные
        await loadDirectory(currentPath);
        await loadStudents();
      } else {
        alert(`❌ Ошибка: ${result.error}`);
      }
    }
  };

  const groupStudentsByGroup = () => {
    const groups: { [key: string]: any[] } = {};
    
    students.forEach(student => {
      if (!groups[student.group]) {
        groups[student.group] = [];
      }
      groups[student.group].push(student);
    });
    
    return groups;
  };

  const groups = groupStudentsByGroup();

  if (isLoading && files.length === 0) {
    return (
      <div className="app">
        <div className="loading">
          <h2>Загрузка системы...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="header">
        <h1>📚 Система управления тестированием</h1>
        <div className="controls">
          <button onClick={() => {props.changePage('login')}} style={{backgroundColor: '#CBD4DF', width: '60px', minHeight: "25px", padding: '2px'}}> 
            <img width='25px' src={Exit} alt='exit' />
          </button>
          <button className="btn btn-primary" onClick={handleExport} disabled={isLoading}>
            📤 Экспорт данных
          </button>
          <button className="btn btn-success" onClick={handleImport} disabled={isLoading}>
            📥 Импорт данных
          </button>
        </div>
      </div>

      {error && <div className="error">{error}</div>}

      <div className="content">
        {/* Левая панель - дерево файлов */}
        <div className="file-tree">
          <h2>📁 Файловая система</h2>
          <div className="file-list">
            {currentPath !== '' && (
              <div className="file-item" onClick={handleBack}>
                <span className="file-icon">📁</span>
                <span>.. (назад)</span>
              </div>
            )}
            
            {files.map((file, index) => (
              <div
                key={index}
                className={`file-item ${selectedFile === file.path ? 'selected' : ''}`}
                onClick={() => handleFileClick(file)}
              >
                <span className="file-icon">
                  {file.isDirectory ? '📁' : '📄'}
                </span>
                <span>{file.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Правая панель - содержимое */}
        <div className="file-content">
          <CheckLastTester />
          {selectedFile ? (
            <>
              <h2>📄 {selectedFile.split('/').pop()}</h2>
              <div className="file-info">
                Путь: {selectedFile}
              </div>
              <div className="file-text">
                {fileContent}
              </div>
            </>
          ) : currentPath === '' ? (
            <>
              <h2>👥 Студенты</h2>
              <div className="students-list">
                {Object.keys(groups).length === 0 ? (
                  <div className="loading">Нет данных о студентах</div>
                ) : (
                  Object.entries(groups).map(([groupName, groupStudents]) => (
                    <div key={groupName} className="student-group">
                      <div className="group-header">
                        <div className="group-name">{groupName}</div>
                        <div className="group-count">{groupStudents.length} чел.</div>
                      </div>
                      <div>
                        {groupStudents.map((student, index) => (
                          <div key={index} className="student-item">
                            <span>{student.fullName}</span>
                            <span className={`course-badge course-${student.course}`}>
                              {student.course} курс
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </>
          ) : (
            <>
              <h2>📁 {currentPath || 'Корневая папка'}</h2>
              <div className="file-info">
                {files.length} элементов
              </div>
              <div className="file-text">
                {files.length === 0 ? 'Папка пуста' : 'Выберите файл для просмотра'}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Информация о пути */}
      {dataPath && (
        <div className="path-info">
          <strong>Локальное хранилище данных:</strong><br />
          <code>{dataPath}</code>
          <div style={{ marginTop: '10px', fontSize: '12px', color: '#999' }}>
            Для переноса данных на другой компьютер используйте кнопку "Экспорт данных".
            Полученный ZIP-файл можно перенести на флешку и импортировать на другом ПК.
          </div>
        </div>
      )}
    </div>
  );
}

export default FileViewer;