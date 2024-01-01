# Holodex & Discord Sync

使用 Holodex 多窗存檔同步功能，同步觀看 Discord 聊天室

## 安裝

1. 安裝使用者腳本管理器：[Tampermonkey](https://www.tampermonkey.net/)
2. [安裝腳本](https://github.com/stu43005/userscript/raw/master/holodex_discord_sync.user.js)

## 如何使用

分別打開兩個瀏覽器頁籤：
* [Holodex MultiView](https://holodex.net/multiview)
  * 在多窗工具上新增存檔影片，並開啟存檔同步功能 (點擊右上角🔄️按鈕)。
* [Discord](https://discord.com/app) (僅限web版)
  * 瀏覽到要同步觀看的頻道。

在影片撥放時，Discord 聊天訊息的位置會自動與影片當前的時間同步，模擬與 Discord 聊天室同時觀看。

## 常見問題

### 要如何解除同步？

以下情況會自動解除頻道同步
* 向上捲動頻道 (檢視舊訊息)
* 存檔同步暫停播放
* 關閉存檔同步功能

### 影片播放時沒辦法自動同步 Discord

請確認以下步驟：
* 只有開啟一個 Holodex MultiView 分頁
* 至少新增一個已直播結束的影片 (存檔可播放)
* MultiView 已打開存檔同步功能 (下方有顯示同步進度列)
* 存檔同步為撥放中狀態 (同步進度列左方控制按鈕顯示暫停⏸️符號為播放中)
* 將 Discord 頻道捲到最下面

### 有支援其他的使用者腳本管理器嗎？

僅以下的擴充功能經過測試，並可以正常使用：
* [Tampermonkey](https://www.tampermonkey.net/)

如其他的管理器有支援 `GM_getTabs`、`GM_getTab`、`GM_saveTab` API，理論上也可使用。
