import React from 'react';
import './GameControls.css';

const GameControls = ({ 
  gameStarted, 
  gameEnded,
  showRestOption,
  hasUndoActions,
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
      {/* Show start button only if game hasn't started yet */}
      {!gameStarted && (
        <button className="btn start-btn" onClick={onStartGame}>
          🎮 開始比賽
        </button>
      )}
      
      {/* Game in progress controls */}
      {gameStarted && !gameEnded && !showRestOption && (
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
      
      {/* Rest option controls */}
      {showRestOption && !gameEnded && (
        <>
          <button className="btn rest-btn" onClick={onTakeRest}>
            😴 加1分下場
          </button>
          
          <button className="btn continue-btn" onClick={onContinuePlay}>
            💪 繼續比賽
          </button>
        </>
      )}
      
      {/* Undo button - available whenever there are actions to undo */}
      {hasUndoActions && (
        <button 
          className="btn undo-btn" 
          onClick={onUndoAction}
          title="撤銷上一步操作 (無限制撤銷)"
        >
          ↶ 撤銷
        </button>
      )}
      
      {/* History toggle button */}
      <button 
        className={`btn history-btn ${showHistory ? 'active' : ''}`} 
        onClick={onToggleHistory}
      >
        📚 {showHistory ? '關閉歷史' : '查看歷史'}
      </button>
      
      {/* End game button - only show during active game */}
      {gameStarted && !gameEnded && (
        <button className="btn end-btn" onClick={onEndGame}>
          🏁 結束比賽
        </button>
      )}
      
      {/* Reset button - always available */}
      <button className="btn danger-btn" onClick={onResetGame}>
        🔄 重置比賽
      </button>
    </div>
  );
};

export default GameControls;