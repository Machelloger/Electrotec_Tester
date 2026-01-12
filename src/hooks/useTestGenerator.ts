import { useState, useCallback } from 'react';
import { TestQuestion, LabInfo } from '../types/testing';

export const useTestGenerator = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');

  // Генерация теста из банков вопросов
  const generateTest = useCallback(async (
    course: number,
    labName: string,
    banks: string[]
  ): Promise<TestQuestion[]> => {
    setIsLoading(true);
    setError('');
    
    try {
      const questions: TestQuestion[] = [];
      
      // Для каждого банка берем случайный вопрос
      for (const bank of banks) {
        try {
          // Получаем список вопросов из банка
          const bankPath = `${course}kurs/${labName}/${bank}`;
          const files = await window.electronAPI.listDirectory(bankPath);
          
          // Фильтруем только txt файлы
          const questionFiles = files.filter(
            (file: any) => !file.isDirectory && file.name.endsWith('.txt')
          );
          
          if (questionFiles.length === 0) {
            console.warn(`Банк ${bank} пуст`);
            continue;
          }
          
          // Выбираем случайный вопрос
          const randomIndex = Math.floor(Math.random() * questionFiles.length);
          const questionFile = questionFiles[randomIndex];
          
          // Читаем вопрос
          const result = await window.electronAPI.readFile(questionFile.path);
          
          if (!result.success || !result.content) {
            console.warn(`Не удалось прочитать вопрос: ${questionFile.name}`);
            continue;
          }
          
          // Парсим вопрос
          const question = parseQuestion(
            result.content,
            questionFile.name.replace('.txt', ''),
            bank,
            course,
            labName
          );
          
          if (question) {
            // ЕСЛИ ЕСТЬ ИЗОБРАЖЕНИЕ - ЗАГРУЖАЕМ ЕГО КАК BASE64
            if (question.imagePath && window.electronAPI.readImage) {
              try {
                console.log(`Загрузка изображения для вопроса ${question.id}:`, question.imagePath);
                
                const imageResult = await window.electronAPI.readImage(question.imagePath);
                
                if (imageResult.success && imageResult.dataUrl && typeof imageResult.dataUrl === 'string') {
                  // TypeScript теперь знает что dataUrl это string
                  question.imagePath = imageResult.dataUrl;
                  console.log(`Изображение успешно загружено для вопроса ${question.id}`);
                } else {
                  console.warn(`Не удалось загрузить изображение для вопроса ${question.id}:`, imageResult.error);
                  question.imagePath = undefined;
                }
              } catch (imgErr) {
                console.error(`Ошибка загрузки изображения для вопроса ${question.id}:`, imgErr);
                question.imagePath = undefined;
              }
            } else if (question.imagePath && !window.electronAPI.readImage) {
              console.warn('Функция readImage не доступна в electronAPI');
              question.imagePath = undefined;
            }
            
            questions.push(question);
          }
        } catch (err) {
          console.error(`Ошибка загрузки банка ${bank}:`, err);
        }
      }
      
      if (questions.length === 0) {
        throw new Error('Не удалось загрузить вопросы для теста');
      }
      
      console.log('Сгенерировано вопросов:', questions.length);
      return questions;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Неизвестная ошибка';
      setError(`Ошибка генерации теста: ${errorMsg}`);
      console.error('Ошибка генерации теста:', err);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Парсинг вопроса из текстового файла (без изменений)
  const parseQuestion = (
    content: string, 
    questionId: string, 
    bankName: string,
    course: number,
    labName: string
  ): TestQuestion | null => {
    try {
      const lines = content.split('\n');
      
      let text = '';
      const options: string[] = [];
      let correctAnswer = 0;
      let imagePath = '';
      
      for (const line of lines) {
        const trimmed = line.trim();
        
        if (trimmed.startsWith('Текст вопроса:')) {
          text = trimmed.replace('Текст вопроса:', '').trim();
        } 
        else if (trimmed.startsWith('Вариант 1:')) {
          options[0] = trimmed.replace('Вариант 1:', '').trim();
        }
        else if (trimmed.startsWith('Вариант 2:')) {
          options[1] = trimmed.replace('Вариант 2:', '').trim();
        }
        else if (trimmed.startsWith('Вариант 3:')) {
          options[2] = trimmed.replace('Вариант 3:', '').trim();
        }
        else if (trimmed.startsWith('Вариант 4:')) {
          options[3] = trimmed.replace('Вариант 4:', '').trim();
        }
        else if (trimmed.startsWith('Правильный ответ:')) {
          const answer = parseInt(trimmed.replace('Правильный ответ:', '').trim());
          correctAnswer = isNaN(answer) ? 0 : answer - 1;
        }
        else if (trimmed.startsWith('Изображение:')) {
          // Просто берем путь как есть
          imagePath = trimmed.replace('Изображение:', '').trim();
          console.log(`Путь к изображению: ${imagePath}`);
        }
      }
      
      if (!text || options.length < 2) {
        console.warn(`Некорректный формат вопроса: ${questionId}`);
        return null;
      }
      
      return {
        id: questionId,
        text,
        options,
        correctAnswer,
        imagePath: imagePath || undefined,
        bankName
      };
    } catch (err) {
      console.error(`Ошибка парсинга вопроса ${questionId}:`, err);
      return null;
    }
  };

  // Сохранение результатов теста - проверяем наличие writeFile
  const saveTestResult = useCallback(async (result: {
    studentId: string;
    studentName: string;
    group: string;
    course: number;
    lab: string;
    score: number;
    maxScore: number;
    answers: Array<{
      questionId: string;
      selectedAnswer: number;
      isCorrect: boolean;
    }>;
  }): Promise<boolean> => {
    try {
      const testResult = {
        ...result,
        completedAt: new Date().toISOString()
      };
      
      const resultsPath = `results/${result.course}kurs/${result.lab}`;
      const fileName = `${result.studentId}_${Date.now()}.json`;
      const filePath = `${resultsPath}/${fileName}`;
      
      // Проверяем есть ли writeFile в API
      if (window.electronAPI.writeFile) {
        const content = JSON.stringify(testResult, null, 2);
        const writeResult = await window.electronAPI.writeFile(filePath, content);
        return writeResult.success || false;
      } else {
        // Альтернатива: сохраняем в localStorage если нет writeFile
        console.log('writeFile не доступен, сохраняем в localStorage');
        const existingResults = JSON.parse(localStorage.getItem('testResults') || '[]');
        existingResults.push(testResult);
        localStorage.setItem('testResults', JSON.stringify(existingResults));
        return true;
      }
    } catch (err) {
      console.error('Ошибка сохранения результата:', err);
      
      // Fallback на localStorage
      try {
        const existingResults = JSON.parse(localStorage.getItem('testResults') || '[]');
        existingResults.push(result);
        localStorage.setItem('testResults', JSON.stringify(existingResults));
        return true;
      } catch (localErr) {
        console.error('Ошибка сохранения в localStorage:', localErr);
        return false;
      }
    }
  }, []);

  return {
    generateTest,
    saveTestResult,
    isLoading,
    error
  };
};