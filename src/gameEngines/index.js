/**
 * Game Engines Index
 * Central export point for all tournament engines
 */

// Base Engine
export { BaseTournamentEngine } from './BaseTournamentEngine';

// Tournament Engines
export { StreakTournamentEngine } from './StreakTournamentEngine';
export { EliminationTournamentEngine } from './EliminationTournamentEngine';
export { RoundRobinTournamentEngine } from './RoundRobinTournamentEngine';
export { FixedSequenceTournamentEngine } from './FixedSequenceTournamentEngine';

// Legacy Engine (for backward compatibility)
export { StreakGameEngine } from './StreakGameEngine';

// Manager
export { TournamentEngineManager } from './TournamentEngineManager';

// Default export
export { TournamentEngineManager as default } from './TournamentEngineManager';

/**
 * Tournament Types Registry
 */
export const TOURNAMENT_TYPES = {
  STREAK: 'streak',
  ELIMINATION: 'elimination',
  ROUND_ROBIN: 'roundrobin',
  FIXED_SEQUENCE: 'fixed-sequence'
};

/**
 * Quick access to tournament info
 */
export const getTournamentInfo = (type) => {
  const { TournamentEngineManager } = require('./TournamentEngineManager');
  return TournamentEngineManager.getTournamentInfo(type);
};

/**
 * Create tournament instance
 */
export const createTournament = (type, players, options) => {
  const { TournamentEngineManager } = require('./TournamentEngineManager');
  return TournamentEngineManager.createTournament(type, players, options);
};
