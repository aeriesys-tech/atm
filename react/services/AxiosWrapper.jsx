import axios from 'axios';
import { getToken, clearAllStorage } from './TokenService';

const axiosWrapper = async (endpoint, options = {}, navigate, rawResponse = false) => {
	const token = getToken();
	const headers = {
		...options.headers,
	};

	// Set correct Content-Type
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
			method: options.method || 'POST',       // <-- use method from options
			headers,
			data: options.data,
			responseType: options.responseType || 'json',  // <-- respect responseType
		});

		if (response.status === 401) {
			clearAllStorage();
			navigate('/');
			return;
		}

		// If responseType is blob or rawResponse is true, return full response
		if (rawResponse || options.responseType === 'blob') {
			return response;
		}

		return response.data;
	} catch (error) {
		if (error.response && error.response.status === 401) {
			clearAllStorage();
			navigate('/');
		}

		const errorMessage = error.response?.data || 'Something went wrong';
		error.message = errorMessage;
		throw error;
	}
};


export default axiosWrapper;
