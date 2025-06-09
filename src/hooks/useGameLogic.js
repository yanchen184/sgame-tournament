import React, { useEffect } from 'react';
import { useGame } from '../contexts/GameContext';
import { useRoomManager } from '../hooks/useRoomManager';

/**
 * Game logic hook that handles game operations and Firebase sync
 * @param {boolean} enableFirebase - Whether Firebase integration is enabled
 * @returns {Object} - Game control functions
 */
export const useGameLogic = (enableFirebase = true) => {
  const {
    // State
    isMultiplayer,
    currentFighters,
    gameEnded,
    playerCount,
    players,
    undoStack,
    
    // Actions
    declareWinnerByName,
    takeRest,
    continuePlay,
    endGame,
    undoLastAction,
    showStatus,
    syncRealtimeData
  } = useGame();

  const {
    // Room state
    realtimeGameData,
    
    // Room actions
    syncToRoom,
    endRoomAndGame
  } = useRoomManager(enableFirebase);

  // Sync realtime data to local state
  useEffect(() => {
    if (isMultiplayer && realtimeGameData) {
      console.log('Syncing realtime game data:', realtimeGameData);
      syncRealtimeData(realtimeGameData);
    }
  }, [realtimeGameData, isMultiplayer, syncRealtimeData]);

  // Legacy function for backwards compatibility with GameControls
  const declareWinner = async (winnerIndex) => {
    console.log('declareWinner called with index:', winnerIndex);
    console.log('Current fighters:', currentFighters.map(f => f?.name));
    
    const winnerName = currentFighters[winnerIndex - 1]?.name;
    console.log('Winner name resolved to:', winnerName);
    
    if (winnerName) {
      await handleDeclareWinner(winnerName);
    } else {
      console.error('Could not resolve winner name for index:', winnerIndex);
    }
  };

  // Handle declaring winner with Firebase sync
  const handleDeclareWinner = async (winnerName) => {
    if (!currentFighters[0] || !currentFighters[1] || gameEnded) return;

    const winner = currentFighters.find(fighter => fighter.name === winnerName);
    const loser = currentFighters.find(fighter => fighter.name !== winnerName);

    if (!winner || !loser) {
      console.error('Invalid winner selection');
      return;
    }

    // Declare winner in game state
    declareWinnerByName(winnerName);

    // Sync to Firebase if in multiplayer mode
    if (isMultiplayer) {
      await syncToRoom(true); // Use immediate sync for critical updates
    }

    showStatus(`🎉 ${winner.name} 獲勝！`, 'success');
  };

  // Handle take rest with Firebase sync
  const handleTakeRest = async () => {
    takeRest();

    // Sync to Firebase if in multiplayer mode
    if (isMultiplayer) {
      await syncToRoom(true);
    }

    showStatus(`😴 選擇休息並獲得1分`, 'info');
  };

  // Handle continue play with Firebase sync
  const handleContinuePlay = async () => {
    continuePlay();

    // Sync to Firebase if in multiplayer mode
    if (isMultiplayer) {
      await syncToRoom(true);
    }

    showStatus(`💪 選擇繼續比賽，開始新一輪挑戰！`, 'success');
  };

  // Handle undo with Firebase sync
  const handleUndo = async () => {
    if (undoStack.length === 0) return;

    undoLastAction();

    // Sync to Firebase if in multiplayer mode
    if (isMultiplayer) {
      await syncToRoom(true);
    }

    showStatus('↶ 已撤銷上一步操作', 'info');
  };

  // Handle end game with Firebase sync
  const handleEndGame = async () => {
    endGame();

    // End room if in multiplayer mode
    if (isMultiplayer) {
      await endRoomAndGame();
    }

    // Calculate final winner
    const finalRankedPlayers = [...players].sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return b.winStreak - a.winStreak;
    });

    showStatus(`🏁 比賽結束！🏆 冠軍：${finalRankedPlayers[0]?.name || 'Unknown'}！`, 'success', true);
  };

  return {
    // Game control functions
    declareWinner, // Legacy function for GameControls
    handleDeclareWinner,
    handleTakeRest,
    handleContinuePlay,
    handleUndo,
    handleEndGame,
    
    // Utility functions
    syncToRoom
  };
};

export default useGameLogic;
