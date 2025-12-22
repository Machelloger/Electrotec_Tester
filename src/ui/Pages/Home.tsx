import '../App.css'

type ParentProps = {
  changePage: (pageName: string) => void
}

const Home = (props:ParentProps ) => {

  return (
    <>
      <button onClick={() => {props.changePage('login')}}>
        go to login page
      </button>
      <p>Home page</p>
    </>
  )
}

export default Home
