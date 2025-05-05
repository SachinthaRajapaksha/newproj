import './App.css';
import LoginPage from './Components/LoginPage/LoginPage';
import Home from './Components/HomePage/Home';
import Profile from './Components/UserProfile/Profile';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

function App() {
  // Check if user is logged in
  const isLoggedIn = localStorage.getItem("users") !== undefined && localStorage.getItem("users") !== null;
  
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={isLoggedIn ? <Navigate to="/" /> : <LoginPage />} />
          <Route path="/" element={isLoggedIn ? <Home /> : <Navigate to="/login" />} />
          <Route path="/profile" element={isLoggedIn ? <Profile /> : <Navigate to="/login" />} />
          <Route path="*" element={isLoggedIn ? <Navigate to="/" /> : <Navigate to="/login" />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
