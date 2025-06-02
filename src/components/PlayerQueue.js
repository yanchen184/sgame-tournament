import React from 'react';
import './PlayerQueue.css';

const PlayerQueue = ({ players, currentFighters }) => {
  // Get players in queue (not fighting and not resting)
  const queuePlayers = players
    .filter(player => 
      !player.resting && 
      !currentFighters.some(fighter => fighter && fighter.id === player.id)
    )
    .sort((a, b) => a.position - b.position);

  return (
    <div className="queue-section">
      <h3 className="section-title">📋 等待隊伍</h3>
      <div className="queue-container">
        {queuePlayers.map(player => (
          <div key={player.id} className="player">
            <div className="player-info">
              <span className="player-name">{player.name}</span>
              {player.winStreak > 0 && (
                <span className="win-streak">{player.winStreak} 連勝</span>
              )}
            </div>
            <span className="player-score">{player.score}</span>
          </div>
        ))}
        
        {queuePlayers.length === 0 && (
          <div className="empty-queue">
            <p>目前沒有等待的選手</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PlayerQueue;