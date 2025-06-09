import React from 'react';
import { useGame, APP_MODES } from '../contexts/GameContext';
import { RoomService } from '../services/gameService';
import { useFirebaseRoom, useRealtimeRoom } from '../hooks/useFirebaseGame';
import RoomBrowser from '../components/RoomBrowser';
import PlayerSetup from '../components/PlayerSetup';
import GameInterface from './GameInterface';
import RoomHistory from '../components/RoomHistory';

/**
 * Game router component that handles multiplayer room management and game flow
 * This is a more complex router that manages Firebase integration
 * Note: This file may be redundant with the simpler MainRouter component
 */
const AppRouter = () => {
  const {
    appMode,
    isJoiningRoom,
    isMultiplayer,
    playerNames,
    setAppMode,
    setMultiplayer,
    setJoiningRoom,
    setupPlayers,
    showStatus,
    syncRealtimeData
  } = useGame();

  // Firebase room hooks
  const {
    roomId,
    roomCode,
    createRoom,
    joinRoom,
    leaveRoom
  } = useFirebaseRoom(true);

  // Real-time room subscription
  const {
    roomData,
    gameData: realtimeGameData
  } = useRealtimeRoom(roomId, isMultiplayer);

  // Sync realtime data to local state
  React.useEffect(() => {
    if (isMultiplayer && realtimeGameData) {
      console.log('Syncing realtime game data:', realtimeGameData);
      syncRealtimeData(realtimeGameData);
    }
  }, [realtimeGameData, isMultiplayer, syncRealtimeData]);

  // Handle room creation
  const handleCreateRoom = async () => {
    setJoiningRoom(true);
    try {
      showStatus('🎮 創建房間中...', 'info');
      setAppMode(APP_MODES.PLAYER_SETUP);
      setMultiplayer(true);
    } catch (error) {
      console.error('Failed to initiate room creation:', error);
      showStatus('❌ 無法創建房間', 'error');
    } finally {
      setJoiningRoom(false);
    }
  };

  // Handle room joining
  const handleJoinRoom = async (roomCodeOrId) => {
    setJoiningRoom(true);
    try {
      const roomGameData = await RoomService.handleJoinRoom(
        joinRoom, 
        roomCodeOrId, 
        showStatus
      );
      
      if (roomGameData) {
        const gameState = RoomService.extractGameStateFromRoom(roomGameData);
        
        // Apply extracted game state
        syncRealtimeData(gameState);
        setMultiplayer(true);
        setAppMode(APP_MODES.GAME);
        
        showStatus(`🎉 成功加入房間 ${roomCode}！`, 'success');
      }
    } catch (error) {
      console.error('Failed to join room:', error);
      showStatus('❌ 加入房間失敗', 'error');
    } finally {
      setJoiningRoom(false);
    }
  };

  // Handle view history
  const handleViewHistory = () => {
    setAppMode(APP_MODES.HISTORY);
  };

  // Setup players with custom names and player count
  const handleSetupPlayers = async (names, count = 4) => {
    setupPlayers(names, count);
    
    // Create room if in multiplayer mode
    if (isMultiplayer && !roomId) {
      try {
        const gameState = {
          players: [], // Will be set by setupPlayers action
          currentFighters: [null, null],
          battleCount: 0,
          gameStarted: true,
          gameHistory: [],
          gameEnded: false,
          playerCount: count,
          playerNames: names,
          showRestOption: false,
          streakWinner: null,
          currentChampion: null,
          championBeatenOpponents: [],
          undoStack: []
        };
        
        await RoomService.handleCreateRoom(createRoom, gameState, showStatus);
        setAppMode(APP_MODES.GAME);
      } catch (error) {
        console.error('Failed to create room:', error);
        showStatus('❌ 創建房間失敗，切換到本地模式', 'warning');
        setMultiplayer(false);
        setAppMode(APP_MODES.GAME);
      }
    } else {
      showStatus(`🎮 ${count}人比賽開始！準備迎戰`, 'success');
      setAppMode(APP_MODES.GAME);
    }
  };

  // Return to room browser
  const handleReturnToRoomBrowser = () => {
    setAppMode(APP_MODES.ROOM_BROWSER);
    setMultiplayer(false);
    
    if (roomId) {
      leaveRoom();
    }
    
    showStatus('🏠 已返回房間選擇', 'info');
  };

  // Render based on current app mode
  switch (appMode) {
    case APP_MODES.HISTORY:
      return (
        <RoomHistory onBack={() => setAppMode(APP_MODES.ROOM_BROWSER)} />
      );

    case APP_MODES.ROOM_BROWSER:
      return (
        <RoomBrowser 
          onJoinRoom={handleJoinRoom}
          onCreateRoom={handleCreateRoom}
          onViewHistory={handleViewHistory}
          isLoading={isJoiningRoom}
        />
      );

    case APP_MODES.PLAYER_SETUP:
      return (
        <PlayerSetup 
          onSetupPlayers={handleSetupPlayers} 
          initialNames={playerNames}
          onBack={() => setAppMode(APP_MODES.ROOM_BROWSER)}
        />
      );

    case APP_MODES.GAME:
      return (
        <GameInterface 
          onReturnToRoomBrowser={handleReturnToRoomBrowser}
          roomCode={roomCode}
        />
      );

    default:
      return (
        <div className="App">
          <div className="error-state">
            <h2>Unknown app mode: {appMode}</h2>
            <button onClick={() => setAppMode(APP_MODES.ROOM_BROWSER)}>
              Return to Home
            </button>
          </div>
        </div>
      );
  }
};

export default AppRouter;
