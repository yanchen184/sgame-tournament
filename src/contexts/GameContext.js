/**
 * Enhanced Game Context - With Room Support and Visual Flow
 * Provides game state management with room functionality and streak-based gameplay
 */

import React, { createContext, useContext, useReducer, useCallback } from 'react';
import { FixedSequenceTournamentEngine } from '../gameEngines/FixedSequenceTournamentEngine';
import { APP_MODES, GAME_DEFAULTS, FIXED_SEQUENCE_CONFIG, STATUS_TYPES } from '../constants';

// Game Context
const GameContext = createContext();

// Initial state
const initialState = {
  // App mode management - Start with room browser
  currentMode: APP_MODES.ROOM_BROWSER,
  
  // Player management
  playerCount: GAME_DEFAULTS.DEFAULT_PLAYER_COUNT,
  playerNames: [...GAME_DEFAULTS.DEFAULT_PLAYER_NAMES.slice(0, GAME_DEFAULTS.DEFAULT_PLAYER_COUNT)],
  
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
  TAKE_REST: 'TAKE_REST',
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
      const newCount = action.payload;
      const newNames = [...GAME_DEFAULTS.DEFAULT_PLAYER_NAMES.slice(0, newCount)];
      // If we have existing names, preserve them
      if (state.playerNames.length > 0) {
        for (let i = 0; i < Math.min(newCount, state.playerNames.length); i++) {
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
      return {
        ...state,
        playerNames: action.payload
      };

    case ActionTypes.START_GAME:
      // Create players with IDs for Fixed Sequence Tournament
      const players = action.payload.playerNames.map((name, index) => ({
        id: `player_${index}`,
        name: name.trim(),
        position: index + 1
      }));
      
      const gameEngine = new FixedSequenceTournamentEngine(players);
      const validationResult = gameEngine.validatePlayers(players);
      
      if (!validationResult.isValid) {
        return {
          ...state,
          statusMessage: {
            type: STATUS_TYPES.ERROR,
            message: validationResult.errors.join(', '),
            timestamp: Date.now()
          }
        };
      }
      
      // Start tournament automatically
      gameEngine.startTournament();
      
      return {
        ...state,
        gameEngine,
        gameState: gameEngine.gameState,
        currentMode: APP_MODES.GAME
      };

    case ActionTypes.DECLARE_WINNER:
      if (!state.gameEngine) return state;
      
      try {
        state.gameEngine.processMatchResult(action.payload.winnerName);
        return {
          ...state,
          gameState: state.gameEngine.gameState,
          statusMessage: {
            type: STATUS_TYPES.SUCCESS,
            message: `${action.payload.winnerName} 獲勝！`,
            timestamp: Date.now()
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

    case ActionTypes.TAKE_REST:
      // Fixed Sequence Tournament does not support rest mechanism
      return {
        ...state,
        statusMessage: {
          type: STATUS_TYPES.WARNING,
          message: '固定順序賽制不支持休息機制',
          timestamp: Date.now()
        }
      };

    case ActionTypes.UNDO_ACTION:
      if (!state.gameEngine) return state;
      
      try {
        state.gameEngine.undoLastAction();
        return {
          ...state,
          gameState: state.gameEngine.gameState,
          statusMessage: {
            type: STATUS_TYPES.INFO,
            message: '已撤銷上一個動作',
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
        // Reset to initial state
        state.gameEngine.gameState = state.gameEngine.initializeGameState();
      }
      return {
        ...state,
        gameState: state.gameEngine ? state.gameEngine.gameState : null,
        statusMessage: {
          type: STATUS_TYPES.INFO,
          message: '遊戲已重置',
          timestamp: Date.now()
        }
      };

    case ActionTypes.END_GAME:
      if (state.gameEngine) {
        state.gameEngine.gameState.phase = 'finished';
      }
      return {
        ...state,
        gameState: state.gameEngine ? state.gameEngine.gameState : null,
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
    if (count >= GAME_DEFAULTS.MIN_PLAYER_COUNT && count <= GAME_DEFAULTS.MAX_PLAYER_COUNT) {
      dispatch({ type: ActionTypes.SET_PLAYER_COUNT, payload: count });
    }
  }, []);

  const setPlayerNames = useCallback((names) => {
    dispatch({ type: ActionTypes.SET_PLAYER_NAMES, payload: names });
  }, []);

  const startGame = useCallback((playerNames) => {
    if (!playerNames || playerNames.length < GAME_DEFAULTS.MIN_PLAYER_COUNT) {
      dispatch({
        type: ActionTypes.SET_STATUS,
        payload: {
          type: STATUS_TYPES.ERROR,
          message: `至少需要 ${GAME_DEFAULTS.MIN_PLAYER_COUNT} 位選手`
        }
      });
      return;
    }

    dispatch({ type: ActionTypes.START_GAME, payload: { playerNames } });
  }, []);

  const declareWinner = useCallback((winnerName) => {
    dispatch({ type: ActionTypes.DECLARE_WINNER, payload: { winnerName } });
  }, []);

  const takeRest = useCallback((playerName) => {
    dispatch({ type: ActionTypes.TAKE_REST, payload: { playerName } });
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
    return state.gameState?.standings || [];
  }, [state.gameState]);

  const canPlayerRest = useCallback((playerName) => {
    // Fixed Sequence Tournament does not support rest mechanism
    return false;
  }, []);

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
    takeRest,
    undoLastAction,
    resetGame,
    endGame,
    setStatus,
    clearStatus,
    updateSettings,
    
    // Helpers
    getCurrentMatch,
    getLeaderboard,
    canPlayerRest
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
