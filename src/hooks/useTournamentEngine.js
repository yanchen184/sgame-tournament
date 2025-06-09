import { useState, useEffect, useCallback } from 'react';
import { TournamentEngineManager } from '../gameEngines/TournamentEngineManager';

/**
 * Universal Tournament Hook
 * Manages any tournament type with optimistic locking and Firebase sync
 */
export const useTournamentEngine = (roomId = null, enableFirebase = true) => {
  const [tournament, setTournament] = useState(null);
  const [tournamentType, setTournamentType] = useState(null);
  const [gameState, setGameState] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [statusMessage, setStatusMessage] = useState(null);

  /**
   * Initialize tournament with selected type and players
   */
  const initializeTournament = useCallback((tournamentId, players, options = {}) => {
    try {
      setError(null);
      
      const tournamentResult = TournamentEngineManager.createTournamentSafe(
        tournamentId, 
        players, 
        options
      );

      if (!tournamentResult.success) {
        setError(tournamentResult.errors.join(', '));
        return false;
      }

      const tournamentEngine = tournamentResult.tournament;
      setTournament(tournamentEngine);
      setTournamentType(tournamentId);
      setGameState(tournamentEngine.gameState);
      
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    }
  }, []);

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

      // Sync to Firebase if enabled
      if (enableFirebase && roomId) {
        await syncToFirebase(newGameState);
      }

      setStatusMessage({
        message: '🎮 比賽開始！',
        type: 'success',
        timestamp: Date.now()
      });

      return true;
    } catch (err) {
      setError(err.message);
      return false;
    } finally {
      setIsProcessing(false);
    }
  }, [tournament, roomId, enableFirebase]);

  /**
   * Process match result (universal for all tournament types)
   */
  const processMatchResult = useCallback(async (winnerName, matchData = {}) => {
    if (!tournament || isProcessing) {
      return false;
    }

    try {
      setIsProcessing(true);
      setError(null);

      // Use optimistic locking for Firebase sync
      if (enableFirebase && roomId) {
        return await processMatchResultWithSync(winnerName, matchData);
      } else {
        return await processMatchResultLocal(winnerName, matchData);
      }
    } catch (err) {
      setError(err.message);
      setStatusMessage({
        message: `❌ 操作失敗: ${err.message}`,
        type: 'error',
        timestamp: Date.now()
      });
      return false;
    } finally {
      setIsProcessing(false);
    }
  }, [tournament, isProcessing, roomId, enableFirebase]);

  /**
   * Process match result with Firebase sync and optimistic locking
   */
  const processMatchResultWithSync = async (winnerName, matchData) => {
    // Implementation will use Firestore transactions for optimistic locking
    // For now, use local processing
    return await processMatchResultLocal(winnerName, matchData);
  };

  /**
   * Process match result locally
   */
  const processMatchResultLocal = async (winnerName, matchData) => {
    const newGameState = tournament.processMatchResult(winnerName, matchData);
    setGameState({ ...newGameState });

    // Show appropriate status message based on tournament type and state
    const statusMsg = getStatusMessageForAction('matchResult', {
      winnerName,
      gameState: newGameState,
      tournamentType
    });

    setStatusMessage(statusMsg);

    return true;
  };

  /**
   * Handle tournament-specific actions
   */
  const processTournamentAction = useCallback(async (actionType, actionData = {}) => {
    if (!tournament || isProcessing) {
      return false;
    }

    try {
      setIsProcessing(true);
      setError(null);

      let newGameState;

      switch (actionType) {
        case 'takeRest':
          if (tournamentType === 'streak' && tournament.processRestAction) {
            newGameState = tournament.processRestAction();
          } else {
            throw new Error('Rest action not available for this tournament type');
          }
          break;

        case 'continuePlay':
          if (tournamentType === 'streak' && tournament.processContinueAction) {
            newGameState = tournament.processContinueAction();
          } else {
            throw new Error('Continue play action not available for this tournament type');
          }
          break;

        case 'undoAction':
          newGameState = tournament.undoLastAction();
          break;

        case 'endTournament':
          newGameState = tournament.endTournament();
          break;

        default:
          throw new Error(`Unknown action type: ${actionType}`);
      }

      setGameState({ ...newGameState });

      // Sync to Firebase if enabled
      if (enableFirebase && roomId) {
        await syncToFirebase(newGameState);
      }

      // Show status message
      const statusMsg = getStatusMessageForAction(actionType, {
        gameState: newGameState,
        tournamentType,
        ...actionData
      });

      setStatusMessage(statusMsg);

      return true;
    } catch (err) {
      setError(err.message);
      setStatusMessage({
        message: `❌ ${err.message}`,
        type: 'error',
        timestamp: Date.now()
      });
      return false;
    } finally {
      setIsProcessing(false);
    }
  }, [tournament, tournamentType, isProcessing, roomId, enableFirebase]);

  /**
   * Get status message for different actions and tournament types
   */
  const getStatusMessageForAction = (actionType, data) => {
    const { winnerName, gameState, tournamentType } = data;

    switch (actionType) {
      case 'matchResult':
        if (gameState.phase === 'finished') {
          const winner = tournament.getWinner();
          return {
            message: `🏁 比賽結束！🏆 冠軍：${winner?.name || 'Unknown'}！`,
            type: 'success',
            persistent: true,
            timestamp: Date.now()
          };
        } else if (tournamentType === 'streak' && gameState.showRestOption) {
          return {
            message: `🏆 ${winnerName} 完成一輪挑戰！可以選擇休息獲得分數或繼續比賽`,
            type: 'warning',
            persistent: true,
            timestamp: Date.now()
          };
        } else {
          return {
            message: `🎉 ${winnerName} 獲勝！`,
            type: 'success',
            timestamp: Date.now()
          };
        }

      case 'takeRest':
        return {
          message: '😴 選擇休息並獲得獎勵分數',
          type: 'info',
          timestamp: Date.now()
        };

      case 'continuePlay':
        return {
          message: '💪 選擇繼續比賽，開始新一輪挑戰！',
          type: 'success',
          timestamp: Date.now()
        };

      case 'undoAction':
        return {
          message: '↶ 已撤銷上一步操作',
          type: 'info',
          timestamp: Date.now()
        };

      case 'endTournament':
        const winner = tournament.getWinner();
        return {
          message: `🏁 比賽提前結束！🏆 冠軍：${winner?.name || 'Unknown'}！`,
          type: 'success',
          persistent: true,
          timestamp: Date.now()
        };

      default:
        return {
          message: '操作完成',
          type: 'info',
          timestamp: Date.now()
        };
    }
  };

  /**
   * Sync game state to Firebase (placeholder for Firebase integration)
   */
  const syncToFirebase = async (gameState) => {
    // This will be implemented when integrating with Firebase
    // For now, just log the sync operation
    console.log('Syncing to Firebase:', gameState);
  };

  /**
   * Get current tournament status and available actions
   */
  const getTournamentStatus = useCallback(() => {
    if (!tournament) {
      return {
        phase: 'setup',
        availableActions: [],
        currentMatch: null,
        isFinished: false
      };
    }

    const status = tournament.getTournamentStatus();
    const availableActions = tournament.getAvailableActions();

    return {
      ...status,
      availableActions,
      tournamentType,
      isProcessing
    };
  }, [tournament, tournamentType, isProcessing]);

  /**
   * Get final results (only available when tournament is finished)
   */
  const getFinalResults = useCallback(() => {
    if (!tournament || !tournament.isTournamentFinished()) {
      return null;
    }

    return tournament.getFinalResults();
  }, [tournament]);

  /**
   * Get tournament-specific data (brackets, standings, etc.)
   */
  const getTournamentData = useCallback(() => {
    if (!tournament) {
      return null;
    }

    const baseData = {
      type: tournamentType,
      gameState,
      status: getTournamentStatus()
    };

    // Add tournament-specific data
    switch (tournamentType) {
      case 'elimination':
        return {
          ...baseData,
          bracket: tournament.getBracketDisplay ? tournament.getBracketDisplay() : null
        };

      case 'roundrobin':
        return {
          ...baseData,
          standings: tournament.getStandingsTable ? tournament.getStandingsTable() : null,
          schedule: tournament.getMatchSchedule ? tournament.getMatchSchedule() : null
        };

      case 'streak':
        return {
          ...baseData,
          players: gameState?.standings || [],
          champion: gameState?.currentChampion || null,
          restOption: gameState?.showRestOption || false
        };

      default:
        return baseData;
    }
  }, [tournament, tournamentType, gameState, getTournamentStatus]);

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
    setTournamentType(null);
    setGameState(null);
    setError(null);
    setStatusMessage(null);
    setIsProcessing(false);
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

    // Match processing
    processMatchResult,
    processTournamentAction,

    // State
    tournament,
    tournamentType,
    gameState,
    isProcessing,
    error,
    statusMessage,

    // Getters
    getTournamentStatus,
    getFinalResults,
    getTournamentData,

    // Utilities
    clearError,
    clearStatus
  };
};

export default useTournamentEngine;