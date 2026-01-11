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

export {};