import React from 'react';
import './StatusMessage.css';

const StatusMessage = ({ message, type = 'info' }) => {
  const getMessageClass = () => {
    return `status-message ${type}`;
  };

  const getIcon = () => {
    switch (type) {
      case 'success': return '✅';
      case 'error': return '❌';
      case 'warning': return '⚠️';
      case 'special': return '🔥';
      default: return 'ℹ️';
    }
  };

  return (
    <div className={getMessageClass()}>
      <span className="status-icon">{getIcon()}</span>
      <div 
        className="status-text"
        dangerouslySetInnerHTML={{ __html: message }}
      />
    </div>
  );
};

export default StatusMessage;