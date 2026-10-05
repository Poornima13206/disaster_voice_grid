# Disaster Voice Grid

Citizens record a voice report in 10 Indian languages → Sarvam **STT** → **Chat** (structured extraction) → incident clustering in Postgres → Sarvam **TTS** spoken confirmation. Control-room staff see incidents on a Leaflet map and can verify / assign / resolve.

Stack: Next.js 14 (App Router, TS), Tailwind, Prisma + PostgreSQL, react-leaflet, JSON-based i18n (`locales/*.json`).
Languages: en, hi, kn, ta, te, ml, bn, mr, gu, or (UI + STT + TTS + translation).

## Environment variables
Copy `.env.example` to `.env`:

| Var | Purpose |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `SARVAM_API_BASE_URL` | e.g. `https://api.sarvam.ai` |
| `SARVAM_API_KEY` | Sarvam API subscription key |

## Run locally
```bash
npm install
cp .env.example .env        # then edit values
npx prisma migrate dev --name init
npm run seed                # optional: 3 sample incidents
npm run dev                 # http://localhost:3000
```

## Test the full flow
1. Open `/report`, pick a language, allow the mic, tap the mic, speak (e.g. "Water has entered our house in Kuttanad, 5 people including 2 children need a boat"), tap stop.
2. Watch Uploading → Processing → success; the spoken confirmation plays.
3. Open `/dashboard`: the incident appears (similar reports for the same issue + location merge into one incident). Click a card to fly the map to it; use Verify / Assign (type a team) / Resolve.
4. `/incidents/<id>` shows transcripts and AI summaries per report.

## Notes
- Sarvam endpoints/models used (in `lib/sarvam.ts`): `/speech-to-text` (`saarika:v2.5`), `/v1/chat/completions` (`sarvam-m`), `/translate` (`mayura:v1`), `/text-to-speech` (`bulbul:v2`, speaker `anushka`). Odia is `od-IN` in Sarvam. Model names change over time, so check Sarvam's docs and edit the constants if a call returns 4xx.
- The spoken confirmation text is pre-translated in each locale file (`feedbackMessage`) for reliability; `translateText` is also exposed and used for the English transcript.
- If TTS fails, the report still succeeds and a warning is shown.
- Audio is stored as base64 data URLs in Postgres (demo only). Map pins use an offline city lookup + deterministic jitter (`lib/geo.ts`), so swap in a real geocoder for production.
- No auth: see the `AUTH:` comments in `app/api/incidents/[id]/*` and add middleware there.
- Recording needs HTTPS or `localhost` (browser mic requirement).
