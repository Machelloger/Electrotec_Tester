import '../App.css'
import Logo from '../assets/Logo.svg'

type ParentProps = {
  changePage: (pageName: string) => void
}

const AdminPage = (props: ParentProps) => {

  return (
    <div style={{padding: '15vh 0 15vh 0', width: '35vw', height: '100vh', backgroundColor: 'rgba(203,212,223,0.75)', display: 'flex', alignItems: 'center', flexDirection: 'column', justifyContent: 'space-between'}}>
      <div style={{display: 'flex', alignItems: 'center', flexDirection: 'column'}}>
        <img width='125px' src={Logo} alt='logo' />
        <p>Личный кабинет преподавателя</p>
      </div>
      <div style={{width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-around'}}>
        <div style={{height: '40vh', display: 'flex', alignItems: 'center', justifyContent: 'space-around', flexDirection: 'column'}}>
          <button onClick={() => {props.changePage('importPage')}}> Импортировать файлы </button>
          <button onClick={() => {props.changePage('exportPage')}}> Экспортировать файлы </button>
          <button onClick={() => {props.changePage('studentsCheckPage')}}> Просмотреть результаты студентов </button>
        </div>
      </div>
    </div>
  )
}

export default AdminPage;
