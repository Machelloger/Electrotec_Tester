import { useState } from 'react';

interface TestResultData {
  fullName: string;
  group: string;
  course: number;
  testName: string;
  score: number;
  maxScore: number;
}

export const useTestResults = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const saveResult = async (data: TestResultData) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = {
        ...data,
        percentage: Math.round((data.score / data.maxScore) * 100),
        date: new Date().toISOString()
      };
      
      const response = await window.electronAPI.saveTestResult(result);
      
      if (response && response) {
        return true;
      } else {
        setError('Ошибка сохранения');
        return false;
      }
    } catch (err) {
      setError('Не удалось сохранить результат');
      console.error(err);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const getResults = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const results = await window.electronAPI.getTestResults();
      return results || [];
    } catch (err) {
      setError('Не удалось загрузить результаты');
      console.error(err);
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  return {
    saveResult,
    getResults,
    isLoading,
    error,
    clearError: () => setError(null)
  };
};