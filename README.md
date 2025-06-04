# 🥊 四人單挑循環賽系統

一個基於React的動態比賽管理系統，支援即時比賽記錄、積分統計和Firebase數據同步。

## ✨ 功能特色

- 🎮 **即時比賽系統** - 動態對戰顯示和結果記錄
- 📊 **智能積分榜** - 自動排序和統計分析
- 🔥 **連勝機制** - 連勝每3場（3、6、9...）可選擇休息獲得額外積分
- ↶ **無限撤銷** - 可無限撤銷操作，支援連續撤銷，無時間限制
- 😴 **智能休息系統** - 休息選手自動重新排隊，確保比賽順暢進行
- 📱 **響應式設計** - 支援桌面和移動設備
- 🔄 **即時同步** - Firebase實時數據庫同步（可選）
- 🎨 **動畫效果** - 豐富的視覺回饋和轉場動畫
- 📊 **持久化統計** - 比賽結束統計不會自動消失

## 🏆 比賽規則

1. **比賽機制**: 一對一單挑，勝者留場，輸者下場排隊
2. **得分規則**: 每贏一場得1分，積分越高排名越前
3. **連勝獎勵**: 連勝每3場（3、6、9...）可選擇休息並額外得1分
4. **休息機制**: 休息選手會重新排隊，當無其他選手時自動返場
5. **撤銷功能**: 可無限撤銷操作，支援連續撤銷，無時間限制
6. **比賽結束**: 手動結束比賽，最終統計不會自動消失

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
├── components/          # React組件
│   ├── GameArena.js    # 競技場組件
│   ├── PlayerQueue.js  # 排隊組件
│   ├── Scoreboard.js   # 積分榜組件
│   ├── GameControls.js # 控制面板組件
│   ├── StatusMessage.js # 狀態消息組件
│   ├── GameRules.js    # 規則說明組件
│   └── GameHistory.js  # 比賽歷史組件
├── config/
│   └── firebase.js     # Firebase配置
├── services/
│   └── gameService.js  # Firebase服務
├── hooks/
│   └── useFirebaseGame.js # Firebase Hook
├── App.js              # 主應用組件
└── index.js            # 應用入口
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

1. **設置選手**: 輸入四位選手名稱（或使用預設的隨機名稱）
2. **自動開始**: 設置完成後自動開始比賽
3. **記錄結果**: 使用「左方勝利」或「右方勝利」按鈕記錄比賽結果
4. **休息選擇**: 當選手連勝3、6、9場等3的倍數時，可選擇休息獲得額外積分
5. **無限撤銷**: 可無限撤銷操作，支援連續撤銷，隨時糾正錯誤
6. **查看排名**: 積分榜會即時更新顯示當前排名
7. **持久統計**: 比賽結束後統計訊息不會自動消失，需手動關閉
8. **重置比賽**: 隨時可以重置比賽重新開始

## 🆕 最新功能 (v1.1.0)

### 🔧 核心功能改進
- ✅ **修復休息系統**: 解決休息後無法重新輪上場的問題
- ✅ **多倍數休息機制**: 連勝3、6、9場等都可選擇休息+1分
- ✅ **無限撤銷功能**: 支援連續撤銷，無時間和次數限制
- ✅ **持久化統計**: 比賽結束統計不會自動消失

### 🎯 用戶體驗優化
- ✅ **智能選手輪換**: 確保所有選手都有公平比賽機會
- ✅ **即時狀態回饋**: 更清晰的操作提示和狀態顯示
- ✅ **錯誤容錯機制**: 防止連續按錯影響比賽進行

## 🛠️ 開發指南

### 添加新功能
1. 在 `src/components/` 創建新組件
2. 在主應用中引入並使用
3. 添加相應的CSS樣式
4. 更新測試文件

### 自定義樣式
- 修改各組件的CSS文件
- 調整 `src/index.css` 中的全局樣式
- 使用CSS變量保持設計一致性

## 📱 移動端優化

- 響應式網格布局
- 觸摸友好的按鈕設計
- 優化的字體大小和間距
- 流暢的動畫效果

## 🔄 版本更新歷史

### v1.1.0 (最新版本)
- 🔧 修復休息系統輪換邏輯
- 🎯 支援3、6、9場等多倍數休息機制
- ↶ 實現無限撤銷功能
- 📊 比賽結束統計持久化顯示
- 🎮 改進用戶體驗和操作流暢性

### v1.0.8
- ✅ 基礎比賽系統
- ✅ 積分統計功能  
- ✅ 連勝3場觸發休息機制
- ✅ 撤銷功能（無時間限制）
- ✅ 響應式設計
- ✅ Firebase整合（可選）
- ✅ 即時數據同步
- ✅ 自動開始比賽
- ✅ 預設隨機選手名稱
- ✅ GitHub Actions自動部署

### 未來規劃
- 🔜 多房間支持
- 🔜 歷史記錄查詢
- 🔜 選手統計分析
- 🔜 自定義比賽規則
- 🔜 語音提醒功能
- 🔜 比賽回放功能

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

**享受比賽的樂趣！** 🥊🏆