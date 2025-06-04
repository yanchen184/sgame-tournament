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