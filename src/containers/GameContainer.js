/**
 * Simplified Game Container - Enhanced Visual Flow
 * Main game interface without rules (moved to setup page)
 */

import React from 'react';
import { useGame } from '../contexts/GameContext';

// Components
import GameArena from '../components/GameArena';
import PlayerQueue from '../components/PlayerQueue';
import Scoreboard from '../components/Scoreboard';
import GameControls from '../components/GameControls';
import GameHistory from '../components/GameHistory';

// Styles
import './GameContainer.css';

/**
 * Main game container that displays all game components
 */
const GameContainer = () => {
  const { 
    gameState, 
    getCurrentMatch, 
    getLeaderboard,
    declareWinner,
    takeRest,
    undoLastAction,
    resetGame,
    endGame,
    setMode,
    canPlayerRest
  } = useGame();

  if (!gameState) {
    return (
      <div className="game-container error">
        <h2>遊戲尚未開始</h2>
        <button onClick={() => setMode('player-setup')}>
          返回設置
        </button>
      </div>
    );
  }

  const currentMatch = getCurrentMatch();
  const leaderboard = getLeaderboard();

  // Get next player in queue for visual preview
  const getNextPlayerInQueue = () => {
    if (!gameState.players) return null;
    
    // Find players who are not currently active and not resting
    const queuedPlayers = gameState.players.filter(p => !p.isActive && !p.isResting);
    return queuedPlayers.length > 0 ? queuedPlayers[0] : null;
  };

  const nextPlayerInQueue = getNextPlayerInQueue();

  return (
    <div className="game-container enhanced">
      {/* Header with game info */}
      <div className="game-header">
        <h1>🥊 連勝競技系統</h1>
        <div className="game-info">
          <span>參賽人數: {gameState.players.length}人</span>
          <span>連勝休息: {gameState.restRequirement}場</span>
          <span>比賽場次: {gameState.gameHistory.filter(h => h.winner).length}</span>
        </div>
      </div>

      {/* Main game area */}
      <div className="game-main">
        {/* Left panel - Enhanced Arena */}
        <div className="game-left">
          <GameArena 
            currentMatch={currentMatch}
            onDeclareWinner={declareWinner}
            canTakeRest={(playerName) => canPlayerRest(playerName)}
            onTakeRest={takeRest}
            isGameFinished={gameState.isGameFinished}
            players={gameState.players}
            nextPlayerInQueue={nextPlayerInQueue}
          />
          
          <GameControls
            onUndo={undoLastAction}
            onReset={resetGame}
            onEndGame={endGame}
            onBackToSetup={() => setMode('player-setup')}
            canUndo={gameState.gameHistory.length > 0}
            isGameFinished={gameState.isGameFinished}
          />
        </div>

        {/* Right panel - Queue and Scoreboard */}
        <div className="game-right">
          <PlayerQueue 
            players={gameState.players}
            currentMatch={currentMatch}
            nextPlayerInQueue={nextPlayerInQueue}
          />
          
          <Scoreboard 
            players={leaderboard}
            isGameFinished={gameState.isGameFinished}
          />
        </div>
      </div>

      {/* Bottom panel - History only (rules moved to setup) */}
      <div className="game-bottom">
        <div className="game-bottom-full">
          <GameHistory 
            history={gameState.gameHistory}
            players={gameState.players}
          />
        </div>
      </div>
    </div>
  );
};

export default GameContainer;
