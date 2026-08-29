# Deploying Benevola

Two Vercel projects from this one repo, plus a Neon Postgres database.
Everything below fits in free tiers.

| Piece            | Where                          | Free tier                  |
| ---------------- | ------------------------------ | -------------------------- |
| `fe/` React app  | Vercel project `benevola`      | Hobby                      |
| `api/` Express   | Vercel project `benevola-api`  | Hobby                      |
| Postgres         | Neon                           | 0.5 GB, scales to zero     |
| Image uploads    | Cloudflare R2                  | 10 GB (already configured) |

## Why two projects

Vercel turns every file under a root-level `api/` folder into its own
serverless function. Pointed at this repo root it would publish
`api/src/routes/events.js` as a public endpoint, do the same for every other
module, and blow past the Hobby function limit on the way. Giving `api/` its
own project with its own `vercel.json` means one function, one entry point.

The frontend then proxies `/api/*` to the API project (`fe/vercel.json`).
That proxy is doing real work: the browser only ever sees one origin, so the
session cookie stays first-party and CORS never enters the picture. Point the
frontend straight at the API domain instead and every request looks logged
out, because `vercel.app` is on the Public Suffix List — two `*.vercel.app`
hosts are *cross-site*, and a `SameSite=Lax` cookie is not sent on a
cross-site `fetch`.

---

## 1. Database (Neon)

1. Create a project at [neon.tech](https://neon.tech). Any region near you.
2. Copy the **pooled** connection string — the host has `-pooler` in it.
   The unpooled one will exhaust connection limits under serverless, where
   many short-lived invocations each want their own connection.
3. Run the migrations against it from your machine:

   ```powershell
   cd api
   $env:DATABASE_URL="postgresql://...-pooler...neon.tech/neondb?sslmode=require"
   npm run db:migrate:prod
   ```

4. Optional, to start with the demo content — six North Carolina
   organizations, twenty events spread over the next six months, seven
   volunteers and one admin:

   ```powershell
   npm run db:seed:prod
   ```

   Two things to know before you do. Every seeded account shares one password,
   which is written in the seeder files, so anyone reading the repository can
   sign in as any of those organizations; change it in
   `api/seeders/` first if that matters to you. And the event dates are
   computed when the seeder runs, so they age — six months on, the listing is
   empty again unless you reseed.

## 2. API project

New Vercel project from this repo, **Root Directory: `api`**.
`api/vercel.json` already tells it what to build, so no build settings to fill in.

Environment variables:

| Name                   | Value                                                   |
| ---------------------- | ------------------------------------------------------- |
| `DATABASE_URL`         | the pooled Neon string from step 1                       |
| `SESSION_SECRET`       | `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` |
| `R2_ACCOUNT_ID`        | from Cloudflare, if you want uploads                     |
| `R2_BUCKET`            | ″                                                        |
| `R2_ACCESS_KEY_ID`     | ″                                                        |
| `R2_SECRET_ACCESS_KEY` | ″                                                        |
| `R2_PUBLIC_URL`        | ″                                                        |

Do **not** set `NODE_ENV` — Vercel sets it to `production` itself, and that
flag is what turns on secure cookies and the Postgres config.

Leave `CORS_ORIGIN` and `COOKIE_SAMESITE` unset. They only apply if you stop
proxying through the frontend.

Deploy, then note the resulting URL, e.g. `https://benevola-api.vercel.app`.

## 3. Frontend project

Edit `fe/vercel.json` and replace the placeholder host with the API URL from
step 2:

```json
{ "source": "/api/:path*", "destination": "https://benevola-api.vercel.app/api/:path*" }
```

Commit that. Then create a second Vercel project from the same repo, **Root
Directory: `fe`**. Vercel detects Create React App on its own.

No environment variables. `REACT_APP_API_URL` must stay unset in production —
unset means the frontend uses relative URLs, which is what routes requests
through the proxy and keeps the cookie first-party.

## 4. Check it worked

- `https://your-app.vercel.app` loads and lists events
- log in with a seeded account, reload the page, still logged in
  (this is the one that proves sessions and cookies are wired correctly)
- search for a term in mixed case, e.g. `Food`
- if R2 is configured, upload an event image

---

## Things worth knowing

**Local development is unchanged.** SQLite, no Redis, no Postgres.
`npm run dev` from the repo root still boots both halves. Redis is gone
entirely — nothing to install on Windows any more.

**Dev is SQLite but production is Postgres, and they disagree.** SQLite treats
`VARCHAR(255)` as a hint and stores any length; Postgres enforces it. Its
`LIKE` is case-insensitive for ASCII; Postgres's is not. It has `date()` and
`time()` builtins Postgres does not. The query layer handles the last two
(`src/services/buildEventQuery.js` picks `ILIKE`/`CAST` by dialect), but the
general point stands: a change that works locally is not proven.

To check one against real Postgres without Docker or a Neon branch, point
`DATABASE_URL` at a local Postgres with `?sslmode=disable` — that suffix is the
only thing that turns TLS off, and Neon refuses unencrypted connections anyway,
so it cannot follow you into production:

```powershell
cd api
$env:NODE_ENV="production"
$env:DATABASE_URL="postgres://postgres:postgres@127.0.0.1:5432/postgres?sslmode=disable"
npm run db:migrate:prod
npm run db:seed:prod
npm start
```

**Expired sessions are not swept in production.** The store's cleanup timer is
disabled there on purpose: a serverless instance is frozen between requests,
so the timer mostly never fires and costs a query when it does. Rows are
~200 bytes, so this takes a very long time to matter. To clear them by hand:

```sql
DELETE FROM "Sessions" WHERE expires < NOW();
```

**Vercel's Hobby tier is non-commercial** per their terms. Fine for coursework
or a portfolio piece. If Benevola ever takes money, that is Pro at $20/mo.

**Neon's free tier scales to zero.** The first request after an idle period
pays roughly half a second of wake-up. Cheap, but it is why the app can feel
slow on the very first load.

**Migrations do not run on deploy.** Vercel builds the function; it does not
touch the database. Run `npm run db:migrate:prod` yourself whenever you add a
migration.
