declare global {
  interface Window {
    electronAPI: {
      // Существующие функции из вашего API
      getDataPath: () => Promise<string>;
      listDirectory: (dirPath: string) => Promise<any[]>;
      readFile: (filePath: string) => Promise<{
        success: boolean;
        content?: string;
        error?: string;
      }>;

      // Результаты тестов
      saveTestResult: (result: any) => Promise<{ success: boolean; error?: string }>;
      getTestResults: (course?: number, studentId?: string) => Promise<any[]>;
      clearTestResults: () => Promise<{ success: boolean; error?: string }>;
      
      // НОВАЯ функция для изображений
      readImage: (imagePath: string) => Promise<{
        success: boolean;
        dataUrl?: string;  // ← исправляем на dataUrl
        error?: string;
      }>;
      
      // Другие функции из вашего API
      getFileType: (filePath: string) => Promise<any>;
      exportData: (data: any, filename: string) => Promise<boolean>;
      
      // Функция writeFile - добавьте если есть
      writeFile?: (filePath: string, content: string) => Promise<{
        success: boolean;
        error?: string;
      }>;
      
      // Добавьте другие функции которые у вас есть...
    };
  }
}

export {};