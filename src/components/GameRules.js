/**
 * Game Rules Component - Fixed Sequence Tournament
 * Shows rules and instructions for fixed sequence tournament
 */

import React from 'react';
import './GameRules.css';

const GameRules = () => {
  return (
    <div className="game-rules">
      <div className="rules-container">
        <h2>🥊 固定順序賽制規則</h2>
        
        <div className="rules-section">
          <h3>🎯 核心概念</h3>
          <div className="rule-item">
            <span className="rule-icon">👥</span>
            <div className="rule-content">
              <strong>4人專用賽制</strong>
              <p>專為4位選手設計，每位選手都會與其他3位選手各對戰2次</p>
            </div>
          </div>
          
          <div className="rule-item">
            <span className="rule-icon">🔢</span>
            <div className="rule-content">
              <strong>固定對戰順序</strong>
              <p>無論比賽結果如何，對戰順序始終按照固定模式進行</p>
            </div>
          </div>
        </div>

        <div className="rules-section">
          <h3>⚔️ 對戰順序</h3>
          <div className="sequence-display">
            <div className="sequence-matches">
              <div className="match-row">
                <span className="match-number">第1場</span>
                <span className="match-pattern">A vs B</span>
              </div>
              <div className="match-row">
                <span className="match-number">第2場</span>
                <span className="match-pattern">C vs D</span>
              </div>
              <div className="match-row">
                <span className="match-number">第3場</span>
                <span className="match-pattern">C vs A</span>
              </div>
              <div className="match-row">
                <span className="match-number">第4場</span>
                <span className="match-pattern">B vs D</span>
              </div>
              <div className="match-row">
                <span className="match-number">第5場</span>
                <span className="match-pattern">B vs C</span>
              </div>
              <div className="match-row">
                <span className="match-number">第6場</span>
                <span className="match-pattern">A vs D</span>
              </div>
            </div>
            <div className="sequence-info">
              <p><strong>總共6場比賽</strong> - 每位選手都與其他選手各對戰2次</p>
            </div>
          </div>
        </div>

        <div className="rules-section">
          <h3>🏆 計分規則</h3>
          <div className="rule-item">
            <span className="rule-icon">⭐</span>
            <div className="rule-content">
              <strong>簡單積分制</strong>
              <p>每場勝利得1分，失敗得0分</p>
            </div>
          </div>
          
          <div className="rule-item">
            <span className="rule-icon">🥇</span>
            <div className="rule-content">
              <strong>排名規則</strong>
              <p>積分最高者獲勝。若積分相同，則敗場較少者排名較高</p>
            </div>
          </div>
        </div>

        <div className="rules-section">
          <h3>🎮 遊戲特色</h3>
          <div className="rule-item">
            <span className="rule-icon">🚫</span>
            <div className="rule-content">
              <strong>無休息機制</strong>
              <p>簡化流程，專注於對戰，無連勝休息選項</p>
            </div>
          </div>
          
          <div className="rule-item">
            <span className="rule-icon">↶</span>
            <div className="rule-content">
              <strong>撤銷功能</strong>
              <p>支援撤銷上一場比賽結果，隨時糾正錯誤</p>
            </div>
          </div>
          
          <div className="rule-item">
            <span className="rule-icon">🏷️</span>
            <div className="rule-content">
              <strong>自動標籤</strong>
              <p>選手自動分配A、B、C、D標籤，便於識別對戰組合</p>
            </div>
          </div>
        </div>

        <div className="rules-section">
          <h3>📊 比賽流程</h3>
          <div className="flow-steps">
            <div className="flow-step">
              <span className="step-number">1</span>
              <span className="step-text">設置4位選手姓名</span>
            </div>
            <div className="flow-arrow">→</div>
            <div className="flow-step">
              <span className="step-number">2</span>
              <span className="step-text">按固定順序進行6場比賽</span>
            </div>
            <div className="flow-arrow">→</div>
            <div className="flow-step">
              <span className="step-number">3</span>
              <span className="step-text">查看最終排名和冠軍</span>
            </div>
          </div>
        </div>

        <div className="rules-section highlight">
          <h3>💡 為什麼選擇固定順序？</h3>
          <div className="advantages">
            <div className="advantage-item">
              <span className="advantage-icon">⚖️</span>
              <span><strong>絕對公平</strong> - 每位選手對戰機會完全相同</span>
            </div>
            <div className="advantage-item">
              <span className="advantage-icon">🎯</span>
              <span><strong>簡單明確</strong> - 無需思考誰該和誰打，順序固定</span>
            </div>
            <div className="advantage-item">
              <span className="advantage-icon">⏱️</span>
              <span><strong>時間可控</strong> - 固定6場比賽，時間好掌握</span>
            </div>
            <div className="advantage-item">
              <span className="advantage-icon">🧠</span>
              <span><strong>專注對戰</strong> - 無需考慮複雜的休息策略</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameRules;
