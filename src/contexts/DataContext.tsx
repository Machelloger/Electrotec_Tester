import React, { createContext, useContext, ReactNode } from 'react';
import { useFileSystem } from '../hooks/useFileSystem';
import { Student, Question } from '../types/filesystem';

interface DataContextType {
  // Файловые операции
  listDirectory: (path: string) => Promise<any[]>;
  readFile: (path: string) => Promise<string | null>;
  readImage: (path: string) => Promise<string | null>;
  exportData: () => Promise<{ success: boolean; filePath?: string; error?: string }>;
  importData: () => Promise<{ success: boolean; error?: string }>;
  
  // Студенты
  getStudents: (course?: number) => Promise<Student[]>;
  
  // Вопросы
  getQuestions: (course: number, lab: string, bank: string) => Promise<Question[]>;
  
  // Состояние
  isLoading: boolean;
  error: string | null;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within DataProvider');
  }
  return context;
};

interface DataProviderProps {
  children: ReactNode;
}

export const DataProvider: React.FC<DataProviderProps> = ({ children }) => {
  const fileSystem = useFileSystem();

  // Функция для получения студентов
  const getStudents = async (course?: number): Promise<Student[]> => {
    try {
      // Читаем файлы студентов
      const students2 = await fileSystem.readFile('Students/2.txt');
      const students3 = await fileSystem.readFile('Students/3.txt');
      
      const allStudents: Student[] = [];
      
      if (students2) {
        const parsed = fileSystem.parseStudents(students2, 2);
        allStudents.push(...parsed);
      }
      
      if (students3) {
        const parsed = fileSystem.parseStudents(students3, 3);
        allStudents.push(...parsed);
      }
      
      // Фильтруем по курсу если нужно
      return course 
        ? allStudents.filter(s => s.course === course)
        : allStudents;
    } catch (err) {
      console.error('Error getting students:', err);
      return [];
    }
  };

  // Функция для получения вопросов
  const getQuestions = async (course: number, lab: string, bank: string): Promise<Question[]> => {
    try {
      const questionsPath = `${course}kurs/${lab}/${bank}`;
      const files = await fileSystem.listDirectory(questionsPath);
      
      const questions: Question[] = [];
      
      for (const file of files) {
        if (!file.isDirectory && file.extension === 'txt') {
          const content = await fileSystem.readFile(file.path);
          if (content) {
            try {
              const question = parseQuestionContent(content, file.name, bank);
              questions.push(question);
            } catch (e) {
              console.warn(`Error parsing question ${file.name}:`, e);
            }
          }
        }
      }
      
      return questions;
    } catch (err) {
      console.error('Error getting questions:', err);
      return [];
    }
  };

  // Парсинг содержимого вопроса
  const parseQuestionContent = (content: string, fileName: string, bankName: string): Question => {
    const lines = content.split('\n').filter(line => line.trim());
    
    const question: Question = {
      id: fileName.replace('.txt', ''),
      text: '',
      options: [],
      correctAnswer: 0,
      points: 1,
      bankName: bankName,
      imagePath: ''
    };
    
    for (const line of lines) {
      const trimmed = line.trim();
      
      if (trimmed.startsWith('Текст вопроса:')) {
        question.text = trimmed.replace('Текст вопроса:', '').trim();
      } 
      else if (trimmed.startsWith('Вариант 1:')) {
        question.options[0] = trimmed.replace('Вариант 1:', '').trim();
      }
      else if (trimmed.startsWith('Вариант 2:')) {
        question.options[1] = trimmed.replace('Вариант 2:', '').trim();
      }
      else if (trimmed.startsWith('Вариант 3:')) {
        question.options[2] = trimmed.replace('Вариант 3:', '').trim();
      }
      else if (trimmed.startsWith('Вариант 4:')) {
        question.options[3] = trimmed.replace('Вариант 4:', '').trim();
      }
      else if (trimmed.startsWith('Правильный ответ:')) {
        const answer = parseInt(trimmed.replace('Правильный ответ:', '').trim());
        question.correctAnswer = isNaN(answer) ? 0 : answer - 1; // -1 потому что в файле с 1, а в массиве с 0
      }
      else if (trimmed.startsWith('Баллы:')) {
        const points = parseInt(trimmed.replace('Баллы:', '').trim());
        question.points = isNaN(points) ? 1 : points;
      }
      else if (trimmed.startsWith('Изображение:')) {
        question.imagePath = trimmed.replace('Изображение:', '').trim();
      }
    }
    
    // Заполняем пустые варианты
    for (let i = 0; i < 4; i++) {
      if (!question.options[i]) {
        question.options[i] = '';
      }
    }
    
    return question;
  };

  const value: DataContextType = {
    // Файловые операции
    listDirectory: fileSystem.listDirectory,
    readFile: fileSystem.readFile,
    readImage: fileSystem.readImage,
    exportData: fileSystem.exportData,
    importData: fileSystem.importData,
    
    // Студенты
    getStudents,
    
    // Вопросы
    getQuestions,
    
    // Состояние
    isLoading: fileSystem.isLoading,
    error: fileSystem.error
  };

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
};