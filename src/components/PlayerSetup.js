/**
 * Simplified Player Setup Component - Streak Tournament Only
 * Clean interface for setting up players and starting streak tournament
 */

import React, { useState, useEffect } from 'react';
import { useGame } from '../contexts/GameContext';
import { GAME_DEFAULTS } from '../constants';
import './PlayerSetup.css';

/**
 * Player setup component for configuring tournament participants
 */
const PlayerSetup = () => {
  const { 
    playerCount, 
    playerNames, 
    setPlayerCount, 
    setPlayerNames, 
    startGame,
    setStatus
  } = useGame();

  const [localPlayerNames, setLocalPlayerNames] = useState([...playerNames]);

  // Sync with global state
  useEffect(() => {
    setLocalPlayerNames([...playerNames]);
  }, [playerNames]);

  // Handle player count change
  const handlePlayerCountChange = (newCount) => {
    setPlayerCount(newCount);
  };

  // Handle player name change
  const handlePlayerNameChange = (index, name) => {
    const newNames = [...localPlayerNames];
    newNames[index] = name;
    setLocalPlayerNames(newNames);
    setPlayerNames(newNames);
  };

  // Generate random names
  const generateRandomNames = () => {
    const randomNames = [
      '武士阿萬', '劍客阿強', '忍者阿華', '拳手阿明',
      '刀客阿傑', '格鬥阿豪', '戰士阿勇', '英雄阿偉'
    ];
    
    const newNames = [];
    for (let i = 0; i < playerCount; i++) {
      newNames.push(randomNames[i] || `選手${String.fromCharCode(65 + i)}`);
    }
    
    setLocalPlayerNames(newNames);
    setPlayerNames(newNames);
  };

  // Validate and start game
  const handleStartGame = () => {
    // Validate player names
    const validNames = localPlayerNames.filter(name => name.trim().length > 0);
    
    if (validNames.length < GAME_DEFAULTS.MIN_PLAYER_COUNT) {
      setStatus('error', `至少需要 ${GAME_DEFAULTS.MIN_PLAYER_COUNT} 位選手`);
      return;
    }

    if (validNames.length !== playerCount) {
      setStatus('error', '請確保所有選手都有名稱');
      return;
    }

    // Check for duplicate names
    const uniqueNames = new Set(validNames.map(name => name.trim()));
    if (uniqueNames.size !== validNames.length) {
      setStatus('error', '選手名稱不能重複');
      return;
    }

    // Start the game
    startGame(validNames.map(name => name.trim()));
  };

  const restRequirement = playerCount - 1;

  return (
    <div className="player-setup">
      <div className="setup-container">
        {/* Header */}
        <div className="setup-header">
          <h1>🥊 連勝競技系統</h1>
          <p>設置選手並開始連勝賽制比賽</p>
        </div>

        {/* Player count selection */}
        <div className="player-count-section">
          <h3>選擇參賽人數</h3>
          <div className="player-count-buttons">
            {Array.from({ length: GAME_DEFAULTS.MAX_PLAYER_COUNT - GAME_DEFAULTS.MIN_PLAYER_COUNT + 1 }, (_, i) => {
              const count = GAME_DEFAULTS.MIN_PLAYER_COUNT + i;
              return (
                <button
                  key={count}
                  className={`count-btn ${playerCount === count ? 'active' : ''}`}
                  onClick={() => handlePlayerCountChange(count)}
                >
                  {count}人
                </button>
              );
            })}
          </div>
        </div>

        {/* Game rules preview */}
        <div className="rules-preview">
          <h4>連勝規則預覽</h4>
          <div className="rules-info">
            <span>🏆 連勝 {restRequirement} 場可選擇休息</span>
            <span>⭐ 休息可獲得額外 1 分</span>
            <span>🔄 勝者留場，敗者排隊</span>
            <span>↶ 支援無限撤銷操作</span>
          </div>
        </div>

        {/* Player names input */}
        <div className="player-names-section">
          <div className="names-header">
            <h3>選手名稱設置</h3>
            <button 
              className="random-btn"
              onClick={generateRandomNames}
              type="button"
            >
              🎲 隨機名稱
            </button>
          </div>
          
          <div className="player-inputs">
            {Array.from({ length: playerCount }, (_, index) => (
              <div key={index} className="player-input-group">
                <label htmlFor={`player-${index}`}>
                  選手 {index + 1}
                </label>
                <input
                  id={`player-${index}`}
                  type="text"
                  value={localPlayerNames[index] || ''}
                  onChange={(e) => handlePlayerNameChange(index, e.target.value)}
                  placeholder={`輸入選手 ${index + 1} 的名稱`}
                  maxLength={20}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Start game button */}
        <div className="start-section">
          <button 
            className="start-btn"
            onClick={handleStartGame}
          >
            🚀 開始比賽
          </button>
        </div>

        {/* Info footer */}
        <div className="setup-footer">
          <p>
            ℹ️ {playerCount} 人比賽：連勝 {restRequirement} 場可休息 
            • 每場勝利得 1 分 • 休息額外得 1 分
          </p>
        </div>
      </div>
    </div>
  );
};

export default PlayerSetup;
