import '../App.css'
import './pagesStyle.css'
import Logo from '../assets/Logo.svg'
import Exit from '../assets/exit.svg'
import { useUser } from '../contexts/UserContext'
import { Button } from 'react-bootstrap'


type ParentProps = {
  changePage: (pageName: string) => void
}

const Home = (props: ParentProps) => {

  const { setCurrentUser, currentUser, logout } = useUser();

  const studentExit = () => {
    logout;
    props.changePage('login');
  }

  return (
    <div style={{padding: '5vh 0 15vh 0', width: '35vw', height: '100vh', backgroundColor: 'rgba(203,212,223,0.75)', display: 'flex', alignItems: 'center', flexDirection: 'column', justifyContent: 'space-between'}}>
      <div style={{display: 'flex', alignItems: 'center', flexDirection: 'column'}}>
        <img width='125px' src={Logo} alt='logo' />
      </div>
      <div style={{width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-around'}}>
        <button onClick={() => {props.changePage('test')}}>Тест лабы</button>
      </div>
      <div className='userFeedBlock'>
        <div>
          {currentUser?.fullName}
        </div>
        <div>
          {currentUser?.group}
        </div>
        <button onClick={() => {studentExit()}} style={{backgroundColor: '#CBD4DF', width: '60px', minHeight: "25px", padding: '2px'}}> 
        <img width='25px' src={Exit} alt='exit' />
        </button>
      </div>
    </div>
  )
}

export default Home;
