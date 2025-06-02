import React from 'react';
import './GameHistory.css';

const GameHistory = ({ history, onClose }) => {
  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('zh-TW', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const getMatchIcon = (record) => {
    switch (record.type) {
      case 'rest': return '😴';
      case 'final': return '🏁';
      default: return '⚔️';
    }
  };

  const getMatchDescription = (record) => {
    if (record.type === 'rest') {
      return `${record.player} ${record.action}`;
    }
    return `${record.winner} 擊敗 ${record.loser}`;
  };

  if (history.length === 0) {
    return (
      <div className="history-overlay">
        <div className="history-modal">
          <div className="history-header">
            <h3>📚 比賽歷史記錄</h3>
            <button className="close-btn" onClick={onClose}>✕</button>
          </div>
          <div className="empty-history">
            <div className="empty-icon">📝</div>
            <p>還沒有比賽記錄</p>
            <p>開始比賽後會自動記錄每場對戰</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="history-overlay">
      <div className="history-modal">
        <div className="history-header">
          <h3>📚 比賽歷史記錄</h3>
          <div className="history-stats">
            <span className="total-matches">總計 {history.length} 場比賽</span>
          </div>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>
        
        <div className="history-content">
          <div className="history-list">
            {history.map((record, index) => (
              <div key={record.id} className={`history-item ${record.type}`}>
                <div className="match-number">#{record.battleNumber || index + 1}</div>
                <div className="match-icon">{getMatchIcon(record)}</div>
                <div className="match-details">
                  <div className="match-description">
                    {getMatchDescription(record)}
                  </div>
                  <div className="match-meta">
                    <span className="match-time">{formatTime(record.timestamp)}</span>
                    {record.type === 'normal' && (
                      <>
                        <span className="winner-score">得分: {record.winnerScore}</span>
                        {record.winnerStreak > 0 && (
                          <span className="winner-streak">連勝: {record.winnerStreak}</span>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="history-footer">
          <div className="legend">
            <span className="legend-item">
              <span className="legend-icon">⚔️</span>
              <span className="legend-text">一般對戰</span>
            </span>
            <span className="legend-item">
              <span className="legend-icon">😴</span>
              <span className="legend-text">休息記錄</span>
            </span>
            <span className="legend-item">
              <span className="legend-icon">🏁</span>
              <span className="legend-text">最終對戰</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameHistory;