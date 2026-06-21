# Cinemist — Movie Ticket Booking System

A movie ticketing platform. Browse films, pick showtimes, choose seats, and receive a QR ticket.


![Cinemist Demo](demo.gif)

> Browse movies → select showtime → pick seats → confirm booking → receive QR ticket.

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Backend | Java 17 + Spring Boot 3.x + Spring Data JPA |
| Frontend | React + Vite |
| Database | PostgreSQL 18 (Docker) |
| Deployment | Docker Compose + nginx |
| Build | Maven / npm |
| AI Dev | Claude Code CLI (Planning: `claude-opus-4-8` / Implementation: `claude-sonnet-4-6`) |

---

## AI-Assisted Development Architecture

The core experiment: **not just asking AI to write code, but engineering a framework that keeps AI on the right track.**

### Three-Layer Architecture

```
Hooks (auto-triggered)
  ├─ PreToolUse  → security reminder before writes, scan for secrets before git commit
  ├─ PostToolUse → auto-run tests after tool calls, record observations to memory
  ├─ SessionStart → inject cross-session memory context
  └─ Stop        → summarize conversation and persist to long-term memory

Skills (AI behavior guidelines)
  ├─ brainstorming               → forced divergent thinking before planning
  ├─ writing-plans               → structured implementation plan before coding
  ├─ test-driven-development     → write failing tests first, then implement
  ├─ systematic-debugging        → root-cause analysis by process, not guesswork
  └─ verification-before-completion → checklist verification before marking done

Plugins (capability extensions)
  ├─ claude-mem   → cross-session long-term memory (AI carries prior decisions into every reply)
  ├─ superpowers  → skills marketplace and hook framework for AI-assisted development
  └─ ponytail     → lazy senior dev mode, enforces shortest effective diff
```

### Development Loop

```
brainstorming → writing-plans → task breakdown
                                      ↓
                          test-driven-development
                                      ↓
                                implementation
                                      ↓
                         PostToolUse auto-runs tests
                           ↙ fail              ↘ pass
              systematic-debugging     verification-before-completion
                   → fix → retry              → gh pr create
                  (max 3 retries)             → code-review
```

### Cross-Session Memory

Via `claude-mem` plugin, every tool call's decisions and context automatically persist as long-term memory. Injected on session start — AI never loses background context between conversations.

---

## Quick Start

```bash
# Start all services (DB + Backend + Frontend)
docker compose up -d

# Open in browser
http://localhost:5175
```

> Dev mode (Vite dev server, no Docker frontend needed):
> ```bash
> docker compose up db backend -d
> cd frontend && npm run dev
> ```

---

## Documentation

| File | Content |
|------|---------|
| `spec.md` | Technical spec (architecture, data model, sequence diagrams, ER diagram) |
| `api.md` | RESTful API documentation |
| `prd.md` | Product requirements document |
| `CLAUDE.md` | Claude Code operating guidelines (read by AI) |
| `.project-memory/` | Shared architecture decisions, task status, lessons learned |

---

---

# Cinemist — 電影票訂購系統

電影票券平台。瀏覽電影、選擇場次、挑選座位、取得 QR 票券。


![Cinemist Demo](demo.gif)

> 瀏覽電影 → 選擇場次 → 挑選座位 → 確認訂單 → 取得 QR 票券。

---

## 技術棧

| 層級 | 技術 |
|------|------|
| 後端 | Java 17 + Spring Boot 3.x + Spring Data JPA |
| 前端 | React + Vite |
| 資料庫 | PostgreSQL 18（Docker） |
| 部署 | Docker Compose + nginx |
| 建置 | Maven / npm |
| AI 開發 | Claude Code CLI（規劃：`claude-opus-4-8`／實作：`claude-sonnet-4-6`）|

---

## AI 輔助開發架構

這個專案的核心實驗是：**不只是叫 AI 寫程式，而是設計一套讓 AI 在正確軌道上運作的工程框架。**

### 三層架構

```
Hooks（自動觸發）
  ├─ PreToolUse  → 寫入前安全提醒、git commit 前掃描敏感資料
  ├─ PostToolUse → 工具呼叫後自動執行測試、記錄 observation
  ├─ SessionStart → 注入跨 session 記憶 context
  └─ Stop        → 對話結束摘要寫入長記憶

Skills（AI 行為守則）
  ├─ brainstorming          → 規劃新功能前強制發散思考
  ├─ writing-plans          → 動手前產出結構化實作計畫
  ├─ test-driven-development → 先寫紅燈測試，再寫實作
  ├─ systematic-debugging   → 失敗時按流程定位根因
  └─ verification-before-completion → 完成前逐項核對清單

Plugins（能力擴充）
  ├─ claude-mem   → 跨 session 長記憶（AI 每次開口都帶著上次決策背景）
  ├─ superpowers  → skills marketplace 與 hook 框架，驅動 AI 輔助開發流程
  └─ ponytail     → lazy senior dev 模式，強制最短有效差異
```

### 開發迴圈

```
brainstorming → writing-plans → 任務拆分
                                    ↓
                          test-driven-development
                                    ↓
                                  實作
                                    ↓
                       PostToolUse 自動觸發測試
                         ↙ 失敗          ↘ 通過
              systematic-debugging    verification-before-completion
                     → 修正 → 重試          → gh pr create
                    （上限 3 次）           → code-review
```

### 跨 Session 記憶

透過 `claude-mem` plugin，每次工具呼叫的決策與脈絡自動沉澱為長記憶。新 session 開啟時自動注入，AI 不需重新交代背景，解決「AI 失憶」問題。

---

## 快速啟動

```bash
# 啟動所有服務（DB + Backend + Frontend）
docker compose up -d

# 瀏覽器開啟
http://localhost:5175
```

> 開發模式（Vite dev server，不需 Docker frontend）：
> ```bash
> docker compose up db backend -d
> cd frontend && npm run dev
> ```

---

## 文件

| 檔案 | 內容 |
|------|------|
| `spec.md` | 技術規格（架構、資料模型、序列圖、ER 圖） |
| `api.md` | RESTful API 文件 |
| `prd.md` | 產品需求文件 |
| `CLAUDE.md` | Claude Code 操作規範（AI 讀取用） |
| `.project-memory/` | 跨人員共用的架構決策、任務狀態、踩坑記錄 |
