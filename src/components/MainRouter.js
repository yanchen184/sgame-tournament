import React from 'react';
import { useGame } from '../contexts/GameContext';
import { useRoomManager } from '../hooks/useRoomManager';

// Components
import PlayerSetup from './PlayerSetup';
import RoomBrowser from './RoomBrowser';
import RoomHistory from './RoomHistory';

// Containers
import GameView from '../containers/GameView';

/**
 * Main application router component
 * Handles navigation between different app views
 */
const MainRouter = () => {
  const {
    // State
    appMode,
    isMultiplayer,
    isJoiningRoom,
    
    // Actions
    setAppMode,
    setupPlayers
  } = useGame();

  // Room management (always enable Firebase for multiplayer features)
  const {
    roomCode,
    isRoomHost,
    roomConnected,
    handleCreateRoom,
    handleJoinRoom,
    createRoomWithGameState
  } = useRoomManager(true); // Enable Firebase

  // Handle view history
  const handleViewHistory = () => {
    setAppMode('history');
  };

  // Handle player setup completion
  const handleSetupPlayers = async (names, count) => {
    // Setup players in context
    setupPlayers(names, count);
    
    // If multiplayer mode, create Firebase room
    if (isMultiplayer) {
      console.log('Creating Firebase room after player setup');
      // Wait a moment for state to update
      setTimeout(async () => {
        const success = await createRoomWithGameState();
        if (success) {
          console.log('Room created successfully');
        } else {
          console.log('Failed to create room, falling back to local mode');
        }
      }, 100);
    }
    
    // Always go to game mode after player setup
    setAppMode('game');
  };

  // Route to appropriate view based on app mode
  const renderCurrentView = () => {
    switch (appMode) {
      case 'history':
        return (
          <RoomHistory onBack={() => setAppMode('room-browser')} />
        );
      
      case 'player-setup':
        return (
          <PlayerSetup 
            onSetupPlayers={handleSetupPlayers}
            onBack={() => setAppMode('room-browser')}
            isMultiplayer={isMultiplayer}
            roomCode={roomCode}
            isRoomHost={isRoomHost}
            roomConnected={roomConnected}
          />
        );
      
      case 'game':
        return <GameView />;
      
      case 'room-browser':
      default:
        return (
          <RoomBrowser 
            onJoinRoom={handleJoinRoom}
            onCreateRoom={handleCreateRoom}
            onViewHistory={handleViewHistory}
            isLoading={isJoiningRoom}
          />
        );
    }
  };

  return renderCurrentView();
};

export default MainRouter;
