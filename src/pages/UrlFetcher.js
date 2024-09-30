// src/components/UrlFetcher.js
import React, { useState } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const UrlFetcher = () => {
  const [url, setUrl] = useState('');
  const [responseData, setResponseData] = useState(null);
  const [error, setError] = useState(null);

  const handleFetchData = async (e) => {
    e.preventDefault(); // Prevent page refresh
    try {
      const response = await axios.get(url);
      setResponseData(response.data.data);
      setError(null); // Reset error if the request succeeds
      toast.success('Data fetched successfully!', {
        position: "top-right", // Use string directly for position
      }); // Show success toast
    } catch (err) {
      setError('Error fetching data, please check the URL.');
      setResponseData(null); // Reset data on error
      toast.error('Error fetching data!', {
        position: "top-right", // Use string directly for position
      }); // Show error toast
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: 'auto' }}>
      <h2>URL Data Fetcher</h2>
      <form onSubmit={handleFetchData}>
        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="Enter URL"
          style={{ width: '80%', padding: '8px', marginBottom: '10px' }}
        />
        <button type="submit" style={{ padding: '8px' }}>
          Fetch Data
        </button>
      </form>

      <div style={{ marginTop: '20px' }}>
        {responseData ? (
          <div>
            <h3>Response Data:</h3>
            <pre style={{ whiteSpace: 'pre-wrap', wordWrap: 'break-word' }}>
              {JSON.stringify(responseData, null, 2)}
            </pre>
          </div>
        ) : error ? (
          <div style={{ color: 'red' }}>{error}</div>
        ) : (
          <p>No data to display.</p>
        )}
      </div>

      {/* Toast Container */}
      <ToastContainer />
    </div>
  );
};

export default UrlFetcher;
