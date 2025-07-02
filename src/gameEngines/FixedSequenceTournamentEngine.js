import { BaseTournamentEngine } from './BaseTournamentEngine';

/**
 * Fixed Sequence Tournament Engine
 * 4-player tournament with fixed battle sequence: AB -> CD -> CA -> BD -> BC -> AD
 * Every match result is recorded in database for multi-machine synchronization
 */
export class FixedSequenceTournamentEngine extends BaseTournamentEngine {
  
  getDefaultOptions() {
    return {
      ...super.getDefaultOptions(),
      pointsPerWin: 1,
      pointsPerLoss: 0,
      requiredPlayers: 4, // Fixed 4 players only
      sequencePattern: ['AB', 'CD', 'CA', 'BD', 'BC', 'AD'] // Fixed sequence
    };
  }

  initializeGameState() {
    const baseState = super.initializeGameState();
    return {
      ...baseState,
      sequence: this.options.sequencePattern,
      currentSequenceIndex: 0,
      completedMatches: [],
      matchResults: [], // Store all match results for database sync
      totalMatches: this.options.sequencePattern.length
    };
  }

  validatePlayers(players) {
    const result = super.validatePlayers(players);
    if (!result.isValid) {
      return result;
    }

    // Ensure exactly 4 players
    if (players.length !== 4) {
      return {
        isValid: false,
        errors: ['Fixed Sequence Tournament requires exactly 4 players']
      };
    }

    return { isValid: true, errors: [] };
  }

  createInitialStandings() {
    // Ensure players are labeled A, B, C, D based on their position
    return this.players.map((player, index) => ({
      ...player,
      label: String.fromCharCode(65 + index), // A, B, C, D
      points: 0,
      wins: 0,
      losses: 0,
      matchesPlayed: 0,
      position: index + 1,
      isEliminated: false
    }));
  }

  startTournament() {
    this.gameState.phase = 'playing';
    this.gameState.currentMatch = this.generateNextMatch();
    return this.gameState;
  }

  generateNextMatch() {
    if (this.gameState.currentSequenceIndex >= this.gameState.sequence.length) {
      return null; // Tournament finished
    }

    const currentPattern = this.gameState.sequence[this.gameState.currentSequenceIndex];
    const [player1Label, player2Label] = currentPattern.split('');
    
    // Find players by their labels
    const player1 = this.gameState.standings.find(p => p.label === player1Label);
    const player2 = this.gameState.standings.find(p => p.label === player2Label);

    if (!player1 || !player2) {
      throw new Error(`Unable to find players for match pattern: ${currentPattern}`);
    }

    return {
      fighters: [player1, player2],
      matchId: `FS${this.gameState.currentSequenceIndex + 1}`,
      matchNumber: this.gameState.currentSequenceIndex + 1,
      pattern: currentPattern,
      sequenceIndex: this.gameState.currentSequenceIndex,
      type: 'fixed-sequence'
    };
  }

  processMatchResult(winnerName, matchData = {}) {
    this.saveStateForUndo();

    const match = this.gameState.currentMatch;
    if (!match) {
      throw new Error('No current match to process');
    }

    // Find winner and loser
    const winner = match.fighters.find(f => f.name === winnerName);
    const loser = match.fighters.find(f => f.name !== winnerName);

    if (!winner || !loser) {
      throw new Error('Invalid winner selection');
    }

    // Create match result record
    const matchResult = {
      matchId: match.matchId,
      matchNumber: match.matchNumber,
      pattern: match.pattern,
      sequenceIndex: match.sequenceIndex,
      fighter1: match.fighters[0],
      fighter2: match.fighters[1],
      winner: winner,
      loser: loser,
      winnerName: winner.name,
      loserName: loser.name,
      timestamp: new Date(),
      additionalData: matchData
    };

    // Update player standings
    this.updateStandings(winner, loser);

    // Record match result
    this.gameState.matchResults.push(matchResult);
    this.recordMatch(matchResult);

    // Move to next match in sequence
    this.gameState.currentSequenceIndex++;
    this.gameState.completedMatches.push(matchResult);

    // Generate next match or finish tournament
    if (this.gameState.currentSequenceIndex < this.gameState.sequence.length) {
      this.gameState.currentMatch = this.generateNextMatch();
    } else {
      this.gameState.currentMatch = null;
      this.gameState.phase = 'finished';
    }

    return this.gameState;
  }

  updateStandings(winner, loser) {
    // Find players in standings
    const winnerStanding = this.gameState.standings.find(p => p.id === winner.id);
    const loserStanding = this.gameState.standings.find(p => p.id === loser.id);

    if (!winnerStanding || !loserStanding) {
      throw new Error('Player not found in standings');
    }

    // Update winner stats
    winnerStanding.wins++;
    winnerStanding.points += this.options.pointsPerWin;
    winnerStanding.matchesPlayed++;

    // Update loser stats
    loserStanding.losses++;
    loserStanding.points += this.options.pointsPerLoss;
    loserStanding.matchesPlayed++;
  }

  recordMatch(matchResult) {
    this.gameState.matchHistory.push({
      matchNumber: matchResult.matchNumber,
      matchId: matchResult.matchId,
      pattern: matchResult.pattern,
      sequenceIndex: matchResult.sequenceIndex,
      winner: matchResult.winnerName,
      loser: matchResult.loserName,
      fighters: [matchResult.fighter1.name, matchResult.fighter2.name],
      timestamp: matchResult.timestamp,
      type: 'fixed-sequence'
    });
  }

  isTournamentFinished() {
    return this.gameState.currentSequenceIndex >= this.gameState.sequence.length;
  }

  getWinner() {
    if (!this.isTournamentFinished()) {
      return null;
    }

    const finalStandings = this.getFinalStandings();
    return finalStandings.length > 0 ? finalStandings[0] : null;
  }

  getFinalStandings() {
    return [...this.gameState.standings].sort((a, b) => {
      // Primary: Points (wins)
      if (b.points !== a.points) {
        return b.points - a.points;
      }
      
      // Secondary: Wins (should be same as points in this system)
      if (b.wins !== a.wins) {
        return b.wins - a.wins;
      }
      
      // Tertiary: Fewer losses
      if (a.losses !== b.losses) {
        return a.losses - b.losses;
      }
      
      // Quaternary: Original position (tie-breaker)
      return a.position - b.position;
    });
  }

  getSequenceProgress() {
    return {
      current: this.gameState.currentSequenceIndex,
      total: this.gameState.sequence.length,
      completed: this.gameState.completedMatches.length,
      remaining: this.gameState.sequence.length - this.gameState.currentSequenceIndex,
      nextPattern: this.gameState.currentSequenceIndex < this.gameState.sequence.length 
        ? this.gameState.sequence[this.gameState.currentSequenceIndex] 
        : null,
      progress: `${this.gameState.completedMatches.length}/${this.gameState.sequence.length}`
    };
  }

  getMatchSequence() {
    return this.gameState.sequence.map((pattern, index) => {
      const completed = index < this.gameState.currentSequenceIndex;
      const isCurrent = index === this.gameState.currentSequenceIndex;
      const matchResult = completed ? this.gameState.completedMatches[index] : null;

      return {
        index: index,
        pattern: pattern,
        matchNumber: index + 1,
        status: completed ? 'completed' : (isCurrent ? 'current' : 'pending'),
        result: matchResult,
        winner: matchResult ? matchResult.winnerName : null
      };
    });
  }

  // Get data for database synchronization
  getDatabaseSyncData() {
    return {
      tournamentType: 'fixed-sequence',
      gameState: this.gameState,
      matchResults: this.gameState.matchResults,
      sequence: this.gameState.sequence,
      currentSequenceIndex: this.gameState.currentSequenceIndex,
      standings: this.gameState.standings,
      isFinished: this.isTournamentFinished(),
      winner: this.getWinner(),
      timestamp: new Date()
    };
  }

  // Load state from database
  loadFromDatabaseData(data) {
    if (data.tournamentType !== 'fixed-sequence') {
      throw new Error('Invalid tournament type for Fixed Sequence Engine');
    }

    this.gameState = {
      ...this.gameState,
      ...data.gameState,
      matchResults: data.matchResults || [],
      currentSequenceIndex: data.currentSequenceIndex || 0
    };

    // Restore current match if tournament is not finished
    if (!this.isTournamentFinished() && this.gameState.phase === 'playing') {
      this.gameState.currentMatch = this.generateNextMatch();
    }

    return this.gameState;
  }

  static getTournamentInfo() {
    return {
      id: 'fixed-sequence',
      name: '固定順序賽制',
      description: '4人比賽固定對戰順序：AB → CD → CA → BD → BC → AD，每場結果記錄到資料庫',
      minPlayers: 4,
      maxPlayers: 4,
      features: [
        '固定對戰順序',
        '資料庫同步',
        '多機器支援',
        '無需選擇休息',
        '簡單積分制'
      ],
      difficulty: 'easy',
      estimatedDuration: '10-15 分鐘',
      sequencePattern: ['AB', 'CD', 'CA', 'BD', 'BC', 'AD'],
      isFixedSequence: true
    };
  }
}
