import React from 'react';
import './GameRules.css';

const GameRules = () => {
  return (
    <div className="rules">
      <h3 className="rules-title">📋 比賽規則</h3>
      <div className="rules-grid">
        <div className="rule-item">
          <div className="rule-icon">🥊</div>
          <div className="rule-content">
            <h4>比賽機制</h4>
            <p>一對一單挑，勝者留場，輸者下場排隊</p>
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
            <h4>連勝獎勵</h4>
            <p>連勝 3 場可選擇休息並額外得 1 分</p>
          </div>
        </div>
        
        <div className="rule-item">
          <div className="rule-icon">↶</div>
          <div className="rule-content">
            <h4>撤銷功能</h4>
            <p>隨時可以撤銷上一步操作，無時間限制</p>
          </div>
        </div>
        
        <div className="rule-item">
          <div className="rule-icon">🎯</div>
          <div className="rule-content">
            <h4>公平原則</h4>
            <p>所有選手都有平等的比賽機會</p>
          </div>
        </div>
        
        <div className="rule-item">
          <div className="rule-icon">🏆</div>
          <div className="rule-content">
            <h4>比賽結束</h4>
            <p>手動結束比賽時按積分最高者獲勝</p>
          </div>
        </div>
      </div>
      
      <div className="rules-footer">
        <p>💡 提示：合理安排體力，適時選擇休息可能更有利於最終勝利！</p>
      </div>
    </div>
  );
};

export default GameRules;