import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";

export default function ProtectedLayout() {
	return (
		<div className="min-h-screen bg-gray-100">
			<Navbar />
			<div className="px-8 py-4">
				<Outlet />
			</div>
		</div>
	);
}
