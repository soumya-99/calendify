# Calendify 🗓️

> The ultimate, high-performance calendar and task management experience for mobile.

Calendify is a premium, Material-inspired mobile application built with **Expo** and **React Native**. It seamlessly bridges the gap between local hyper-speed productivity and global calendar synchronization. Designed with meticulous attention to detail, smooth animations, and a focus on visual excellence.

---

## ✨ Key Features

### 📅 Advanced Calendar & Planning
- **Squircle Aesthetic**: Modern day-grid with squircle (16px radius) border highlights for an elegant, premium look.
- **Dynamic Views**: Instantly switch between dates with zero-latency transitions.
- **Visual Richness**: High-contrast indicators for Events, Tasks, Reminders, and Birthdays.

### 🔄 Dual-Sync Synchronization
- **Export Local → Device**: Sync your local Calendify accounts directly to your Google or Apple calendars.
- **Import Device → Local**: Pull data from any connected OS calendar into your local Calendify accounts.
- **Safety First**: Intelligent account management prevents the deletion of your last local account, ensuring your data is always reachable.

### 🛠️ Powerful Productivity Tools
- **Triple Entry Types**: Manage **Events**, **Tasks**, and **Reminders** with specialized logic for each.
- **Native Precision**: Integration with `@react-native-community/datetimepicker` for a flawless native date/time picking experience.
- **Enhanced Forms**: Keyboard-aware scrolling combined with optimized chip designs (multi-select without the bulk).

### 🎨 Premium Design & Customization
- **Theme Engine**: Choose from a curated palette including **Teal, Blue, Red, Yellow, Orange, Purple, and Green**.
- **Smooth Navigation**: Custom-built Tab Bar using `withTiming` reanimated logic for silky-smooth active indicators.
- **Haptic Feedback**: Integrated `expo-haptics` for tactile confirmation on every meaningful interaction.

### 🔐 Secure Backup & Restore
- **Privacy Native**: Export your entire application state into an encrypted `.calendify` file.
- **Military Grade**: Backups are secured using **AES-256-GCM** encryption and **HKDF-SHA256** key derivation.
- **One-Tap Restore**: Restore your entire workspace instantly from any backup file.

---

## 🚀 Tech Stack

- **Framework**: [Expo SDK 55](https://expo.dev) + [React Native 0.83](https://reactnative.dev)
- **Navigation**: [Expo Router](https://docs.expo.dev/router/introduction/) (Link-based API)
- **State Management**: [Zustand](https://github.com/pmndrs/zustand)
- **Persistence**: [react-native-mmkv](https://github.com/mrousavy/react-native-mmkv) (High-performance storage)
- **Animations**: [React Native Reanimated 4](https://docs.swmansion.com/react-native-reanimated/)
- **Icons**: [Lucide React Native](https://lucide.dev)
- **Lists**: [@shopify/flash-list](https://shopify.github.io/flash-list/)

---

## 🛠️ Development

### 1. Installation
```bash
npm install
```

### 2. Launch Development Server
```bash
npm run start
```

### 3. Build for Platforms
```bash
# For Android
npm run android

# For iOS (Requires macOS)
npm run ios
```

---

## 📜 Design Philosophy

Calendify is built on the principle of **Visual Harmony**. We avoid generic browser defaults, opting instead for:
- Curated HSL-tailored color palettes.
- Smooth transitions that feel "alive" rather than "bouncy".
- High-efficiency spacing (Spacing tokens from `src/theme/spacing.ts`).
- Material 3 inspired header and card structures.

---

## 🛡️ Security

Your data is yours. Calendify supports local-first storage with optional bi-directional sync. Backups use the modern industry-standard `AES-256-GCM` algorithm via the [@noble/ciphers](https://github.com/paulmillr/noble-ciphers) library, ensuring that sensitive data is unreadable outside of the app.

---

*Built with ❤️ by the Calendify Team.*
