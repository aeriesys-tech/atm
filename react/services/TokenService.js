// src/utils/TokenService.js// adjust the path as per your project

import { store } from "../src/redux/Store";

export const getToken = () => {
	const state = store.getState();
	const token = state.user?.token;
	return token;
};

export const setToken = (token) => {
	// Optional: if you're no longer using sessionStorage, you can skip this
	sessionStorage.setItem('token', token);
};

export const clearAllStorage = () => {
	sessionStorage.clear();
	localStorage.clear();
};
