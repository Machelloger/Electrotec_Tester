import '../App.css'
import './pagesStyle.css'
import './Home.css'
import Logo from '../assets/Logo.svg'
import Exit from '../assets/exit.svg'
import { useUser } from '../contexts/UserContext'

type ParentProps = {
  changePage: (pageName: string) => void
}

const Home = (props: ParentProps) => {
  const { setCurrentUser, currentUser, logout } = useUser();

  const studentExit = () => {
    logout();
    props.changePage('login');
  }

  return (
    <div className="home-container">
      <div className="logo-section">
        <img src={Logo} alt='logo' className="logo" />
      </div>
      
      <div className="main-content">
        <button 
          className="test-button"
          onClick={() => {props.changePage('test')}}
        >
          Пройти лабораторные работы
        </button>
      </div>
      
      <div className="user-feed-block">
        <div className="user-info">
          <div className="user-name">
            {currentUser?.fullName}
          </div>
          <div className="user-group">
            {currentUser?.group}
          </div>
        </div>
        <button 
          className="logout-button"
          onClick={studentExit}
        > 
          <img src={Exit} alt='exit' className="logout-icon" />
        </button>
      </div>
    </div>
  )
}

export default Home;