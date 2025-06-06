import React from 'react';
import './GameRules.css';

const GameRules = ({ playerCount = 4 }) => {
  const requiredWins = playerCount - 1; // Dynamic win requirement

  return (
    <div className="rules">
      <h3 className="rules-title">📋 比賽規則</h3>
      <div className="rules-grid">
        <div className="rule-item">
          <div className="rule-icon">🥊</div>
          <div className="rule-content">
            <h4>比賽機制</h4>
            <p>{playerCount}人循環一對一單挑，勝者留場，輸者下場排隊</p>
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
            <p>
              {playerCount >= 4 ? 
                `連勝每 ${requiredWins} 場（${requiredWins}、${requiredWins * 2}、${requiredWins * 3}...）可選擇加 1 分下場` :
                '人數少於4人時，不啟用連勝休息機制'
              }
            </p>
          </div>
        </div>
        
        <div className="rule-item">
          <div className="rule-icon">🔄</div>
          <div className="rule-content">
            <h4>下場機制</h4>
            <p>選擇加分下場後排到隊伍末尾，很快會重新上場</p>
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
        <p>💡 提示：連勝 {requiredWins} 場表示已打贏所有對手一輪，可選擇加分下場！</p>
        <p>🔄 選擇下場不會離開比賽，只是排到隊伍後面等候</p>
      </div>
    </div>
  );
};

export default GameRules;