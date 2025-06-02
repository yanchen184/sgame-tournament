# 🔥 Firebase 設置與歷史記錄指南

## ✨ 新功能概覽

**v1.0.2** 現在包含完整的Firebase整合和歷史記錄功能：

- 🔥 **實時數據同步** - 遊戲狀態自動保存到雲端
- 📚 **比賽歷史記錄** - 完整的對戰記錄追蹤
- 💾 **自動保存** - 選手數據、比分、連勝記錄
- 🌐 **多設備同步** - 可在不同設備間共享遊戲
- 📊 **詳細統計** - 每場比賽的時間、得分、連勝資訊

## 🚀 快速體驗

即使不設置Firebase，系統也能完整運行：
- ✅ 本地歷史記錄功能正常
- ✅ 所有遊戲功能可用
- ✅ 點擊「📚 查看歷史」查看比賽記錄

## 🔥 啟用Firebase完整功能

### 步驟1: 創建Firebase項目

1. **前往Firebase Console**
   - 訪問：https://console.firebase.google.com/
   - 使用Google帳號登入

2. **創建新項目**
   - 點擊「添加項目」
   - 輸入項目名稱：`sgame-tournament`
   - 可選擇啟用Google Analytics

3. **啟用Firestore Database**
   - 在左側菜單選擇「Firestore Database」
   - 點擊「創建數據庫」
   - 選擇「測試模式」（允許讀寫）
   - 選擇地區（建議選擇最近的地區）

### 步驟2: 獲取Firebase配置

1. **項目設置**
   - 點擊齒輪圖標 → 「項目設置」
   - 滾動到「您的應用」部分
   - 點擊「添加應用」→ 選擇Web（</>）

2. **註冊應用**
   - 應用暱稱：`SGame Tournament`
   - 選擇「同時設置Firebase Hosting」（可選）
   - 點擊「註冊應用」

3. **複製配置**
   - 複製firebaseConfig對象中的所有值

### 步驟3: 設置環境變量

如果是**本地開發**：
```bash
# 創建 .env.local 文件
cp .env.example .env.local

# 編輯 .env.local，填入您的Firebase配置
REACT_APP_FIREBASE_API_KEY=你的_API_密鑰
REACT_APP_FIREBASE_AUTH_DOMAIN=你的_項目ID.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=你的_項目ID
REACT_APP_FIREBASE_STORAGE_BUCKET=你的_項目ID.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=你的_發送者ID
REACT_APP_FIREBASE_APP_ID=你的_應用ID
REACT_APP_FIREBASE_MEASUREMENT_ID=你的_測量ID
```

如果是**GitHub Pages部署**：
1. 前往：https://github.com/yanchen184/sgame-tournament/settings/secrets/actions
2. 添加以下Repository secrets：
   - `REACT_APP_FIREBASE_API_KEY`
   - `REACT_APP_FIREBASE_AUTH_DOMAIN`
   - `REACT_APP_FIREBASE_PROJECT_ID`
   - `REACT_APP_FIREBASE_STORAGE_BUCKET`
   - `REACT_APP_FIREBASE_MESSAGING_SENDER_ID`
   - `REACT_APP_FIREBASE_APP_ID`
   - `REACT_APP_FIREBASE_MEASUREMENT_ID`

### 步驟4: 設置Firestore安全規則

1. **前往Firestore Database**
   - Firebase Console → Firestore Database → 規則

2. **更新規則**（開發環境用）：
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

3. **發布規則**

## 📊 歷史記錄功能

### 查看歷史記錄
- 點擊「📚 查看歷史」按鈕
- 查看完整的比賽時間線
- 不同類型的記錄有不同圖標：
  - ⚔️ 一般對戰
  - 😴 休息記錄  
  - 🏁 最終對戰

### 記錄內容包含
- 📅 比賽時間（精確到秒）
- 🏆 勝負選手
- 📊 當時得分
- 🔥 連勝次數
- 📝 特殊事件（休息、繼續比賽等）

## 🔧 Firebase連接狀態

系統會顯示連接狀態：
- 🔥 **Firebase已連接** - 綠色，數據實時同步
- 📡 **離線模式** - 灰色，僅本地功能
- 💾 **保存中** - 顯示數據同步進度

## 📱 使用建議

1. **多設備協作**
   - 可在不同設備打開相同遊戲ID
   - 實時同步比賽進度
   - 適合裁判和觀眾同時觀看

2. **歷史分析**
   - 查看選手表現趨勢
   - 分析連勝模式
   - 比賽時間分布

3. **數據備份**
   - Firebase自動備份所有數據
   - 不會因瀏覽器關閉而丟失記錄
   - 可以隨時恢復歷史比賽

## ⚠️ 注意事項

- **安全規則**：生產環境請設置更嚴格的安全規則
- **費用**：Firebase免費額度足夠一般使用
- **隱私**：比賽數據會上傳到Google服務器

## 🆘 故障排除

**如果看到「📡 離線模式」**：
1. 檢查Firebase配置是否正確
2. 確認網絡連接
3. 檢查瀏覽器控制台錯誤

**如果無法保存歷史**：
1. 確認Firestore規則允許寫入
2. 檢查Firebase項目ID是否正確

---

**🎮 享受增強版的比賽體驗！Firebase讓您的比賽數據永不丟失！** 🏆