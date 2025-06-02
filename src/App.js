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
import { useFirebaseGame } from './hooks/useFirebaseGame';

// Shuffle array utility function (moved to top for use in initial players)
const shuffleArray = (array) => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

// Default player names (randomized each time)
const getDefaultPlayerNames = () => {
  const baseNames = ['bob', 'jimmy', 'white', 'dada'];
  return shuffleArray(baseNames);
};

// Initial player data template
const createInitialPlayers = (names = getDefaultPlayerNames()) => [
  { id: 1, name: names[0] || 'bob', score: 0, winStreak: 0, position: 0, resting: false },
  { id: 2, name: names[1] || 'jimmy', score: 0, winStreak: 0, position: 1, resting: false },
  { id: 3, name: names[2] || 'white', score: 0, winStreak: 0, position: 2, resting: false },
  { id: 4, name: names[3] || 'dada', score: 0, winStreak: 0, position: 3, resting: false }
];

function App() {
  const [gameSetup, setGameSetup] = useState(false);
  const [playerNames, setPlayerNames] = useState(getDefaultPlayerNames());
  const [players, setPlayers] = useState([]);
  const [currentFighters, setCurrentFighters] = useState([null, null]);
  const [gameStarted, setGameStarted] = useState(false);
  const [battleCount, setBattleCount] = useState(0);
  const [statusMessage, setStatusMessage] = useState(null);
  const [showRestOption, setShowRestOption] = useState(false);
  const [streakWinner, setStreakWinner] = useState(null);
  const [showHistory, setShowHistory] = useState(false);
  const [gameHistory, setGameHistory] = useState([]);
  const [lastAction, setLastAction] = useState(null); // For unlimited undo functionality

  // Enable Firebase integration (set to false to use offline mode)
  const enableFirebase = false; // 設為 false 使用離線模式
  
  const {
    gameId,
    isConnected,
    isSaving,
    error: firebaseError,
    initializeGame: initFirebaseGame,
    saveGameState,
    savePlayers: savePlayersToFirebase,
    recordMatch,
    endGame: endFirebaseGame,
    clearError
  } = useFirebaseGame(enableFirebase);

  // Initialize game on component mount
  useEffect(() => {
    if (gameSetup && playerNames.some(name => name.trim())) {
      initGame();
    }
  }, [gameSetup, playerNames]);

  // Initialize Firebase game when players are set
  useEffect(() => {
    if (enableFirebase && !gameId && gameSetup && players.length > 0) {
      initFirebaseGame({
        gameName: '四人單挑循環賽',
        players: players,
        gameType: 'tournament',
        playerNames: playerNames
      });
    }
  }, [enableFirebase, gameId, gameSetup, players, initFirebaseGame, playerNames]);

  // Save players to Firebase when players state changes
  useEffect(() => {
    if (enableFirebase && gameId && gameStarted) {
      savePlayersToFirebase(players);
    }
  }, [players, gameId, gameStarted, savePlayersToFirebase, enableFirebase]);

  // Save game state to Firebase when game state changes
  useEffect(() => {
    if (enableFirebase && gameId && gameStarted) {
      saveGameState({
        players,
        currentFighters,
        battleCount,
        gameStarted,
        gameHistory
      });
    }
  }, [players, currentFighters, battleCount, gameStarted, gameHistory, gameId, saveGameState, enableFirebase]);

  // Setup players with custom names and auto-start game
  const setupPlayers = (names) => {
    setPlayerNames(names);
    const initialPlayers = createInitialPlayers(names);
    const shuffledPlayers = shuffleArray(initialPlayers).map((player, index) => ({
      ...player,
      position: index
    }));
    
    setPlayers(shuffledPlayers);
    setGameSetup(true);
    setGameStarted(true); // Auto-start the game
    setupInitialMatch(shuffledPlayers);
    showStatus('🎮 比賽開始！準備迎戰', 'success');
  };

  // Initialize game
  const initGame = () => {
    if (!gameSetup) return;
    
    const initialPlayers = createInitialPlayers(playerNames);
    const shuffledPlayers = shuffleArray(initialPlayers).map((player, index) => ({
      ...player,
      position: index,
      score: 0,
      winStreak: 0,
      resting: false
    }));
    
    setPlayers(shuffledPlayers);
    setupInitialMatch(shuffledPlayers);
  };

  // Setup initial match
  const setupInitialMatch = (playerList = players) => {
    const availablePlayers = playerList.filter(p => !p.resting);
    if (availablePlayers.length >= 2) {
      setCurrentFighters([availablePlayers[0], availablePlayers[1]]);
    }
  };

  // Start game (keep for reset functionality)
  const startGame = () => {
    if (!gameStarted && gameSetup) {
      setGameStarted(true);
      showStatus('🎮 比賽開始！', 'success');
      setupInitialMatch();
    }
  };

  // Save last action for unlimited undo functionality
  const saveLastAction = (action) => {
    setLastAction({
      ...action,
      timestamp: Date.now(),
      players: JSON.parse(JSON.stringify(players)),
      currentFighters: [...currentFighters],
      battleCount,
      gameHistory: [...gameHistory]
    });
  };

  // Undo last action (no time restrictions)
  const undoLastAction = () => {
    if (!lastAction) {
      showStatus('❌ 沒有可撤銷的操作', 'error');
      return;
    }

    // Restore previous state without any time constraints
    setPlayers(lastAction.players);
    setCurrentFighters(lastAction.currentFighters);
    setBattleCount(lastAction.battleCount);
    setGameHistory(lastAction.gameHistory);
    setShowRestOption(false);
    setStreakWinner(null);
    
    showStatus('↶ 已撤銷上一步操作', 'info');
    setLastAction(null);
  };

  // Record match to history
  const addToHistory = (winner, loser, type = 'normal') => {
    const matchRecord = {
      id: Date.now(),
      timestamp: new Date(),
      winner: winner.name,
      loser: loser.name,
      winnerScore: winner.score,
      winnerStreak: winner.winStreak,
      type: type,
      battleNumber: battleCount + 1
    };

    setGameHistory(prev => [matchRecord, ...prev]);

    // Record to Firebase if enabled
    if (enableFirebase && gameId) {
      recordMatch(matchRecord);
    }

    return matchRecord;
  };

  // Declare winner
  const declareWinner = (winnerIndex) => {
    if (!gameStarted || !currentFighters[0] || !currentFighters[1]) {
      showStatus('❌ 請先開始比賽並確保有兩名選手在場！', 'error');
      return;
    }

    const winner = currentFighters[winnerIndex - 1];
    const loser = currentFighters[winnerIndex === 1 ? 1 : 0];

    // Save current state for unlimited undo
    saveLastAction({
      type: 'match_result',
      winner: winner.name,
      loser: loser.name
    });

    // Update winner stats
    const updatedPlayers = players.map(player => {
      if (player.id === winner.id) {
        return { ...player, score: player.score + 1, winStreak: player.winStreak + 1 };
      }
      if (player.id === loser.id) {
        return { ...player, winStreak: 0 };
      }
      return player;
    });

    setPlayers(updatedPlayers);
    setBattleCount(prev => prev + 1);

    // Add to match history
    const updatedWinner = updatedPlayers.find(p => p.id === winner.id);
    addToHistory(updatedWinner, loser, 'normal');

    // Check for 3-win streak (changed from 4 to 3)
    if (updatedWinner.winStreak === 3) {
      setShowRestOption(true);
      setStreakWinner(updatedWinner);
      showStatus(`🔥 ${updatedWinner.name} 連勝 3 場！可選擇休息或繼續比賽`, 'special');
      return;
    }

    // Move loser to back and get next opponent
    movePlayerToBack(loser, updatedPlayers);
  };

  // Move player to back of queue
  const movePlayerToBack = (player, playerList) => {
    const maxPosition = Math.max(...playerList.filter(p => !p.resting).map(p => p.position));
    const updatedPlayers = playerList.map(p => 
      p.id === player.id ? { ...p, position: maxPosition + 1 } : p
    );

    setPlayers(updatedPlayers);

    // Get next opponent
    const winner = currentFighters.find(f => f.id !== player.id);
    const nextOpponent = getNextOpponent(winner, updatedPlayers);
    
    if (nextOpponent) {
      const winnerIndex = currentFighters.findIndex(f => f.id === winner.id);
      const newFighters = [...currentFighters];
      newFighters[winnerIndex === 0 ? 1 : 0] = nextOpponent;
      setCurrentFighters(newFighters);
      
      showStatus(`🎉 ${winner.name} 獲勝！${nextOpponent.name} 上場迎戰`, 'success');
    } else {
      showStatus('⚠️ 沒有更多對手可以比賽！', 'warning');
    }
  };

  // Get next opponent
  const getNextOpponent = (currentPlayer, playerList) => {
    const availablePlayers = playerList.filter(p => 
      !p.resting && 
      p.id !== currentPlayer.id &&
      !currentFighters.some(f => f && f.id === p.id)
    );
    
    if (availablePlayers.length === 0) return null;
    
    availablePlayers.sort((a, b) => a.position - b.position);
    return availablePlayers[0];
  };

  // Handle rest decision
  const takeRest = () => {
    if (!streakWinner) {
      showStatus('❌ 目前沒有選手可以休息！', 'error');
      return;
    }

    // Save current state for unlimited undo
    saveLastAction({
      type: 'rest_decision',
      player: streakWinner.name
    });

    const updatedPlayers = players.map(player => 
      player.id === streakWinner.id 
        ? { ...player, score: player.score + 1, resting: true, winStreak: 0 }
        : player
    );

    setPlayers(updatedPlayers);
    setCurrentFighters([null, null]);
    setShowRestOption(false);

    // Add rest record to history
    const restRecord = {
      id: Date.now(),
      timestamp: new Date(),
      type: 'rest',
      player: streakWinner.name,
      action: '選擇休息並獲得額外 1 分',
      battleNumber: battleCount + 1
    };
    setGameHistory(prev => [restRecord, ...prev]);

    if (enableFirebase && gameId) {
      recordMatch(restRecord);
    }

    setStreakWinner(null);
    
    setTimeout(() => {
      setupInitialMatch(updatedPlayers);
    }, 100);

    showStatus(`😴 ${streakWinner.name} 選擇休息，獲得額外 1 分！`, 'info');
  };

  // Continue playing (reject rest)
  const continuePlay = () => {
    setShowRestOption(false);
    setStreakWinner(null);
    
    // Continue with current fighters
    const winner = currentFighters.find(f => f.id === streakWinner.id);
    const nextOpponent = getNextOpponent(winner, players);
    
    if (nextOpponent) {
      const winnerIndex = currentFighters.findIndex(f => f.id === winner.id);
      const newFighters = [...currentFighters];
      newFighters[winnerIndex === 0 ? 1 : 0] = nextOpponent;
      setCurrentFighters(newFighters);
      
      showStatus(`💪 ${winner.name} 選擇繼續比賽！`, 'info');
    }
  };

  // End game manually
  const endGame = () => {
    const sortedPlayers = [...players].sort((a, b) => b.score - a.score);
    let message = '🏁 比賽結束！最終排名：<br>';
    sortedPlayers.forEach((player, index) => {
      message += `${index + 1}. ${player.name}: ${player.score} 分<br>`;
    });
    
    showStatus(message, 'info');

    // End Firebase game
    if (enableFirebase && gameId) {
      endFirebaseGame({
        finalRanking: sortedPlayers,
        totalMatches: battleCount,
        playerNames
      });
    }
  };

  // Reset game completely
  const resetGame = () => {
    setGameSetup(false);
    // Generate new random player names each time
    const newPlayerNames = getDefaultPlayerNames();
    setPlayerNames(newPlayerNames);
    setPlayers([]);
    setCurrentFighters([null, null]);
    setGameStarted(false);
    setBattleCount(0);
    setShowRestOption(false);
    setStreakWinner(null);
    setStatusMessage(null);
    setGameHistory([]);
    setLastAction(null);
    
    showStatus('🔄 遊戲已重置！請重新設定選手', 'info');
  };

  // Show status message
  const showStatus = (message, type = 'info') => {
    setStatusMessage({ message, type });
    setTimeout(() => {
      setStatusMessage(null);
    }, 5000);
  };

  // Clear Firebase error
  useEffect(() => {
    if (firebaseError) {
      showStatus(`🔥 Firebase: ${firebaseError}`, 'warning');
      setTimeout(() => {
        clearError();
      }, 3000);
    }
  }, [firebaseError, clearError]);

  // Show player setup if not configured
  if (!gameSetup) {
    return (
      <div className="App">
        <div className="version">v1.0.8</div>
        <PlayerSetup onSetupPlayers={setupPlayers} initialNames={playerNames} />
      </div>
    );
  }

  return (
    <div className="App">
      <div className="version">
        v1.0.8
        {enableFirebase && (
          <span className="firebase-status">
            {isConnected ? '🔥' : '📡'} 
            {isSaving ? '💾' : ''}
          </span>
        )}
      </div>
      
      <div className="container">
        <div className="header">
          <h1 className="title">🥊 四人單挑循環賽系統</h1>
          {enableFirebase ? (
            <div className="firebase-info">
              <span className={`connection-status ${isConnected ? 'connected' : 'disconnected'}`}>
                {isConnected ? '🔥 Firebase 已連接' : '📡 離線模式'}
              </span>
              {gameId && <span className="game-id">遊戲ID: {gameId.substring(0, 8)}</span>}
            </div>
          ) : (
            <div className="offline-info">
              <span className="offline-status">📱 本地模式</span>
            </div>
          )}
        </div>

        <div className="game-area">
          <PlayerQueue 
            players={players}
            currentFighters={currentFighters}
          />
          
          <GameArena 
            currentFighters={currentFighters}
            showRestOption={showRestOption}
            streakWinner={streakWinner}
          />
          
          <Scoreboard 
            players={players}
            currentFighters={currentFighters}
          />
        </div>

        <GameControls
          gameStarted={gameStarted}
          showRestOption={showRestOption}
          lastAction={lastAction}
          onStartGame={startGame}
          onDeclareWinner={declareWinner}
          onTakeRest={takeRest}
          onContinuePlay={continuePlay}
          onUndoAction={undoLastAction}
          onEndGame={endGame}
          onResetGame={resetGame}
          onToggleHistory={() => setShowHistory(!showHistory)}
          showHistory={showHistory}
        />

        {statusMessage && (
          <StatusMessage 
            message={statusMessage.message}
            type={statusMessage.type}
          />
        )}

        {showHistory && (
          <GameHistory 
            history={gameHistory}
            onClose={() => setShowHistory(false)}
          />
        )}

        <GameRules />
      </div>
    </div>
  );
}

export default App;