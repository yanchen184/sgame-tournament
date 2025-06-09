import React from 'react';

// Context
import { useGame } from '../contexts/GameContext';

/**
 * Final results overlay component
 * Displays the final rankings and game statistics
 */
const FinalResults = ({ onReturnToMenu }) => {
  const {
    players,
    battleCount,
    playerCount,
    gameHistory,
    setGameEnded,
    setGameStarted,
    setPlayers,
    setGameHistory,
    setBattleCount
  } = useGame();

  // Calculate final rankings
  const finalRankedPlayers = [...players].sort((a, b) => {
    if (b.score !== a.score) {
      return b.score - a.score;
    }
    return b.winStreak - a.winStreak;
  });

  const winner = finalRankedPlayers[0];

  // Handle return to main menu
  const handleReturnToMenu = () => {
    setGameEnded(false);
    setGameStarted(false);
    setPlayers([]);
    setGameHistory([]);
    setBattleCount(0);
    onReturnToMenu();
  };

  return (
    <div className="final-results-overlay">
      <div className="final-results-modal">
        <div className="final-results-header">
          <h3>🏆 最終排名</h3>
          <div className="champion-highlight">
            🏆 冠軍：{winner?.name || 'Unknown'}
          </div>
        </div>
        
        <div className="final-rankings">
          {finalRankedPlayers.map((player, index) => (
            <div key={player.id} className={`ranking-item rank-${index + 1}`}>
              <span className="rank-number">
                {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
              </span>
              <span className="player-name">{player.name}</span>
              <span className="player-stats">
                <span className="score">{player.score}分</span>
                {player.winStreak > 0 && (
                  <span className="streak">{player.winStreak}連勝</span>
                )}
              </span>
            </div>
          ))}
        </div>
        
        <div className="final-stats">
          <div className="stat-item">
            <span className="stat-label">總戰鬥數：</span>
            <span className="stat-value">{battleCount}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">參賽人數：</span>
            <span className="stat-value">{playerCount}</span>
          </div>
        </div>
        
        <div className="final-actions">
          <button 
            className="btn primary-btn"
            onClick={handleReturnToMenu}
          >
            🏠 返回主選單
          </button>
        </div>
      </div>
    </div>
  );
};

export default FinalResults;
