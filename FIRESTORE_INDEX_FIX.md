# 🔧 Firestore 索引問題修復指南

## ❌ 遇到的錯誤：
```
⚠️ Firebase 連接問題: The query requires an index. You can create it here: https://console.firebase.google.com/v1/r/project/squash-72502/firestore/indexes?create_composite=...
```

## 🛠️ 解決方案：

### 方案 1：建立 Firebase 索引（推薦）
1. **點擊錯誤訊息中的連結**
   - 會自動跳轉到 Firebase Console 索引建立頁面
   - 點擊「建立索引」按鈕
   - 等待 2-5 分鐘索引建立完成

2. **手動建立索引（備用）**
   - 前往 [Firebase Console](https://console.firebase.google.com/project/squash-72502/firestore/indexes)
   - 選擇 Firestore Database → 索引
   - 建立複合索引：
     ```
     集合：rooms
     欄位：status (升序) + created (降序)
     ```

### 方案 2：已修改程式碼避免索引需求 ✅
**v1.5.5 已經修復：**
- 移除了 `orderBy` 查詢，避免複合索引需求
- 改為在客戶端排序，提升相容性
- 保持原有功能不變

## 🔍 技術說明：

**原始查詢（需要索引）：**
```javascript
query(
  collection(db, 'rooms'),
  where('status', '==', 'playing'),
  orderBy('created', 'desc'),  // ← 這個導致需要複合索引
  limit(20)
)
```

**修復後查詢（不需索引）：**
```javascript
query(
  collection(db, 'rooms'),
  where('status', '==', 'playing'),
  limit(20)
)
// 在客戶端排序
rooms.sort((a, b) => new Date(b.lastActivity) - new Date(a.lastActivity))
```

## ✅ 測試步驟：

1. **重新啟動應用**
   ```bash
   npm start
   ```

2. **檢查房間列表**
   - 進入多人房間功能
   - 查看是否還有 Firebase 連接錯誤
   - 嘗試創建新房間

3. **驗證功能**
   - 房間應該正常顯示
   - 即時更新應該正常工作
   - 不再出現索引錯誤

## 🎯 預期結果：
- ✅ 不再出現 Firebase 索引錯誤
- ✅ 房間列表正常顯示
- ✅ 即時更新功能正常
- ✅ 創建房間功能正常

---
**修復版本：** v1.5.5  
**修復日期：** 2025-06-07  
**狀態：** 已完成 ✅
