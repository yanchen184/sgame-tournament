import React, { useEffect } from 'react';
import { useGame } from '../contexts/GameContext';
import { useFirebaseRoom, useRealtimeRoom } from '../hooks/useFirebaseGame';
import { RoomService, GameLogicService } from '../services/gameService';
import { APP_MODES } from '../contexts/GameContext';

/**
 * Hook for managing multiplayer room operations
 * @param {boolean} enableFirebase - Whether Firebase is enabled
 * @returns {Object} - Room management functions and state
 */
export const useRoomManager = (enableFirebase) => {
  const {
    appMode,
    setAppMode,
    setMultiplayer,
    setJoiningRoom,
    setupPlayers,
    showStatus,
    syncRealtimeData,
    resetGame,
    isMultiplayer,
    // Game state for syncing
    players,
    currentFighters,
    battleCount,
    gameHistory,
    gameStarted,
    gameEnded,
    playerCount,
    playerNames,
    showRestOption,
    streakWinner,
    currentChampion,
    championBeatenOpponents,
    undoStack
  } = useGame();

  // Firebase room hooks
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

  // Debug logging for realtime data
  useEffect(() => {
    if (roomId && enableFirebase) {
      console.log('Room ID changed:', roomId);
      console.log('Realtime data subscription enabled:', enableFirebase && isMultiplayer);
    }
  }, [roomId, enableFirebase, isMultiplayer]);

  useEffect(() => {
    if (realtimeGameData) {
      console.log('Realtime game data updated:', realtimeGameData);
    }
  }, [realtimeGameData]);

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
      console.log('Attempting to join room:', roomCodeOrId);
      
      const roomGameData = await RoomService.handleJoinRoom(
        joinRoom, 
        roomCodeOrId, 
        showStatus
      );
      
      if (roomGameData) {
        console.log('Successfully joined room, room data:', roomGameData);
        
        const gameState = RoomService.extractGameStateFromRoom(roomGameData);
        console.log('Extracted game state:', gameState);
        
        // Set multiplayer mode first
        setMultiplayer(true);
        
        // Apply loaded state
        setupPlayers(gameState.playerNames, gameState.playerCount);
        syncRealtimeData(gameState);
        
        // Go to game mode
        setAppMode(APP_MODES.GAME);
        
        // Show success message with actual room code
        const actualRoomCode = roomGameData.roomCode || roomCodeOrId;
        showStatus(`🎉 成功加入房間 ${actualRoomCode}！`, 'success');
        
        console.log('Room join completed successfully');
      } else {
        console.log('Failed to join room - no room data returned');
      }
    } catch (error) {
      console.error('Failed to join room:', error);
      showStatus('❌ 加入房間失敗', 'error');
    } finally {
      setJoiningRoom(false);
    }
  };

  // Create room after player setup
  const createRoomWithGameState = async () => {
    if (!roomId) {
      try {
        const gameState = {
          players,
          currentFighters,
          battleCount,
          gameHistory,
          gameStarted,
          gameEnded,
          playerCount,
          playerNames,
          showRestOption,
          streakWinner,
          currentChampion,
          championBeatenOpponents,
          undoStack
        };

        const roomResult = await RoomService.handleCreateRoom(
          createRoom,
          gameState,
          showStatus
        );

        if (roomResult) {
          setAppMode(APP_MODES.GAME);
          return true;
        } else {
          showStatus('❌ 創建房間失敗，切換到本地模式', 'warning');
          setMultiplayer(false);
          return false;
        }
      } catch (error) {
        console.error('Failed to create room:', error);
        showStatus('❌ 創建房間失敗，切換到本地模式', 'warning');
        setMultiplayer(false);
        return false;
      }
    }
    return true;
  };

  // Sync game state to room
  const syncToRoom = async (immediate = false) => {
    if (roomId) {
    const gameState = {
      players,
      currentFighters,
      battleCount,
      gameHistory,
      gameStarted,
      gameEnded,
      playerCount,
      playerNames,
      showRestOption,
      streakWinner,
      currentChampion,
      championBeatenOpponents,
      undoStack
    };

      await RoomService.syncGameStateToRoom(
        updateRoomGameState,
        gameState,
        immediate,
        showStatus
      );
    }
  };

  // End room and game
  const endRoomAndGame = async () => {
    if (roomId) {
      const finalResults = GameLogicService.calculateFinalResults(
        players,
        battleCount,
        gameHistory
      );
      
      await endRoom(finalResults);
    }
  };

  // Return to room browser
  const returnToRoomBrowser = () => {
    setAppMode(APP_MODES.ROOM_BROWSER);
    setMultiplayer(false);
    resetGame();
    
    if (roomId) {
      leaveRoom();
    }
    
    showStatus('🏠 已返回房間選擇', 'info');
  };

  return {
    // Room state
    roomId,
    roomCode,
    isRoomHost,
    roomConnected,
    roomSaving,
    roomError,
    roomData,
    realtimeGameData,
    roomDataLoading,
    
    // Room actions
    handleCreateRoom,
    handleJoinRoom,
    createRoomWithGameState,
    syncToRoom,
    endRoomAndGame,
    returnToRoomBrowser,
    
    // Firebase actions
    clearRoomError
  };
};

export default useRoomManager;
