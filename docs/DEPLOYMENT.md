## Secure Deployment (No Secrets in Git)

Follow these steps to deploy without committing private credentials (like database URLs) to GitHub.

### 1) Prepare local env files (not committed)

- Copy `.env.example` → `.env` at the repo root for the backend.
- Copy `frontend/.env.example` → `frontend/.env` for the frontend.
- Never commit `.env` files. Ensure your `.gitignore` excludes them.

### 2) Backend on Render (Free Plan)

- Create a new Web Service from this repository. It uses the existing `Dockerfile`.
- In Render → your service → Settings → Environment, add variables (do NOT store in repo):
  - `SECRET_KEY`
  - `ACCESS_TOKEN_EXPIRE_MINUTES` (e.g., 30)
  - `ALGORITHM` (e.g., HS256)
  - `DATABASE_URL` (see below)
  - `CORS_ORIGINS` (comma-separated, include your Vercel domain)
- Database options (stay free):
  - MySQL: PlanetScale (recommended for current MySQL config). Use a URL like `mysql+pymysql://<user>:<pass>@<host>/<db>?ssl=true`.
  - Postgres: Neon/Supabase. Use `postgresql+psycopg://<user>:<pass>@<host>:<port>/<db>` and install `psycopg`.
- After setting env vars, deploy. Note: Free services sleep after inactivity (cold start latency).

### 3) Frontend on Vercel (Free Plan)

- Import the GitHub repo into Vercel. Set the project root to `frontend/`.
- Build Command: `npm run build`
- Output Directory: `build`
- Install Command: `npm ci`
- Environment Variables (Project Settings → Environment Variables):
  - `REACT_APP_API_URL` → your backend URL on Render (public)
  - Optionally `REACT_APP_ENV=production`
- Deploy. Once live, copy the frontend URL and ensure it’s added to `CORS_ORIGINS` on Render.

### 4) Keep secrets out of GitHub

- Only commit `.env.example` files with placeholders.
- Real values go into `.env` locally and into platform dashboards (Render/Vercel) as environment variables.
- Avoid hardcoding secrets in `vercel.json` or `render.yaml`. Use dashboard-managed secrets whenever possible.

### 5) Quick verification

- Open the Vercel site and confirm login/API flows work.
- If CORS errors appear, confirm the Vercel URL is present in Render `CORS_ORIGINS` and `REACT_APP_API_URL` is correct.

