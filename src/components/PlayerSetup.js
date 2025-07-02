/**
 * Fixed Sequence Player Setup Component
 * Clean interface for setting up exactly 4 players for fixed sequence tournament
 */

import React, { useState, useEffect } from 'react';
import { useGame } from '../contexts/GameContext';
import './PlayerSetup.css';

/**
 * Player setup component for configuring fixed sequence tournament participants
 */
const PlayerSetup = () => {
  const { 
    playerNames, 
    setPlayerNames, 
    startGame,
    setStatus
  } = useGame();

  const [localPlayerNames, setLocalPlayerNames] = useState([...playerNames]);

  // Sync with global state
  useEffect(() => {
    setLocalPlayerNames([...playerNames]);
  }, [playerNames]);

  // Handle player name change
  const handlePlayerNameChange = (index, name) => {
    const newNames = [...localPlayerNames];
    newNames[index] = name;
    setLocalPlayerNames(newNames);
    setPlayerNames(newNames);
  };

  // Generate random names for 4 players
  const generateRandomNames = () => {
    const randomNames = [
      '武士阿萬', '劍客阿強', '忍者阿華', '拳手阿明'
    ];
    
    setLocalPlayerNames([...randomNames]);
    setPlayerNames([...randomNames]);
  };

  // Validate and start game
  const handleStartGame = () => {
    // Validate player names - must have exactly 4 players
    const validNames = localPlayerNames.filter(name => name.trim().length > 0);
    
    if (validNames.length !== 4) {
      setStatus('error', '固定順序賽制需要恰好4位選手');
      return;
    }

    // Check for duplicate names
    const uniqueNames = new Set(validNames.map(name => name.trim()));
    if (uniqueNames.size !== 4) {
      setStatus('error', '選手名稱不能重複');
      return;
    }

    // Start the game
    startGame(validNames.map(name => name.trim()));
  };

  return (
    <div className="player-setup">
      <div className="setup-container">
        {/* Header */}
        <div className="setup-header">
          <h1>🥊 固定順序賽制</h1>
          <p>4人比賽 • 固定對戰順序 • 無需休息選項</p>
        </div>

        {/* Fixed sequence info */}
        <div className="sequence-info-section">
          <h3>對戰順序</h3>
          <div className="sequence-display">
            <div className="sequence-pattern">
              <span className="match">AB</span>
              <span className="arrow">→</span>
              <span className="match">CD</span>
              <span className="arrow">→</span>
              <span className="match">CA</span>
              <span className="arrow">→</span>
              <span className="match">BD</span>
              <span className="arrow">→</span>
              <span className="match">BC</span>
              <span className="arrow">→</span>
              <span className="match">AD</span>
            </div>
            <div className="sequence-description">
              每位選手與其他選手各對戰2次，共6場比賽
            </div>
          </div>
        </div>

        {/* Game rules preview */}
        <div className="rules-preview">
          <h4>比賽規則</h4>
          <div className="rules-info">
            <span>🎯 固定對戰順序，無論勝負結果</span>
            <span>⭐ 每場勝利得1分</span>
            <span>🚫 無連勝休息機制</span>
            <span>↶ 支援撤銷操作</span>
          </div>
        </div>

        {/* Player names input */}
        <div className="player-names-section">
          <div className="names-header">
            <h3>選手名稱設置 (4位)</h3>
            <button 
              className="random-btn"
              onClick={generateRandomNames}
              type="button"
            >
              🎲 隨機名稱
            </button>
          </div>
          
          <div className="player-inputs fixed-sequence">
            {Array.from({ length: 4 }, (_, index) => {
              const label = String.fromCharCode(65 + index); // A, B, C, D
              return (
                <div key={index} className="player-input-group">
                  <label htmlFor={`player-${index}`}>
                    <span className="player-label">{label}</span>
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

        {/* Player assignment preview */}
        <div className="assignment-preview">
          <h4>標籤分配預覽</h4>
          <div className="assignments">
            {localPlayerNames.map((name, index) => {
              const label = String.fromCharCode(65 + index);
              return (
                <div key={index} className="assignment-item">
                  <span className="label">{label}</span>
                  <span className="name">{name || `選手${label}`}</span>
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
            🚀 開始固定順序比賽
          </button>
        </div>

        {/* Info footer */}
        <div className="setup-footer">
          <p>
            ℹ️ 固定順序賽制：AB → CD → CA → BD → BC → AD
            <br />
            • 總共6場比賽 • 每場勝利得1分 • 最高分者獲勝
          </p>
        </div>
      </div>
    </div>
  );
};

export default PlayerSetup;
