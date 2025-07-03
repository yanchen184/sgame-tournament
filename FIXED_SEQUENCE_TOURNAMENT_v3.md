# 固定順序賽制系統 v3.0.0

## 概述
這是一個基於 React 的固定順序賽制競技系統，專為 4 位選手設計。系統支援固定對戰順序，每場比賽結果都會保存到資料庫中進行同步。

## 主要功能

### 🎯 固定對戰順序
- **對戰順序**: AB → CD → CA → BD → BC → AD
- **總比賽場次**: 6 場
- **參賽人數**: 固定 4 人 (選手 A, B, C, D)

### 📊 積分系統
- **勝利積分**: 每場勝利獲得 1 分
- **敗北積分**: 0 分
- **排名規則**: 按積分排序，積分相同時按敗場數排序

### 💾 資料庫同步
- **即時同步**: 每場比賽結果自動保存到 Firebase
- **多機器支援**: 支援多台裝置同時觀看比賽進度
- **歷史記錄**: 完整的比賽歷史記錄

## 系統架構

### 核心組件
- **FixedSequenceTournamentEngine**: 固定順序賽制引擎
- **FixedSequenceArena**: 比賽場地組件
- **FixedSequenceDisplay**: 對戰順序顯示組件
- **FixedSequenceDatabaseService**: 資料庫服務

### 對戰流程
1. **AB 對戰**: 選手 A 對戰選手 B
2. **CD 對戰**: 選手 C 對戰選手 D
3. **CA 對戰**: 選手 C 對戰選手 A
4. **BD 對戰**: 選手 B 對戰選手 D
5. **BC 對戰**: 選手 B 對戰選手 C
6. **AD 對戰**: 選手 A 對戰選手 D

## 使用方法

### 1. 設置選手
- 進入選手設置頁面
- 輸入 4 位選手的名稱 (A, B, C, D)
- 點擊「開始比賽」

### 2. 進行比賽
- 系統按固定順序安排對戰
- 點擊獲勝選手來記錄結果
- 系統自動進入下一場對戰

### 3. 查看結果
- 即時查看積分排名
- 查看對戰進度
- 查看比賽歷史

## 技術規格

### 前端技術
- **React 18.2.0**: 主要前端框架
- **React Hooks**: 狀態管理
- **CSS3**: 樣式設計
- **響應式設計**: 支援多種裝置

### 後端服務
- **Firebase Firestore**: 資料庫服務
- **即時同步**: 支援多裝置同步
- **離線支援**: 支援離線操作

### 資料結構
```javascript
// 比賽結果結構
{
  matchId: "FS1",
  matchNumber: 1,
  pattern: "AB",
  sequenceIndex: 0,
  fighter1: { id, name, label: "A" },
  fighter2: { id, name, label: "B" },
  winner: { id, name, label },
  loser: { id, name, label },
  winnerName: "選手姓名",
  loserName: "選手姓名",
  timestamp: Date,
  sessionId: "session_id"
}
```

## 重大更改 (v3.0.0)

### 移除的功能
- ❌ 連勝機制
- ❌ 休息機制
- ❌ 動態選手數量 (3-8人)
- ❌ 選手排隊系統

### 新增的功能
- ✅ 固定對戰順序 (AB → CD → CA → BD → BC → AD)
- ✅ 固定 4 人賽制
- ✅ 資料庫同步機制
- ✅ 對戰進度顯示
- ✅ 簡化的積分系統

### 修改的組件
- `GameContext`: 改用 FixedSequenceTournamentEngine
- `GameContainer`: 適應固定順序賽制
- `PlayerSetup`: 固定 4 人設置
- `GameControls`: 移除連勝相關提示

## 部署說明

### 開發環境
```bash
npm start
```

### 生產環境
```bash
npm run build
```

### GitHub Pages 部署
```bash
npm run deploy
```

## 版本歷史
- **v3.0.0**: 重大重構，改為固定順序賽制
- **v2.x.x**: 連勝競技系統
- **v1.x.x**: 基礎競技系統

## 授權
MIT License
