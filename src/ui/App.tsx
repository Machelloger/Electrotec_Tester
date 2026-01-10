import './App.css'
import 'bootstrap/dist/css/bootstrap.min.css'
import Home from './Pages/Home.tsx'
import Login from './Pages/Login.tsx'
import AdminLogin from './Pages/AdminLogin.tsx';
import { useState } from 'react';
import bgImage from './assets/mainPage.png'
import AdminPage from './Pages/AdminPage.tsx';
import ExportPage from './Pages/ExportPage.tsx'
import ImportPage from './Pages/ImportPage.tsx'
import StudentsCheckPage from './Pages/StudentsCheck.tsx'


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
        return <Login changePage={changePage} />;
      case 'adminLogin':
        return <AdminLogin changePage={changePage} />;
      case 'adminPage':
        return <AdminPage changePage={changePage} />;
      case 'importPage':
        return <ImportPage changePage={changePage} />;
      case 'exportPage':
        return <ExportPage changePage={changePage} />;
      case 'studentsCheckPage':
        return <StudentsCheckPage changePage={changePage} />;
    }
  };

  return (
      <div className='app' style={{backgroundImage: `url(${bgImage})`, height: '100vh', backgroundSize: 'cover'}}>
        {
        renderPage()
        }
      </div>
  )
}

export default App
