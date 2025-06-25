/**
 * Simplified Game Container - Streak Tournament Only
 * Main game interface with all game components
 */

import React from 'react';
import { useGame } from '../contexts/GameContext';

// Components
import GameArena from '../components/GameArena';
import PlayerQueue from '../components/PlayerQueue';
import Scoreboard from '../components/Scoreboard';
import GameControls from '../components/GameControls';
import GameHistory from '../components/GameHistory';
import GameRules from '../components/GameRules';

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

  return (
    <div className="game-container">
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
        {/* Left panel - Arena and Controls */}
        <div className="game-left">
          <GameArena 
            currentMatch={currentMatch}
            onDeclareWinner={declareWinner}
            canTakeRest={(playerName) => canPlayerRest(playerName)}
            onTakeRest={takeRest}
            isGameFinished={gameState.isGameFinished}
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
          />
          
          <Scoreboard 
            players={leaderboard}
            isGameFinished={gameState.isGameFinished}
          />
        </div>
      </div>

      {/* Bottom panel - History and Rules */}
      <div className="game-bottom">
        <div className="game-bottom-left">
          <GameHistory 
            history={gameState.gameHistory}
            players={gameState.players}
          />
        </div>
        
        <div className="game-bottom-right">
          <GameRules 
            playerCount={gameState.players.length}
            restRequirement={gameState.restRequirement}
            compact={true}
          />
        </div>
      </div>
    </div>
  );
};

export default GameContainer;
