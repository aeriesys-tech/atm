import { HashRouter, Routes, Route } from "react-router-dom";

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import ProtectedRoute from "./components/ProtectedRoute";
import ProtectedLayout from "./components/ProtectedLayout";
import LoginPage from "./pages/LoginPage";
import TimeSeriesPage from "./pages/TimeSeriesPage";
import StaticDataPage from "./pages/StaticDataPage";
import DataSourcePage from "./pages/DataSourcePage";

function App() {
	return (
		<HashRouter>
			<Routes>
				{/* Public Routes */}
				<Route path="/login" element={<LoginPage />} />

				{/* Private Routes with Layout */}
				<Route
					path="/"
					element={
						<ProtectedRoute>
							<ProtectedLayout />
						</ProtectedRoute>
					}
				>
					<Route index element={<TimeSeriesPage />} />
					<Route path="dq-time-series" element={<TimeSeriesPage />} />
					<Route path="dq-static" element={<StaticDataPage />} />
					<Route path="data-source" element={<DataSourcePage />} />
				</Route>
			</Routes><ToastContainer
				position="bottom-right"
				autoClose={3000}
				hideProgressBar={false}
				newestOnTop
				closeOnClick
				pauseOnFocusLoss
				draggable
				pauseOnHover
				theme="colored"
			/>
		</HashRouter>
	);
}

export default App;
