import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';

// Import the design system
import './index.css';

// --- DATA INTEGRITY CHECK ---
// This runs before React mounts to prevent white-screen crashes
// caused by corrupted localStorage data (e.g. "undefined" strings).
try {
  const user = localStorage.getItem('user');
  const token = localStorage.getItem('token');

  // Check for invalid stringified values that break JSON.parse()
  if (user === "undefined" || user === "null" || user === undefined) {
    console.warn("System: Detected corrupted user data. Cleaning storage...");
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  }

  // Optional: Check if token exists but user is missing (inconsistent state)
  if (token && !user) {
    localStorage.removeItem('token');
  }
} catch (e) {
  console.error("System: Storage error, resetting...", e);
  localStorage.clear();
}
// ---------------------------

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);