/**
 * Application configuration constants - Simplified for Streak Tournament Only
 */

// App version - Updated for simplified version
export const APP_VERSION = 'v1.4.0';

// App modes - Simplified to core functionality
export const APP_MODES = {
  PLAYER_SETUP: 'player-setup',
  GAME: 'game'
};

// Status message types
export const STATUS_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info'
};

// Game configuration for streak tournament
export const GAME_DEFAULTS = {
  DEFAULT_PLAYER_COUNT: 4,
  MIN_PLAYER_COUNT: 3,
  MAX_PLAYER_COUNT: 8,
  DEFAULT_PLAYER_NAMES: ['選手A', '選手B', '選手C', '選手D', '選手E', '選手F', '選手G', '選手H']
};

// Streak tournament specific settings
export const STREAK_CONFIG = {
  // Consecutive wins needed for rest option = playerCount - 1
  getRestRequirement: (playerCount) => playerCount - 1,
  REST_BONUS_POINTS: 1,
  POINTS_PER_WIN: 1
};

// UI configuration
export const UI_CONFIG = {
  STATUS_AUTO_DISMISS_DELAY: 3000, // 3 seconds
  ANIMATION_DURATION: 300, // 0.3 seconds
  MOBILE_BREAKPOINT: 768
};
