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
      <div className="select-user-page loading">
        <div className="spinner"></div>
        <p>Загрузка списка студентов...</p>
      </div>
    );
  }

  return (
    <div style={{padding: '5vh 0 15vh 0', width: '35vw', height: '100vh', backgroundColor: 'rgba(203,212,223,0.75)', display: 'flex', alignItems: 'center', flexDirection: 'column', justifyContent: 'space-between'}}>
      <div style={{width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-around'}}>
        <div className="select-user-page">
      <div className="user-select-container">
        <div className="header-section">
          <h1>Выбор пользователя</h1>
          <p className="subtitle">
            Выберите себя из списка
          </p>
        </div>
          <>
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
                      <span className="group-name">🎓 {group}</span>
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
                              <span className="student-group">{student.group}</span>
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
          </>
      </div>
    </div>
    </div>
    <style>{`
    .app-container {
      min-height: 100vh;
      background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
      padding: 20px;
      display: flex;
      justify-content: center;
      align-items: center;
    }

    .content-wrapper {
      width: 100%;
      max-width: 800px;
      background: white;
      border-radius: 20px;
      box-shadow: 0 10px 40px rgba(13, 97, 144, 0.1);
      padding: 40px;
      animation: fadeIn 0.6s ease-out;
    }

    @keyframes fadeIn {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    /* Заголовок */
    .header {
      text-align: center;
      margin-bottom: 40px;
      padding-bottom: 20px;
      border-bottom: 2px solid #99B1EF;
    }

    .title {
      color: #0D6190;
      font-size: 2.5rem;
      font-weight: 700;
      margin: 0 0 10px 0;
      background: linear-gradient(135deg, #0D6190 0%, #99B1EF 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    .subtitle {
      color: #666;
      font-size: 1.1rem;
      margin: 0;
    }

    /* Поиск и фильтры */
    .filters-section {
      margin-bottom: 40px;
    }

    .search-container {
      margin-bottom: 30px;
    }

    .search-box {
      position: relative;
      max-width: 500px;
      margin: 0 auto;
    }

    .search-icon {
      position: absolute;
      left: 20px;
      top: 50%;
      transform: translateY(-50%);
      width: 20px;
      height: 20px;
      color: #99B1EF;
      z-index: 1;
    }

    .search-input {
      width: 100%;
      padding: 18px 20px 18px 55px;
      border: 2px solid #e0e0e0;
      border-radius: 15px;
      font-size: 1rem;
      transition: all 0.3s ease;
      background: white;
      color: #333;
    }

    .search-input:focus {
      outline: none;
      border-color: #0D6190;
      box-shadow: 0 0 0 3px rgba(13, 97, 144, 0.1);
    }

    .search-input::placeholder {
      color: #999;
    }

    .course-filters {
      display: flex;
      justify-content: center;
      gap: 15px;
      flex-wrap: wrap;
    }

    .course-filter {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 12px 24px;
      border: none;
      border-radius: 12px;
      background: #f8f9fa;
      color: #666;
      font-size: 1rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .course-filter:hover {
      background: #e9ecef;
      transform: translateY(-2px);
    }

    .course-filter.active {
      background: linear-gradient(135deg, #0D6190 0%, #99B1EF 100%);
      color: white;
      box-shadow: 0 4px 15px rgba(13, 97, 144, 0.2);
    }

    .filter-number {
      font-weight: 700;
      font-size: 1.2rem;
    }

    /* Список студентов */
    .students-list-section {
      max-height: 500px;
      overflow-y: auto;
      padding-right: 10px;
    }

    .students-list-section::-webkit-scrollbar {
      width: 8px;
    }

    .students-list-section::-webkit-scrollbar-track {
      background: #f1f1f1;
      border-radius: 4px;
    }

    .students-list-section::-webkit-scrollbar-thumb {
      background: #99B1EF;
      border-radius: 4px;
    }

    .students-list-section::-webkit-scrollbar-thumb:hover {
      background: #0D6190;
    }

    /* Группа студентов */
    .student-group {
      margin-bottom: 30px;
    }

    .group-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 15px 20px;
      background: linear-gradient(135deg, rgba(153, 177, 239, 0.1) 0%, rgba(13, 97, 144, 0.05) 100%);
      border-radius: 12px;
      margin-bottom: 15px;
    }

    .group-header-left {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .group-icon {
      width: 24px;
      height: 24px;
      color: #0D6190;
    }

    .group-name {
      font-size: 1.3rem;
      font-weight: 600;
      color: #0D6190;
    }

    .group-count {
      background: #EDBC36;
      color: white;
      padding: 6px 12px;
      border-radius: 20px;
      font-size: 0.9rem;
      font-weight: 600;
    }

    /* Карточка студента */
    .student-card {
      display: flex;
      align-items: center;
      padding: 20px;
      background: white;
      border: 1px solid #e0e0e0;
      border-radius: 12px;
      margin-bottom: 10px;
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .student-card:hover {
      border-color: #0D6190;
      transform: translateX(5px);
      box-shadow: 0 4px 15px rgba(13, 97, 144, 0.1);
    }

    .student-avatar {
      margin-right: 20px;
    }

    .avatar-placeholder {
      width: 50px;
      height: 50px;
      border-radius: 50%;
      background: linear-gradient(135deg, #FF0000 0%, #EDBC36 100%);
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: 1.2rem;
    }

    .student-info {
      flex: 1;
    }

    .student-name {
      font-size: 1.1rem;
      font-weight: 600;
      color: #333;
      margin-bottom: 5px;
    }

    .student-details {
      display: flex;
      gap: 20px;
      font-size: 0.9rem;
    }

    .student-group,
    .student-course {
      display: flex;
      align-items: center;
      gap: 6px;
      color: #666;
    }

    .detail-icon {
      width: 14px;
      height: 14px;
    }

    .student-course.course-2 {
      color: #0D6190;
    }

    .student-course.course-3 {
      color: #FF0000;
    }

    .select-arrow {
      width: 24px;
      height: 24px;
      color: #99B1EF;
      transition: transform 0.3s ease;
    }

    .student-card:hover .select-arrow {
      transform: translateX(5px);
      color: #0D6190;
    }

    /* Состояние "не найдено" */
    .empty-state {
      text-align: center;
      padding: 60px 20px;
    }

    .empty-icon {
      width: 80px;
      height: 80px;
      margin: 0 auto 20px;
      color: #99B1EF;
      opacity: 0.5;
    }

    .empty-title {
      color: #0D6190;
      font-size: 1.5rem;
      margin: 0 0 10px 0;
    }

    .empty-subtitle {
      color: #666;
      font-size: 1rem;
      margin: 0;
    }

    /* Адаптивность */
    @media (max-width: 768px) {
      .content-wrapper {
        padding: 20px;
        margin: 10px;
      }

      .title {
        font-size: 2rem;
      }

      .student-details {
        flex-direction: column;
        gap: 5px;
      }

      .course-filters {
        flex-direction: column;
        align-items: center;
      }

      .course-filter {
        width: 100%;
        max-width: 200px;
      }
    }

    @media (max-width: 480px) {
      .app-container {
        padding: 10px;
      }

      .title {
        font-size: 1.8rem;
      }

      .student-card {
        padding: 15px;
      }

      .avatar-placeholder {
        width: 40px;
        height: 40px;
        font-size: 1rem;
      }
    }
  `}</style>
  </div>
  );
};

export default SelectUserPage;