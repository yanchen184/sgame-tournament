import React from 'react';
import './GameArena.css';

const GameArena = ({ currentFighters, showRestOption, streakWinner }) => {
  return (
    <div className="arena-section">
      <h3 className="section-title">⚔️ 競技場</h3>
      <div className="battle-area">
        <div className="fighter">
          {currentFighters[0] ? currentFighters[0].name : '等待選手'}
        </div>
        <div className="vs-indicator">VS</div>
        <div className="fighter">
          {currentFighters[1] ? currentFighters[1].name : '等待選手'}
        </div>
      </div>
      
      {showRestOption && (
        <div className="rest-option">
          <strong>🏆 連勝 4 場！</strong><br />
          {streakWinner?.name} 可選擇休息並額外得 1 分，或繼續比賽
        </div>
      )}
    </div>
  );
};

export default GameArena;