import './App.css'
import Home from './Pages/Home.tsx'
import Login from './Pages/Login.tsx'
import { useState } from 'react';

function App() {

  const [currentPage, setCurrentPage] = useState('login');

  function changePage(pageName: string):void {
    setCurrentPage(pageName);
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <Home changePage={changePage} />;
      case 'login':
        return <Login />;
    }
  };

  return (
    <>
      <button onClick={() => {setCurrentPage('home')}}>Set page home</button>
      {
      renderPage()
      }
    </>
  )
}

export default App
