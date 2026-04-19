<div align="center">

# 🗓️ Calendify

### The ultimate, high-performance calendar & productivity app for mobile

[![Version](https://img.shields.io/badge/version-1.0.1-6C63FF?style=for-the-badge&logo=git&logoColor=white)](https://github.com/soumya-99/calendify/releases)
[![Expo SDK](https://img.shields.io/badge/Expo_SDK-55-000020?style=for-the-badge&logo=expo&logoColor=white)](https://expo.dev)
[![React Native](https://img.shields.io/badge/React_Native-0.83-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactnative.dev)
[![Platform](https://img.shields.io/badge/Platform-Android%20%7C%20iOS-brightgreen?style=for-the-badge&logo=android&logoColor=white)](https://reactnative.dev)
[![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://typescriptlang.org)

---

*A beautifully crafted, local-first calendar app with OS bidirectional sync, encrypted backups, haptic feedback, and a premium Material-inspired design.*

</div>

---

## ✨ Features

### 📅 Calendar & Scheduling

- **Smart Monthly Grid** — High-performance month view with squircle date highlights, dot indicators per entry type, and "today" accent rings
- **Multi-entry support** — Events, Tasks, Reminders, and Birthdays, each with distinct visual representation
- **Instant navigation** — Swipe between months with smooth transitions; jump to any date instantly

### 🔄 Bidirectional OS Calendar Sync

- **Export Local → Device Calendar** — Push your Calendify entries to any connected Google or Apple calendar
- **Import Device → Local** — Pull events from any OS calendar into your local Calendify accounts
- **Per-account sync** — Choose which local account maps to which device calendar via the sync picker
- **Confirmation guards** — All sync and import operations show an alert before executing

### 🛠️ Productivity Suite

| Entry Type | Features |
|---|---|
| 📆 **Events** | Title, All-Day toggle, Start/End time, Repeat rules, Color tag, Notes, Calendar sync |
| 📝 **Tasks** | Title, Due date, Priority (Low / Medium / High), Color tag, Notes, Calendar sync |
| 🔔 **Reminders** | Title, Date, Time, Repeat rules, Color tag, Notes, Calendar sync |
| 🎂 **Birthdays** | Name-based birthday entries with annual repeat |

### 🎨 Design & Theming

- **7 color schemes** — Teal · Blue · Red · Yellow · Orange · Purple · Green
- **Dark / Light / System** — Follows system theme or manually overridden
- **Smooth animations** — `withTiming`-based tab bar active pill, squircle calendar selection, micro-press scale effects on every button
- **Haptic feedback** — Lightweight, selection, and success haptics on all meaningful interactions
- **Custom Tab Bar** — Fully animated, filled active pill with white icon; central FAB for quick entry creation

### 🔐 Security & Data

- **Encrypted backups** — Your data is secured with `AES-256-GCM` encryption and `HKDF-SHA256` key derivation and exported as a `.calendify` file
- **Encrypted restore** — Import `.calendify` files — unreadable outside the app
- **Local-first storage** — All data lives on-device in [MMKV](https://github.com/mrousavy/react-native-mmkv), the fastest React Native storage available
- **Clear data** — One-tap destructive clear with confirmation alert
- **Safe account deletion** — Cannot delete the default account; must reassign first

### 📱 UX & Accessibility

- **Keyboard-aware forms** — All entry forms scroll above the keyboard using `KeyboardAwareFormScrollView`
- **Native date/time picker** — Uses `@react-native-community/datetimepicker` for OS-native date/time selection
- **Scrollable dropdowns** — Calendar sync picker is fully scrollable when many calendars are connected
- **No text clipping** — All chips and labels use `numberOfLines={1}` with `ellipsizeMode` to prevent wraps

---

## 🏗️ Tech Stack

| Layer | Technology | Version |
|---|---|---|
| Framework | [Expo](https://expo.dev) | `^55.0.15` |
| Runtime | [React Native](https://reactnative.dev) | `0.83.4` |
| Language | TypeScript | `~5.9.2` |
| Navigation | [Expo Router](https://docs.expo.dev/router/introduction/) | `~55.0.12` |
| State | [Zustand](https://github.com/pmndrs/zustand) | `^5.0.12` |
| Storage | [react-native-mmkv](https://github.com/mrousavy/react-native-mmkv) | `^4.3.1` |
| Animations | [React Native Reanimated](https://docs.swmansion.com/react-native-reanimated/) | `^4.3.0` |
| Lists | [@shopify/flash-list](https://shopify.github.io/flash-list/) | `2.0.2` |
| Icons | [Lucide RN](https://lucide.dev) | `^1.8.0` |
| Date/Time Picker | [@react-native-community/datetimepicker](https://github.com/react-native-datetimepicker/datetimepicker) | `^9.1.0` |
| Calendar Access | [expo-calendar](https://docs.expo.dev/versions/latest/sdk/calendar/) | `~55.0.14` |
| Encryption | [@noble/ciphers](https://github.com/paulmillr/noble-ciphers) + [@noble/hashes](https://github.com/paulmillr/noble-hashes) | `^2.2.0` |
| ID Generation | [nanoid](https://github.com/ai/nanoid) | `^5.1.9` |
| Schema | [Zod](https://zod.dev) | `^4.3.6` |

---

## 🚀 Getting Started

### Prerequisites

- Node.js `22.x`
- Java `17` (for Android builds)
- Android Studio / Xcode (for native builds)

### Installation

```bash
git clone https://github.com/soumya-99/calendify.git
cd calendify
npm install
```

### Development

```bash
# Start Metro bundler
npm run start

# Run on Android (native build)
npm run android

# Run on iOS (native build)
npm run ios

# Run in browser
npm run web
```

### Build

```bash
# Generate native project files
npm run prebuild

# Build release APK (Android)
cd android && ./gradlew assembleRelease
```

### Lint

```bash
npm run lint
```

---

## 📁 Project Structure

```
calendify/
├── app/                    # Expo Router screens & layouts
│   ├── (tabs)/             # Tab screens (home, reminders, settings)
│   ├── add/                # Entry creation forms (event, task, reminder)
│   └── event/[id].tsx      # Dynamic event detail screen
├── src/
│   ├── components/         # Reusable UI components
│   │   ├── bottomnav/      # Custom animated tab bar
│   │   ├── calendar/       # CalendarGrid, CalendarDay, DotIndicators
│   │   ├── sheets/         # AddEntrySheet bottom sheet
│   │   └── ui/             # HapticButton, CalendarPicker, FormDateTimePicker…
│   ├── stores/             # Zustand state stores (events, accounts, theme, calendar)
│   ├── hooks/              # Custom hooks (useThemeColors, useHaptics…)
│   ├── utils/              # Helpers (generateId, dateHelpers, encryptedBackup…)
│   ├── types/              # Shared TypeScript types
│   └── theme/              # Design tokens (spacing, typography, motion)
├── assets/                 # Images and fonts
├── android/                # Native Android project
└── .github/workflows/      # CI/CD: automated APK build & GitHub Release
```

---

## 📦 CI / CD

The repository includes a GitHub Actions workflow (`.github/workflows/release.yml`) that:

1. Installs dependencies with `npm ci`
2. Runs `expo prebuild --platform android --clean`
3. Builds a release APK via `./gradlew assembleRelease`
4. Uploads the APK as a workflow artifact (7-day retention)
5. Creates a versioned **GitHub Release** (`v1.0.<run_number>`) with auto-generated release notes

Triggers on every push to `main`.

---

## 🛡️ Security

Your personal data never leaves your device unless you explicitly trigger an export. Backup files use:

- **`AES-256-GCM`** — Authenticated encryption (tamper-proof)
- **`HKDF-SHA256`** — Secure cryptographic key derivation
- **`.calendify`** — Proprietary encrypted file format, unreadable without the app

---

## 🗺️ Roadmap

- [ ] Birthday import from device contacts
- [ ] Widget support (Android/iOS)
- [ ] Recurring event editing (this / all / future)
- [ ] Google Calendar OAuth sign-in
- [ ] iCal (`.ics`) import / export
- [ ] Notification scheduling for reminders

---

<div align="center">

Built with ❤️ using **Expo** · **React Native** · **Reanimated** · **MMKV**

</div>
