# See it. Snap it. Report it.

A cross-platform **iOS and Android** field toolkit for truckers and the traveling public. One Expo / React Native codebase. Recognize trafficking red flags, snap evidence only when it is safe, and read a structured tip to 911 or the National Human Trafficking Hotline.

This repository is an independent project inspired by [Truckers Against Trafficking](https://tatnonprofit.org/)’s public campaign. It is **not** the official TAT app.

## What the app does

- **See it** — Highway and truck-stop red flags from public TAT and U.S. DOT materials
- **Snap it** — Camera or photo library, plus GPS, mile marker, vehicles, and people
- **Report it** — One-tap 911, U.S. / Canada / Mexico hotlines, SMS to 233733, copy or share a scripted tip
- Drafts stay on the device. Nothing is uploaded to a custom server.

Emergency: **911**. U.S. hotline: **1-888-373-7888**. Text: **233733**. Canada: **1-833-900-1010**.

## Run it on a phone

You do not need Xcode or Android Studio to try the app.

1. Install [Node.js LTS](https://nodejs.org/).
2. Install dependencies:

```bash
npm install
```

3. Start Expo:

```bash
npm start
```

4. Install **Expo Go** on your iPhone or Android phone, then scan the QR code.

```bash
npm run ios      # macOS + Xcode / Expo Go
npm run android  # Android emulator or Expo Go
npm run web      # browser preview
```

## Store builds

When you are ready for TestFlight or Play Console:

```bash
npx eas-cli@latest login
npx eas-cli@latest build --platform ios
npx eas-cli@latest build --platform android
```

## Checks

```bash
npm test
npm run typecheck
```

## Safety

Do not approach a suspected trafficker. Do not try to rescue someone yourself. If you cannot take a photo safely, skip it and still call.
