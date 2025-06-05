import { useState, useEffect, useCallback } from 'react';
import gameService from '../services/gameService';

/**
 * Generate a unique room code
 */
const generateRoomCode = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

/**
 * Custom hook for managing Firebase multiplayer rooms
 * Enhanced with optimized sync performance and better error handling
 * @param {boolean} enableFirebase - Whether to enable Firebase integration
 * @returns {Object} - Room state and functions
 */
export const useFirebaseRoom = (enableFirebase = false) => {
  const [roomId, setRoomId] = useState(null);
  const [roomCode, setRoomCode] = useState(null);
  const [isRoomHost, setIsRoomHost] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);
  const [roomData, setRoomData] = useState(null);

  /**
   * Create a new multiplayer room
   * @param {Object} initialGameData - Initial game data
   */
  const createRoom = useCallback(async (initialGameData) => {
    if (!enableFirebase) return null;

    try {
      setIsSaving(true);
      setError(null);
      
      const newRoomCode = generateRoomCode();
      const roomData = {
        ...initialGameData,
        roomCode: newRoomCode,
        isMultiplayer: true,
        hostId: 'user_' + Date.now(), // Simple user ID for demo
        createdAt: new Date(),
        lastActivity: new Date(),
        status: 'active'
      };
      
      const newRoomId = await gameService.createRoom(roomData);
      
      setRoomId(newRoomId);
      setRoomCode(newRoomCode);
      setIsRoomHost(true);
      setIsConnected(true);
      
      return { roomId: newRoomId, roomCode: newRoomCode };
    } catch (err) {
      console.error('Failed to create room:', err);
      setError('無法創建房間');
      return null;
    } finally {
      setIsSaving(false);
    }
  }, [enableFirebase]);

  /**
   * Join an existing room by room code
   * @param {string} code - Room code to join
   */
  const joinRoom = useCallback(async (code) => {
    if (!enableFirebase) return null;

    try {
      setIsSaving(true);
      setError(null);
      
      const foundRoomId = await gameService.findRoomByCode(code);
      if (!foundRoomId) {
        setError('找不到房間號碼');
        return null;
      }
      
      const roomGameData = await gameService.getRoom(foundRoomId);
      if (!roomGameData) {
        setError('無法載入房間資料');
        return null;
      }
      
      // Check if room is still active
      if (roomGameData.status !== 'active') {
        setError('房間已結束');
        return null;
      }
      
      setRoomId(foundRoomId);
      setRoomCode(code);
      setIsRoomHost(false);
      setIsConnected(true);
      setRoomData(roomGameData);
      
      // Update room activity
      await gameService.updateRoomActivity(foundRoomId);
      
      return roomGameData;
    } catch (err) {
      console.error('Failed to join room:', err);
      setError('無法加入房間');
      return null;
    } finally {
      setIsSaving(false);
    }
  }, [enableFirebase]);

  /**
   * Get list of active rooms (only show active rooms)
   */
  const getActiveRooms = useCallback(async () => {
    if (!enableFirebase) return [];

    try {
      const rooms = await gameService.getActiveRooms();
      // Filter to only show active rooms
      return rooms.filter(room => room.status === 'playing' || room.status === 'active');
    } catch (err) {
      console.error('Failed to load active rooms:', err);
      setError('無法載入房間列表');
      return [];
    }
  }, [enableFirebase]);

  /**
   * Update game state in the room with optimized sync
   * @param {Object} gameState - Current game state
   * @param {boolean} immediate - Whether to sync immediately (for critical updates)
   */
  const updateRoomGameState = useCallback(async (gameState, immediate = false) => {
    if (!enableFirebase || !roomId) return;

    try {
      setIsSaving(true);
      setError(null);
      
      // Use immediate sync for critical updates like rest options, winner declarations
      const isCriticalUpdate = gameState.showRestOption !== undefined || 
                               gameState.streakWinner !== undefined ||
                               gameState.currentFighters !== undefined;
      
      if (immediate || isCriticalUpdate) {
        console.log('Using immediate sync for critical update');
        await gameService.updateRoomGameStateImmediate(roomId, gameState);
      } else {
        console.log('Using debounced sync for regular update');
        await gameService.updateRoomGameState(roomId, gameState);
      }
      
      await gameService.updateRoomActivity(roomId);
    } catch (err) {
      console.error('Failed to update room game state:', err);
      setError('無法同步遊戲狀態');
    } finally {
      setIsSaving(false);
    }
  }, [enableFirebase, roomId]);

  /**
   * End the room (both host and guests can do this now)
   * @param {Object} finalResults - Final game results
   */
  const endRoom = useCallback(async (finalResults) => {
    if (!enableFirebase || !roomId) return;

    try {
      setIsSaving(true);
      setError(null);
      
      await gameService.endRoom(roomId, finalResults);
      setIsConnected(false);
    } catch (err) {
      console.error('Failed to end room:', err);
      setError('無法結束房間');
    } finally {
      setIsSaving(false);
    }
  }, [enableFirebase, roomId]);

  /**
   * Leave the room
   */
  const leaveRoom = useCallback(() => {
    setRoomId(null);
    setRoomCode(null);
    setIsRoomHost(false);
    setIsConnected(false);
    setRoomData(null);
    setError(null);
  }, []);

  /**
   * Clear error state
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    // State
    roomId,
    roomCode,
    isRoomHost,
    isConnected,
    isSaving,
    error,
    roomData,
    
    // Functions
    createRoom,
    joinRoom,
    getActiveRooms,
    updateRoomGameState,
    endRoom,
    leaveRoom,
    clearError
  };
};

/**
 * Custom hook for real-time room subscriptions
 * Enhanced with better sync handling and error recovery
 * @param {string} roomId - Room ID to subscribe to
 * @param {boolean} enabled - Whether subscription is enabled
 * @returns {Object} - Real-time room data and subscription state
 */
export const useRealtimeRoom = (roomId, enabled = false) => {
  const [roomData, setRoomData] = useState(null);
  const [gameData, setGameData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastSyncVersion, setLastSyncVersion] = useState(0);

  useEffect(() => {
    if (!enabled || !roomId) return;

    setIsLoading(true);
    setError(null);

    // Subscribe to real-time room updates
    const unsubscribe = gameService.subscribeToRoom(
      roomId,
      (data) => {
        if (data) {
          // Check sync version to prevent processing old updates
          const newSyncVersion = data.syncVersion || 0;
          if (newSyncVersion >= lastSyncVersion) {
            console.log('Processing room update, sync version:', newSyncVersion);
            setRoomData(data);
            if (data && data.gameState) {
              setGameData(data.gameState);
            }
            setLastSyncVersion(newSyncVersion);
          } else {
            console.log('Ignoring old update, version:', newSyncVersion, 'current:', lastSyncVersion);
          }
        } else {
          setRoomData(null);
          setGameData(null);
        }
        setIsLoading(false);
      },
      (error) => {
        console.error('Room subscription error:', error);
        setError('即時同步連接中斷');
        setIsLoading(false);
        
        // Attempt to reconnect after error
        setTimeout(() => {
          if (enabled && roomId) {
            console.log('Attempting to reconnect to room:', roomId);
            setError(null);
            setIsLoading(true);
          }
        }, 3000);
      }
    );

    // Cleanup subscription on unmount
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [roomId, enabled, lastSyncVersion]);

  return {
    roomData,
    gameData,
    isLoading,
    error
  };
};

/**
 * Legacy hook for backward compatibility
 * Enhanced to support both single-player and multiplayer modes
 * @param {boolean} enableFirebase - Whether to enable Firebase integration
 * @returns {Object} - Game state and functions
 */
export const useFirebaseGame = (enableFirebase = false) => {
  const [gameId, setGameId] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Initialize a new game in Firebase
   * @param {Object} initialGameData - Initial game data
   */
  const initializeGame = useCallback(async (initialGameData) => {
    if (!enableFirebase) return;

    try {
      setIsSaving(true);
      setError(null);
      
      const newGameId = await gameService.createGame(initialGameData);
      setGameId(newGameId);
      setIsConnected(true);
      
      return newGameId;
    } catch (err) {
      console.error('Failed to initialize game:', err);
      setError('無法創建遊戲會話');
    } finally {
      setIsSaving(false);
    }
  }, [enableFirebase]);

  /**
   * Save current game state to Firebase
   * @param {Object} gameState - Current game state
   */
  const saveGameState = useCallback(async (gameState) => {
    if (!enableFirebase || !gameId) return;

    try {
      setIsSaving(true);
      setError(null);
      
      await gameService.updateGame(gameId, gameState);
    } catch (err) {
      console.error('Failed to save game state:', err);
      setError('無法保存遊戲狀態');
    } finally {
      setIsSaving(false);
    }
  }, [enableFirebase, gameId]);

  /**
   * Save players data to Firebase
   * @param {Array} players - Players array
   */
  const savePlayers = useCallback(async (players) => {
    if (!enableFirebase || !gameId) return;

    try {
      setIsSaving(true);
      setError(null);
      
      await gameService.savePlayers(gameId, players);
    } catch (err) {
      console.error('Failed to save players:', err);
      setError('無法保存選手資料');
    } finally {
      setIsSaving(false);
    }
  }, [enableFirebase, gameId]);

  /**
   * Record a match result
   * @param {Object} matchData - Match result data
   */
  const recordMatch = useCallback(async (matchData) => {
    if (!enableFirebase || !gameId) return;

    try {
      setIsSaving(true);
      setError(null);
      
      await gameService.recordMatch(gameId, matchData);
    } catch (err) {
      console.error('Failed to record match:', err);
      setError('無法記錄比賽結果');
    } finally {
      setIsSaving(false);
    }
  }, [enableFirebase, gameId]);

  /**
   * End the current game
   * @param {Object} finalResults - Final game results
   */
  const endGame = useCallback(async (finalResults) => {
    if (!enableFirebase || !gameId) return;

    try {
      setIsSaving(true);
      setError(null);
      
      await gameService.endGame(gameId, finalResults);
      setIsConnected(false);
    } catch (err) {
      console.error('Failed to end game:', err);
      setError('無法結束遊戲');
    } finally {
      setIsSaving(false);
    }
  }, [enableFirebase, gameId]);

  /**
   * Load game state from Firebase
   * @param {string} loadGameId - Game ID to load
   */
  const loadGame = useCallback(async (loadGameId) => {
    if (!enableFirebase) return null;

    try {
      setIsSaving(true);
      setError(null);
      
      const gameData = await gameService.getGame(loadGameId);
      setGameId(loadGameId);
      setIsConnected(true);
      
      return gameData;
    } catch (err) {
      console.error('Failed to load game:', err);
      setError('無法載入遊戲');
      return null;
    } finally {
      setIsSaving(false);
    }
  }, [enableFirebase]);

  /**
   * Clear error state
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  /**
   * Disconnect from Firebase
   */
  const disconnect = useCallback(() => {
    setGameId(null);
    setIsConnected(false);
    setError(null);
  }, []);

  return {
    // State
    gameId,
    isConnected,
    isSaving,
    error,
    
    // Functions
    initializeGame,
    saveGameState,
    savePlayers,
    recordMatch,
    endGame,
    loadGame,
    clearError,
    disconnect
  };
};

/**
 * Custom hook for real-time game subscriptions (legacy)
 * @param {string} gameId - Game ID to subscribe to
 * @param {boolean} enabled - Whether subscription is enabled
 * @returns {Object} - Real-time game data and subscription state
 */
export const useRealtimeGame = (gameId, enabled = false) => {
  const [gameData, setGameData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!enabled || !gameId) return;

    setIsLoading(true);
    setError(null);

    // Subscribe to real-time updates
    const unsubscribe = gameService.subscribeToGame(
      gameId,
      (data) => {
        setGameData(data);
        setIsLoading(false);
      }
    );

    // Cleanup subscription on unmount
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [gameId, enabled]);

  return {
    gameData,
    isLoading,
    error
  };
};