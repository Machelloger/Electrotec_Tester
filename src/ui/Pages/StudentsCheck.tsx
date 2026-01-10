import '../App.css'
// import bgImage from '../assets/mainPage.png'
type ParentProps = {
  changePage: (pageName: string) => void
}

const StudentsCheck = (props:ParentProps ) => {

  return (
    <div>
      <button onClick={() => {props.changePage('login')}}>
        go to login page
      </button>
      <p>Home page</p>
    </div>
  )
}

export default StudentsCheck
