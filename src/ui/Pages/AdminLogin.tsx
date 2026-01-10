import { useState } from 'react'
import '../App.css'
import Logo from '../assets/Logo.svg'
import { Toast } from 'react-bootstrap'

type ParentProps = {
  changePage: (pageName: string) => void
}

const AdminLogin = (props: ParentProps) => {

  const [showA, setShowA] = useState(false);
  const [showB, setShowB] = useState(false);
  const [password, setPassword] = useState('');

  return (
    <div style={{padding: '15vh 0 15vh 0', width: '35vw', height: '100vh', backgroundColor: 'rgba(203,212,223,0.75)', display: 'flex', alignItems: 'center', flexDirection: 'column', justifyContent: 'space-between'}}>
      <div style={{display: 'flex', alignItems: 'center', flexDirection: 'column'}}>
        <img width='125px' src={Logo} alt='logo' />
        <p>Вход в личный кабинет преподавателя</p>
      </div>
      <div style={{width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-around'}}>
        <div style={{height: '40vh', display: 'flex', alignItems: 'center', justifyContent: 'space-around', flexDirection: 'column'}}>
          <div>
          <input type='password' name='пароль' onChange={(e) => {setPassword(e.target.value)}} value={password}/>
          <div onClick={() => {setShowA(true)}} className='hint'>Подсказка</div>
          </div>
          <button onClick={() => {if (password === "") {props.changePage('adminPage')} else {setShowB(true)}}}>Войти</button>
        </div>
      </div>
      <Toast style={{position: 'absolute'}} show={showA} onClose={() => {setShowA(!showA)}}>
          <Toast.Header>
            <img
              src="holder.js/20x20?text=%20"
              className="rounded me-2"
              alt=""
            />
            <strong className="me-auto">Подсказка</strong>
          </Toast.Header>
          <Toast.Body>Придумаем подсказку</Toast.Body>
        </Toast>
        <Toast style={{position: 'absolute'}} show={showB} onClose={() => {setShowB(!showB)}}>
          <Toast.Header>
            <img
              src="holder.js/20x20?text=%20"
              className="rounded me-2"
              alt=""
            />
            <strong className="me-auto">Подсказка</strong>
          </Toast.Header>
          <Toast.Body>Неверный пароль</Toast.Body>
        </Toast>
    </div>
  )
}

export default AdminLogin;
