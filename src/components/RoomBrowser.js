/**
 * Enhanced Room Browser - With Visual Flow Support
 * Browse and join rooms with enhanced visual feedback
 */

import React, { useState, useEffect } from 'react';
import './RoomBrowser.css';
import { useGame } from '../contexts/GameContext';
import { APP_MODES } from '../constants';

const RoomBrowser = () => {
  const { setMode, setStatus } = useGame();
  const [activeRooms, setActiveRooms] = useState([]);
  const [roomCode, setRoomCode] = useState('');
  const [isLoadingRooms, setIsLoadingRooms] = useState(false);
  const [mode, setLocalMode] = useState('browse'); // 'browse' or 'join' or 'create'
  const [firebaseError, setFirebaseError] = useState(null);

  // Load active rooms initially
  useEffect(() => {
    loadActiveRooms();
  }, []);

  const loadActiveRooms = async () => {
    setIsLoadingRooms(true);
    setFirebaseError(null);
    try {
      // Mock data for demonstration
      const mockRooms = [
        {
          id: 'DEMO01',
          displayName: 'DEMO01',
          roomCode: 'DEMO01',
          playerCount: 4,
          currentPlayers: ['Alice', 'Bob', 'Charlie', 'David'],
          status: 'playing',
          created: new Date(Date.now() - 15 * 60 * 1000),
          lastActivity: new Date(Date.now() - 2 * 60 * 1000)
        },
        {
          id: 'DEMO02',
          displayName: 'DEMO02',
          roomCode: 'DEMO02',
          playerCount: 3,
          currentPlayers: ['Emma', 'Frank', 'Grace'],
          status: 'playing',
          created: new Date(Date.now() - 45 * 60 * 1000),
          lastActivity: new Date(Date.now() - 5 * 60 * 1000)
        }
      ];
      setActiveRooms(mockRooms);
      console.log('Using mock room data for demo');
    } catch (error) {
      console.error('Failed to load active rooms:', error);
      setFirebaseError(error.message);
    } finally {
      setIsLoadingRooms(false);
    }
  };

  const handleJoinByCode = () => {
    if (roomCode.trim()) {
      // For demo, just go to player setup
      setStatus('info', `嘗試加入房間: ${roomCode.trim().toUpperCase()}`);
      setMode(APP_MODES.PLAYER_SETUP);
    }
  };

  const handleJoinRoom = (roomId) => {
    // For demo, just go to player setup
    setStatus('info', `加入房間: ${roomId}`);
    setMode(APP_MODES.PLAYER_SETUP);
  };

  const handleCreateRoom = () => {
    // Go directly to player setup for creating a new room
    setStatus('success', '創建新房間');
    setMode(APP_MODES.PLAYER_SETUP);
  };

  const handleViewHistory = () => {
    // Go to history mode
    setMode(APP_MODES.HISTORY);
  };

  const formatTimeAgo = (date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));
    
    if (diffInMinutes < 1) return '剛剛';
    if (diffInMinutes < 60) return `${diffInMinutes}分鐘前`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}小時前`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}天前`;
  };

  if (mode === 'create') {
    // 直接創建房間，不顯示說明頁面
    handleCreateRoom();
    setLocalMode('browse'); // 返回瀏覽模式
    return null;
  }

  if (mode === 'join') {
    return (
      <div className="room-browser">
        <div className="room-browser-header">
          <button 
            className="back-btn"
            onClick={() => setLocalMode('browse')}
          >
            ← 返回
          </button>
          <h2>🔗 加入房間</h2>
        </div>
        
        <div className="join-room-section">
          <div className="join-room-info">
            <h3>📱 輸入房間號</h3>
            <p>向房主索取6位數房間號碼，即可加入正在進行的比賽：</p>
            
            <div className="room-code-input">
              <input
                type="text"
                placeholder="輸入房間號碼 (例如: ABC123)"
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                onKeyPress={(e) => e.key === 'Enter' && handleJoinByCode()}
                maxLength="6"
              />
              <button 
                onClick={handleJoinByCode}
                disabled={!roomCode.trim()}
              >
                加入房間
              </button>
            </div>
            
            <div className="join-tips">
              <h4>💡 加入提示：</h4>
              <ul>
                <li>房間號不區分大小寫</li>
                <li>加入後可即時觀看比賽</li>
                <li>所有人都能一起控制比賽</li>
                <li>所有人都能看到即時更新</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="room-browser">
      <div className="room-browser-header">
        <h2>🏠 多人房間</h2>
        <div className="header-actions">
          <span className="live-indicator">🔴 即時更新</span>
          <button 
            className="history-btn"
            onClick={handleViewHistory}
          >
            📈 歷史統計
          </button>
          <button 
            className="refresh-btn"
            onClick={loadActiveRooms}
            disabled={isLoadingRooms}
          >
            {isLoadingRooms ? '⟳' : '🔄'} 刷新
          </button>
        </div>
      </div>

      {/* Firebase connection status */}
      {firebaseError && (
        <div className="firebase-status error">
          ⚠️ Firebase 連接問題: {firebaseError}
          <br />
          <small>目前顯示的是演示資料，實際功能可能受限</small>
        </div>
      )}

      <div className="room-actions">
        <button 
          className="action-btn create-btn"
          onClick={() => setLocalMode('create')}
        >
          🎮 創建新房間
        </button>
        
        <button 
          className="action-btn join-btn"
          onClick={() => setLocalMode('join')}
        >
          🔗 輸入房間號加入
        </button>
      </div>

      <div className="active-rooms-section">
        <h3>🎯 進行中的房間 ({activeRooms.length})</h3>
        
        {isLoadingRooms ? (
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>載入房間列表中...</p>
          </div>
        ) : activeRooms.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🤷‍♂️</div>
            <h4>目前沒有進行中的房間</h4>
            {firebaseError ? (
              <p>Firebase 連接問題，無法載入房間列表</p>
            ) : (
              <p>成為第一個創建房間的人吧！</p>
            )}
            <button 
              className="empty-create-btn"
              onClick={() => setLocalMode('create')}
            >
              🎮 立即創建房間
            </button>
          </div>
        ) : (
          <div className="rooms-grid">
            {activeRooms.map((room) => (
              <div key={room.id} className="room-card">
                <div className="room-header">
                  <h4 className="room-title">🏆 房間 {room.displayName}</h4>
                  <div className="room-badges">
                    <span className="room-status playing">比賽中</span>
                    <span className="player-count">{room.playerCount}人</span>
                    {room.id.startsWith('DEMO') && (
                      <span className="demo-badge">演示</span>
                    )}
                  </div>
                </div>
                
                <div className="room-info">
                  <div className="room-detail">
                    <span className="label">👤 選手:</span>
                    <span className="value players-list">
                      {room.currentPlayers.slice(0, 3).join(', ')}
                      {room.currentPlayers.length > 3 && `...等${room.currentPlayers.length}人`}
                    </span>
                  </div>
                  
                  <div className="room-detail">
                    <span className="label">⏰ 最後活動:</span>
                    <span className="value">{formatTimeAgo(room.lastActivity)}</span>
                  </div>
                  
                  <div className="room-detail">
                    <span className="label">🕐 創建時間:</span>
                    <span className="value">{formatTimeAgo(room.created)}</span>
                  </div>
                </div>
                
                <button 
                  className="join-room-btn"
                  onClick={() => handleJoinRoom(room.roomCode || room.id)}
                >
                  🎮 加入比賽
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="room-tips">
        <h4>💡 多人模式說明</h4>
        <div className="tips-grid">
          <div className="tip-item">
            <span className="tip-icon">🔴</span>
            <div>
              <strong>即時更新</strong>
              <p>房間列表自動同步，無需手動刷新</p>
            </div>
          </div>
          <div className="tip-item">
            <span className="tip-icon">📈</span>
            <div>
              <strong>歷史統計</strong>
              <p>查看過往比賽記錄和選手表現</p>
            </div>
          </div>
          <div className="tip-item">
            <span className="tip-icon">🎮</span>
            <div>
              <strong>創建房間</strong>
              <p>創建房間後所有人都可以一起控制比賽</p>
            </div>
          </div>
          <div className="tip-item">
            <span className="tip-icon">👁️</span>
            <div>
              <strong>視覺化流程</strong>
              <p>懸停選手可預覽勝負結果，點擊宣布勝利</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoomBrowser;