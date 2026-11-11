# Backend implementation plan

## Multilingual and release extension
1. Original archive found at `D:/FYP/kaaryab-afghanistan-main.zip`, safely extracted into ignored `.source-review/` for comparison. Its package manifest and `app/layout.js` confirm Next.js 16 App Router, not Vite.
2. Retain the existing components and styles. Add react-i18next catalogs for English, Dari (`fa-AF`) and Pashto (`ps-AF`), a compact language selector, logical RTL positioning and Unicode fonts.
3. Add database user language, localized category names and relational opportunity translations with an additive migration. Localize REST messages and recovery emails; search across all translated content.
4. Connect all user/admin forms, validation, statuses, CV labels and states to translations. Add admin translation inputs and translate the bundled sample opportunity content.
5. Verify catalog completeness, persistence, localized search, UTF-8, authorization, RTL and browser flows; rerun lint/build/integration tests. Package a single source ZIP excluding secrets, database files and dependencies, with setup and verification instructions.

## Inspection
- Next.js 16 App Router with React 19, Tailwind 4; preserve all existing page markup/styles.
- Home and dashboard use SavedContext; opportunities page falls back to static data, detail page reads static data directly. Both must use the API.
- `kaaryab_opportunities`: entire listing array, browser-specific CRUD; currently new listings lack IDs. `kaaryab_saved`: entire saved objects, not just IDs. `theme`: safe local preference, retain.
- Contact form currently simulates delivery. CV builder generates PDFs locally and does not persist data; retain this privacy-preserving behavior.
- No existing auth, roles, application tracking, API or database. No PostgreSQL/Docker executable found on PATH.

## Execution
1. Add separate Express REST service under backend with PostgreSQL/Prisma migrations and explicit sample-data seeding. One Opportunity model covers the seven existing categories; no duplicate Job/Scholarship tables.
2. Add User (role enum), Session, PasswordReset, Category, Opportunity, SavedOpportunity, Application and ContactMessage models. Add revocable cookie JWT sessions, bcrypt, validation, origin/CSRF checks, rate limits and role enforcement.
3. Implement public discovery, admin listing/category/user/application management and statistics; account/profile/reset, bookmarks, applications and contact endpoints.
4. Add centralized API/auth contexts and small matching account/admin additions. Keep CV generation and theme. Connect existing forms, filters and details with loading/error feedback.
5. Offer explicit legacy-data export/import. Never clear old keys automatically. Only administrators import listings; users import their bookmarks; preserve invalid/unmatched data and report it.
6. Validate schema/migrations, run real database integration tests plus frontend lint/build and browser smoke checks where available. Document exact evidence and any external setup still required.

## Deployment boundary
Production needs PostgreSQL, HTTPS, strong private secrets and optional SMTP credentials. Development/test services must bind to loopback. No deployment or email sending to real recipients is part of implementation testing.
