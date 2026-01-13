import { features } from 'process';
import React, { useEffect, useState } from 'react';

interface TestResult {
  id: string;
  fullName: string;
  group: string;
  course: number;
  testName: string;
  score: number;
  maxScore: number;
  percentage: number;
  date: string;
}

const ResultsView = () => {
  const [results, setResults] = useState<TestResult[]>([]);
  const [loading, setLoading] = useState(false);

  const loadResults = async () => {
    setLoading(true);
    try {
      // Получаем результаты из Electron
      const data = await window.electronAPI.getTestResults();
      // Гарантируем, что это массив
      const resultsArray = Array.isArray(data) ? data : [];
      setResults(resultsArray);
    } catch (error) {
      console.error('Error loading results:', error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const clearRezults = () => {
    if (results.length > 0) {
      setResults([]);
    }
  }

  useEffect(() => {
    loadResults();
  }, []);

  const saveExampleResult = async () => {
    const success = await window.electronAPI.saveTestResult({
      percentage: 100,
      fullName: 'Иванов Иван Иванович',
      group: 'ИСП-201',
      course: 2,
      testName: 'Тест 1',
      score: 8,
      maxScore: 10
    });
    
    if (success) {
      alert('Пример сохранен!');
      loadResults();
    }
  };

  if (loading) {
    return <div>Загрузка...</div>;
  }

  return (
    <div style={{ padding: '20px' }}>
      <h2>Результаты тестов</h2>
      
      <div style={{ marginBottom: '20px' }}>
        <button onClick={loadResults} style={{ marginRight: '10px' }}>
          Обновить
        </button>
      </div>

      {/* <div style={{ marginBottom: '20px' }}>
        <button onClick={clearRezults} style={{ marginRight: '10px' }}>
          Очистить
        </button>
      </div> */}

      {results.length === 0 ? (
        <p>Нет результатов</p>
      ) : (
        <table border={1} style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: '#f2f2f2' }}>
              <th style={{ padding: '10px' }}>ФИО</th>
              <th style={{ padding: '10px' }}>Группа</th>
              <th style={{ padding: '10px' }}>Курс</th>
              <th style={{ padding: '10px' }}>Тест</th>
              <th style={{ padding: '10px' }}>Баллы</th>
              <th style={{ padding: '10px' }}>Дата</th>
            </tr>
          </thead>
          <tbody>
            {results.reverse().map((result) => (
              <tr key={result.id}>
                <td style={{ padding: '8px' }}>{result.fullName}</td>
                <td style={{ padding: '8px' }}>{result.group}</td>
                <td style={{ padding: '8px' }}>{result.course} курс</td>
                <td style={{ padding: '8px' }}>{result.testName}</td>
                <td style={{ padding: '8px' }}>
                  {result.score}/{result.maxScore} ({result.percentage || Math.round((result.score / result.maxScore) * 100)}%)
                </td>
                <td style={{ padding: '8px' }}>
                  {result.date ? new Date(result.date).toLocaleDateString() : '-'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default ResultsView