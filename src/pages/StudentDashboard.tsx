import React, { useState } from 'react';
import TestRunner from '../pages/TestRunner';
import { useAppData } from '../hooks/useAppData';
import { TestConfig } from '../types/test';

interface StudentDashboardProps {
  studentId: string;
  studentName: string;
  group: string;
  course: number;
}

const StudentDashboard: React.FC<StudentDashboardProps> = ({
  studentId,
  studentName,
  group,
  course
}) => {
  const { courses } = useAppData();
  const [selectedLab, setSelectedLab] = useState<string>('');
  const [isTakingTest, setIsTakingTest] = useState(false);

  const currentCourse = courses.find(c => c.id === course);
  const labs = currentCourse?.labs || [];

  const handleStartTest = (labName: string) => {
    setSelectedLab(labName);
    setIsTakingTest(true);
  };

  const handleTestComplete = (result: any) => {
    console.log('Тест завершен:', result);
    // Можно сохранить результат в базу данных
  };

  const testConfig: TestConfig = {
    course,
    labName: selectedLab,
    studentId,
    studentName,
    group
  };

  return (
    <div className="student-dashboard">
      <h1>Кабинет студента</h1>
      <div className="student-info">
        <p><strong>ФИО:</strong> {studentName}</p>
        <p><strong>Группа:</strong> {group}</p>
        <p><strong>Курс:</strong> {course}</p>
      </div>

      {!isTakingTest ? (
        <div className="labs-section">
          <h2>Доступные лабораторные работы</h2>
          {labs.length === 0 ? (
            <p>Нет доступных лабораторных работ для вашего курса</p>
          ) : (
            <div className="labs-grid">
              {labs.map(lab => (
                <div key={lab.id} className="lab-card">
                  <h3>{lab.name}</h3>
                  <p>Банков вопросов: {lab.banks.length}</p>
                  <p>Всего вопросов: {lab.banks.reduce((sum, b) => sum + b.questionsCount, 0)}</p>
                  <button 
                    // onClick={() => handleStartTest(lab.id)}
                    onClick={() => {console.log(lab)}}
                    className="start-lab-button"
                  >
                    Начать тест
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="test-section">
          <button 
            onClick={() => setIsTakingTest(false)}
            className="back-button"
          >
            ← Вернуться к списку
          </button>
          <TestRunner 
            config={testConfig}
            onComplete={handleTestComplete}
          />
        </div>
      )}
    </div>
  );
};

export default StudentDashboard;