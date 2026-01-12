import './App.css'
import 'bootstrap/dist/css/bootstrap.min.css'
import Home from './pages/Home.tsx'
import Login from './pages/Login.tsx'
import AdminLogin from './pages/AdminLogin.tsx';
import { useState } from 'react';
import bgImage from './assets/mainPage.png'
import StudentsCheckPage from './pages/StudentsCheck.tsx'
import FileViewer from './components/FileViewer.tsx';
import SelectStudentPage from './pages/SelectStudentPage.tsx';
import StudentDashboard from './components/StudentDashboard.tsx';

import { useUser } from './contexts/UserContext.tsx';


function App() {

  const {setCurrentUser, currentUser} = useUser();
  
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
        return <FileViewer changePage={changePage} />;
      case 'studentsCheckPage':
        return <StudentsCheckPage changePage={changePage} />;
      case 'selectstudent':
        return <SelectStudentPage changePage={changePage} />
      case 'test':
        return <StudentDashboard student={currentUser!}  />
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
