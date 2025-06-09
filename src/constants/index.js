/**
 * Application configuration constants
 */

// App version
export const APP_VERSION = 'v1.5.6';

// App modes - duplicated from GameContext for consistency
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

// Game configuration defaults
export const GAME_DEFAULTS = {
  DEFAULT_PLAYER_COUNT: 4,
  MIN_PLAYER_COUNT: 2,
  MAX_PLAYER_COUNT: 10,
  DEFAULT_PLAYER_NAMES: ['選手A', '選手B', '選手C', '選手D']
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
