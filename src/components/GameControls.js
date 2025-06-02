import React from 'react';
import './GameControls.css';

const GameControls = ({ 
  gameStarted, 
  showRestOption,
  onStartGame, 
  onDeclareWinner, 
  onTakeRest, 
  onContinuePlay,
  onResetGame,
  onToggleHistory,
  showHistory 
}) => {
  return (
    <div className="controls">
      {!gameStarted && (
        <button className="btn start-btn" onClick={onStartGame}>
          🎮 開始比賽
        </button>
      )}
      
      {gameStarted && (
        <>
          <button 
            className="btn success-btn" 
            onClick={() => onDeclareWinner(1)}
            disabled={showRestOption}
          >
            👈 左方勝利
          </button>
          
          <button 
            className="btn success-btn" 
            onClick={() => onDeclareWinner(2)}
            disabled={showRestOption}
          >
            右方勝利 👉
          </button>
        </>
      )}
      
      {showRestOption && (
        <>
          <button className="btn rest-btn" onClick={onTakeRest}>
            😴 選擇休息 (+1分)
          </button>
          
          <button className="btn continue-btn" onClick={onContinuePlay}>
            💪 繼續比賽
          </button>
        </>
      )}
      
      <button 
        className={`btn history-btn ${showHistory ? 'active' : ''}`} 
        onClick={onToggleHistory}
      >
        📚 {showHistory ? '關閉歷史' : '查看歷史'}
      </button>
      
      <button className="btn danger-btn" onClick={onResetGame}>
        🔄 重置比賽
      </button>
    </div>
  );
};

export default GameControls;