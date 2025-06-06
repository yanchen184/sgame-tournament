import React from 'react';
import './GameHistory.css';

const GameHistory = ({ history, onClose }) => {
  const formatTime = (timestamp) => {
    try {
      let date;
      
      // Handle different timestamp formats
      if (!timestamp) {
        return '時間未知';
      }
      
      // If it's a Firestore Timestamp object
      if (timestamp && typeof timestamp.toDate === 'function') {
        date = timestamp.toDate();
      }
      // If it's already a Date object
      else if (timestamp instanceof Date) {
        date = timestamp;
      }
      // If it's a number (Unix timestamp)
      else if (typeof timestamp === 'number') {
        date = new Date(timestamp);
      }
      // If it's a string (ISO string or other date string)
      else if (typeof timestamp === 'string') {
        date = new Date(timestamp);
      }
      // If it has seconds and nanoseconds (Firestore Timestamp)
      else if (timestamp && typeof timestamp.seconds === 'number') {
        date = new Date(timestamp.seconds * 1000 + (timestamp.nanoseconds || 0) / 1000000);
      }
      else {
        console.warn('Unknown timestamp format:', timestamp);
        return '時間格式錯誤';
      }
      
      // Check if date is valid
      if (isNaN(date.getTime())) {
        console.warn('Invalid date created from timestamp:', timestamp);
        return '無效時間';
      }
      
      return date.toLocaleTimeString('zh-TW', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
    } catch (error) {
      console.error('Error formatting time:', error, 'timestamp:', timestamp);
      return '時間錯誤';
    }
  };

  // Temporary debug to check what's causing Invalid Date
  React.useEffect(() => {
    console.log('=== GameHistory Debug ===');
    console.log('Total history records:', history.length);
    
    history.forEach((record, index) => {
      const timeResult = formatTime(record.timestamp);
      if (timeResult.includes('錯誤') || timeResult.includes('Invalid') || timeResult.includes('無效')) {
        console.error(`❌ Problem with record ${index}:`, {
          record,
          timestamp: record.timestamp,
          timestampType: typeof record.timestamp,
          formattedResult: timeResult
        });
      }
    });
    console.log('=== End Debug ===');
  }, [history]);

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
    if (record.type === 'final') {
      return record.action || `比賽結束！冠軍：${record.winner || 'Unknown'}`;
    }
    // Regular match record
    if (record.winner && record.loser) {
      return `${record.winner} 擊敗 ${record.loser}`;
    }
    // Fallback for invalid data
    return '無效資料';
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
              <div key={record.id || `record_${index}`} className={`history-item-compact ${record.type || 'normal'}`}>
                <span className="match-number">#{record.battleNumber || index + 1}</span>
                <span className="match-icon">{getMatchIcon(record)}</span>
                <span className="match-result">
                  {getMatchDescription(record)}
                </span>
                <span className="match-time">{formatTime(record.timestamp)}</span>
                {record.type !== 'rest' && record.winnerScore && (
                  <span className="winner-score">({record.winnerScore}分)</span>
                )}
              </div>
            ))}
          </div>
        </div>
        
        <div className="history-footer">
          <div className="legend">
            <span className="legend-item">
              <span className="legend-icon">⚔️</span>
              <span className="legend-text">對戰</span>
            </span>
            <span className="legend-item">
              <span className="legend-icon">😴</span>
              <span className="legend-text">休息</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameHistory;