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
          <li><strong>懸停預覽</strong>：查看勝利後的流程變化</li>
          <li><strong>休息選項</strong>：連勝達標時會自動顯示</li>
          <li><strong>無限撤銷</strong>：可隨時糾正錯誤操作</li>
        </ul>
      </div>
    </div>
  );
};

export default GameControls;
