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
            file => !file.isDirectory && file.name.endsWith('.txt')
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
            bank
          );
          
          if (question) {
            questions.push(question);
          }
        } catch (err) {
          console.error(`Ошибка загрузки банка ${bank}:`, err);
        }
      }
      
      if (questions.length === 0) {
        throw new Error('Не удалось загрузить вопросы для теста');
      }
      
      return questions;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Неизвестная ошибка';
      setError(`Ошибка генерации теста: ${errorMsg}`);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Парсинг вопроса из текстового файла
  const parseQuestion = (content: string, questionId: string, bankName: string): TestQuestion | null => {
    try {
      const lines = content.split('\n');
      
      let text = '';
      const options: string[] = [];
      let correctAnswer = 0;
      
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
          correctAnswer = isNaN(answer) ? 0 : answer - 1; // -1 потому что в файле с 1, а в массиве с 0
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
        bankName
      };
    } catch (err) {
      console.error(`Ошибка парсинга вопроса ${questionId}:`, err);
      return null;
    }
  };

  return {
    generateTest,
    isLoading,
    error
  };
};