// Game utility functions

/**
 * Shuffle array utility function using Fisher-Yates algorithm
 * @param {Array} array - Array to shuffle
 * @returns {Array} - New shuffled array
 */
export const shuffleArray = (array) => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

/**
 * Get default player names based on count
 * @param {number} count - Number of default names to return
 * @returns {Array<string>} - Array of default player names
 */
export const getDefaultPlayerNames = (count = 4) => {
  const baseNames = ['bob', 'jimmy', 'white', 'dada', 'alex', 'sam', 'chris', 'taylor'];
  return baseNames.slice(0, count);
};

/**
 * Create initial player data template
 * @param {Array<string>} names - Player names
 * @param {number} playerCount - Total number of players
 * @returns {Array<Object>} - Array of player objects
 */
export const createInitialPlayers = (names = getDefaultPlayerNames(), playerCount = 4) => {
  return names.slice(0, playerCount).map((name, index) => ({
    id: index + 1,
    name: name || `Player${index + 1}`,
    score: 0,
    winStreak: 0,
    position: index,
    defeatedBy: []
  }));
};

/**
 * Generate unique room number using timestamp and random number
 * @returns {Promise<string>} - Generated room number
 */
export const generateRoomNumber = async () => {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 100);
  return `${String(timestamp).slice(-6)}${String(random).padStart(2, '0')}`;
};

/**
 * Find next challenger for the champion based on position order
 * @param {Array<Object>} playerList - List of all players
 * @param {Object} champion - Current champion player
 * @param {Array<Object>} beatenOpponents - List of already beaten opponents
 * @returns {Object|null} - Next challenger or null if none available
 */
export const findNextChallenger = (playerList, champion, beatenOpponents) => {
  console.log('Finding next challenger for champion:', champion.name);
  console.log('Already beaten opponents:', beatenOpponents.map(p => p.name));
  
  const availableChallengers = playerList.filter(player => 
    player.id !== champion.id && 
    !beatenOpponents.some(beaten => beaten.id === player.id)
  );
  
  console.log('Available challengers:', availableChallengers.map(p => p.name));
  
  if (availableChallengers.length === 0) {
    console.log('No available challengers');
    return null;
  }

  // Find next challenger in position order
  const championPosition = champion.position;
  let nextChallenger = null;
  
  for (let i = 1; i < playerList.length; i++) {
    const nextPosition = (championPosition + i) % playerList.length;
    const candidate = playerList.find(p => p.position === nextPosition);
    if (candidate && availableChallengers.some(ac => ac.id === candidate.id)) {
      nextChallenger = candidate;
      break;
    }
  }

  console.log('Next challenger found:', nextChallenger?.name || 'none');
  return nextChallenger;
};

/**
 * Setup match between other players (improved logic for rest scenario)
 * @param {Array<Object>} playerList - List of all players
 * @param {number|null} excludedPlayerId - ID of player to exclude (resting player)
 * @param {Array<Object>} recentlyBeatenPlayers - List of recently beaten players
 * @returns {Array<Object>|null} - Array of two fighters or null if not possible
 */
export const setupMatchBetweenOthers = (playerList, excludedPlayerId = null, recentlyBeatenPlayers = []) => {
  console.log('=== SETUP MATCH BETWEEN OTHERS ===');
  console.log('All players:', playerList.map(p => `${p.name}(pos:${p.position})`));
  console.log('Excluded player ID (resting):', excludedPlayerId);
  
  // Find the last beaten player
  const lastBeatenPlayer = recentlyBeatenPlayers.length > 0 
    ? recentlyBeatenPlayers[recentlyBeatenPlayers.length - 1] 
    : null;
  console.log('Last beaten player:', lastBeatenPlayer?.name);

  // Filter available players: exclude resting player and last beaten player
  const availablePlayers = playerList.filter(player => 
    player.id !== excludedPlayerId && // Not the resting player
    player.id !== lastBeatenPlayer?.id // Not the last beaten player
  );
  
  console.log('Available players:', availablePlayers.map(p => `${p.name}(pos:${p.position})`));
  
  if (availablePlayers.length < 2) {
    console.log('Not enough available players for a match');
    return null;
  }

  // Sort by position and select first two for battle
  const sortedPlayers = availablePlayers.sort((a, b) => a.position - b.position);
  const newFighters = [sortedPlayers[0], sortedPlayers[1]];
  
  console.log('✅ New match setup between:', newFighters.map(p => `${p.name}(pos:${p.position})`));
  console.log('=== END SETUP ===');
  
  return newFighters;
};

/**
 * Find next opponent in rotation for a player
 * @param {Array<Object>} playerList - List of all players
 * @param {Object} currentPlayer - Current player to find opponent for
 * @returns {Object|null} - Next opponent or null if none found
 */
export const findNextOpponent = (playerList, currentPlayer) => {
  console.log('Finding next opponent for:', currentPlayer.name);
  
  const currentPosition = currentPlayer.position;
  console.log('Current player position:', currentPosition);
  
  for (let i = 1; i < playerList.length; i++) {
    const nextPosition = (currentPosition + i) % playerList.length;
    const candidate = playerList.find(p => p.position === nextPosition);
    console.log(`Checking position ${nextPosition}, found:`, candidate?.name);
    
    if (candidate && candidate.id !== currentPlayer.id) {
      console.log('Next opponent found:', candidate.name);
      return candidate;
    }
  }
  
  console.log('No next opponent found');
  return null;
};

/**
 * Create match result object
 * @param {number} battleNumber - Battle number
 * @param {Object} winner - Winner player object
 * @param {Object} loser - Loser player object
 * @param {number} winnerScore - Winner's updated score
 * @param {string} type - Type of match result ('match', 'rest', 'final')
 * @returns {Object} - Match result object
 */
export const createMatchResult = (battleNumber, winner, loser, winnerScore, type = 'match') => {
  const baseResult = {
    battleNumber,
    timestamp: new Date().toISOString(),
    id: `${type}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  };

  if (type === 'rest') {
    return {
      ...baseResult,
      type: 'rest',
      player: winner.name,
      action: '選擇休息並獲得1分'
    };
  }

  if (type === 'final') {
    return {
      ...baseResult,
      type: 'final',
      winner: winner.name,
      action: `比賽結束！冠軍是 ${winner.name}`
    };
  }

  return {
    ...baseResult,
    winner: winner.name,
    loser: loser.name,
    winnerScore
  };
};
