/**
 * Base Tournament Engine Interface
 * All tournament types must implement this interface
 */
export class BaseTournamentEngine {
  constructor(players = [], options = {}) {
    this.players = [...players];
    this.options = { ...this.getDefaultOptions(), ...options };
    this.gameState = this.initializeGameState();
  }

  /**
   * Get default options for this tournament type
   * @returns {Object} Default options
   */
  getDefaultOptions() {
    return {
      allowUndo: true,
      maxUndoSteps: 10,
      autoAdvance: false
    };
  }

  /**
   * Initialize the game state
   * @returns {Object} Initial game state
   */
  initializeGameState() {
    return {
      phase: 'setup', // setup, playing, finished
      currentMatch: null,
      matchHistory: [],
      standings: this.createInitialStandings(),
      round: 1,
      undoStack: []
    };
  }

  /**
   * Create initial standings/bracket
   * @returns {Array} Initial player standings
   */
  createInitialStandings() {
    return this.players.map((player, index) => ({
      ...player,
      position: index + 1,
      isEliminated: false,
      currentRound: 1
    }));
  }

  /**
   * Start the tournament
   * @returns {Object} Updated game state
   */
  startTournament() {
    this.gameState.phase = 'playing';
    this.gameState.currentMatch = this.generateNextMatch();
    return this.gameState;
  }

  /**
   * Generate the next match
   * Must be implemented by subclasses
   * @returns {Object|null} Next match or null if tournament is finished
   */
  generateNextMatch() {
    throw new Error('generateNextMatch must be implemented by subclass');
  }

  /**
   * Process match result
   * Must be implemented by subclasses
   * @param {string} winnerName - Name of the winner
   * @param {Object} matchData - Additional match data
   * @returns {Object} Updated game state
   */
  processMatchResult(winnerName, matchData = {}) {
    throw new Error('processMatchResult must be implemented by subclass');
  }

  /**
   * Check if tournament is finished
   * Must be implemented by subclasses
   * @returns {boolean} True if tournament is finished
   */
  isTournamentFinished() {
    throw new Error('isTournamentFinished must be implemented by subclass');
  }

  /**
   * Get current tournament status
   * @returns {Object} Tournament status information
   */
  getTournamentStatus() {
    return {
      phase: this.gameState.phase,
      currentMatch: this.gameState.currentMatch,
      round: this.gameState.round,
      totalMatches: this.gameState.matchHistory.length,
      standings: this.gameState.standings,
      isFinished: this.isTournamentFinished(),
      canUndo: this.gameState.undoStack.length > 0
    };
  }

  /**
   * Save current state for undo functionality
   */
  saveStateForUndo() {
    if (this.options.allowUndo) {
      const currentState = JSON.parse(JSON.stringify(this.gameState));
      this.gameState.undoStack.push(currentState);
      
      // Keep only last N states to prevent memory issues
      if (this.gameState.undoStack.length > this.options.maxUndoSteps) {
        this.gameState.undoStack.shift();
      }
    }
  }

  /**
   * Undo last action
   * @returns {Object} Restored game state
   */
  undoLastAction() {
    if (!this.options.allowUndo || this.gameState.undoStack.length === 0) {
      throw new Error('Cannot undo: no previous state available');
    }

    const previousState = this.gameState.undoStack.pop();
    this.gameState = { ...previousState };
    return this.gameState;
  }

  /**
   * End tournament manually
   * @returns {Object} Final game state
   */
  endTournament() {
    this.gameState.phase = 'finished';
    return this.gameState;
  }

  /**
   * Get final results
   * @returns {Object} Final tournament results
   */
  getFinalResults() {
    return {
      winner: this.getWinner(),
      standings: this.getFinalStandings(),
      totalMatches: this.gameState.matchHistory.length,
      matchHistory: this.gameState.matchHistory
    };
  }

  /**
   * Get tournament winner
   * Must be implemented by subclasses
   * @returns {Object|null} Winner player object
   */
  getWinner() {
    throw new Error('getWinner must be implemented by subclass');
  }

  /**
   * Get final standings
   * Must be implemented by subclasses
   * @returns {Array} Final standings array
   */
  getFinalStandings() {
    throw new Error('getFinalStandings must be implemented by subclass');
  }

  /**
   * Get available actions for current state
   * @returns {Array} Array of available action names
   */
  getAvailableActions() {
    const actions = [];
    
    if (this.gameState.phase === 'setup') {
      actions.push('startTournament');
    } else if (this.gameState.phase === 'playing') {
      if (this.gameState.currentMatch) {
        actions.push('declareWinner');
      }
      if (this.gameState.undoStack.length > 0) {
        actions.push('undoAction');
      }
      actions.push('endTournament');
    }
    
    return actions;
  }

  /**
   * Validate if an action can be performed
   * @param {string} actionName - Name of the action
   * @returns {boolean} True if action is valid
   */
  canPerformAction(actionName) {
    return this.getAvailableActions().includes(actionName);
  }

  /**
   * Get tournament type information
   * Must be implemented by subclasses
   * @returns {Object} Tournament type info
   */
  static getTournamentInfo() {
    throw new Error('getTournamentInfo must be implemented by subclass');
  }
}