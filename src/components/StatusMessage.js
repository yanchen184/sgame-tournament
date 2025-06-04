import React from 'react';
import './StatusMessage.css';

const StatusMessage = ({ message, type = 'info', persistent = false, onClose }) => {
  const getMessageClass = () => {
    return `status-message ${type} ${persistent ? 'persistent' : ''}`;
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
      {persistent && onClose && (
        <button 
          className="status-close-btn"
          onClick={onClose}
          title="關閉訊息"
        >
          ✕
        </button>
      )}
    </div>
  );
};

export default StatusMessage;