import Dashboard from "./assets/layouts/Dashboard"
import Header from "./components/Header"


function App() {


	return (
		<>
			<Dashboard />
		</>
	)
}

function App() {
	const [isLoggedIn, setIsLoggedIn] = useState(false); // Simulated login state

	return (
		<HashRouter>
			<Routes>
				<Route path="/" element={<Login />} />
				<Route path="/otpverify" element={<OtpVerification />} />

				<Route path="/home" element={isLoggedIn ? <Home /> : <Navigate to="/" replace />} />
			</Routes>
		</HashRouter>
	);
}

export default App;
