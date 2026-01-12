import React, { useState, useEffect } from 'react';
import { LabInfo } from '../types/testing';

interface LabSelectorProps {
  studentCourse: number;
  onLabSelect: (lab: LabInfo) => void;
}

const LabSelector: React.FC<LabSelectorProps> = ({ studentCourse, onLabSelect }) => {
  const [labs, setLabs] = useState<LabInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadLabs();
  }, [studentCourse]);

  const loadLabs = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Загружаем список лабораторных работ для курса
      const coursePath = `${studentCourse}kurs`;
      const files = await window.electronAPI.listDirectory(coursePath);
      
      const labsList: LabInfo[] = [];
      
      for (const file of files) {
        if (file.isDirectory && file.name.startsWith('lab')) {
          // Получаем банки вопросов для лабораторной
          const labPath = `${coursePath}/${file.name}`;
          const labFiles = await window.electronAPI.listDirectory(labPath);
          
          const banks = labFiles
            .filter(f => f.isDirectory && f.name.startsWith('bank'))
            .map(f => f.name);
          
          if (banks.length > 0) {
            labsList.push({
              course: studentCourse,
              labName: file.name,
              banks
            });
          }
        }
      }
      
      setLabs(labsList);
    } catch (err) {
      setError('Не удалось загрузить список лабораторных работ');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Загрузка лабораторных работ...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  if (labs.length === 0) {
    return <div>Нет доступных лабораторных работ для вашего курса</div>;
  }

  return (
    <div className="lab-selector">
      <h3>Выберите лабораторную работу:</h3>
      
      <div className="labs-grid">
        {labs.map((lab, index) => (
          <div
            key={lab.labName}
            className="lab-card"
            onClick={() => onLabSelect(lab)}
          >
            <div className="lab-header">
              <span className="lab-number">Лабораторная {index + 1}</span>
              <span className="lab-name">{lab.labName}</span>
            </div>
            
            <div className="lab-info">
              <div className="info-item">
                <span className="label">Курс:</span>
                <span className="value">{lab.course}</span>
              </div>
              
              <div className="info-item">
                <span className="label">Вопросов:</span>
                <span className="value">{lab.banks.length}</span>
              </div>
              
              <div className="info-item">
                <span className="label">Банков:</span>
                <span className="value">{lab.banks.join(', ')}</span>
              </div>
            </div>
            
            <button className="start-test-btn">
              Начать тест
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LabSelector;