import React from 'react';
import './VersionDisplay.css';

/**
 * Version display component
 * Shows the current app version in the top corner
 */
const VersionDisplay = ({ version = 'v1.5.5' }) => {
  return (
    <div className="version-display">
      {version}
    </div>
  );
};

export default VersionDisplay;
