/**
 * Simplified Game Rules Component - Streak Tournament Only
 * Clear display of streak tournament rules
 */

import React from 'react';
import './GameRules.css';

const GameRules = ({ playerCount = 4, restRequirement = 3, compact = false }) => {
  if (compact) {
    return (
      <div className="rules compact">
        <h4 className="rules-title">📋 規則速覽</h4>
        <div className="rules-compact-list">
          <div className="rule-compact">
            <span className="rule-icon">🏆</span>
            <span>連勝 {restRequirement} 場可休息</span>
          </div>
          <div className="rule-compact">
            <span className="rule-icon">⭐</span>
            <span>休息獲得額外 1 分</span>
          </div>
          <div className="rule-compact">
            <span className="rule-icon">🔄</span>
            <span>勝者留場，敗者排隊</span>
          </div>
          <div className="rule-compact">
            <span className="rule-icon">↶</span>
            <span>支援無限撤銷</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rules">
      <h3 className="rules-title">📋 連勝賽制規則</h3>
      <div className="rules-grid">
        <div className="rule-item">
          <div className="rule-icon">🥊</div>
          <div className="rule-content">
            <h4>比賽機制</h4>
            <p>{playerCount}人循環一對一單挑，勝者留場，敗者下場排隊</p>
          </div>
        </div>
        
        <div className="rule-item">
          <div className="rule-icon">⭐</div>
          <div className="rule-content">
            <h4>得分規則</h4>
            <p>每贏一場得 1 分，積分越高排名越前</p>
          </div>
        </div>
        
        <div className="rule-item">
          <div className="rule-icon">🔥</div>
          <div className="rule-content">
            <h4>連勝休息</h4>
            <p>
              連勝 {restRequirement} 場（{restRequirement}、{restRequirement * 2}、{restRequirement * 3}...）可選擇休息並額外得 1 分
            </p>
          </div>
        </div>
        
        <div className="rule-item">
          <div className="rule-icon">🔄</div>
          <div className="rule-content">
            <h4>休息機制</h4>
            <p>休息選手會重新排隊，當無其他選手時自動返場</p>
          </div>
        </div>
        
        <div className="rule-item">
          <div className="rule-icon">↶</div>
          <div className="rule-content">
            <h4>撤銷功能</h4>
            <p>可無限撤銷操作，支援連續撤銷，無時間限制</p>
          </div>
        </div>
        
        <div className="rule-item">
          <div className="rule-icon">🏆</div>
          <div className="rule-content">
            <h4>比賽結束</h4>
            <p>手動結束比賽，最終統計不會自動消失</p>
          </div>
        </div>
      </div>
      
      <div className="rules-footer">
        <p>💡 提示：連勝 {restRequirement} 場表示已打贏所有對手一輪，可選擇休息！</p>
        <p>🔄 休息不會離開比賽，只是暫時排隊等候下一輪</p>
      </div>
    </div>
  );
};

export default GameRules;
