# 🔧 歷史記錄故障排除指南

如果你在查看歷史記錄時遇到問題，請按照以下步驟排除故障：

## 🔍 問題診斷

### 1. Firebase 連接狀態檢查
- 打開瀏覽器開發者工具 (F12)
- 查看 Console 標籤頁，尋找 Firebase 相關的錯誤訊息
- 查看是否有以下類型的錯誤：
  - `permission-denied`: 權限問題
  - `unavailable`: Firebase 服務不可用
  - `failed-precondition`: 索引未建立

### 2. 網路連接檢查
- 確認網路連接正常
- 嘗試重新整理頁面
- 檢查是否有防火牆阻擋 Firebase 連接

## 🛠️ 解決方案

### Firebase 安全規則設定

1. **登入 Firebase 控制台**
   - 訪問 [Firebase Console](https://console.firebase.google.com/)
   - 選擇你的專案 `squash-72502`

2. **更新 Firestore 安全規則**
   - 在左側選單中選擇 "Firestore Database"
   - 點擊 "規則" 標籤
   - 將以下規則複製並貼上：

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // 允許讀取房間資訊
    match /rooms/{roomId} {
      allow read: if true;
      allow create, update: if true;
      allow delete: if false; // 保護歷史資料
    }
    
    // 允許讀取遊戲資訊
    match /games/{gameId} {
      allow read, write: if true;
    }
    
    // 允許讀取其他集合
    match /players/{playerId} {
      allow read, write: if true;
    }
    
    match /matches/{matchId} {
      allow read, write: if true;
    }
  }
}
```

3. **發布規則**
   - 點擊 "發布" 按鈕
   - 等待規則生效（通常需要幾分鐘）

### 建立 Firestore 索引

如果出現索引相關錯誤，需要建立以下索引：

1. **在 Firebase 控制台中**：
   - 進入 "Firestore Database" > "索引"
   - 建立複合索引：
     - 集合：`rooms`
     - 欄位1：`status` (升序)
     - 欄位2：`lastActivity` (降序)

2. **或者讓系統自動建立**：
   - 當你第一次查看歷史記錄時
   - Firebase 會在控制台中顯示建立索引的連結
   - 點擊連結會自動建立所需的索引

### 測試步驟

1. **創建測試資料**：
   - 開始一場新的多人比賽
   - 進行幾場對戰
   - 結束比賽
   - 這會在 Firebase 中創建真實的歷史記錄

2. **驗證資料**：
   - 在 Firebase 控制台中檢查 `rooms` 集合
   - 確認有 `status: 'completed'` 的記錄
   - 檢查記錄是否包含 `finalResults` 資料

3. **重試歷史記錄**：
   - 返回應用程式
   - 點擊 "查看歷史記錄"
   - 應該能看到真實的比賽記錄

## 🚨 常見錯誤和解決方法

### 錯誤：`FirebaseError: Missing or insufficient permissions`
**解決方法**：
- 按照上述步驟更新 Firestore 安全規則
- 確保規則中包含 `allow read: if true;`

### 錯誤：`FirebaseError: The query requires an index`
**解決方法**：
- 複製錯誤訊息中的索引建立連結
- 點擊連結在 Firebase 控制台中建立索引
- 等待索引建立完成（可能需要幾分鐘）

### 錯誤：`FirebaseError: Firestore has not been initialized`
**解決方法**：
- 檢查 `src/config/firebase.js` 中的配置是否正確
- 確認 Firebase 專案 ID 是 `squash-72502`
- 重新整理頁面

### 連接狀態顯示 "❌ 連接失敗"
**解決方法**：
1. 檢查網路連接
2. 確認 Firebase 服務狀態
3. 清除瀏覽器快取並重新載入
4. 檢查瀏覽器控制台的詳細錯誤訊息

## 📞 支援資訊

如果問題仍然存在：

1. **檢查 Firebase 專案設定**：
   - 專案 ID: `squash-72502`
   - 區域: asia-east1 (推薦)

2. **聯繫資訊**：
   - GitHub Issues: [sgame-tournament/issues](https://github.com/yanchen184/sgame-tournament/issues)
   - 提供完整的錯誤訊息和瀏覽器控制台截圖

3. **debug 資訊收集**：
   ```javascript
   // 在瀏覽器控制台中執行
   console.log('Firebase Config:', window.firebase?.apps?.[0]?.options);
   console.log('Connection Status:', navigator.onLine);
   ```

## ✅ 成功指標

歷史記錄功能正常運作時，你應該看到：

- ✅ Firebase 已連接（綠色火焰圖示）
- ✅ 連接狀態顯示為 "✅ Firebase 已連接"
- ✅ 歷史記錄頁面顯示實際的比賽資料
- ✅ 能夠點擊比賽卡片查看詳細資訊
- ✅ 統計資料正確計算並顯示