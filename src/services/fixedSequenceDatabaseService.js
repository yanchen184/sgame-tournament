import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  query, 
  where, 
  getDocs, 
  orderBy, 
  serverTimestamp,
  runTransaction
} from 'firebase/firestore';
import { db } from '../config/firebase';

/**
 * Database Service for Fixed Sequence Tournament
 * Handles match result recording and synchronization across multiple devices
 */
export class FixedSequenceDatabaseService {
  
  /**
   * Create a new tournament session in database
   * @param {Object} tournamentData - Tournament configuration and initial state
   * @returns {Promise<string>} Tournament session ID
   */
  static async createTournamentSession(tournamentData) {
    try {
      const sessionRef = doc(collection(db, 'tournament-sessions'));
      const sessionData = {
        ...tournamentData,
        id: sessionRef.id,
        type: 'fixed-sequence',
        created: serverTimestamp(),
        lastActivity: serverTimestamp(),
        status: 'active',
        currentSequenceIndex: 0,
        completedMatches: [],
        version: 1 // For optimistic locking
      };
      
      await setDoc(sessionRef, sessionData);
      console.log('Tournament session created with ID:', sessionRef.id);
      return sessionRef.id;
    } catch (error) {
      console.error('Error creating tournament session:', error);
      throw error;
    }
  }

  /**
   * Record a match result with optimistic locking
   * @param {string} sessionId - Tournament session ID
   * @param {Object} matchResult - Match result data
   * @returns {Promise<boolean>} Success status
   */
  static async recordMatchResult(sessionId, matchResult) {
    try {
      return await runTransaction(db, async (transaction) => {
        const sessionRef = doc(db, 'tournament-sessions', sessionId);
        const sessionDoc = await transaction.get(sessionRef);
        
        if (!sessionDoc.exists()) {
          throw new Error('Tournament session not found');
        }
        
        const sessionData = sessionDoc.data();
        
        // Check if match has already been recorded (prevent duplicates)
        const existingMatch = sessionData.completedMatches?.find(
          match => match.sequenceIndex === matchResult.sequenceIndex
        );
        
        if (existingMatch) {
          console.log('Match already recorded, skipping...');
          return false;
        }
        
        // Update session with new match result
        const updatedMatches = [...(sessionData.completedMatches || []), matchResult];
        const newSequenceIndex = matchResult.sequenceIndex + 1;
        
        transaction.update(sessionRef, {
          completedMatches: updatedMatches,
          currentSequenceIndex: newSequenceIndex,
          lastActivity: serverTimestamp(),
          version: sessionData.version + 1,
          status: newSequenceIndex >= 6 ? 'completed' : 'active' // 6 matches total
        });
        
        // Also create individual match record for detailed tracking
        const matchRef = doc(collection(db, 'match-results'));
        transaction.set(matchRef, {
          ...matchResult,
          sessionId: sessionId,
          id: matchRef.id,
          timestamp: serverTimestamp()
        });
        
        return true;
      });
    } catch (error) {
      console.error('Error recording match result:', error);
      throw error;
    }
  }

  /**
   * Get tournament session data
   * @param {string} sessionId - Tournament session ID
   * @returns {Promise<Object|null>} Session data or null if not found
   */
  static async getTournamentSession(sessionId) {
    try {
      const sessionRef = doc(db, 'tournament-sessions', sessionId);
      const sessionSnap = await getDoc(sessionRef);
      
      if (sessionSnap.exists()) {
        return sessionSnap.data();
      }
      return null;
    } catch (error) {
      console.error('Error getting tournament session:', error);
      throw error;
    }
  }

  /**
   * Get all match results for a tournament session
   * @param {string} sessionId - Tournament session ID
   * @returns {Promise<Array>} Array of match results
   */
  static async getSessionMatchResults(sessionId) {
    try {
      const matchQuery = query(
        collection(db, 'match-results'),
        where('sessionId', '==', sessionId),
        orderBy('sequenceIndex', 'asc')
      );
      
      const querySnapshot = await getDocs(matchQuery);
      return querySnapshot.docs.map(doc => doc.data());
    } catch (error) {
      console.error('Error getting session match results:', error);
      throw error;
    }
  }

  /**
   * Update tournament session status
   * @param {string} sessionId - Tournament session ID
   * @param {string} status - New status ('active', 'completed', 'cancelled')
   * @returns {Promise<void>}
   */
  static async updateSessionStatus(sessionId, status) {
    try {
      const sessionRef = doc(db, 'tournament-sessions', sessionId);
      await updateDoc(sessionRef, {
        status: status,
        lastActivity: serverTimestamp()
      });
    } catch (error) {
      console.error('Error updating session status:', error);
      throw error;
    }
  }

  /**
   * Get active tournament sessions
   * @param {number} limit - Maximum number of sessions to return
   * @returns {Promise<Array>} Array of active sessions
   */
  static async getActiveSessions(limit = 20) {
    try {
      const sessionsQuery = query(
        collection(db, 'tournament-sessions'),
        where('type', '==', 'fixed-sequence'),
        where('status', '==', 'active'),
        orderBy('lastActivity', 'desc'),
        orderBy('created', 'desc')
      );
      
      const querySnapshot = await getDocs(sessionsQuery);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        created: doc.data().created?.toDate() || new Date(),
        lastActivity: doc.data().lastActivity?.toDate() || new Date()
      }));
    } catch (error) {
      console.error('Error getting active sessions:', error);
      // Fallback query without compound index
      try {
        const fallbackQuery = query(
          collection(db, 'tournament-sessions'),
          where('status', '==', 'active')
        );
        const fallbackSnapshot = await getDocs(fallbackQuery);
        return fallbackSnapshot.docs
          .map(doc => ({
            id: doc.id,
            ...doc.data(),
            created: doc.data().created?.toDate() || new Date(),
            lastActivity: doc.data().lastActivity?.toDate() || new Date()
          }))
          .filter(session => session.type === 'fixed-sequence')
          .sort((a, b) => new Date(b.lastActivity) - new Date(a.lastActivity))
          .slice(0, limit);
      } catch (fallbackError) {
        console.error('Fallback query also failed:', fallbackError);
        throw error;
      }
    }
  }

  /**
   * Subscribe to tournament session updates
   * @param {string} sessionId - Tournament session ID
   * @param {Function} onUpdate - Callback function for updates
   * @param {Function} onError - Callback function for errors
   * @returns {Function} Unsubscribe function
   */
  static subscribeToSession(sessionId, onUpdate, onError) {
    try {
      const sessionRef = doc(db, 'tournament-sessions', sessionId);
      
      const unsubscribe = onSnapshot(
        sessionRef,
        (doc) => {
          if (doc.exists()) {
            const data = doc.data();
            onUpdate({
              ...data,
              created: data.created?.toDate() || new Date(),
              lastActivity: data.lastActivity?.toDate() || new Date()
            });
          } else {
            onUpdate(null);
          }
        },
        (error) => {
          console.error('Error in session subscription:', error);
          if (onError) onError(error);
        }
      );
      
      return unsubscribe;
    } catch (error) {
      console.error('Error setting up session subscription:', error);
      if (onError) onError(error);
      return () => {};
    }
  }

  /**
   * Calculate tournament standings from match results
   * @param {Array} players - Original player list
   * @param {Array} matchResults - Completed match results
   * @returns {Array} Sorted player standings
   */
  static calculateStandings(players, matchResults = []) {
    const standings = players.map(player => ({
      ...player,
      wins: 0,
      losses: 0,
      points: 0,
      matchesPlayed: 0
    }));

    // Process each match result
    matchResults.forEach(match => {
      const winnerStanding = standings.find(p => p.id === match.winner.id);
      const loserStanding = standings.find(p => p.id === match.loser.id);

      if (winnerStanding && loserStanding) {
        winnerStanding.wins++;
        winnerStanding.points++;
        winnerStanding.matchesPlayed++;

        loserStanding.losses++;
        loserStanding.matchesPlayed++;
      }
    });

    // Sort by points (wins), then by fewer losses
    return standings.sort((a, b) => {
      if (b.points !== a.points) {
        return b.points - a.points;
      }
      if (a.losses !== b.losses) {
        return a.losses - b.losses;
      }
      return a.position - b.position; // Original position as tie-breaker
    });
  }

  /**
   * Validate match result against sequence
   * @param {Object} matchResult - Match result to validate
   * @param {Array} sequence - Expected sequence pattern
   * @param {Array} players - Player list
   * @returns {Object} Validation result
   */
  static validateMatchResult(matchResult, sequence, players) {
    const errors = [];

    // Check sequence index
    if (matchResult.sequenceIndex < 0 || matchResult.sequenceIndex >= sequence.length) {
      errors.push('Invalid sequence index');
    }

    // Check pattern match
    const expectedPattern = sequence[matchResult.sequenceIndex];
    if (matchResult.pattern !== expectedPattern) {
      errors.push(`Expected pattern ${expectedPattern}, got ${matchResult.pattern}`);
    }

    // Check players exist
    const winnerExists = players.some(p => p.id === matchResult.winner.id);
    const loserExists = players.some(p => p.id === matchResult.loser.id);
    
    if (!winnerExists) {
      errors.push('Winner not found in player list');
    }
    if (!loserExists) {
      errors.push('Loser not found in player list');
    }

    // Check winner and loser are different
    if (matchResult.winner.id === matchResult.loser.id) {
      errors.push('Winner and loser cannot be the same player');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

export default FixedSequenceDatabaseService;
