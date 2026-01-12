import React, { useState, useEffect } from 'react';
import { useTestGenerator } from '../hooks/useTestGenerator';
import { TestQuestion, Student, LabInfo, TestResult } from '../types/testing';
import './TestComponent.css';

interface TestComponentProps {
  student: Student;
  lab: LabInfo;
  onTestComplete: (result: TestResult) => void;
  onBack: () => void;
}

const TestComponent: React.FC<TestComponentProps> = ({
  student,
  lab,
  onTestComplete,
  onBack
}) => {
  const [results, setResults] = useState<TestResult[]>([]);
  const [loading, setLoading] = useState(false);
  const { generateTest, isLoading, error } = useTestGenerator();
  const [questions, setQuestions] = useState<TestQuestion[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [isFinished, setIsFinished] = useState(false);
  const [score, setScore] = useState(0);
  const [imageError, setImageError] = useState<string | null>(null);

  const loadResults = async () => {
    setLoading(true);
    try {
      const data = await window.electronAPI.getTestResults();
      const resultsArray = Array.isArray(data) ? data : [];
      setResults(resultsArray);
    } catch (error) {
      console.error('Error loading results:', error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const saveExampleResult = async (data: {
    percentage: number;
    fullName: string;
    group: string;
    course: number;
    testName: string;
    score: number;
    maxScore: number;
  }) => {
    const success = await window.electronAPI.saveTestResult(data);
    if (success) {
      alert('Пример сохранен!');
      loadResults();
    }
  };

  useEffect(() => {
    startTest();
  }, []);

  const startTest = async () => {
    const testQuestions = await generateTest(lab.course, lab.labName, lab.banks);
    setQuestions(testQuestions);
    setAnswers(new Array(testQuestions.length).fill(-1));
  };

  const handleAnswerSelect = (answerIndex: number) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = answerIndex;
    setAnswers(newAnswers);
  };

  const nextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setImageError(null);
    }
  };

  const prevQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
      setImageError(null);
    }
  };

  const handleImageError = (imagePath: string) => {
    console.error('Ошибка загрузки изображения:', imagePath);
    setImageError(`Изображение не найдено: ${imagePath.split('/').pop()}`);
  };

  const handleImageLoad = () => {
    setImageError(null);
  };

  const finishTest = async () => {
    let correctAnswers = 0;
    const answerDetails = questions.map((question, index) => {
      const selectedAnswer = answers[index];
      const isCorrect = selectedAnswer === question.correctAnswer;
      
      if (isCorrect) correctAnswers++;
      
      return {
        questionId: question.id,
        selectedAnswer,
        isCorrect
      };
    });
    
    const finalScore = correctAnswers;
    const maxScore = questions.length;
    
    setScore(finalScore);
    
    const result: TestResult = {
      studentId: student.id,
      studentName: student.fullName,
      group: student.group,
      course: student.course,
      lab: lab.labName,
      score: finalScore,
      maxScore,
      answers: answerDetails,
      completedAt: new Date().toISOString()
    };
    
    setIsFinished(true);
    onTestComplete(result);

    const resultsData = {
      percentage: finalScore / maxScore * 100,
      fullName: student.fullName,
      group: student.group,
      course: student.course,
      testName: lab.labName,
      score: finalScore,
      maxScore: maxScore
    };

    saveExampleResult(resultsData);
  };

  const currentQuestionData = questions[currentQuestion];

  if (isLoading) {
    return (
      <div className="test-page-container">
        <div className="test-loading">
          <div className="spinner"></div>
          <p>Подготовка теста...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="test-page-container">
        <div className="test-error">
          <h3>Ошибка</h3>
          <p>{error}</p>
          <button onClick={onBack}>Вернуться назад</button>
        </div>
      </div>
    );
  }

  if (isFinished) {
    return (
      <div className="test-page-container">
        <div className="test-results">
          <div className="results-content">
            <h2>Тест завершен!</h2>
            
            <div className="score-card">
              <div className="score-header">
                <h3>Результаты теста</h3>
                <div className="score-value">
                  {score} из {questions.length}
                </div>
              </div>
              
              <div className="student-info">
                <p><strong>Студент:</strong> {student.fullName}</p>
                <p><strong>Группа:</strong> {student.group}</p>
                <p><strong>Курс:</strong> {student.course}</p>
                <p><strong>Лабораторная:</strong> {lab.labName}</p>
              </div>
              
              <div className="answers-review">
                <h4>Правильные/неправильные ответы:</h4>
                {questions.map((question, index) => {
                  const selectedAnswer = answers[index];
                  const isCorrect = selectedAnswer === question.correctAnswer;
                  
                  return (
                    <div 
                      key={question.id} 
                      className={`answer-item ${isCorrect ? 'correct' : 'incorrect'}`}
                    >
                      <span className="question-number">Вопрос {index + 1}:</span>
                      <span className="answer-status">
                        {isCorrect ? '✓' : '✗'}
                      </span>
                    </div>
                  );
                })}
              </div>
              
              <button onClick={onBack} className="back-btn">
                Вернуться
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!currentQuestionData) {
    return (
      <div className="test-page-container">
        <div className="test-error">
          <p>Нет доступных вопросов для теста</p>
          <button onClick={onBack}>Вернуться назад</button>
        </div>
      </div>
    );
  }

  return (
    <div className="test-page-container">
      <div className="test-container">
        {/* Фиксированный заголовок */}
        <div className="test-header">
          <button onClick={onBack} className="back-btn">
            ← Назад
          </button>
          
          <div className="test-info">
            <h3>Тестирование: {lab.labName}</h3>
            <div className="progress">
              Вопрос {currentQuestion + 1} из {questions.length}
            </div>
          </div>
          
          <div className="student-info-short">
            {student.fullName} | {student.group}
          </div>
        </div>

        {/* Прокручиваемое содержимое */}
        <div className="test-content">
          <div className="question-card">
            <div className="question-header">
              <span className="question-number">Вопрос {currentQuestion + 1}</span>
              <span className="question-bank">Банк: {currentQuestionData.bankName}</span>
            </div>

            {currentQuestionData.imagePath && (
              <div className="question-image-container">
                {imageError ? (
                  <div className="image-error">{imageError}</div>
                ) : (
                  <img 
                    src={currentQuestionData.imagePath}
                    alt="Иллюстрация к вопросу"
                    className="question-image"
                    onError={() => handleImageError(currentQuestionData.imagePath!)}
                    onLoad={handleImageLoad}
                  />
                )}
              </div>
            )}
            
            <div className="question-text">
              {currentQuestionData.text}
            </div>
            
            <div className="options-list">
              {currentQuestionData.options.map((option, index) => (
                <div
                  key={index}
                  className={`option-item ${answers[currentQuestion] === index ? 'selected' : ''}`}
                  onClick={() => handleAnswerSelect(index)}
                >
                  <div className="option-number">{index + 1}</div>
                  <div className="option-text">{option}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Фиксированная навигация */}
        <div className="test-navigation">
          <button 
            onClick={prevQuestion}
            disabled={currentQuestion === 0}
            className="nav-btn prev-btn"
          >
            ← Предыдущий
          </button>
          
          <div className="question-status">
            Отвечено: {answers.filter(a => a !== -1).length} / {questions.length}
          </div>
          
          {currentQuestion < questions.length - 1 ? (
            <button 
              onClick={nextQuestion}
              className="nav-btn next-btn"
            >
              Следующий →
            </button>
          ) : (
            <button 
              onClick={finishTest}
              disabled={answers.includes(-1)}
              className="nav-btn finish-btn"
            >
              Завершить тест
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default TestComponent;