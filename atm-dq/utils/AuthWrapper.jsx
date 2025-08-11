import axios from "axios";
const token = sessionStorage.getItem("token");
const authWrapper = async (endpoint, data, rawResponse = false) => {
	const headers = {
		"Content-Type": "application/json",
		Authorization: `Bearer ${token}`
	};

	try {
		const response = await axios.post(
			`${import.meta.env.VITE_BASE_API_URL}/api${endpoint}`, // Fixed for Vite
			data,
			{ headers }
		);

		if (rawResponse) {
			return response;
		}
		return response.data; // Automatically parse JSON response
	} catch (error) {
		const errorMessage = error.response?.data || "Something went wrong";
		// console.error("Axios error:", errorMessage);
		error.message = errorMessage;
		throw error;
	}
};

export default authWrapper;
