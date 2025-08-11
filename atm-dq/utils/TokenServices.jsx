export const getToken = () => {
	return sessionStorage.getItem('token'); // Adjust if using a different storage mechanism
};

export const setToken = (token) => {
	sessionStorage.setItem('token', token); // Adjust if using a different storage mechanism
};

export const clearAllStorage = () => {
	sessionStorage.clear(); // Clear all session storage
	// Optionally, you can clear other types of storage or cookies if used
};