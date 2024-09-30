import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './ViewSchedule.css'; // Make sure to create this CSS file

const token = localStorage.getItem('token'); // Retrieve the Bearer token from localStorage

const ViewSchedule = () => {
  const [schedules, setSchedules] = useState([]);

  useEffect(() => {
    const fetchSchedules = async () => {
      try {
        const response = await axios.get('http://172.16.44.65:8000/api/schedule/?page=1', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        if (response.status === 200) {
          setSchedules(response.data.data); // Adjust according to your response structure
        } else {
          toast.error('Failed to fetch schedules');
        }
      } catch (error) {
        toast.error('Error fetching schedules');
        console.error('Error fetching schedules:', error);
      }
    };

    fetchSchedules();
  }, []);

  return (
    <div className="container">
      <h2>Scheduled Emails</h2>
      {schedules.length > 0 ? (
        <table className="schedule-table">
          <thead>
            <tr>
              <th>File Path</th>
              <th>Date</th>
              <th>Time</th>
              <th>From Email</th>
              <th>To Email</th>
            </tr>
          </thead>
          <tbody>
            {schedules.map((schedule, index) => (
              <tr key={index}>
                <td>{schedule.filepath.document}</td>
                <td>{schedule.date}</td>
                <td>{schedule.time}</td>
                <td>{schedule.from_email}</td>
                <td>{schedule.to_email}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p className="no-schedules">No schedules found</p>
      )}
      <ToastContainer />
    </div>
  );
};

export default ViewSchedule;
