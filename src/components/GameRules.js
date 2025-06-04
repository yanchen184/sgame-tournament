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
            <p>連勝每 3 場（3、6、9...）可選擇休息並額外得 1 分</p>
          </div>
        </div>
        
        <div className="rule-item">
          <div className="rule-icon">😴</div>
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
        <p>💡 提示：合理安排體力，適時選擇休息可能更有利於最終勝利！</p>
        <p>🔄 每次連勝 3 場都可以選擇是否休息獲得額外分數</p>
      </div>
    </div>
  );
};

export default GameRules;