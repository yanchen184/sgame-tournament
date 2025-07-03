/**
 * Fixed Sequence Arena Component
 * Shows current match in fixed sequence tournament (AB -> CD -> CA -> BD -> BC -> AD)
 */

import React from 'react';
import './GameArena.css';

const FixedSequenceArena = ({ 
  currentMatch, 
  onDeclareWinner, 
  isGameFinished,
  sequenceProgress
}) => {
  if (!currentMatch || !currentMatch.fighters || currentMatch.fighters.length < 2) {
    return (
      <div className="game-arena">
        <div className="arena-message">
          <h3>等待比賽開始...</h3>
        </div>
      </div>
    );
  }

  if (isGameFinished) {
    return (
      <div className="game-arena finished">
        <div className="arena-message">
          <h3>🏆 比賽結束</h3>
          <p>查看最終排名</p>
        </div>
      </div>
    );
  }

  const fighter1 = currentMatch.fighters[0];
  const fighter2 = currentMatch.fighters[1];

  // Handle player selection
  const handlePlayerClick = (playerName) => {
    onDeclareWinner(playerName);
  };

  return (
    <div className="game-arena enhanced">
      <div className="arena-header">
        <h3>🥊 固定順序對戰</h3>
        <div className="match-info">
          <span>第 {currentMatch.matchNumber} 場</span>
          <span>對戰模式: {currentMatch.pattern}</span>
          {sequenceProgress && (
            <span>進度: {sequenceProgress.current}/{sequenceProgress.total}</span>
          )}
        </div>
      </div>

      <div className="arena-main">
        {/* Fighter 1 Section */}
        <div className="player-section left">
          <div 
            className="player-card clickable"
            onClick={() => handlePlayerClick(fighter1.name)}
          >
            <div className="player-info">
              <div className="player-label">{fighter1.label}</div>
              <h4>{fighter1.name}</h4>
              <div className="player-stats">
                <span className="wins">勝場: {fighter1.wins || 0}</span>
                <span className="points">積分: {fighter1.points || 0}</span>
              </div>
            </div>
            
            <div className="click-hint">點擊宣布勝利</div>
          </div>
        </div>

        {/* VS Section */}
        <div className="vs-section">
          <div className="vs-icon">VS</div>
          <div className="match-status">
            <span>點擊選手宣布勝利</span>
          </div>
          <div className="sequence-info">
            <div className="sequence-pattern">
              <span className="pattern-label">對戰組合:</span>
              <span className="pattern-value">{currentMatch.pattern}</span>
            </div>
          </div>
        </div>

        {/* Fighter 2 Section */}
        <div className="player-section right">
          <div 
            className="player-card clickable"
            onClick={() => handlePlayerClick(fighter2.name)}
          >
            <div className="player-info">
              <div className="player-label">{fighter2.label}</div>
              <h4>{fighter2.name}</h4>
              <div className="player-stats">
                <span className="wins">勝場: {fighter2.wins || 0}</span>
                <span className="points">積分: {fighter2.points || 0}</span>
              </div>
            </div>
            
            <div className="click-hint">點擊宣布勝利</div>
          </div>
        </div>
      </div>

      {/* Sequence Progress Bar */}
      {sequenceProgress && (
        <div className="sequence-progress">
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${(sequenceProgress.current / sequenceProgress.total) * 100}%` }}
            />
          </div>
          <div className="progress-text">
            已完成 {sequenceProgress.current} / {sequenceProgress.total} 場比賽
          </div>
        </div>
      )}
    </div>
  );
};

export default FixedSequenceArena;
