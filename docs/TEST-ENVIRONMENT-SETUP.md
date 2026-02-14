# Test environment setup (subdomain + test branch)

Use a **test** branch and a **test subdomain** (e.g. `test.aquafitvallarta.com`) so production stays on `main` and production URLs.

---

## 1. Create and use a test branch

**In both repos (Aquafit-API and Aquafit-UI):**

- Create a branch named `test` (or `staging`/`develop` if you prefer).
- Push it and use it for test-only changes. Merge to `main` only when ready for production.

```bash
git checkout -b test
git push -u origin test
```

If you use a different branch name (e.g. `staging`), update the workflow and Koyeb to use that name (see below).

---

## 2. Koyeb – Test API service (deploys from test branch)

1. **Koyeb dashboard** → Create a **new Service** (separate from production).
2. **Source:** GitHub → **Aquafit-API** repo.
3. **Branch:** `test` (not `main`).
4. **Build:**
   - Build command: `npm run build` (or your existing build command).
   - Run command: `node dist/server.js` (or `npm run start`).
   - Root directory: repo root.
5. **Instance:** Same as prod (e.g. 0.5 GB RAM). Port: `8000`.
6. **Environment variables** (set in Koyeb):
   - `NODE_ENV` = `production`
   - `PORT` = `8000`
   - `JWT_SECRET` = (use a **different** secret than production for test)
   - `MONGO_URI` = (use a **test** MongoDB database/database name, not production)
   - `FRONTEND_URL` = `https://test.aquafitvallarta.com,http://test.aquafitvallarta.com`
7. **Deploy** → Koyeb will give a URL like `your-test-api-xxxxx.koyeb.app`.
8. **Custom domain (optional):** In the test service → Settings → Domains → add `api.test.aquafitvallarta.com` and point DNS there (see step 5).

---

## 3. UI – Test API URL and test build

1. **Set test API URL in the repo:**
   - Edit **`src/environments/environment.test.ts`**.
   - Replace `YOUR-TEST-API-SERVICE.koyeb.app` with your **actual** Koyeb test API URL (e.g. `your-test-api-xxxxx.koyeb.app`).
   - Commit and push to the **test** branch.

2. **Build test locally (optional):**
   ```bash
   npx ng build --configuration=test
   ```

---

## 4. GitHub Actions – Deploy test UI to GoDaddy

The workflow **`.github/workflows/deploy-test-godaddy.yml`** runs on push to the **test** branch and deploys the test build to GoDaddy.

1. **Secrets** (Settings → Secrets and variables → Actions):
   - Reuse: `FTP_SERVER`, `FTP_USERNAME`, `FTP_PASSWORD` (same as production).
   - Add: **`FTP_REMOTE_DIR_TEST`** = `test/`  
     So the test build goes to `public_html/test/` and will be served at `https://aquafitvallarta.com/test/` until you add the subdomain (step 5).

2. **Branch name:** The workflow triggers on **`test`**. If you use another branch (e.g. `staging`), edit the workflow:
   ```yaml
   on:
     push:
       branches: [staging]
   ```

3. Push to **test** → workflow builds with `--configuration=test` and deploys to the path in `FTP_REMOTE_DIR_TEST`.

---

## 5. Subdomain → different servers (test UI + test API)

Use **CNAME** records in GoDaddy DNS so each subdomain points to a **different server** (no GoDaddy folder).

### In GoDaddy: Domain → DNS → Add

| Type  | Name     | Value (point to)                    | TTL   |
|-------|----------|-------------------------------------|-------|
| CNAME | `test`   | Your **test UI** host (see below)   | 1 hr  |
| CNAME | `api.test` | Your **test API** Koyeb URL (e.g. `aquafit-test-api-xxxxx.koyeb.app`) | 1 hr  |

- **Name:** only the prefix (`test` or `api.test`), not the full domain.
- **Value:** the hostname of the server (no `https://`). For Koyeb, use the `xxxxx.koyeb.app` URL they give you.

Result:
- **https://test.aquafitvallarta.com** → test UI server  
- **https://api.test.aquafitvallarta.com** → test API server (Koyeb)

### Where to host the test UI (pick one)

**Option A – Koyeb (same place as test API)**  
1. In Koyeb: New Service → GitHub → **Aquafit-UI** repo → Branch **test**.  
2. **Builder:** Dockerfile (use the repo’s `Dockerfile`).  
3. **Port:** 8080 (Dockerfile exposes 8080).  
4. Deploy → copy the service URL (e.g. `aquafit-test-ui-xxxxx.koyeb.app`).  
5. In that service: Settings → Domains → add **test.aquafitvallarta.com**.  
6. In GoDaddy DNS: CNAME **test** → `aquafit-test-ui-xxxxx.koyeb.app`.

**Option B – Vercel or Netlify**  
1. Connect the Aquafit-UI repo, branch **test**.  
2. Build: `npx ng build --configuration=test`, output: `dist/aquafit-ui/browser`.  
3. Add custom domain **test.aquafitvallarta.com** in Vercel/Netlify; they’ll show the CNAME target.  
4. In GoDaddy DNS: CNAME **test** → that target.

### Test API custom domain on Koyeb

1. In Koyeb → your **test API** service → Settings → Domains → Add **api.test.aquafitvallarta.com**.  
2. In GoDaddy DNS: CNAME **api.test** → your test API’s `xxxxx.koyeb.app` hostname.  
3. In **environment.test.ts**, set `apiUrl: 'https://api.test.aquafitvallarta.com/api'` and redeploy the test UI.

---

## 5b. Subdomain pointing to a folder on GoDaddy (alternative)

**Option A – Subdomain pointing to a folder**

1. In **GoDaddy** → your domain → **DNS** or **Subdomains**.
2. Add subdomain **`test`** and set its **document root** to the folder where the test build is uploaded (e.g. `test` or `public_html/test`), so `test.aquafitvallarta.com` serves the files from that folder.
3. If you use **FTP path** `test/`, the test workflow uploads to `public_html/test/`; set the subdomain’s root to that folder.

**Option B – Subdomain via CNAME (if you move test UI elsewhere later)**

- Add a **CNAME** record: `test` → target host (e.g. a different host or Koyeb if you host test UI there later). For the current setup (FTP to GoDaddy), Option A is what you need.

---

## 6. CORS on test API

On the **Koyeb test API** service, `FRONTEND_URL` must include the exact origins the browser will use:

- `https://test.aquafitvallarta.com`
- `http://test.aquafitvallarta.com` (if you ever use HTTP)

Example (comma-separated):

```env
FRONTEND_URL=https://test.aquafitvallarta.com,http://test.aquafitvallarta.com
```

(And optionally `https://aquafitvallarta.com/test` if you use that URL before the subdomain is set up.)

---

## 7. Optional: Custom domain for test API (api.test.aquafitvallarta.com)

If you want the test API at **api.test.aquafitvallarta.com**:

1. In **Koyeb** → your **test API** service → **Settings** → **Domains** → Add domain: `api.test.aquafitvallarta.com`.
2. In **GoDaddy DNS** (or your DNS provider), add:
   - **CNAME**: `api.test` → `your-test-api-xxxxx.koyeb.app` (or the value Koyeb shows).
3. In **`environment.test.ts`**, set:
   - `apiUrl: 'https://api.test.aquafitvallarta.com/api'`
4. In test API env on Koyeb, set:
   - `FRONTEND_URL=https://test.aquafitvallarta.com,http://test.aquafitvallarta.com`

---

## Checklist summary

- [ ] Create `test` branch in **Aquafit-API** and **Aquafit-UI**; push both.
- [ ] In Koyeb: new **Service** for API from **Aquafit-API**, branch **test**; set env (test DB, test JWT, `FRONTEND_URL` for test UI).
- [ ] Copy test API URL from Koyeb into **`src/environments/environment.test.ts`** in Aquafit-UI; commit on **test**.
- [ ] In GitHub (Aquafit-UI): add **`FTP_REMOTE_DIR_TEST`** = `test/`; confirm workflow triggers on **test**.
- [ ] In GoDaddy: add subdomain **test** with document root = folder used by `FTP_REMOTE_DIR_TEST` (e.g. `test`).
- [ ] (Optional) Add **api.test** CNAME for test API and set **api.test.aquafitvallarta.com** in `environment.test.ts` and Koyeb domains.
- [ ] Push to **test** → test UI deploys; open **https://test.aquafitvallarta.com** and verify it calls the test API.
