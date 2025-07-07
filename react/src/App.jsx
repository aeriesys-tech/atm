import { useState } from "react";
import Dashboard from "./assets/layouts/Dashboard"
import Header from "./components/Header"
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import Login from './pages/Login';
import OtpVerification from './pages/OTPverification';
import ForgotPassword from "./pages/ForgetPassword";
import AssetName from "./pages/AssetsGroup";
function App() {
	const [isLoggedIn, setIsLoggedIn] = useState(false); // Simulated login state

	return (
		<HashRouter>
			<Routes>
				<Route path="/" element={<Login />} />
				<Route path="/otpverify" element={<OtpVerification />} />
				<Route path="/forgotPassword" element={<ForgotPassword />} />
				<Route path="/dashboard" element={<Dashboard />} />
				<Route path="/assets" element={<AssetName />} />

				<Route path="/home" element={isLoggedIn ? <Home /> : <Navigate to="/" replace />} />
			</Routes>
		</HashRouter>
	);
}

export default App;
