import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom'; 
import axios from 'axios';
import Modal from 'react-modal'; 
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './Upload.css'; // Import the updated CSS file

const token = localStorage.getItem('token');
Modal.setAppElement('#root');

const Upload = () => {
  const [directoryStructure, setDirectoryStructure] = useState([]);
  const [showFiles, setShowFiles] = useState(false);
  const [from_email] = useState(localStorage.getItem('email'));
  const [to_email, setToEmail] = useState('');
  const [recipient_username, setRecipientUsername] = useState('');
  const [directory_path, setDirectoryPath] = useState('');
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [scheduleData, setScheduleData] = useState({
    date: '',
    time: '',
    subject: '',
    email_body: ''
  });

  const navigate = useNavigate();

  useEffect(() => {
    const fetchDirectoryStructure = async () => {
      try {
        const response = await axios.get('http://172.16.44.65:8000/api/dirstructure/', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (response.status === 200) {
          setDirectoryStructure(response.data.data);
        } else {
          toast.error('Failed to fetch directory structure');
        }
      } catch (error) {
        toast.error('Error fetching directory structure');
        console.error('Error fetching directory structure:', error);
      }
    };
    fetchDirectoryStructure();
  }, []);

  const handleSelectFolder = () => setShowFiles((prev) => !prev);

  const handleItemSelect = (item) => setDirectoryPath(item);

  const handleUpload = async () => {
    if (!directory_path || !to_email || !recipient_username) {
      toast.error('Please fill in all required fields');
      return;
    }
    const padded_recipient_username = recipient_username.padEnd(32, 'X');
    const data = { from_email, to_email, recipient_username: padded_recipient_username, directory_path };

    try {
      const response = await axios.post('http://172.16.44.65:8000/api/zipfile/', data, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.status === 200) {
        toast.success('Upload request sent successfully!');
        setDirectoryPath(''); setToEmail(''); setRecipientUsername('');
      } else {
        toast.error('Failed to send upload request');
      }
    } catch (error) {
      toast.error('Error sending upload request');
      console.error('Error sending upload request:', error);
    }
  };

  const handleScheduleSubmit = async () => {
    const { date, time, subject, email_body } = scheduleData;
    if (!date || !time || !subject || !email_body || !directory_path || !to_email) {
      toast.error('Please fill in all fields');
      return;
    }
    const formatted_time = time.length === 5 ? `${time}:00` : time;
    const formatted_date = new Date(date).toISOString().split('T')[0];
    const data = {
      filepath: { document: directory_path }, date: formatted_date, time: formatted_time,
      from_email, to_email, subject, email_body
    };

    try {
      const response = await axios.post('http://172.16.44.65:8000/api/schedule/', data, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.status === 201) {
        toast.success('Schedule created successfully!');
        setIsScheduleModalOpen(false);
        setScheduleData({ date: '', time: '', subject: '', email_body: '' });
      } else {
        toast.error('Failed to create schedule');
      }
    } catch (error) {
      toast.error('Error creating schedule');
      console.error('Error creating schedule:', error);
    }
  };

  const renderDirectoryTree = (items, level = 0) => (
    <ul style={{ marginLeft: `${level * 20}px` }}>
      {items.map((item) => (
        <li key={item.root}>
          <div
            className={`directory-item ${directory_path === item.root ? 'selected' : ''}`}
            onClick={() => handleItemSelect(item.root)}
          >
            {item.root}
          </div>
          {item.files && item.files.length > 0 && (
            <ul style={{ marginLeft: `${(level + 1) * 20}px` }}>
              {item.files.map((file) => (
                <li key={`${item.root}\\${file}`}>
                  <div
                    className={`file-item ${directory_path === `${item.root}\\${file}` ? 'selected' : ''}`}
                    onClick={() => handleItemSelect(`${item.root}\\${file}`)}
                  >
                    {file}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </li>
      ))}
    </ul>
  );

  return (
    <div className="upload-container">
      <h2>Upload Page</h2>
      <div className="email-display">
        <span>From: </span>
        <div className="email-text">{from_email}</div>
      </div>

      <div className="email-input-group">
        <span>To:</span>
        <input
          type="email"
          value={to_email}
          onChange={(e) => setToEmail(e.target.value)}
          className="email-input"
          placeholder="Enter recipient's email"
        />
      </div>

      <div className="email-input-group">
        <span>Recipient Username:</span>
        <input
          type="text"
          value={recipient_username}
          onChange={(e) => setRecipientUsername(e.target.value)}
          className="email-input"
          placeholder="Enter recipient's username"
        />
      </div>

      <div className="action-buttons">
        <button className="primary-btn" onClick={handleSelectFolder}>
          {showFiles ? 'Hide Files' : 'Select File or Folder'}
        </button>

        <button className="primary-btn" onClick={handleUpload}>
          Upload
        </button>

        <button className="primary-btn" onClick={() => setIsScheduleModalOpen(true)}>
          Schedule
        </button>

        <button className="primary-btn" onClick={() => navigate('/view-schedule')}>
          View Schedule
        </button>
      </div>

      {showFiles && (
        <div className="file-tree">
          <h3>Files and Folders:</h3>
          {renderDirectoryTree(directoryStructure)}
        </div>
      )}

      <Modal
        isOpen={isScheduleModalOpen}
        onRequestClose={() => setIsScheduleModalOpen(false)}
        contentLabel="Schedule Email"
        className="modal"
        overlayClassName="overlay"
      >
        <h2>Schedule Email</h2>
        <div className="email-input-group">
          <span>File Path: </span>
          <input type="text" value={directory_path} readOnly className="email-input" />
        </div>

        <div className="email-input-group">
          <span>Date: </span>
          <input
            type="date"
            value={scheduleData.date}
            onChange={(e) => setScheduleData({ ...scheduleData, date: e.target.value })}
            className="email-input"
          />
        </div>

        <div className="email-input-group">
          <span>Time: </span>
          <input
            type="time"
            value={scheduleData.time}
            onChange={(e) => setScheduleData({ ...scheduleData, time: e.target.value })}
            className="email-input"
          />
        </div>

        <div className="email-input-group">
          <span>Subject: </span>
          <input
            type="text"
            value={scheduleData.subject}
            onChange={(e) => setScheduleData({ ...scheduleData, subject: e.target.value })}
            className="email-input"
          />
        </div>

        <div className="email-input-group">
          <span>Email Body:</span>
          <textarea
            value={scheduleData.email_body}
            onChange={(e) => setScheduleData({ ...scheduleData, email_body: e.target.value })}
            className="textarea-input"
          />
        </div>

        <div className="action-buttons">
          <button className="primary-btn" onClick={handleScheduleSubmit}>
            Submit Schedule
          </button>
          <button className="secondary-btn" onClick={() => setIsScheduleModalOpen(false)}>
            Cancel
          </button>
        </div>
      </Modal>

      <ToastContainer />
    </div>
  );
};

export default Upload;
