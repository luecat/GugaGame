# GugaGame

一款使用純 HTML、CSS 與 JavaScript 製作的企鵝桌寵遊戲。

## 目前功能

- 企鵝隨機散步
- 單點跳躍、連點轉圈
- 拖動企鵝、重力加速落下與高處摔傷
- 跳躍與墜落時的落地音效
- 血量、飽食度與好感度
- 摔落高度會提高傷害，並按傷害量降低好感度
- 血量歸零時會觸發 jumpscare 與死亡畫面
- 餵食互動
- 依瀏覽器時間切換晝夜

## 尚未完成

- [x] 摔落音效
- [ ] 飽食度隨時間下降
- [x] 飽食度全滿時恢復血量
- [x] 死亡機制
- [ ] 探索

## 本機執行

直接使用瀏覽器開啟 `index.html` 即可遊玩。

## SCP 音遊（實驗性）

`scp-game.html` 可以直接載入 Sonolus Collection Package（`.scp`）並遊玩第一個關卡。全部解析、音訊解碼與遊戲運算都在瀏覽器本機執行，不會上傳譜面。

- 讀取 SCP 內的 level data、engine play data、BGM 與封面
- 支援 tap、flick、slide、trace、attached/ignored tick 等譜面 entity
- 依 BPM 與 time scale 呈現 12-lane 軌道
- 支援多點觸控、滑動，以及鍵盤 `S D F J K L`
- 提供流速、判定偏移、暫停、分數、combo、life 與結算畫面

從首頁的「互動 → 音遊」進入，或直接開啟 `scp-game.html`。建議透過本機靜態伺服器測試：

```sh
python3 -m http.server 8000
```

接著開啟 `http://localhost:8000/scp-game.html`。手動測試時請確認：

1. 選擇 `.scp` 後顯示曲名、難度、封面與 note 數量。
2. 開始後 BGM、note 與判定線同步，觸控或鍵盤可產生判定。
3. slide 可按住並移動，暫停與繼續不會造成音畫錯位。
4. 曲目結束後顯示分數、最大 combo、準確率與各判定數量。

目前是 GugaGame 自有的網頁判定與繪製，不會執行 SCP 內的 Sonolus Engine bytecode，因此特定 engine 的自訂皮膚、粒子、音效或特殊判定規則會以通用方式近似。

## SCP 譜面解析器

`scp-parser-demo.html` 是純靜態的 Sonolus Collection Package 解析測試頁。它會在瀏覽器內解開 `.scp`、讀取 GZip level data 與 engine play data，並保留：

- 全部原始 entity data
- 所有 archetype 名稱以 `Note` 結尾，或由 engine 標示 `hasInput` 的 note（包含 hidden、ignored、attached、trace 與引擎自訂類型）
- engine 標示 `hasInput` 的全部輸入 entity 與可判定 note
- slide connector、SimLine、Guide、BPM 與 time scale entity
- entity name/ref 關係與解析問題

也可以從終端機檢查檔案：

```sh
node scripts/parse-scp.js /path/to/chart.scp
node scripts/parse-scp.js /path/to/chart.scp --json
node --test tests/scp-parser.test.js
```

解析器使用固定版本的 [fflate 0.8.3](https://github.com/101arrowz/fflate) 解壓縮；授權文字保存在 `vendor/fflate-LICENSE.txt`。

## GitHub Pages

https://luecat.github.io/GugaGame/
