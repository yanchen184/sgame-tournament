# 🥊 四人單挑循環賽系統

一個基於React的動態比賽管理系統，支援即時比賽記錄、積分統計和Firebase數據同步。

## ✨ 功能特色

- 🎮 **即時比賽系統** - 動態對戰顯示和結果記錄
- 📊 **智能積分榜** - 自動排序和統計分析
- ⏱️ **計時管理** - 60分鐘比賽計時，剩餘時間提醒
- 🔥 **連勝機制** - 連勝4場可選擇休息獲得額外積分
- 📱 **響應式設計** - 支援桌面和移動設備
- 🔄 **即時同步** - Firebase實時數據庫同步
- 🎨 **動畫效果** - 豐富的視覺回饋和轉場動畫

## 🏆 比賽規則

1. **比賽機制**: 一對一單挑，勝者留場，輸者下場排隊
2. **得分規則**: 每贏一場得1分，積分越高排名越前
3. **連勝獎勵**: 連勝4場可選擇休息並額外得1分
4. **比賽時間**: 60分鐘限時，最終按總分排名
5. **公平原則**: 最後一場必須包含原始順序第四位選手

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

---

**享受比賽的樂趣！** 🥊🏆