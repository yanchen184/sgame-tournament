/**
 * Fixed Sequence Tournament Game Engine (Modified from StreakGameEngine)
 * Focus on fixed sequence battle order: AB -> CD -> CA -> BD -> BC -> AD
 * Removes streak-based rest mechanics for simplified gameplay
 */

export class StreakGameEngine {
  constructor(players) {
    // Validate input - require exactly 4 players for fixed sequence
    if (!Array.isArray(players) || players.length !== 4) {
      throw new Error('Exactly 4 players required for fixed sequence tournament');
    }

    // Create players with labels A, B, C, D
    this.players = players.map((name, index) => ({
      id: index,
      name: name.trim(),
      label: String.fromCharCode(65 + index), // A, B, C, D
      score: 0,
      wins: 0,
      losses: 0,
      matchesPlayed: 0,
      isActive: false,
      position: index
    }));

    // Fixed sequence pattern: AB, CD, CA, BD, BC, AD
    this.fixedSequence = ['AB', 'CD', 'CA', 'BD', 'BC', 'AD'];
    this.currentSequenceIndex = 0;
    this.completedMatches = [];
    this.gameHistory = [];
    
    // Initialize first match
    this.currentMatch = this._generateCurrentMatch();
    this.isGameStarted = true;
    this.isGameFinished = false;
  }

  /**
   * Process match result when a player wins
   */
  declareWinner(winnerName) {
    if (this.isGameFinished) {
      throw new Error('Game has already finished');
    }

    if (this.currentSequenceIndex >= this.fixedSequence.length) {
      throw new Error('All matches have been completed');
    }

    const winner = this.players.find(p => p.name === winnerName);
    const loser = this.currentMatch.player1.name === winnerName 
      ? this.currentMatch.player2 
      : this.currentMatch.player1;

    if (!winner || !loser) {
      throw new Error('Invalid winner name');
    }

    // Update winner stats
    winner.score += 1; // Simple scoring: 1 point per win
    winner.wins += 1;
    winner.matchesPlayed += 1;

    // Update loser stats
    loser.losses += 1;
    loser.matchesPlayed += 1;

    // Record match result
    const matchResult = {
      id: this.gameHistory.length + 1,
      matchNumber: this.currentSequenceIndex + 1,
      pattern: this.fixedSequence[this.currentSequenceIndex],
      sequenceIndex: this.currentSequenceIndex,
      fighter1: this.currentMatch.player1,
      fighter2: this.currentMatch.player2,
      winner: winner.name,
      loser: loser.name,
      winnerLabel: winner.label,
      loserLabel: loser.label,
      timestamp: Date.now()
    };

    // Add to completed matches and history
    this.completedMatches.push(matchResult);
    this.gameHistory.push(matchResult);

    // Move to next match in sequence
    this.currentSequenceIndex++;

    // Check if tournament is finished
    if (this.currentSequenceIndex >= this.fixedSequence.length) {
      this.isGameFinished = true;
      this.currentMatch = null;
      this.players.forEach(player => player.isActive = false);
    } else {
      // Generate next match
      this.currentMatch = this._generateCurrentMatch();
    }

    return {
      winner,
      loser,
      canTakeRest: false, // No rest option in fixed sequence
      isGameFinished: this.isGameFinished
    };
  }

  /**
   * Generate current match based on sequence
   */
  _generateCurrentMatch() {
    if (this.currentSequenceIndex >= this.fixedSequence.length) {
      return null;
    }

    const pattern = this.fixedSequence[this.currentSequenceIndex];
    const [label1, label2] = pattern.split('');
    
    const player1 = this.players.find(p => p.label === label1);
    const player2 = this.players.find(p => p.label === label2);

    if (!player1 || !player2) {
      throw new Error(`Unable to find players for pattern: ${pattern}`);
    }

    // Mark players as active for current match
    this.players.forEach(p => p.isActive = false);
    player1.isActive = true;
    player2.isActive = true;

    return {
      player1,
      player2,
      matchNumber: this.currentSequenceIndex + 1,
      pattern: pattern,
      totalMatches: this.fixedSequence.length
    };
  }

  /**
   * Get tournament progress
   */
  getTournamentProgress() {
    return {
      current: this.currentSequenceIndex,
      total: this.fixedSequence.length,
      completed: this.completedMatches.length,
      remaining: this.fixedSequence.length - this.currentSequenceIndex,
      progress: `${this.completedMatches.length}/${this.fixedSequence.length}`
    };
  }

  /**
   * Get match sequence status
   */
  getMatchSequence() {
    return this.fixedSequence.map((pattern, index) => {
      const isCompleted = index < this.currentSequenceIndex;
      const isCurrent = index === this.currentSequenceIndex;
      const matchResult = isCompleted ? this.completedMatches[index] : null;

      return {
        index: index,
        pattern: pattern,
        matchNumber: index + 1,
        status: isCompleted ? 'completed' : (isCurrent ? 'current' : 'pending'),
        result: matchResult,
        winner: matchResult ? matchResult.winner : null
      };
    });
  }

  /**
   * Undo last action (simplified for fixed sequence)
   */
  undoLastAction() {
    if (this.gameHistory.length === 0) {
      throw new Error('No actions to undo');
    }

    const lastAction = this.gameHistory.pop();
    const lastMatch = this.completedMatches.pop();
    
    // Revert player stats
    const winner = this.players.find(p => p.name === lastAction.winner);
    const loser = this.players.find(p => p.name === lastAction.loser);

    winner.score -= 1;
    winner.wins -= 1;
    winner.matchesPlayed -= 1;

    loser.losses -= 1;
    loser.matchesPlayed -= 1;

    // Move back one step in sequence
    this.currentSequenceIndex--;
    this.isGameFinished = false;

    // Regenerate current match
    this.currentMatch = this._generateCurrentMatch();

    return lastAction;
  }

  /**
   * Get current game state
   */
  getGameState() {
    return {
      players: this.players,
      currentMatch: this.currentMatch,
      gameHistory: this.gameHistory,
      completedMatches: this.completedMatches,
      isGameStarted: this.isGameStarted,
      isGameFinished: this.isGameFinished,
      leaderboard: this._getLeaderboard(),
      tournamentProgress: this.getTournamentProgress(),
      matchSequence: this.getMatchSequence(),
      
      // Legacy properties for compatibility
      restRequirement: null, // No rest in fixed sequence
      nextPlayerInQueue: null // No queue in fixed sequence
    };
  }

  /**
   * Get next player in queue (always null for fixed sequence)
   */
  getNextPlayerInQueue() {
    return null; // No queue concept in fixed sequence
  }

  /**
   * Reset game to initial state
   */
  resetGame() {
    this.players.forEach((player, index) => {
      player.score = 0;
      player.wins = 0;
      player.losses = 0;
      player.matchesPlayed = 0;
      player.isActive = false;
      player.position = index;
    });

    this.currentSequenceIndex = 0;
    this.completedMatches = [];
    this.gameHistory = [];
    this.currentMatch = this._generateCurrentMatch();
    this.isGameFinished = false;
  }

  /**
   * End game manually
   */
  endGame() {
    this.isGameFinished = true;
    this.players.forEach(player => {
      player.isActive = false;
    });
    this.currentMatch = null;
  }

  /**
   * Get final standings
   */
  _getLeaderboard() {
    return [...this.players]
      .sort((a, b) => {
        // Primary: Score (wins)
        if (b.score !== a.score) return b.score - a.score;
        
        // Secondary: Fewer losses
        if (a.losses !== b.losses) return a.losses - b.losses;
        
        // Tertiary: Original position
        return a.position - b.position;
      })
      .map((player, index) => ({
        ...player,
        rank: index + 1
      }));
  }

  /**
   * Get winner (only when tournament is finished)
   */
  getWinner() {
    if (!this.isGameFinished) {
      return null;
    }

    const leaderboard = this._getLeaderboard();
    return leaderboard.length > 0 ? leaderboard[0] : null;
  }

  /**
   * Check if tournament is finished
   */
  isTournamentFinished() {
    return this.isGameFinished;
  }

  // Legacy methods for compatibility (marked as deprecated)

  /**
   * @deprecated No rest functionality in fixed sequence tournament
   */
  takeRest(playerName) {
    throw new Error('Rest functionality not available in fixed sequence tournament');
  }
}
