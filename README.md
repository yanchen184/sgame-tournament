# 🥊 動態競技系統

一個基於React的動態比賽管理系統，支援3-8人可調整參賽人數、即時比賽記錄、積分統計和Firebase數據同步。

## ✨ 功能特色

- 🎮 **可調整人數系統** - 支援3-8人動態參賽人數設定
- 🆕 **固定順序賽制** - 4人專用固定對戰順序：AB → CD → CA → BD → BC → AD
- 🔥 **智能連勝機制** - 連勝規則隨人數自動調整（人數-1場可選擇休息）
- 📊 **智能積分榜** - 自動排序和統計分析
- ↶ **無限撤銷** - 可無限撤銷操作，支援連續撤銷，無時間限制
- 😴 **智能休息系統** - 休息選手自動重新排隊，確保比賽順暢進行
- 📱 **響應式設計** - 支援桌面和移動設備
- 🔄 **即時同步** - Firebase實時數據庫同步（可選）
- 🎨 **動畫效果** - 豐富的視覺回饋和轉場動畫
- 📊 **持久化統計** - 比賽結束統計不會自動消失
- 🌐 **多機器支援** - 支援多台設備同時參與同一場比賽

## 🏆 比賽規則

### 動態競技賽制 (3-8人)

1. **比賽機制**: 3-8人循環一對一單挑，勝者留場，輸者下場排隊
2. **得分規則**: 每贏一場得1分，積分越高排名越前
3. **連勝獎勵**: 連勝每(人數-1)場可選擇休息並額外得1分
   - 3人比賽：連勝2場（2、4、6...）
   - 4人比賽：連勝3場（3、6、9...）
   - 5人比賽：連勝4場（4、8、12...）
   - 以此類推...
4. **休息機制**: 休息選手會重新排隊，當無其他選手時自動返場
5. **撤銷功能**: 可無限撤銷操作，支援連續撤銷，無時間限制
6. **比賽結束**: 手動結束比賽，最終統計不會自動消失

### 🆕 固定順序賽制 (4人專用)

1. **固定對戰順序**: AB → CD → CA → BD → BC → AD (共6場)
2. **得分規則**: 每贏一場得1分，積分越高排名越前
3. **無需休息**: 簡化流程，專注於對戰，無連勝休息機制
4. **資料庫同步**: 每場比賽結果實時同步到資料庫
5. **多機器支援**: 支援多台設備同時參與同一場比賽
6. **自動標籤**: 玩家自動標記為A、B、C、D

## 🚀 在線演示

**Live Demo**: [https://yanchen184.github.io/sgame-tournament](https://yanchen184.github.io/sgame-tournament)

## 📋 系統要求

- Node.js 16.0+
- npm 或 yarn
- 現代瀏覽器 (Chrome, Firefox, Safari, Edge)

## ⚡ 快速開始

### 1. 克隆項目
```bash
git clone https://github.com/yanchen184/sgame-tournament.git
cd sgame-tournament
```

### 2. 安裝依賴
```bash
npm install
```

### 3. 設置環境變量
```bash
cp .env.example .env.local
```

編輯 `.env.local` 文件，填入你的Firebase配置:
```env
REACT_APP_FIREBASE_API_KEY=your_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your_domain
REACT_APP_FIREBASE_PROJECT_ID=your_project_id
# ... 其他配置
```

### 4. 啟動開發服務器
```bash
npm start
```

應用將在 `http://localhost:3000` 運行

## 🔧 項目結構

```
src/
├── components/              # React組件
│   ├── GameArena.js        # 競技場組件
│   ├── PlayerQueue.js      # 排隊組件
│   ├── Scoreboard.js       # 積分榜組件
│   ├── GameControls.js     # 控制面板組件
│   ├── StatusMessage.js    # 狀態消息組件
│   ├── GameRules.js        # 規則說明組件（支援動態人數）
│   ├── GameHistory.js      # 比賽歷史組件
│   ├── PlayerSetup.js      # 選手設置組件（支援人數選擇）
│   └── FixedSequenceTournament.js  # 固定順序賽制組件
├── config/
│   └── firebase.js         # Firebase配置
├── services/
│   ├── gameService.js      # Firebase服務
│   └── fixedSequenceDatabaseService.js  # 固定順序資料庫服務
├── hooks/
│   ├── useFirebaseGame.js  # Firebase Hook
│   └── useFixedSequenceTournament.js    # 固定順序比賽 Hook
├── gameEngines/            # 比賽引擎
│   ├── FixedSequenceTournamentEngine.js # 固定順序比賽引擎
│   └── TournamentEngineManager.js       # 比賽引擎管理器
├── App.js                  # 主應用組件（支援動態人數）
└── index.js               # 應用入口
```

## 🔥 Firebase 設置

1. 在 [Firebase Console](https://console.firebase.google.com/) 創建新項目
2. 啟用 Firestore Database
3. 設置安全規則允許讀寫操作
4. 複製項目配置到環境變量

### Firestore 安全規則範例:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

## 🚀 部署

### 自動部署 (GitHub Actions)
項目配置了自動化部署流程，推送到main分支時自動部署到GitHub Pages。

需要設置以下GitHub Secrets:
- `REACT_APP_FIREBASE_API_KEY`
- `REACT_APP_FIREBASE_AUTH_DOMAIN`
- `REACT_APP_FIREBASE_PROJECT_ID`
- `REACT_APP_FIREBASE_STORAGE_BUCKET`
- `REACT_APP_FIREBASE_MESSAGING_SENDER_ID`
- `REACT_APP_FIREBASE_APP_ID`
- `REACT_APP_FIREBASE_MEASUREMENT_ID`

### 手動部署
```bash
npm run build
npm install -g serve
serve -s build
```

## 🎮 使用說明

### 動態競技賽制 (3-8人)
1. **選擇人數**: 在首頁選擇3-8人參賽
2. **設置選手**: 輸入選手名稱（或使用隨機名稱生成功能）
3. **自動開始**: 設置完成後自動開始比賽
4. **記錄結果**: 使用「左方勝利」或「右方勝利」按鈕記錄比賽結果
5. **動態休息**: 當選手連勝達到要求場數時，可選擇休息獲得額外積分
6. **無限撤銷**: 可無限撤銷操作，支援連續撤銷，隨時糾正錯誤
7. **查看排名**: 積分榜會即時更新顯示當前排名

### 🆕 固定順序賽制 (4人專用)
1. **選擇賽制**: 在賽制選擇頁面選擇「固定順序賽制」
2. **設置4位選手**: 輸入4位選手名稱
3. **自動標籤**: 系統自動為選手分配A、B、C、D標籤
4. **固定順序對戰**: 按照 AB → CD → CA → BD → BC → AD 順序進行
5. **記錄結果**: 選擇獲勝者並確認結果
6. **資料庫同步**: 每場比賽結果自動同步到資料庫
7. **多機器參與**: 其他設備可通過Session ID加入同一場比賽

詳細使用說明請參考: [固定順序賽制文檔](FIXED_SEQUENCE_TOURNAMENT.md)

## 🆕 最新功能 (v2.1.0)

### 🏆 全新固定順序賽制
- ✅ **4人專用賽制**: 專為4人比賽設計的固定對戰順序
- ✅ **固定對戰順序**: AB → CD → CA → BD → BC → AD (共6場)
- ✅ **資料庫實時同步**: 每場比賽結果即時同步到Firebase
- ✅ **多機器支援**: 支援多台設備同時參與同一場比賽
- ✅ **樂觀鎖定**: 防止多機器操作時的競態條件
- ✅ **自動標籤系統**: 玩家自動標記為A、B、C、D

### 🎯 技術架構升級
- ✅ **模組化比賽引擎**: 新增FixedSequenceTournamentEngine
- ✅ **專用資料庫服務**: FixedSequenceDatabaseService處理資料同步
- ✅ **React Hook整合**: useFixedSequenceTournament提供完整功能
- ✅ **完整UI組件**: 專用FixedSequenceTournament組件
- ✅ **即時狀態同步**: Firebase onSnapshot實現即時更新

### 🔧 系統增強
- ✅ **版本號更新**: 升級到v2.1.0
- ✅ **完整文檔**: 新增固定順序賽制使用文檔
- ✅ **錯誤處理**: 完善的錯誤處理和狀態管理
- ✅ **響應式設計**: 移動端友好的UI設計

## 🔄 版本更新歷史

### v2.1.0 (最新版本)
- 🏆 **全新固定順序賽制**: 4人專用，固定對戰順序
- 📡 **資料庫同步**: 每場比賽結果實時同步
- 🌐 **多機器支援**: 支援多台設備同時參與
- 🔧 **架構升級**: 模組化比賽引擎和服務

### v1.3.0
- 🎯 **動態人數支援**: 支援3-8人可調整參賽
- 🔥 **智能連勝機制**: 連勝要求隨人數自動調整
- 🏷️ **系統升級**: 更名為「動態競技系統」
- 📋 **規則自動化**: 規則說明根據人數動態更新

### v1.2.1
- 🔧 修復休息系統輪換邏輯
- 🎯 支援3、6、9場等多倍數休息機制
- ↶ 實現無限撤銷功能
- 📊 比賽結束統計持久化顯示

### v1.0.8
- ✅ 基礎比賽系統
- ✅ 積分統計功能  
- ✅ 連勝3場觸發休息機制
- ✅ 響應式設計
- ✅ Firebase整合（可選）

### 未來規劃
- 🔜 比賽錄影回放功能
- 🔜 選手統計分析
- 🔜 自定義比賽規則
- 🔜 語音提醒功能
- 🔜 錦標賽模式
- 🔜 積分排行榜
- 🔜 比賽數據導出

## 🤝 貢獻指南

1. Fork 此倉庫
2. 創建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 開啟 Pull Request

## 📄 許可證

此項目使用 MIT 許可證 - 查看 [LICENSE](LICENSE) 文件了解詳情

## 📞 支持與反饋

- 🐛 **問題報告**: [GitHub Issues](https://github.com/yanchen184/sgame-tournament/issues)
- 💡 **功能建議**: [GitHub Discussions](https://github.com/yanchen184/sgame-tournament/discussions)
- 📧 **聯繫開發者**: yanchen184@example.com

## 🙏 致謝

感謝所有為此項目做出貢獻的開發者和測試者！

---

**享受動態競技的樂趣！** 🥊🏆
