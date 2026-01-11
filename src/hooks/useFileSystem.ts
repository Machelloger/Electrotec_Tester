import { useState } from 'react';

// Объявляем типы для electronAPI
declare global {
  interface Window {
    electronAPI: {
      getDataPath: () => Promise<string>;
      listDirectory: (dirPath: string) => Promise<any[]>;
      readFile: (filePath: string) => Promise<{ success: boolean; content?: string; error?: string }>;
      readImage: (imagePath: string) => Promise<{ success: boolean; data?: string; error?: string }>;
      getFileType: (filePath: string) => Promise<{ success: boolean; fileType?: string; error?: string }>;
      exportData: () => Promise<{ success: boolean; filePath?: string; error?: string }>;
      importData: () => Promise<{ success: boolean; error?: string }>;
    };
  }
}

export function useFileSystem() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Проверяем, доступен ли electronAPI
  const isElectronAPIavailable = () => {
    return typeof window !== 'undefined' && window.electronAPI !== undefined;
  };

  const listDirectory = async (path: string) => {
    if (!isElectronAPIavailable()) {
      setError('Electron API не доступен');
      return [];
    }

    setIsLoading(true);
    setError(null);
    try {
      const files = await window.electronAPI.listDirectory(path);
      return files;
    } catch (err) {
      setError('Ошибка при получении списка файлов');
      console.error(err);
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  const readFile = async (path: string): Promise<string | null> => {
    if (!isElectronAPIavailable()) {
      setError('Electron API не доступен');
      return null;
    }

    setIsLoading(true);
    setError(null);
    try {
      const result = await window.electronAPI.readFile(path);
      if (result.success && result.content !== undefined) {
        return result.content;
      } else {
        setError(result.error || 'Ошибка при чтении файла');
        return null;
      }
    } catch (err) {
      setError('Ошибка при чтении файла');
      console.error(err);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const readImage = async (imagePath: string): Promise<string | null> => {
    if (!isElectronAPIavailable()) {
      setError('Electron API не доступен');
      return null;
    }

    setIsLoading(true);
    setError(null);
    try {
      const result = await window.electronAPI.readImage(imagePath);
      if (result.success && result.data !== undefined) {
        return result.data;
      } else {
        setError(result.error || 'Ошибка при чтении изображения');
        return null;
      }
    } catch (err) {
      setError('Ошибка при чтении изображения');
      console.error(err);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const getFileType = async (filePath: string): Promise<string> => {
    if (!isElectronAPIavailable()) {
      return 'unknown';
    }

    try {
      const result = await window.electronAPI.getFileType(filePath);
      if (result.success && result.fileType !== undefined) {
        return result.fileType;
      }
      return 'unknown';
    } catch (err) {
      console.error('Ошибка определения типа файла:', err);
      return 'unknown';
    }
  };

  const getDataPath = async (): Promise<string | null> => {
    if (!isElectronAPIavailable()) {
      console.error('Electron API не доступен');
      return null;
    }

    try {
      return await window.electronAPI.getDataPath();
    } catch (err) {
      console.error('Ошибка при получении пути к данным:', err);
      return null;
    }
  };

  const exportData = async (): Promise<{ success: boolean; filePath?: string; error?: string }> => {
    if (!isElectronAPIavailable()) {
      setError('Electron API не доступен');
      return { success: false, error: 'Electron API not available' };
    }

    setIsLoading(true);
    setError(null);
    try {
      const result = await window.electronAPI.exportData();
      if (!result.success) {
        setError(result.error || 'Ошибка при экспорте');
      }
      return result;
    } catch (err) {
      setError('Ошибка при экспорте данных');
      console.error(err);
      return { success: false, error: 'Unknown error' };
    } finally {
      setIsLoading(false);
    }
  };

  const importData = async (): Promise<{ success: boolean; error?: string }> => {
    if (!isElectronAPIavailable()) {
      setError('Electron API не доступен');
      return { success: false, error: 'Electron API not available' };
    }

    setIsLoading(true);
    setError(null);
    try {
      const result = await window.electronAPI.importData();
      if (!result.success) {
        setError(result.error || 'Ошибка при импорте');
      }
      return result;
    } catch (err) {
      setError('Ошибка при импорте данных');
      console.error(err);
      return { success: false, error: 'Unknown error' };
    } finally {
      setIsLoading(false);
    }
  };

  const parseStudents = (content: string, course: number) => {
    const students = [];
    const lines = content.split('\n');
    let currentGroup = '';
    
    for (const line of lines) {
      const trimmed = line.trim();
      
      if (trimmed.startsWith('#') || trimmed === '') {
        continue;
      }
      
      if (trimmed.includes('|')) {
        const parts = trimmed.split('|').map(part => part.trim());
        if (parts.length >= 2) {
          students.push({
            id: `student_${Date.now()}_${Math.random()}`,
            fullName: parts[0],
            group: currentGroup || parts[1],
            course: course
          });
        }
      } else if (trimmed.length > 0) {
        currentGroup = trimmed;
      }
    }
    
    return students;
  };

  return {
    listDirectory,
    readFile,
    readImage,
    getFileType,
    getDataPath,
    exportData,
    importData,
    parseStudents,
    isLoading,
    error,
    setError
  };
}