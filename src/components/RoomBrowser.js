import React, { useState, useEffect } from 'react';
import './RoomBrowser.css';

const RoomBrowser = ({ onJoinRoom, onCreateRoom, isLoading }) => {
  const [activeRooms, setActiveRooms] = useState([]);
  const [roomCode, setRoomCode] = useState('');
  const [isLoadingRooms, setIsLoadingRooms] = useState(false);
  const [mode, setMode] = useState('browse'); // 'browse' or 'join' or 'create'

  // Load active rooms (mock for now, will be replaced with Firebase)
  useEffect(() => {
    loadActiveRooms();
  }, []);

  const loadActiveRooms = async () => {
    setIsLoadingRooms(true);
    try {
      // TODO: Replace with actual Firebase call
      // const rooms = await gameService.getActiveRooms();
      
      // Mock data for demonstration
      const mockRooms = [
        {
          id: 'GAME123',
          displayName: 'GAME123',
          playerCount: 4,
          currentPlayers: ['Alice', 'Bob', 'Charlie', 'David'],
          status: 'playing',
          created: new Date(Date.now() - 15 * 60 * 1000), // 15 minutes ago
          lastActivity: new Date(Date.now() - 2 * 60 * 1000) // 2 minutes ago
        },
        {
          id: 'ROOM456',
          displayName: 'ROOM456',
          playerCount: 3,
          currentPlayers: ['Emma', 'Frank', 'Grace'],
          status: 'playing',
          created: new Date(Date.now() - 45 * 60 * 1000), // 45 minutes ago
          lastActivity: new Date(Date.now() - 5 * 60 * 1000) // 5 minutes ago
        }
      ];
      
      setActiveRooms(mockRooms);
    } catch (error) {
      console.error('Failed to load active rooms:', error);
    } finally {
      setIsLoadingRooms(false);
    }
  };

  const handleJoinByCode = () => {
    if (roomCode.trim()) {
      onJoinRoom(roomCode.trim().toUpperCase());
    }
  };

  const handleJoinRoom = (roomId) => {
    onJoinRoom(roomId);
  };

  const formatTimeAgo = (date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));
    
    if (diffInMinutes < 1) return '剛剛';
    if (diffInMinutes < 60) return `${diffInMinutes}分鐘前`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    return `${diffInHours}小時前`;
  };

  if (mode === 'create') {
    return (
      <div className="room-browser">
        <div className="room-browser-header">
          <button 
            className="back-btn"
            onClick={() => setMode('browse')}
          >
            ← 返回
          </button>
          <h2>🎮 創建新房間</h2>
        </div>
        
        <div className="create-room-section">
          <p>作為房主，你將創建一個新的比賽房間。</p>
          <p>其他人可以通過房間號加入觀看和參與比賽。</p>
          
          <button 
            className="create-room-btn"
            onClick={onCreateRoom}
            disabled={isLoading}
          >
            {isLoading ? '創建中...' : '🚀 創建房間並開始比賽'}
          </button>
        </div>
      </div>
    );
  }

  if (mode === 'join') {
    return (
      <div className="room-browser">
        <div className="room-browser-header">
          <button 
            className="back-btn"
            onClick={() => setMode('browse')}
          >
            ← 返回
          </button>
          <h2>🔗 加入房間</h2>
        </div>
        
        <div className="join-room-section">
          <p>輸入房間號碼來加入正在進行的比賽：</p>
          
          <div className="room-code-input">
            <input
              type="text"
              placeholder="輸入房間號碼 (例如: GAME123)"
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
              onKeyPress={(e) => e.key === 'Enter' && handleJoinByCode()}
              maxLength="10"
            />
            <button 
              onClick={handleJoinByCode}
              disabled={!roomCode.trim() || isLoading}
            >
              {isLoading ? '加入中...' : '加入房間'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="room-browser">
      <div className="room-browser-header">
        <h2>🏠 房間選擇</h2>
        <button 
          className="refresh-btn"
          onClick={loadActiveRooms}
          disabled={isLoadingRooms}
        >
          {isLoadingRooms ? '⟳' : '🔄'} 刷新
        </button>
      </div>

      <div className="room-actions">
        <button 
          className="action-btn create-btn"
          onClick={() => setMode('create')}
        >
          🎮 創建新房間
        </button>
        
        <button 
          className="action-btn join-btn"
          onClick={() => setMode('join')}
        >
          🔗 輸入房間號加入
        </button>
      </div>

      <div className="active-rooms-section">
        <h3>🎯 進行中的房間</h3>
        
        {isLoadingRooms ? (
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>載入房間列表中...</p>
          </div>
        ) : activeRooms.length === 0 ? (
          <div className="empty-state">
            <p>🤷‍♂️ 目前沒有進行中的房間</p>
            <p>成為第一個創建房間的人吧！</p>
          </div>
        ) : (
          <div className="rooms-grid">
            {activeRooms.map((room) => (
              <div key={room.id} className="room-card">
                <div className="room-header">
                  <h4 className="room-title">🏆 {room.displayName}</h4>
                  <span className="room-status playing">比賽中</span>
                </div>
                
                <div className="room-info">
                  <div className="room-detail">
                    <span className="label">👥 人數:</span>
                    <span className="value">{room.playerCount}人</span>
                  </div>
                  
                  <div className="room-detail">
                    <span className="label">👤 選手:</span>
                    <span className="value players-list">
                      {room.currentPlayers.slice(0, 2).join(', ')}
                      {room.currentPlayers.length > 2 && `...等${room.currentPlayers.length}人`}
                    </span>
                  </div>
                  
                  <div className="room-detail">
                    <span className="label">⏰ 最後活動:</span>
                    <span className="value">{formatTimeAgo(room.lastActivity)}</span>
                  </div>
                </div>
                
                <button 
                  className="join-room-btn"
                  onClick={() => handleJoinRoom(room.id)}
                  disabled={isLoading}
                >
                  {isLoading ? '加入中...' : '👀 觀看比賽'}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="room-tips">
        <h4>💡 小貼士</h4>
        <ul>
          <li>所有人都可以在同一個房間觀看比賽進度</li>
          <li>房主可以控制比賽進行，其他人可以觀看</li>
          <li>房間會自動同步最新的比賽狀態</li>
          <li>比賽結束後房間會保留一段時間供查看結果</li>
        </ul>
      </div>
    </div>
  );
};

export default RoomBrowser;