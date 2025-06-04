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
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../config/firebase';

// Collection names
const COLLECTIONS = {
  GAMES: 'games',
  PLAYERS: 'players',
  MATCHES: 'matches'
};

/**
 * Game Management Service
 * Handles all Firebase operations for the tournament system
 */
class GameService {
  
  /**
   * Check if Firebase is available
   */
  isFirebaseAvailable() {
    return db !== null && db !== undefined;
  }

  /**
   * Create a new game session
   * @param {Object} gameData - Initial game data
   * @returns {Promise<string>} - Game ID
   */
  async createGame(gameData) {
    if (!this.isFirebaseAvailable()) {
      console.warn('Firebase not available, skipping game creation');
      return 'offline-' + Date.now();
    }

    try {
      const gamesRef = collection(db, COLLECTIONS.GAMES);
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
      // Return offline ID instead of throwing error
      return 'offline-' + Date.now();
    }
  }

  /**
   * Update game state
   * @param {string} gameId - Game ID
   * @param {Object} updateData - Data to update
   */
  async updateGame(gameId, updateData) {
    if (!this.isFirebaseAvailable() || gameId.startsWith('offline-')) {
      console.warn('Firebase not available or offline mode, skipping game update');
      return;
    }

    try {
      const gameRef = doc(db, COLLECTIONS.GAMES, gameId);
      await updateDoc(gameRef, {
        ...updateData,
        updatedAt: serverTimestamp()
      });
      
      console.log('Game updated successfully');
    } catch (error) {
      console.error('Error updating game:', error);
      // Don't throw error, just log it
    }
  }

  /**
   * Get game data
   * @param {string} gameId - Game ID
   * @returns {Promise<Object>} - Game data
   */
  async getGame(gameId) {
    if (!this.isFirebaseAvailable() || gameId.startsWith('offline-')) {
      console.warn('Firebase not available or offline mode');
      return { id: gameId, status: 'offline' };
    }

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
      return { id: gameId, status: 'error' };
    }
  }

  /**
   * Save players data
   * @param {string} gameId - Game ID
   * @param {Array} players - Players array
   */
  async savePlayers(gameId, players) {
    if (!this.isFirebaseAvailable() || gameId.startsWith('offline-')) {
      console.warn('Firebase not available or offline mode, skipping players save');
      return;
    }

    try {
      const gameRef = doc(db, COLLECTIONS.GAMES, gameId);
      await updateDoc(gameRef, {
        players: players,
        updatedAt: serverTimestamp()
      });
      
      console.log('Players saved successfully');
    } catch (error) {
      console.error('Error saving players:', error);
      // Don't throw error, just log it
    }
  }

  /**
   * Record a match result
   * @param {string} gameId - Game ID
   * @param {Object} matchData - Match data
   */
  async recordMatch(gameId, matchData) {
    if (!this.isFirebaseAvailable() || gameId.startsWith('offline-')) {
      console.warn('Firebase not available or offline mode, skipping match record');
      return;
    }

    try {
      const matchesRef = collection(db, COLLECTIONS.MATCHES);
      await addDoc(matchesRef, {
        gameId: gameId,
        ...matchData,
        timestamp: serverTimestamp()
      });
      
      console.log('Match recorded successfully');
    } catch (error) {
      console.error('Error recording match:', error);
      // Don't throw error, just log it
    }
  }

  /**
   * Get match history for a game
   * @param {string} gameId - Game ID
   * @param {number} limitCount - Number of matches to retrieve
   * @returns {Promise<Array>} - Array of matches
   */
  async getMatchHistory(gameId, limitCount = 50) {
    if (!this.isFirebaseAvailable() || gameId.startsWith('offline-')) {
      console.warn('Firebase not available or offline mode');
      return [];
    }

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
        }, (error) => {
          console.error('Error in match history snapshot:', error);
          resolve([]); // Return empty array instead of rejecting
        });
        
        // Return unsubscribe function for cleanup
        return unsubscribe;
      });
    } catch (error) {
      console.error('Error getting match history:', error);
      return [];
    }
  }

  /**
   * Subscribe to real-time game updates
   * @param {string} gameId - Game ID
   * @param {Function} callback - Callback function for updates
   * @returns {Function} - Unsubscribe function
   */
  subscribeToGame(gameId, callback) {
    if (!this.isFirebaseAvailable() || gameId.startsWith('offline-')) {
      console.warn('Firebase not available or offline mode');
      // Return a no-op unsubscribe function
      return () => {};
    }

    try {
      const gameRef = doc(db, COLLECTIONS.GAMES, gameId);
      return onSnapshot(gameRef, (doc) => {
        if (doc.exists()) {
          callback({ id: doc.id, ...doc.data() });
        } else {
          callback(null);
        }
      }, (error) => {
        console.error('Error in game subscription:', error);
        callback(null);
      });
    } catch (error) {
      console.error('Error subscribing to game:', error);
      return () => {};
    }
  }

  /**
   * End game and save final results
   * @param {string} gameId - Game ID
   * @param {Object} finalResults - Final game results
   */
  async endGame(gameId, finalResults) {
    if (!this.isFirebaseAvailable() || gameId.startsWith('offline-')) {
      console.warn('Firebase not available or offline mode, skipping game end');
      return;
    }

    try {
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
      // Don't throw error, just log it
    }
  }

  /**
   * Get game statistics
   * @param {string} gameId - Game ID
   * @returns {Promise<Object>} - Game statistics
   */
  async getGameStats(gameId) {
    if (!this.isFirebaseAvailable() || gameId.startsWith('offline-')) {
      console.warn('Firebase not available or offline mode');
      return {
        totalMatches: 0,
        gameScore: [],
        matchHistory: [],
        gameStatus: 'offline',
        gameDuration: 0
      };
    }

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
      return {
        totalMatches: 0,
        gameScore: [],
        matchHistory: [],
        gameStatus: 'error',
        gameDuration: 0
      };
    }
  }
}

// Create and export a singleton instance
const gameService = new GameService();
export default gameService;