import React from 'react';
import { useGame } from '../../contexts/GameContext';
import StatusMessage from '../StatusMessage';

/**
 * Status overlay component
 * Manages the display of status messages with auto-dismiss functionality
 */
const StatusOverlay = () => {
  const {
    statusMessage,
    clearStatus
  } = useGame();

  // Don't render if no status message
  if (!statusMessage) {
    return null;
  }

  // Handle manual close for persistent messages
  const handleClose = () => {
    if (statusMessage.persistent) {
      clearStatus();
    }
  };

  return (
    <StatusMessage 
      message={statusMessage.message}
      type={statusMessage.type}
      persistent={statusMessage.persistent}
      onClose={statusMessage.persistent ? handleClose : undefined}
    />
  );
};

export default StatusOverlay;
