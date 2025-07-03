/**
 * Enhanced Game Container - With Room Navigation Support
 * Main game interface with room navigation and visual flow
 */

import React from 'react';
import { useGame } from '../contexts/GameContext';
import { APP_MODES } from '../constants';

// Components
import FixedSequenceArena from '../components/FixedSequenceArena';
import FixedSequenceDisplay from '../components/FixedSequenceDisplay';
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
        <button onClick={() => setMode(APP_MODES.ROOM_BROWSER)}>
          返回房間
        </button>
      </div>
    );
  }

  const currentMatch = getCurrentMatch();
  const leaderboard = getLeaderboard();

  return (
    <div className="game-container enhanced">
      {/* Header with game info */}
      <div className="game-header">
        <h1>🥊 固定順序賽制</h1>
        <div className="game-info">
          <span>參賽人數: {gameState.standings ? gameState.standings.length : 0}人</span>
          <span>對戰順序: AB → CD → CA → BD → BC → AD</span>
          <span>進度: {gameState.currentSequenceIndex || 0}/6</span>
        </div>
      </div>

      {/* Main game area */}
      <div className="game-main">
        {/* Left panel - Enhanced Arena */}
        <div className="game-left">
          <FixedSequenceArena 
            currentMatch={currentMatch}
            onDeclareWinner={declareWinner}
            isGameFinished={gameState.phase === 'finished'}
            sequenceProgress={{
              current: gameState.currentSequenceIndex || 0,
              total: 6
            }}
          />
          
          <GameControls
            onUndo={undoLastAction}
            onReset={resetGame}
            onEndGame={endGame}
            onBackToSetup={() => setMode(APP_MODES.PLAYER_SETUP)}
            onBackToRooms={() => setMode(APP_MODES.ROOM_BROWSER)}
            canUndo={gameState.matchHistory && gameState.matchHistory.length > 0}
            isGameFinished={gameState.phase === 'finished'}
          />
        </div>

        {/* Right panel - Sequence Display and Scoreboard */}
        <div className="game-right">
          <FixedSequenceDisplay 
            sequence={['AB', 'CD', 'CA', 'BD', 'BC', 'AD']}
            currentIndex={gameState.currentSequenceIndex || 0}
            completedMatches={gameState.completedMatches || []}
            players={gameState.standings || []}
          />
          
          <Scoreboard 
            players={gameState.standings || []}
            isGameFinished={gameState.phase === 'finished'}
          />
        </div>
      </div>

      {/* Bottom panel - History only (rules moved to setup) */}
      <div className="game-bottom">
        <div className="game-bottom-full">
          <GameHistory 
            history={gameState.matchHistory || []}
            players={gameState.standings || []}
          />
        </div>
      </div>
    </div>
  );
};

export default GameContainer;