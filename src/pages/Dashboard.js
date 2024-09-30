// src/components/Dashboard.js
import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css'; // Optional: Add styles for dashboard

function Dashboard() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('authenticated');
    navigate('/');
  };

  return (
    <div className="dashboard-container">
      <h2>Secure File Transfer Dashboard</h2>
      <button onClick={() => navigate('/upload')}>Upload Files</button>
      <button onClick={() => navigate('/viewShedule')}>View Schedule</button>
      <button onClick={handleLogout}>Logout</button>
    </div>
  );
}

export default Dashboard;
