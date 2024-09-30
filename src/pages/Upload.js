import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Modal from 'react-modal'; // Import the modal library
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const token = localStorage.getItem('token'); // Retrieve the Bearer token from localStorage

Modal.setAppElement('#root'); // Set the app root for accessibility

const Upload = () => {
  const [directoryStructure, setDirectoryStructure] = useState([]);
  const [showFiles, setShowFiles] = useState(false);
  const [from_email] = useState(localStorage.getItem('email')); // Assuming this holds the user's email
  const [to_email, setToEmail] = useState(''); // For the recipient's email
  const [recipient_username, setRecipientUsername] = useState(''); // For the recipient username
  const [directory_path, setDirectoryPath] = useState(''); // Track only one selected file/folder
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false); // For modal state
  const [scheduleData, setScheduleData] = useState({
    date: '',
    time: '',
    subject: '',
    email_body: ''
  });

  useEffect(() => {
    const fetchDirectoryStructure = async () => {
      try {
        const response = await axios.get('http://172.16.44.65:8000/api/dirstructure/', {
          headers: {
            Authorization: `Bearer ${token}` // Attach the Bearer token to the request
          }
        });
        if (response.status === 200) {
          setDirectoryStructure(response.data.data); // Adjust according to your response structure
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

  const handleSelectFolder = () => {
    setShowFiles(prev => !prev);
  };

  const handleItemSelect = (item) => {
    setDirectoryPath(item); // Ensure only one item is selected at a time
  };

  const handleUpload = async () => {
    if (!directory_path) {
      toast.error('Please select a file or folder to upload');
      return;
    }
    if (!to_email || !recipient_username) {
      toast.error('Please enter both To Email and Recipient Username');
      return;
    }

    // Ensure recipient_username is 32 characters long, append 'X' to the remaining space
    let padded_recipient_username = recipient_username.padEnd(32, 'X');

    const data = {
      from_email,
      to_email,
      recipient_username: padded_recipient_username, // Send the padded username
      directory_path,
    };

    console.log("Data being sent:", data); // Debugging - Check the data format

    try {
      const response = await axios.post('http://172.16.44.65:8000/api/zipfile/', data, {
        headers: {
          Authorization: `Bearer ${token}` // Attach the Bearer token to the request
        }
      });
      if (response.status === 200) {
        toast.success('Upload request sent successfully!');
        setDirectoryPath(''); // Clear selected items after upload
        setToEmail(''); // Clear To email field
        setRecipientUsername(''); // Clear recipient username field
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

    // Create a formatted date string if needed
    const formatted_date = new Date(date).toISOString().split('T')[0]; // YYYY-MM-DD format
  
    const data = {
      filepath: { document: directory_path },
      date: formatted_date, // Use formatted date here
      time: formatted_time,  // Use formatted time here
      from_email,
      to_email,
      subject,
      email_body,
    };
    console.log(data);
    try {
      const response = await axios.post('http://172.16.44.65:8000/api/schedule/', data, {
        headers: {
          Authorization: `Bearer ${token}` // Attach the Bearer token to the request
        }
      });

      if (response.status === 201) {
        toast.success('Schedule created successfully!');
        setIsScheduleModalOpen(false); // Close modal on success
        setScheduleData({ date: '', time: '', subject: '', email_body: '' }); // Clear form
      } else {
        toast.error('Failed to create schedule');
      }
    } catch (error) {
      toast.error('Error creating schedule');
      console.error('Error creating schedule:', error);
    }
  };

  const renderDirectoryTree = (items, level = 0) => {
    return (
      <ul style={{ marginLeft: `${level * 20}px` }}>
        {items.map((item) => (
          <li key={item.root}>
            <div
              style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}
              onClick={() => handleItemSelect(item.root)}
            >
              {directory_path === item.root ? (
                <strong style={{ color: 'green' }}>{item.root}</strong>
              ) : (
                <span>{item.root}</span>
              )}
            </div>

            {item.files && item.files.length > 0 && (
              <ul style={{ marginLeft: `${(level + 1) * 20}px` }}>
                {item.files.map((file) => (
                  <li key={`${item.root}\\${file}`}>
                    <div
                      style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                      onClick={() => handleItemSelect(`${item.root}\\${file}`)}
                    >
                      {directory_path === `${item.root}\\${file}` ? (
                        <strong style={{ color: 'green' }}>{file}</strong>
                      ) : (
                        <span>{file}</span>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </li>
        ))}
      </ul>
    );
  };

  return (
    <div>
      <h2>Upload Page</h2>
      <label>
        From Email:
        <input type="email" value={from_email} readOnly />
      </label>
      <br />
      <label>
        To Email:
        <input
          type="email"
          value={to_email}
          onChange={(e) => setToEmail(e.target.value)}
          placeholder="Enter recipient's email"
        />
      </label>
      <br />
      <label>
        Recipient Username:
        <input
          type="text"
          value={recipient_username}
          onChange={(e) => setRecipientUsername(e.target.value)}
          placeholder="Enter recipient's username"
        />
      </label>
      <br />

      <button onClick={handleSelectFolder}>
        {showFiles ? 'Hide Files' : 'Select File or Folder'}
      </button>

      {showFiles && (
        <div>
          <h3>Files and Folders:</h3>
          {renderDirectoryTree(directoryStructure)}
        </div>
      )}

      <button onClick={handleUpload}>Upload</button>

      <button onClick={() => setIsScheduleModalOpen(true)}>Schedule</button>

      {/* Schedule Modal */}
      <Modal
        isOpen={isScheduleModalOpen}
        onRequestClose={() => setIsScheduleModalOpen(false)}
        contentLabel="Schedule Email"
        className="modal"
        overlayClassName="overlay"
      >
        <h2>Schedule Email</h2>
        <label>
          File Path: <input type="text" value={directory_path} readOnly />
        </label>
        <br />
        <label>
          Date: 
          <input 
            type="date" 
            value={scheduleData.date} 
            onChange={(e) => setScheduleData({ ...scheduleData, date: e.target.value })} 
          />        
        </label>
        <br />
        <label>
          Time: 
            <input 
              type="time" 
              value={scheduleData.time} 
              onChange={(e) => setScheduleData({ ...scheduleData, time: e.target.value + ':00' })} 
            />        
        </label>
        <br />
        <label>
          Subject: <input type="text" value={scheduleData.subject} onChange={(e) => setScheduleData({ ...scheduleData, subject: e.target.value })} />
        </label>
        <br />
        <label>
          Email Body:
          <textarea value={scheduleData.email_body} onChange={(e) => setScheduleData({ ...scheduleData, email_body: e.target.value })} />
        </label>
        <br />
        <button onClick={handleScheduleSubmit}>Submit Schedule</button>
        <button onClick={() => setIsScheduleModalOpen(false)}>Cancel</button>
      </Modal>

      {/* Toast Notification Container */}
      <ToastContainer />
    </div>
  );
};

export default Upload;
