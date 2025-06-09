import { useState } from 'react';

/**
 * Custom hook for managing match logic and player transitions
 * Handles challenger finding, match setup, and player transitions
 */
export const useMatchManager = () => {
  const [isTransitioning, setIsTransitioning] = useState(false);

  /**
   * Find next challenger for the champion
   * Looks for players who haven't been beaten yet
   */
  const findNextChallenger = (playerList, champion, beatenOpponents) => {
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
   * Setup match between other players (for rest scenario)
   * Excludes resting player and recently beaten players
   */
  const setupMatchBetweenOthers = (playerList, excludedPlayerId = null, recentlyBeatenPlayers = []) => {
    console.log('=== SETUP MATCH BETWEEN OTHERS ===');
    console.log('All players:', playerList.map(p => `${p.name}(pos:${p.position})`));
    console.log('Excluded player ID (resting):', excludedPlayerId);
    
    // Find the last beaten player
    const lastBeatenPlayer = recentlyBeatenPlayers.length > 0 
      ? recentlyBeatenPlayers[recentlyBeatenPlayers.length - 1] 
      : null;
    console.log('Last beaten player:', lastBeatenPlayer?.name);

    // Filter available players
    const availablePlayers = playerList.filter(player => 
      player.id !== excludedPlayerId && // Not the resting player
      player.id !== lastBeatenPlayer?.id // Not the last beaten player
    );
    
    console.log('Available players:', availablePlayers.map(p => `${p.name}(pos:${p.position})`));
    
    if (availablePlayers.length < 2) {
      console.log('Not enough available players for a match');
      return null;
    }

    // Sort by position and select first two
    const sortedPlayers = availablePlayers.sort((a, b) => a.position - b.position);
    const newFighters = [sortedPlayers[0], sortedPlayers[1]];
    
    console.log('✅ New match setup between:', newFighters.map(p => `${p.name}(pos:${p.position})`));
    console.log('=== END SETUP ===');
    
    return newFighters;
  };

  /**
   * Find next opponent in rotation
   */
  const findNextOpponent = (playerList, currentPlayer) => {
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
   * Trigger player transition animation
   */
  const triggerPlayerTransition = (type, currentFighters, nextPlayer, onComplete) => {
    if (isTransitioning) {
      console.log('Already transitioning, skipping animation');
      if (onComplete) onComplete();
      return;
    }

    console.log('Triggering player transition:', { type, nextPlayer: nextPlayer?.name });
    
    setIsTransitioning(true);
    
    // Set up transition data
    const transitionData = {
      currentFighters: [...currentFighters],
      nextPlayer: nextPlayer,
      onComplete: () => {
        setIsTransitioning(false);
        if (onComplete) onComplete();
      }
    };

    return transitionData;
  };

  return {
    findNextChallenger,
    setupMatchBetweenOthers,
    findNextOpponent,
    triggerPlayerTransition,
    isTransitioning
  };
};
