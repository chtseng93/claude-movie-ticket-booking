# 架構說明

## 專案狀態

**目前**：僅有靜態 HTML 設計稿（design/），後端與前端尚未建立。

## 技術棧

- 後端：Java 17 + Spring Boot 3.x + Spring Data JPA
- 前端：React + Vite
- 資料庫：PostgreSQL 18（Docker）
- 建置：Maven（後端）、npm（前端）

## 品牌名稱

**Cinemist** — 暗黑賽博龐克電影票券平台（design/ 內的 HTML 仍標示舊名 MOTIONIST，因不可修改而保留）

## 設計系統（design/ 資料夾，不可修改）

### 色彩
- Primary: `#e1fdff` / Container: `#00f2ff`（青藍色霓虹）
- Background: `#131313` / `#0A0A0A`
- Surface variant: `#353534`

### 字型
- Headlines: Space Grotesk
- Body: Inter
- Labels/Mono: JetBrains Mono

### 視覺效果
- Glassmorphism（`glass-panel` class）
- Film grain overlay（fixed position，opacity 0.02-0.03）
- WebGL shader（hero 背景動畫）
- Neon glow / scan line 動畫

## 頁面流程

```
movieinfo_neon.html  →  date_neon.html  →  checkout_neon.html  →  ticket_neon.html
（電影詳情）              （日期/場次選擇）     （座位選擇 + 結帳）        （確認票券 + QR）
```

## 座位結構（設計稿）

- 6 列（A-F）× 12 座（1-12）= 72 座/場
- 座位 ID 格式：`A1`, `B7` 等
- 票價：$18.50/座（設計稿硬碼）
- 票券 clip-path 造型（ticket-shape class）

## 資料模型（依 PRD）

```
Movie → Showtime → Theater → Seat
              ↓
           Booking → BookingSeat
```

## 目錄結構（預計）

```
/
├── design/          # 設計稿（不可修改）
├── backend/         # Spring Boot
│   └── src/
├── frontend/        # React + Vite
│   └── src/
├── .project-memory/
├── CLAUDE.md
└── prd.md
```
