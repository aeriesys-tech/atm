import { useState } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import Login from './pages/Login';
import OtpVerification from './pages/OTPverification';

function Home() {
  return <h2>Home Page</h2>;
}

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false); // Simulated login state

  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Login/>} />
        <Route path="/otpverify" element={<OtpVerification/>} />

        <Route path="/home" element={isLoggedIn ? <Home /> : <Navigate to="/" replace />} />
      </Routes>
    </HashRouter>
  );
}

export default App;
