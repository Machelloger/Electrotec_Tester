import React, { useState, useEffect } from 'react';
import { useTestGenerator } from '../hooks/useTestGenerator';
import { TestQuestion, Student, LabInfo, TestResult } from '../types/testing';

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
  const { generateTest, isLoading, error } = useTestGenerator();
  
  const [questions, setQuestions] = useState<TestQuestion[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [isFinished, setIsFinished] = useState(false);
  const [score, setScore] = useState(0);

  useEffect(() => {
    startTest();
  }, []);

  const startTest = async () => {
    const testQuestions = await generateTest(lab.course, lab.labName, lab.banks);
    setQuestions(testQuestions);
    setAnswers(new Array(testQuestions.length).fill(-1)); // -1 = не отвечено
  };

  const handleAnswerSelect = (answerIndex: number) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = answerIndex;
    setAnswers(newAnswers);
  };

  const nextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const prevQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const finishTest = async () => {
    // Подсчет результатов
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
    
    // Сохраняем результат
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
  };

  const currentQuestionData = questions[currentQuestion];

  if (isLoading) {
    return (
      <div className="test-loading">
        <div className="spinner"></div>
        <p>Подготовка теста...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="test-error">
        <h3>Ошибка</h3>
        <p>{error}</p>
        <button onClick={onBack}>Вернуться назад</button>
      </div>
    );
  }

  if (isFinished) {
    return (
      <div className="test-results">
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
            <h4>Ответы:</h4>
            {questions.map((question, index) => {
              const selectedAnswer = answers[index];
              const isCorrect = selectedAnswer === question.correctAnswer;
              
              return (
                <div 
                  key={question.id} 
                  className={`answer-item ${isCorrect ? 'correct' : 'incorrect'}`}
                >
                  <span className="question-number">Вопрос {index + 1}:</span>
                  <span className="question-text">{question.text}</span>
                  <span className="answer-status">
                    {isCorrect ? '✓' : '✗'}
                  </span>
                </div>
              );
            })}
          </div>
          
          <button onClick={onBack} className="back-btn">
            Вернуться к выбору лабораторных
          </button>
        </div>
      </div>
    );
  }

  if (!currentQuestionData) {
    return (
      <div className="test-error">
        <p>Нет доступных вопросов для теста</p>
        <button onClick={onBack}>Вернуться назад</button>
      </div>
    );
  }

  return (
    <div className="test-container">
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

      <div className="question-card">
        <div className="question-header">
          <span className="question-number">Вопрос {currentQuestion + 1}</span>
          <span className="question-bank">Банк: {currentQuestionData.bankName}</span>
        </div>
        
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

      <div className="test-navigation">
        <button 
          onClick={prevQuestion}
          disabled={currentQuestion === 0}
          className="nav-btn prev-btn"
        >
          ← Предыдущий
        </button>
        
        <div className="question-status">
          {answers.filter(a => a !== -1).length} из {questions.length} отвечено
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
  );
};

export default TestComponent;