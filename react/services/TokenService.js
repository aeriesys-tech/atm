export const getToken = () => {
    return sessionStorage.getItem('token'); 
};

export const setToken = (token) => {
    sessionStorage.setItem('token', token); 
};

export const clearAllStorage = () => {
    sessionStorage.clear(); 
};