/**
 * Simplified Main Router - Streak Tournament Only
 * Simple routing between player setup and game modes
 */

import React from 'react';
import { useGame } from '../contexts/GameContext';
import { APP_MODES } from '../constants';

// Components
import PlayerSetup from './PlayerSetup';
import GameContainer from '../containers/GameContainer';

/**
 * Main router component that handles app navigation
 */
const MainRouter = () => {
  const { currentMode } = useGame();

  const renderCurrentMode = () => {
    switch (currentMode) {
      case APP_MODES.PLAYER_SETUP:
        return <PlayerSetup />;
      
      case APP_MODES.GAME:
        return <GameContainer />;
      
      default:
        return <PlayerSetup />;
    }
  };

  return (
    <div className="main-router">
      {renderCurrentMode()}
    </div>
  );
};

export default MainRouter;
