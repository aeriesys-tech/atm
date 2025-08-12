import axios from "axios";

const API_BASE = import.meta.env.VITE_BASE_API_URL;

const token = localStorage.getItem("token") | 'your-bearer-token';

const api = axios.create({
	baseURL: API_BASE,
	timeout: 10000,
});

api.interceptors.request.use(config => {
	config.headers.Authorization = `Bearer ${token}`;
	return config;
});

export default api;
