import '../App.css'
import './pagesStyle.css'
import Logo from '../assets/Logo.svg'

type ParentProps = {
  changePage: (pageName: string) => void
}

const Login = (props: ParentProps) => {

  return (
    <div style={{padding: '15vh 0 15vh 0', width: '35vw', height: '100vh', backgroundColor: 'rgba(203,212,223,0.75)', display: 'flex', alignItems: 'center', flexDirection: 'column', justifyContent: 'space-between'}}>
      <div style={{display: 'flex', alignItems: 'center', flexDirection: 'column'}}>
        <img width='125px' src={Logo} alt='logo' />
        <p>Вход</p>
      </div>
      <div style={{width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-around'}}>
        <button onClick={() => {props.changePage('home')}} className='button'>
          2 курс
        </button>
        <button className='button'>
          3 курс
        </button>
      </div>
      <button onClick={() => {props.changePage('adminLogin')}} className='button'>
        Преподаватель
      </button>
    </div>
  )
}

export default Login;
