import React from 'react';
import './GameArena.css';

const GameArena = ({ currentFighters, showRestOption, streakWinner, onPlayerClick }) => {
  
  // Handle player click for victory declaration
  const handlePlayerClick = (playerName) => {
    if (onPlayerClick && !showRestOption && currentFighters[0] && currentFighters[1]) {
      onPlayerClick(playerName);
    }
  };

  return (
    <div className="arena-section">
      <h3 className="section-title">⚔️ 競技場</h3>
      <div className="battle-area">
        <div 
          className={`fighter ${currentFighters[0] ? 'clickable' : ''} ${showRestOption ? 'disabled' : ''}`}
          onClick={() => currentFighters[0] && handlePlayerClick(currentFighters[0].name)}
          title={currentFighters[0] && !showRestOption ? `點擊讓 ${currentFighters[0].name} 獲勝` : ''}
        >
          {currentFighters[0] ? currentFighters[0].name : '等待選手'}
          {currentFighters[0] && !showRestOption && (
            <div className="click-hint">點擊獲勝</div>
          )}
        </div>
        <div className="vs-indicator">VS</div>
        <div 
          className={`fighter ${currentFighters[1] ? 'clickable' : ''} ${showRestOption ? 'disabled' : ''}`}
          onClick={() => currentFighters[1] && handlePlayerClick(currentFighters[1].name)}
          title={currentFighters[1] && !showRestOption ? `點擊讓 ${currentFighters[1].name} 獲勝` : ''}
        >
          {currentFighters[1] ? currentFighters[1].name : '等待選手'}
          {currentFighters[1] && !showRestOption && (
            <div className="click-hint">點擊獲勝</div>
          )}
        </div>
      </div>
      
      {showRestOption && (
        <div className="rest-option">
          <strong>🏆 完成一輪挑戰！</strong><br />
          {streakWinner?.name} 可選擇休息得 1 分或繼續比賽
        </div>
      )}
    </div>
  );
};

export default GameArena;