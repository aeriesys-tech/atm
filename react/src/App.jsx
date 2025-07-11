import { useEffect, useState } from "react";
import { HashRouter, Routes, Route } from 'react-router-dom';
import './App.css';
import Login from './pages/Login';
import OtpVerification from './pages/OTPverification';
import ForgotPassword from "./pages/ForgetPassword";
import AssetName from "./pages/AssetsGroup";
import Dashboard from "./pages/Dashboard.jsx";
import Loader from "./components/general/LoaderAndSpinner/Loader.jsx";
import MainLayout from "./layout/MainLayout";
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
				<Route path="/master" element={
					<MainLayout>
						<Master />
					</MainLayout>
				} />
			</Routes>
		</HashRouter>
	);
}

export default App;
