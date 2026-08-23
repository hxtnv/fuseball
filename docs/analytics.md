# Fuseball — Analytics & Metrics Plan

How to measure whether the game is healthy and growing. Almost everything below
derives from three data sources, so instrument those first.

## 1. Foundation — what to instrument

| Source                    | Add                                                        | Enables                                |
| ------------------------- | ---------------------------------------------------------- | -------------------------------------- |
| `User`                    | already has `createdAt`; add `lastSeenAt DateTime?`        | cohorts, DAU, churn                    |
| `Session` _(new table)_   | `userId, startedAt, endedAt, durationSec, region, wasBot?` | playtime, session length, CCU history  |
| `CcuSample` _(new table)_ | `at, players, rooms, region`                               | concurrent-players-over-time, peak CCU |

The game server already knows session start/stop (WS `open`/`close`) and current
`clients.size`. Report those to the central server (same pattern as
`/internal/match`).

## 2. Metrics grouped by the question they answer

### Are people playing right now?

- **CCU (concurrent users now)** — live count of connected clients. Now served
  over the central `/presence` WebSocket (menu + in-game, humans only). Sample it
  every 60s into `CcuSample` for the historical curve + peak CCU.
- **Active rooms / matches in progress.**

### Is the audience growing?

- **New users/day** — `COUNT(*) FROM "User" GROUP BY date("createdAt")`.
- **DAU / WAU / MAU** — distinct `userId` in `Session` within 1 / 7 / 30 days.
- **Stickiness** = DAU ÷ MAU (healthy ≈ 0.2+).

### Do they stick around? (most important)

- **D1 / D7 / D30 retention** — of users who signed up on day X, the % with a
  session on day X+1 / +7 / +30. Cohort = `date(createdAt)`, joined to `Session`.
- **Rolling retention / churn** — `churn = 1 − retention`; users active in the
  prior window but not the current one, ÷ prior active.
- **Resurrected users** — inactive ≥30d, then returned.

### How much do they play?

- **Total playtime** — `SUM(durationSec)` from `Session`.
- **Avg session length** — `AVG(durationSec)`.
- **Sessions per user per day**, **matches per session**.

### Is the game itself healthy? (product / quality)

- **Match completion vs quit rate** — finished ÷ started (mid-match leaves known).
- **Avg match duration**, **goals/match**, **team win-rate balance** (~50/50),
  **bot-fill ratio** (humans ÷ total slots — is matchmaking finding real players?).
- **Avg ping / connection quality**, **client error/crash rate**.

### Will it make money? (once monetization lands)

- **Anon → Google conversion rate** — `COUNT(isAnonymous=false) ÷ COUNT(*)`.
- **ARPU / ARPPU, paying-user conversion.**
- **Coin sinks vs sources** — watch `balance` inflation.

## 3. How to implement

### Path A — lightweight, in your own Postgres (recommended to start)

1. Add `Session` + `CcuSample` tables.
2. Game server: on WS `open` store `startedAt`; on `close` POST
   `{ userId, startedAt, endedAt, region }` to a new central `/internal/session`
   (guarded by `INTERNAL_SECRET`, like `/internal/match`). Central inserts the row
   and bumps `User.lastSeenAt`.
3. Central runs a 60s CCU sampler that inserts a `CcuSample` (from `/presence`
   size and/or per-server `/health`).
4. Nightly rollup (or plain SQL views) for DAU/retention. Read via Prisma Studio,
   a saved Supabase query, or a read-only `/admin/stats` endpoint behind the
   internal secret.

### Path B — PostHog (free tier) for product analytics

Fire events from the client (`match_start`, `match_end`, `signup`, `signin`) and
PostHog gives retention curves, funnels, churn, DAU/MAU, and session recording
out of the box — no dashboards to build.

### Recommended combo

Path A for CCU + authoritative gameplay/playtime numbers (you own the data),
PostHog for retention/funnels/churn without building UI.

## 4. Status

- [x] Real-time CCU over `/presence` WebSocket (humans only, menu + game).
- [ ] `Session` + `CcuSample` tables.
- [ ] `/internal/session` report + `User.lastSeenAt`.
- [ ] 60s CCU sampler.
- [ ] `/admin/stats` (or Supabase saved queries) for DAU / retention / churn.
- [ ] PostHog events (optional).
