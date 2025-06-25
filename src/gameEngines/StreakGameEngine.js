/**
 * Simplified Streak Tournament Game Engine
 * Focus only on streak-based tournament functionality
 */

import { STREAK_CONFIG } from '../constants';

export class StreakGameEngine {
  constructor(players) {
    // Validate input
    if (!Array.isArray(players) || players.length < 3) {
      throw new Error('At least 3 players required for streak tournament');
    }

    this.players = players.map((name, index) => ({
      id: index,
      name: name.trim(),
      score: 0,
      currentStreak: 0,
      totalWins: 0,
      totalLosses: 0,
      isActive: index < 2, // First two players start
      isResting: false,
      position: index
    }));

    this.gameHistory = [];
    this.currentMatch = {
      player1: this.players[0],
      player2: this.players[1]
    };
    this.isGameStarted = true;
    this.isGameFinished = false;
    this.restRequirement = STREAK_CONFIG.getRestRequirement(players.length);
  }

  /**
   * Process match result when a player wins
   */
  declareWinner(winnerName) {
    const winner = this.players.find(p => p.name === winnerName);
    const loser = this.currentMatch.player1.name === winnerName 
      ? this.currentMatch.player2 
      : this.currentMatch.player1;

    if (!winner || !loser) {
      throw new Error('Invalid winner name');
    }

    // Update winner stats
    winner.score += STREAK_CONFIG.POINTS_PER_WIN;
    winner.currentStreak += 1;
    winner.totalWins += 1;

    // Update loser stats
    loser.currentStreak = 0;
    loser.totalLosses += 1;

    // Record match in history
    this.gameHistory.push({
      id: this.gameHistory.length + 1,
      winner: winner.name,
      loser: loser.name,
      timestamp: Date.now(),
      winnerScore: winner.score,
      winnerStreak: winner.currentStreak
    });

    // Setup next match
    this._setupNextMatch(winner, loser);

    return {
      winner,
      loser,
      canTakeRest: winner.currentStreak >= this.restRequirement && winner.currentStreak % this.restRequirement === 0
    };
  }

  /**
   * Handle player taking rest (when eligible)
   */
  takeRest(playerName) {
    const player = this.players.find(p => p.name === playerName);
    
    if (!player) {
      throw new Error('Player not found');
    }

    if (player.currentStreak < this.restRequirement || player.currentStreak % this.restRequirement !== 0) {
      throw new Error('Player not eligible for rest');
    }

    // Give bonus points and mark as resting
    player.score += STREAK_CONFIG.REST_BONUS_POINTS;
    player.isResting = true;
    player.isActive = false;

    // Record rest in history
    this.gameHistory.push({
      id: this.gameHistory.length + 1,
      action: 'rest',
      player: player.name,
      timestamp: Date.now(),
      bonusPoints: STREAK_CONFIG.REST_BONUS_POINTS,
      newScore: player.score
    });

    // Setup next match without the resting player
    this._setupNextMatchAfterRest();
  }

  /**
   * Undo last action
   */
  undoLastAction() {
    if (this.gameHistory.length === 0) {
      throw new Error('No actions to undo');
    }

    const lastAction = this.gameHistory.pop();
    
    if (lastAction.action === 'rest') {
      this._undoRest(lastAction);
    } else {
      this._undoMatch(lastAction);
    }

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
      isGameStarted: this.isGameStarted,
      isGameFinished: this.isGameFinished,
      restRequirement: this.restRequirement,
      leaderboard: this._getLeaderboard()
    };
  }

  /**
   * Reset game to initial state
   */
  resetGame() {
    this.players.forEach((player, index) => {
      player.score = 0;
      player.currentStreak = 0;
      player.totalWins = 0;
      player.totalLosses = 0;
      player.isActive = index < 2;
      player.isResting = false;
      player.position = index;
    });

    this.gameHistory = [];
    this.currentMatch = {
      player1: this.players[0],
      player2: this.players[1]
    };
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
  }

  // Private methods

  _setupNextMatch(winner, loser) {
    // Winner stays, loser goes to back of queue
    loser.isActive = false;
    
    // Find next player in queue
    const nextPlayer = this._getNextPlayer();
    
    if (nextPlayer) {
      nextPlayer.isActive = true;
      this.currentMatch = {
        player1: winner,
        player2: nextPlayer
      };
    } else {
      // No more players available, handle resting players
      this._handleNoAvailablePlayers(winner);
    }
  }

  _setupNextMatchAfterRest() {
    // Find two available players
    const availablePlayers = this.players.filter(p => !p.isResting && !p.isActive);
    
    if (availablePlayers.length >= 2) {
      availablePlayers[0].isActive = true;
      availablePlayers[1].isActive = true;
      
      this.currentMatch = {
        player1: availablePlayers[0],
        player2: availablePlayers[1]
      };
    } else {
      // Bring back resting players if needed
      this._bringBackRestingPlayers();
    }
  }

  _getNextPlayer() {
    return this.players.find(p => !p.isActive && !p.isResting);
  }

  _handleNoAvailablePlayers(currentWinner) {
    // If all other players are resting, bring them back
    const restingPlayers = this.players.filter(p => p.isResting);
    if (restingPlayers.length > 0) {
      restingPlayers.forEach(player => {
        player.isResting = false;
      });
      
      const nextPlayer = this._getNextPlayer();
      if (nextPlayer) {
        nextPlayer.isActive = true;
        this.currentMatch = {
          player1: currentWinner,
          player2: nextPlayer
        };
      }
    }
  }

  _bringBackRestingPlayers() {
    this.players.forEach(player => {
      if (player.isResting) {
        player.isResting = false;
      }
    });
    
    // Setup match with available players
    const availablePlayers = this.players.filter(p => !p.isActive);
    if (availablePlayers.length >= 2) {
      availablePlayers[0].isActive = true;
      availablePlayers[1].isActive = true;
      
      this.currentMatch = {
        player1: availablePlayers[0],
        player2: availablePlayers[1]
      };
    }
  }

  _undoMatch(lastAction) {
    const winner = this.players.find(p => p.name === lastAction.winner);
    const loser = this.players.find(p => p.name === lastAction.loser);

    // Revert winner stats
    winner.score -= STREAK_CONFIG.POINTS_PER_WIN;
    winner.currentStreak -= 1;
    winner.totalWins -= 1;

    // Revert loser stats
    loser.totalLosses -= 1;
    
    // Recalculate loser's streak from history
    loser.currentStreak = this._calculateStreakFromHistory(loser.name);

    // Restore match state
    winner.isActive = true;
    loser.isActive = true;
    this.currentMatch = {
      player1: winner,
      player2: loser
    };
  }

  _undoRest(lastAction) {
    const player = this.players.find(p => p.name === lastAction.player);
    
    // Revert rest
    player.score -= STREAK_CONFIG.REST_BONUS_POINTS;
    player.isResting = false;
    player.isActive = true;
    
    // Find opponent for current match
    const opponent = this._getNextPlayer();
    if (opponent) {
      opponent.isActive = true;
      this.currentMatch = {
        player1: player,
        player2: opponent
      };
    }
  }

  _calculateStreakFromHistory(playerName) {
    let streak = 0;
    for (let i = this.gameHistory.length - 1; i >= 0; i--) {
      const action = this.gameHistory[i];
      if (action.winner === playerName) {
        streak++;
      } else if (action.loser === playerName) {
        break;
      }
    }
    return streak;
  }

  _getLeaderboard() {
    return [...this.players]
      .sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        if (b.currentStreak !== a.currentStreak) return b.currentStreak - a.currentStreak;
        return b.totalWins - a.totalWins;
      })
      .map((player, index) => ({
        ...player,
        rank: index + 1
      }));
  }
}
