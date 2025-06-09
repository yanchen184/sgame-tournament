import { BaseTournamentEngine } from './BaseTournamentEngine';

/**
 * Round Robin Tournament Engine
 * Every player plays against every other player
 */
export class RoundRobinTournamentEngine extends BaseTournamentEngine {
  
  getDefaultOptions() {
    return {
      ...super.getDefaultOptions(),
      pointsPerWin: 3,
      pointsPerDraw: 1,
      pointsPerLoss: 0,
      allowDraws: false,
      doubleRoundRobin: false // Play each opponent twice
    };
  }

  initializeGameState() {
    const baseState = super.initializeGameState();
    return {
      ...baseState,
      schedule: [],
      completedMatches: [],
      remainingMatches: [],
      totalMatches: this.calculateTotalMatches()
    };
  }

  createInitialStandings() {
    return this.players.map((player, index) => ({
      ...player,
      points: 0,
      wins: 0,
      draws: 0,
      losses: 0,
      goalsFor: 0,
      goalsAgainst: 0,
      goalDifference: 0,
      matchesPlayed: 0,
      position: index + 1,
      isEliminated: false
    }));
  }

  calculateTotalMatches() {
    const n = this.players.length;
    const singleRoundMatches = (n * (n - 1)) / 2;
    return this.options.doubleRoundRobin ? singleRoundMatches * 2 : singleRoundMatches;
  }

  startTournament() {
    this.gameState.phase = 'playing';
    this.generateSchedule();
    this.gameState.currentMatch = this.getNextMatch();
    return this.gameState;
  }

  generateSchedule() {
    const players = [...this.gameState.standings];
    const matches = [];
    let matchNumber = 1;

    // Generate all possible pairs
    for (let i = 0; i < players.length; i++) {
      for (let j = i + 1; j < players.length; j++) {
        matches.push({
          id: `M${matchNumber}`,
          matchNumber: matchNumber++,
          player1: players[i],
          player2: players[j],
          round: 1,
          status: 'pending',
          result: null
        });

        // Add return match for double round robin
        if (this.options.doubleRoundRobin) {
          matches.push({
            id: `M${matchNumber}`,
            matchNumber: matchNumber++,
            player1: players[j],
            player2: players[i],
            round: 2,
            status: 'pending',
            result: null
          });
        }
      }
    }

    this.gameState.schedule = matches;
    this.gameState.remainingMatches = [...matches];
    this.gameState.completedMatches = [];
  }

  getNextMatch() {
    const nextMatch = this.gameState.remainingMatches.find(match => 
      match.status === 'pending'
    );

    if (!nextMatch) {
      return null;
    }

    return {
      fighters: [nextMatch.player1, nextMatch.player2],
      matchId: nextMatch.id,
      matchNumber: nextMatch.matchNumber,
      round: nextMatch.round,
      type: 'roundrobin'
    };
  }

  generateNextMatch() {
    return this.getNextMatch();
  }

  processMatchResult(winnerName, matchData = {}) {
    this.saveStateForUndo();

    const match = this.gameState.currentMatch;
    if (!match) {
      throw new Error('No current match to process');
    }

    const scheduleMatch = this.gameState.schedule.find(m => m.id === match.matchId);
    if (!scheduleMatch) {
      throw new Error('Schedule match not found');
    }

    // Handle draw option
    let result;
    if (this.options.allowDraws && matchData.isDraw) {
      result = 'draw';
    } else {
      const winner = match.fighters.find(f => f.name === winnerName);
      const loser = match.fighters.find(f => f.name !== winnerName);
      
      if (!winner || !loser) {
        throw new Error('Invalid winner selection');
      }
      
      result = {
        winner: winner,
        loser: loser,
        score: matchData.score || '1-0'
      };
    }

    // Update schedule match
    scheduleMatch.result = result;
    scheduleMatch.status = 'completed';

    // Update player standings
    this.updateStandings(scheduleMatch);

    // Record match in history
    this.recordMatch(scheduleMatch);

    // Move match from remaining to completed
    this.gameState.remainingMatches = this.gameState.remainingMatches.filter(m => m.id !== match.matchId);
    this.gameState.completedMatches.push(scheduleMatch);

    // Setup next match
    this.gameState.currentMatch = this.getNextMatch();

    // Check if tournament is finished
    if (this.isTournamentFinished()) {
      this.gameState.phase = 'finished';
    }

    return this.gameState;
  }

  updateStandings(match) {
    const player1 = match.player1;
    const player2 = match.player2;
    const result = match.result;

    // Find players in standings
    const p1Standing = this.gameState.standings.find(p => p.id === player1.id);
    const p2Standing = this.gameState.standings.find(p => p.id === player2.id);

    if (!p1Standing || !p2Standing) {
      throw new Error('Player not found in standings');
    }

    // Update matches played
    p1Standing.matchesPlayed++;
    p2Standing.matchesPlayed++;

    if (result === 'draw') {
      // Handle draw
      p1Standing.draws++;
      p2Standing.draws++;
      p1Standing.points += this.options.pointsPerDraw;
      p2Standing.points += this.options.pointsPerDraw;
    } else {
      // Handle win/loss
      const winnerStanding = this.gameState.standings.find(p => p.id === result.winner.id);
      const loserStanding = this.gameState.standings.find(p => p.id === result.loser.id);

      winnerStanding.wins++;
      winnerStanding.points += this.options.pointsPerWin;
      
      loserStanding.losses++;
      loserStanding.points += this.options.pointsPerLoss;

      // Update goal statistics if score provided
      if (result.score && typeof result.score === 'string') {
        const [goalsFor, goalsAgainst] = result.score.split('-').map(Number);
        if (!isNaN(goalsFor) && !isNaN(goalsAgainst)) {
          winnerStanding.goalsFor += goalsFor;
          winnerStanding.goalsAgainst += goalsAgainst;
          winnerStanding.goalDifference = winnerStanding.goalsFor - winnerStanding.goalsAgainst;

          loserStanding.goalsFor += goalsAgainst;
          loserStanding.goalsAgainst += goalsFor;
          loserStanding.goalDifference = loserStanding.goalsFor - loserStanding.goalsAgainst;
        }
      }
    }
  }

  recordMatch(match) {
    let winner = null;
    let loser = null;
    let matchType = 'roundrobin';

    if (match.result === 'draw') {
      matchType = 'draw';
    } else if (match.result.winner) {
      winner = match.result.winner.name;
      loser = match.result.loser.name;
    }

    this.gameState.matchHistory.push({
      matchNumber: match.matchNumber,
      matchId: match.id,
      round: match.round,
      winner: winner,
      loser: loser,
      result: match.result,
      timestamp: new Date(),
      type: matchType
    });
  }

  isTournamentFinished() {
    return this.gameState.remainingMatches.length === 0;
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
      // Primary: Points
      if (b.points !== a.points) {
        return b.points - a.points;
      }
      
      // Secondary: Goal difference
      if (b.goalDifference !== a.goalDifference) {
        return b.goalDifference - a.goalDifference;
      }
      
      // Tertiary: Goals for
      if (b.goalsFor !== a.goalsFor) {
        return b.goalsFor - a.goalsFor;
      }
      
      // Quaternary: Head to head (simplified - just wins)
      return b.wins - a.wins;
    });
  }

  getStandingsTable() {
    const standings = this.getFinalStandings();
    return standings.map((player, index) => ({
      position: index + 1,
      name: player.name,
      matchesPlayed: player.matchesPlayed,
      wins: player.wins,
      draws: player.draws,
      losses: player.losses,
      goalsFor: player.goalsFor,
      goalsAgainst: player.goalsAgainst,
      goalDifference: player.goalDifference,
      points: player.points
    }));
  }

  getMatchSchedule() {
    return {
      completed: this.gameState.completedMatches,
      remaining: this.gameState.remainingMatches,
      current: this.gameState.currentMatch,
      total: this.gameState.totalMatches,
      progress: `${this.gameState.completedMatches.length}/${this.gameState.totalMatches}`
    };
  }

  getRemainingOpponents(playerId) {
    return this.gameState.remainingMatches
      .filter(match => 
        match.player1.id === playerId || match.player2.id === playerId
      )
      .map(match => 
        match.player1.id === playerId ? match.player2 : match.player1
      );
  }

  getHeadToHeadRecord(player1Id, player2Id) {
    const h2hMatches = this.gameState.completedMatches.filter(match => 
      (match.player1.id === player1Id && match.player2.id === player2Id) ||
      (match.player1.id === player2Id && match.player2.id === player1Id)
    );

    let p1Wins = 0;
    let p2Wins = 0;
    let draws = 0;

    h2hMatches.forEach(match => {
      if (match.result === 'draw') {
        draws++;
      } else if (match.result.winner.id === player1Id) {
        p1Wins++;
      } else {
        p2Wins++;
      }
    });

    return { p1Wins, p2Wins, draws, totalMatches: h2hMatches.length };
  }

  static getTournamentInfo() {
    return {
      id: 'roundrobin',
      name: '循環賽制',
      description: '每位選手都要與其他所有選手對戰一次，積分最高者獲勝',
      minPlayers: 3,
      maxPlayers: 8,
      features: [
        '公平對戰',
        '積分系統',
        '完整排名',
        '統計數據'
      ],
      difficulty: 'easy',
      estimatedDuration: '15-45 分鐘'
    };
  }
}