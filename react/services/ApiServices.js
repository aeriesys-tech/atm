import axios from 'axios';
import { store } from '../src/redux/Store';
const apiService = async (endpoint, data = {}, rawResponse = false, responseType = "json") => {
	try {
		const token = store.getState().user.token;
		const headers = {
			...(data instanceof FormData
				? { 'Content-Type': 'multipart/form-data' }
				: { 'Content-Type': 'application/json' }),
			...(token ? { Authorization: `Bearer ${token}` } : {})
		};
		const response = await axios.post(
			`${import.meta.env.VITE_BASE_API_URL}/${endpoint}`,
			data,
			{
				headers,
				responseType
			}
		);
		return rawResponse ? response : response.data;
	} catch (error) {
		if (error.response && error.response.status === 401) {
			return;
		}
		const errorMessage = error.response?.data || 'Something went wrong';
		console.error('Axios error:', errorMessage);
		error.message = errorMessage;
		throw error;
	}
};
export default apiService;