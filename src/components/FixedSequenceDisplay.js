/**
 * Fixed Sequence Display Component
 * Shows the complete match sequence and current progress
 */

import React from 'react';
import './FixedSequenceDisplay.css';

const FixedSequenceDisplay = ({ 
  sequence = ['AB', 'CD', 'CA', 'BD', 'BC', 'AD'],
  currentIndex = 0,
  completedMatches = [],
  players = []
}) => {
  
  // Get player name by label
  const getPlayerNameByLabel = (label) => {
    const player = players.find(p => p.label === label);
    return player ? player.name : label;
  };

  // Get match result
  const getMatchResult = (index) => {
    const match = completedMatches[index];
    return match ? match.winnerName : null;
  };

  return (
    <div className="fixed-sequence-display">
      <div className="sequence-header">
        <h3>🎯 對戰序列</h3>
        <div className="sequence-info">
          <span>進度: {currentIndex}/6</span>
        </div>
      </div>

      <div className="sequence-list">
        {sequence.map((pattern, index) => {
          const isCompleted = index < currentIndex;
          const isCurrent = index === currentIndex;
          const isPending = index > currentIndex;
          const winner = getMatchResult(index);

          const [label1, label2] = pattern.split('');
          const player1Name = getPlayerNameByLabel(label1);
          const player2Name = getPlayerNameByLabel(label2);

          return (
            <div 
              key={index}
              className={`sequence-item ${
                isCompleted ? 'completed' : 
                isCurrent ? 'current' : 
                'pending'
              }`}
            >
              <div className="match-number">
                第 {index + 1} 場
              </div>
              
              <div className="match-pattern">
                <span className="pattern-display">{pattern}</span>
              </div>
              
              <div className="match-players">
                <div className="player-vs">
                  <span className="player-label">{label1}</span>
                  <span className="player-name">{player1Name}</span>
                </div>
                <div className="vs-divider">VS</div>
                <div className="player-vs">
                  <span className="player-label">{label2}</span>
                  <span className="player-name">{player2Name}</span>
                </div>
              </div>
              
              <div className="match-status">
                {isCompleted && winner && (
                  <div className="winner-info">
                    <span className="winner-icon">🏆</span>
                    <span className="winner-name">{winner}</span>
                  </div>
                )}
                {isCurrent && (
                  <div className="current-info">
                    <span className="current-icon">⚡</span>
                    <span className="current-text">進行中</span>
                  </div>
                )}
                {isPending && (
                  <div className="pending-info">
                    <span className="pending-icon">⏳</span>
                    <span className="pending-text">等待中</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="sequence-summary">
        <div className="summary-item">
          <span className="summary-label">已完成:</span>
          <span className="summary-value">{currentIndex} 場</span>
        </div>
        <div className="summary-item">
          <span className="summary-label">剩餘:</span>
          <span className="summary-value">{sequence.length - currentIndex} 場</span>
        </div>
        <div className="summary-item">
          <span className="summary-label">總計:</span>
          <span className="summary-value">{sequence.length} 場</span>
        </div>
      </div>
    </div>
  );
};

export default FixedSequenceDisplay;
