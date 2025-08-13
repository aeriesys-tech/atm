import logo from "../assets/logo.png";

export default function LoginPage() {

	const handleLogin = () => {
		sessionStorage.setItem("auth_token", "dummy-token");
		window.location.href = "/";
	};

	return (
		<div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 px-4">
			<div className="max-w-md w-full space-y-6 text-center">
				<img src={logo} alt="Logo" className="mx-auto h-30 w-auto" />
				<h1 className="text-3xl font-bold text-gray-800">No Direct Login</h1>
				<p className="text-gray-600 text-lg">
					You do not need to log in to use this system.
				</p>
				<p className="text-gray-500">
					This system works automatically through the{" "}
					<span className="font-medium text-gray-700">ATM application</span>.
				</p>
				<p className="text-gray-400 text-sm">
					If you reached this page by mistake, please return to the main application.
				</p>
				<button
					onClick={handleLogin}
					className="bg-blue-600 text-white px-4 py-2 rounded cursor-pointer hover:bg-blue-700 transition-colors duration-200 mt-4"
				>
					Login
				</button>
			</div>
		</div>
	);
}
