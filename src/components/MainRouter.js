/**
 * Enhanced Main Router - With Room Browser and Visual Flow
 * Routing between room browser, player setup, game, and history modes
 */

import React from 'react';
import { useGame } from '../contexts/GameContext';
import { APP_MODES } from '../constants';

// Components
import RoomBrowser from './RoomBrowser';
import PlayerSetup from './PlayerSetup';
import GameContainer from '../containers/GameContainer';
import RoomHistory from './RoomHistory';

/**
 * Main router component that handles app navigation
 */
const MainRouter = () => {
  const { currentMode } = useGame();

  const renderCurrentMode = () => {
    switch (currentMode) {
      case APP_MODES.ROOM_BROWSER:
        return <RoomBrowser />;
      
      case APP_MODES.PLAYER_SETUP:
        return <PlayerSetup />; 
      
      case APP_MODES.GAME:
        return <GameContainer />;
        
      case APP_MODES.HISTORY:
        return <RoomHistory />;
      
      default:
        return <RoomBrowser />; // Default to room browser
    }
  };

  return (
    <div className="main-router">
      {renderCurrentMode()}
    </div>
  );
};

export default MainRouter;
