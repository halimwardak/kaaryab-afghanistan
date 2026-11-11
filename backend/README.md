# KaarYab backend and full-stack setup

The existing Next.js/React UI now uses an Express REST API and PostgreSQL through Prisma. Existing Tailwind layouts, dark mode, responsive cards and the client-side PDF CV builder are retained. Account, application tracking and admin management screens use the same styling.

## Requirements

- Node.js 22.12+ or Node.js 24 LTS and npm. This implementation was exercised with Node 24.13.0.
- PostgreSQL for deployment. You do **not** need PostgreSQL or Docker preinstalled for the optional project-local development helper below.
- Two application processes: Next.js on port 3000 and Express on port 4000. The frontend proxies `/api/*` to Express. Production should expose both under the same HTTPS origin.
- SMTP is optional; without it password reset requests return a generic response and no reset token or email is produced.

Install from the repository root:

```powershell
npm install
npm --prefix backend ci
cd backend
```

Prisma configuration reads `DATABASE_URL`. Choose a database option below before generating the client. For installed/Docker PostgreSQL, create `backend/.env` from `.env.example` and supply your database connection and a random JWT secret. Alternatively `db:local` creates a private `.env` and generates the client automatically.

## Option A: automatic local PostgreSQL

From `backend/`, run:

```powershell
npm run db:local
```

This development-only helper uses the `embedded-postgres` npm package (a development dependency containing real PostgreSQL binaries). It creates random local database credentials and a JWT secret in ignored `backend/.env`, initializes a persistent database in ignored `backend/.postgres`, binds to **127.0.0.1:55432**, applies the checked-in migration and seeds categories. Keep the terminal running. It does not create a Windows service or alter a system PostgreSQL installation. This helper refuses to manage any configured database other than `127.0.0.1:55432/kaaryab`.

If `.env` already points to Docker, an installed database or cloud PostgreSQL, use that database rather than this helper. Back up `.postgres` or use `pg_dump` before changing/removing local storage. Do not delete it as a troubleshooting shortcut.

## Option B: Docker Compose

### Older Windows databases and Unicode

`db:local` now explicitly creates UTF-8 databases. If an older project-local database uses WIN1252, stop the API and other database clients and rerun `npm run db:local`. The helper locks the source tables against writes, creates a separate UTF-8 database, restores the checked migration schema and every application record, and compares all copied rows before updating `backend/.env`. It retains the original database and writes a private JSON snapshot plus the old environment file to ignored `backend/.backups/`. Never include this directory in source ZIPs or commits: it contains private records and credentials. Unknown tables or changed migration checksums stop conversion without switching the configuration. This automatic conversion is restricted to the project-local development database, not hosted databases.

The original database is never dropped. Restart the backend after conversion so it reads the updated connection URL. Keep the database terminal open; Ctrl+C shuts down its PostgreSQL process gracefully. Do not delete `.postgres` to fix an encoding error.

Install Docker Desktop with the Linux containers engine first. From the repository root:

```powershell
$env:POSTGRES_PASSWORD = '<choose-a-private-password>'
docker compose up -d postgres
```

Copy `backend/.env.example` to `backend/.env` and set `DATABASE_URL` to `postgresql://kaaryab:<URL-encoded-password>@localhost:5432/kaaryab?schema=public`. Set a strong `JWT_SECRET`. The Compose volume preserves your database across container restarts. Never run `docker compose down -v` against data you need.

## Option C: installed or managed PostgreSQL

Install PostgreSQL from its official installer/package manager, or provision a private managed PostgreSQL instance. Create a dedicated database and least-privilege application role; use separate migration credentials if your deployment requires them. Supply its connection URL through `DATABASE_URL`. Enable certificate-verified TLS for hosted databases according to your provider; do not disable certificate verification.

Then, from `backend/`:

```powershell
npm run db:generate
npm run db:migrate
npm run db:seed
```

`db:migrate` uses `prisma migrate deploy` and never resets the database. The migration is checked into `prisma/migrations/202611080001_init/migration.sql`. To develop future migrations, use `npx prisma migrate dev --name descriptive_name` only against a development database, review the SQL and commit it.

## Sample data and administrator

The default seed adds seven categories and never overwrites data. To explicitly import the original sample listings, retaining their original IDs:

```powershell
$env:SEED_DEMO = 'true'
npm run db:seed
Remove-Item Env:SEED_DEMO
```

These are training listings, with original dates and example URLs; some are expired. Do not present them as verified vacancies. Production seeding should omit `SEED_DEMO`.

Create your first administrator explicitly, from `backend/`:

```powershell
$env:ADMIN_EMAIL = 'your-real-email@example.com'
$env:ADMIN_NAME = 'Your Name'
$env:ADMIN_PASSWORD = '<unique-password-of-at-least-12-characters>'
npm run admin:create
Remove-Item Env:ADMIN_PASSWORD
```

The command never promotes or replaces an existing account, never has a default password, and never prints the password. If an account already exists, use another administrator's Users screen to change its role. Public registration always creates a USER and rejects role injection. Administrators cannot disable or demote their own account through the API.

## Run the applications

**Recommended:** from the project root run `npm run dev` in one terminal. It waits for PostgreSQL and the API before starting the website at http://localhost:3000. Keep the terminal open; Ctrl+C stops services started by the launcher. Stop older frontend/backend terminals first. A configured database that was already running is reused and left running.

The three-terminal method below is optional; do not combine it with the single-command method.

Terminal 1: keep `npm run db:local` running if using Option A.

Terminal 2, from the repository root:

```powershell
npm run backend:dev
```

Terminal 3, from the repository root:

```powershell
npm run frontend:dev
```

Open http://localhost:3000. Sign in through `/account`. Administrators use `/dashboard` for opportunity CRUD and publication, and `/admin` for users, categories, applications, messages and totals. Members use `/saved` and `/applications`.

Production build/start:

```powershell
npm run build
npm start
# In backend/, with production environment and migrated database:
npm start
```

The existing Google Inter font is downloaded during the Next.js build, so the build requires access to Google Fonts. Next.js and Express are separate deployable services; deploying just the frontend to Vercel does not deploy the Express server or PostgreSQL.

## Environment configuration

| Variable | Location | Purpose |
| --- | --- | --- |
| DATABASE_URL | backend private environment | PostgreSQL connection; never NEXT_PUBLIC |
| JWT_SECRET | backend private environment | At least 32 characters of cryptographic randomness |
| NODE_ENV | backend | development, test or production |
| HOST / PORT | backend | Defaults 127.0.0.1 / 4000; set a container bind address when deploying behind your proxy |
| FRONTEND_URL | backend | Exact frontend origin and canonical reset link base; HTTPS required in production |
| TRUSTED_ORIGINS | backend | Optional comma-separated exact additional origins for reviewed aliases/previews; HTTPS required in production |
| TRUST_PROXY | backend | Trusted reverse-proxy hop count, default 0; configure to match your actual network |
| SMTP_HOST / SMTP_PORT | backend | Optional SMTP server and port (default 587) |
| SMTP_SECURE | backend | `true` for implicit TLS, typically port 465 |
| SMTP_USER / SMTP_PASS / MAIL_FROM | backend | Optional SMTP credentials and sender |
| NEXT_PUBLIC_API_URL | root `.env.local` | Public API path, default `/api`; no secrets |
| BACKEND_URL | root `.env.local` | Server-side Next rewrite destination, default http://127.0.0.1:4000 |

Prefer same-origin proxying for cookies. Separate-site hosting needs an intentional cookie/CSRF design change rather than simply setting a different API URL. Cookies are HttpOnly, SameSite=Lax, path=/, with Secure and the `__Host-` prefix in production. JWTs expire after eight hours and reference a database Session so logout, password reset, password change and account changes revoke access. There is no long-lived browser token or automatic refresh token.

Password reset uses a 32-byte random token, stores only its SHA-256 hash, expires it in 30 minutes, and consumes it once in a transaction. Reset links use the configured frontend URL, not an untrusted Host header. Raw tokens are never logged or returned by the API. SMTP failure removes the generated token and returns the same generic public response. Configure and verify SMTP before offering email recovery publicly.

## Architecture and schema
### Vercel Login/Register origin configuration

Authentication uses Express, bcrypt and database-backed JWT session cookies. CORS and
the `/api` write guard share an explicit origin allowlist. `FRONTEND_URL` is always
trusted and remains the canonical password-reset URL. `TRUSTED_ORIGINS` adds exact
reviewed aliases, separated by commas. For example:

```dotenv
FRONTEND_URL=https://kaaryab-afghanistan-gamma.vercel.app
TRUSTED_ORIGINS=https://your-reviewed-preview.vercel.app
NEXT_PUBLIC_API_URL=/api
```

Replace the example preview address with an actual approved deployment or branch
alias, or leave `TRUSTED_ORIGINS` empty. Configure these for the appropriate Vercel
Production/Preview environment and make them available to the backend service.
Production and preview domains differ; neither `VERCEL_URL` nor
`VERCEL_PROJECT_PRODUCTION_URL` is automatically trusted. Never allow `*.vercel.app`
or infer trust from request Host/forwarded headers. Origin entries must contain only
scheme, hostname and optional port (a trailing slash is accepted); production requires HTTPS.

Keep browser API requests on `/api`: `vercel.json` routes them to the backend service.
The Next.js `BACKEND_URL` rewrite is for separate/local hosting, defaults to localhost,
and is not an origin allowlist. Do not set the browser API URL to another deployment
to work around a 403; host-only cookies must stay on the visited frontend origin.
Keep `DATABASE_URL`, a private random `JWT_SECRET` of at least 32 characters, and
`NODE_ENV=production` configured. Do not rotate the secret or modify the database to
resolve an origin mismatch.

After pushing the fix and saving environment changes, redeploy the latest commit.
Visit the exact configured production domain, check `/api/health`, and test registration,
login and logout. Test approved previews separately in the Preview environment; use
a separate preview database/secret. Unlisted origins must continue to receive 403 for
writes, and a trusted browser request must still include `X-KaarYab-Request: 1`.


```text
Existing React pages -> lib/api.js -> Next /api rewrite -> Express -> Prisma -> PostgreSQL
                          cookies       origin checks     authorization
```

| Entity | Key relationships / constraints |
| --- | --- |
| User | Unique normalized email; bcrypt passwordHash; USER/ADMIN enum; active flag; timestamps |
| Session | User FK with cascade; expiry index; JWT jti references ID |
| PasswordReset | User FK with cascade; unique token hash and expiry index |
| Category | Unique name; referenced categories cannot be deleted |
| Opportunity | Category FK, optional creator FK; arrays of requirements/tags; date deadline; DRAFT/PUBLISHED/CLOSED enum; category/status/deadline/type indexes |
| SavedOpportunity | Composite user/opportunity primary key; cascade when user or opportunity is deleted |
| Application | Unique user/opportunity pair; cover letter, optional resume URL; status enum and timestamps; preserves history by restricting opportunity deletion |
| ContactMessage | Validated name/email/message; read flag and chronological index |

Jobs, internships, scholarships and courses share the existing identical opportunity shape, so they use one table and category relation. Role is an enum, not an unnecessary table. No Notification or CV database table was invented: there is no existing notification flow and CVs continue to be generated locally. Submitted applications are received by KaarYab admins; the original external Apply Now link is also preserved.

Service layout: `src/config`, `src/middleware`, `src/validators`, `src/services`, `src/routes`, `src/utils`, `app.js`, `server.js`. Route handlers are kept in feature-specific routers; shared query and DTO logic is in services. `server.js` connects to the database before listening and disconnects on shutdown.

## REST API

All paths below are relative to `/api`. JSON success responses contain `data`, `user` or `message`; list responses contain `{ data, pagination: { page, limit, total, pages } }`. Errors use `{ error, details? }`. Every non-GET request requires `X-KaarYab-Request: 1`; browser requests must have the configured Origin. Send cookies (`credentials: include`) and JSON request bodies.

| Method / path | Access | Behavior |
| --- | --- | --- |
| GET /health | Public | Database readiness |
| POST /auth/register | Public | name, email, password; creates USER and cookie session |
| POST /auth/login | Public | email/password login |
| POST /auth/logout | Public | Revoke current session and clear cookie |
| GET /auth/me | Public | Current safe user or null |
| PATCH /auth/profile | Member | Update name |
| POST /auth/change-password | Member | currentPassword/password; revoke all sessions |
| POST /auth/forgot-password | Public | Generic recovery response; SMTP when configured |
| POST /auth/reset-password | Public | token/password; single-use recovery |
| GET /opportunities | Public | Published listings with search/filter/pagination/sort |
| GET /opportunities/stats | Public | Aggregated public counts and soon-expiring listings |
| GET /opportunities/:id | Public | Published listing only |
| GET /categories | Public | Available category names |
| GET /saved | Member | Own published bookmarks |
| PUT, DELETE /saved/:id | Member | Idempotent save/unsave |
| POST /saved/import | Member | `{ ids: [...] }`; reports unmatched IDs |
| GET, POST /applications | Member | Own paginated history / submit coverLetter, opportunityId, optional resumeUrl |
| POST /contact | Public | Store a message, not a simulated success or outgoing email |
| GET, POST /admin/opportunities | Admin | All statuses / create |
| GET, PUT, DELETE /admin/opportunities/:id | Admin | Read, replace validated fields, delete if no applications |
| PATCH /admin/opportunities/:id/status | Admin | Publish/unpublish/close |
| POST /admin/categories | Admin | Create category |
| PATCH, DELETE /admin/categories/:id | Admin | Rename/delete unused category |
| GET /admin/users | Admin | Paginated safe user records |
| PATCH /admin/users/:id | Admin | Update role/active and revoke sessions |
| GET /admin/applications | Admin | Paginated applications, optional status filter |
| PATCH /admin/applications/:id | Admin | Change status |
| GET /admin/messages | Admin | Paginated contact inbox |
| PATCH /admin/messages/:id | Admin | Mark read/unread |
| GET /admin/stats | Admin | Global counts, category/application breakdowns |
| POST /admin/import | Admin | Additive legacy listings with per-item outcome |

Opportunity queries: `search`, `category` (exact name), `type` (`Remote`, `On-site`, `Hybrid`), `location`, `expired=true|false`, `sort=newest|oldest|deadline|title`, `page`, `limit` (max 100). Admin queries also accept `status`. Public status queries never reveal drafts. Expired published records remain discoverable for reference; applications after the deadline are refused. Deadlines use UTC calendar days, inclusive through the specified date.

Application statuses: SUBMITTED, REVIEWING, INTERVIEW, ACCEPTED, REJECTED. Duplicate applications are blocked at the database constraint, including concurrent requests. Public write payloads are strict Zod schemas. Application deletion is intentionally not an admin operation; history is retained. Account disabling replaces destructive user deletion in the management UI.

## Local Storage migration

Inspected keys:

- `kaaryab_opportunities`: previously an entire mutable browser-only listing array.
- `kaaryab_saved`: previously copies of entire saved listing objects.
- `theme`: retained as a non-sensitive client preference.

No new sensitive values are stored in Local Storage. Active listing and bookmark flows use APIs. The only reads of old data are in the explicit Account migration panel; original keys are **never automatically deleted**.

1. Use Account > Export backup. It downloads both original raw values, including malformed data that cannot be parsed.
2. Sign in to the account that should own the bookmarks, then Import old data.
3. Administrators can import listings; regular users cannot create listings through migration. Existing records are never overwritten. Modified legacy records receive deterministic content-based IDs, making retries idempotent; unchanged seed records retain their IDs.
4. Imported IDs are mapped for bookmarks in the same operation. Missing IDs, unpublished records and invalid data are counted/reported, with the original backup intact. Legacy items originally created without IDs cannot be reliably matched as bookmarks; use the backup to recover those manually. Create missing categories before retrying a rejected import.
5. Do not clear old browser keys until you personally verify the migrated data and retain the exported backup. Browser-local records cannot be discovered on another device automatically.

## Tests and verification

```powershell
# From backend/:
npm run db:generate
npm test
# From root:
npm run lint
npm run build
```

The backend suite starts an isolated, real PostgreSQL instance using the development helper package, creates a new temporary cluster with random credentials, deploys the real migration, and exercises Express with Supertest. It does not use or truncate the development database. Default test port is 55433; set `TEST_PG_PORT` if occupied. Windows process restrictions can block embedded PostgreSQL cleanup; run tests in a normal terminal with process permissions. A failed cleanup is not a passed test run.

Tests cover registration, password hashing, cookies, login/logout, current user, input rejection, CSRF/origin checks, authorization, opportunity CRUD/search/filter/pagination/publication, private bookmarks, migration retries, duplicate and expired applications, application status and ownership, category constraints, contact inbox/stats, profile/password changes, single-use/expired reset tokens, session revocation, account disabling, malformed JSON, unknown routes and rate limits. SMTP recovery token consumption is tested; actual external email delivery needs your configured provider.

See `../VERIFICATION.md` for the recorded results, browser smoke checks, file inventory and deployment tasks.

## Deployment requirements

- Set production HTTPS origins and strong secrets; do not deploy development `.env` files or test credentials.
- Apply migrations, generate Prisma client, run seed for categories, explicitly create an admin, and back up PostgreSQL regularly.
- Configure TLS and trusted proxy hops; keep the database private. Test health/readiness through your deployed proxy.
- The default rate-limit store is per-process memory. A single Express instance is supported; configure a shared Redis-backed rate-limit store or trusted gateway limits before horizontal scaling.
- Configure SMTP and verify real email delivery. Add your organization's monitoring, backup restoration drills and retention policy for applications/contact messages before accepting public traffic.
- No deployment, provider provisioning or real outgoing email was performed automatically.

Reference documentation: [Express security](https://expressjs.com/en/advanced/best-practice-security/), [Prisma 7 migration guide](https://docs.prisma.io/docs/orm/v6/more/upgrades/to-v7), [Next.js rewrites](https://nextjs.org/docs/app/api-reference/config/next-config-js/rewrites).
