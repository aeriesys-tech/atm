import axios from 'axios';
import { getToken, clearAllStorage } from './TokenService';

const axiosWrapper = async (endpoint, options = {}, navigate, rawResponse = false) => {
	const token = getToken();
	const headers = {
		...options.headers,
	};

	if (options.data instanceof FormData) {
		headers['Content-Type'] = 'multipart/form-data';
	} else {
		headers['Content-Type'] = 'application/json';
	}

	if (token) {
		headers['Authorization'] = `Bearer ${token}`;
	}

	const url = `${import.meta.env.VITE_BASE_API_URL}/${endpoint}`;

	try {
		const response = await axios({
			url,
			method: 'POST',
			headers,
			data: options.data,
		});

		if (response.status === 401) {
			clearAllStorage();
			navigate('/');
			return;
		}

		if (rawResponse) {
			return response;
		}

		return response.data;
	} catch (error) {
		if (error.response && error.response.status === 401) {
			clearAllStorage();
			navigate('/');
		}

		const errorMessage = error.response?.data || 'Something went wrong';
		console.error('Axios error:', errorMessage);
		error.message = errorMessage;
		throw error;
	}
};

export default axiosWrapper;
