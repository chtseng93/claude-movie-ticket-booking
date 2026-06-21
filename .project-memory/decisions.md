# 技術決策紀錄

## 格式

```
## YYYY-MM-DD：[決策標題]
原因：
- ...
```

---

## 2026-06-21：全服務 Docker Compose 部署

原因：
- 使用者要求前後端與資料庫全部用 Docker Compose 部署
- nginx 反向代理 `/api/*` → `backend:8085`，前端程式碼用相對路徑，dev/prod 同一份
- 省去 CORS 設定（BE-7 移除），所有請求同源（browser → nginx:5175）
- 後端 Dockerfile 多階段：maven build → JRE runtime（縮小映像）
- 前端 Dockerfile 多階段：npm build → nginx serve
- 開發模式仍可用 Vite proxy 取代 nginx（不需 Docker）

## 2026-06-21：BookingSeat UNIQUE(showtime_id, seat_id) 防雙重購買

原因：
- SELECT FOR UPDATE 無法鎖定不存在的列（幻讀問題）
- 改用 DB 唯一約束，兩個併發首次插入只有一個成功
- booking_seat 加 showtime_id 欄位（反正規化），讓約束可成立
- 座位狀態改為衍生值（列存在 = SOLD），移除 status 欄位

---
