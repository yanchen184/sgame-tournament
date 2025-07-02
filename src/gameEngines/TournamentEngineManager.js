import { StreakTournamentEngine } from './StreakTournamentEngine';
import { EliminationTournamentEngine } from './EliminationTournamentEngine';
import { RoundRobinTournamentEngine } from './RoundRobinTournamentEngine';
import { FixedSequenceTournamentEngine } from './FixedSequenceTournamentEngine';

/**
 * Tournament Engine Factory and Manager
 * Handles creation and management of different tournament types
 */
export class TournamentEngineManager {
  
  // Registry of available tournament engines
  static engines = {
    streak: StreakTournamentEngine,
    elimination: EliminationTournamentEngine,
    roundrobin: RoundRobinTournamentEngine,
    'fixed-sequence': FixedSequenceTournamentEngine
  };

  /**
   * Get all available tournament types
   * @returns {Array} Array of tournament info objects
   */
  static getAvailableTournaments() {
    return Object.entries(this.engines).map(([id, engineClass]) => ({
      ...engineClass.getTournamentInfo(),
      id
    }));
  }

  /**
   * Get tournament info by ID
   * @param {string} tournamentId - Tournament type ID
   * @returns {Object} Tournament info
   */
  static getTournamentInfo(tournamentId) {
    const engineClass = this.engines[tournamentId];
    if (!engineClass) {
      throw new Error(`Tournament type '${tournamentId}' not found`);
    }
    return engineClass.getTournamentInfo();
  }

  /**
   * Create tournament engine instance
   * @param {string} tournamentId - Tournament type ID
   * @param {Array} players - Array of player objects
   * @param {Object} options - Tournament options
   * @returns {BaseTournamentEngine} Tournament engine instance
   */
  static createTournament(tournamentId, players = [], options = {}) {
    const EngineClass = this.engines[tournamentId];
    if (!EngineClass) {
      throw new Error(`Tournament type '${tournamentId}' not found`);
    }

    // Validate player count
    const tournamentInfo = EngineClass.getTournamentInfo();
    if (players.length < tournamentInfo.minPlayers) {
      throw new Error(`At least ${tournamentInfo.minPlayers} players required for ${tournamentInfo.name}`);
    }
    if (players.length > tournamentInfo.maxPlayers) {
      throw new Error(`Maximum ${tournamentInfo.maxPlayers} players allowed for ${tournamentInfo.name}`);
    }

    return new EngineClass(players, options);
  }

  /**
   * Validate tournament configuration
   * @param {string} tournamentId - Tournament type ID
   * @param {Array} players - Array of player objects
   * @param {Object} options - Tournament options
   * @returns {Object} Validation result
   */
  static validateTournamentConfig(tournamentId, players = [], options = {}) {
    const errors = [];
    const warnings = [];

    try {
      const tournamentInfo = this.getTournamentInfo(tournamentId);
      
      // Check player count
      if (players.length < tournamentInfo.minPlayers) {
        errors.push(`至少需要 ${tournamentInfo.minPlayers} 位選手`);
      }
      if (players.length > tournamentInfo.maxPlayers) {
        errors.push(`最多只能有 ${tournamentInfo.maxPlayers} 位選手`);
      }

      // Check for duplicate player names
      const playerNames = players.map(p => p.name.trim().toLowerCase());
      const duplicates = playerNames.filter((name, index) => 
        playerNames.indexOf(name) !== index
      );
      if (duplicates.length > 0) {
        errors.push('選手名稱不能重複');
      }

      // Tournament-specific validations
      if (tournamentId === 'elimination') {
        if (players.length > 16) {
          warnings.push('選手數量較多，比賽時間可能較長');
        }
      } else if (tournamentId === 'roundrobin') {
        const totalMatches = (players.length * (players.length - 1)) / 2;
        if (totalMatches > 28) {
          warnings.push(`總共需要進行 ${totalMatches} 場比賽，時間較長`);
        }
      } else if (tournamentId === 'streak') {
        if (players.length < 4) {
          warnings.push('連勝賽制建議至少 4 位選手，否則無法使用休息選項');
        }
      } else if (tournamentId === 'fixed-sequence') {
        if (players.length !== 4) {
          errors.push('固定順序賽制需要恰好 4 位選手');
        }
      }

    } catch (error) {
      errors.push(error.message);
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Get recommended tournament for player count
   * @param {number} playerCount - Number of players
   * @returns {string} Recommended tournament ID
   */
  static getRecommendedTournament(playerCount) {
    if (playerCount === 4) {
      return 'fixed-sequence'; // Prioritize fixed sequence for 4 players
    } else if (playerCount < 3) {
      return 'streak';
    } else if (playerCount <= 4) {
      return 'streak';
    } else if (playerCount <= 6) {
      return 'roundrobin';
    } else if (playerCount <= 16) {
      return 'elimination';
    } else {
      return 'elimination';
    }
  }

  /**
   * Calculate estimated duration for tournament
   * @param {string} tournamentId - Tournament type ID
   * @param {number} playerCount - Number of players
   * @param {number} avgMatchDuration - Average match duration in minutes
   * @returns {Object} Duration estimation
   */
  static estimateDuration(tournamentId, playerCount, avgMatchDuration = 2) {
    let totalMatches = 0;
    
    switch (tournamentId) {
      case 'elimination':
        totalMatches = playerCount - 1;
        break;
      case 'roundrobin':
        totalMatches = (playerCount * (playerCount - 1)) / 2;
        break;
      case 'streak':
        // Estimated based on typical streak tournament
        totalMatches = Math.floor(playerCount * 2.5);
        break;
      case 'fixed-sequence':
        totalMatches = 6; // Fixed 6 matches
        break;
      default:
        totalMatches = playerCount;
    }

    const totalMinutes = totalMatches * avgMatchDuration;
    
    return {
      totalMatches,
      estimatedMinutes: totalMinutes,
      formattedDuration: this.formatDuration(totalMinutes)
    };
  }

  /**
   * Format duration in minutes to readable string
   * @param {number} minutes - Duration in minutes
   * @returns {string} Formatted duration
   */
  static formatDuration(minutes) {
    if (minutes < 60) {
      return `${minutes} 分鐘`;
    } else {
      const hours = Math.floor(minutes / 60);
      const remainingMinutes = minutes % 60;
      return remainingMinutes > 0 
        ? `${hours} 小時 ${remainingMinutes} 分鐘`
        : `${hours} 小時`;
    }
  }

  /**
   * Get tournament engine options schema
   * @param {string} tournamentId - Tournament type ID
   * @returns {Object} Options schema
   */
  static getTournamentOptions(tournamentId) {
    switch (tournamentId) {
      case 'streak':
        return {
          allowRest: {
            type: 'boolean',
            default: true,
            label: '允許休息選項',
            description: '完成連勝後可選擇休息獲得分數'
          },
          restBonusPoints: {
            type: 'number',
            default: 1,
            min: 0,
            max: 5,
            label: '休息獎勵分數',
            description: '選擇休息時獲得的額外分數'
          },
          minPlayersForRest: {
            type: 'number',
            default: 4,
            min: 3,
            max: 12,
            label: '休息選項最少人數',
            description: '啟用休息選項所需的最少選手數'
          }
        };
        
      case 'elimination':
        return {
          seedingMethod: {
            type: 'select',
            default: 'position',
            options: [
              { value: 'position', label: '按位置排序' },
              { value: 'random', label: '隨機排序' },
              { value: 'score', label: '按分數排序' }
            ],
            label: '種子排序方式',
            description: '決定對戰表的種子排序方法'
          },
          bronzeMatch: {
            type: 'boolean',
            default: true,
            label: '季軍賽',
            description: '是否進行第三名爭奪戰'
          },
          byeAdvancement: {
            type: 'boolean',
            default: true,
            label: '允許輪空',
            description: '奇數選手時是否允許輪空晉級'
          }
        };
        
      case 'roundrobin':
        return {
          pointsPerWin: {
            type: 'number',
            default: 3,
            min: 1,
            max: 10,
            label: '勝利積分',
            description: '每場勝利獲得的積分'
          },
          pointsPerDraw: {
            type: 'number',
            default: 1,
            min: 0,
            max: 5,
            label: '平手積分',
            description: '每場平手獲得的積分'
          },
          pointsPerLoss: {
            type: 'number',
            default: 0,
            min: 0,
            max: 3,
            label: '失敗積分',
            description: '每場失敗獲得的積分'
          },
          allowDraws: {
            type: 'boolean',
            default: false,
            label: '允許平手',
            description: '是否允許比賽結果為平手'
          },
          doubleRoundRobin: {
            type: 'boolean',
            default: false,
            label: '雙循環',
            description: '每對選手對戰兩次'
          }
        };
        
      case 'fixed-sequence':
        return {
          pointsPerWin: {
            type: 'number',
            default: 1,
            min: 1,
            max: 3,
            label: '勝利積分',
            description: '每場勝利獲得的積分'
          },
          enableDatabaseSync: {
            type: 'boolean',
            default: true,
            label: '啟用資料庫同步',
            description: '將每場比賽結果同步到資料庫'
          }
        };
        
      default:
        return {};
    }
  }

  /**
   * Create tournament with validation
   * @param {string} tournamentId - Tournament type ID
   * @param {Array} players - Array of player objects
   * @param {Object} options - Tournament options
   * @returns {Object} Creation result
   */
  static createTournamentSafe(tournamentId, players = [], options = {}) {
    const validation = this.validateTournamentConfig(tournamentId, players, options);
    
    if (!validation.isValid) {
      return {
        success: false,
        errors: validation.errors,
        warnings: validation.warnings,
        tournament: null
      };
    }

    try {
      const tournament = this.createTournament(tournamentId, players, options);
      return {
        success: true,
        errors: [],
        warnings: validation.warnings,
        tournament
      };
    } catch (error) {
      return {
        success: false,
        errors: [error.message],
        warnings: validation.warnings,
        tournament: null
      };
    }
  }

  /**
   * Register a new tournament engine
   * @param {string} id - Tournament type ID
   * @param {class} engineClass - Tournament engine class
   */
  static registerTournament(id, engineClass) {
    this.engines[id] = engineClass;
  }

  /**
   * Unregister a tournament engine
   * @param {string} id - Tournament type ID
   */
  static unregisterTournament(id) {
    delete this.engines[id];
  }
}

export default TournamentEngineManager;
