/**
 * Enhanced Game Controls - With Room Navigation
 * Control panel for game actions with room browser support
 */

import React from 'react';
import './GameControls.css';

const GameControls = ({ 
  onUndo,
  onReset,
  onEndGame,
  onBackToSetup,
  onBackToRooms,
  canUndo,
  isGameFinished
}) => {
  return (
    <div className="game-controls">
      <div className="controls-header">
        <h3>🎮 遊戲控制</h3>
      </div>
      
      <div className="controls-grid">
        {/* Primary actions */}
        <div className="control-section">
          <h4>操作</h4>
          
          {canUndo && (
            <button 
              className="control-btn undo-btn"
              onClick={onUndo}
              title="撤銷上一步操作 (支援無限撤銷)"
            >
              ↶ 撤銷操作
            </button>
          )}
          
          {!isGameFinished && (
            <button 
              className="control-btn end-btn"
              onClick={onEndGame}
            >
              🏁 結束比賽
            </button>
          )}
          
          <button 
            className="control-btn reset-btn"
            onClick={onReset}
          >
            🔄 重置比賽
          </button>
        </div>

        {/* Navigation actions */}
        <div className="control-section">
          <h4>導航</h4>
          
          <button 
            className="control-btn setup-btn"
            onClick={onBackToSetup}
          >
            ⚙️ 返回設置
          </button>
          
          <button 
            className="control-btn rooms-btn"
            onClick={onBackToRooms}
          >
            🏠 回到房間
          </button>
        </div>
      </div>

      {/* Game tips */}
      <div className="controls-tips">
        <h4>💡 操作提示</h4>
        <ul>
          <li><strong>點擊選手</strong>：宣布該選手獲勝</li>
          <li><strong>固定順序</strong>：AB → CD → CA → BD → BC → AD</li>
          <li><strong>積分系統</strong>：每場勝利得1分</li>
          <li><strong>資料同步</strong>：結果自動保存到資料庫</li>
        </ul>
      </div>
    </div>
  );
};

export default GameControls;
