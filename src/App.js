import React from 'react';
import './App.css';

// Context
import { GameProvider } from './contexts/GameContext';

// Components
import MainRouter from './components/MainRouter';
import VersionDisplay from './components/ui/VersionDisplay';
import StatusOverlay from './components/ui/StatusOverlay';

// Constants
import { APP_VERSION } from './constants';

/**
 * Main application component with routing and status management
 */
const AppContent = () => {
  return (
    <div className="App">
      {/* Version display in top corner */}
      <VersionDisplay version={APP_VERSION} />
      
      {/* Main application content */}
      <MainRouter />

      {/* Global status messages overlay */}
      <StatusOverlay />
    </div>
  );
};

/**
 * Root application component with context provider
 */
const App = () => {
  return (
    <GameProvider>
      <AppContent />
    </GameProvider>
  );
};

export default App;
