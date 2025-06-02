# 🛠️ GitHub Pages 手動設置指南

## ❌ 當前問題
GitHub Actions無法自動創建Pages站點，需要手動啟用。

## ✅ 解決方案（必須手動執行）

### 步驟1: 手動啟用GitHub Pages

1. **打開倉庫設置**
   - 前往：https://github.com/yanchen184/sgame-tournament
   - 點擊頂部的 "Settings" 選項卡

2. **找到Pages設置**
   - 在左側菜單中滾動到 "Code and automation" 部分
   - 點擊 "Pages"

3. **配置Pages源**
   - 在 "Source" 下拉菜單中選擇 **"GitHub Actions"**
   - 確保顯示 "GitHub Actions" 被選中
   - 如果看到 "Deploy from a branch"，請切換到 "GitHub Actions"

4. **保存設置**
   - 選擇後會自動保存
   - 頁面會顯示 "GitHub Pages source saved"

### 步驟2: 運行部署

設置完成後，有兩種方式觸發部署：

**方式A: 自動觸發（推薦）**
- 上述設置完成後，GitHub Actions會自動運行
- 前往 https://github.com/yanchen184/sgame-tournament/actions 查看進度

**方式B: 手動觸發**
- 前往 https://github.com/yanchen184/sgame-tournament/actions
- 點擊 "Build and Deploy to GitHub Pages" 工作流程
- 點擊 "Run workflow" 按鈕
- 再次點擊綠色的 "Run workflow" 按鈕

### 步驟3: 驗證部署

1. **檢查Actions狀態**
   - 工作流程應該顯示綠色勾號 ✅
   - 如果顯示紅色 ❌，點擊查看錯誤詳情

2. **訪問網站**
   - 部署成功後，前往：https://yanchen184.github.io/sgame-tournament
   - 您應該看到四人單挑循環賽系統

## 🔍 故障排除

### 如果Pages設置中沒有"GitHub Actions"選項

這通常表示：
1. 您需要是倉庫的所有者或管理員
2. 倉庫可能是私人的（Pages需要公開倉庫或付費帳戶）

**解決方法：**
- 確認您是 `yanchen184/sgame-tournament` 的所有者
- 確認倉庫是公開的

### 如果Actions運行失敗

1. **檢查錯誤日誌**
   - 點擊失敗的工作流程
   - 展開失敗的步驟查看詳細錯誤

2. **常見問題：**
   - `HttpError: Resource not accessible by integration` = 需要手動設置Pages
   - `Build failed` = 檢查代碼構建錯誤
   - `Deploy failed` = 檢查是否正確設置了Pages源

## 📋 成功標準

當一切設置正確時，您將看到：

✅ **在GitHub Pages設置中：**
- Source: GitHub Actions ✅
- 顯示 "Your site is live at https://yanchen184.github.io/sgame-tournament" ✅

✅ **在GitHub Actions中：**
- "Build and Deploy to GitHub Pages" 工作流程成功運行 ✅
- 綠色勾號表示部署成功 ✅

✅ **在網站上：**
- https://yanchen184.github.io/sgame-tournament 可以正常訪問 ✅
- 顯示版本號 v1.0.1 ✅
- 四人單挑循環賽系統功能正常 ✅

## 🆘 如果仍有問題

如果按照上述步驟仍無法成功，可能的原因：

1. **權限問題**
   - 確認您是倉庫所有者
   - 檢查倉庫是否為公開

2. **GitHub臨時問題**
   - 等待5-10分鐘後重試
   - GitHub服務偶爾會有延遲

3. **瀏覽器緩存**
   - 清除瀏覽器緩存
   - 使用無痕模式訪問

---

**🎯 關鍵提醒：必須先手動設置Pages為"GitHub Actions"，然後Actions才能正常部署！**