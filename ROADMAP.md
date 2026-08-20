# Fuseball — Rewrite Roadmap

A full rewrite focused on **performance**, **fun/feel**, and **ease of play** from day one.
Runs on low-end devices (target: ancient Android @ 60fps), instantly playable, progress savable.

## Locked decisions

- **Runtime:** Bun everywhere (server, game server, client tooling).
- **Monorepo:** Bun workspaces — `apps/client`, `apps/server`, `apps/server-game`, `packages/shared`.
- **Client UI:** Vite + Preact + `@preact/signals`. Menus only.
- **Rendering:** Raw Canvas2D. No p5/q5. No framework in the game loop.
- **Look:** Flat top-down (Haxball/Zombs Royale inspired). Optional **ball `z`-height** for aerial passes
  (ball scales up when higher, ground contact-shadow shrinks/fades). No perspective 2.5D.
- **Quality tiers:** "potato" (flat, minimal FX, capped DPR) ↔ "full" (glow, trails, particles). Auto-detect + toggle.
- **Netcode:** Authoritative sim @ 30Hz, binary protocol, client interpolation + prediction/reconciliation.
- **Shared sim:** One deterministic `step()` in `packages/shared`, run by both server-game (authority) and client (prediction).
- **Accounts:** Anonymous user created on first play (JWT in localStorage), treated as real user with locked
  actions (name change, purchases). Sign-in converts anon → full account, preserving progress.
- **Deploy:** `server-game` to multiple VPS regions; `server` + Postgres central; managed Postgres (Neon/Supabase).
- **Monetization target:** Poki / CrazyGames first (rewarded ads + cosmetics + retention). Not YouTube Playables.

## Phases

- **Phase 0 — Monorepo scaffold.** Bun workspaces; all four packages boot with a hello-world importing `shared`.
- **Phase 1 — Shared sim core.** `packages/shared`: entity types, constants (ported from `_old`), pure
  fixed-timestep `step(state, inputs, dt)` — movement, ball physics + friction, collisions, ball `z`-height,
  goal detection, bounds. Pure, testable, no render, no network.
- **Phase 2 — Client renderer + local loop.** Raw Canvas2D renderer with quality tiers, offscreen-cached pitch,
  radial-gradient spheres, z-height ball + contact shadow. Runs the shared sim locally with keyboard input.
  Prove 60fps + feel offline.
- **Phase 3 — Game server + netcode.** `server-game`: `Bun.serve` WS, binary protocol, authoritative sim @ 30Hz,
  topic pub/sub per lobby. Interpolation for remotes + prediction/reconciliation for self.
- **Phase 4 — Central server + anonymous accounts.** `apps/server`: Bun HTTP + Prisma + Postgres. Anon user on
  first play, JWT, stats persistence, news endpoint. `server-game` validates JWT + reports match results.
- **Phase 5 — Menus / lobby UI (Preact).** Live lobby browser, create/join, region selection, account/stats, news.
- **Phase 6 — Bots.** Bot controller feeding inputs into the shared sim (roles, steering, mistakes). Instant-play + fill.
- **Phase 7 — Juice + power-ups.** Particles, screenshake, hitstop, goal celebrations, WebAudio SFX, squash/stretch,
  power-ups in the shared sim. Finalize quality tiers.
- **Phase 8 — Accounts upgrade + monetization.** OAuth (anon → full), cosmetics, portal SDK + rewarded ads,
  leaderboards, daily quests, multi-region deploy.
