import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './Login.css'; // Import the CSS file

const Login = ({ onAuthSuccess }) => {
  const [credentials, setCredentials] = useState({
    email: '',
    password: '',
  });
  const navigate = useNavigate();

  const handleChange = (e) => {
    setCredentials({
      ...credentials,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post('http://172.16.44.65:8000/api/signin/', credentials);
      
      if (response.status === 200) {
        localStorage.setItem('token', response.data.session.token);
        localStorage.setItem('email', response.data.data.email);

        if (onAuthSuccess) {
          onAuthSuccess();
        }

        alert('Login successful! Redirecting...');
        setTimeout(() => {
          navigate('/dashboard');
        }, 2000);
      } else {
        alert('Failed to login. Please check your credentials.');
      }
    } catch (error) {
      alert('Error logging in. Please try again.');
      console.error('Error logging in:', error);
    }
  };

  const handleSignUpRedirect = () => {
    navigate('/signup');
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h2>Login</h2>
        <form onSubmit={handleSubmit} className="login-form">
          <div className="input-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              name="email"
              id="email"
              value={credentials.email}
              onChange={handleChange}
              required
            />
          </div>
          <div className="input-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              name="password"
              id="password"
              value={credentials.password}
              onChange={handleChange}
              required
            />
          </div>
          <button type="submit" className="login-button">Login</button>
        </form>
        <div className="signup-link">
          <p>Don't have an account? <button onClick={handleSignUpRedirect}>Sign Up</button></p>
        </div>
      </div>
    </div>
  );
};

export default Login;
