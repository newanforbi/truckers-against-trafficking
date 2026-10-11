# See it. Snap it. Report it.

A Citizen-style **iOS, Android, and web** witness feed for truckers: snap a photo at a truck stop, pin it on the map, and post it where other drivers and officers can open the picture, the location, and the write-up.

This is an independent project inspired by [Truckers Against Trafficking](https://tatnonprofit.org/). It is **not** the official TAT app, is not affiliated with TAT, and does not replace 911 or the National Human Trafficking Hotline.

## Safety first

If someone is in danger **now**, call **911**. Then tell the hotline so the tip is logged and victims can get services.

| | |
| --- | --- |
| United States emergency | **911** |
| U.S. National Human Trafficking Hotline | **1-888-373-7888** |
| U.S. text tip | **233733** (keyword `HELP`) |
| Canada | **1-833-900-1010** |
| Mexico | **01-800-5533-000** |

**Do not approach** a suspected trafficker. Do not intervene. A photo is only useful if you can take it without putting anyone at risk. When you call, say you are reporting **possible human trafficking**, not prostitution.

This is a witness / report feed for what drivers see at truck stops — including commercial-sex activity that may be trafficking. It is **not** a listings board.

## What it does

| Surface | What you get |
| --- | --- |
| **Home** | Reddit-style `r/truckstops` feed. Sort Hot / New / Near. GPS fills the nearby label. Amber **Post** button opens the camera. |
| **Snap** | Camera or library, title, auto truck-stop location from GPS, then publish. |
| **Thread** | Photo, votes, comments. Officers can mark a tip reviewing, forwarded, or closed. |
| **Learn** | Red-flag indicators (USDOT / TAT-aligned). Do not treat the home feed as a tutorial. |
| **Call** | 911, national hotlines, officer unlock, platform URL, nearby-alert settings. |
| **Nearby alerts** | When a new post lands inside your radius, the app writes an inbox item, shows an amber banner, and can send a phone or browser notification. Authors are not pinged about their own posts. |
| **Officer desk** | Desktop map + photos + case status at `/desk`. |

The public driver map and the officer desk share the same tips. Officer tools stay behind a key.

## Requirements

- **Node.js 20+** and npm
- Two terminals for local demo (API + Expo)
- Optional: [Expo Go](https://expo.dev/go) on a physical iPhone or Android
- Camera, photos, and location permissions on device

No Docker, database, or cloud account is required to run the demo.

## Quick start

```bash
npm install
npm run server
```

In another terminal:

```bash
npm run web
```

Then open:

| URL | What it is |
| --- | --- |
| http://localhost:8081 | App preview (phone frame on a wide desktop) |
| http://localhost:3001/desk | Officer desk |
| http://localhost:3001/api/health | API health |

Demo officer key: **`WATCH`**.

First launch seeds six TAT-aligned truck-stop posts (Limon TA, Iowa 80, Ontario Petro, Knoxville Pilot, Dallas Love’s, Oak Grove TA) so the feed is not empty.

### Phone (Expo Go)

```bash
npm start
```

Scan the QR code with Expo Go. On the **Call** tab, set **Platform URL** to your computer’s LAN address, for example `http://192.168.1.20:3001`. `localhost` on the phone points at the phone, not your laptop.

iOS Simulator / Android emulator:

```bash
npm run ios
npm run android
```

### Nearby alerts

On the Call tab:

1. Leave **Nearby alerts** on.
2. Pick **25 / 50 / 100 / 250** miles.
3. Tap **Send test alert** to see the banner on this device.

A real post from another `reporterId` inside that radius creates the same inbox item and banner. Expo push tokens need an EAS `projectId` in `app.json`; the inbox and in-app banner still work without one. On web, the app also uses the browser Notification API when permission is granted.

## Configuration

| Variable | Default | Purpose |
| --- | --- | --- |
| `PORT` | `3001` | API and officer desk |
| `DATA_DIR` | `./data` | JSON store + photo uploads |
| `OFFICER_KEY` | `WATCH` | Header `x-officer-key` and desk unlock |
| `NODE_ENV` | _(unset)_ | Set to `test` to skip `listen()` |

The app defaults to `http://localhost:3001`. Change it on the Call tab; the value is stored on the device.

## Project layout

```
src/app/                 Expo Router screens (tabs + /tip/[id])
src/components/          Feed cards, banner, map, form controls
src/context/             Session, draft/report, nearby alerts
src/lib/                 API client, geo, notifications, storage
src/data/                Hotlines and red flags
server/index.ts          Express API, uploads, desk, embed map
server/store.ts          Report JSON store
server/subscribers.ts    Device registry + nearby matching
server/push.ts           Expo push (when a token exists)
server/public/           Leaflet desk + map embed
data/                    Local JSON + uploads (gitignored)
```

One TypeScript codebase. Expo SDK 57 / React Native 0.86. Web is a first-class preview, not a separate app.

## HTTP API

Photos: up to **4** files, **8 MB** each, `multipart/form-data` field `photos`.

| Method | Path | Notes |
| --- | --- | --- |
| `GET` | `/api/health` | `{ ok, reports }` |
| `GET` | `/api/reports` | Newest-capable public list |
| `GET` | `/api/reports/:id` | One report |
| `POST` | `/api/reports` | Create (requires lat/lng). Notifies nearby subscribers. |
| `POST` | `/api/reports/:id/vote` | `{ delta: 1 \| -1 }` |
| `POST` | `/api/reports/:id/comments` | `{ author, body }` |
| `PATCH` | `/api/reports/:id` | Officer only. `{ status, officerNotes }` |
| `POST` | `/api/devices/register` | `{ reporterId, latitude, longitude, radiusMiles, enabled, pushToken }` |
| `GET` | `/api/alerts?reporterId=` | Inbox + unread |
| `POST` | `/api/alerts/test` | Demo alert for this device |
| `POST` | `/api/alerts/:id/read` | `{ reporterId }` |
| `GET` | `/desk` | Officer map desk |
| `GET` | `/embed` | Dark Leaflet map used by the app |
| `GET` | `/uploads/:name` | Stored photos |

Officer requests send header `x-officer-key`. Statuses: `new`, `reviewing`, `forwarded`, `closed`.

Nearby matching uses haversine miles. Disabled subscribers and the report author are skipped. Radius is clamped to **5–500** miles (UI offers 25 / 50 / 100 / 250; default **100**).

## Local data

Git ignores `/data`. The server creates it on first run.

| File | Contents |
| --- | --- |
| `data/reports.json` | Tips, votes, comments, seed keys |
| `data/alerts.json` | Device subscribers + inbox |
| `data/uploads/` | Photo files |

This is a **local demo store**, not a production backend. There is no login, no encryption at rest, and no multi-server lock. Do not put real victim-identifying details or production secrets in it.

Restarting the API keeps existing JSON. Deleting `data/` reseeds the six demo posts.

## Scripts

```bash
npm run server      # API on :3001
npm run web         # Expo web on :8081
npm start           # Expo (QR / simulator)
npm test            # node:test (geo, store, alerts, tip formatter)
npm run typecheck   # tsc --noEmit
```

## Limits of this demo

- File-backed JSON, not Postgres / auth / CDN
- Seed photos are placeholders, not field photos
- Expo Go on a phone needs your LAN **Platform URL**
- Real APNs / FCM push needs an EAS project and store build
- Desktop web uses a 390×844 phone frame above 520 px
- Independent of TAT; link drivers to official TAT training and the official TAT app from the Call tab

## Official resources

- [Truckers Against Trafficking](https://tatnonprofit.org/) — free industry training
- [Official TAT app](https://tatnonprofit.org/tat-app/)
- [National Human Trafficking Hotline tip form](https://humantraffickinghotline.org/en/report-trafficking)
- [USDOT trafficking indicators](https://www.transportation.gov/stop-human-trafficking/indicators)

Nothing in this repository replaces 911 or those official channels.

## License

The Expo scaffold is MIT. This project is an unofficial toolkit. TAT, Citizen, and other names belong to their owners.
