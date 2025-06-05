import React, { useState, useEffect } from 'react';
import './RoomBrowser.css';
import { useFirebaseRoom } from '../hooks/useFirebaseGame';

const RoomBrowser = ({ onJoinRoom, onCreateRoom, onViewHistory, isLoading }) => {
  const [activeRooms, setActiveRooms] = useState([]);
  const [roomCode, setRoomCode] = useState('');
  const [isLoadingRooms, setIsLoadingRooms] = useState(false);
  const [mode, setMode] = useState('browse'); // 'browse' or 'join' or 'create'
  const [firebaseError, setFirebaseError] = useState(null);

  const { getActiveRooms } = useFirebaseRoom(true);

  // Load active rooms initially
  useEffect(() => {
    loadActiveRooms();
  }, []);

  // Set up real-time room list updates
  useEffect(() => {
    let unsubscribe = null;
    
    // Import gameService to set up real-time listener
    import('../services/gameService').then(({ default: gameService }) => {
      // Subscribe to real-time updates of the rooms collection
      unsubscribe = gameService.subscribeToActiveRooms((rooms) => {
        console.log('Real-time rooms update:', rooms);
        setActiveRooms(rooms || []);
        setIsLoadingRooms(false);
      }, (error) => {
        console.error('Failed to subscribe to room updates:', error);
        setFirebaseError(error.message);
        // Fallback to mock data
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
        setIsLoadingRooms(false);
      });
    }).catch((error) => {
      console.error('Failed to import gameService:', error);
      loadActiveRooms(); // Fallback to manual loading
    });

    // Cleanup subscription on unmount
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);

  const loadActiveRooms = async () => {
    setIsLoadingRooms(true);
    setFirebaseError(null);
    try {
      console.log('Loading active rooms...');
      const rooms = await getActiveRooms();
      console.log('Loaded rooms:', rooms);
      setActiveRooms(rooms || []);
      
      // If no rooms found and no Firebase error, show a message
      if ((!rooms || rooms.length === 0) && !firebaseError) {
        console.log('No active rooms found, possibly due to Firebase config or empty database');
      }
    } catch (error) {
      console.error('Failed to load active rooms:', error);
      setFirebaseError(error.message);
      
      // Show mock data as fallback for demo purposes
      const mockRooms = [
        {
          id: 'DEMO01',
          displayName: 'DEMO01',
          roomCode: 'DEMO01',
          playerCount: 4,
          currentPlayers: ['Alice', 'Bob', 'Charlie', 'David'],
          status: 'playing',
          created: new Date(Date.now() - 15 * 60 * 1000), // 15 minutes ago
          lastActivity: new Date(Date.now() - 2 * 60 * 1000) // 2 minutes ago
        },
        {
          id: 'DEMO02',
          displayName: 'DEMO02',
          roomCode: 'DEMO02',
          playerCount: 3,
          currentPlayers: ['Emma', 'Frank', 'Grace'],
          status: 'playing',
          created: new Date(Date.now() - 45 * 60 * 1000), // 45 minutes ago
          lastActivity: new Date(Date.now() - 5 * 60 * 1000) // 5 minutes ago
        }
      ];
      setActiveRooms(mockRooms);
      console.log('Using mock room data for demo');
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
    if (diffInHours < 24) return `${diffInHours}小時前`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}天前`;
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
          <div className="create-room-info">
            <h3>🏠 成為房主</h3>
            <p>作為房主，你將創建一個新的比賽房間。</p>
            <p>其他人可以通過房間號加入觀看和參與比賽。</p>
            
            <div className="host-benefits">
              <h4>房主權限：</h4>
              <ul>
                <li>🎯 控制比賽進行（記錄勝負）</li>
                <li>⚙️ 設定比賽規則和人數</li>
                <li>🏁 決定比賽何時結束</li>
                <li>🔄 管理撤銷操作</li>
              </ul>
            </div>
            
            <div className="guest-info">
              <h4>觀戰者可以：</h4>
              <ul>
                <li>👀 即時觀看比賽進度</li>
                <li>📊 查看積分榜和統計</li>
                <li>📜 瀏覽比賽歷史</li>
                <li>🔄 同步接收所有更新</li>
                <li>🎮 協助控制比賽進行</li>
              </ul>
            </div>
          </div>
          
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
                disabled={!roomCode.trim() || isLoading}
              >
                {isLoading ? '加入中...' : '加入房間'}
              </button>
            </div>
            
            <div className="join-tips">
              <h4>💡 加入提示：</h4>
              <ul>
                <li>房間號不區分大小寫</li>
                <li>加入後可即時觀看比賽</li>
                <li>所有人都可以控制比賽</li>
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
            onClick={onViewHistory}
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
              onClick={() => setMode('create')}
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
              <strong>房主模式</strong>
              <p>創建房間後成為房主，擁有比賽控制權</p>
            </div>
          </div>
          <div className="tip-item">
            <span className="tip-icon">👀</span>
            <div>
              <strong>觀戰模式</strong>
              <p>加入他人房間，即時觀看比賽進度</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoomBrowser;