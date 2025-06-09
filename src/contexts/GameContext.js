import React, { createContext, useContext, useReducer, useCallback } from 'react';
import { 
  shuffleArray, 
  createInitialPlayers,
  findNextChallenger,
  setupMatchBetweenOthers,
  createMatchResult
} from '../utils/gameUtils';

// Game state constants
export const APP_MODES = {
  ROOM_BROWSER: 'room-browser',
  PLAYER_SETUP: 'player-setup',
  GAME: 'game',
  HISTORY: 'history'
};

// Action types
export const GAME_ACTIONS = {
  SET_APP_MODE: 'SET_APP_MODE',
  SET_MULTIPLAYER: 'SET_MULTIPLAYER',
  SET_JOINING_ROOM: 'SET_JOINING_ROOM',
  SETUP_PLAYERS: 'SETUP_PLAYERS',
  START_GAME: 'START_GAME',
  SET_CURRENT_FIGHTERS: 'SET_CURRENT_FIGHTERS',
  DECLARE_WINNER: 'DECLARE_WINNER',
  SET_SHOW_REST_OPTION: 'SET_SHOW_REST_OPTION',
  TAKE_REST: 'TAKE_REST',
  CONTINUE_PLAY: 'CONTINUE_PLAY',
  END_GAME: 'END_GAME',
  SET_SHOW_HISTORY: 'SET_SHOW_HISTORY',
  SET_STATUS_MESSAGE: 'SET_STATUS_MESSAGE',
  CLEAR_STATUS_MESSAGE: 'CLEAR_STATUS_MESSAGE',
  SAVE_STATE_TO_UNDO: 'SAVE_STATE_TO_UNDO',
  UNDO_LAST_ACTION: 'UNDO_LAST_ACTION',
  SYNC_REALTIME_DATA: 'SYNC_REALTIME_DATA',
  RESET_GAME: 'RESET_GAME'
};

// Initial state
const initialState = {
  // App mode
  appMode: APP_MODES.ROOM_BROWSER,
  
  // Room state
  isMultiplayer: false,
  isJoiningRoom: false,
  
  // Game setup
  gameSetup: false,
  playerCount: 4,
  playerNames: ['bob', 'jimmy', 'white', 'dada'],
  
  // Game state
  players: [],
  currentFighters: [null, null],
  gameStarted: false,
  gameEnded: false,
  battleCount: 0,
  gameHistory: [],
  
  // Champion tracking
  currentChampion: null,
  championBeatenOpponents: [],
  
  // Rest system
  showRestOption: false,
  streakWinner: null,
  
  // UI state
  showHistory: false,
  statusMessage: null,
  
  // Animation state
  showTransition: false,
  transitionData: null,
  transitionType: null,
  isTransitioning: false,
  
  // Undo system
  undoStack: []
};

// Game reducer
const gameReducer = (state, action) => {
  switch (action.type) {
    case GAME_ACTIONS.SET_APP_MODE:
      return { ...state, appMode: action.payload };
      
    case GAME_ACTIONS.SET_MULTIPLAYER:
      return { ...state, isMultiplayer: action.payload };
      
    case GAME_ACTIONS.SET_JOINING_ROOM:
      return { ...state, isJoiningRoom: action.payload };
      
    case GAME_ACTIONS.SETUP_PLAYERS: {
      const { names, count } = action.payload;
      const initialPlayers = createInitialPlayers(names, count);
      const shuffledPlayers = shuffleArray(initialPlayers).map((player, index) => ({
        ...player,
        position: index
      }));
      
      return {
        ...state,
        playerCount: count,
        playerNames: names,
        players: shuffledPlayers,
        gameSetup: true,
        gameStarted: true,
        gameEnded: false,
        currentChampion: shuffledPlayers[0],
        championBeatenOpponents: [],
        currentFighters: [shuffledPlayers[0], shuffledPlayers[1]],
        battleCount: 0,
        gameHistory: [],
        undoStack: []
      };
    }
    
    case GAME_ACTIONS.SET_CURRENT_FIGHTERS:
      return { ...state, currentFighters: action.payload };
      
    case GAME_ACTIONS.DECLARE_WINNER: {
      const { winnerName } = action.payload;
      const winner = state.currentFighters.find(fighter => fighter.name === winnerName);
      const loser = state.currentFighters.find(fighter => fighter.name !== winnerName);
      
      if (!winner || !loser) return state;
      
      // Update players
      const updatedPlayers = state.players.map(player => {
        if (player.id === winner.id) {
          return {
            ...player,
            score: player.score + 1,
            winStreak: player.winStreak + 1
          };
        } else if (player.id === loser.id) {
          return { ...player, winStreak: 0 };
        }
        return player;
      });
      
      // Create match result
      const matchResult = createMatchResult(
        state.battleCount + 1,
        winner,
        loser,
        updatedPlayers.find(p => p.id === winner.id).score
      );
      
      // Champion tracking logic
      let newChampion = updatedPlayers.find(p => p.id === winner.id);
      let newBeatenOpponents = [...state.championBeatenOpponents];
      let shouldShowRest = false;
      let newCurrentFighters = state.currentFighters;
      
      // If winner was already the champion, continue their streak
      if (winner.id === state.currentChampion?.id) {
        if (!newBeatenOpponents.some(op => op.id === loser.id)) {
          newBeatenOpponents.push(loser);
        }
      } else {
        // New champion takes over - reset beaten opponents list
        newBeatenOpponents = [loser];
      }
      
      // Check if champion has beaten all other players (only for 4+ players)
      const otherPlayers = updatedPlayers.filter(p => p.id !== winner.id);
      const hasBeatenAll = otherPlayers.every(player => 
        newBeatenOpponents.some(beaten => beaten.id === player.id)
      );
      
      if (hasBeatenAll && state.playerCount >= 4) {
        shouldShowRest = true;
      } else {
        // Find next challenger for the champion
        const nextChallenger = findNextChallenger(updatedPlayers, newChampion, newBeatenOpponents);
        if (nextChallenger) {
          const winnerIndex = state.currentFighters.findIndex(f => f.id === winner.id);
          const loserIndex = state.currentFighters.findIndex(f => f.id === loser.id);
          
          newCurrentFighters = [...state.currentFighters];
          newCurrentFighters[loserIndex] = nextChallenger;
        } else {
          // No more challengers, should end game
          return {
            ...state,
            players: updatedPlayers,
            battleCount: state.battleCount + 1,
            gameHistory: [...state.gameHistory, matchResult],
            gameEnded: true,
            gameStarted: false
          };
        }
      }
      
      return {
        ...state,
        players: updatedPlayers,
        battleCount: state.battleCount + 1,
        gameHistory: [...state.gameHistory, matchResult],
        currentChampion: newChampion,
        championBeatenOpponents: newBeatenOpponents,
        currentFighters: shouldShowRest ? state.currentFighters : newCurrentFighters,
        showRestOption: shouldShowRest,
        streakWinner: shouldShowRest ? newChampion : null
      };
    }
    
    case GAME_ACTIONS.TAKE_REST: {
      if (!state.streakWinner) return state;
      
      const updatedPlayers = state.players.map(player => {
        if (player.id === state.streakWinner.id) {
          return { 
            ...player, 
            score: player.score + 1,
            winStreak: 0
          };
        }
        return player;
      });
      
      const restRecord = createMatchResult(
        state.battleCount + 1,
        state.streakWinner,
        null,
        null,
        'rest'
      );
      
      const restedChampionId = state.streakWinner.id;
      const newCurrentFighters = setupMatchBetweenOthers(
        updatedPlayers, 
        restedChampionId, 
        state.championBeatenOpponents
      );
      
      if (!newCurrentFighters) {
        // Cannot setup new match, end game
        return {
          ...state,
          gameEnded: true,
          gameStarted: false
        };
      }
      
      return {
        ...state,
        players: updatedPlayers,
        battleCount: state.battleCount + 1,
        gameHistory: [...state.gameHistory, restRecord],
        currentFighters: newCurrentFighters,
        currentChampion: newCurrentFighters[0],
        championBeatenOpponents: [],
        showRestOption: false,
        streakWinner: null
      };
    }
    
    case GAME_ACTIONS.CONTINUE_PLAY: {
      if (!state.streakWinner) return state;
      
      const champion = state.streakWinner;
      const nextChallenger = findNextChallenger(state.players, champion, []);
      
      if (!nextChallenger) {
        return {
          ...state,
          gameEnded: true,
          gameStarted: false
        };
      }
      
      return {
        ...state,
        currentFighters: [champion, nextChallenger],
        currentChampion: champion,
        championBeatenOpponents: [],
        showRestOption: false,
        streakWinner: null
      };
    }
    
    case GAME_ACTIONS.END_GAME: {
      const finalRankedPlayers = [...state.players].sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        return b.winStreak - a.winStreak;
      });
      
      const finalRecord = createMatchResult(
        state.battleCount + 1,
        finalRankedPlayers[0],
        null,
        null,
        'final'
      );
      
      return {
        ...state,
        players: finalRankedPlayers,
        battleCount: state.battleCount + 1,
        gameHistory: [...state.gameHistory, finalRecord],
        gameEnded: true,
        gameStarted: false,
        showRestOption: false,
        streakWinner: null,
        currentChampion: null,
        championBeatenOpponents: []
      };
    }
    
    case GAME_ACTIONS.SET_SHOW_HISTORY:
      return { ...state, showHistory: action.payload };
      
    case GAME_ACTIONS.SET_STATUS_MESSAGE:
      return { ...state, statusMessage: action.payload };
      
    case GAME_ACTIONS.CLEAR_STATUS_MESSAGE:
      return { ...state, statusMessage: null };
      
    case GAME_ACTIONS.SAVE_STATE_TO_UNDO: {
      const currentState = {
        players: [...state.players],
        currentFighters: [...state.currentFighters],
        battleCount: state.battleCount,
        gameHistory: [...state.gameHistory],
        showRestOption: state.showRestOption,
        streakWinner: state.streakWinner,
        currentChampion: state.currentChampion,
        championBeatenOpponents: [...state.championBeatenOpponents]
      };
      
      return {
        ...state,
        undoStack: [...state.undoStack, currentState]
      };
    }
    
    case GAME_ACTIONS.UNDO_LAST_ACTION: {
      if (state.undoStack.length === 0) return state;
      
      const lastState = state.undoStack[state.undoStack.length - 1];
      return {
        ...state,
        players: lastState.players,
        currentFighters: lastState.currentFighters,
        battleCount: lastState.battleCount,
        gameHistory: lastState.gameHistory,
        showRestOption: lastState.showRestOption,
        streakWinner: lastState.streakWinner,
        currentChampion: lastState.currentChampion,
        championBeatenOpponents: lastState.championBeatenOpponents,
        undoStack: state.undoStack.slice(0, -1)
      };
    }
    
    case GAME_ACTIONS.SYNC_REALTIME_DATA: {
      const { realtimeGameData } = action.payload;
      return {
        ...state,
        ...realtimeGameData
      };
    }
    
    case GAME_ACTIONS.RESET_GAME:
      return {
        ...initialState,
        appMode: APP_MODES.ROOM_BROWSER
      };
      
    default:
      return state;
  }
};

// Create context
const GameContext = createContext();

// Game provider component
export const GameProvider = ({ children }) => {
  const [state, dispatch] = useReducer(gameReducer, initialState);
  
  // Action creators
  const setAppMode = useCallback((mode) => {
    dispatch({ type: GAME_ACTIONS.SET_APP_MODE, payload: mode });
  }, []);
  
  const setMultiplayer = useCallback((isMultiplayer) => {
    dispatch({ type: GAME_ACTIONS.SET_MULTIPLAYER, payload: isMultiplayer });
  }, []);
  
  const setJoiningRoom = useCallback((isJoining) => {
    dispatch({ type: GAME_ACTIONS.SET_JOINING_ROOM, payload: isJoining });
  }, []);
  
  const setupPlayers = useCallback((names, count) => {
    dispatch({ type: GAME_ACTIONS.SETUP_PLAYERS, payload: { names, count } });
  }, []);
  
  const setCurrentFighters = useCallback((fighters) => {
    dispatch({ type: GAME_ACTIONS.SET_CURRENT_FIGHTERS, payload: fighters });
  }, []);
  
  const declareWinnerByName = useCallback((winnerName) => {
    // Save state to undo stack before making changes
    dispatch({ type: GAME_ACTIONS.SAVE_STATE_TO_UNDO });
    dispatch({ type: GAME_ACTIONS.DECLARE_WINNER, payload: { winnerName } });
  }, []);
  
  const takeRest = useCallback(() => {
    dispatch({ type: GAME_ACTIONS.SAVE_STATE_TO_UNDO });
    dispatch({ type: GAME_ACTIONS.TAKE_REST });
  }, []);
  
  const continuePlay = useCallback(() => {
    dispatch({ type: GAME_ACTIONS.CONTINUE_PLAY });
  }, []);
  
  const endGame = useCallback(() => {
    dispatch({ type: GAME_ACTIONS.END_GAME });
  }, []);
  
  const setShowHistory = useCallback((show) => {
    dispatch({ type: GAME_ACTIONS.SET_SHOW_HISTORY, payload: show });
  }, []);
  
  const showStatus = useCallback((message, type = 'info', persistent = false) => {
    dispatch({ 
      type: GAME_ACTIONS.SET_STATUS_MESSAGE, 
      payload: { message, type, persistent } 
    });
    
    if (!persistent) {
      setTimeout(() => {
        dispatch({ type: GAME_ACTIONS.CLEAR_STATUS_MESSAGE });
      }, 5000);
    }
  }, []);
  
  const clearStatus = useCallback(() => {
    dispatch({ type: GAME_ACTIONS.CLEAR_STATUS_MESSAGE });
  }, []);
  
  const undoLastAction = useCallback(() => {
    dispatch({ type: GAME_ACTIONS.UNDO_LAST_ACTION });
  }, []);
  
  const syncRealtimeData = useCallback((realtimeGameData) => {
    dispatch({ type: GAME_ACTIONS.SYNC_REALTIME_DATA, payload: { realtimeGameData } });
  }, []);
  
  const resetGame = useCallback(() => {
    dispatch({ type: GAME_ACTIONS.RESET_GAME });
  }, []);
  
  const value = {
    // State
    ...state,
    
    // Actions
    setAppMode,
    setMultiplayer,
    setJoiningRoom,
    setupPlayers,
    setCurrentFighters,
    declareWinnerByName,
    takeRest,
    continuePlay,
    endGame,
    setShowHistory,
    showStatus,
    clearStatus,
    undoLastAction,
    syncRealtimeData,
    resetGame
  };
  
  return (
    <GameContext.Provider value={value}>
      {children}
    </GameContext.Provider>
  );
};

// Hook to use game context
export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};

export default GameContext;
