/**
 * Enhanced Game Arena - Fixed Sequence Tournament
 * Shows fixed battle order: AB -> CD -> CA -> BD -> BC -> AD
 * Removed rest mechanics for simplified gameplay
 */

import React, { useState } from 'react';
import './GameArena.css';

const GameArena = ({ 
  currentMatch, 
  onDeclareWinner, 
  isGameFinished,
  players,
  gameState
}) => {
  const [selectedWinner, setSelectedWinner] = useState('');

  if (!currentMatch || !currentMatch.player1 || !currentMatch.player2) {
    return (
      <div className="game-arena">
        <div className="arena-message">
          <h3>等待比賽開始...</h3>
        </div>
      </div>
    );
  }

  if (isGameFinished) {
    const winner = gameState?.leaderboard?.[0];
    return (
      <div className="game-arena finished">
        <div className="arena-message">
          <h3>🏆 比賽結束</h3>
          {winner && (
            <p>冠軍：{winner.name} ({winner.label}) - {winner.score}分</p>
          )}
          <p>查看最終排名</p>
        </div>
      </div>
    );
  }

  const { player1, player2 } = currentMatch;
  const tournamentProgress = gameState?.tournamentProgress;
  const matchSequence = gameState?.matchSequence || [];

  // Handle winner selection
  const handleWinnerSelect = (winnerName) => {
    setSelectedWinner(winnerName);
  };

  // Handle confirm result
  const handleConfirmResult = () => {
    if (selectedWinner) {
      onDeclareWinner(selectedWinner);
      setSelectedWinner('');
    }
  };

  return (
    <div className="game-arena enhanced fixed-sequence">
      <div className="arena-header">
        <h3>🥊 固定順序賽制</h3>
        <div className="sequence-info">
          <span className="sequence-pattern">AB → CD → CA → BD → BC → AD</span>
        </div>
        {tournamentProgress && (
          <div className="match-progress">
            <span>第 {currentMatch.matchNumber || 1} 場 / 共 6 場</span>
            <span className="current-pattern">當前：{currentMatch.pattern}</span>
          </div>
        )}
      </div>

      {/* Match Sequence Progress */}
      <div className="sequence-progress">
        <div className="sequence-track">
          {matchSequence.map((match, index) => (
            <div 
              key={index}
              className={`sequence-dot ${match.status}`}
              title={`第${match.matchNumber}場 ${match.pattern} ${match.winner ? `- ${match.winner}獲勝` : ''}`}
            >
              <span className="pattern">{match.pattern}</span>
              {match.status === 'completed' && (
                <span className="winner-indicator">✓</span>
              )}
              {match.status === 'current' && (
                <span className="current-indicator">●</span>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="arena-main">
        {/* Player 1 Section */}
        <div className="player-section left">
          <div className={`player-card ${selectedWinner === player1.name ? 'selected' : ''}`}>
            <div className="player-info">
              <div className="player-label">{player1.label}</div>
              <h4>{player1.name}</h4>
              <div className="player-stats">
                <span className="score">分數: {player1.score}</span>
                <span className="wins">勝: {player1.wins}</span>
                <span className="losses">敗: {player1.losses}</span>
              </div>
            </div>
            
            <button 
              className={`winner-btn ${selectedWinner === player1.name ? 'selected' : ''}`}
              onClick={() => handleWinnerSelect(player1.name)}
            >
              選擇 {player1.label} 獲勝
            </button>
          </div>
        </div>

        {/* VS Section */}
        <div className="vs-section">
          <div className="vs-icon">VS</div>
          <div className="match-info">
            <div className="current-match-pattern">{currentMatch.pattern}</div>
            <div className="match-instructions">選擇獲勝者</div>
          </div>
        </div>

        {/* Player 2 Section */}
        <div className="player-section right">
          <div className={`player-card ${selectedWinner === player2.name ? 'selected' : ''}`}>
            <div className="player-info">
              <div className="player-label">{player2.label}</div>
              <h4>{player2.name}</h4>
              <div className="player-stats">
                <span className="score">分數: {player2.score}</span>
                <span className="wins">勝: {player2.wins}</span>
                <span className="losses">敗: {player2.losses}</span>
              </div>
            </div>
            
            <button 
              className={`winner-btn ${selectedWinner === player2.name ? 'selected' : ''}`}
              onClick={() => handleWinnerSelect(player2.name)}
            >
              選擇 {player2.label} 獲勝
            </button>
          </div>
        </div>
      </div>

      {/* Confirm Section */}
      {selectedWinner && (
        <div className="confirm-section">
          <div className="confirm-message">
            確認 <strong>{selectedWinner}</strong> 獲勝？
          </div>
          <div className="confirm-buttons">
            <button 
              className="confirm-btn"
              onClick={handleConfirmResult}
            >
              ✓ 確認結果
            </button>
            <button 
              className="cancel-btn"
              onClick={() => setSelectedWinner('')}
            >
              ✗ 取消
            </button>
          </div>
        </div>
      )}

      {/* Next Match Preview */}
      {tournamentProgress && tournamentProgress.current < 5 && (
        <div className="next-match-preview">
          <span className="label">下一場對戰:</span>
          <span className="next-pattern">
            {matchSequence[tournamentProgress.current + 1]?.pattern || '待定'}
          </span>
        </div>
      )}
    </div>
  );
};

export default GameArena;
