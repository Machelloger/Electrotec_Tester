import React, { useState } from 'react';
import LabSelector from './LabSelector';
import TestComponent from './TestComponent';
import { Student, LabInfo, TestResult } from '../types/testing';

interface StudentDashboardProps {
  student: Student;
}

const StudentDashboard: React.FC<StudentDashboardProps> = ({ student }) => {
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
    <div className="student-dashboard">
      <div className="dashboard-header">
        <h2>Кабинет студента</h2>
        
        <div className="student-card">
          <div className="student-name">{student.fullName}</div>
          <div className="student-info">
            <span className="group">{student.group}</span>
            <span className="course">{student.course} курс</span>
          </div>
        </div>
      </div>

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

      <LabSelector
        studentCourse={student.course}
        onLabSelect={handleLabSelect}
      />
    </div>
  );
};

export default StudentDashboard;