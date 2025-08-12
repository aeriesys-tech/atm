import { Navigate } from "react-router-dom";

const isAuthenticated = () => {
	return !!sessionStorage.getItem("auth_token");
};

export default function ProtectedRoute({ children }) {
	if (!isAuthenticated()) {
		return <Navigate to="/login" replace />;
	}
	return children;
}
