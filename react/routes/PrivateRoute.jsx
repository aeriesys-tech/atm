import React from 'react';
import { Navigate } from 'react-router-dom';

const PrivateRoute = ({ element }) => {
    const token = sessionStorage.getItem('token');
    return token ? element : <Navigate to="/"></Navigate>;
};

export default PrivateRoute;
