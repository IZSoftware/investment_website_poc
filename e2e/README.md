# End-to-end tests

Thirteen scenarios driving real Chrome against a real backend: the public site,
both sign-in portals (credentials + letter challenge), invite onboarding through
the emailed set-password link, the investor portal and its portfolio CRUD, the
admin console, and the role matrix.

```
npm run e2e                      # everything
E2E_ONLY=admin-login,audit npm run e2e
```

Exit code is the number of failed scenarios. Failures print the page URL, a
400-character text snapshot, recent API failures and console errors, and drop a
screenshot in `e2e/shots/` (gitignored).

## What it needs running

| Piece | Default | How |
|---|---|---|
| Frontend | `http://localhost:3000` | `npm start` with `REACT_APP_API_BASE_URL` pointing at the API |
| Backend | `http://localhost:8080` | the Spring jar on the `dev` profile |
| MongoDB | `localhost:27017` | `docker run -d --name nf-mongo -p 27017:27017 mongo:6` |
| SMTP sink | `localhost:1025` | anything that captures mail to `.eml` files — the invite link is read off disk |

The backend needs `FRONTEND_BASE_URL=http://localhost:3000` so invite emails
link back to the dev server, and on its **first** boot against an empty database
it needs `LETTER_MAPPING` (`A=1,B=2,…`). After that the alphabet lives in Mongo
and the variable is ignored; `E2E_LETTER_MAPPING` must match whatever was seeded
or every challenge answer will be wrong.

## Configuration

`APP_URL`, `API_URL`, `CHROME_PATH`, `MAILS_DIR`, `E2E_LETTER_MAPPING`,
`E2E_ADMIN_EMAIL`, `E2E_ADMIN_PASSWORD`. Defaults live in `helpers.js`.

## Two things that will bite you

**Login rate limit.** The backend allows 10 logins per IP per 10-minute window
(in-memory, fixed window, not configurable). One suite run spends about seven, so
two back-to-back runs trip `429 Too many attempts`. Wait out the window or
restart the backend to clear the limiter.

**Deleted performance periods can never be reused.** `DELETE
/api/admin/performance/{id}` soft-deletes, but the unique index on
`(year, month)` does not exclude deleted rows, so re-creating that period answers
`409 That record already exists.` instead of the documented `400`. The
performance scenario walks candidate periods until it finds a free one.

## Layout

- `run.js` — sequential runner over one shared browser, fail-soft, result table.
- `helpers.js` — config, browser/page setup with console and API-failure
  collectors, DOM utilities, challenge solving, mail-link reading, direct API
  calls for fast provisioning.
- `scenarios.js` — the thirteen scenarios and their shared page factories.

Waits go through `pollFor` (evaluated from Node) rather than
`page.waitForFunction` for anything that settles after a same-tab route change:
puppeteer's in-page poller was observed to hang for its full timeout on a page
whose DOM already satisfied the predicate.

Scenarios share state (`state.runId` and the records they create), so they are
ordered and not independently runnable — `E2E_ONLY` is for narrowing a
reproduction, not for isolation. Data is suffixed with the run id so runs do not
collide, and nothing is cleaned up afterwards.
