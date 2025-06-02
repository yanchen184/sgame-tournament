import React, { useState, useEffect } from 'react';
import './App.css';
import GameArena from './components/GameArena';
import PlayerQueue from './components/PlayerQueue';
import Scoreboard from './components/Scoreboard';
import GameControls from './components/GameControls';
import GameTimer from './components/GameTimer';
import StatusMessage from './components/StatusMessage';
import GameRules from './components/GameRules';
import GameHistory from './components/GameHistory';
import { useFirebaseGame } from './hooks/useFirebaseGame';

// Initial player data
const initialPlayers = [
  { id: 1, name: '選手 A', score: 0, winStreak: 0, position: 0, resting: false },
  { id: 2, name: '選手 B', score: 0, winStreak: 0, position: 1, resting: false },
  { id: 3, name: '選手 C', score: 0, winStreak: 0, position: 2, resting: false },
  { id: 4, name: '選手 D', score: 0, winStreak: 0, position: 3, resting: false }
];

function App() {
  const [players, setPlayers] = useState(initialPlayers);
  const [currentFighters, setCurrentFighters] = useState([null, null]);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameTime, setGameTime] = useState(3600); // 60 minutes
  const [battleCount, setBattleCount] = useState(0);
  const [statusMessage, setStatusMessage] = useState(null);
  const [showRestOption, setShowRestOption] = useState(false);
  const [streakWinner, setStreakWinner] = useState(null);
  const [showHistory, setShowHistory] = useState(false);
  const [gameHistory, setGameHistory] = useState([]);

  // Enable Firebase integration
  const enableFirebase = true; // Set to true to enable Firebase features
  
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
    initGame();
  }, []);

  // Initialize Firebase game when component mounts
  useEffect(() => {
    if (enableFirebase && !gameId) {
      initFirebaseGame({
        gameName: '四人單挑循環賽',
        players: initialPlayers,
        gameType: 'tournament',
        maxTime: 3600
      });
    }
  }, [enableFirebase, gameId, initFirebaseGame]);

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
        gameTime,
        battleCount,
        gameStarted
      });
    }
  }, [players, currentFighters, gameTime, battleCount, gameStarted, gameId, saveGameState, enableFirebase]);

  // Shuffle array utility function
  const shuffleArray = (array) => {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  };

  // Initialize game
  const initGame = () => {
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

  // Start game
  const startGame = () => {
    if (!gameStarted) {
      setGameStarted(true);
      showStatus('🎮 比賽開始！', 'success');
      setupInitialMatch();
    }
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
      type: type, // 'normal', 'rest', 'final'
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

    // Check for 4-win streak
    if (updatedWinner.winStreak === 4) {
      setShowRestOption(true);
      setStreakWinner(updatedWinner);
      showStatus(`🔥 ${updatedWinner.name} 連勝 4 場！可選擇休息或繼續比賽`, 'special');
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
      
      showStatus(`🎉 ${winner.name} 獲勝！下一場對戰準備中...`, 'success');
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

  // Reset game
  const resetGame = () => {
    setPlayers(initialPlayers);
    setCurrentFighters([null, null]);
    setGameStarted(false);
    setGameTime(3600);
    setBattleCount(0);
    setShowRestOption(false);
    setStreakWinner(null);
    setStatusMessage(null);
    setGameHistory([]);
    
    initGame();
    showStatus('🔄 比賽已重置！', 'info');

    // Reset Firebase game
    if (enableFirebase && gameId) {
      initFirebaseGame({
        gameName: '四人單挑循環賽',
        players: initialPlayers,
        gameType: 'tournament',
        maxTime: 3600
      });
    }
  };

  // Show status message
  const showStatus = (message, type = 'info') => {
    setStatusMessage({ message, type });
    setTimeout(() => {
      setStatusMessage(null);
    }, 5000);
  };

  // Timer effect
  useEffect(() => {
    let interval;
    if (gameStarted && gameTime > 0) {
      interval = setInterval(() => {
        setGameTime(prev => {
          if (prev <= 1) {
            setGameStarted(false);
            endGame();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    
    return () => clearInterval(interval);
  }, [gameStarted, gameTime]);

  // End game
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
        gameDuration: 3600 - gameTime
      });
    }
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

  return (
    <div className="App">
      <div className="version">
        v1.0.2
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
          {enableFirebase && (
            <div className="firebase-info">
              <span className={`connection-status ${isConnected ? 'connected' : 'disconnected'}`}>
                {isConnected ? '🔥 Firebase 已連接' : '📡 離線模式'}
              </span>
              {gameId && <span className="game-id">遊戲ID: {gameId.substring(0, 8)}</span>}
            </div>
          )}
        </div>

        <GameTimer gameTime={gameTime} />

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
          onStartGame={startGame}
          onDeclareWinner={declareWinner}
          onTakeRest={takeRest}
          onContinuePlay={continuePlay}
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