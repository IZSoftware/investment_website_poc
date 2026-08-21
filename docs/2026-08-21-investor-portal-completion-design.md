# Investor Portal Completion — Design

**Date:** 2026-08-21 · **Branch:** `feature/investor-portal-completion` (from `develop`)
**Frontend:** `IZSoftware/investment_website_poc` · **Backend contract:** `Investors_Portal_Backend/docs/FRONTEND_README.md` (source of truth) + `docs/AUTH_GUIDE.md`

## 1. Context

The public marketing site is done. The investor portal (and the admin console it shares
auth/plumbing with) was integrated against an older API. Backend tickets EPR-347 (two-phase
letter-challenge login, OTP removed) and EPR-348 (public-site API rebuild, portfolio renames,
five content resources deleted) made that integration a breaking release. `develop` today is
mid-migration: the service layer and `AuthContext` were partially updated, but the UI and
routing were not. Login cannot complete, portal drill-down is dead, country saves 400, admin
settings saves silently wipe five fields, and three finished admin pages are unreachable.

## 2. Goals / non-goals

**Goals**
- Working two-phase sign-in (credentials → 8-letter challenge) for investor and admin portals.
- Complete self-service flows: forgot-password (challenge-based), invite `set-password` page.
- Investor portal fully functional: dashboard, cluster allocation, net assets (+ subclass
  drill-down), countries/market, profile; investor-side portfolio CRUD per the role matrix.
- Admin console aligned with the new API: deleted resources removed; Performance, USD/KES
  rates, Login Locks routed and role-gated; News/Settings/Users corrected; new Audit page.
- All API calls on canonical paths with current field names; no client-side money formatting.
- Tests: unit/RTL suite + full-stack E2E against the real backend run locally (known letter
  alphabet, Mailpit-captured invite emails).

**Non-goals**
- Visual redesign (existing Tailwind conventions are kept; `Profilepage` is brought into the
  house style only because it is being rewritten anyway).
- Backend changes. The one candidate (a `change-password` endpoint) is designed around:
  profile password changes reuse the challenge-based reset flow.
- The deprecated-alias endpoints keep working server-side; we simply stop using them.

## 3. Architecture decisions

1. **Challenge UI lives inside the login pages** (`HoldingCompanyLogin`, `AdminLogin`) as a
   step, not a separate route. The `/verify-otp` routes and `OtpModal` are deleted. A shared
   `LetterChallengeInput` component (8 letters, 8 index-keyed digit inputs, countdown from
   `expiresInSeconds`) is extracted to `src/components/auth/` and reused by both login pages
   and `ForgotPasswordModal` (index-keyed answers; duplicate letters must not collide).
2. **Burnt-challenge rule:** any `400` from `verify-challenge`/`verify-reset-challenge`
   returns the user to the credentials step and requires a fresh login call. Cooldown/lock
   (`429`) shows one calm generic message; never infer which lockout state applies.
3. **`AuthContext.login()`** reads the envelope correctly (`data.data.challenge`), and also
   handles `data.data.auth` (challenge disabled per env) by completing the session directly.
4. **Routing:** `App.js` gains `/investor-portal/set-password` (+ keeps `/reset-password`
   pointing at the same token page), drops OTP and deleted-admin routes, adds
   `/admin-portal/performance`, `/admin-portal/usd-kes-rates`, `/admin-portal/login-locks`,
   `/admin-portal/audit`. `isAdminRole` widens to all staff (`SUPER_ADMIN, ADMIN, DEV,
   FINANCIAL_ADMIN`) for portal entry; per-page controls gate by capability.
5. **Services layer** is the single API boundary: canonical paths only
   (`clusters`, `asset-subclasses`, country `name`), new field names
   (`subclassesVisible`, `allowsSubclasses`, news `message`/`imageUrl`), cluster `companies`
   as `{id?, name, link, logo}[]` full-list replace, settings PUT sends the **whole**
   document, uploads send `folder` in the multipart form. Dead functions (OTP, `/api/public/**`,
   values/media/leadership/pages/foundation/contact-messages) are removed; missing ones
   (login-locks, audit, canonical admin portfolio CRUD) are added.
6. **Money:** render server `displayText` only; `buildValuation` stops sending client-built
   `displayText`; `formatValuation` fallback formatting is removed.
7. **Role gating** follows the README §8.1 matrix, implemented via `userRole` from
   `useAuth()` (never `user?.role`, which does not exist), with `403` treated as authoritative.

## 4. Work packages (agent waves)

**Wave 1 — foundations (parallel)**
- **A · Auth & routing:** `AuthContext`, `App.js`, new `SetPassword` page (rewrites
  `ResetPassword.js`), `LetterChallengeInput`, `HoldingCompanyLogin`, `AdminLogin`,
  `ForgotPasswordModal`, `InvestorNavbar` (real `logout()`), delete `OtpModal`, `jwt.js`
  console.log removal.
- **B · Services & utils:** `services.js` rewrite, `valuation.js`, `apiHelpers.js`,
  `useAdminCrud` (envelope errors + paged variant), `axios-http` timeout note (60s-forged-token
  guidance → client timeout stays 10s, fine).

**Wave 2 — pages (parallel, disjoint files)**
- **C1 · Portfolio & assets:** `InvestorPortal` (drop referrer guard, fix card wiring),
  `PortfolioInvestment`, `NetAssets`, `AssetSubEntities`→subclasses, `AssetCard`,
  `AddAssetModal`, `EditAssetModal`, `AddSubEntityModal`→`AddAssetSubclassModal`,
  `AddSectorModal`/`EditSectorModal`→cluster semantics with companies editor.
- **C2 · Market & profile:** `Market` rewrite (`name`, no years, dashboard header),
  `AddCountryModal` rewrite, `Profilepage` rewrite (real `useAuth` identity; password change
  via challenge-based reset flow; house style).
- **D1 · Admin shell:** `AdminNavbar` rewrite (role-gated menu, remove 6 dead links, add 4),
  `AdminDashboard` rewrite (role-aware tiles; no deleted endpoints), delete the six dead
  admin pages + `LeadershipPhilanthropy.js`.
- **D2 · Admin portfolio CRUD:** `AdminClusters` (companies editor + uploads),
  `AdminPortfolio` (assets + subclass drill-down), `AdminCountries`; shared
  `AdminContentManager`/`SlideOver` upgrades (select/upload field types, envelope errors).
- **D3 · Admin data pages:** `AdminNews` (message/imageUrl/upload), `AdminSettings`
  (whole-document save incl. `yearEstablished`, chairman fields, `usdToLocalCurrencyRateId`
  select), `AdminUsers` (all five roles, SUPER_ADMIN gate, invite copy), `AdminNewsletter`
  (`consentConfirmed` column), `AdminPerformance`/`AdminUsdKesRates`/`AdminLoginLocks`
  (`userRole` gates, server 400 messages, cooldown-row unlock), new `AdminAudit` (paged).

**Wave 3 — unit tests:** RTL/Jest for auth flows (challenge success/failure/expiry, burnt
challenge), services path assertions (no deprecated/deleted endpoints), page smoke tests
with mocked services. `npm run build` gate.

**Wave 4 — E2E:** local stack = Mongo (Docker), Mailpit (SMTP sink), backend jar with dev
profile + known `LETTER_MAPPING` (`A=1,…`), CRA dev server, Puppeteer (cached Chrome).
Scenarios: super-admin login (challenge math from known alphabet), create investor → capture
invite email → set password → investor login → dashboards render server data → portfolio CRUD
(cluster/asset/subclass/country) → forgot-password loop → admin pages (performance CRUD,
rates default PATCH, settings round-trip without data loss). Loop fixes until green.

**Wave 5 — review & delivery:** code-review pass, squash-tidy commits, push branch, PR to
`develop`.

## 5. Error handling & UX invariants

- Every service failure surfaces `err.response?.data?.message` and maps `errors[]` to fields.
- Envelope nulls are absent: all nested reads optional-chained with placeholders.
- `429` on auth → calm cooldown message, submit disabled, reset link offered.
- Timeouts on authenticated calls (forged-token silent drop) → clear tokens, re-authenticate.
- Deletes confirm first; newsletter delete warns about permanent GDPR erasure.

## 6. Testing strategy

Unit: jest + RTL (CRA). Contract assertions live next to `services.js` so path regressions
fail fast. E2E: Puppeteer scripts under `e2e/` (node, no framework), run manually/CI against
the local stack; they assert on rendered text sourced from seeded backend data.
