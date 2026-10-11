# See it. Snap it. Report it.

A Citizen-style **iOS, Android, and web** platform for truckers: snap a photo at a truck stop, pin it on the map, and post it where officers can open the picture, the location, and the write-up.

This is an independent project inspired by [Truckers Against Trafficking](https://tatnonprofit.org/). It is **not** the official TAT app.

## What it does

- **Home** — Reddit-style feed of truck-stop reports. Location fills from GPS. Sort by hot, new, or near.
- **Post** — Camera or library, auto truck-stop location, then publish to the feed
- **Thread** — Photo, votes, comments. Officers can still update case status.
- **Call** — 911, national hotlines, and nearby push alerts
- **Nearby alerts** — when a new post lands inside your radius, the app shows a banner and can send a phone notification. Authors are not pinged about their own posts.

Emergency: **911**. U.S. hotline: **1-888-373-7888**. Text: **233733**.

Do not approach a suspected trafficker. A photo is only useful if you can take it without putting anyone at risk.

## Run the platform

```bash
npm install
npm run server
```

In another terminal:

```bash
npm run web
```

Or on a phone: `npm start` and scan the QR code with Expo Go.

- App preview: http://localhost:8081
- Officer desk: http://localhost:3001/desk
- Demo officer key: `WATCH`

If you open Expo Go on a physical phone, set **Platform URL** on the Call tab to your computer’s LAN address, for example `http://192.168.1.20:3001`.

Turn on **Nearby alerts** on the Call tab and pick 25 / 50 / 100 / 250 miles. Use **Send test alert** to see the banner on this device. Real Expo push tokens need an EAS `projectId`; the inbox and in-app banner still work without one.

## Checks

```bash
npm test
npm run typecheck
```

Tips are stored in `data/reports.json` and photos in `data/uploads/`. Nothing here replaces 911 or the official hotline.
