import React, { useState } from 'react';
import LabSelector from './LabSelector';
import TestComponent from './TestComponent';
import { Student, LabInfo, TestResult } from '../types/testing';
import './StudentDashboard.css';

type ParentProps = {
  changePage: (pageName: string) => void
}

interface StudentDashboardProps {
  student: Student;
  changePage: (pageName: string) => void;
}

const StudentDashboard: React.FC<StudentDashboardProps> = ({ student, changePage }) => {
  const [selectedLab, setSelectedLab] = useState<LabInfo | null>(null);
  const [testResult, setTestResult] = useState<TestResult | null>(null);

  const handleLabSelect = (lab: LabInfo) => {
    setSelectedLab(lab);
    setTestResult(null);
  };

  const handleTestComplete = (result: TestResult) => {
    setTestResult(result);
  };

  const handleBackToLabs = () => {
    setSelectedLab(null);
  };

  if (selectedLab) {
    return (
      <TestComponent
        student={student}
        lab={selectedLab}
        onTestComplete={handleTestComplete}
        onBack={handleBackToLabs}
      />
    );
  }

  return (
    <div className="student-dashboard-container">
      <div className="student-dashboard">
        <div className="dashboard-content">
          {/* Блок информации о студенте */}
          <div className="student-info-block">
            <div className="student-info-content">
              <div className="student-name">{student.fullName}</div>
              <div className="student-details">
                <span className="student-group">{student.group}</span>
                <span className="student-course">{student.course} курс</span>
                <button onClick={() => {changePage('login')}}>Выход</button>
              </div>
            </div>
          </div>

          {/* Последний результат */}
          {testResult && (
            <div className="last-result">
              <h3>Последний результат:</h3>
              <div className="result-summary">
                <span className="result-lab">{testResult.lab}</span>
                <span className="result-score">
                  {testResult.score} из {testResult.maxScore}
                </span>
                <span className="result-date">
                  {new Date(testResult.completedAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          )}

          {/* Выбор лабораторной */}
          <div className="lab-selector-container">
            <LabSelector
              studentCourse={student.course}
              onLabSelect={handleLabSelect}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;