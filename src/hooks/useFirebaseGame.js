import { useState, useEffect, useCallback } from 'react';
import gameService from '../services/gameService';

/**
 * Custom hook for managing Firebase game state
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
 * Custom hook for real-time game subscriptions
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