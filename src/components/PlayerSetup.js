import React, { useState } from 'react';
import './PlayerSetup.css';

const PlayerSetup = ({ onSetupPlayers }) => {
  const [playerNames, setPlayerNames] = useState(['', '', '', '']);
  const [currentStep, setCurrentStep] = useState(0);

  const handleNameChange = (index, value) => {
    const newNames = [...playerNames];
    newNames[index] = value;
    setPlayerNames(newNames);
  };

  const nextStep = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = () => {
    const finalNames = playerNames.map((name, index) => 
      name.trim() || `選手 ${String.fromCharCode(65 + index)}`
    );
    onSetupPlayers(finalNames);
  };

  const canProceed = playerNames[currentStep].trim().length > 0;
  const allFilled = playerNames.every(name => name.trim().length > 0);

  return (
    <div className="setup-container">
      <div className="setup-modal">
        <div className="setup-header">
          <h2>🥊 四人單挑循環賽設置</h2>
          <p>請輸入四位參賽選手的名字</p>
        </div>

        <div className="setup-progress">
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${((currentStep + 1) / 4) * 100}%` }}
            ></div>
          </div>
          <div className="progress-text">
            步驟 {currentStep + 1} / 4
          </div>
        </div>

        <div className="setup-content">
          <div className="player-input-section">
            <div className="player-avatar">
              🥊
            </div>
            <h3>第 {currentStep + 1} 位選手</h3>
            <input
              type="text"
              value={playerNames[currentStep]}
              onChange={(e) => handleNameChange(currentStep, e.target.value)}
              placeholder={`輸入第 ${currentStep + 1} 位選手名字...`}
              className="player-name-input"
              maxLength={12}
              autoFocus
              onKeyPress={(e) => {
                if (e.key === 'Enter' && canProceed) {
                  if (currentStep < 3) {
                    nextStep();
                  } else {
                    handleSubmit();
                  }
                }
              }}
            />
            <div className="input-hint">
              {playerNames[currentStep].length}/12 字符
            </div>
          </div>

          <div className="players-preview">
            <h4>已設置的選手：</h4>
            <div className="preview-list">
              {playerNames.map((name, index) => (
                <div 
                  key={index} 
                  className={`preview-item ${index === currentStep ? 'current' : ''} ${name.trim() ? 'filled' : 'empty'}`}
                >
                  <span className="preview-number">{index + 1}</span>
                  <span className="preview-name">
                    {name.trim() || `選手 ${String.fromCharCode(65 + index)}`}
                  </span>
                  {index <= currentStep && name.trim() && (
                    <span className="preview-check">✓</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="setup-controls">
          <button 
            className="btn secondary" 
            onClick={prevStep}
            disabled={currentStep === 0}
          >
            ← 上一步
          </button>

          {currentStep < 3 ? (
            <button 
              className="btn primary" 
              onClick={nextStep}
              disabled={!canProceed}
            >
              下一步 →
            </button>
          ) : (
            <button 
              className="btn success" 
              onClick={handleSubmit}
            >
              🎮 開始比賽
            </button>
          )}
        </div>

        <div className="setup-footer">
          <div className="quick-setup">
            <button 
              className="btn outline" 
              onClick={() => onSetupPlayers(['選手 A', '選手 B', '選手 C', '選手 D'])}
            >
              ⚡ 使用預設名稱快速開始
            </button>
          </div>
          
          <div className="setup-tips">
            <p>💡 提示：你可以隨時在遊戲中重置並重新設定選手名稱</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlayerSetup;