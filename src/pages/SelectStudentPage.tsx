import React, { useState, useEffect } from 'react';
import { useAppData } from '../hooks/useAppData';
import { useUser } from '../contexts/UserContext';
import './SelectStudentPage.css';

type ParentProps = {
  changePage: (pageName: string) => void
}

const SelectUserPage = (props: ParentProps) => {
  const { students, isLoading } = useAppData();
  const {setCurrentUser, currentUser} = useUser();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCourse, setSelectedCourse] = useState<number | 'all'>('all');
  
  // Фильтрация студентов
  const filteredStudents = students.filter(student => {
    const matchesSearch = student.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.group.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCourse = selectedCourse === 'all' || student.course === selectedCourse;
    return matchesSearch && matchesCourse;
  });

  // Группировка студентов по группам
  const groupedStudents = filteredStudents.reduce((groups, student) => {
    if (!groups[student.group]) {
      groups[student.group] = [];
    }
    groups[student.group].push(student);
    return groups;
  }, {} as Record<string, typeof students>);

  const handleStudentSelect = (student: any) => {
    setCurrentUser(student)
    props.changePage('home');
  };

  if (isLoading) {
    return (
      <div className="select-user-page-container">
        <div className="select-user-page loading">
          <div className="spinner"></div>
          <p>Загрузка списка студентов...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="select-user-page-container">
      <div className="select-user-page">
        <div className="user-select-container">
          <div className="header-section">
            <h1>Выбор пользователя</h1>
            <p className="subtitle">
              Выберите себя из списка
            </p>
          </div>
          
          {/* Поиск и фильтры */}
          <div className="filters-section">
            <div className="search-box">
              <input
                type="text"
                placeholder="Поиск по имени или группе..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>

            <div className="course-filters">
              <button
                className={`course-filter ${selectedCourse === 'all' ? 'active' : ''}`}
                onClick={() => setSelectedCourse('all')}
              >
                Все курсы
              </button>
              <button
                className={`course-filter ${selectedCourse === 2 ? 'active' : ''}`}
                onClick={() => setSelectedCourse(2)}
              >
                2 курс
              </button>
              <button
                className={`course-filter ${selectedCourse === 3 ? 'active' : ''}`}
                onClick={() => setSelectedCourse(3)}
              >
                3 курс
              </button>
            </div>
          </div>

          {/* Список студентов */}
          <div className="students-list-section">
            {filteredStudents.length === 0 ? (
              <div className="empty-state">
                <p>Студенты не найдены</p>
                <p>Попробуйте изменить поисковый запрос или войдите вручную</p>
              </div>
            ) : (
              Object.entries(groupedStudents).map(([group, groupStudents]) => (
                <div key={group} className="student-group">
                  <h3 className="group-header">
                    <span className="group-name">{group}</span>
                    <span className="group-count">{groupStudents.length} чел.</span>
                  </h3>
                  <div className="group-students">
                    {groupStudents.map((student) => (
                      <div
                        key={student.id}
                        className="student-card"
                        onClick={() => handleStudentSelect(student)}
                      >
                        <div className="student-info">
                          <div className="student-name">{student.fullName}</div>
                          <div className="student-details">
                            <span className="student-group-label">{student.group}</span>
                            <span className={`student-course course-${student.course}`}>
                              {student.course} курс
                            </span>
                          </div>
                        </div>
                        <div className="select-arrow">→</div>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SelectUserPage;