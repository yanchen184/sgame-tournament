/**
 * Enhanced Game Arena with Visual Flow - Streak Tournament
 * Shows clear visual representation of what happens when each player wins/loses
 */

import React, { useState } from 'react';
import './GameArena.css';

const GameArena = ({ 
  currentMatch, 
  onDeclareWinner, 
  canTakeRest, 
  onTakeRest, 
  isGameFinished,
  players,
  nextPlayerInQueue 
}) => {
  const [showFlowPreview, setShowFlowPreview] = useState(null);

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
    return (
      <div className="game-arena finished">
        <div className="arena-message">
          <h3>🏆 比賽結束</h3>
          <p>查看最終排名</p>
        </div>
      </div>
    );
  }

  const { player1, player2 } = currentMatch;
  const player1CanRest = canTakeRest(player1.name);
  const player2CanRest = canTakeRest(player2.name);

  // Get next player for visual preview
  const getNextPlayerName = () => {
    if (nextPlayerInQueue) {
      return nextPlayerInQueue.name;
    }
    return '無等候選手';
  };

  // Handle player selection with visual feedback
  const handlePlayerClick = (player) => {
    onDeclareWinner(player.name);
  };

  // Handle rest selection
  const handleRestClick = (player) => {
    onTakeRest(player.name);
  };

  // Preview what happens when player wins
  const getWinPreview = (winner, loser) => {
    const nextPlayer = getNextPlayerName();
    return {
      winner: {
        action: winner.currentStreak + 1 >= (players.length - 1) && 
                (winner.currentStreak + 1) % (players.length - 1) === 0 ? 
                '可選擇休息或繼續' : '留場繼續',
        streak: winner.currentStreak + 1,
        canRest: winner.currentStreak + 1 >= (players.length - 1) && 
                (winner.currentStreak + 1) % (players.length - 1) === 0
      },
      loser: {
        action: '排隊等候',
        nextOpponent: nextPlayer !== '無等候選手' ? nextPlayer : '等候其他選手'
      },
      nextMatch: nextPlayer !== '無等候選手' ? 
        `${winner.name} vs ${nextPlayer}` : 
        '等候選手返場'
    };
  };

  const player1WinPreview = getWinPreview(player1, player2);
  const player2WinPreview = getWinPreview(player2, player1);

  return (
    <div className="game-arena enhanced">
      <div className="arena-header">
        <h3>🥊 比賽進行中</h3>
        <div className="match-info">
          <span>第 {(players.reduce((sum, p) => sum + p.totalWins, 0)) + 1} 場</span>
        </div>
      </div>

      <div className="arena-main">
        {/* Player 1 Section */}
        <div className="player-section left">
          <div 
            className={`player-card clickable ${showFlowPreview === 'player1' ? 'preview-active' : ''}`}
            onClick={() => handlePlayerClick(player1)}
            onMouseEnter={() => setShowFlowPreview('player1')}
            onMouseLeave={() => setShowFlowPreview(null)}
          >
            <div className="player-info">
              <h4>{player1.name}</h4>
              <div className="player-stats">
                <span className="score">分數: {player1.score}</span>
                <span className="streak">連勝: {player1.currentStreak}</span>
              </div>
            </div>
            
            {player1CanRest && (
              <div className="rest-option">
                <span className="rest-badge">可休息 +1分</span>
              </div>
            )}
            
            <div className="click-hint">點擊宣布勝利</div>
          </div>

          {/* Flow Preview for Player 1 Win */}
          {showFlowPreview === 'player1' && (
            <div className="flow-preview">
              <h5>如果 {player1.name} 獲勝:</h5>
              <div className="flow-steps">
                <div className="flow-step winner">
                  <span className="icon">🏆</span>
                  <span>{player1.name}: {player1WinPreview.winner.action}</span>
                  <span className="detail">連勝: {player1WinPreview.winner.streak}</span>
                </div>
                <div className="flow-step loser">
                  <span className="icon">📝</span>
                  <span>{player2.name}: {player1WinPreview.loser.action}</span>
                </div>
                <div className="flow-step next">
                  <span className="icon">⚡</span>
                  <span>下一場: {player1WinPreview.nextMatch}</span>
                </div>
              </div>
              
              {player1WinPreview.winner.canRest && (
                <div className="rest-choice">
                  <button 
                    className="rest-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRestClick(player1);
                    }}
                  >
                    選擇休息 (+1分)
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* VS Section */}
        <div className="vs-section">
          <div className="vs-icon">VS</div>
          <div className="match-status">
            <span>點擊選手宣布勝利</span>
          </div>
        </div>

        {/* Player 2 Section */}
        <div className="player-section right">
          <div 
            className={`player-card clickable ${showFlowPreview === 'player2' ? 'preview-active' : ''}`}
            onClick={() => handlePlayerClick(player2)}
            onMouseEnter={() => setShowFlowPreview('player2')}
            onMouseLeave={() => setShowFlowPreview(null)}
          >
            <div className="player-info">
              <h4>{player2.name}</h4>
              <div className="player-stats">
                <span className="score">分數: {player2.score}</span>
                <span className="streak">連勝: {player2.currentStreak}</span>
              </div>
            </div>
            
            {player2CanRest && (
              <div className="rest-option">
                <span className="rest-badge">可休息 +1分</span>
              </div>
            )}
            
            <div className="click-hint">點擊宣布勝利</div>
          </div>

          {/* Flow Preview for Player 2 Win */}
          {showFlowPreview === 'player2' && (
            <div className="flow-preview">
              <h5>如果 {player2.name} 獲勝:</h5>
              <div className="flow-steps">
                <div className="flow-step winner">
                  <span className="icon">🏆</span>
                  <span>{player2.name}: {player2WinPreview.winner.action}</span>
                  <span className="detail">連勝: {player2WinPreview.winner.streak}</span>
                </div>
                <div className="flow-step loser">
                  <span className="icon">📝</span>
                  <span>{player1.name}: {player2WinPreview.loser.action}</span>
                </div>
                <div className="flow-step next">
                  <span className="icon">⚡</span>
                  <span>下一場: {player2WinPreview.nextMatch}</span>
                </div>
              </div>
              
              {player2WinPreview.winner.canRest && (
                <div className="rest-choice">
                  <button 
                    className="rest-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRestClick(player2);
                    }}
                  >
                    選擇休息 (+1分)
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Next Player Indicator */}
      <div className="next-player-indicator">
        <span className="label">下一位上場:</span>
        <span className="next-player">{getNextPlayerName()}</span>
      </div>
    </div>
  );
};

export default GameArena;
