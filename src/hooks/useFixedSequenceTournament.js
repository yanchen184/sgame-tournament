import { useState, useEffect, useCallback } from 'react';
import { FixedSequenceTournamentEngine } from '../gameEngines/FixedSequenceTournamentEngine';
import { FixedSequenceDatabaseService } from '../services/fixedSequenceDatabaseService';

/**
 * Fixed Sequence Tournament Hook
 * Manages fixed sequence tournament with database synchronization
 */
export const useFixedSequenceTournament = (enableDatabaseSync = true) => {
  const [tournament, setTournament] = useState(null);
  const [gameState, setGameState] = useState(null);
  const [sessionId, setSessionId] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [statusMessage, setStatusMessage] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  /**
   * Initialize tournament with 4 players
   */
  const initializeTournament = useCallback(async (players, options = {}) => {
    try {
      setError(null);
      setIsProcessing(true);
      
      // Validate player count
      if (players.length !== 4) {
        throw new Error('Fixed Sequence Tournament requires exactly 4 players');
      }

      // Create tournament engine
      const tournamentEngine = new FixedSequenceTournamentEngine(players, options);
      setTournament(tournamentEngine);
      
      // Create database session if sync is enabled
      if (enableDatabaseSync) {
        const sessionData = {
          tournamentType: 'fixed-sequence',
          players: players,
          options: options,
          sequence: ['AB', 'CD', 'CA', 'BD', 'BC', 'AD'],
          gameState: tournamentEngine.gameState
        };
        
        const newSessionId = await FixedSequenceDatabaseService.createTournamentSession(sessionData);
        setSessionId(newSessionId);
        setIsConnected(true);
        
        setStatusMessage({
          message: `🎮 比賽初始化完成！Session ID: ${newSessionId}`,
          type: 'success',
          timestamp: Date.now()
        });
      } else {
        setStatusMessage({
          message: '🎮 本地比賽初始化完成！',
          type: 'success',
          timestamp: Date.now()
        });
      }
      
      setGameState(tournamentEngine.gameState);
      return true;
    } catch (err) {
      setError(err.message);
      setStatusMessage({
        message: `❌ 初始化失敗: ${err.message}`,
        type: 'error',
        timestamp: Date.now()
      });
      return false;
    } finally {
      setIsProcessing(false);
    }
  }, [enableDatabaseSync]);

  /**
   * Start the tournament
   */
  const startTournament = useCallback(async () => {
    if (!tournament) {
      setError('No tournament initialized');
      return false;
    }

    try {
      setIsProcessing(true);
      setError(null);

      const newGameState = tournament.startTournament();
      setGameState({ ...newGameState });

      setStatusMessage({
        message: '🎮 比賽開始！固定順序：AB → CD → CA → BD → BC → AD',
        type: 'success',
        timestamp: Date.now()
      });

      return true;
    } catch (err) {
      setError(err.message);
      setStatusMessage({
        message: `❌ 開始比賽失敗: ${err.message}`,
        type: 'error',
        timestamp: Date.now()
      });
      return false;
    } finally {
      setIsProcessing(false);
    }
  }, [tournament]);

  /**
   * Process match result with database sync
   */
  const processMatchResult = useCallback(async (winnerName, matchData = {}) => {
    if (!tournament || isProcessing) {
      return false;
    }

    try {
      setIsProcessing(true);
      setError(null);

      // Process match result in tournament engine
      const newGameState = tournament.processMatchResult(winnerName, matchData);
      
      // Get the latest match result for database sync
      const latestMatch = newGameState.matchResults[newGameState.matchResults.length - 1];
      
      // Sync to database if enabled
      if (enableDatabaseSync && sessionId && latestMatch) {
        const success = await FixedSequenceDatabaseService.recordMatchResult(sessionId, latestMatch);
        if (success) {
          setStatusMessage({
            message: `🎉 ${winnerName} 獲勝！已同步到資料庫`,
            type: 'success',
            timestamp: Date.now()
          });
        } else {
          setStatusMessage({
            message: `🎉 ${winnerName} 獲勝！(資料庫同步跳過，可能已存在)`,
            type: 'warning',
            timestamp: Date.now()
          });
        }
      } else {
        setStatusMessage({
          message: `🎉 ${winnerName} 獲勝！`,
          type: 'success',
          timestamp: Date.now()
        });
      }

      setGameState({ ...newGameState });

      // Check if tournament is finished
      if (newGameState.phase === 'finished') {
        const winner = tournament.getWinner();
        setStatusMessage({
          message: `🏁 比賽結束！🏆 冠軍：${winner?.name || 'Unknown'}！`,
          type: 'success',
          persistent: true,
          timestamp: Date.now()
        });

        // Update session status to completed
        if (enableDatabaseSync && sessionId) {
          await FixedSequenceDatabaseService.updateSessionStatus(sessionId, 'completed');
        }
      }

      return true;
    } catch (err) {
      setError(err.message);
      setStatusMessage({
        message: `❌ 處理比賽結果失敗: ${err.message}`,
        type: 'error',
        timestamp: Date.now()
      });
      return false;
    } finally {
      setIsProcessing(false);
    }
  }, [tournament, isProcessing, sessionId, enableDatabaseSync]);

  /**
   * Load tournament from existing session
   */
  const loadFromSession = useCallback(async (existingSessionId) => {
    try {
      setIsProcessing(true);
      setError(null);

      const sessionData = await FixedSequenceDatabaseService.getTournamentSession(existingSessionId);
      if (!sessionData) {
        throw new Error('Session not found');
      }

      // Recreate tournament engine from session data
      const tournamentEngine = new FixedSequenceTournamentEngine(sessionData.players, sessionData.options);
      
      // Load completed matches and update state
      if (sessionData.completedMatches && sessionData.completedMatches.length > 0) {
        // Reconstruct game state from database
        const reconstructedState = {
          ...tournamentEngine.gameState,
          currentSequenceIndex: sessionData.currentSequenceIndex,
          completedMatches: sessionData.completedMatches,
          matchResults: sessionData.completedMatches,
          phase: sessionData.status === 'completed' ? 'finished' : 'playing'
        };

        // Update standings based on completed matches
        reconstructedState.standings = FixedSequenceDatabaseService.calculateStandings(
          sessionData.players, 
          sessionData.completedMatches
        );

        // Set current match if not finished
        if (sessionData.status !== 'completed') {
          reconstructedState.currentMatch = tournamentEngine.generateNextMatch();
        }

        tournamentEngine.gameState = reconstructedState;
        setGameState(reconstructedState);
      } else {
        setGameState(tournamentEngine.gameState);
      }

      setTournament(tournamentEngine);
      setSessionId(existingSessionId);
      setIsConnected(true);

      setStatusMessage({
        message: `🔗 已連接到現有比賽 Session: ${existingSessionId}`,
        type: 'success',
        timestamp: Date.now()
      });

      return true;
    } catch (err) {
      setError(err.message);
      setStatusMessage({
        message: `❌ 載入比賽失敗: ${err.message}`,
        type: 'error',
        timestamp: Date.now()
      });
      return false;
    } finally {
      setIsProcessing(false);
    }
  }, []);

  /**
   * Subscribe to session updates for real-time sync
   */
  useEffect(() => {
    if (!enableDatabaseSync || !sessionId) return;

    const unsubscribe = FixedSequenceDatabaseService.subscribeToSession(
      sessionId,
      (sessionData) => {
        if (sessionData && tournament) {
          // Update local state with remote changes
          const updatedStandings = FixedSequenceDatabaseService.calculateStandings(
            sessionData.players,
            sessionData.completedMatches || []
          );

          const updatedState = {
            ...gameState,
            currentSequenceIndex: sessionData.currentSequenceIndex,
            completedMatches: sessionData.completedMatches || [],
            matchResults: sessionData.completedMatches || [],
            standings: updatedStandings,
            phase: sessionData.status === 'completed' ? 'finished' : 'playing'
          };

          // Update current match if not finished
          if (sessionData.status !== 'completed' && sessionData.currentSequenceIndex < 6) {
            tournament.gameState = updatedState;
            updatedState.currentMatch = tournament.generateNextMatch();
          }

          setGameState(updatedState);
        }
      },
      (error) => {
        console.error('Session subscription error:', error);
        setIsConnected(false);
      }
    );

    return unsubscribe;
  }, [sessionId, enableDatabaseSync, tournament, gameState]);

  /**
   * Get tournament progress information
   */
  const getTournamentProgress = useCallback(() => {
    if (!tournament) return null;

    return tournament.getSequenceProgress();
  }, [tournament]);

  /**
   * Get match sequence display
   */
  const getMatchSequence = useCallback(() => {
    if (!tournament) return [];

    return tournament.getMatchSequence();
  }, [tournament]);

  /**
   * Get current standings
   */
  const getStandings = useCallback(() => {
    if (!gameState) return [];

    return gameState.standings || [];
  }, [gameState]);

  /**
   * Get final results (only when finished)
   */
  const getFinalResults = useCallback(() => {
    if (!tournament || !tournament.isTournamentFinished()) {
      return null;
    }

    return {
      winner: tournament.getWinner(),
      standings: tournament.getFinalStandings(),
      totalMatches: 6,
      completedMatches: gameState?.completedMatches?.length || 0,
      sessionId: sessionId
    };
  }, [tournament, gameState, sessionId]);

  /**
   * Clear error message
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  /**
   * Clear status message
   */
  const clearStatus = useCallback(() => {
    setStatusMessage(null);
  }, []);

  /**
   * Reset tournament (clear all state)
   */
  const resetTournament = useCallback(() => {
    setTournament(null);
    setGameState(null);
    setSessionId(null);
    setError(null);
    setStatusMessage(null);
    setIsProcessing(false);
    setIsConnected(false);
  }, []);

  // Auto-clear status messages after delay
  useEffect(() => {
    if (statusMessage && !statusMessage.persistent) {
      const timer = setTimeout(() => {
        setStatusMessage(null);
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [statusMessage]);

  return {
    // Tournament management
    initializeTournament,
    startTournament,
    resetTournament,
    loadFromSession,

    // Match processing
    processMatchResult,

    // State
    tournament,
    gameState,
    sessionId,
    isProcessing,
    error,
    statusMessage,
    isConnected,

    // Getters
    getTournamentProgress,
    getMatchSequence,
    getStandings,
    getFinalResults,

    // Utilities
    clearError,
    clearStatus,

    // Database sync status
    enableDatabaseSync
  };
};

export default useFixedSequenceTournament;
