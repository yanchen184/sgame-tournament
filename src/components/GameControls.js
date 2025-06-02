import React from 'react';
import './GameControls.css';

const GameControls = ({ 
  gameStarted, 
  showRestOption,
  lastAction,
  onStartGame, 
  onDeclareWinner, 
  onTakeRest, 
  onContinuePlay,
  onUndoAction,
  onEndGame,
  onResetGame,
  onToggleHistory,
  showHistory 
}) => {
  return (
    <div className="controls">
      {/* Removed start game button as game auto-starts after setup */}
      
      {gameStarted && !showRestOption && (
        <>
          <button 
            className="btn success-btn" 
            onClick={() => onDeclareWinner(1)}
          >
            👈 左方勝利
          </button>
          
          <button 
            className="btn success-btn" 
            onClick={() => onDeclareWinner(2)}
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
      
      {gameStarted && lastAction && (
        <button 
          className="btn undo-btn" 
          onClick={onUndoAction}
          title="撤銷上一步操作 (無時間限制)"
        >
          ↶ 撤銷
        </button>
      )}
      
      <button 
        className={`btn history-btn ${showHistory ? 'active' : ''}`} 
        onClick={onToggleHistory}
      >
        📚 {showHistory ? '關閉歷史' : '查看歷史'}
      </button>
      
      {gameStarted && (
        <button className="btn end-btn" onClick={onEndGame}>
          🏁 結束比賽
        </button>
      )}
      
      <button className="btn danger-btn" onClick={onResetGame}>
        🔄 重置比賽
      </button>
    </div>
  );
};

export default GameControls;