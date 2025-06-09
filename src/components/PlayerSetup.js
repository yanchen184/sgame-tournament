import React, { useState } from 'react';
import './PlayerSetup.css';

const PlayerSetup = ({ onSetupPlayers, initialNames, onBack, isMultiplayer, roomCode, isRoomHost, roomConnected }) => {
  const [playerCount, setPlayerCount] = useState(4); // Default 4 players
  const [playerNames, setPlayerNames] = useState(() => {
    // Initialize with default names based on player count
    const defaultNames = ['bob', 'jimmy', 'white', 'dada', 'alex', 'sam', 'chris', 'taylor'];
    return Array.from({ length: 8 }, (_, i) => {
      if (initialNames && initialNames[i]) {
        return initialNames[i];
      }
      return defaultNames[i] || `選手${i + 1}`;
    });
  });
  const [gameStarted, setGameStarted] = useState(false);

  // Validate form
  const isValid = () => {
    // 檢查是否所有必要的選手名字都已填寫
    const requiredNames = playerNames.slice(0, playerCount);
    return requiredNames.every(name => name && name.trim().length > 0);
  };

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
        <button 
          className="back-btn floating"
          onClick={onBack}
        >
          ⬅️ 返回
        </button>
        
        <div className="setup-header">
          <h1 className="setup-title">🥊 設置比賽</h1>
          <p className="setup-subtitle">自定義參賽人數和選手名稱</p>
          
          {/* 顯示房間資訊 */}
          {isMultiplayer && (
            <div className="room-info">
              {roomCode ? (
                <div className="room-code-display">
                  <h3>🏠 房間號碼</h3>
                  <div className="room-code">{roomCode}</div>
                  <p className="room-status">
                    {roomConnected ? (
                      <>🔥 Firebase 已連接</>
                    ) : (
                      <>⏳ 連接中...</>
                    )}
                  </p>
                  <p className="room-hint">分享此號碼讓朋友加入觀戰</p>
                </div>
              ) : (
                <div className="room-creating">
                  <p>🎮 準備創建多人房間...</p>
                </div>
              )}
            </div>
          )}
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
        <div className="player-names-section">
          <h3>👤 選手名稱</h3>
          <div className="name-inputs">
            {[...Array(playerCount)].map((_, index) => (
              <div key={index} className="name-input-group">
                <label>選手 {index + 1}</label>
                <input
                  type="text"
                  value={playerNames[index] || ''}
                  onChange={(e) => handleNameChange(index, e.target.value)}
                  placeholder={`選手 ${index + 1}`}
                />
              </div>
            ))}
          </div>
          
          <div className="name-actions">
            <button 
              className="random-names-btn" 
              onClick={generateRandomNames}
              type="button"
            >
              🎲 隨機名稱
            </button>
          </div>
        </div>

        {/* Start Game Button */}
        <div className="setup-actions">
          <button 
            className="start-btn" 
            onClick={startGame}
            disabled={!isValid()}
          >
            開始比賽 🎮
          </button>
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
      </div>
    </div>
  );
};

export default PlayerSetup;