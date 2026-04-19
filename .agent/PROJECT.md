# PROJECT.md — Calendify

> **Project:** Calendify — A full-fledged Google Calendar clone built with Expo + React Native.
> **Platform:** Android & iOS (bleeding-edge, Expo SDK 55+)
> **Storage:** React Native MMKV (no backend, ever)
> **State:** Zustand
> **Animations:** React Native Reanimated 3

---

## 1. Project Overview

Calendify is a **zero-backend** personal calendar application that rivals Google Calendar in features while exceeding it in design polish. It handles reminders, tasks, events, birthdays, multi-account management, import/export (`.calendify` + `.ics`), and a Material You dynamic theming system — all stored locally via MMKV.

---

## 2. Directory Structure

```
calendify/
├── app/                          # Expo Router file-based routing
│   ├── (tabs)/
│   │   ├── _layout.tsx           # Bottom tab navigator (custom)
│   │   ├── index.tsx             # Home — Monthly Calendar
│   │   ├── reminders.tsx         # Reminders screen
│   │   ├── tasks.tsx             # Tasks & Events screen
│   │   ├── birthdays.tsx         # Birthdays screen
│   │   └── settings.tsx          # Settings screen
│   ├── day/[date].tsx            # Day detail screen (event list)
│   ├── event/[id].tsx            # Single event/task detail
│   ├── add/
│   │   ├── _layout.tsx
│   │   ├── reminder.tsx
│   │   ├── task.tsx
│   │   ├── event.tsx
│   │   └── birthday.tsx
│   └── _layout.tsx               # Root layout (theme provider etc.)
│
├── src/
│   ├── components/
│   │   ├── calendar/
│   │   │   ├── CalendarGrid.tsx          # Main monthly grid
│   │   │   ├── CalendarDay.tsx           # Individual day cell
│   │   │   ├── CalendarHeader.tsx        # Month/Year + nav arrows
│   │   │   ├── DotIndicators.tsx         # Colored dots per day
│   │   │   └── WeekDayLabels.tsx         # Mon–Sun header row
│   │   ├── bottomnav/
│   │   │   ├── CustomTabBar.tsx          # Fully custom bottom nav
│   │   │   ├── TabBarIcon.tsx            # Animated icon+label
│   │   │   └── FABButton.tsx             # Central circular FAB (+)
│   │   ├── sheets/
│   │   │   ├── AddEntrySheet.tsx         # Bottom sheet: pick type
│   │   │   └── QuickActionSheet.tsx      # Long-press context sheet
│   │   ├── cards/
│   │   │   ├── EventCard.tsx             # Reusable event row card
│   │   │   ├── ReminderCard.tsx
│   │   │   ├── TaskCard.tsx
│   │   │   └── BirthdayCard.tsx
│   │   ├── lists/
│   │   │   ├── DayEventList.tsx          # Scrollable event list for day view
│   │   │   └── SectionedList.tsx         # Generic sectioned flat list
│   │   ├── forms/
│   │   │   ├── DateTimePicker.tsx
│   │   │   ├── RepeatPicker.tsx
│   │   │   ├── ColorTagPicker.tsx
│   │   │   └── AccountSelector.tsx
│   │   ├── accounts/
│   │   │   ├── AccountChip.tsx
│   │   │   ├── AccountList.tsx
│   │   │   └── AddAccountModal.tsx
│   │   └── ui/
│   │       ├── AnimatedScreen.tsx        # Screen entry animation wrapper
│   │       ├── HapticButton.tsx          # Button with haptic feedback
│   │       ├── Chip.tsx
│   │       ├── Divider.tsx
│   │       ├── EmptyState.tsx
│   │       └── LoadingSpinner.tsx
│   │
│   ├── stores/                           # Zustand stores
│   │   ├── useCalendarStore.ts           # Selected date, view state
│   │   ├── useEventsStore.ts             # All events/tasks/reminders/birthdays
│   │   ├── useAccountsStore.ts           # Multiple email accounts
│   │   ├── useThemeStore.ts              # Theme: system | light | dark | blue
│   │   └── useSettingsStore.ts           # App preferences
│   │
│   ├── hooks/
│   │   ├── useThemeColors.ts             # Resolves current palette
│   │   ├── useHaptics.ts                 # Haptic feedback helpers
│   │   ├── useCalendarData.ts            # Derived: events by date
│   │   ├── useAnimatedTab.ts             # Tab slide animation logic
│   │   └── useMMKV.ts                    # Typed MMKV helpers
│   │
│   ├── theme/
│   │   ├── MaterialYou.ts                # Dynamic color extraction (OS)
│   │   ├── colorSchemes.ts               # Light / Dark / Blue palettes
│   │   ├── typography.ts                 # Font scale (M3 type system)
│   │   ├── spacing.ts                    # 4pt grid tokens
│   │   ├── motion.ts                     # Reanimated presets (spring configs)
│   │   └── index.ts                      # Re-exports everything
│   │
│   ├── utils/
│   │   ├── dateHelpers.ts                # Pure date utilities (no dayjs side effects)
│   │   ├── colorDotMap.ts                # Entry type → dot color mapping
│   │   ├── calendifyFormat.ts            # .calendify serialise/deserialise
│   │   ├── icsFormat.ts                  # .ics import/export (RFC 5545)
│   │   ├── generateId.ts                 # nanoid wrapper
│   │   └── validators.ts                 # Zod schemas for all entry types
│   │
│   ├── constants/
│   │   ├── entryTypes.ts                 # REMINDER | TASK | EVENT | BIRTHDAY
│   │   ├── dotColors.ts                  # Semantic color constants
│   │   └── mmkvKeys.ts                   # All MMKV storage key strings
│   │
│   └── types/
│       ├── calendar.ts
│       ├── entries.ts
│       ├── accounts.ts
│       └── theme.ts
│
├── assets/
│   ├── fonts/
│   └── icons/
│
├── .husky/
│   ├── pre-commit                        # lint-staged
│   └── commit-msg                        # commitlint
│
├── app.json
├── babel.config.js
├── tsconfig.json
├── package.json
├── .eslintrc.js
├── .prettierrc
├── commitlint.config.js
├── lint-staged.config.js
└── DESIGN.md
```

---

## 3. Tech Stack (Bleeding Edge Versions)

| Package | Purpose | Notes |
|---|---|---|
| `expo` ~55 | Core framework | SDK 55, New Architecture enabled |
| `expo-router` ~4 | File-based routing | Typed routes |
| `react-native` | Base RN | New Arch (JSI, Fabric) |
| `react-native-mmkv` ^3 | Local storage | Replaces AsyncStorage entirely |
| `zustand` ^5 | State management | With MMKV persistence middleware |
| `react-native-reanimated` ^3 | Animations | Worklet-based, 60/120fps |
| `react-native-gesture-handler` ^2 | Gestures | RNGH v2, New Arch compatible |
| `lucide-react-native` latest | Icons | SVG-based, consistent |
| `expo-haptics` | Haptic feedback | iOS Taptic + Android vibration |
| `@material/material-color-utilities` | Material You | Dynamic color from OS wallpaper |
| `expo-sharing` | File share | For `.calendify` / `.ics` export |
| `expo-document-picker` | File import | For `.calendify` / `.ics` import |
| `expo-file-system` | Read/write files | Temp storage for import/export |
| `dayjs` | Date manipulation | Lightweight, with plugins |
| `zod` | Schema validation | Entry type validation |
| `nanoid/non-secure` | ID generation | Lightweight unique IDs |
| `husky` ^9 | Git hooks | pre-commit + commit-msg |
| `lint-staged` | Staged file linting | Runs ESLint + Prettier on commit |
| `commitlint` | Commit message lint | Conventional commits |
| `@typescript-eslint/*` | TypeScript linting | Strict mode |

---

## 4. Architecture Principles

### 4.1 No Backend — Ever
- **ALL** data lives in MMKV. No API calls, no network requests, no Firebase.
- MMKV keys are namespaced constants from `src/constants/mmkvKeys.ts`.
- Zustand stores hydrate from MMKV on app boot via a `persist` middleware that uses MMKV as the storage engine.
- Never use `AsyncStorage`. Never use `SQLite` unless explicitly approved.

### 4.2 State Management Pattern
```
MMKV (disk) ←→ Zustand store (memory) ←→ React component (UI)
```
- Zustand stores are the **single source of truth** in memory.
- Every write to a Zustand store triggers a synchronous MMKV write.
- Components **never** read MMKV directly — always via store selectors.

### 4.3 Component Rules
- Every visual element that appears more than once **must** be a reusable component.
- Components in `src/components/ui/` are **primitive** (no domain logic).
- Components in `src/components/cards/`, `lists/`, etc. are **domain-aware**.
- No inline styles. All styling via theme tokens (`useThemeColors` hook).
- No hardcoded colors. Every color comes from the resolved theme palette.

### 4.4 Animation Rules
- **All** animations use `react-native-reanimated` 3 worklets (run on UI thread).
- Never use the JS-thread animation API (`Animated` from React Native core).
- Spring configs live in `src/theme/motion.ts` — never inline spring values.
- Screen transitions: slide from right (push), slide down (modal), fade (tab switch).
- Tab bar transitions: shared position animated value with `withSpring`.
- Use `useReducedMotion()` from Reanimated — respect the OS accessibility setting.

### 4.5 Haptics
- Wrap **every** interactive tap in `useHaptics` hook.
- FAB: `ImpactFeedbackStyle.Heavy`
- Tab switch: `ImpactFeedbackStyle.Light`
- Delete/destructive: `NotificationFeedbackType.Warning`
- Success save: `NotificationFeedbackType.Success`

---

## 5. Data Models

### CalendarEntry (base)
```typescript
interface CalendarEntry {
  id: string;           // nanoid
  type: EntryType;      // 'REMINDER' | 'TASK' | 'EVENT' | 'BIRTHDAY'
  title: string;
  date: string;         // ISO 8601 date: 'YYYY-MM-DD'
  accountId: string;    // which account owns this
  colorTag: string;     // hex color for dot indicator
  notes?: string;
  createdAt: string;    // ISO timestamp
  updatedAt: string;
}
```

### Reminder extends CalendarEntry
```typescript
interface Reminder extends CalendarEntry {
  type: 'REMINDER';
  time: string;         // 'HH:mm'
  repeat: RepeatRule;
  notified: boolean;
}
```

### Task extends CalendarEntry
```typescript
interface Task extends CalendarEntry {
  type: 'TASK';
  time?: string;
  dueDate?: string;
  completed: boolean;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
}
```

### Event extends CalendarEntry
```typescript
interface Event extends CalendarEntry {
  type: 'EVENT';
  startTime: string;
  endTime: string;
  location?: string;
  repeat: RepeatRule;
  allDay: boolean;
  attendees?: string[];
}
```

### Birthday extends CalendarEntry
```typescript
interface Birthday extends CalendarEntry {
  type: 'BIRTHDAY';
  personName: string;
  birthYear?: number;   // optional, for age calculation
  contactId?: string;   // link to phone contact
}
```

### Account
```typescript
interface Account {
  id: string;
  email: string;
  displayName: string;
  avatarColor: string;  // assigned dynamically
  isDefault: boolean;
  provider: 'local' | 'google_manual' | 'outlook_manual';
}
```

---

## 6. Theming System

### 6.1 Theme Modes
| Mode | Description |
|---|---|
| `system` | Material You — extract seed color from OS wallpaper via `@material/material-color-utilities`. Light/dark follows system dark mode toggle. |
| `light` | Material You light scheme with default teal/green seed. |
| `dark` | Material You dark scheme with default teal/green seed. |
| `blue` | Hardcoded Material 3 blue palette (seed: `#1A73E8`). |

### 6.2 Color Tokens (always reference these, never hardcode)
```typescript
// From useThemeColors()
{
  primary, onPrimary, primaryContainer, onPrimaryContainer,
  secondary, onSecondary, secondaryContainer, onSecondaryContainer,
  tertiary, onTertiary, tertiaryContainer, onTertiaryContainer,
  error, onError, errorContainer, onErrorContainer,
  background, onBackground,
  surface, onSurface, surfaceVariant, onSurfaceVariant,
  outline, outlineVariant,
  inverseSurface, inverseOnSurface, inversePrimary,
  scrim, shadow,
  // Dot semantic colors
  dotReminder, dotTask, dotEvent, dotBirthday,
}
```

### 6.3 Tab Active Colors
Each tab has a unique accent that activates on selection:
- **Home**: `primary` (Material You seed color)
- **Reminders**: `#F4A261` (warm amber)
- **Tasks**: `#52B788` (emerald green)
- **Birthdays**: `#E76F51` (coral)
- **Settings**: `#9B72CF` (soft violet)

---

## 7. Bottom Navigation Spec

- Custom-built `CustomTabBar.tsx` — **not** the default Expo Router tab bar.
- 5 tabs + 1 central FAB (physically between tab 2 and 3).
- Tab structure: `[Home] [Reminders] [⊕] [Birthdays] [Settings]` — Tasks is a virtual tab accessed from FAB sheet, or optionally: `[Home] [Reminders] [⊕] [Tasks] [Birthdays] [Settings]` — implement as 5 tabs + FAB notch.
- **FAB**: Large circular button, 56×56dp, elevated with `shadowColor` + `elevation: 8`, color = `primaryContainer`.
- The tab bar has a **notch cutout** behind the FAB (SVG or canvas path).
- Tab slide animation: a `SharedValue` position that drives an animated pill/indicator sliding horizontally with `withSpring({ damping: 20, stiffness: 180 })`.
- Active tab label fades in with `withTiming(1, { duration: 200 })`.
- Each tab icon scales up slightly on activation: `withSpring(1.15)`.

---

## 8. Calendar Grid Spec

- **Custom-built** — do not use any calendar library.
- 7-column grid, weeks as rows.
- Days outside the current month: rendered with `onSurfaceVariant` at 35% opacity.
- Today's date: filled circle in `primary` color, text in `onPrimary`.
- Selected date: outlined circle in `primary`, text in `primary`.
- Each day cell is `TouchableOpacity` wrapped in `Animated.View` for press scale (`withSpring(0.92)` on press-in, `withSpring(1.0)` on press-out).
- Below each day number: up to 3 dot indicators (`DotIndicators.tsx`), with `+N` text if more than 3.
- Month-to-month navigation: horizontal swipe gesture + left/right chevrons. Swipe uses `PanGestureHandler` → `withSpring` translate + opacity cross-fade.
- Calendar header shows month name + year in `displayLarge` typography.

---

## 9. Screen Transitions

| Transition | Animation |
|---|---|
| Tab → Tab | Horizontal slide (`withSpring`) + fade |
| Home → Day Detail | Shared element: the day cell expands upward |
| Any → Add screens | Modal slide-up from bottom (`withSpring(0)` from `height`) |
| Settings sub-screens | Slide from right (standard push) |
| Back | Reverse of push, with `withSpring` |

All transitions respect `useReducedMotion()` — fall back to instant opacity swap.

---

## 10. Import / Export

### `.calendify` Format
Custom JSON format for full data portability:
```json
{
  "version": "1.0",
  "exportedAt": "ISO timestamp",
  "accounts": [...],
  "entries": [...],
  "settings": { ... }
}
```
- Export: serialize entire MMKV state → JSON → write temp file → `expo-sharing`.
- Import: read file → `expo-document-picker` → validate with Zod → merge or replace.

### `.ics` Format (RFC 5545)
- Export individual events as `VEVENT` components.
- Import `.ics` files: parse `VEVENT` blocks, map to `Event` type, assign to selected account.
- Use a minimal hand-rolled parser (no heavy ical libraries) to keep bundle size lean.

---

## 11. Multi-Account Management

- Up to 10 accounts supported.
- Each account has a unique `avatarColor` chosen from a predefined palette of 10 colors.
- Entries are always associated with an `accountId`.
- In Settings → Accounts: add, rename, set default, delete (with confirmation + re-assign orphaned entries dialog).
- Calendar view can be filtered by account via chip row above the calendar grid.
- Account chips use `secondaryContainer` background with account `avatarColor` left border.

---

## 12. Husky + Git Hooks Setup

```bash
# .husky/pre-commit
npx lint-staged

# .husky/commit-msg
npx --no -- commitlint --edit "$1"
```

```js
// lint-staged.config.js
module.exports = {
  '*.{ts,tsx}': ['eslint --fix', 'prettier --write'],
  '*.{json,md}': ['prettier --write'],
};
```

```js
// commitlint.config.js
module.exports = {
  extends: ['@commitlint/config-conventional'],
};
```

Commit format: `type(scope): message`
Valid types: `feat`, `fix`, `chore`, `refactor`, `style`, `test`, `docs`, `perf`.

---

## 13. Coding Standards

### TypeScript
- Strict mode enabled (`"strict": true` in `tsconfig.json`).
- No `any`. Use `unknown` and narrow properly.
- All Zustand store selectors must be typed.
- All MMKV values must have a typed getter/setter in `useMMKV.ts`.

### Naming Conventions
| Thing | Convention | Example |
|---|---|---|
| Components | PascalCase | `CalendarDay.tsx` |
| Hooks | camelCase, `use` prefix | `useThemeColors.ts` |
| Stores | camelCase, `use` prefix | `useEventsStore.ts` |
| Constants | SCREAMING_SNAKE or camelCase | `MMKV_KEYS`, `dotColors` |
| Types/Interfaces | PascalCase | `CalendarEntry` |
| Files | Match export name | Component name = file name |

### ESLint Rules (strict)
- `react-hooks/exhaustive-deps`: error
- `@typescript-eslint/no-explicit-any`: error
- `@typescript-eslint/no-unused-vars`: error
- `react-native/no-inline-styles`: error
- `import/order`: error (auto-sorted)

---

## 14. Performance Guidelines

- `useMemo` / `useCallback` on all expensive calendar computations (generating grid cells, filtering events).
- `FlashList` (from `@shopify/flash-list`) instead of `FlatList` for event lists.
- MMKV reads are synchronous — never do them inside render. Cache in Zustand.
- Reanimated worklets: keep them pure (no closures capturing React state).
- Avoid re-renders: use Zustand slice selectors, not whole-store subscriptions.
- Image/avatar assets: use `expo-image` for caching.

---

## 15. Accessibility

- All interactive elements: `accessibilityLabel`, `accessibilityRole`, `accessibilityHint`.
- Minimum touch target: 44×44dp.
- Color is **never** the sole differentiator — always pair with icon or text.
- Dynamic text sizes: use `useWindowDimensions` + M3 type scale, don't hardcode font sizes.
- Respect `reduceMotion` from OS — check via `useReducedMotion()`.

---

## 16. Development Workflow

```bash
# Setup
npx create-expo-app@latest calendify --template expo-template-blank-typescript
cd calendify
npm install

# Start
npx expo start --clear

# Run on device
npx expo run:android
npx expo run:ios

# Type check
npx tsc --noEmit

# Lint
npx eslint . --ext .ts,.tsx

# Format
npx prettier --write .
```

---

## 17. Environment / Config Notes

- `app.json`: set `"newArchEnabled": true` under `expo`.
- `babel.config.js`: must include `react-native-reanimated/plugin` as **last** plugin.
- MMKV: works out of the box with New Architecture. No additional native setup needed.
- Gesture Handler: wrap root in `<GestureHandlerRootView style={{ flex: 1 }}>`.
- For Material You on Android: use `DynamicColorIOS` on iOS + `@material/material-color-utilities` for both platforms to compute the full M3 color scheme from a seed color.

---

*Last updated: Calendify v1.0 — AGENT.md*