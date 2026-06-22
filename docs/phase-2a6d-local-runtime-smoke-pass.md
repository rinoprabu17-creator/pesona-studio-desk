# Phase 2A.6D - Local Runtime Smoke Pass

Tanggal: 2026-06-22

## Scope

Smoke ini menjalankan checklist runtime lokal dengan batas aman:

- Tidak ada product feature baru.
- Tidak ada scheduler, publisher, auto-posting, atau video generation logic.
- Tidak ada paid cloud dependency baru.
- Tidak ada live OpenAI call.
- Tidak ada reset database/storage.
- Tidak ada `docker compose down -v`.
- Tidak ada penghapusan Docker volume.

## Commands run

```sh
git status --short
docker compose --env-file .env.local -f docker-compose.dev.yml config
docker compose --env-file .env.local -f docker-compose.dev.yml ps
docker compose --env-file .env.local -f docker-compose.dev.yml logs --tail=80 web-app
docker compose --env-file .env.local -f docker-compose.dev.yml logs --tail=80 campaign-planner-worker
docker compose --env-file .env.local -f docker-compose.dev.yml logs --tail=80 video-worker
docker compose --env-file .env.local -f docker-compose.dev.yml logs --tail=80 mockup-worker
docker compose --env-file .env.local -f docker-compose.dev.yml exec -T postgres pg_isready -U pesona -d pesona_studio
docker compose --env-file .env.local -f docker-compose.dev.yml exec -T redis redis-cli ping
curl -fsS http://localhost:3000/
curl -fsS http://localhost:5678/
ls -la storage storage/footage storage/draft-videos storage/approved-videos storage/mockups storage/brand-assets
docker compose --env-file .env.local -f docker-compose.dev.yml exec -T web-app ls -la /app/storage
docker inspect pesona-studio-desk-dev-web-app-1
docker compose --env-file .env.local -f docker-compose.dev.yml exec -T video-worker ls -la /app/storage
docker compose --env-file .env.local -f docker-compose.dev.yml exec -T mockup-worker ls -la /app/storage
npm run db:migrate
curl -fsS -i http://localhost:3000/
npm run db:seed
curl -fsS -i http://localhost:3000/products
curl -fsS -i http://localhost:3000/api/products
docker compose --env-file .env.local -f docker-compose.dev.yml up -d --build
docker compose --env-file .env.local -f docker-compose.dev.yml ps
docker compose --env-file .env.local -f docker-compose.dev.yml exec -T web-app ls -la /app/storage
docker compose --env-file .env.local -f docker-compose.dev.yml exec -T video-worker ls -la /app/storage
docker compose --env-file .env.local -f docker-compose.dev.yml exec -T mockup-worker ls -la /app/storage
curl -fsS -i http://localhost:3000/
docker compose --env-file .env.local -f docker-compose.dev.yml logs --tail=40 web-app
docker compose --env-file .env.local -f docker-compose.dev.yml logs --tail=40 campaign-planner-worker
docker compose --env-file .env.local -f docker-compose.dev.yml logs --tail=40 video-worker
docker compose --env-file .env.local -f docker-compose.dev.yml logs --tail=40 mockup-worker
npm run smoke:campaign-planner-openai
npm run check
```

## Results

| Check | Result |
| --- | --- |
| `.env.local` exists | Pass |
| Docker Compose config renders | Pass |
| Expected services present | Pass |
| Postgres status | Pass: container healthy, `pg_isready` accepting connections |
| Redis status | Pass: container healthy, `redis-cli ping` returned `PONG` |
| Web app | Pass: `http://localhost:3000/` returned `303` to `/products`; `/products` returned `200` |
| n8n | Pass: `http://localhost:5678/` returned n8n UI HTML |
| Campaign Planner provider | Pass: config shows `CAMPAIGN_PLANNER_PROVIDER=fake` |
| OpenAI disabled | Pass: config shows `CAMPAIGN_PLANNER_OPENAI_ENABLED=false` and `OPENAI_MODEL=""` |
| Live OpenAI call | Pass: `npm run smoke:campaign-planner-openai` reported `OPENAI_LIVE_SMOKE=1` not set and made no API call |
| Host storage folders | Pass |
| Container storage mount after sync | Pass for `web-app`, `video-worker`, and `mockup-worker` |
| Migration smoke | Pass: migrations 001-005 skipped as already applied |
| Seed smoke | Pass: products 2, colors 9, offers 8, pain points 6, school level color defaults 6 |
| Full check | Pass: `npm run check` |

## Notes

Containers were already running at the start of the smoke. Initial `docker compose ps` showed all expected services up, with Postgres and Redis healthy.

Initial `/app/storage` checks inside `web-app`, `video-worker`, and `mockup-worker` showed an empty directory even though `docker inspect` listed the bind mount. This was treated as a smoke warning. Running:

```sh
docker compose --env-file .env.local -f docker-compose.dev.yml up -d --build
```

rebuilt images and recreated app/worker containers without deleting volumes. After that, `/app/storage` correctly showed:

- `footage`
- `draft-videos`
- `approved-videos`
- `mockups`
- `brand-assets`
- `README.md`

No `docker compose down -v`, volume removal, database reset, storage deletion, live OpenAI call, publisher, scheduler, auto-posting, or video generation logic was run.

## Final summary

Phase 2A.6D local runtime smoke: pass, with one resolved storage mount warning.
