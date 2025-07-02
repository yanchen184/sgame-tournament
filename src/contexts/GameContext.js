/**
 * Enhanced Game Context - Fixed Sequence Tournament
 * Provides game state management with fixed sequence gameplay (AB->CD->CA->BD->BC->AD)
 * Removed streak-based rest mechanics for simplified tournament flow
 */

import React, { createContext, useContext, useReducer, useCallback } from 'react';
import { StreakGameEngine } from '../gameEngines/StreakGameEngine';
import { APP_MODES, GAME_DEFAULTS, STATUS_TYPES } from '../constants';

// Game Context
const GameContext = createContext();

// Initial state
const initialState = {
  // App mode management - Start with room browser
  currentMode: APP_MODES.ROOM_BROWSER,
  
  // Player management - Fixed to 4 players for fixed sequence
  playerCount: 4, // Always 4 for fixed sequence
  playerNames: [...GAME_DEFAULTS.DEFAULT_PLAYER_NAMES.slice(0, 4)],
  
  // Game state
  gameEngine: null,
  gameState: null,
  
  // UI state
  statusMessage: null,
  isProcessing: false,
  
  // Game settings
  settings: {
    enableFirebase: true, // Enable Firebase for room functionality
    autoSave: true
  }
};

// Action types
const ActionTypes = {
  SET_MODE: 'SET_MODE',
  SET_PLAYER_COUNT: 'SET_PLAYER_COUNT',
  SET_PLAYER_NAMES: 'SET_PLAYER_NAMES',
  START_GAME: 'START_GAME',
  DECLARE_WINNER: 'DECLARE_WINNER',
  UNDO_ACTION: 'UNDO_ACTION',
  RESET_GAME: 'RESET_GAME',
  END_GAME: 'END_GAME',
  SET_STATUS: 'SET_STATUS',
  CLEAR_STATUS: 'CLEAR_STATUS',
  SET_PROCESSING: 'SET_PROCESSING',
  UPDATE_SETTINGS: 'UPDATE_SETTINGS'
};

// Reducer
function gameReducer(state, action) {
  switch (action.type) {
    case ActionTypes.SET_MODE:
      return {
        ...state,
        currentMode: action.payload
      };

    case ActionTypes.SET_PLAYER_COUNT:
      // Always keep 4 players for fixed sequence
      const newCount = 4;
      const newNames = [...GAME_DEFAULTS.DEFAULT_PLAYER_NAMES.slice(0, 4)];
      // If we have existing names, preserve them
      if (state.playerNames.length > 0) {
        for (let i = 0; i < Math.min(4, state.playerNames.length); i++) {
          if (state.playerNames[i].trim()) {
            newNames[i] = state.playerNames[i];
          }
        }
      }
      
      return {
        ...state,
        playerCount: newCount,
        playerNames: newNames
      };

    case ActionTypes.SET_PLAYER_NAMES:
      // Ensure exactly 4 player names
      const names = action.payload.slice(0, 4);
      while (names.length < 4) {
        names.push(`選手${names.length + 1}`);
      }
      return {
        ...state,
        playerNames: names
      };

    case ActionTypes.START_GAME:
      // Ensure exactly 4 players
      const playerNames = action.payload.playerNames.slice(0, 4);
      if (playerNames.length !== 4) {
        return {
          ...state,
          statusMessage: {
            type: STATUS_TYPES.ERROR,
            message: '固定順序賽制需要恰好4位選手',
            timestamp: Date.now()
          }
        };
      }

      const gameEngine = new StreakGameEngine(playerNames);
      return {
        ...state,
        gameEngine,
        gameState: gameEngine.getGameState(),
        currentMode: APP_MODES.GAME
      };

    case ActionTypes.DECLARE_WINNER:
      if (!state.gameEngine) return state;
      
      try {
        const result = state.gameEngine.declareWinner(action.payload.winnerName);
        const newGameState = state.gameEngine.getGameState();
        
        let message = `🎉 ${result.winner.name} (${result.winner.label}) 獲勝！`;
        if (result.isGameFinished) {
          const winner = state.gameEngine.getWinner();
          message = `🏁 比賽結束！🏆 冠軍：${winner.name} (${winner.label})！`;
        }
        
        return {
          ...state,
          gameState: newGameState,
          statusMessage: {
            type: result.isGameFinished ? STATUS_TYPES.SUCCESS : STATUS_TYPES.SUCCESS,
            message: message,
            timestamp: Date.now(),
            persistent: result.isGameFinished
          }
        };
      } catch (error) {
        return {
          ...state,
          statusMessage: {
            type: STATUS_TYPES.ERROR,
            message: `錯誤：${error.message}`,
            timestamp: Date.now()
          }
        };
      }

    case ActionTypes.UNDO_ACTION:
      if (!state.gameEngine) return state;
      
      try {
        const undoneAction = state.gameEngine.undoLastAction();
        return {
          ...state,
          gameState: state.gameEngine.getGameState(),
          statusMessage: {
            type: STATUS_TYPES.INFO,
            message: `已撤銷：${undoneAction.winner} 對 ${undoneAction.loser} 的勝利`,
            timestamp: Date.now()
          }
        };
      } catch (error) {
        return {
          ...state,
          statusMessage: {
            type: STATUS_TYPES.WARNING,
            message: `無法撤銷：${error.message}`,
            timestamp: Date.now()
          }
        };
      }

    case ActionTypes.RESET_GAME:
      if (state.gameEngine) {
        state.gameEngine.resetGame();
      }
      return {
        ...state,
        gameState: state.gameEngine ? state.gameEngine.getGameState() : null,
        statusMessage: {
          type: STATUS_TYPES.INFO,
          message: '遊戲已重置',
          timestamp: Date.now()
        }
      };

    case ActionTypes.END_GAME:
      if (state.gameEngine) {
        state.gameEngine.endGame();
      }
      return {
        ...state,
        gameState: state.gameEngine ? state.gameEngine.getGameState() : null,
        statusMessage: {
          type: STATUS_TYPES.SUCCESS,
          message: '遊戲結束！查看最終排名',
          timestamp: Date.now()
        }
      };

    case ActionTypes.SET_STATUS:
      return {
        ...state,
        statusMessage: {
          ...action.payload,
          timestamp: Date.now()
        }
      };

    case ActionTypes.CLEAR_STATUS:
      return {
        ...state,
        statusMessage: null
      };

    case ActionTypes.SET_PROCESSING:
      return {
        ...state,
        isProcessing: action.payload
      };

    case ActionTypes.UPDATE_SETTINGS:
      return {
        ...state,
        settings: {
          ...state.settings,
          ...action.payload
        }
      };

    default:
      return state;
  }
}

// Provider component
export function GameProvider({ children }) {
  const [state, dispatch] = useReducer(gameReducer, initialState);

  // Actions
  const setMode = useCallback((mode) => {
    dispatch({ type: ActionTypes.SET_MODE, payload: mode });
  }, []);

  const setPlayerCount = useCallback((count) => {
    // Always set to 4 for fixed sequence, but we'll keep the function for compatibility
    dispatch({ type: ActionTypes.SET_PLAYER_COUNT, payload: 4 });
  }, []);

  const setPlayerNames = useCallback((names) => {
    dispatch({ type: ActionTypes.SET_PLAYER_NAMES, payload: names });
  }, []);

  const startGame = useCallback((playerNames) => {
    if (!playerNames || playerNames.length !== 4) {
      dispatch({
        type: ActionTypes.SET_STATUS,
        payload: {
          type: STATUS_TYPES.ERROR,
          message: '固定順序賽制需要恰好4位選手'
        }
      });
      return;
    }

    dispatch({ type: ActionTypes.START_GAME, payload: { playerNames } });
  }, []);

  const declareWinner = useCallback((winnerName) => {
    dispatch({ type: ActionTypes.DECLARE_WINNER, payload: { winnerName } });
  }, []);

  // Remove takeRest function as it's no longer needed
  const takeRest = useCallback((playerName) => {
    dispatch({
      type: ActionTypes.SET_STATUS,
      payload: {
        type: STATUS_TYPES.WARNING,
        message: '固定順序賽制無休息功能'
      }
    });
  }, []);

  const undoLastAction = useCallback(() => {
    dispatch({ type: ActionTypes.UNDO_ACTION });
  }, []);

  const resetGame = useCallback(() => {
    dispatch({ type: ActionTypes.RESET_GAME });
  }, []);

  const endGame = useCallback(() => {
    dispatch({ type: ActionTypes.END_GAME });
  }, []);

  const setStatus = useCallback((type, message) => {
    dispatch({ type: ActionTypes.SET_STATUS, payload: { type, message } });
  }, []);

  const clearStatus = useCallback(() => {
    dispatch({ type: ActionTypes.CLEAR_STATUS });
  }, []);

  const updateSettings = useCallback((newSettings) => {
    dispatch({ type: ActionTypes.UPDATE_SETTINGS, payload: newSettings });
  }, []);

  // Helper functions
  const getCurrentMatch = useCallback(() => {
    return state.gameState?.currentMatch || null;
  }, [state.gameState]);

  const getLeaderboard = useCallback(() => {
    return state.gameState?.leaderboard || [];
  }, [state.gameState]);

  const canPlayerRest = useCallback((playerName) => {
    // Always return false as there's no rest in fixed sequence
    return false;
  }, []);

  // Get tournament progress for fixed sequence
  const getTournamentProgress = useCallback(() => {
    return state.gameState?.tournamentProgress || null;
  }, [state.gameState]);

  // Get match sequence for fixed sequence
  const getMatchSequence = useCallback(() => {
    return state.gameState?.matchSequence || [];
  }, [state.gameState]);

  // Context value
  const contextValue = {
    // State
    ...state,
    
    // Actions
    setMode,
    setPlayerCount,
    setPlayerNames,
    startGame,
    declareWinner,
    takeRest, // Keep for compatibility but show warning
    undoLastAction,
    resetGame,
    endGame,
    setStatus,
    clearStatus,
    updateSettings,
    
    // Helpers
    getCurrentMatch,
    getLeaderboard,
    canPlayerRest,
    getTournamentProgress,
    getMatchSequence
  };

  return (
    <GameContext.Provider value={contextValue}>
      {children}
    </GameContext.Provider>
  );
}

// Hook to use the game context
export function useGame() {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
}

export default GameContext;
