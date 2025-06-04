import React, { useState } from 'react';
import './PlayerSetup.css';

const PlayerSetup = ({ onSetupPlayers, initialNames }) => {
  const [playerCount, setPlayerCount] = useState(4); // Default 4 players
  const [playerNames, setPlayerNames] = useState(() => {
    // Initialize with default names based on player count
    const defaultNames = ['bob', 'jimmy', 'white', 'dada', 'alex', 'sam', 'chris', 'taylor'];
    return Array.from({ length: 8 }, (_, i) => initialNames[i] || defaultNames[i] || `選手${i + 1}`);
  });
  const [gameStarted, setGameStarted] = useState(false);

  // Handle player count change
  const handlePlayerCountChange = (count) => {
    setPlayerCount(count);
  };

  // Handle player name change
  const handleNameChange = (index, name) => {
    const newNames = [...playerNames];
    newNames[index] = name;
    setPlayerNames(newNames);
  };

  // Generate random names for current player count
  const generateRandomNames = () => {
    const randomNames = [
      'Alex', 'Sam', 'Chris', 'Taylor', 'Jordan', 'Casey', 'Morgan', 'Avery',
      'Blake', 'Drew', 'Emery', 'Finley', 'Harper', 'Indigo', 'Jamie', 'Kai',
      'Lane', 'Max', 'Nova', 'Oakley', 'Phoenix', 'Quinn', 'River', 'Sage'
    ];
    
    const shuffled = [...randomNames].sort(() => Math.random() - 0.5);
    const newNames = [...playerNames];
    
    for (let i = 0; i < playerCount; i++) {
      newNames[i] = shuffled[i] || `選手${i + 1}`;
    }
    
    setPlayerNames(newNames);
  };

  // Start game with selected players
  const startGame = () => {
    const selectedNames = playerNames.slice(0, playerCount).filter(name => name.trim());
    
    if (selectedNames.length !== playerCount) {
      alert(`請填入 ${playerCount} 位選手的名字！`);
      return;
    }

    setGameStarted(true);
    onSetupPlayers(selectedNames, playerCount);
  };

  if (gameStarted) {
    return (
      <div className="setup-container">
        <div className="loading-animation">
          <div className="loading-spinner"></div>
          <h2>🎮 正在準備比賽...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="setup-container">
      <div className="setup-card">
        <div className="setup-header">
          <h1 className="setup-title">🥊 設置比賽</h1>
          <p className="setup-subtitle">自定義參賽人數和選手名稱</p>
        </div>

        {/* Player Count Selection */}
        <div className="player-count-section">
          <h3>👥 參賽人數</h3>
          <div className="count-buttons">
            {[3, 4, 5, 6, 7, 8].map(count => (
              <button
                key={count}
                className={`count-btn ${playerCount === count ? 'active' : ''}`}
                onClick={() => handlePlayerCountChange(count)}
              >
                {count} 人
              </button>
            ))}
          </div>
          <div className="count-info">
            <p>連勝 <strong>{playerCount - 1}</strong> 場（打滿一輪）可選擇休息 +1 分</p>
          </div>
        </div>

        {/* Player Names Input */}
        <div className="names-section">
          <div className="names-header">
            <h3>✏️ 選手名稱</h3>
            <button 
              className="random-btn"
              onClick={generateRandomNames}
              type="button"
            >
              🎲 隨機名字
            </button>
          </div>
          
          <div className="names-grid">
            {Array.from({ length: playerCount }, (_, index) => (
              <div key={index} className="name-input-group">
                <label htmlFor={`player-${index}`}>
                  選手 {index + 1}
                </label>
                <input
                  id={`player-${index}`}
                  type="text"
                  value={playerNames[index] || ''}
                  onChange={(e) => handleNameChange(index, e.target.value)}
                  placeholder={`輸入選手 ${index + 1} 的名字`}
                  maxLength="20"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Game Rules Preview */}
        <div className="rules-preview">
          <h4>📋 比賽規則預覽</h4>
          <ul>
            <li>🥊 {playerCount} 人循環單挑賽制</li>
            <li>🔥 連勝 {playerCount - 1} 場可選擇休息並獲得 +1 分</li>
            <li>↶ 支援無限撤銷操作</li>
            <li>📱 針對手機使用優化</li>
          </ul>
        </div>

        {/* Start Game Button */}
        <div className="start-section">
          <button 
            className="start-game-btn"
            onClick={startGame}
          >
            🚀 開始 {playerCount} 人比賽
          </button>
        </div>
      </div>
    </div>
  );
};

export default PlayerSetup;