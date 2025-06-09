// Game Engines Export
export { BaseTournamentEngine } from './BaseTournamentEngine';
export { StreakTournamentEngine } from './StreakTournamentEngine';
export { EliminationTournamentEngine } from './EliminationTournamentEngine';
export { RoundRobinTournamentEngine } from './RoundRobinTournamentEngine';
export { TournamentEngineManager } from './TournamentEngineManager';

// Tournament Types Constants
export const TOURNAMENT_TYPES = {
  STREAK: 'streak',
  ELIMINATION: 'elimination',
  ROUND_ROBIN: 'roundrobin'
};

// Tournament Phases Constants
export const TOURNAMENT_PHASES = {
  SETUP: 'setup',
  PLAYING: 'playing',
  FINISHED: 'finished'
};

// Available Actions Constants
export const TOURNAMENT_ACTIONS = {
  START_TOURNAMENT: 'startTournament',
  DECLARE_WINNER: 'declareWinner',
  TAKE_REST: 'takeRest',
  CONTINUE_PLAY: 'continuePlay',
  UNDO_ACTION: 'undoAction',
  END_TOURNAMENT: 'endTournament'
};

// Utility function to get all tournament types
export const getAllTournamentTypes = () => {
  return TournamentEngineManager.getAvailableTournaments();
};

// Utility function to create tournament safely
export const createTournamentSafe = (tournamentId, players, options = {}) => {
  return TournamentEngineManager.createTournamentSafe(tournamentId, players, options);
};

// Utility function to validate tournament configuration
export const validateTournament = (tournamentId, players, options = {}) => {
  return TournamentEngineManager.validateTournamentConfig(tournamentId, players, options);
};

// Utility function to get recommended tournament
export const getRecommendedTournament = (playerCount) => {
  return TournamentEngineManager.getRecommendedTournament(playerCount);
};

// Default export
export default {
  TournamentEngineManager,
  TOURNAMENT_TYPES,
  TOURNAMENT_PHASES,
  TOURNAMENT_ACTIONS,
  getAllTournamentTypes,
  createTournamentSafe,
  validateTournament,
  getRecommendedTournament
};