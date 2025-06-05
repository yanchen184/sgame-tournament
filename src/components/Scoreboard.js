import React from 'react';
import './Scoreboard.css';

const Scoreboard = ({ players, currentFighters, layout = 'desktop' }) => {
  // Sort players by score (descending)
  const sortedPlayers = [...players].sort((a, b) => b.score - a.score);

  return (
    <div className={`scoreboard ${layout === 'mobile' ? 'mobile-scoreboard' : ''}`}>
      <h3 className="section-title">🏆 積分榜</h3>
      <div className="scoreboard-container">
        {sortedPlayers.map((player, index) => {
          const isInArena = currentFighters.some(fighter => fighter && fighter.id === player.id);
          
          return (
            <div 
              key={player.id} 
              className={`player ${isInArena ? 'in-arena' : ''} ${index === 0 ? 'first-place' : ''}`}
            >
              <div className="player-info">
                <span className={`player-rank ${index === 0 ? 'rank-first' : ''}`}>
                  {index === 0 && layout === 'mobile' ? '👑' : `${index + 1}.`}
                </span>
                <span className="player-name">{player.name}</span>
                <div className="player-badges">
                  {player.winStreak > 0 && (
                    <span className="win-streak">{player.winStreak} 連勝</span>
                  )}
                  {isInArena && (
                    <span className="fighting-badge">比賽中</span>
                  )}
                </div>
              </div>
              <span className={`player-score ${index === 0 ? 'score-first' : ''}`}>
                {player.score}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Scoreboard;