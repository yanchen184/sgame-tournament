import { BaseTournamentEngine } from './BaseTournamentEngine';

/**
 * Streak Tournament Engine - Current tournament system
 * Players compete in streak-based format with rest options
 */
export class StreakTournamentEngine extends BaseTournamentEngine {
  
  getDefaultOptions() {
    return {
      ...super.getDefaultOptions(),
      allowRest: true,
      restBonusPoints: 1,
      streakToWin: null, // null = beat all other players
      minPlayersForRest: 4
    };
  }

  initializeGameState() {
    const baseState = super.initializeGameState();
    return {
      ...baseState,
      currentChampion: null,
      championBeatenOpponents: [],
      showRestOption: false,
      streakWinner: null,
      battleCount: 0
    };
  }

  createInitialStandings() {
    return this.players.map((player, index) => ({
      ...player,
      score: 0,
      winStreak: 0,
      totalWins: 0,
      totalLosses: 0,
      position: index + 1,
      isResting: false,
      isEliminated: false
    }));
  }

  startTournament() {
    this.gameState.phase = 'playing';
    
    // Set first champion (first player)
    const sortedPlayers = [...this.gameState.standings].sort((a, b) => a.position - b.position);
    this.gameState.currentChampion = sortedPlayers[0];
    this.gameState.championBeatenOpponents = [];
    
    // Create first match
    this.gameState.currentMatch = {
      fighters: [sortedPlayers[0], sortedPlayers[1]],
      matchNumber: 1,
      type: 'regular'
    };
    
    return this.gameState;
  }

  generateNextMatch() {
    if (this.isTournamentFinished()) {
      return null;
    }

    const champion = this.gameState.currentChampion;
    if (!champion) {
      return null;
    }

    // Find next challenger who hasn't been beaten by current champion
    const availableChallengers = this.gameState.standings.filter(player => 
      player.id !== champion.id && 
      !player.isResting &&
      !this.gameState.championBeatenOpponents.some(beaten => beaten.id === player.id)
    );

    if (availableChallengers.length === 0) {
      // No more challengers, tournament should end or offer rest
      return null;
    }

    // Get challenger with lowest position number
    const nextChallenger = availableChallengers.reduce((lowest, current) => 
      current.position < lowest.position ? current : lowest
    );

    return {
      fighters: [champion, nextChallenger],
      matchNumber: this.gameState.battleCount + 1,
      type: 'regular'
    };
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

    // Update player stats
    this.updatePlayerStats(winner.id, loser.id);
    
    // Record match in history
    this.recordMatch(winner, loser, match.matchNumber);

    // Update champion tracking
    this.updateChampionStatus(winner, loser);

    // Check if streak completed (for rest option)
    if (this.checkStreakCompleted(winner)) {
      this.handleStreakCompleted(winner);
    } else {
      // Generate next match
      this.gameState.currentMatch = this.generateNextMatch();
      
      // Check if tournament is finished
      if (this.isTournamentFinished()) {
        this.gameState.phase = 'finished';
      }
    }

    return this.gameState;
  }

  updatePlayerStats(winnerId, loserId) {
    this.gameState.standings = this.gameState.standings.map(player => {
      if (player.id === winnerId) {
        return {
          ...player,
          score: player.score + 1,
          winStreak: player.winStreak + 1,
          totalWins: player.totalWins + 1
        };
      } else if (player.id === loserId) {
        return {
          ...player,
          winStreak: 0,
          totalLosses: player.totalLosses + 1
        };
      }
      return player;
    });
  }

  recordMatch(winner, loser, matchNumber) {
    const winnerStats = this.gameState.standings.find(p => p.id === winner.id);
    
    this.gameState.matchHistory.push({
      matchNumber,
      battleNumber: this.gameState.battleCount + 1,
      winner: winner.name,
      loser: loser.name,
      timestamp: new Date(),
      winnerScore: winnerStats.score,
      type: 'regular'
    });
    
    this.gameState.battleCount += 1;
  }

  updateChampionStatus(winner, loser) {
    const winnerId = winner.id;
    
    // If winner was already champion, add loser to beaten opponents
    if (this.gameState.currentChampion && winnerId === this.gameState.currentChampion.id) {
      if (!this.gameState.championBeatenOpponents.some(op => op.id === loser.id)) {
        this.gameState.championBeatenOpponents.push(loser);
      }
    } else {
      // New champion - reset beaten opponents
      this.gameState.currentChampion = this.gameState.standings.find(p => p.id === winnerId);
      this.gameState.championBeatenOpponents = [loser];
    }
  }

  checkStreakCompleted(winner) {
    if (this.players.length < this.options.minPlayersForRest) {
      return false;
    }

    const otherPlayers = this.gameState.standings.filter(p => p.id !== winner.id && !p.isResting);
    const hasBeatenAll = otherPlayers.every(player => 
      this.gameState.championBeatenOpponents.some(beaten => beaten.id === player.id)
    );

    return hasBeatenAll;
  }

  handleStreakCompleted(winner) {
    this.gameState.showRestOption = true;
    this.gameState.streakWinner = winner;
    this.gameState.currentMatch = null; // Pause matches for rest decision
  }

  /**
   * Handle player taking rest after completing streak
   * @returns {Object} Updated game state
   */
  processRestAction() {
    this.saveStateForUndo();

    if (!this.gameState.streakWinner) {
      throw new Error('No streak winner to take rest');
    }

    const restingPlayer = this.gameState.streakWinner;
    
    // Give bonus points and set resting status
    this.gameState.standings = this.gameState.standings.map(player => {
      if (player.id === restingPlayer.id) {
        return {
          ...player,
          score: player.score + this.options.restBonusPoints,
          winStreak: 0,
          isResting: true
        };
      }
      return player;
    });

    // Record rest action
    this.gameState.matchHistory.push({
      matchNumber: this.gameState.battleCount + 1,
      battleNumber: this.gameState.battleCount + 1,
      winner: restingPlayer.name,
      loser: null,
      timestamp: new Date(),
      winnerScore: this.gameState.standings.find(p => p.id === restingPlayer.id).score,
      type: 'rest'
    });
    
    this.gameState.battleCount += 1;

    // Reset champion tracking and setup new match
    this.resetChampionTracking();
    this.gameState.currentMatch = this.setupMatchWithoutRestingPlayer(restingPlayer.id);

    // Clear rest option
    this.gameState.showRestOption = false;
    this.gameState.streakWinner = null;

    return this.gameState;
  }

  /**
   * Handle player continuing to play after completing streak
   * @returns {Object} Updated game state
   */
  processContinueAction() {
    if (!this.gameState.streakWinner) {
      throw new Error('No streak winner to continue');
    }

    // Reset champion tracking for new round
    this.resetChampionTracking();
    
    // Generate new match starting with the streak winner
    this.gameState.currentMatch = this.generateNextMatch();

    // Clear rest option
    this.gameState.showRestOption = false;
    this.gameState.streakWinner = null;

    return this.gameState;
  }

  resetChampionTracking() {
    this.gameState.currentChampion = null;
    this.gameState.championBeatenOpponents = [];
  }

  setupMatchWithoutRestingPlayer(restingPlayerId) {
    const availablePlayers = this.gameState.standings.filter(p => 
      p.id !== restingPlayerId && !p.isResting
    );

    if (availablePlayers.length < 2) {
      return null; // Cannot setup match
    }

    // Get first two available players by position
    const sortedAvailable = availablePlayers.sort((a, b) => a.position - b.position);
    this.gameState.currentChampion = sortedAvailable[0];
    this.gameState.championBeatenOpponents = [];

    return {
      fighters: [sortedAvailable[0], sortedAvailable[1]],
      matchNumber: this.gameState.battleCount + 1,
      type: 'regular'
    };
  }

  isTournamentFinished() {
    if (this.gameState.phase !== 'playing') {
      return false;
    }

    // Check if we're in rest decision phase
    if (this.gameState.showRestOption) {
      return false;
    }

    // Check if there are enough active players for matches
    const activePlayers = this.gameState.standings.filter(p => !p.isResting);
    return activePlayers.length < 2;
  }

  getWinner() {
    const finalStandings = this.getFinalStandings();
    return finalStandings.length > 0 ? finalStandings[0] : null;
  }

  getFinalStandings() {
    return [...this.gameState.standings].sort((a, b) => {
      if (b.score !== a.score) {
        return b.score - a.score;
      }
      return b.winStreak - a.winStreak;
    });
  }

  getAvailableActions() {
    const baseActions = super.getAvailableActions();
    
    if (this.gameState.showRestOption) {
      return ['takeRest', 'continuePlay', 'undoAction'];
    }
    
    return baseActions;
  }

  static getTournamentInfo() {
    return {
      id: 'streak',
      name: '連勝賽制',
      description: '玩家輪流挑戰冠軍，完成一輪挑戰後可選擇休息獲得分數或繼續比賽',
      minPlayers: 2,
      maxPlayers: 12,
      features: [
        '冠軍挑戰制',
        '連勝追蹤',
        '休息選項',
        '分數累積'
      ],
      difficulty: 'medium',
      estimatedDuration: '10-30 分鐘'
    };
  }
}