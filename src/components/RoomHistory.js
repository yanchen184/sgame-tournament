import React, { useState, useEffect } from 'react';
import './RoomHistory.css';
import gameService from '../services/gameService';

const RoomHistory = ({ onBack }) => {
  const [completedRooms, setCompletedRooms] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [isDemo, setIsDemo] = useState(false);

  useEffect(() => {
    loadCompletedRooms();
  }, []);

  // Mock data for demonstration
  const getMockCompletedRooms = () => [
    {
      id: 'DEMO01',
      roomCode: 'ABC123',
      playerCount: 4,
      playerNames: ['bob', 'jimmy', 'white', 'dada'],
      finalResults: {
        players: [
          { name: 'bob', score: 8, winStreak: 0 },
          { name: 'jimmy', score: 6, winStreak: 0 },
          { name: 'white', score: 4, winStreak: 0 },
          { name: 'dada', score: 2, winStreak: 0 }
        ],
        totalBattles: 20
      },
      created: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      ended: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
      duration: 60 * 60 * 1000, // 1 hour
      totalBattles: 20
    },
    {
      id: 'DEMO02',
      roomCode: 'XYZ789',
      playerCount: 3,
      playerNames: ['alice', 'charlie', 'eve'],
      finalResults: {
        players: [
          { name: 'alice', score: 12, winStreak: 0 },
          { name: 'charlie', score: 8, winStreak: 0 },
          { name: 'eve', score: 5, winStreak: 0 }
        ],
        totalBattles: 25
      },
      created: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
      ended: new Date(Date.now() - 23 * 60 * 60 * 1000), // 23 hours ago
      duration: 60 * 60 * 1000, // 1 hour
      totalBattles: 25
    },
    {
      id: 'DEMO03',
      roomCode: 'DEF456',
      playerCount: 4,
      playerNames: ['tom', 'sarah', 'mike', 'lisa'],
      finalResults: {
        players: [
          { name: 'sarah', score: 9, winStreak: 0 },
          { name: 'tom', score: 7, winStreak: 0 },
          { name: 'mike', score: 5, winStreak: 0 },
          { name: 'lisa', score: 3, winStreak: 0 }
        ],
        totalBattles: 24
      },
      created: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
      ended: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000 + 45 * 60 * 1000), // 3 days ago + 45 min
      duration: 45 * 60 * 1000, // 45 minutes
      totalBattles: 24
    }
  ];

  const loadCompletedRooms = async () => {
    setIsLoading(true);
    setError(null);
    setIsDemo(false);
    
    try {
      console.log('Attempting to load completed rooms from Firebase...');
      const rooms = await gameService.getCompletedRooms(50);
      
      if (rooms && rooms.length > 0) {
        console.log('Successfully loaded rooms from Firebase:', rooms.length);
        setCompletedRooms(rooms);
        setIsDemo(false);
      } else {
        console.log('No completed rooms found in Firebase, using demo data');
        // If no rooms found, use demo data instead of showing error
        setCompletedRooms(getMockCompletedRooms());
        setIsDemo(true);
      }
    } catch (err) {
      console.error('Failed to load completed rooms from Firebase:', err);
      console.log('Using demo data as fallback');
      
      // Use demo data as fallback
      setCompletedRooms(getMockCompletedRooms());
      setIsDemo(true);
      
      // Set a friendly error message
      if (err.code === 'permission-denied') {
        setError('Firebase 權限不足，目前顯示演示資料');
      } else if (err.code === 'unavailable') {
        setError('Firebase 服務暫時無法使用，目前顯示演示資料');
      } else {
        setError('無法連接到雲端資料庫，目前顯示演示資料');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const formatDuration = (durationMs) => {
    const minutes = Math.floor(durationMs / (1000 * 60));
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    
    if (hours > 0) {
      return `${hours}小時${remainingMinutes}分鐘`;
    }
    return `${minutes}分鐘`;
  };

  const formatTimeAgo = (date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));
    
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
    const avgBattlesPerGame = Math.round(totalBattles / totalGames);
    const avgDuration = Math.round(totalDuration / totalGames);

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
          playerStats[player.name].totalScore += player.score;
          playerStats[player.name].totalRank += (index + 1);
          if (index === 0) playerStats[player.name].wins++;
        });
      }
    });

    // Calculate averages
    Object.values(playerStats).forEach(stats => {
      stats.avgScore = Math.round((stats.totalScore / stats.gamesPlayed) * 10) / 10;
      stats.avgRank = Math.round((stats.totalRank / stats.gamesPlayed) * 10) / 10;
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
          {isDemo && (
            <div className="demo-badge">
              演示資料
            </div>
          )}
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
                    <span className="player-score">{player.score} 分</span>
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
                <span className="info-value">{selectedRoom.created.toLocaleString()}</span>
              </div>
              <div className="info-item">
                <span className="info-label">結束時間:</span>
                <span className="info-value">{selectedRoom.ended.toLocaleString()}</span>
              </div>
              <div className="info-item">
                <span className="info-label">比賽時長:</span>
                <span className="info-value">{formatDuration(selectedRoom.duration)}</span>
              </div>
              <div className="info-item">
                <span className="info-label">總對戰數:</span>
                <span className="info-value">{selectedRoom.totalBattles}場</span>
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

      {/* Demo mode indicator */}
      {isDemo && (
        <div className="demo-banner">
          <div className="demo-content">
            <span className="demo-icon">🎯</span>
            <div className="demo-text">
              <strong>演示模式</strong>
              <span>目前顯示的是範例資料。完成真實比賽後會顯示實際的歷史記錄。</span>
            </div>
          </div>
        </div>
      )}

      {/* Only show error if it's not just demo mode */}
      {error && !isDemo && (
        <div className="error-message">
          ⚠️ {error}
        </div>
      )}

      {stats && (
        <div className="global-stats">
          <h3>🌟 總體統計 {isDemo && <span className="demo-label">(演示)</span>}</h3>
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
        ) : completedRooms.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📭</div>
            <h4>還沒有完成的比賽</h4>
            <p>完成一些比賽後，這裡就會顯示歷史統計了</p>
          </div>
        ) : (
          <div className="completed-rooms-grid">
            {completedRooms.map((room) => (
              <div key={room.id} className="completed-room-card" onClick={() => setSelectedRoom(room)}>
                <div className="room-card-header">
                  <h4 className="room-card-title">
                    🏆 房間 {room.roomCode}
                    {isDemo && <span className="demo-tag">演示</span>}
                  </h4>
                  <div className="room-card-badges">
                    <span className="player-count-badge">{room.playerCount}人</span>
                    <span className="battles-badge">{room.totalBattles}場</span>
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