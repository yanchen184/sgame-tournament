import React from 'react';
import './PlayerQueue.css';

const PlayerQueue = ({ players, currentFighters, currentChampion, championBeatenOpponents, layout = 'desktop' }) => {
  // Enhanced queue logic to correctly determine next player and full queue order
  const getQueueInfo = () => {
    console.log('=== ENHANCED PLAYER QUEUE ANALYSIS ===');
    console.log('All players:', players.map(p => `${p.name}(pos:${p.position})`));
    console.log('Current fighters:', currentFighters.map(f => f?.name || 'null'));
    console.log('Current champion:', currentChampion?.name);
    console.log('Champion beaten opponents:', championBeatenOpponents?.map(p => p.name) || []);
    
    // Get players not currently fighting
    const waitingPlayers = players.filter(player => 
      !currentFighters.some(fighter => fighter && fighter.id === player.id)
    );
    
    console.log('Waiting players:', waitingPlayers.map(p => `${p.name}(pos:${p.position})`));
    
    // If no current champion, return players in position order
    if (!currentChampion) {
      const sortedWaiting = waitingPlayers.sort((a, b) => a.position - b.position);
      console.log('No champion, queue by position:', sortedWaiting.map(p => p.name));
      return {
        nextPlayer: sortedWaiting[0] || null,
        queueOrder: sortedWaiting,
        fullQueueOrder: sortedWaiting // Show all waiting players
      };
    }
    
    // Filter available challengers (not already beaten by champion)
    const availableChallengers = waitingPlayers.filter(player => 
      !championBeatenOpponents?.some(beaten => beaten.id === player.id)
    );
    
    console.log('Available challengers (not beaten):', availableChallengers.map(p => p.name));
    
    // Find next challenger in rotation order starting from champion's position
    let nextChallenger = null;
    if (availableChallengers.length > 0) {
      const championPosition = currentChampion.position;
      console.log('Champion position:', championPosition);
      
      // Search in rotation order starting from champion's next position
      for (let i = 1; i < players.length; i++) {
        const searchPosition = (championPosition + i) % players.length;
        console.log(`Checking position ${searchPosition}...`);
        
        const candidate = players.find(p => p.position === searchPosition);
        if (candidate && availableChallengers.some(ac => ac.id === candidate.id)) {
          nextChallenger = candidate;
          console.log(`Found next challenger: ${candidate.name} at position ${searchPosition}`);
          break;
        }
      }
    }
    
    // Create comprehensive queue order
    let queueOrder = [];
    let fullQueueOrder = [];
    
    // Start with the next challenger
    if (nextChallenger) {
      queueOrder.push(nextChallenger);
      fullQueueOrder.push(nextChallenger);
    }
    
    // Add remaining waiting players in position order, excluding next challenger
    const remainingWaiting = waitingPlayers.filter(p => 
      !nextChallenger || p.id !== nextChallenger.id
    ).sort((a, b) => a.position - b.position);
    
    queueOrder.push(...remainingWaiting);
    fullQueueOrder.push(...remainingWaiting);
    
    // If there's a next challenger, create detailed order showing:
    // 1. Next to fight
    // 2. Other available challengers
    // 3. Already beaten players (marked as such)
    if (nextChallenger && championBeatenOpponents && championBeatenOpponents.length > 0) {
      const beatenButWaiting = waitingPlayers.filter(player => 
        championBeatenOpponents.some(beaten => beaten.id === player.id)
      ).sort((a, b) => a.position - b.position);
      
      // Full order: next challenger -> other available -> beaten players
      const otherAvailableChallengers = availableChallengers.filter(p => p.id !== nextChallenger.id)
        .sort((a, b) => a.position - b.position);
      
      fullQueueOrder = [
        nextChallenger,
        ...otherAvailableChallengers,
        ...beatenButWaiting
      ];
    }
    
    console.log('Next challenger found:', nextChallenger?.name || 'none');
    console.log('Queue order:', queueOrder.map(p => `${p.name}(pos:${p.position})`));
    console.log('Full detailed queue:', fullQueueOrder.map(p => {
      const isBeaten = championBeatenOpponents?.some(beaten => beaten.id === p.id);
      return `${p.name}(pos:${p.position})${isBeaten ? '[beaten]' : ''}`;
    }));
    console.log('=== END ENHANCED QUEUE ANALYSIS ===');
    
    return {
      nextPlayer: nextChallenger || queueOrder[0] || null,
      queueOrder: queueOrder,
      fullQueueOrder: fullQueueOrder // Complete ordered list for display
    };
  };
  
  const { nextPlayer, queueOrder, fullQueueOrder } = getQueueInfo();

  // Mobile layout - focus on next player
  if (layout === 'mobile') {
    return (
      <div className="queue-section mobile-queue">
        <h3 className="section-title">👀 等待隊伍</h3>
        
        {nextPlayer ? (
          <div className="queue-mobile-container">
            <div className="next-player-highlight">
              <div className="next-player-card">
                <div className="player-avatar">
                  🥊
                </div>
                <div className="next-player-info">
                  <h4 className="next-player-name">{nextPlayer.name}</h4>
                  <div className="next-player-stats">
                    <span className="next-score">積分: {nextPlayer.score}</span>
                    {nextPlayer.winStreak > 0 && (
                      <span className="next-streak">🔥 {nextPlayer.winStreak} 連勝</span>
                    )}
                  </div>
                </div>
                <div className="ready-badge">
                  下一位上場
                </div>
              </div>
            </div>
            
            {fullQueueOrder && fullQueueOrder.length > 1 && (
              <div className="full-queue-list">
                <h4 className="queue-title">完整隊伍順序：</h4>
                <div className="queue-players">
                  {fullQueueOrder.map((player, index) => {
                    const isBeaten = championBeatenOpponents?.some(beaten => beaten.id === player.id);
                    const isNext = index === 0;
                    
                    return (
                      <div key={player.id} className={`queue-player ${isNext ? 'next-up' : ''} ${isBeaten ? 'beaten-player' : ''}`}>
                        <span className="queue-position">#{index + 1}</span>
                        <span className="queue-player-name">
                          {player.name}
                          {isBeaten && <span className="beaten-indicator">已挑戰</span>}
                        </span>
                        <span className="queue-player-score">{player.score}分</span>
                        {player.winStreak > 0 && (
                          <span className="queue-win-streak">🔥{player.winStreak}</span>
                        )}
                        {isNext && <span className="next-indicator">⭐</span>}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
            
            {/* Show message if queue is empty */}
            {(!fullQueueOrder || fullQueueOrder.length === 0) && (
              <div className="empty-queue-message">
                <p>沒有等待的選手</p>
              </div>
            )}
          </div>
        ) : (
          <div className="no-next-player">
            <div className="waiting-icon">⏳</div>
            <p>等待下一位選手...</p>
          </div>
        )}
      </div>
    );
  }

  // Desktop layout - show full queue
  return (
    <div className="queue-section">
      <h3 className="section-title">📋 等待隊伍</h3>
      <div className="queue-container">
        {fullQueueOrder && fullQueueOrder.length > 0 ? (
          fullQueueOrder.map((player, index) => {
            const isNext = index === 0;
            const isBeaten = championBeatenOpponents?.some(beaten => beaten.id === player.id);
            
            return (
              <div 
                key={player.id} 
                className={`player ${isNext ? 'next-player' : ''} ${isBeaten ? 'beaten-player' : ''}`}
              >
                <div className="player-info">
                  <span className="player-name">
                    {player.name}
                    {isNext && (
                      <span className="next-indicator">
                        ⚡ 下一位上場
                      </span>
                    )}
                    {isBeaten && (
                      <span className="beaten-badge">
                        已挑戰
                      </span>
                    )}
                  </span>
                  {player.winStreak > 0 && (
                    <span className="win-streak">🔥 {player.winStreak} 連勝</span>
                  )}
                </div>
                <span className="player-score">{player.score}分</span>
                {isNext && (
                  <div className="next-glow"></div>
                )}
              </div>
            );
          })
        ) : (
          <div className="empty-queue">
            <p>目前沒有等待的選手</p>
          </div>
        )}
      </div>
      
      {nextPlayer && (
        <div className="next-player-alert">
          <div className="alert-icon">👀</div>
          <div className="alert-text">
            <strong>{nextPlayer.name}</strong> 準備上場！
          </div>
        </div>
      )}
    </div>
  );
};

export default PlayerQueue;