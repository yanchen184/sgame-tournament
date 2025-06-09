import { generateRoomNumber } from '../utils/gameUtils';
import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  query, 
  where, 
  getDocs, 
  onSnapshot, 
  orderBy, 
  limit,
  serverTimestamp,
  deleteField
} from 'firebase/firestore';
import { db } from '../config/firebase';

/**
 * Room service for handling multiplayer room operations
 */
export class RoomService {
  /**
   * Handle room creation
   * @param {Function} createRoom - Firebase room creation function
   * @param {Object} gameState - Current game state
   * @param {Function} showStatus - Status message function
   * @returns {Promise<Object|null>} - Room result or null if failed
   */
  static async handleCreateRoom(createRoom, gameState, showStatus) {
    try {
      const roomNumber = await generateRoomNumber();
      const roomResult = await createRoom({
        gameName: `競技房間 ${roomNumber}`,
        players: gameState.players,
        gameType: 'tournament',
        playerNames: gameState.playerNames,
        playerCount: gameState.playerCount,
        roomNumber: roomNumber,
        gameState: {
          ...gameState,
          roomNumber: roomNumber,
          undoStack: []
        }
      });
      
      if (roomResult) {
        showStatus(`🎮 房間創建成功！房間號: ${roomResult.roomCode}`, 'success');
        return roomResult;
      }
    } catch (error) {
      console.error('Failed to create room:', error);
      showStatus('❌ 創建房間失敗，切換到本地模式', 'warning');
      throw error;
    }
    return null;
  }

  /**
   * Handle room joining
   * @param {Function} joinRoom - Firebase room join function
   * @param {string} roomCodeOrId - Room code or ID to join
   * @param {Function} showStatus - Status message function
   * @returns {Promise<Object|null>} - Room game data or null if failed
   */
  static async handleJoinRoom(joinRoom, roomCodeOrId, showStatus) {
    try {
      showStatus('🔗 加入房間中...', 'info');
      
      const roomGameData = await joinRoom(roomCodeOrId);
      if (roomGameData && roomGameData.gameState) {
        showStatus(`🎉 成功加入房間！`, 'success');
        return roomGameData;
      } else {
        showStatus('❌ 找不到該房間或房間已結束', 'error');
        return null;
      }
    } catch (error) {
      console.error('Failed to join room:', error);
      showStatus('❌ 加入房間失敗', 'error');
      return null;
    }
  }

  /**
   * Sync game state to room
   * @param {Function} updateRoomGameState - Firebase room update function
   * @param {Object} gameState - Current game state
   * @param {boolean} immediate - Whether to sync immediately
   * @param {Function} showStatus - Status message function
   */
  static async syncGameStateToRoom(updateRoomGameState, gameState, immediate = false, showStatus) {
    try {
      await updateRoomGameState(gameState, immediate);
    } catch (error) {
      console.error('Failed to sync game state to room:', error);
      showStatus('⚠️ 同步失敗，可能會有延遲', 'warning');
    }
  }

  /**
   * Extract game state from room data for local sync
   * @param {Object} roomGameData - Room game data from Firebase
   * @returns {Object} - Extracted game state
   */
  static extractGameStateFromRoom(roomGameData) {
    console.log('Extracting game state from room data:', roomGameData);
    
    // Check if gameState exists in roomGameData
    const gameState = roomGameData.gameState || roomGameData;
    
    console.log('Game state found:', gameState);
    
    const extractedState = {
      playerCount: gameState.playerCount || roomGameData.playerCount || 4,
      playerNames: gameState.playerNames || roomGameData.playerNames || [],
      players: gameState.players || roomGameData.players || [],
      currentFighters: gameState.currentFighters || [null, null],
      gameStarted: gameState.gameStarted || false,
      battleCount: gameState.battleCount || 0,
      gameHistory: gameState.gameHistory || [],
      gameEnded: gameState.gameEnded || false,
      showRestOption: gameState.showRestOption || false,
      streakWinner: gameState.streakWinner || null,
      currentChampion: gameState.currentChampion || null,
      championBeatenOpponents: gameState.championBeatenOpponents || [],
      undoStack: gameState.undoStack || []
    };
    
    console.log('Extracted state:', extractedState);
    return extractedState;
  }
}

/**
 * Game logic service for handling game operations
 */
export class GameLogicService {
  /**
   * Setup initial match between first two players
   * @param {Array<Object>} playerList - List of players
   * @returns {Array<Object>} - Initial fighters array
   */
  static setupInitialMatch(playerList = []) {
    console.log('Setting up initial match with players:', playerList.map(p => p.name));
    
    const availablePlayers = playerList.filter(p => p);
    if (availablePlayers.length >= 2) {
      const sortedAvailable = availablePlayers.sort((a, b) => a.position - b.position);
      const initialFighters = [sortedAvailable[0], sortedAvailable[1]];
      console.log('Initial fighters:', initialFighters.map(f => f.name));
      return initialFighters;
    }
    return [null, null];
  }

  /**
   * Handle legacy declareWinner function for backwards compatibility
   * @param {number} winnerIndex - Index of winner (1 or 2)
   * @param {Array<Object>} currentFighters - Current fighters array
   * @param {Function} declareWinnerByName - Function to declare winner by name
   */
  static handleLegacyDeclareWinner(winnerIndex, currentFighters, declareWinnerByName) {
    console.log('declareWinner called with index:', winnerIndex);
    console.log('Current fighters:', currentFighters.map(f => f?.name));
    
    const winnerName = currentFighters[winnerIndex - 1]?.name;
    console.log('Winner name resolved to:', winnerName);
    
    if (winnerName) {
      declareWinnerByName(winnerName);
    } else {
      console.error('Could not resolve winner name for index:', winnerIndex);
    }
  }

  /**
   * Calculate final game results
   * @param {Array<Object>} players - Array of players
   * @param {number} battleCount - Total battle count
   * @param {Array<Object>} gameHistory - Game history array
   * @returns {Object} - Final results object
   */
  static calculateFinalResults(players, battleCount, gameHistory) {
    const finalRankedPlayers = [...players].sort((a, b) => {
      if (b.score !== a.score) {
        return b.score - a.score;
      }
      return b.winStreak - a.winStreak;
    });
    
    return {
      players: finalRankedPlayers,
      totalBattles: battleCount,
      gameHistory,
      endTime: new Date(),
      winner: finalRankedPlayers[0],
      status: 'completed'
    };
  }

  /**
   * Check if game should end (no more possible matches)
   * @param {Array<Object>} players - Array of players
   * @param {Object} currentChampion - Current champion
   * @param {Array<Object>} championBeatenOpponents - Beaten opponents
   * @returns {boolean} - Whether game should end
   */
  static shouldEndGame(players, currentChampion, championBeatenOpponents) {
    if (!currentChampion) return true;
    
    const otherPlayers = players.filter(p => p.id !== currentChampion.id);
    const hasBeatenAll = otherPlayers.every(player => 
      championBeatenOpponents.some(beaten => beaten.id === player.id)
    );
    
    return hasBeatenAll && players.length < 4; // Only end if less than 4 players
  }
}

/**
 * Status message service for handling UI messages
 */
export class StatusService {
  /**
   * Create status message object
   * @param {string} message - Message text
   * @param {string} type - Message type ('info', 'success', 'warning', 'error')
   * @param {boolean} persistent - Whether message should persist
   * @returns {Object} - Status message object
   */
  static createStatusMessage(message, type = 'info', persistent = false) {
    return {
      message,
      type,
      persistent,
      timestamp: Date.now()
    };
  }

  /**
   * Get status message for game events
   * @param {string} eventType - Type of event
   * @param {Object} data - Event data
   * @returns {Object} - Status message
   */
  static getGameEventMessage(eventType, data) {
    switch (eventType) {
      case 'PLAYER_SETUP':
        return this.createStatusMessage(
          `🎮 ${data.count}人比賽開始！準備迎戰`, 
          'success'
        );
        
      case 'WINNER_DECLARED':
        return this.createStatusMessage(
          `🎉 ${data.winnerName} 獲勝！`, 
          'success'
        );
        
      case 'STREAK_COMPLETE':
        return this.createStatusMessage(
          `🏆 ${data.winnerName} 完成一輪挑戰！可以選擇休息獲得1分或繼續比賽`, 
          'warning', 
          true
        );
        
      case 'TAKE_REST':
        return this.createStatusMessage(
          `😴 ${data.playerName} 選擇休息並獲得1分，下場休息，其他人開始比賽`, 
          'info'
        );
        
      case 'CONTINUE_PLAY':
        return this.createStatusMessage(
          `💪 ${data.playerName} 選擇繼續比賽，開始新一輪挑戰！`, 
          'success'
        );
        
      case 'GAME_END':
        return this.createStatusMessage(
          `🏁 比賽結束！🏆 冠軍：${data.winnerName}！`, 
          'success', 
          true
        );
        
      case 'UNDO_ACTION':
        return this.createStatusMessage(
          '↶ 已撤銷上一步操作', 
          'info'
        );
        
      case 'ROOM_CREATED':
        return this.createStatusMessage(
          `🎮 房間創建成功！房間號: ${data.roomCode}`, 
          'success'
        );
        
      case 'ROOM_JOINED':
        return this.createStatusMessage(
          `🎉 成功加入房間 ${data.roomCode}！`, 
          'success'
        );
        
      case 'RETURN_HOME':
        return this.createStatusMessage(
          '🏠 已返回房間選擇', 
          'info'
        );
        
      default:
        return this.createStatusMessage(data.message || 'Unknown event', 'info');
    }
  }
}

/**
 * Game state service for handling game state operations with real Firebase
 */
export class GameStateService {
  /**
   * Create a new room in Firebase
   */
  static async createRoom(roomData) {
    try {
      const roomRef = doc(collection(db, 'rooms'));
      const roomWithMetadata = {
        ...roomData,
        id: roomRef.id,
        created: serverTimestamp(),
        lastActivity: serverTimestamp(),
        status: 'playing', // Set as 'playing' from start
        syncVersion: 1
      };
      
      await setDoc(roomRef, roomWithMetadata);
      console.log('Room created with ID:', roomRef.id);
      return roomRef.id;
    } catch (error) {
      console.error('Error creating room:', error);
      throw error;
    }
  }

  /**
   * Find room by room code
   */
  static async findRoomByCode(code) {
    try {
      // Search for both active and playing rooms
      const activeQuery = query(
        collection(db, 'rooms'),
        where('roomCode', '==', code),
        where('status', '==', 'active')
      );
      
      const playingQuery = query(
        collection(db, 'rooms'),
        where('roomCode', '==', code),
        where('status', '==', 'playing')
      );
      
      const [activeSnapshot, playingSnapshot] = await Promise.all([
        getDocs(activeQuery),
        getDocs(playingQuery)
      ]);
      
      if (!activeSnapshot.empty) {
        return activeSnapshot.docs[0].id;
      }
      
      if (!playingSnapshot.empty) {
        return playingSnapshot.docs[0].id;
      }
      
      return null;
    } catch (error) {
      console.error('Error finding room by code:', error);
      throw error;
    }
  }

  /**
   * Get room data by ID
   */
  static async getRoom(roomId) {
    try {
      const roomRef = doc(db, 'rooms', roomId);
      const roomSnap = await getDoc(roomRef);
      
      if (roomSnap.exists()) {
        return roomSnap.data();
      }
      return null;
    } catch (error) {
      console.error('Error getting room:', error);
      throw error;
    }
  }

  /**
   * Update room activity timestamp
   */
  static async updateRoomActivity(roomId) {
    try {
      const roomRef = doc(db, 'rooms', roomId);
      await updateDoc(roomRef, {
        lastActivity: serverTimestamp()
      });
    } catch (error) {
      console.error('Error updating room activity:', error);
      throw error;
    }
  }

  /**
   * Get active rooms (both active and playing status)
   */
  static async getActiveRooms() {
    try {
      // 簡化查詢，避免複合索引需求
      // 只按狀態查詢，在客戶端排序
      const playingQuery = query(
        collection(db, 'rooms'),
        where('status', '==', 'playing'),
        limit(20)
      );
      
      const activeQuery = query(
        collection(db, 'rooms'),
        where('status', '==', 'active'),
        limit(20)
      );
      
      const [playingSnapshot, activeSnapshot] = await Promise.all([
        getDocs(playingQuery),
        getDocs(activeQuery)
      ]);
      
      const playingRooms = playingSnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          displayName: data.roomCode || doc.id,
          roomCode: data.roomCode || doc.id,
          playerCount: data.playerNames?.length || 0,
          currentPlayers: data.playerNames || [],
          status: 'playing',
          created: data.created?.toDate() || new Date(),
          lastActivity: data.lastActivity?.toDate() || new Date(),
          ...data
        };
      });
      
      const activeRooms = activeSnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          displayName: data.roomCode || doc.id,
          roomCode: data.roomCode || doc.id,
          playerCount: data.playerNames?.length || 0,
          currentPlayers: data.playerNames || [],
          status: 'playing',
          created: data.created?.toDate() || new Date(),
          lastActivity: data.lastActivity?.toDate() || new Date(),
          ...data
        };
      });
      
      // 合併並去重
      const allRooms = [...playingRooms, ...activeRooms];
      const uniqueRooms = allRooms.filter((room, index, self) => 
        index === self.findIndex(r => r.id === room.id)
      );
      
      // 在客戶端按最後活動時間排序
      return uniqueRooms.sort((a, b) => 
        new Date(b.lastActivity) - new Date(a.lastActivity)
      );
    } catch (error) {
      console.error('Error getting active rooms:', error);
      throw error;
    }
  }

  /**
   * Update room game state immediately (for critical updates)
   */
  static async updateRoomGameStateImmediate(roomId, gameState) {
    try {
      const roomRef = doc(db, 'rooms', roomId);
      const currentDoc = await getDoc(roomRef);
      const currentSyncVersion = currentDoc.exists() ? (currentDoc.data().syncVersion || 0) : 0;
      
      await updateDoc(roomRef, {
        gameState: gameState,
        lastActivity: serverTimestamp(),
        syncVersion: currentSyncVersion + 1
      });
    } catch (error) {
      console.error('Error updating room game state immediately:', error);
      throw error;
    }
  }

  /**
   * Update room game state (debounced)
   */
  static async updateRoomGameState(roomId, gameState) {
    // For now, just use immediate update
    return this.updateRoomGameStateImmediate(roomId, gameState);
  }

  /**
   * End a room
   */
  static async endRoom(roomId, finalResults) {
    try {
      const roomRef = doc(db, 'rooms', roomId);
      await updateDoc(roomRef, {
        status: 'completed',
        ended: serverTimestamp(),
        finalResults: finalResults,
        lastActivity: serverTimestamp()
      });
    } catch (error) {
      console.error('Error ending room:', error);
      throw error;
    }
  }

  /**
   * Subscribe to room updates
   */
  static subscribeToRoom(roomId, onUpdate, onError) {
    try {
      const roomRef = doc(db, 'rooms', roomId);
      
      const unsubscribe = onSnapshot(
        roomRef,
        (doc) => {
          if (doc.exists()) {
            onUpdate(doc.data());
          } else {
            onUpdate(null);
          }
        },
        (error) => {
          console.error('Error in room subscription:', error);
          if (onError) onError(error);
        }
      );
      
      return unsubscribe;
    } catch (error) {
      console.error('Error setting up room subscription:', error);
      if (onError) onError(error);
      return () => {};
    }
  }

  /**
   * Subscribe to active rooms list updates
   */
  static subscribeToActiveRooms(onUpdate, onError) {
    try {
      // 簡化查詢，避免複合索引
      const playingQuery = query(
        collection(db, 'rooms'),
        where('status', '==', 'playing'),
        limit(20)
      );
      
      const unsubscribe = onSnapshot(
        playingQuery,
        (querySnapshot) => {
          const rooms = querySnapshot.docs.map(doc => {
            const data = doc.data();
            return {
              id: doc.id,
              displayName: data.roomCode || doc.id,
              roomCode: data.roomCode || doc.id,
              playerCount: data.playerNames?.length || 0,
              currentPlayers: data.playerNames || [],
              status: 'playing',
              created: data.created?.toDate() || new Date(),
              lastActivity: data.lastActivity?.toDate() || new Date(),
              ...data
            };
          });
          
          // 在客戶端按最後活動時間排序
          const sortedRooms = rooms.sort((a, b) => 
            new Date(b.lastActivity) - new Date(a.lastActivity)
          );
          
          console.log('Real-time rooms update:', sortedRooms.length, 'rooms');
          onUpdate(sortedRooms);
        },
        (error) => {
          console.error('Error in active rooms subscription:', error);
          if (onError) onError(error);
        }
      );
      
      return unsubscribe;
    } catch (error) {
      console.error('Error setting up active rooms subscription:', error);
      if (onError) onError(error);
      return () => {};
    }
  }

  /**
   * Create a new game session
   */
  static async createGame(initialGameData) {
    try {
      const gameRef = doc(collection(db, 'games'));
      const gameWithMetadata = {
        ...initialGameData,
        id: gameRef.id,
        created: serverTimestamp(),
        lastActivity: serverTimestamp()
      };
      
      await setDoc(gameRef, gameWithMetadata);
      return gameRef.id;
    } catch (error) {
      console.error('Error creating game:', error);
      throw error;
    }
  }

  /**
   * Update game state
   */
  static async updateGame(gameId, gameState) {
    try {
      const gameRef = doc(db, 'games', gameId);
      await updateDoc(gameRef, {
        gameState: gameState,
        lastActivity: serverTimestamp()
      });
    } catch (error) {
      console.error('Error updating game:', error);
      throw error;
    }
  }

  /**
   * Save players data
   */
  static async savePlayers(gameId, players) {
    try {
      const gameRef = doc(db, 'games', gameId);
      await updateDoc(gameRef, {
        players: players,
        lastActivity: serverTimestamp()
      });
    } catch (error) {
      console.error('Error saving players:', error);
      throw error;
    }
  }

  /**
   * Record a match result
   */
  static async recordMatch(gameId, matchData) {
    try {
      const gameRef = doc(db, 'games', gameId);
      const gameDoc = await getDoc(gameRef);
      
      if (gameDoc.exists()) {
        const currentHistory = gameDoc.data().gameHistory || [];
        await updateDoc(gameRef, {
          gameHistory: [...currentHistory, matchData],
          lastActivity: serverTimestamp()
        });
      }
    } catch (error) {
      console.error('Error recording match:', error);
      throw error;
    }
  }

  /**
   * End a game
   */
  static async endGame(gameId, finalResults) {
    try {
      const gameRef = doc(db, 'games', gameId);
      await updateDoc(gameRef, {
        status: 'completed',
        ended: serverTimestamp(),
        finalResults: finalResults,
        lastActivity: serverTimestamp()
      });
    } catch (error) {
      console.error('Error ending game:', error);
      throw error;
    }
  }

  /**
   * Get game data by ID
   */
  static async getGame(gameId) {
    try {
      const gameRef = doc(db, 'games', gameId);
      const gameSnap = await getDoc(gameRef);
      
      if (gameSnap.exists()) {
        return gameSnap.data();
      }
      return null;
    } catch (error) {
      console.error('Error getting game:', error);
      throw error;
    }
  }

  /**
   * Subscribe to game updates
   */
  static subscribeToGame(gameId, onUpdate) {
    try {
      const gameRef = doc(db, 'games', gameId);
      
      const unsubscribe = onSnapshot(
        gameRef,
        (doc) => {
          if (doc.exists()) {
            onUpdate(doc.data());
          } else {
            onUpdate(null);
          }
        },
        (error) => {
          console.error('Error in game subscription:', error);
        }
      );
      
      return unsubscribe;
    } catch (error) {
      console.error('Error setting up game subscription:', error);
      return () => {};
    }
  }

  /**
   * Get completed rooms with limit
   */
  static async getCompletedRooms(limitCount = 50) {
    try {
      const q = query(
        collection(db, 'rooms'),
        where('status', '==', 'completed'),
        orderBy('ended', 'desc'),
        limit(limitCount)
      );
      
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          // Calculate duration if both created and ended timestamps exist
          duration: data.ended && data.created ? 
            data.ended.toMillis() - data.created.toMillis() : null
        };
      });
    } catch (error) {
      console.error('Error getting completed rooms:', error);
      throw error;
    }
  }
}

// Create service instance with additional methods
const gameService = {
  ...GameStateService,
  
  // Convenience methods
  createRoom: GameStateService.createRoom,
  findRoomByCode: GameStateService.findRoomByCode,
  getRoom: GameStateService.getRoom,
  updateRoomActivity: GameStateService.updateRoomActivity,
  getActiveRooms: GameStateService.getActiveRooms,
  updateRoomGameStateImmediate: GameStateService.updateRoomGameStateImmediate,
  updateRoomGameState: GameStateService.updateRoomGameState,
  endRoom: GameStateService.endRoom,
  subscribeToRoom: GameStateService.subscribeToRoom,
  subscribeToActiveRooms: GameStateService.subscribeToActiveRooms,
  
  // Game methods
  createGame: GameStateService.createGame,
  updateGame: GameStateService.updateGame,
  savePlayers: GameStateService.savePlayers,
  recordMatch: GameStateService.recordMatch,
  endGame: GameStateService.endGame,
  getGame: GameStateService.getGame,
  subscribeToGame: GameStateService.subscribeToGame,
  getCompletedRooms: GameStateService.getCompletedRooms
};

export default gameService;
