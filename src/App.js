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

// Shuffle array utility function
const shuffleArray = (array) => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

// Default player names
const getDefaultPlayerNames = (count = 4) => {
  const baseNames = ['bob', 'jimmy', 'white', 'dada', 'alex', 'sam', 'chris', 'taylor'];
  return baseNames.slice(0, count);
};

// Initial player data template
const createInitialPlayers = (names = getDefaultPlayerNames(), playerCount = 4) => {
  return names.slice(0, playerCount).map((name, index) => ({
    id: index + 1,
    name: name || `Player${index + 1}`,
    score: 0,
    winStreak: 0,
    position: index,
    defeatedBy: []
  }));
};

// Generate room number utility
const generateRoomNumber = async () => {
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
  const [playerCount, setPlayerCount] = useState(4);
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
  
  // Champion tracking state
  const [currentChampion, setCurrentChampion] = useState(null);
  const [championBeatenOpponents, setChampionBeatenOpponents] = useState([]);

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

  // Sync realtime data to local state
  useEffect(() => {
    if (isMultiplayer && realtimeGameData) {
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
      if (realtimeGameData.showRestOption !== undefined) {
        setShowRestOption(realtimeGameData.showRestOption);
      }
      if (realtimeGameData.streakWinner !== undefined) {
        setStreakWinner(realtimeGameData.streakWinner);
      }
      if (realtimeGameData.currentChampion !== undefined) {
        setCurrentChampion(realtimeGameData.currentChampion);
      }
      if (realtimeGameData.championBeatenOpponents) {
        setChampionBeatenOpponents(realtimeGameData.championBeatenOpponents);
      }
    }
  }, [realtimeGameData, isMultiplayer]);

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
        const gameState = roomGameData.gameState;
        setPlayerCount(gameState.playerCount || 4);
        setPlayerNames(gameState.playerNames || []);
        setPlayers(gameState.players || []);
        setCurrentFighters(gameState.currentFighters || [null, null]);
        setGameStarted(gameState.gameStarted || false);
        setBattleCount(gameState.battleCount || 0);
        setGameHistory(gameState.gameHistory || []);
        setGameEnded(gameState.gameEnded || false);
        setShowRestOption(gameState.showRestOption || false);
        setStreakWinner(gameState.streakWinner || null);
        setCurrentChampion(gameState.currentChampion || null);
        setChampionBeatenOpponents(gameState.championBeatenOpponents || []);
        
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

  // Handle view history
  const handleViewHistory = () => {
    setAppMode('history');
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
    
    // Initialize champion tracking
    setCurrentChampion(shuffledPlayers[0]);
    setChampionBeatenOpponents([]);
    
    setupInitialMatch(shuffledPlayers);
    
    // Create room if in multiplayer mode
    if (isMultiplayer && !roomId) {
      try {
        const roomNumber = await generateRoomNumber();
        const roomResult = await createRoom({
          gameName: `競技房間 ${roomNumber}`,
          players: shuffledPlayers,
          gameType: 'tournament',
          playerNames: names,
          playerCount: count,
          roomNumber: roomNumber,
          gameState: {
            players: shuffledPlayers,
            currentFighters: [shuffledPlayers[0], shuffledPlayers[1]],
            battleCount: 0,
            gameStarted: true,
            gameHistory: [],
            gameEnded: false,
            playerCount: count,
            playerNames: names,
            roomNumber: roomNumber,
            showRestOption: false,
            streakWinner: null,
            currentChampion: shuffledPlayers[0],
            championBeatenOpponents: []
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

  // Setup initial match
  const setupInitialMatch = (playerList = players) => {
    const availablePlayers = playerList.filter(p => p);
    if (availablePlayers.length >= 2) {
      const sortedAvailable = availablePlayers.sort((a, b) => a.position - b.position);
      setCurrentFighters([sortedAvailable[0], sortedAvailable[1]]);
    }
  };

  // Enhanced sync function for multiplayer
  const syncGameStateToRoom = async (gameState) => {
    if (isMultiplayer) {
      try {
        await updateRoomGameState(gameState);
      } catch (error) {
        console.error('Failed to sync game state to room:', error);
        showStatus('⚠️ 同步失敗，可能會有延遲', 'warning');
      }
    }
  };

  // Setup next match for champion
  const setupNextMatch = (playerList, champion, beatenOpponents) => {
    console.log('Setting up next match for champion:', champion.name);
    console.log('Already beaten opponents:', beatenOpponents.map(p => p.name));
    
    const availableChallengers = playerList.filter(player => 
      player.id !== champion.id && 
      !beatenOpponents.some(beaten => beaten.id === player.id)
    );
    
    console.log('Available challengers:', availableChallengers.map(p => p.name));
    
    if (availableChallengers.length === 0) {
      console.log('No available challengers, ending game');
      return null;
    }

    const championPosition = champion.position;
    let nextChallenger = null;
    
    for (let i = 1; i < playerList.length; i++) {
      const nextPosition = (championPosition + i) % playerList.length;
      const candidate = playerList.find(p => p.position === nextPosition);
      if (candidate && availableChallengers.some(ac => ac.id === candidate.id)) {
        nextChallenger = candidate;
        break;
      }
    }

    console.log('Next challenger found:', nextChallenger?.name || 'none');
    
    if (nextChallenger) {
      const newFighters = [champion, nextChallenger];
      setCurrentFighters(newFighters);
      return newFighters;
    } else {
      return null;
    }
  };

  // Setup match between other players
  const setupMatchBetweenOthers = (playerList, excludedPlayerId = null) => {
    console.log('Setting up match between other players, excluding:', excludedPlayerId);
    
    const availablePlayers = playerList.filter(player => 
      excludedPlayerId ? player.id !== excludedPlayerId : true
    );
    
    if (availablePlayers.length < 2) {
      console.log('Not enough players for a match');
      return null;
    }

    const sortedAvailable = availablePlayers.sort((a, b) => a.position - b.position);
    const newFighters = [sortedAvailable[0], sortedAvailable[1]];
    
    console.log('New match setup between:', newFighters.map(p => p.name));
    
    setCurrentChampion(newFighters[0]);
    setChampionBeatenOpponents([]);
    
    setCurrentFighters(newFighters);
    return newFighters;
  };

  // Declare winner by name (new click functionality)
  const declareWinnerByName = async (winnerName) => {
    if (!currentFighters[0] || !currentFighters[1] || gameEnded) return;

    const winner = currentFighters.find(fighter => fighter.name === winnerName);
    const loser = currentFighters.find(fighter => fighter.name !== winnerName);

    if (!winner || !loser) {
      console.error('Invalid winner selection');
      return;
    }

    console.log(`Winner: ${winner.name}, Loser: ${loser.name}`);

    // Save current state to undo stack
    const currentState = {
      players: [...players],
      currentFighters: [...currentFighters],
      battleCount,
      gameHistory: [...gameHistory],
      showRestOption,
      streakWinner,
      currentChampion,
      championBeatenOpponents: [...championBeatenOpponents]
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

    // Update champion tracking
    let newChampion = currentChampion;
    let newBeatenOpponents = [...championBeatenOpponents];
    let shouldShowRest = false;
    let newCurrentFighters = currentFighters;

    if (winner.id === currentChampion?.id) {
      // Current champion wins
      if (!newBeatenOpponents.some(op => op.id === loser.id)) {
        newBeatenOpponents.push(loser);
      }
      
      console.log('Champion continues, beaten opponents now:', newBeatenOpponents.map(p => p.name));
      
      // Check if champion has beaten all other players
      const otherPlayers = updatedPlayers.filter(p => p.id !== winner.id);
      const hasBeatenAll = otherPlayers.every(player => 
        newBeatenOpponents.some(beaten => beaten.id === player.id)
      );
      
      console.log('Has beaten all players in this round:', hasBeatenAll);
      
      if (hasBeatenAll) {
        shouldShowRest = true;
        setStreakWinner(updatedPlayers.find(p => p.id === winner.id));
        setShowRestOption(true);
        showStatus(`🏆 ${winner.name} 完成一輪挑戰！可以選擇休息獲得1分或繼續比賽`, 'warning', true);
      } else {
        const nextFighters = setupNextMatch(updatedPlayers, winner, newBeatenOpponents);
        if (nextFighters) {
          newCurrentFighters = nextFighters;
        } else {
          endGame();
          return;
        }
      }
    } else {
      // Champion lost - new champion takes over
      console.log('New champion takes over');
      newChampion = updatedPlayers.find(p => p.id === winner.id);
      newBeatenOpponents = [loser];
      
      const nextFighters = setupNextMatch(updatedPlayers, winner, newBeatenOpponents);
      if (nextFighters) {
        newCurrentFighters = nextFighters;
      } else {
        endGame();
        return;
      }
    }

    setCurrentChampion(newChampion);
    setChampionBeatenOpponents(newBeatenOpponents);

    // Sync to Firebase if in multiplayer mode
    if (isMultiplayer) {
      const newGameState = {
        players: updatedPlayers,
        currentFighters: newCurrentFighters,
        battleCount: battleCount + 1,
        gameHistory: [...gameHistory, matchResult],
        gameStarted: true,
        gameEnded: false,
        playerCount,
        playerNames,
        showRestOption: shouldShowRest,
        streakWinner: shouldShowRest ? updatedPlayers.find(p => p.id === winner.id) : null,
        currentChampion: newChampion,
        championBeatenOpponents: newBeatenOpponents
      };
      await syncGameStateToRoom(newGameState);
    }

    showStatus(`🎉 ${winner.name} 獲勝！`, 'success');
  };

  // Legacy function for backwards compatibility
  const declareWinner = async (winnerIndex) => {
    const winnerName = currentFighters[winnerIndex - 1]?.name;
    if (winnerName) {
      await declareWinnerByName(winnerName);
    }
  };

  // Handle rest option
  const handleTakeRest = async () => {
    if (!streakWinner) return;

    const updatedPlayers = players.map(player => {
      if (player.id === streakWinner.id) {
        return { 
          ...player, 
          score: player.score + 1,
          winStreak: 0
        };
      }
      return player;
    });

    setPlayers(updatedPlayers);
    setStreakWinner(null);
    setShowRestOption(false);
    
    const restedChampionId = streakWinner.id;
    const newCurrentFighters = setupMatchBetweenOthers(updatedPlayers, restedChampionId);
    
    if (!newCurrentFighters) {
      endGame();
      return;
    }

    if (isMultiplayer) {
      const newGameState = {
        players: updatedPlayers,
        currentFighters: newCurrentFighters,
        battleCount,
        gameHistory,
        gameStarted: true,
        gameEnded: false,
        playerCount,
        playerNames,
        showRestOption: false,
        streakWinner: null,
        currentChampion: newCurrentFighters[0],
        championBeatenOpponents: []
      };
      await syncGameStateToRoom(newGameState);
    }

    showStatus(`😴 ${streakWinner.name} 選擇休息並獲得1分，下場休息，其他人開始比賽`, 'info');
  };

  // Find next opponent in rotation
  const findNextOpponent = (playerList, currentPlayer) => {
    const currentPosition = currentPlayer.position;
    for (let i = 1; i < playerList.length; i++) {
      const nextPosition = (currentPosition + i) % playerList.length;
      const candidate = playerList.find(p => p.position === nextPosition);
      if (candidate && candidate.id !== currentPlayer.id) {
        return candidate;
      }
    }
    return null;
  };

  // Handle continue playing
  const handleContinuePlay = async () => {
    if (!streakWinner) return;
    
    const champion = streakWinner;
    setStreakWinner(null);
    setShowRestOption(false);
    
    setCurrentChampion(champion);
    setChampionBeatenOpponents([]);
    
    const nextChallenger = findNextOpponent(players, champion);
    let newCurrentFighters = [champion, nextChallenger];
    
    if (nextChallenger) {
      setCurrentFighters(newCurrentFighters);
    }
    
    if (isMultiplayer) {
      const newGameState = {
        players,
        currentFighters: newCurrentFighters,
        battleCount,
        gameHistory,
        gameStarted: true,
        gameEnded: false,
        playerCount,
        playerNames,
        showRestOption: false,
        streakWinner: null,
        currentChampion: champion,
        championBeatenOpponents: []
      };
      await syncGameStateToRoom(newGameState);
    }
    
    showStatus(`💪 ${champion?.name} 選擇繼續比賽，開始新一輪挑戰！`, 'success');
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
    setCurrentChampion(lastState.currentChampion);
    setChampionBeatenOpponents(lastState.championBeatenOpponents);
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

    if (isMultiplayer) {
      await endRoom(finalResults);
    }

    showStatus('🏁 比賽結束！查看最終排名', 'success', true);
  };

  // Return to room browser
  const returnToRoomBrowser = () => {
    setAppMode('room-browser');
    setIsMultiplayer(false);
    setGameSetup(false);
    setPlayers([]);
    setCurrentFighters([null, null]);
    setGameStarted(false);
    setBattleCount(0);
    setShowRestOption(false);
    setStreakWinner(null);
    setGameHistory([]);
    setGameEnded(false);
    setUndoStack([]);
    setCurrentChampion(null);
    setChampionBeatenOpponents([]);
    
    if (roomId) {
      leaveRoom();
    }
    
    showStatus('🏠 已返回房間選擇', 'info');
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