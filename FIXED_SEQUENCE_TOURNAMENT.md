# 固定順序賽制 (Fixed Sequence Tournament)

## 概述

固定順序賽制是一個專為4人比賽設計的特殊賽制，確保每場比賽的對戰順序都是固定的，無論誰贏都會按照既定順序進行下一場比賽。每場比賽的結果都會記錄到資料庫中，支援多台機器同時連接參與比賽。

## 特色功能

- ✅ **固定對戰順序**：AB → CD → CA → BD → BC → AD
- ✅ **資料庫同步**：每場比賽結果實時同步到 Firebase
- ✅ **多機器支援**：支援多台設備同時參與同一場比賽
- ✅ **無需選擇休息**：簡化遊戲流程，專注於對戰
- ✅ **簡單積分制**：勝利得1分，失敗得0分
- ✅ **自動標籤系統**：玩家自動標記為 A、B、C、D

## 對戰順序說明

### 6場固定對戰
1. **第1場**: A vs B
2. **第2場**: C vs D  
3. **第3場**: C vs A
4. **第4場**: B vs D
5. **第5場**: B vs C
6. **第6場**: A vs D

### 特點
- 每位玩家都會與其他3位玩家各對戰2次
- 總共6場比賽，確保公平性
- 無論勝負結果如何，對戰順序保持不變

## 使用方法

### 1. 基本使用

```jsx
import React from 'react';
import FixedSequenceTournament from './components/FixedSequenceTournament';

const MyTournament = () => {
  const players = [
    { id: 1, name: '玩家1', position: 1 },
    { id: 2, name: '玩家2', position: 2 },
    { id: 3, name: '玩家3', position: 3 },
    { id: 4, name: '玩家4', position: 4 }
  ];

  const handleTournamentComplete = (results) => {
    console.log('比賽結束', results);
    console.log('冠軍:', results.winner.name);
  };

  return (
    <FixedSequenceTournament
      players={players}
      onTournamentComplete={handleTournamentComplete}
      enableDatabaseSync={true}
    />
  );
};
```

### 2. 使用 Hook

```jsx
import React, { useEffect } from 'react';
import useFixedSequenceTournament from './hooks/useFixedSequenceTournament';

const CustomTournament = () => {
  const {
    initializeTournament,
    startTournament,
    processMatchResult,
    gameState,
    sessionId,
    isConnected,
    getTournamentProgress,
    getStandings
  } = useFixedSequenceTournament(true);

  const players = [
    { id: 1, name: '小明', position: 1 },
    { id: 2, name: '小華', position: 2 },
    { id: 3, name: '小美', position: 3 },
    { id: 4, name: '小強', position: 4 }
  ];

  useEffect(() => {
    initializeTournament(players);
  }, []);

  const handleMatchWin = (winnerName) => {
    processMatchResult(winnerName);
  };

  return (
    <div>
      <h2>自定義固定順序比賽</h2>
      {sessionId && (
        <p>比賽 ID: {sessionId} {isConnected ? '🟢' : '🔴'}</p>
      )}
      
      {gameState?.currentMatch && (
        <div>
          <h3>當前對戰</h3>
          <p>
            {gameState.currentMatch.fighters[0].name} VS {gameState.currentMatch.fighters[1].name}
          </p>
          <button onClick={() => handleMatchWin(gameState.currentMatch.fighters[0].name)}>
            {gameState.currentMatch.fighters[0].name} 獲勝
          </button>
          <button onClick={() => handleMatchWin(gameState.currentMatch.fighters[1].name)}>
            {gameState.currentMatch.fighters[1].name} 獲勝
          </button>
        </div>
      )}
    </div>
  );
};
```

### 3. 載入現有比賽

```jsx
const { loadFromSession } = useFixedSequenceTournament();

// 載入現有比賽 session
const handleLoadSession = async () => {
  const sessionId = 'existing-session-id';
  const success = await loadFromSession(sessionId);
  if (success) {
    console.log('成功載入現有比賽');
  }
};
```

## API 參考

### FixedSequenceTournament 組件

#### Props

| 屬性 | 類型 | 必填 | 默認值 | 說明 |
|------|------|------|--------|------|
| `players` | Array | ✅ | - | 4位玩家的陣列 |
| `onTournamentComplete` | Function | ❌ | - | 比賽結束時的回調函數 |
| `enableDatabaseSync` | Boolean | ❌ | `true` | 是否啟用資料庫同步 |

#### 玩家物件結構

```javascript
{
  id: number,        // 唯一識別碼
  name: string,      // 玩家姓名
  position: number   // 初始位置 (1-4)
}
```

### useFixedSequenceTournament Hook

#### 返回值

| 屬性 | 類型 | 說明 |
|------|------|------|
| `initializeTournament` | Function | 初始化比賽 |
| `startTournament` | Function | 開始比賽 |
| `processMatchResult` | Function | 處理比賽結果 |
| `loadFromSession` | Function | 載入現有比賽 |
| `resetTournament` | Function | 重置比賽 |
| `gameState` | Object | 當前遊戲狀態 |
| `sessionId` | String | 比賽 Session ID |
| `isConnected` | Boolean | 資料庫連接狀態 |
| `isProcessing` | Boolean | 是否正在處理中 |
| `error` | String | 錯誤訊息 |
| `statusMessage` | Object | 狀態訊息 |

#### 方法說明

```javascript
// 初始化比賽
await initializeTournament(players, options)

// 開始比賽
await startTournament()

// 處理比賽結果
await processMatchResult(winnerName, matchData)

// 載入現有比賽
await loadFromSession(sessionId)

// 獲取比賽進度
const progress = getTournamentProgress()

// 獲取對戰序列
const sequence = getMatchSequence()

// 獲取排名
const standings = getStandings()

// 獲取最終結果
const results = getFinalResults()
```

## 資料庫結構

### Tournament Sessions 集合

```javascript
{
  id: "session-id",
  type: "fixed-sequence",
  players: [...],
  options: {...},
  sequence: ["AB", "CD", "CA", "BD", "BC", "AD"],
  gameState: {...},
  currentSequenceIndex: 0,
  completedMatches: [...],
  status: "active", // active, completed, cancelled
  created: Timestamp,
  lastActivity: Timestamp,
  version: 1
}
```

### Match Results 集合

```javascript
{
  id: "match-id",
  sessionId: "session-id",
  matchNumber: 1,
  pattern: "AB",
  sequenceIndex: 0,
  fighter1: {...},
  fighter2: {...},
  winner: {...},
  loser: {...},
  timestamp: Timestamp,
  additionalData: {...}
}
```

## 實作注意事項

### 1. 樂觀鎖定

系統使用樂觀鎖定來防止多機器同時操作時的競態條件：

```javascript
await runTransaction(db, async (transaction) => {
  const sessionDoc = await transaction.get(sessionRef);
  const sessionData = sessionDoc.data();
  
  // 檢查版本號
  transaction.update(sessionRef, {
    version: sessionData.version + 1,
    // 其他更新...
  });
});
```

### 2. 防重複記錄

系統會檢查是否已經記錄相同的比賽結果：

```javascript
const existingMatch = sessionData.completedMatches?.find(
  match => match.sequenceIndex === matchResult.sequenceIndex
);

if (existingMatch) {
  console.log('比賽已記錄，跳過...');
  return false;
}
```

### 3. 即時同步

使用 Firebase onSnapshot 實現即時同步：

```javascript
const unsubscribe = FixedSequenceDatabaseService.subscribeToSession(
  sessionId,
  (sessionData) => {
    // 更新本地狀態
  },
  (error) => {
    // 處理錯誤
  }
);
```

## 故障排除

### 常見問題

1. **Firebase 權限錯誤**
   - 確認 Firebase 規則允許讀寫 `tournament-sessions` 和 `match-results` 集合

2. **版本衝突**
   - 多機器同時操作可能導致版本衝突，系統會自動重試

3. **網路連接問題**
   - 檢查 `isConnected` 狀態，離線時系統會切換到本地模式

### 調試技巧

```javascript
// 啟用詳細日誌
console.log('Game State:', gameState);
console.log('Session ID:', sessionId);
console.log('Connection Status:', isConnected);

// 檢查比賽進度
const progress = getTournamentProgress();
console.log('Progress:', progress);

// 檢查對戰序列
const sequence = getMatchSequence();
console.log('Sequence:', sequence);
```

## 版本歷史

### v2.1.0
- ✅ 新增固定順序賽制
- ✅ 資料庫同步功能
- ✅ 多機器支援
- ✅ 完整的UI組件和Hook

## 授權

MIT License
