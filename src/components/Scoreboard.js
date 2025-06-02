import React from 'react';
import './Scoreboard.css';

const Scoreboard = ({ players, currentFighters }) => {
  // Sort players by score (descending)
  const sortedPlayers = [...players].sort((a, b) => b.score - a.score);

  return (
    <div className="scoreboard">
      <h3 className="section-title">🏆 積分榜</h3>
      <div className="scoreboard-container">
        {sortedPlayers.map((player, index) => {
          const isInArena = currentFighters.some(fighter => fighter && fighter.id === player.id);
          
          return (
            <div 
              key={player.id} 
              className={`player ${isInArena ? 'in-arena' : ''} ${player.resting ? 'resting' : ''}`}
            >
              <div className="player-info">
                <span className="player-rank">{index + 1}.</span>
                <span className="player-name">{player.name}</span>
                <div className="player-badges">
                  {player.winStreak > 0 && (
                    <span className="win-streak">{player.winStreak} 連勝</span>
                  )}
                  {player.resting && (
                    <span className="resting-badge">休息中</span>
                  )}
                  {isInArena && (
                    <span className="fighting-badge">比賽中</span>
                  )}
                </div>
              </div>
              <span className="player-score">{player.score}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Scoreboard;