# Render 部署步驟

## 架構

| 元件 | Render 服務類型 |
|------|---------------|
| Backend (Spring Boot) | Web Service (Docker) — `./backend/Dockerfile` |
| Frontend (React/Vite) | Static Site — `frontend/dist` |
| PostgreSQL | Render Managed Database |

---

## Step 1：Render 手動建立服務

### 1-A 建立 PostgreSQL Database
1. Render Dashboard → **New → PostgreSQL**
2. Name: `cinemist-db`
3. 建立完成後，進入服務頁面記下 **Internal Database URL**
   - 格式：`postgresql://user:pass@host/db`

---

### 1-B 建立 Backend Web Service
1. Dashboard → **New → Web Service**
2. Connect GitHub → 選 `claude-movie-ticket-booking`
3. 填入設定：

   | 欄位 | 值 |
   |---|---|
   | Name | `cinemist-backend` |
   | Root Directory | `backend` |
   | Runtime | Docker |
   | Dockerfile Path | `./Dockerfile` |

4. **Environment Variables** → Add：

   | Key | Value |
   |---|---|
   | `SPRING_DATASOURCE_URL` | Internal Database URL（`postgresql://` 改成 `jdbc:postgresql://`） |
   | `SPRING_DATASOURCE_USERNAME` | DB user |
   | `SPRING_DATASOURCE_PASSWORD` | DB password |

5. 建立後進入 **Settings → Deploy Hook** → 複製 URL（待填入 GitHub Secret）

---

### 1-C 建立 Frontend Static Site
1. Dashboard → **New → Static Site**
2. Connect 同一個 repo
3. 填入設定：

   | 欄位 | 值 |
   |---|---|
   | Name | `cinemist-frontend` |
   | Root Directory | `frontend` |
   | Build Command | `npm ci && npm run build` |
   | Publish Directory | `dist` |

4. **Environment Variables** → Add：

   | Key | Value |
   |---|---|
   | `VITE_API_BASE_URL` | `https://cinemist-backend.onrender.com`（後端實際 URL） |

5. **Settings → Deploy Hook** → 複製 URL

---

## Step 2：設定 GitHub Secrets

GitHub repo → **Settings → Secrets and variables → Actions → New repository secret**

| Secret 名稱 | 值 |
|---|---|
| `RENDER_BACKEND_DEPLOY_HOOK` | Step 1-B 複製的 Deploy Hook URL |
| `RENDER_FRONTEND_DEPLOY_HOOK` | Step 1-C 複製的 Deploy Hook URL |

---

## Step 3：確認 GitHub Actions Workflow

檔案已存在：`.github/workflows/deploy.yml`

每次 push `master` 分支自動觸發兩個部署：

```
push to master
      │
      ├─ curl RENDER_BACKEND_DEPLOY_HOOK  → Render build Docker → Spring Boot 啟動
      └─ curl RENDER_FRONTEND_DEPLOY_HOOK → Render npm build   → 靜態檔案上線
```

---

## 注意事項

- Render free tier 閒置 15 分鐘後會 spin down，首次請求較慢
- `SPRING_DATASOURCE_URL` 前綴需手動改為 `jdbc:postgresql://`（Render 給的是 `postgresql://`）
- `data.sql` 在 `spring.sql.init.mode: always` 下每次啟動都執行，生產環境建議改 `never`
