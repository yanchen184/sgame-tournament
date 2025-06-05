import React, { useState, useEffect } from 'react';
import './App.css';
import GameArena from './components/GameArena';
import PlayerQueue from './components/PlayerQueue';
import Scoreboard from './components/Scoreboard';
import GameControls from './components/GameControls';
import StatusMessage from './components/StatusMessage';
import GameRules from './components/GameRules';
import GameHistory from './components/GameHistory';
import PlayerSetup from './components/PlayerSetup';
import RoomBrowser from './components/RoomBrowser';
import RoomHistory from './components/RoomHistory';
import { useFirebaseGame, useFirebaseRoom, useRealtimeRoom } from './hooks/useFirebaseGame';

// Shuffle array utility function (moved to top for use in initial players)
const shuffleArray = (array) => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

// Default player names - fixed order for 4 players as requested
const getDefaultPlayerNames = (count = 4) => {
  const baseNames = ['bob', 'jimmy', 'white', 'dada', 'alex', 'sam', 'chris', 'taylor'];
  return baseNames.slice(0, count);
};

// Initial player data template - now supports dynamic player count
const createInitialPlayers = (names = getDefaultPlayerNames(), playerCount = 4) => {
  return names.slice(0, playerCount).map((name, index) => ({
    id: index + 1,
    name: name || `Player${index + 1}`,
    score: 0,
    winStreak: 0,
    position: index,
    // Track who this player has been defeated by in current round
    defeatedBy: []
  }));
};

// Generate room number utility
const generateRoomNumber = async () => {
  // This would typically query Firebase to get the next available number
  // For now, we'll use timestamp-based approach
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 100);
  return `${String(timestamp).slice(-6)}${String(random).padStart(2, '0')}`;
};

function App() {
  // App mode: 'room-browser', 'player-setup', 'game', 'history'
  const [appMode, setAppMode] = useState('room-browser');
  
  // Room state
  const [isMultiplayer, setIsMultiplayer] = useState(false);
  const [isJoiningRoom, setIsJoiningRoom] = useState(false);
  
  // Game state
  const [gameSetup, setGameSetup] = useState(false);
  const [playerCount, setPlayerCount] = useState(4); // Dynamic player count
  const [playerNames, setPlayerNames] = useState(getDefaultPlayerNames(4));
  const [players, setPlayers] = useState([]);
  const [currentFighters, setCurrentFighters] = useState([null, null]);
  const [gameStarted, setGameStarted] = useState(false);
  const [battleCount, setBattleCount] = useState(0);
  const [statusMessage, setStatusMessage] = useState(null);
  const [showRestOption, setShowRestOption] = useState(false);
  const [streakWinner, setStreakWinner] = useState(null);
  const [showHistory, setShowHistory] = useState(false);
  const [gameHistory, setGameHistory] = useState([]);
  const [gameEnded, setGameEnded] = useState(false);
  const [undoStack, setUndoStack] = useState([]);
  
  // New state to track current champion and their opponents they've beaten this round
  const [currentChampion, setCurrentChampion] = useState(null);
  const [championBeatenOpponents, setChampionBeatenOpponents] = useState([]);

  // Enable Firebase integration
  const enableFirebase = true;
  
  // Firebase hooks - rest of component...

  // Show room history view
  if (appMode === 'history') {
    return (
      <div className="App">
        <div className="version">v1.5.0</div>
        <RoomHistory onBack={() => setAppMode('room-browser')} />
      </div>
    );
  }

  // Show room browser if not in game mode
  if (appMode === 'room-browser') {
    return (
      <div className="App">
        <div className="version">v1.5.0</div>
        <RoomBrowser 
          onJoinRoom={handleJoinRoom}
          onCreateRoom={handleCreateRoom}
          onViewHistory={handleViewHistory}
          isLoading={isJoiningRoom}
        />
      </div>
    );
  }

  // Show player setup if not configured
  if (appMode === 'player-setup') {
    return (
      <div className="App">
        <div className="version">v1.5.0</div>
        <PlayerSetup onSetupPlayers={setupPlayers} initialNames={playerNames} />
      </div>
    );
  }

  // Main game interface
  return (
    <div className="App">
      <div className="version">
        v1.5.0
        {enableFirebase && (
          <span className="firebase-status">
            {(isMultiplayer ? roomConnected : gameConnected) ? '🔥' : '📡'} 
            {(isMultiplayer ? roomSaving : gameSaving) ? '💾' : ''}
          </span>
        )}
      </div>
      
      <div className="container">
        <div className="header">
          <h1 className="title">
            🏆 競技管理系統 ({playerCount}人)
            {isMultiplayer && (
              <div className="room-info">
                房間: {roomCode} - 大家都可以操作
              </div>
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
              isRoomHost={true} // Everyone can control now
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

        {statusMessage && (
          <StatusMessage 
            message={statusMessage.message}
            type={statusMessage.type}
            persistent={statusMessage.persistent}
            onClose={statusMessage.persistent ? clearStatusMessage : undefined}
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
    </div>
  );
}

export default App;