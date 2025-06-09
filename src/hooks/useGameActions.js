import { useGame } from '../contexts/GameContext';
import { useRoomManager } from './useRoomManager';
import { useMatchManager } from './useMatchManager';

/**
 * Custom hook for handling game actions
 * Manages winner declaration, rest options, undo, and game ending
 */
export const useGameActions = (enableFirebase = false) => {
  const {
    // State
    isMultiplayer,
    players,
    currentFighters,
    battleCount,
    gameHistory,
    undoStack,
    streakWinner,
    currentChampion,
    championBeatenOpponents,
    playerCount,
    playerNames,
    gameEnded,
    
    // Actions
    declareWinnerByName: contextDeclareWinner,
    takeRest,
    continuePlay,
    undoLastAction,
    endGame: contextEndGame,
    showStatus
  } = useGame();

  const { syncToRoom, endRoomAndGame } = useRoomManager(enableFirebase);

  /**
   * Declare winner by player name
   * Uses the context's declareWinnerByName function
   */
  const declareWinnerByName = async (winnerName) => {
    if (!currentFighters[0] || !currentFighters[1] || gameEnded) return;

    console.log(`Declaring winner: ${winnerName}`);
    
    // Use context function
    contextDeclareWinner(winnerName);
    
    // Sync to room if multiplayer
    if (isMultiplayer) {
      await syncToRoom(true); // immediate sync
    }

    showStatus(`🎉 ${winnerName} 獲勝！`, 'success');
  };

  /**
   * Handle player taking rest option
   */
  const handleTakeRest = async () => {
    if (!streakWinner) return;

    console.log('Handling take rest for:', streakWinner.name);
    
    // Use context function
    takeRest();
    
    // Sync to room if multiplayer
    if (isMultiplayer) {
      await syncToRoom(true); // immediate sync
    }

    showStatus(`😴 ${streakWinner.name} 選擇休息並獲得1分，下場休息，其他人開始比賽`, 'info');
  };

  /**
   * Handle continue playing option
   */
  const handleContinuePlay = async () => {
    if (!streakWinner) return;
    
    console.log('Handling continue play for:', streakWinner.name);
    
    const championName = streakWinner.name;
    
    // Use context function
    continuePlay();
    
    // Sync to room if multiplayer
    if (isMultiplayer) {
      await syncToRoom(true); // immediate sync
    }
    
    showStatus(`💪 ${championName} 選擇繼續比賽，開始新一輪挑戰！`, 'success');
  };

  /**
   * Undo last action
   */
  const handleUndo = async () => {
    if (undoStack.length === 0) return;

    // Use context function
    undoLastAction();
    
    // Sync to room if multiplayer
    if (isMultiplayer) {
      await syncToRoom(true); // immediate sync
    }

    showStatus('↶ 已撤銷上一步操作', 'info');
  };

  /**
   * End the current game
   */
  const endGame = async () => {
    // Use context function
    contextEndGame();
    
    // End room if multiplayer
    if (isMultiplayer) {
      await endRoomAndGame();
    }

    // Get winner name from current players state
    const finalRankedPlayers = [...players].sort((a, b) => {
      if (b.score !== a.score) {
        return b.score - a.score;
      }
      return b.winStreak - a.winStreak;
    });
    
    const winnerName = finalRankedPlayers[0]?.name || 'Unknown';
    showStatus(`🏁 比賽結束！🏆 冠軍：${winnerName}！`, 'success', true);
  };

  return {
    declareWinnerByName,
    handleTakeRest,
    handleContinuePlay,
    handleUndo,
    endGame
  };
};
