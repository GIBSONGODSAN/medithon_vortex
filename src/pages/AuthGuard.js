// src/components/AuthGuard.js
import React from 'react';
import { Navigate } from 'react-router-dom';

const AuthGuard = ({ children }) => {
  // Function to check if the user is authenticated
  const isAuthenticated = () => {
    // Check for token in localStorage or any other authentication logic
    return localStorage.getItem('token') !== null; 
  };

  return isAuthenticated() ? children : <Navigate to="/" />; // Redirect to login if not authenticated
};

export default AuthGuard;
