import { BaseTournamentEngine } from './BaseTournamentEngine';

/**
 * Single Elimination Tournament Engine
 * Classic bracket-style elimination tournament
 */
export class EliminationTournamentEngine extends BaseTournamentEngine {
  
  getDefaultOptions() {
    return {
      ...super.getDefaultOptions(),
      seedingMethod: 'position', // position, random, score
      bronzeMatch: true, // Play 3rd place match
      byeAdvancement: true // Allow byes when odd number of players
    };
  }

  initializeGameState() {
    const baseState = super.initializeGameState();
    return {
      ...baseState,
      bracket: [],
      currentRoundMatches: [],
      eliminatedPlayers: [],
      advancedPlayers: [],
      totalRounds: this.calculateTotalRounds()
    };
  }

  createInitialStandings() {
    const standings = this.players.map((player, index) => ({
      ...player,
      seed: index + 1,
      wins: 0,
      losses: 0,
      isEliminated: false,
      currentRound: 1,
      position: index + 1
    }));

    // Apply seeding method
    return this.applySeedingMethod(standings);
  }

  applySeedingMethod(standings) {
    switch (this.options.seedingMethod) {
      case 'random':
        return this.shuffleArray(standings).map((player, index) => ({
          ...player,
          seed: index + 1
        }));
      case 'score':
        return standings.sort((a, b) => (b.score || 0) - (a.score || 0))
                        .map((player, index) => ({ ...player, seed: index + 1 }));
      case 'position':
      default:
        return standings;
    }
  }

  shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  calculateTotalRounds() {
    return Math.ceil(Math.log2(this.players.length));
  }

  startTournament() {
    this.gameState.phase = 'playing';
    this.generateBracket();
    this.setupRound(1);
    return this.gameState;
  }

  generateBracket() {
    const players = [...this.gameState.standings];
    const totalRounds = this.gameState.totalRounds;
    
    // Create bracket structure
    this.gameState.bracket = [];
    
    for (let round = 1; round <= totalRounds; round++) {
      const matchesInRound = Math.ceil(this.players.length / Math.pow(2, round));
      this.gameState.bracket.push({
        round,
        matches: Array(matchesInRound).fill(null).map((_, index) => ({
          id: `R${round}M${index + 1}`,
          round,
          matchNumber: index + 1,
          player1: null,
          player2: null,
          winner: null,
          status: 'pending'
        }))
      });
    }

    // Fill first round with players
    this.populateFirstRound(players);
  }

  populateFirstRound(players) {
    const firstRound = this.gameState.bracket[0];
    const matchCount = firstRound.matches.length;
    
    // Standard tournament seeding
    const seededPlayers = this.createSeededPairs(players);
    
    for (let i = 0; i < matchCount && i * 2 < seededPlayers.length; i++) {
      const match = firstRound.matches[i];
      match.player1 = seededPlayers[i * 2] || null;
      match.player2 = seededPlayers[i * 2 + 1] || null;
      
      // Handle bye (odd number of players)
      if (!match.player2 && this.options.byeAdvancement) {
        match.winner = match.player1;
        match.status = 'bye';
      } else if (match.player1 && match.player2) {
        match.status = 'ready';
      }
    }
  }

  createSeededPairs(players) {
    // Create traditional tournament seeding pairs
    // 1 vs lowest, 2 vs second lowest, etc.
    const sorted = [...players].sort((a, b) => a.seed - b.seed);
    const pairs = [];
    
    for (let i = 0; i < sorted.length; i += 2) {
      pairs.push(sorted[i]);
      if (i + 1 < sorted.length) {
        pairs.push(sorted[sorted.length - 1 - Math.floor(i / 2)]);
      }
    }
    
    return pairs.slice(0, players.length);
  }

  setupRound(roundNumber) {
    const round = this.gameState.bracket[roundNumber - 1];
    if (!round) {
      this.gameState.phase = 'finished';
      return;
    }

    // Find next ready match
    const readyMatch = round.matches.find(match => 
      match.status === 'ready' && !match.winner
    );

    if (readyMatch) {
      this.gameState.currentMatch = {
        fighters: [readyMatch.player1, readyMatch.player2],
        matchId: readyMatch.id,
        round: roundNumber,
        matchNumber: readyMatch.matchNumber,
        type: 'elimination'
      };
    } else {
      // Check if round is complete
      if (this.isRoundComplete(roundNumber)) {
        this.advanceToNextRound(roundNumber);
      } else {
        this.gameState.currentMatch = null;
      }
    }
  }

  generateNextMatch() {
    if (this.isTournamentFinished()) {
      return null;
    }

    const currentRound = this.gameState.round;
    const round = this.gameState.bracket[currentRound - 1];
    
    if (!round) {
      return null;
    }

    // Find next ready match in current round
    const readyMatch = round.matches.find(match => 
      match.status === 'ready' && !match.winner
    );

    if (readyMatch) {
      return {
        fighters: [readyMatch.player1, readyMatch.player2],
        matchId: readyMatch.id,
        round: currentRound,
        matchNumber: readyMatch.matchNumber,
        type: 'elimination'
      };
    }

    return null;
  }

  processMatchResult(winnerName, matchData = {}) {
    this.saveStateForUndo();

    const match = this.gameState.currentMatch;
    if (!match) {
      throw new Error('No current match to process');
    }

    const winner = match.fighters.find(f => f.name === winnerName);
    const loser = match.fighters.find(f => f.name !== winnerName);

    if (!winner || !loser) {
      throw new Error('Invalid winner selection');
    }

    // Update bracket
    this.updateBracketMatch(match.matchId, winner, loser);
    
    // Update player stats
    this.updatePlayerStats(winner.id, loser.id);
    
    // Record match in history
    this.recordMatch(winner, loser, match);

    // Eliminate loser
    this.eliminatePlayer(loser.id);

    // Check if round is complete
    if (this.isRoundComplete(this.gameState.round)) {
      this.advanceToNextRound(this.gameState.round);
    } else {
      // Setup next match in current round
      this.setupRound(this.gameState.round);
    }

    return this.gameState;
  }

  updateBracketMatch(matchId, winner, loser) {
    for (const round of this.gameState.bracket) {
      const match = round.matches.find(m => m.id === matchId);
      if (match) {
        match.winner = winner;
        match.loser = loser;
        match.status = 'completed';
        break;
      }
    }
  }

  updatePlayerStats(winnerId, loserId) {
    this.gameState.standings = this.gameState.standings.map(player => {
      if (player.id === winnerId) {
        return {
          ...player,
          wins: player.wins + 1
        };
      } else if (player.id === loserId) {
        return {
          ...player,
          losses: player.losses + 1,
          isEliminated: true
        };
      }
      return player;
    });
  }

  recordMatch(winner, loser, match) {
    this.gameState.matchHistory.push({
      matchNumber: this.gameState.matchHistory.length + 1,
      matchId: match.matchId,
      round: match.round,
      winner: winner.name,
      loser: loser.name,
      timestamp: new Date(),
      type: 'elimination'
    });
  }

  eliminatePlayer(playerId) {
    const player = this.gameState.standings.find(p => p.id === playerId);
    if (player) {
      player.isEliminated = true;
      this.gameState.eliminatedPlayers.push(player);
    }
  }

  isRoundComplete(roundNumber) {
    const round = this.gameState.bracket[roundNumber - 1];
    if (!round) return true;
    
    return round.matches.every(match => 
      match.status === 'completed' || match.status === 'bye'
    );
  }

  advanceToNextRound(completedRound) {
    const nextRoundNumber = completedRound + 1;
    const nextRound = this.gameState.bracket[nextRoundNumber - 1];
    
    if (!nextRound) {
      // Tournament finished
      this.gameState.phase = 'finished';
      return;
    }

    // Get winners from completed round
    const currentRound = this.gameState.bracket[completedRound - 1];
    const winners = currentRound.matches
      .filter(match => match.winner)
      .map(match => match.winner);

    // Populate next round
    for (let i = 0; i < nextRound.matches.length && i * 2 < winners.length; i++) {
      const match = nextRound.matches[i];
      match.player1 = winners[i * 2] || null;
      match.player2 = winners[i * 2 + 1] || null;
      
      if (match.player1 && match.player2) {
        match.status = 'ready';
      } else if (match.player1 && !match.player2) {
        // Bye to finals
        match.winner = match.player1;
        match.status = 'bye';
      }
    }

    this.gameState.round = nextRoundNumber;
    this.setupRound(nextRoundNumber);
  }

  isTournamentFinished() {
    if (this.gameState.phase !== 'playing') {
      return this.gameState.phase === 'finished';
    }

    // Check if final round is complete
    const finalRound = this.gameState.bracket[this.gameState.totalRounds - 1];
    if (!finalRound) return false;
    
    const finalMatch = finalRound.matches[0];
    return finalMatch && (finalMatch.status === 'completed' || finalMatch.status === 'bye');
  }

  getWinner() {
    if (!this.isTournamentFinished()) {
      return null;
    }

    const finalRound = this.gameState.bracket[this.gameState.totalRounds - 1];
    const finalMatch = finalRound.matches[0];
    return finalMatch ? finalMatch.winner : null;
  }

  getFinalStandings() {
    const standings = [...this.gameState.standings];
    
    // Sort by elimination order (later elimination = higher rank)
    return standings.sort((a, b) => {
      if (a.isEliminated && b.isEliminated) {
        // Both eliminated, sort by when they were eliminated
        const aEliminationRound = this.getEliminationRound(a.id);
        const bEliminationRound = this.getEliminationRound(b.id);
        return bEliminationRound - aEliminationRound;
      } else if (a.isEliminated) {
        return 1; // a is eliminated, b is not, b ranks higher
      } else if (b.isEliminated) {
        return -1; // b is eliminated, a is not, a ranks higher
      } else {
        // Neither eliminated (shouldn't happen in finished tournament)
        return b.wins - a.wins;
      }
    });
  }

  getEliminationRound(playerId) {
    for (let roundIndex = 0; roundIndex < this.gameState.bracket.length; roundIndex++) {
      const round = this.gameState.bracket[roundIndex];
      for (const match of round.matches) {
        if (match.loser && match.loser.id === playerId) {
          return roundIndex + 1;
        }
      }
    }
    return 0;
  }

  getBracketDisplay() {
    return {
      totalRounds: this.gameState.totalRounds,
      currentRound: this.gameState.round,
      bracket: this.gameState.bracket,
      isFinished: this.isTournamentFinished()
    };
  }

  static getTournamentInfo() {
    return {
      id: 'elimination',
      name: '淘汰賽制',
      description: '經典淘汰制，敗者立即淘汰，直到產生最終冠軍',
      minPlayers: 2,
      maxPlayers: 32,
      features: [
        '經典淘汰制',
        '對戰表顯示',
        '種子排序',
        '快速決勝'
      ],
      difficulty: 'easy',
      estimatedDuration: '5-15 分鐘'
    };
  }
}