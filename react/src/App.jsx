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
	import React, { useState, useEffect } from "react";
	import { HashRouter, Routes, Route } from "react-router-dom";
	import Dashboard from "./pages/Dashboard.jsx";
	import MainLayout from "../src/layout/MainLayout";
	import Loader from "./components/general/LoaderAndSpinner/Loader.jsx";
	import publicRoutes from "../routes/PublicRoutes";
	import protectedRoutes from "../routes/ProtectedRoutes";
	import PrivateRoute from "../routes/PrivateRoute";
	import Master from "./pages/configurations/Master.jsx";


	function App() {
		const [loading, setLoading] = useState(true);

		useEffect(() => {
			setTimeout(() => setLoading(false), 1000);
		}, []);

		if (loading) return <Loader />;

		return (
			<HashRouter>
				<Routes>
					<Route path="/" element={<Login />} />
					<Route path="/otpverify" element={<OtpVerification />} />
					<Route path="/forgotPassword" element={<ForgotPassword />} />
					<Route path="/dashboard" element={<Dashboard />} />
					<Route path="/assets" element={<AssetName />} />

					{/* {publicRoutes.map((route, index) => (
					<Route
						key={index}
						path={route.path}
						element={route.element}
					/>
				))}

			
				{protectedRoutes.map((route, index) => (
					<Route
						key={index}
						path={route.path}
						element={
							<MainLayout>
								<PrivateRoute element={route.element} />
							</MainLayout>
						}
					/>
				))} */}

					{/* Fallback route if needed */}
					<Route path="/" element={
						<MainLayout>
							<Master />
						</MainLayout>
					} />
				</Routes>
			</HashRouter>
		);
	}

	export default App;
