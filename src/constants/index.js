/**
 * Application configuration constants - Fixed Sequence Tournament System
 */

// App version - Fixed Sequence Tournament System
export const APP_VERSION = 'v3.0.0';

// App modes - Including room functionality
export const APP_MODES = {
  ROOM_BROWSER: 'room-browser',
  PLAYER_SETUP: 'player-setup', 
  GAME: 'game',
  HISTORY: 'history'
};

// Status message types
export const STATUS_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info'
};

// Game configuration for fixed sequence tournament
export const GAME_DEFAULTS = {
  DEFAULT_PLAYER_COUNT: 4,
  MIN_PLAYER_COUNT: 4,
  MAX_PLAYER_COUNT: 4,
  DEFAULT_PLAYER_NAMES: ['選手A', '選手B', '選手C', '選手D']
};

// Fixed sequence tournament specific settings
export const FIXED_SEQUENCE_CONFIG = {
  REQUIRED_PLAYERS: 4,
  SEQUENCE_PATTERN: ['AB', 'CD', 'CA', 'BD', 'BC', 'AD'],
  POINTS_PER_WIN: 1,
  POINTS_PER_LOSS: 0,
  TOTAL_MATCHES: 6
};

// Firebase configuration
export const FIREBASE_DEFAULTS = {
  ROOM_CODE_LENGTH: 6,
  MAX_ROOM_NAME_LENGTH: 50,
  ROOM_EXPIRY_HOURS: 24
};

// UI configuration
export const UI_CONFIG = {
  STATUS_AUTO_DISMISS_DELAY: 3000, // 3 seconds
  ANIMATION_DURATION: 300, // 0.3 seconds
  MOBILE_BREAKPOINT: 768
};
