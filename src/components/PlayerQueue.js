import React from 'react';
import './PlayerQueue.css';

const PlayerQueue = ({ players, currentFighters, layout = 'desktop' }) => {
  // Get players in queue (not fighting and not resting)
  const queuePlayers = players
    .filter(player => 
      !player.resting && 
      !currentFighters.some(fighter => fighter && fighter.id === player.id)
    )
    .sort((a, b) => a.position - b.position);

  // Get next player (first in queue)
  const nextPlayer = queuePlayers[0];

  // Mobile layout - focus on next player
  if (layout === 'mobile') {
    return (
      <div className="queue-section mobile-queue">
        <h3 className="section-title">👀 下一位上場</h3>
        
        {nextPlayer ? (
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
                準備就緒
              </div>
            </div>
            
            {queuePlayers.length > 1 && (
              <div className="queue-count">
                還有 {queuePlayers.length - 1} 位選手在等待
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
        {queuePlayers.map((player, index) => {
          const isNext = index === 0 && queuePlayers.length > 0;
          
          return (
            <div 
              key={player.id} 
              className={`player ${isNext ? 'next-player' : ''}`}
            >
              <div className="player-info">
                <span className="player-name">
                  {player.name}
                  {isNext && (
                    <span className="next-indicator">
                      ⚡ 下一位上場
                    </span>
                  )}
                </span>
                {player.winStreak > 0 && (
                  <span className="win-streak">{player.winStreak} 連勝</span>
                )}
              </div>
              <span className="player-score">{player.score}</span>
              {isNext && (
                <div className="next-glow"></div>
              )}
            </div>
          );
        })}
        
        {queuePlayers.length === 0 && (
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