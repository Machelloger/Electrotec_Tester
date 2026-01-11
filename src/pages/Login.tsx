import '../App.css'
import './pagesStyle.css'
import Logo from '../assets/Logo.svg'
import { useAppData } from '../hooks/useAppData'
import { useEffect } from 'react'

type ParentProps = {
  changePage: (pageName: string) => void
}

const Login = (props: ParentProps) => {

  const { 
    courses,           // Все курсы с лабораторными
    students,          // Все студенты
    getQuestions,      // Получить вопросы для курса/лабы/банка
    getQuestionImage,  // Получить base64 изображения
    exportCourseData,  // Экспорт данных
    importData,        // Импорт данных
    isLoading,         // Статус загрузки
    error              // Ошибки
  } = useAppData();

  // // Пример: Загрузить студентов 2 курса
  // useEffect(() => {
  //   // students уже загружены автоматически
  //   console.log('Студенты:', students);
    
  //   const numberGroups = courses;
  //   console.log(numberGroups)
  // }, [students]);

  return (
    <div style={{padding: '15vh 0 15vh 0', width: '35vw', height: '100vh', backgroundColor: 'rgba(203,212,223,0.75)', display: 'flex', alignItems: 'center', flexDirection: 'column', justifyContent: 'space-between'}}>
      <div style={{display: 'flex', alignItems: 'center', flexDirection: 'column'}}>
        <img width='125px' src={Logo} alt='logo' />
        <p>Вход</p>
      </div>
      <div style={{width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-around'}}>
        <button onClick={() => {props.changePage('selectstudent')}} className='button'>
          Выбрать студента
        </button>
      </div>
      <button onClick={() => {props.changePage('adminLogin')}} className='button'>
        Преподаватель
      </button>
    </div>
  )
}

export default Login;
