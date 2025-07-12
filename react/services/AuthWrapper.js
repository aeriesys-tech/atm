import axios from 'axios';

const authWrapper = async (endpoint, data, rawResponse = false) => {
	const headers = {
		'Content-Type': 'application/json',
	};

	try {
		const response = await axios.post(
			`${import.meta.env.VITE_BASE_API_URL}/${endpoint}`,
			data,
			{ headers }
		);

		if (rawResponse) {
			return response;
		}

		return response.data;
	} catch (error) {
		console.error('Axios error:', error.response?.data || error);

		const errorData = error.response?.data;

		// 🟡 Attach `errors` and `message` clearly
		const finalError = new Error(errorData?.message || 'Something went wrong');
		if (errorData?.errors) {
			finalError.errors = errorData.errors;
		}

		throw finalError;
	}
};

export default authWrapper;
