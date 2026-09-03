# 貪食蛇 Snake Game

一個單頁式（single-page）貪食蛇遊戲，使用純 HTML / CSS / JavaScript 撰寫，不需要安裝任何套件或伺服器，直接在瀏覽器開啟即可遊玩。

## 如何啟動

有兩種方式：

1. **直接開啟檔案**
   在 Finder 中找到 `index.html`，直接雙擊用瀏覽器開啟即可。

2. **用終端機開啟**（macOS）
   ```bash
   open index.html
   ```

3. **（可選）用本地伺服器開啟**
   如果雙擊開啟時瀏覽器對本地檔案有安全限制，可以用簡單的本地伺服器：
   ```bash
   cd /Users/ke/Desktop/snake_game
   python3 -m http.server 8000
   ```
   然後在瀏覽器打開 `http://localhost:8000`。

   手機也可以連到同一個區域網路，用電腦的區域網路 IP（例如 `http://192.168.x.x:8000`）在手機瀏覽器開啟來測試。

## 遊戲玩法

**電腦（桌機）**
- **方向鍵（↑ ↓ ← →）或 W/A/S/D**：控制蛇移動方向
- **空白鍵**：開始遊戲 / 暫停 / 繼續

**手機 / 觸控裝置**
- **在畫面上滑動（swipe）**：往上下左右滑動即可轉向，這是手機上最直覺的操作方式
- **輕點（tap）畫面**：開始遊戲 / 暫停 / 繼續，等同電腦版的空白鍵
- 畫面下方也會顯示螢幕方向按鈕（D-Pad）作為備用操作方式
- 版面會自動偵測螢幕寬高與是否為觸控裝置，自動切換成適合手機的版面大小與提示文字，遊戲畫面（棋盤）也會依螢幕寬度自動縮放，不會超出螢幕或需要橫向捲動
- 滑動操作時畫面不會跟著捲動或縮放（已關閉手機瀏覽器的捲動/縮放手勢干擾）

**共通**
- 開始遊戲前需要先輸入名字（會記住在瀏覽器裡，下次自動帶入）
- 吃到紅色食物會增加分數，蛇身變長，並且速度會逐漸加快
- **可穿牆**：撞到邊界不會死，蛇會直接從對面邊界穿出（wrap around）
- 咬到自己的身體依然會遊戲結束，並把「名字＋分數」送到 Google 試算表（見下方設定）
- 遊戲結束時會立刻顯示這局分數排名第幾，以及排行榜前 5 名的「名字＋分數」（未設定 `SHEET_WEBAPP_URL` 或連線失敗時則不顯示排名/排行榜，但遊戲仍可正常玩）
- 蛇頭有眼睛會朝移動方向看，蛇尾則呈現尖角形狀，方便分辨頭尾（顏色維持一致）
- 最高分會記錄在瀏覽器的 `localStorage`，重新整理頁面後仍會保留

## 設定分數記錄到 Google Spreadsheet

遊戲結束時會把玩家輸入的名字與分數，透過 Google Apps Script 寫進一份 Google 試算表。設定步驟如下：

### 1. 建立 Google 試算表

1. 到 [Google Sheets](https://sheets.google.com) 新增一份空白試算表，取個名字（例如「Snake Leaderboard」）。
2. 之後不需要手動建立欄位，Apps Script 第一次執行時會自動建立一個 `Scores` 工作表，並加上 `Timestamp / Name / Score` 標題列。

### 2. 貼上 Apps Script 程式碼

1. 在剛剛的試算表裡，點選選單 **擴充功能 (Extensions) → Apps Script**。
2. 把預設的 `Code.gs` 內容全部刪除，貼上本專案 [`apps-script/Code.gs`](apps-script/Code.gs) 的內容。
3. 按上方的儲存（磁片圖示）。

### 3. 部署成 Web App

1. 右上角點 **部署 (Deploy) → New deployment**。
2. 齒輪圖示選擇類型（Select type）→ **Web app**。
3. 設定：
   - **Execute as**：Me（你自己的帳號）
   - **Who has access**：**Anyone**（一定要選 Anyone，這樣玩家不需要登入 Google 帳號就能送出分數）
4. 按 **Deploy**，第一次會要求你**授權 (Authorize access)**：選你的 Google 帳號 → 如果出現「Google 尚未驗證這個應用程式」的警告畫面，點 **進階 (Advanced)** → **前往 (專案名稱)（不安全）** → **允許**（這是正常的，因為這是你自己寫的私人腳本，不是第三方應用程式）。
5. 部署完成後會出現一組 **Web app URL**，長得像：
   ```
   https://script.google.com/macros/s/AKfycbxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx/exec
   ```
   複製這串網址。

   > 之後如果修改了 `Code.gs` 的內容，記得要 **New deployment** 重新部署一次（或用 "Manage deployments" 建立新版本），單純儲存檔案不會更新已上線的網址行為。

### 4. 把網址填入遊戲程式碼

打開 `index.html`，找到這一行（在 `<script>` 區塊靠前面的地方）：

```js
const SHEET_WEBAPP_URL = 'PASTE_YOUR_APPS_SCRIPT_WEB_APP_URL_HERE';
```

把 `PASTE_YOUR_APPS_SCRIPT_WEB_APP_URL_HERE` 換成你剛剛複製的 Web app URL，存檔。

### 5. 測試

1. 用瀏覽器開啟 `index.html`，輸入名字、玩一局讓蛇死掉。
2. 回到 Google 試算表，應該會看到 `Scores` 工作表多了一列 `時間戳記 / 名字 / 分數`。
3. 如果部署到 GitHub Pages，記得改完網址後要 `git add` / `commit` / `push`，Pages 才會更新。

### 注意事項

- 因為部署設定是「Anyone」可存取，理論上任何人都可以對這個 Web App URL 送資料，請不要把它當成防作弊或高安全性的排行榜使用；如果需要防灌水，可以之後在 `Code.gs` 裡加上簡單的驗證或速率限制。
- 送出分數後，遊戲會即時讀取 Apps Script 回傳的排名與前 5 名排行榜並顯示在畫面上（詳見上方「共通」說明）。這一步需要讀取伺服器回應內容，屬於「盡力而為」的寫入方式：就算網路不通、CORS 被瀏覽器擋下，或寫入失敗，也只會不顯示排名／排行榜，不會影響遊戲本身繼續玩。
- 送分數用的是 **GET**（`?name=...&score=...`）而不是 POST：Apps Script Web App 的回應是透過 302 轉址提供的，瀏覽器 `fetch()` 在跟隨轉址時會把 POST 自動降級成 GET，而轉址後的網址不接受被降級的 GET，導致讀不到回應（症狀是畫面顯示「排名第undefined名」）；改用 GET 就不會有這個降級問題，一路都能正常讀到回應。
- 沒有設定 `SHEET_WEBAPP_URL`（保持預設值）時，遊戲仍可以正常遊玩，只是不會送出分數記錄，也不會顯示排名／排行榜。
- 如果修改了 `Code.gs`（例如更新到新版排行榜邏輯），一定要重新 **New deployment**（或用 "Manage deployments" 建立新版本）才會生效；只按存檔不會更新已上線的 Web App 行為。

## 檔案結構

```
snake_game/
├── index.html          # 遊戲主檔案（HTML + CSS + JS 全部包在同一個檔案中）
├── apps-script/
│   └── Code.gs          # 貼到 Google Apps Script 的伺服器端程式碼
└── README.md            # 本說明文件
```
