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
- 以 Web Audio 輸出時鐘為基準，使用按鍵／觸控事件 timestamp 判定，降低畫面卡頓造成的 Late
- 提供可保存的流速、軌道傾斜、軌道寬度、判定線高度、音量、輸入延遲補償與獨立畫面偏移
- 開始前可進行八輪「聽前三拍、預測第四拍」延遲測試；結果一致時才提供可確認的建議值
- 提供暫停、分數、combo、life 與結算畫面

音遊只保留在測試頁 `scp-game.html`，不會從公開首頁或設定選單進入。建議透過本機靜態伺服器測試：

```sh
python3 -m http.server 8000
```

接著開啟 `http://localhost:8000/scp-game.html`。手動測試時請確認：

1. 選擇 `.scp` 後顯示曲名、難度、封面與 note 數量。
2. 不載入譜面也能完成八輪延遲測試；重新整理後，已套用的補償與其他遊玩設定仍會保留。
3. 調整軌道傾斜、寬度與判定線後，畫面中的 lane 和實際觸控位置仍一致。
4. 開始後 BGM、note 與判定線同步；快速點擊不能直接命中 Flick，滑動或鍵盤放開才可觸發 Flick。
5. slide 可預先按住並移動，但只會在 note 抵達判定線時判定；暫停與繼續不會造成音畫錯位。
6. 曲目結束後會保留尾端判定窗，再顯示分數、最大 combo、準確率與各判定數量。

目前是 GugaGame 自有的網頁判定與繪製，不會執行 SCP 內的 Sonolus Engine bytecode，因此特定 engine 的自訂皮膚、粒子、音效或特殊判定規則會以通用方式近似。

判定時間設計參考 [Etterna](https://github.com/etternagame/etterna/blob/b65660062ef2a23121e331c36e23c23a8f6eafaa/src/Etterna/Actor/Gameplay/Player.cpp#L1877-L1892)、[StepMania](https://github.com/stepmania/stepmania/blob/21bb8dcd6c7e3782f23d5f4e01b6ee4c82cccc71/src/Player.cpp#L2224-L2232)、[Sonolus Input](https://wiki.sonolus.com/engine-specs/essentials/input)、[Sonolus Offsets](https://wiki.sonolus.com/getting-started/advanced/offsets) 與 [Web Audio `getOutputTimestamp()`](https://webaudio.github.io/web-audio-api/#dom-audiocontext-getoutputtimestamp)：輸入判定使用事件發生時間，不受畫面幀率拖慢；畫面偏移與輸入補償則各自獨立。

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

## Cloudflare Pages

https://luecat.com/
