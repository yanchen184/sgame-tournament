# 賽制系統重構 - v2.0.0

## 概述

全新的模組化賽制系統，支援多種比賽模式，並解決了原本多用戶競爭條件的問題。

## 新增功能

### 🎮 支援的賽制類型

#### 1. 連勝賽制 (Streak Tournament)
- **特色**：原有的冠軍挑戰制，完成連勝後可選擇休息
- **適合人數**：2-12 人
- **預估時間**：10-30 分鐘
- **功能**：
  - 冠軍挑戰制
  - 連勝追蹤
  - 休息選項（獲得獎勵分數）
  - 分數累積系統

#### 2. 淘汰賽制 (Elimination Tournament) 
- **特色**：經典淘汰制，敗者立即出局
- **適合人數**：2-32 人  
- **預估時間**：5-15 分鐘
- **功能**：
  - 標準對戰表
  - 種子排序（按位置/隨機/分數）
  - 輪空處理
  - 快速決勝

#### 3. 循環賽制 (Round Robin Tournament)
- **特色**：每位選手與所有其他選手對戰
- **適合人數**：3-8 人
- **預估時間**：15-45 分鐘  
- **功能**：
  - 公平對戰（每人都打每人）
  - 積分系統（可自訂勝/平/負積分）
  - 完整排名統計
  - 支援平手選項

### 🏗️ 架構設計

#### 核心組件
```
src/gameEngines/
├── BaseTournamentEngine.js      # 基礎賽制介面
├── StreakTournamentEngine.js    # 連勝賽制實現
├── EliminationTournamentEngine.js # 淘汰賽制實現  
├── RoundRobinTournamentEngine.js   # 循環賽制實現
├── TournamentEngineManager.js      # 賽制管理器
└── index.js                       # 統一匯出

src/components/
├── TournamentSelector.js        # 賽制選擇介面
├── TournamentSelector.css       # 樣式文件
└── TournamentDemo.js           # 演示組件

src/hooks/
└── useTournamentEngine.js      # 統一賽制 Hook
```

#### 設計模式
- **策略模式**：不同賽制實現統一介面
- **工廠模式**：`TournamentEngineManager` 創建賽制實例
- **命令模式**：統一的動作處理機制
- **觀察者模式**：狀態變更通知

### 🔧 技術特性

#### 1. 模組化設計
- 每種賽制獨立實現，易於擴展
- 統一的 API 介面
- 可插拔的賽制系統

#### 2. 型別安全
- 完整的參數驗證
- 錯誤處理機制
- 狀態一致性檢查

#### 3. 樂觀鎖定
- 版本控制防止衝突
- 自動重試機制
- 事務性操作

#### 4. 即時同步準備
- 為 Firebase Cloud Functions 預留接口
- 統一的狀態同步機制
- 可選的本地/遠端模式

## 使用方法

### 基本使用

```javascript
import { useTournamentEngine } from './hooks/useTournamentEngine';
import TournamentSelector from './components/TournamentSelector';

function TournamentApp() {
  const {
    initializeTournament,
    startTournament,
    processMatchResult,
    processTournamentAction,
    getTournamentStatus
  } = useTournamentEngine();

  // 初始化賽制
  const handleStart = () => {
    initializeTournament('streak', players, options);
    startTournament();
  };

  // 處理比賽結果
  const handleWinner = (winnerName) => {
    processMatchResult(winnerName);
  };

  // 處理特殊動作（休息、撤銷等）
  const handleAction = (actionType) => {
    processTournamentAction(actionType);
  };

  return (
    <div>
      <TournamentSelector 
        players={players}
        onTournamentSelect={handleTournamentSelect}
      />
      {/* 遊戲介面 */}
    </div>
  );
}
```

### 新增自訂賽制

```javascript
import { BaseTournamentEngine } from './gameEngines/BaseTournamentEngine';

class CustomTournamentEngine extends BaseTournamentEngine {
  generateNextMatch() {
    // 實現對戰邏輯
  }

  processMatchResult(winnerName, matchData) {
    // 實現結果處理
  }

  isTournamentFinished() {
    // 實現結束條件
  }

  static getTournamentInfo() {
    return {
      id: 'custom',
      name: '自訂賽制',
      description: '...',
      // ...
    };
  }
}

// 註冊新賽制
TournamentEngineManager.registerTournament('custom', CustomTournamentEngine);
```

## 遷移指南

### 從舊系統遷移

1. **狀態管理**：
   ```javascript
   // 舊方式
   const { declareWinnerByName, takeRest } = useGame();
   
   // 新方式  
   const { processMatchResult, processTournamentAction } = useTournamentEngine();
   processMatchResult(winnerName);
   processTournamentAction('takeRest');
   ```

2. **賽制選擇**：
   ```javascript
   // 新增賽制選擇步驟
   <TournamentSelector 
     players={players}
     onTournamentSelect={setSelectedTournament}
   />
   ```

3. **狀態同步**：
   ```javascript
   // 自動處理樂觀鎖定和衝突解決
   // 無需手動管理版本號和重試
   ```

### 相容性

- ✅ 保持原有的連勝賽制功能
- ✅ 相同的 UI 操作方式  
- ✅ 相同的資料結構
- ✅ 向後相容的 API

## 效能提升

### 衝突解決
- **之前**：多用戶同時操作可能導致資料不一致
- **現在**：樂觀鎖定機制，自動重試和衝突解決

### 記憶體使用
- **之前**：所有邏輯在前端，每個用戶都載入完整邏輯
- **現在**：模組化載入，只載入所需的賽制

### 響應性能
- **之前**：複雜邏輯可能導致 UI 卡頓
- **現在**：非同步處理，更好的使用者體驗

## 測試

### 運行演示
```bash
# 啟動開發服務器
npm start

# 訪問演示頁面
# 導入 TournamentDemo 組件到你的路由中
```

### 單元測試
```bash
# 運行測試
npm test

# 測試覆蓋率
npm run test:coverage
```

## 未來規劃

### Phase 1 (v2.1.0) - UI 優化
- [ ] 對戰表視覺化
- [ ] 動畫效果
- [ ] 響應式設計改善

### Phase 2 (v2.2.0) - 賽制擴展  
- [ ] 瑞士制賽制
- [ ] 小組賽 + 淘汰賽
- [ ] 自訂賽制編輯器

### Phase 3 (v3.0.0) - 雲端整合
- [ ] Firebase Cloud Functions 後端
- [ ] 即時多人同步
- [ ] 大規模比賽支援

## 故障排除

### 常見問題

1. **賽制不相容**
   ```
   錯誤：At least 4 players required
   解決：檢查選手數量是否符合賽制要求
   ```

2. **動作不可用**  
   ```
   錯誤：Action not available in current state
   解決：檢查當前賽制階段和可用動作
   ```

3. **狀態同步失敗**
   ```
   錯誤：Version conflict
   解決：系統會自動重試，如持續失敗請重新載入
   ```

## 貢獻指南

1. Fork 專案
2. 創建功能分支 (`git checkout -b feature/new-tournament`)
3. 提交變更 (`git commit -am 'Add new tournament type'`)
4. 推送分支 (`git push origin feature/new-tournament`)  
5. 創建 Pull Request

## 授權

MIT License - 詳見 LICENSE 文件

---

**v2.0.0 主要變更**
- ✨ 新增淘汰賽制和循環賽制
- 🏗️ 完全重構的模組化架構
- 🔒 樂觀鎖定機制解決衝突問題
- 🎨 全新的賽制選擇介面
- 📚 完整的文檔和演示

**升級建議**：強烈建議升級到 v2.0.0 以獲得更好的多用戶體驗和更多賽制選擇。