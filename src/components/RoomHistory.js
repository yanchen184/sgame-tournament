import React, { useState, useEffect } from 'react';
import './RoomHistory.css';
import gameService from '../services/gameService';

const RoomHistory = ({ onBack }) => {
  const [completedRooms, setCompletedRooms] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState('checking');

  useEffect(() => {
    loadCompletedRooms();
  }, []);

  const loadCompletedRooms = async () => {
    setIsLoading(true);
    setError(null);
    setConnectionStatus('connecting');
    
    try {
      console.log('🔍 正在從 Firebase 載入已完成的房間...');
      const rooms = await gameService.getCompletedRooms(50);
      
      console.log('✅ Firebase 查詢完成，找到房間數量:', rooms ? rooms.length : 0);
      console.log('📊 返回的數據:', rooms);
      
      if (rooms && Array.isArray(rooms)) {
        setCompletedRooms(rooms);
        setConnectionStatus('connected');
        
        if (rooms.length === 0) {
          console.log('📭 Firebase 連接成功，但尚未有已完成的比賽記錄');
        } else {
          console.log('🎉 成功載入', rooms.length, '個已完成的比賽');
        }
      } else {
        console.warn('⚠️ Firebase 返回了非預期的數據格式:', rooms);
        setCompletedRooms([]);
        setConnectionStatus('connected');
      }
      
    } catch (err) {
      console.error('❌ 載入 Firebase 數據失敗:', err);
      console.error('錯誤詳情:', {
        code: err.code,
        message: err.message,
        name: err.name
      });
      
      setCompletedRooms([]);
      setConnectionStatus('error');
      
      // 提供具體的錯誤訊息
      if (err.code === 'permission-denied') {
        setError('Firebase 權限被拒絕。請檢查 Firestore 安全規則設定。');
      } else if (err.code === 'unavailable') {
        setError('Firebase 服務暫時無法使用。請稍後再試。');
      } else if (err.code === 'failed-precondition') {
        setError('Firebase 索引未建立。請在 Firebase 控制台中建立必要的索引。');
      } else if (err.message.includes('network')) {
        setError('網路連接問題。請檢查網路連接並重試。');
      } else {
        setError(`Firebase 連接失敗: ${err.message || err.code || '未知錯誤'}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const formatDuration = (durationMs) => {
    if (!durationMs || durationMs <= 0) return '未知';
    
    const minutes = Math.floor(durationMs / (1000 * 60));
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    
    if (hours > 0) {
      return `${hours}小時${remainingMinutes}分鐘`;
    }
    return `${minutes}分鐘`;
  };

  const formatTimeAgo = (date) => {
    if (!date) return '未知時間';
    
    const now = new Date();
    const targetDate = date instanceof Date ? date : date.toDate ? date.toDate() : new Date(date);
    const diffInMinutes = Math.floor((now - targetDate) / (1000 * 60));
    
    if (diffInMinutes < 1) return '剛剛';
    if (diffInMinutes < 60) return `${diffInMinutes}分鐘前`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}小時前`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}天前`;
    
    const diffInWeeks = Math.floor(diffInDays / 7);
    return `${diffInWeeks}週前`;
  };

  const calculateStats = () => {
    if (completedRooms.length === 0) return null;

    const totalGames = completedRooms.length;
    const totalBattles = completedRooms.reduce((sum, room) => sum + (room.totalBattles || 0), 0);
    const totalDuration = completedRooms.reduce((sum, room) => sum + (room.duration || 0), 0);
    const avgBattlesPerGame = totalBattles > 0 ? Math.round(totalBattles / totalGames) : 0;
    const avgDuration = totalDuration > 0 ? Math.round(totalDuration / totalGames) : 0;

    // Player statistics
    const playerStats = {};
    completedRooms.forEach(room => {
      if (room.finalResults && room.finalResults.players) {
        room.finalResults.players.forEach((player, index) => {
          if (!playerStats[player.name]) {
            playerStats[player.name] = {
              gamesPlayed: 0,
              totalScore: 0,
              wins: 0,
              avgScore: 0,
              avgRank: 0,
              totalRank: 0
            };
          }
          playerStats[player.name].gamesPlayed++;
          playerStats[player.name].totalScore += player.score || 0;
          playerStats[player.name].totalRank += (index + 1);
          if (index === 0) playerStats[player.name].wins++;
        });
      }
    });

    // Calculate averages
    Object.values(playerStats).forEach(stats => {
      stats.avgScore = stats.gamesPlayed > 0 ? Math.round((stats.totalScore / stats.gamesPlayed) * 10) / 10 : 0;
      stats.avgRank = stats.gamesPlayed > 0 ? Math.round((stats.totalRank / stats.gamesPlayed) * 10) / 10 : 0;
    });

    return {
      totalGames,
      totalBattles,
      avgBattlesPerGame,
      avgDuration,
      playerStats
    };
  };

  const stats = calculateStats();

  if (selectedRoom) {
    return (
      <div className="room-history">
        <div className="room-history-header">
          <button className="back-btn" onClick={() => setSelectedRoom(null)}>
            ← 返回列表
          </button>
          <h2>🏆 比賽詳情</h2>
        </div>

        <div className="room-details">
          <div className="room-detail-header">
            <h3>房間 {selectedRoom.roomCode}</h3>
            <div className="room-meta">
              <span className="detail-badge">{selectedRoom.playerCount}人比賽</span>
              <span className="detail-badge">{selectedRoom.totalBattles}場對戰</span>
              <span className="detail-badge">{formatDuration(selectedRoom.duration)}</span>
            </div>
          </div>

          <div className="final-rankings">
            <h4>🥇 最終排名</h4>
            <div className="rankings-list">
              {selectedRoom.finalResults?.players?.map((player, index) => (
                <div key={player.name} className={`ranking-item ${index === 0 ? 'winner' : ''}`}>
                  <div className="rank-number">
                    {index === 0 ? '👑' : `${index + 1}.`}
                  </div>
                  <div className="player-info">
                    <span className="player-name">{player.name}</span>
                    <span className="player-score">{player.score || 0} 分</span>
                  </div>
                  {index === 0 && <div className="winner-badge">冠軍</div>}
                </div>
              ))}
            </div>
          </div>

          <div className="match-info">
            <h4>📊 比賽資訊</h4>
            <div className="info-grid">
              <div className="info-item">
                <span className="info-label">開始時間:</span>
                <span className="info-value">
                  {selectedRoom.created ? 
                    (selectedRoom.created instanceof Date ? 
                      selectedRoom.created.toLocaleString() : 
                      selectedRoom.created.toDate ? 
                        selectedRoom.created.toDate().toLocaleString() : 
                        new Date(selectedRoom.created).toLocaleString()
                    ) : '未知'
                  }
                </span>
              </div>
              <div className="info-item">
                <span className="info-label">結束時間:</span>
                <span className="info-value">
                  {selectedRoom.ended ? 
                    (selectedRoom.ended instanceof Date ? 
                      selectedRoom.ended.toLocaleString() : 
                      selectedRoom.ended.toDate ? 
                        selectedRoom.ended.toDate().toLocaleString() : 
                        new Date(selectedRoom.ended).toLocaleString()
                    ) : '未知'
                  }
                </span>
              </div>
              <div className="info-item">
                <span className="info-label">比賽時長:</span>
                <span className="info-value">{formatDuration(selectedRoom.duration)}</span>
              </div>
              <div className="info-item">
                <span className="info-label">總對戰數:</span>
                <span className="info-value">{selectedRoom.totalBattles || 0}場</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="room-history">
      <div className="room-history-header">
        <button className="back-btn" onClick={onBack}>
          ← 返回主頁
        </button>
        <h2>📈 歷史統計</h2>
        <button className="refresh-btn" onClick={loadCompletedRooms} disabled={isLoading}>
          {isLoading ? '⟳' : '🔄'} 刷新
        </button>
      </div>

      {/* Connection Status */}
      <div className="connection-status">
        <div className={`status-indicator ${connectionStatus}`}>
          {connectionStatus === 'checking' && '🔍 檢查連接...'}
          {connectionStatus === 'connecting' && '🔗 連接 Firebase...'}
          {connectionStatus === 'connected' && '✅ Firebase 已連接'}
          {connectionStatus === 'error' && '❌ 連接失敗'}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="error-message">
          <div className="error-title">⚠️ 載入失敗</div>
          <div className="error-detail">{error}</div>
          <div className="error-actions">
            <button onClick={loadCompletedRooms} className="retry-btn">
              重試連接
            </button>
          </div>
        </div>
      )}

      {/* Stats - only show if we have data */}
      {stats && completedRooms.length > 0 && (
        <div className="global-stats">
          <h3>🌟 總體統計</h3>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-number">{stats.totalGames}</div>
              <div className="stat-label">總比賽場次</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">{stats.totalBattles}</div>
              <div className="stat-label">總對戰次數</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">{stats.avgBattlesPerGame}</div>
              <div className="stat-label">平均每場對戰</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">{formatDuration(stats.avgDuration)}</div>
              <div className="stat-label">平均比賽時長</div>
            </div>
          </div>

          {Object.keys(stats.playerStats).length > 0 && (
            <div className="player-stats">
              <h4>👥 選手統計</h4>
              <div className="player-stats-list">
                {Object.entries(stats.playerStats)
                  .sort(([,a], [,b]) => b.wins - a.wins || a.avgRank - b.avgRank)
                  .map(([name, playerStat]) => (
                  <div key={name} className="player-stat-card">
                    <div className="player-stat-header">
                      <span className="player-stat-name">{name}</span>
                      <div className="player-stat-badges">
                        {playerStat.wins > 0 && (
                          <span className="win-badge">{playerStat.wins}勝</span>
                        )}
                        <span className="games-badge">{playerStat.gamesPlayed}場</span>
                      </div>
                    </div>
                    <div className="player-stat-details">
                      <span className="stat-detail">平均分數: {playerStat.avgScore}</span>
                      <span className="stat-detail">平均排名: {playerStat.avgRank}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <div className="completed-rooms-section">
        <h3>🏁 已完成的比賽 ({completedRooms.length})</h3>
        
        {isLoading ? (
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>載入歷史記錄中...</p>
          </div>
        ) : connectionStatus === 'error' ? (
          <div className="error-state">
            <div className="error-icon">🔌</div>
            <h4>無法連接到 Firebase</h4>
            <p>請檢查網路連接和 Firebase 設定</p>
            <button onClick={loadCompletedRooms} className="retry-btn">
              重試連接
            </button>
          </div>
        ) : completedRooms.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📭</div>
            <h4>還沒有完成的比賽</h4>
            <p>完成一些比賽後，這裡就會顯示歷史統計了</p>
            <div className="empty-actions">
              <button onClick={() => onBack()} className="start-game-btn">
                開始新比賽
              </button>
            </div>
          </div>
        ) : (
          <div className="completed-rooms-grid">
            {completedRooms.map((room) => (
              <div key={room.id} className="completed-room-card" onClick={() => setSelectedRoom(room)}>
                <div className="room-card-header">
                  <h4 className="room-card-title">🏆 房間 {room.roomCode}</h4>
                  <div className="room-card-badges">
                    <span className="player-count-badge">{room.playerCount || 4}人</span>
                    <span className="battles-badge">{room.totalBattles || 0}場</span>
                  </div>
                </div>
                
                <div className="room-card-winner">
                  <span className="winner-label">冠軍:</span>
                  <span className="winner-name">
                    👑 {room.finalResults?.players?.[0]?.name || '未知'}
                  </span>
                  <span className="winner-score">
                    ({room.finalResults?.players?.[0]?.score || 0}分)
                  </span>
                </div>
                
                <div className="room-card-info">
                  <div className="room-card-detail">
                    <span className="detail-label">⏰ 時長:</span>
                    <span className="detail-value">{formatDuration(room.duration)}</span>
                  </div>
                  <div className="room-card-detail">
                    <span className="detail-label">📅 結束:</span>
                    <span className="detail-value">{formatTimeAgo(room.ended)}</span>
                  </div>
                </div>
                
                <div className="view-details-hint">
                  點擊查看詳情 →
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default RoomHistory;