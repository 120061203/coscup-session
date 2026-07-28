# COSCUP 2026 議程助手

在會場當天快速篩選 COSCUP 2026 議程的小工具。議程資料即時抓取自
[COSCUP 官方 API](https://coscup.org/2026/api/session)，感興趣程度評分預設值來自
`COSCUP2026_全議程_感興趣程度.xlsx`，評分之後存在瀏覽器 localStorage，可隨時調整。

## 功能

- **總覽**：可依日期、議程軌、關鍵字篩選，並依時間或感興趣程度排序
- **時段篩選**：全部時段／現在進行中／即將開始（60 分鐘內）
- **同時段衝突偵測**：同一時間開始的議程會並排顯示，若其中 2 場以上你評分 ≥ 4 分會特別標示
- **我的行程**：只顯示評分 ≥ 設定門檻（預設 4 分）的議程，方便當天快速對照行程
- **PWA 離線支援**：首次連網載入後，會場斷網也能看已快取的議程與個人評分

## 開發

```bash
npm install
npm run dev
```

## 建置

```bash
npm run build
npm run preview
```

## 部署

Push 到 `main` 分支後，`.github/workflows/deploy.yml` 會自動建置並部署到 GitHub Pages。
第一次部署前，請到 repo 的 **Settings → Pages → Build and deployment → Source** 選擇
**GitHub Actions**。

網站路徑對應 `vite.config.js` 的 `base: '/coscup-session/'`，若 repo 改名需要同步更新。

## 重新產生感興趣程度種子資料

若明年要換一份 Excel，執行：

```bash
python3 scripts/extract_interest.py path/to/new.xlsx
```

會覆寫 `src/data/interestSeed.json`。
