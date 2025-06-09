import React, { useState, useEffect } from 'react';

// Context
import { useGame } from '../contexts/GameContext';

// Hooks
import { useRoomManager } from '../hooks/useRoomManager';
import { useFirebaseGame } from '../hooks/useFirebaseGame';
import { useGameActions } from '../hooks/useGameActions';
import { useMatchManager } from '../hooks/useMatchManager';

// Components
import GameArena from '../components/GameArena';
import PlayerQueue from '../components/PlayerQueue';
import Scoreboard from '../components/Scoreboard';
import GameControls from '../components/GameControls';
import GameHistory from '../components/GameHistory';
import GameRules from '../components/GameRules';
import PlayerTransition from '../components/PlayerTransition';

// Containers
import FinalResults from './FinalResults';

/**
 * Main game view container component
 * Handles the primary game interface and state management
 */
const GameView = () => {
  const {
    // State
    isMultiplayer,
    playerCount,
    players,
    currentFighters,
    gameStarted,
    gameEnded,
    showRestOption,
    streakWinner,
    showHistory,
    undoStack,
    battleCount,
    gameHistory,
    currentChampion,
    championBeatenOpponents,
    
    // Actions
    setAppMode,
    setShowHistory,
    showStatus,
    syncRealtimeData
  } = useGame();

  // Local state for transitions
  const [showTransition, setShowTransition] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [transitionType, setTransitionType] = useState(null);
  const [transitionData, setTransitionData] = useState(null);

  // Enable Firebase integration
  const enableFirebase = true;

  // Firebase hooks for single player
  const {
    gameId,
    isConnected: gameConnected,
    isSaving: gameSaving,
    error: firebaseError,
    clearError
  } = useFirebaseGame(enableFirebase && !isMultiplayer);

  // Room management
  const {
    roomId,
    roomCode,
    roomConnected,
    roomSaving,
    realtimeGameData,
    returnToRoomBrowser
  } = useRoomManager(enableFirebase);

  // Effect to sync realtime data when it changes
  useEffect(() => {
    if (isMultiplayer && realtimeGameData) {
      console.log('Syncing realtime game data:', realtimeGameData);
      // Only sync if we have actual game data
      if (realtimeGameData.players && realtimeGameData.players.length > 0) {
        syncRealtimeData(realtimeGameData);
      }
    }
  }, [realtimeGameData, isMultiplayer]);

  // Game actions
  const {
    declareWinnerByName,
    handleTakeRest,
    handleContinuePlay,
    handleUndo,
    endGame
  } = useGameActions(enableFirebase);

  // Match management
  const {
    triggerPlayerTransition
  } = useMatchManager();

  // Legacy function for backwards compatibility
  const declareWinner = async (winnerIndex) => {
    console.log('declareWinner called with index:', winnerIndex);
    console.log('Current fighters:', currentFighters.map(f => f?.name));
    
    const winnerName = currentFighters[winnerIndex - 1]?.name;
    console.log('Winner name resolved to:', winnerName);
    
    if (winnerName) {
      await declareWinnerByName(winnerName);
    } else {
      console.error('Could not resolve winner name for index:', winnerIndex);
    }
  };

  // Show final results overlay when game ends
  if (gameEnded) {
    return <FinalResults onReturnToMenu={() => setAppMode('room-browser')} />;
  }

  return (
    <div className="container">
      <div className="header">
        <h1 className="title">
          🏆 競技管理系統 ({playerCount}人)
          {isMultiplayer && (
            <div className="room-info">
              房間: {roomCode}
            </div>
          )}
          {enableFirebase && (
            <span className="firebase-status">
              {(isMultiplayer ? roomConnected : gameConnected) ? '🔥' : '📡'} 
              {(isMultiplayer ? roomSaving : gameSaving) ? '💾' : ''}
            </span>
          )}
        </h1>
      </div>

      {/* Mobile-optimized layout: vertical stack */}
      <div className="mobile-game-layout">
        {/* Current fighters */}
        <div className="current-fight-section">
          <GameArena 
            currentFighters={currentFighters}
            showRestOption={showRestOption}
            streakWinner={streakWinner}
            onPlayerClick={declareWinnerByName}
          />
        </div>
        
        {/* Victory buttons */}
        <div className="victory-buttons-section">
          <GameControls
            gameStarted={gameStarted}
            gameEnded={gameEnded}
            showRestOption={showRestOption}
            hasUndoActions={undoStack.length > 0}
            isRoomHost={true}
            isMultiplayer={isMultiplayer}
            onStartGame={() => {}}
            onDeclareWinner={declareWinner}
            onTakeRest={handleTakeRest}
            onContinuePlay={handleContinuePlay}
            onUndoAction={handleUndo}
            onEndGame={endGame}
            onResetGame={returnToRoomBrowser}
            onToggleHistory={() => setShowHistory(!showHistory)}
            showHistory={showHistory}
            layout="mobile"
          />
        </div>

        {/* Player queue */}
        <div className="next-player-section">
          <PlayerQueue 
            players={players}
            currentFighters={currentFighters}
            currentChampion={currentChampion}
            championBeatenOpponents={championBeatenOpponents}
            layout="mobile"
          />
        </div>
        
        {/* Scoreboard */}
        <div className="scoreboard-section">
          <Scoreboard 
            players={players}
            currentFighters={currentFighters}
            layout="mobile"
          />
        </div>
      </div>

      {/* Player transition animation overlay */}
      {showTransition && transitionData && (
        <PlayerTransition 
          currentFighters={transitionData.currentFighters}
          nextPlayer={transitionData.nextPlayer}
          triggerTransition={true}
          transitionType={transitionType}
          onTransitionComplete={transitionData.onComplete}
        />
      )}

      {showHistory && (
        <GameHistory 
          history={gameHistory}
          onClose={() => setShowHistory(false)}
        />
      )}

      <GameRules playerCount={playerCount} />
    </div>
  );
};

export default GameView;
