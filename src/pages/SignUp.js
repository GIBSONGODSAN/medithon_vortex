import React, { useState } from 'react';
import axios from 'axios';
import './SignUp.css'; // Link to the external CSS file

const SignUp = () => {
    const [userData, setUserData] = useState({
        email: '',
        password: '',
        first_name: '',
        last_name: '',
        profile_image: '',
        role: 'doctor',
        is_active: true
    });

    const [message, setMessage] = useState('');

    const handleChange = (e) => {
        setUserData({
            ...userData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');

        try {
            const response = await axios.post('http://172.16.44.65:8000/api/signup/', userData);

            if (response.status === 201) {
                setMessage('Sign-up successful! Redirecting...');
                window.alert('Sign-up successful!');
            } else {
                setMessage('Failed to sign up. Please try again.');
            }
        } catch (error) {
            setMessage('Error signing up. Please try again.');
            console.error('Error signing up:', error);
        }
    };

    return (
        <div className="signup-container">
            <div className="signup-box">
                <h2>Sign Up</h2>

                <form onSubmit={handleSubmit} className="signup-form">
                    <div className="input-group">
                        <label htmlFor="first_name">First Name</label>
                        <input
                            type="text"
                            name="first_name"
                            id="first_name"
                            value={userData.first_name}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="input-group">
                        <label htmlFor="last_name">Last Name</label>
                        <input
                            type="text"
                            name="last_name"
                            id="last_name"
                            value={userData.last_name}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="input-group">
                        <label htmlFor="email">Email</label>
                        <input
                            type="email"
                            name="email"
                            id="email"
                            value={userData.email}
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
                            value={userData.password}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="input-group">
                        <label htmlFor="profile_image">Profile Image URL</label>
                        <input
                            type="url"
                            name="profile_image"
                            id="profile_image"
                            value={userData.profile_image}
                            onChange={handleChange}
                        />
                    </div>

                    <button type="submit" className="signup-button">Sign Up</button>
                </form>

                {message && <p className="message">{message}</p>}
            </div>
        </div>
    );
};

export default SignUp;
