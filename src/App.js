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

// Default player names (randomized each time) - expanded for up to 8 players
const getDefaultPlayerNames = (count = 4) => {
  const baseNames = ['bob', 'jimmy', 'white', 'dada', 'alex', 'sam', 'chris', 'taylor'];
  const shuffledNames = shuffleArray(baseNames);
  return shuffledNames.slice(0, count);
};

// Initial player data template - now supports dynamic player count
const createInitialPlayers = (names = getDefaultPlayerNames(), playerCount = 4) => {
  return names.slice(0, playerCount).map((name, index) => ({
    id: index + 1,
    name: name || `Player${index + 1}`,
    score: 0,
    winStreak: 0,
    position: index,
    resting: false
  }));
};

function App() {
  // App mode: 'room-browser', 'player-setup', 'game'
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

  // Enable Firebase integration
  const enableFirebase = true;
  
  // Firebase hooks
  const {
    gameId,
    isConnected: gameConnected,
    isSaving: gameSaving,
    error: firebaseError,
    initializeGame: initFirebaseGame,
    saveGameState,
    savePlayers: savePlayersToFirebase,
    recordMatch,
    endGame: endFirebaseGame,
    clearError
  } = useFirebaseGame(enableFirebase && !isMultiplayer);

  // Room hooks
  const {
    roomId,
    roomCode,
    isRoomHost,
    isConnected: roomConnected,
    isSaving: roomSaving,
    error: roomError,
    createRoom,
    joinRoom,
    updateRoomGameState,
    endRoom,
    leaveRoom,
    clearError: clearRoomError
  } = useFirebaseRoom(enableFirebase);

  // Real-time room subscription
  const {
    roomData,
    gameData: realtimeGameData,
    isLoading: roomDataLoading
  } = useRealtimeRoom(roomId, enableFirebase && isMultiplayer);

  // Sync realtime data to local state (for guests)
  useEffect(() => {
    if (isMultiplayer && !isRoomHost && realtimeGameData) {
      console.log('Syncing realtime game data:', realtimeGameData);
      
      if (realtimeGameData.players) {
        setPlayers(realtimeGameData.players);
      }
      if (realtimeGameData.currentFighters) {
        setCurrentFighters(realtimeGameData.currentFighters);
      }
      if (realtimeGameData.battleCount !== undefined) {
        setBattleCount(realtimeGameData.battleCount);
      }
      if (realtimeGameData.gameHistory) {
        setGameHistory(realtimeGameData.gameHistory);
      }
      if (realtimeGameData.gameStarted !== undefined) {
        setGameStarted(realtimeGameData.gameStarted);
      }
      if (realtimeGameData.gameEnded !== undefined) {
        setGameEnded(realtimeGameData.gameEnded);
      }
    }
  }, [realtimeGameData, isMultiplayer, isRoomHost]);

  // Handle room creation
  const handleCreateRoom = async () => {
    setIsJoiningRoom(true);
    try {
      showStatus('🎮 創建房間中...', 'info');
      setAppMode('player-setup');
      setIsMultiplayer(true);
    } catch (error) {
      console.error('Failed to initiate room creation:', error);
      showStatus('❌ 無法創建房間', 'error');
    } finally {
      setIsJoiningRoom(false);
    }
  };

  // Handle room joining
  const handleJoinRoom = async (roomCodeOrId) => {
    setIsJoiningRoom(true);
    try {
      showStatus('🔗 加入房間中...', 'info');
      
      const roomGameData = await joinRoom(roomCodeOrId);
      if (roomGameData && roomGameData.gameState) {
        // Load game state from room
        const gameState = roomGameData.gameState;
        setPlayerCount(gameState.playerCount || 4);
        setPlayerNames(gameState.playerNames || []);
        setPlayers(gameState.players || []);
        setCurrentFighters(gameState.currentFighters || [null, null]);
        setGameStarted(gameState.gameStarted || false);
        setBattleCount(gameState.battleCount || 0);
        setGameHistory(gameState.gameHistory || []);
        setGameEnded(gameState.gameEnded || false);
        
        setIsMultiplayer(true);
        setGameSetup(true);
        setAppMode('game');
        
        showStatus(`🎉 成功加入房間 ${roomCode}！`, 'success');
      } else {
        showStatus('❌ 找不到該房間或房間已結束', 'error');
      }
    } catch (error) {
      console.error('Failed to join room:', error);
      showStatus('❌ 加入房間失敗', 'error');
    } finally {
      setIsJoiningRoom(false);
    }
  };

  // Setup players with custom names and player count
  const setupPlayers = async (names, count = 4) => {
    setPlayerCount(count);
    setPlayerNames(names);
    const initialPlayers = createInitialPlayers(names, count);
    const shuffledPlayers = shuffleArray(initialPlayers).map((player, index) => ({
      ...player,
      position: index
    }));
    
    setPlayers(shuffledPlayers);
    setGameSetup(true);
    setGameStarted(true);
    setGameEnded(false);
    setupInitialMatch(shuffledPlayers);
    
    // Create room if in multiplayer mode
    if (isMultiplayer && !roomId) {
      try {
        const roomResult = await createRoom({
          gameName: `${count}人動態競技系統`,
          players: shuffledPlayers,
          gameType: 'tournament',
          playerNames: names,
          playerCount: count,
          gameState: {
            players: shuffledPlayers,
            currentFighters: [shuffledPlayers[0], shuffledPlayers[1]],
            battleCount: 0,
            gameStarted: true,
            gameHistory: [],
            gameEnded: false,
            playerCount: count,
            playerNames: names
          }
        });
        
        if (roomResult) {
          showStatus(`🎮 房間創建成功！房間號: ${roomResult.roomCode}`, 'success');
          setAppMode('game');
        }
      } catch (error) {
        console.error('Failed to create room:', error);
        showStatus('❌ 創建房間失敗，切換到本地模式', 'warning');
        setIsMultiplayer(false);
      }
    } else {
      showStatus(`🎮 ${count}人比賽開始！準備迎戰`, 'success');
      setAppMode('game');
    }
  };

  // Setup initial match or next available match
  const setupInitialMatch = (playerList = players) => {
    const availablePlayers = playerList.filter(p => !p.resting);
    if (availablePlayers.length >= 2) {
      const sortedAvailable = availablePlayers.sort((a, b) => a.position - b.position);
      setCurrentFighters([sortedAvailable[0], sortedAvailable[1]]);
    }
  };

  // Declare winner function - THIS WAS MISSING!
  const declareWinner = async (winnerIndex) => {
    if (!currentFighters[0] || !currentFighters[1] || gameEnded) return;

    const winner = currentFighters[winnerIndex - 1];
    const loser = currentFighters[winnerIndex === 1 ? 1 : 0];

    // Save current state to undo stack
    const currentState = {
      players: [...players],
      currentFighters: [...currentFighters],
      battleCount,
      gameHistory: [...gameHistory],
      showRestOption,
      streakWinner
    };
    setUndoStack(prev => [...prev, currentState]);

    // Update players
    const updatedPlayers = players.map(player => {
      if (player.id === winner.id) {
        const newScore = player.score + 1;
        const newStreak = player.winStreak + 1;
        return {
          ...player,
          score: newScore,
          winStreak: newStreak
        };
      } else if (player.id === loser.id) {
        return {
          ...player,
          winStreak: 0
        };
      }
      return player;
    });

    setPlayers(updatedPlayers);
    setBattleCount(prev => prev + 1);

    // Add to history
    const matchResult = {
      battleNumber: battleCount + 1,
      winner: winner.name,
      loser: loser.name,
      winnerScore: updatedPlayers.find(p => p.id === winner.id).score,
      timestamp: new Date()
    };
    setGameHistory(prev => [...prev, matchResult]);

    // Check for win streak
    const updatedWinner = updatedPlayers.find(p => p.id === winner.id);
    if (updatedWinner.winStreak >= 3) {
      setStreakWinner(updatedWinner);
      setShowRestOption(true);
      showStatus(`🔥 ${winner.name} 三連勝！可以選擇休息或繼續`, 'warning', true);
    } else {
      setupNextMatch(updatedPlayers, loser);
    }

    // Sync to Firebase if in multiplayer mode
    if (isMultiplayer && isRoomHost) {
      const newGameState = {
        players: updatedPlayers,
        currentFighters,
        battleCount: battleCount + 1,
        gameHistory: [...gameHistory, matchResult],
        gameStarted: true,
        gameEnded: false,
        playerCount,
        playerNames
      };
      await updateRoomGameState(newGameState);
    }

    showStatus(`🎉 ${winner.name} 獲勝！`, 'success');
  };

  // Setup next match
  const setupNextMatch = (playerList, lastLoser) => {
    const availablePlayers = playerList.filter(p => !p.resting);
    
    if (availablePlayers.length < 2) {
      endGame();
      return;
    }

    // Find the next challenger (after the loser)
    const loserPosition = lastLoser.position;
    let nextChallenger = null;
    
    // Look for next available player in queue order
    for (let i = 1; i <= playerList.length; i++) {
      const nextPosition = (loserPosition + i) % playerList.length;
      const candidate = playerList.find(p => p.position === nextPosition && !p.resting);
      if (candidate && !currentFighters.some(f => f && f.id === candidate.id)) {
        nextChallenger = candidate;
        break;
      }
    }

    if (nextChallenger) {
      const winner = currentFighters.find(f => f.id !== lastLoser.id);
      setCurrentFighters([winner, nextChallenger]);
    } else {
      endGame();
    }
  };

  // Handle rest option
  const handleTakeRest = async () => {
    if (!streakWinner) return;

    const updatedPlayers = players.map(player => {
      if (player.id === streakWinner.id) {
        return { ...player, resting: true, score: player.score + 1 };
      }
      return player;
    });

    setPlayers(updatedPlayers);
    setStreakWinner(null);
    setShowRestOption(false);
    
    // Setup next match without the resting player
    const availablePlayers = updatedPlayers.filter(p => !p.resting);
    if (availablePlayers.length >= 2) {
      setCurrentFighters([availablePlayers[0], availablePlayers[1]]);
    } else {
      endGame();
    }

    showStatus(`😴 ${streakWinner.name} 選擇休息並獲得1分`, 'info');
  };

  // Handle continue playing
  const handleContinuePlay = () => {
    setStreakWinner(null);
    setShowRestOption(false);
    showStatus(`💪 ${streakWinner?.name} 選擇繼續比賽！`, 'success');
  };

  // Undo last action
  const handleUndo = () => {
    if (undoStack.length === 0) return;

    const lastState = undoStack[undoStack.length - 1];
    setPlayers(lastState.players);
    setCurrentFighters(lastState.currentFighters);
    setBattleCount(lastState.battleCount);
    setGameHistory(lastState.gameHistory);
    setShowRestOption(lastState.showRestOption);
    setStreakWinner(lastState.streakWinner);
    setUndoStack(prev => prev.slice(0, -1));

    showStatus('↶ 已撤銷上一步操作', 'info');
  };

  // End game
  const endGame = async () => {
    setGameEnded(true);
    setGameStarted(false);
    
    const finalResults = {
      players: players.sort((a, b) => b.score - a.score),
      totalBattles: battleCount,
      gameHistory,
      endTime: new Date()
    };

    if (isMultiplayer && isRoomHost) {
      await endRoom(finalResults);
    }

    showStatus('🏁 比賽結束！查看最終排名', 'success', true);
  };

  // Show status message
  const showStatus = (message, type = 'info', persistent = false) => {
    setStatusMessage({ message, type, persistent });
    if (!persistent) {
      setTimeout(() => {
        setStatusMessage(null);
      }, 5000);
    }
  };

  // Clear status message manually
  const clearStatusMessage = () => {
    setStatusMessage(null);
  };

  // Show room browser if not in game mode
  if (appMode === 'room-browser') {
    return (
      <div className="App">
        <div className="version">v1.4.1</div>
        <RoomBrowser 
          onJoinRoom={handleJoinRoom}
          onCreateRoom={handleCreateRoom}
          isLoading={isJoiningRoom}
        />
      </div>
    );
  }

  // Show player setup if not configured
  if (appMode === 'player-setup') {
    return (
      <div className="App">
        <div className="version">v1.4.1</div>
        <PlayerSetup onSetupPlayers={setupPlayers} initialNames={playerNames} />
      </div>
    );
  }

  // Main game interface
  return (
    <div className="App">
      <div className="version">
        v1.4.1
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
            🥊 動態競技系統 ({playerCount}人)
            {isMultiplayer && (
              <div className="room-info">
                {isRoomHost ? '🏠 房主' : '👀 觀戰'} - 房間: {roomCode}
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
            />
          </div>
          
          {/* Victory buttons */}
          <div className="victory-buttons-section">
            <GameControls
              gameStarted={gameStarted}
              gameEnded={gameEnded}
              showRestOption={showRestOption}
              hasUndoActions={undoStack.length > 0}
              isRoomHost={isRoomHost}
              isMultiplayer={isMultiplayer}
              onStartGame={() => {}}
              onDeclareWinner={declareWinner}
              onTakeRest={handleTakeRest}
              onContinuePlay={handleContinuePlay}
              onUndoAction={handleUndo}
              onEndGame={endGame}
              onResetGame={() => setAppMode('room-browser')}
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