# 🚀 部署說明

## GitHub Pages 設置步驟

### 1. 啟用 GitHub Pages
1. 進入您的 GitHub 倉庫：https://github.com/yanchen184/sgame-tournament
2. 點擊 "Settings" 選項卡
3. 在左側菜單中點擊 "Pages"
4. 在 "Source" 部分選擇 "GitHub Actions"
5. 保存設置

### 2. 設置 Firebase 環境變量（可選）
如果您想要啟用 Firebase 功能，請設置以下 Secrets：

1. 進入 Settings → Secrets and variables → Actions
2. 點擊 "New repository secret" 添加以下變量：

```
REACT_APP_FIREBASE_API_KEY=你的_API_密鑰
REACT_APP_FIREBASE_AUTH_DOMAIN=你的_項目ID.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=你的_項目ID
REACT_APP_FIREBASE_STORAGE_BUCKET=你的_項目ID.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=你的_發送者ID
REACT_APP_FIREBASE_APP_ID=你的_應用ID
REACT_APP_FIREBASE_MEASUREMENT_ID=你的_測量ID
```

### 3. 觸發部署
- 推送代碼到 main 分支會自動觸發部署
- 也可以在 Actions 選項卡手動觸發 "Deploy to GitHub Pages" 工作流程

### 4. 訪問您的應用
部署完成後，您的應用將在以下地址可用：
**https://yanchen184.github.io/sgame-tournament**

---

## 注意事項

- 首次部署可能需要幾分鐘時間
- 如果沒有設置 Firebase Secrets，應用會使用演示配置，功能完全正常
- Firebase 功能是可選的，即使不設置也不會影響遊戲體驗