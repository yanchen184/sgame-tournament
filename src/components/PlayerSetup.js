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
      '武士阿萬', '劍客阿強', '忍者阿華', '拳手阿明'
    ];
    
    const newNames = [];
    for (let i = 0; i < 4; i++) {
      newNames.push(randomNames[i] || `選手${String.fromCharCode(65 + i)}`);
    }
    
    setLocalPlayerNames(newNames);
    setPlayerNames(newNames);
  };

  // Validate and start game
  const handleStartGame = () => {
    // Validate player names - fixed 4 players
    const validNames = localPlayerNames.slice(0, 4).filter(name => name.trim().length > 0);
    
    if (validNames.length < 4) {
      setStatus('error', '固定順序賽制需要恰好4位選手');
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
          <h1>🥊 固定順序賽制</h1>
          <p>設置4位選手並開始固定順序比賽</p>
        </div>

        {/* Fixed 4 players notice */}
        <div className="player-count-section">
          <h3>參賽人數</h3>
          <div className="fixed-count-display">
            <span className="count-badge">4人 (固定)</span>
            <span className="count-description">固定順序賽制需要恰好4位選手</span>
          </div>
        </div>

        {/* Game rules preview */}
        <div className="rules-preview">
          <h4>固定順序規則</h4>
          <div className="rules-info">
            <span>🎯 對戰順序：AB → CD → CA → BD → BC → AD</span>
            <span>🏆 每場勝利得1分</span>
            <span>📊 積分最高者獲勝</span>
            <span>💾 結果自動保存到資料庫</span>
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
            {Array.from({ length: 4 }, (_, index) => {
              const label = String.fromCharCode(65 + index); // A, B, C, D
              return (
                <div key={index} className="player-input-group">
                  <label htmlFor={`player-${index}`}>
                    選手 {label}
                  </label>
                  <input
                    id={`player-${index}`}
                    type="text"
                    value={localPlayerNames[index] || ''}
                    onChange={(e) => handlePlayerNameChange(index, e.target.value)}
                    placeholder={`輸入選手 ${label} 的名稱`}
                    maxLength={20}
                  />
                </div>
              );
            })}
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
            ℹ️ 4人固定順序賽制：AB → CD → CA → BD → BC → AD
            • 共6場比賽 • 每場勝利得1分 • 資料庫同步
          </p>
        </div>
      </div>
    </div>
  );
};

export default PlayerSetup;
