import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  addDoc, 
  query, 
  orderBy, 
  limit, 
  onSnapshot,
  serverTimestamp,
  where,
  getDocs
} from 'firebase/firestore';
import { db } from '../config/firebase';

// Collection names
const COLLECTIONS = {
  GAMES: 'games',
  ROOMS: 'rooms', // New collection for multiplayer rooms
  PLAYERS: 'players',
  MATCHES: 'matches'
};

/**
 * Game Management Service
 * Handles all Firebase operations for the tournament system
 * Enhanced with multiplayer room support
 */
class GameService {
  
  /**
   * Create a new game session
   * @param {Object} gameData - Initial game data
   * @returns {Promise<string>} - Game ID
   */
  async createGame(gameData) {
    try {
      console.log('Creating game with data:', gameData);
      console.log('Firestore db object:', db);
      
      const gamesRef = collection(db, COLLECTIONS.GAMES);
      console.log('Games collection reference:', gamesRef);
      
      const gameDoc = await addDoc(gamesRef, {
        ...gameData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        status: 'active'
      });
      
      console.log('Game created with ID:', gameDoc.id);
      return gameDoc.id;
    } catch (error) {
      console.error('Error creating game:', error);
      console.error('Error code:', error.code);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
      throw error;
    }
  }

  /**
   * Create a new multiplayer room
   * @param {Object} roomData - Initial room data
   * @returns {Promise<string>} - Room ID
   */
  async createRoom(roomData) {
    try {
      console.log('Creating room with data:', roomData);
      
      const roomsRef = collection(db, COLLECTIONS.ROOMS);
      const roomDoc = await addDoc(roomsRef, {
        ...roomData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        lastActivity: serverTimestamp(),
        status: 'active',
        isMultiplayer: true
      });
      
      console.log('Room created with ID:', roomDoc.id);
      return roomDoc.id;
    } catch (error) {
      console.error('Error creating room:', error);
      throw error;
    }
  }

  /**
   * Find room by room code
   * @param {string} roomCode - Room code to search for
   * @returns {Promise<string|null>} - Room ID or null if not found
   */
  async findRoomByCode(roomCode) {
    try {
      console.log('Finding room by code:', roomCode);
      
      const roomsRef = collection(db, COLLECTIONS.ROOMS);
      const q = query(
        roomsRef, 
        where('roomCode', '==', roomCode),
        where('status', '==', 'active')
      );
      
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        const roomDoc = querySnapshot.docs[0];
        console.log('Room found:', roomDoc.id);
        return roomDoc.id;
      }
      
      console.log('Room not found for code:', roomCode);
      return null;
    } catch (error) {
      console.error('Error finding room by code:', error);
      throw error;
    }
  }

  /**
   * Get room data
   * @param {string} roomId - Room ID
   * @returns {Promise<Object>} - Room data
   */
  async getRoom(roomId) {
    try {
      const roomRef = doc(db, COLLECTIONS.ROOMS, roomId);
      const roomSnap = await getDoc(roomRef);
      
      if (roomSnap.exists()) {
        return { id: roomSnap.id, ...roomSnap.data() };
      } else {
        throw new Error('Room not found');
      }
    } catch (error) {
      console.error('Error getting room:', error);
      throw error;
    }
  }

  /**
   * Get list of active rooms
   * @param {number} limitCount - Number of rooms to retrieve
   * @returns {Promise<Array>} - Array of active rooms
   */
  async getActiveRooms(limitCount = 20) {
    try {
      console.log('Getting active rooms');
      
      const roomsRef = collection(db, COLLECTIONS.ROOMS);
      const q = query(
        roomsRef,
        where('status', '==', 'active'),
        orderBy('lastActivity', 'desc'),
        limit(limitCount)
      );
      
      const querySnapshot = await getDocs(q);
      const rooms = [];
      
      querySnapshot.forEach((doc) => {
        const roomData = { id: doc.id, ...doc.data() };
        rooms.push({
          id: roomData.id,
          displayName: roomData.roomCode,
          roomCode: roomData.roomCode,
          playerCount: roomData.playerCount || 4,
          currentPlayers: roomData.playerNames || [],
          status: 'playing',
          created: roomData.createdAt?.toDate() || new Date(),
          lastActivity: roomData.lastActivity?.toDate() || new Date()
        });
      });
      
      console.log('Found active rooms:', rooms.length);
      return rooms;
    } catch (error) {
      console.error('Error getting active rooms:', error);
      throw error;
    }
  }

  /**
   * Get list of completed rooms for history
   * @param {number} limitCount - Number of rooms to retrieve
   * @returns {Promise<Array>} - Array of completed rooms
   */
  async getCompletedRooms(limitCount = 50) {
    try {
      console.log('Getting completed rooms for history');
      
      const roomsRef = collection(db, COLLECTIONS.ROOMS);
      const q = query(
        roomsRef,
        where('status', '==', 'completed'),
        orderBy('endedAt', 'desc'),
        limit(limitCount)
      );
      
      const querySnapshot = await getDocs(q);
      const rooms = [];
      
      querySnapshot.forEach((doc) => {
        const roomData = { id: doc.id, ...doc.data() };
        rooms.push({
          id: roomData.id,
          roomCode: roomData.roomCode,
          playerCount: roomData.playerCount || 4,
          playerNames: roomData.playerNames || [],
          finalResults: roomData.finalResults,
          created: roomData.createdAt?.toDate() || new Date(),
          ended: roomData.endedAt?.toDate() || new Date(),
          duration: roomData.endedAt && roomData.createdAt 
            ? roomData.endedAt.toDate() - roomData.createdAt.toDate()
            : 0,
          totalBattles: roomData.finalResults?.totalBattles || 0
        });
      });
      
      console.log('Found completed rooms:', rooms.length);
      return rooms;
    } catch (error) {
      console.error('Error getting completed rooms:', error);
      throw error;
    }
  }

  /**
   * Subscribe to real-time active rooms updates
   * @param {Function} callback - Callback function for updates
   * @param {Function} errorCallback - Error callback function
   * @param {number} limitCount - Number of rooms to retrieve
   * @returns {Function} - Unsubscribe function
   */
  subscribeToActiveRooms(callback, errorCallback, limitCount = 20) {
    try {
      console.log('Subscribing to active rooms updates');
      
      const roomsRef = collection(db, COLLECTIONS.ROOMS);
      const q = query(
        roomsRef,
        where('status', '==', 'active'),
        orderBy('lastActivity', 'desc'),
        limit(limitCount)
      );
      
      return onSnapshot(q, 
        (querySnapshot) => {
          console.log('Active rooms update received');
          const rooms = [];
          
          querySnapshot.forEach((doc) => {
            const roomData = { id: doc.id, ...doc.data() };
            rooms.push({
              id: roomData.id,
              displayName: roomData.roomCode,
              roomCode: roomData.roomCode,
              playerCount: roomData.playerCount || 4,
              currentPlayers: roomData.playerNames || [],
              status: 'playing',
              created: roomData.createdAt?.toDate() || new Date(),
              lastActivity: roomData.lastActivity?.toDate() || new Date()
            });
          });
          
          console.log('Real-time active rooms count:', rooms.length);
          callback(rooms);
        },
        (error) => {
          console.error('Error in active rooms subscription:', error);
          if (errorCallback) {
            errorCallback(error);
          }
        }
      );
    } catch (error) {
      console.error('Error subscribing to active rooms:', error);
      throw error;
    }
  }

  /**
   * Update room game state
   * @param {string} roomId - Room ID
   * @param {Object} gameState - Game state data
   */
  async updateRoomGameState(roomId, gameState) {
    try {
      console.log('Updating room game state:', roomId);
      
      const roomRef = doc(db, COLLECTIONS.ROOMS, roomId);
      await updateDoc(roomRef, {
        gameState: gameState,
        updatedAt: serverTimestamp(),
        lastActivity: serverTimestamp()
      });
      
      console.log('Room game state updated successfully');
    } catch (error) {
      console.error('Error updating room game state:', error);
      throw error;
    }
  }

  /**
   * Update room activity timestamp
   * @param {string} roomId - Room ID
   */
  async updateRoomActivity(roomId) {
    try {
      const roomRef = doc(db, COLLECTIONS.ROOMS, roomId);
      await updateDoc(roomRef, {
        lastActivity: serverTimestamp()
      });
    } catch (error) {
      console.error('Error updating room activity:', error);
      throw error;
    }
  }

  /**
   * Subscribe to real-time room updates
   * @param {string} roomId - Room ID
   * @param {Function} callback - Callback function for updates
   * @param {Function} errorCallback - Error callback function
   * @returns {Function} - Unsubscribe function
   */
  subscribeToRoom(roomId, callback, errorCallback) {
    try {
      console.log('Subscribing to room updates:', roomId);
      
      const roomRef = doc(db, COLLECTIONS.ROOMS, roomId);
      return onSnapshot(roomRef, (doc) => {
        if (doc.exists()) {
          console.log('Room update received:', doc.data());
          callback({ id: doc.id, ...doc.data() });
        } else {
          console.log('Room document does not exist');
          callback(null);
        }
      }, (error) => {
        console.error('Error in room subscription:', error);
        if (errorCallback) {
          errorCallback(error);
        }
      });
    } catch (error) {
      console.error('Error subscribing to room:', error);
      throw error;
    }
  }

  /**
   * End room and save final results
   * @param {string} roomId - Room ID
   * @param {Object} finalResults - Final room results
   */
  async endRoom(roomId, finalResults) {
    try {
      console.log('Ending room:', roomId, 'with results:', finalResults);
      
      const roomRef = doc(db, COLLECTIONS.ROOMS, roomId);
      await updateDoc(roomRef, {
        status: 'completed',
        finalResults: finalResults,
        endedAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        lastActivity: serverTimestamp()
      });
      
      console.log('Room ended successfully');
    } catch (error) {
      console.error('Error ending room:', error);
      throw error;
    }
  }

  /**
   * Update game state
   * @param {string} gameId - Game ID
   * @param {Object} updateData - Data to update
   */
  async updateGame(gameId, updateData) {
    try {
      console.log('Updating game:', gameId, 'with data:', updateData);
      
      const gameRef = doc(db, COLLECTIONS.GAMES, gameId);
      await updateDoc(gameRef, {
        ...updateData,
        updatedAt: serverTimestamp()
      });
      
      console.log('Game updated successfully');
    } catch (error) {
      console.error('Error updating game:', error);
      console.error('Error details:', {
        code: error.code,
        message: error.message,
        gameId: gameId
      });
      throw error;
    }
  }

  /**
   * Get game data
   * @param {string} gameId - Game ID
   * @returns {Promise<Object>} - Game data
   */
  async getGame(gameId) {
    try {
      const gameRef = doc(db, COLLECTIONS.GAMES, gameId);
      const gameSnap = await getDoc(gameRef);
      
      if (gameSnap.exists()) {
        return { id: gameSnap.id, ...gameSnap.data() };
      } else {
        throw new Error('Game not found');
      }
    } catch (error) {
      console.error('Error getting game:', error);
      throw error;
    }
  }

  /**
   * Save players data
   * @param {string} gameId - Game ID
   * @param {Array} players - Players array
   */
  async savePlayers(gameId, players) {
    try {
      console.log('Saving players for game:', gameId, 'players:', players);
      
      const gameRef = doc(db, COLLECTIONS.GAMES, gameId);
      await updateDoc(gameRef, {
        players: players,
        updatedAt: serverTimestamp()
      });
      
      console.log('Players saved successfully');
    } catch (error) {
      console.error('Error saving players:', error);
      console.error('Error details:', {
        code: error.code,
        message: error.message,
        gameId: gameId,
        playersCount: players.length
      });
      throw error;
    }
  }

  /**
   * Record a match result
   * @param {string} gameId - Game ID
   * @param {Object} matchData - Match data
   */
  async recordMatch(gameId, matchData) {
    try {
      console.log('Recording match for game:', gameId, 'match:', matchData);
      
      const matchesRef = collection(db, COLLECTIONS.MATCHES);
      await addDoc(matchesRef, {
        gameId: gameId,
        ...matchData,
        timestamp: serverTimestamp()
      });
      
      console.log('Match recorded successfully');
    } catch (error) {
      console.error('Error recording match:', error);
      console.error('Error details:', {
        code: error.code,
        message: error.message,
        gameId: gameId
      });
      throw error;
    }
  }

  /**
   * Get match history for a game
   * @param {string} gameId - Game ID
   * @param {number} limitCount - Number of matches to retrieve
   * @returns {Promise<Array>} - Array of matches
   */
  async getMatchHistory(gameId, limitCount = 50) {
    try {
      const matchesRef = collection(db, COLLECTIONS.MATCHES);
      const q = query(
        matchesRef,
        orderBy('timestamp', 'desc'),
        limit(limitCount)
      );
      
      return new Promise((resolve, reject) => {
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
          const matches = [];
          querySnapshot.forEach((doc) => {
            if (doc.data().gameId === gameId) {
              matches.push({ id: doc.id, ...doc.data() });
            }
          });
          resolve(matches);
        }, reject);
        
        // Return unsubscribe function for cleanup
        return unsubscribe;
      });
    } catch (error) {
      console.error('Error getting match history:', error);
      throw error;
    }
  }

  /**
   * Subscribe to real-time game updates
   * @param {string} gameId - Game ID
   * @param {Function} callback - Callback function for updates
   * @returns {Function} - Unsubscribe function
   */
  subscribeToGame(gameId, callback) {
    try {
      console.log('Subscribing to game updates:', gameId);
      
      const gameRef = doc(db, COLLECTIONS.GAMES, gameId);
      return onSnapshot(gameRef, (doc) => {
        if (doc.exists()) {
          console.log('Game update received:', doc.data());
          callback({ id: doc.id, ...doc.data() });
        } else {
          console.log('Game document does not exist');
          callback(null);
        }
      }, (error) => {
        console.error('Error in game subscription:', error);
        throw error;
      });
    } catch (error) {
      console.error('Error subscribing to game:', error);
      throw error;
    }
  }

  /**
   * End game and save final results
   * @param {string} gameId - Game ID
   * @param {Object} finalResults - Final game results
   */
  async endGame(gameId, finalResults) {
    try {
      console.log('Ending game:', gameId, 'with results:', finalResults);
      
      const gameRef = doc(db, COLLECTIONS.GAMES, gameId);
      await updateDoc(gameRef, {
        status: 'completed',
        finalResults: finalResults,
        endedAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      
      console.log('Game ended successfully');
    } catch (error) {
      console.error('Error ending game:', error);
      throw error;
    }
  }

  /**
   * Get game statistics
   * @param {string} gameId - Game ID
   * @returns {Promise<Object>} - Game statistics
   */
  async getGameStats(gameId) {
    try {
      const game = await this.getGame(gameId);
      const matches = await this.getMatchHistory(gameId);
      
      // Calculate statistics
      const stats = {
        totalMatches: matches.length,
        gameScore: game.players || [],
        matchHistory: matches,
        gameStatus: game.status,
        gameDuration: game.endedAt ? 
          new Date(game.endedAt.toDate()) - new Date(game.createdAt.toDate()) : 
          new Date() - new Date(game.createdAt.toDate())
      };
      
      return stats;
    } catch (error) {
      console.error('Error getting game stats:', error);
      throw error;
    }
  }
}

// Create and export a singleton instance
const gameService = new GameService();
export default gameService;