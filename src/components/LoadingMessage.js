import React from 'react';
import '../App.css';

/**
 * LoadingMessage component to display while loading data
 * @returns {JSX.Element} The rendered loading message
 */
const LoadingMessage = () => (
  <div className="loading-overlay">
    <div className="loading-message">Calculating nearest stations...</div>
  </div>
);

export default LoadingMessage;
