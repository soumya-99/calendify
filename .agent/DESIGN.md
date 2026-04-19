# DESIGN.md — Calendify Design System

> **Design Philosophy:** Material You (M3) × Organic softness × Buttery motion.
> Calendify feels alive — it breathes, responds to touch, and adapts to the user's OS personality. Nothing is boxy. Everything flows.

---

## 1. Design Language

### 1.1 Core Principles

| Principle | Expression |
|---|---|
| **Organic** | Rounded corners everywhere. No 90° harsh edges. Minimum `borderRadius: 16`, prefer 24–28 for cards. |
| **Adaptive** | Material You dynamic color extracted from OS wallpaper. The app feels personal. |
| **Responsive** | Every touch has a haptic + visual response within 16ms. |
| **Breathable** | Generous whitespace. The calendar grid never feels cramped. |
| **Delightful** | Micro-animations on every state change. Nothing snaps — everything springs. |

### 1.2 Visual Identity

- **Shape language**: Pill shapes, stadium buttons, squircle day cells, fluid bottom sheet curves.
- **Elevation model**: Tonal elevation (M3) — surfaces get lighter/darker via `surfaceTint`, not harsh shadows.
- **Iconography**: Lucide React Native — 20px stroke icons, `strokeWidth={1.75}`, consistent throughout.
- **Motion personality**: Spring-dominant. Overshoot slightly. Feel like physical objects.

---

## 2. Color System

### 2.1 Material You Dynamic Palette

The app uses `@material/material-color-utilities` to generate a full M3 color scheme from a single **seed color**. On Android 12+, this seed is extracted from the user's wallpaper via `DynamicColorAndroid`. On iOS and older Android, use a default teal seed (`#4CAF9A`).

```
Seed Color → TonalPalette → ColorScheme (light/dark)
                              ↓
                    All UI colors resolved
```

### 2.2 Semantic Color Roles

```
┌─────────────────────────────────────────────────────────┐
│  PRIMARY          Used for: FAB, active tab, today ring  │
│  ON_PRIMARY       Text/icons on primary surfaces         │
│  PRIMARY_CONT.    FAB container, chip selected bg        │
│                                                          │
│  SECONDARY        Accent chips, account pills            │
│  TERTIARY         Birthdays accent, highlights           │
│                                                          │
│  SURFACE          Card backgrounds, bottom nav bg        │
│  SURFACE_VAR.     Input fields, divider fills            │
│  ON_SURFACE       Body text                              │
│  ON_SURF_VAR.     Secondary text, placeholders           │
│                                                          │
│  BACKGROUND       App root background                    │
│  OUTLINE          Borders, inactive states               │
│  OUTLINE_VAR.     Subtle dividers                        │
└─────────────────────────────────────────────────────────┘
```

### 2.3 Entry Type Dot Colors

These are **fixed** semantic colors, consistent across all themes:

| Entry Type | Dot Color | Hex | Usage |
|---|---|---|---|
| `REMINDER` | Amber | `#FFB300` | Bell-shaped reminder |
| `TASK` | Emerald | `#43A047` | Checkbox task |
| `EVENT` | Sapphire | `#1E88E5` | Calendar event |
| `BIRTHDAY` | Coral | `#E64A19` | Birthday cake |
| `HOLIDAY` | Lavender | `#8E24AA` | Public holiday |

Dots are 6×6dp filled circles with `borderRadius: 3`. Maximum 3 shown per day cell; overflow shows `+N` in `caption` style.

### 2.4 Tab Active Colors

```typescript
const TAB_COLORS = {
  home:      { active: '#primary',  /* Material You primary */ },
  reminders: { active: '#F4A261' }, // Warm amber
  tasks:     { active: '#52B788' }, // Emerald
  birthdays: { active: '#E76F51' }, // Coral
  settings:  { active: '#9B72CF' }, // Soft violet
}
```

Inactive state: `onSurfaceVariant` at 60% opacity.

### 2.5 Theme Variants

#### System (Material You)
- Seed extracted from OS. Fully dynamic. Changes when wallpaper changes.
- Light/dark follows system `colorScheme`.

#### Light (Default Teal)
```
Seed: #4CAF9A
Background: #FAFAFA
Surface: #FFFFFF
Primary: #006A5C
```

#### Dark (Default Teal)
```
Seed: #4CAF9A
Background: #0F1C1A
Surface: #1A2B29
Primary: #4DCFBC
```

#### Blue Theme
```
Seed: #1A73E8
Light Background: #F8FAFE
Light Primary: #1A5FA8
Dark Background: #0D1B2E
Dark Primary: #7AB8F5
```

---

## 3. Typography

Material 3 type scale implemented with system fonts (SF Pro on iOS, Roboto on Android). Do **not** bundle custom fonts unless a specific typeface is required for a headline display moment.

```typescript
// src/theme/typography.ts
export const TypeScale = {
  displayLarge:   { fontSize: 57, lineHeight: 64, letterSpacing: -0.25, fontWeight: '400' },
  displayMedium:  { fontSize: 45, lineHeight: 52, letterSpacing: 0,     fontWeight: '400' },
  displaySmall:   { fontSize: 36, lineHeight: 44, letterSpacing: 0,     fontWeight: '400' },
  headlineLarge:  { fontSize: 32, lineHeight: 40, letterSpacing: 0,     fontWeight: '400' },
  headlineMedium: { fontSize: 28, lineHeight: 36, letterSpacing: 0,     fontWeight: '400' },
  headlineSmall:  { fontSize: 24, lineHeight: 32, letterSpacing: 0,     fontWeight: '400' },
  titleLarge:     { fontSize: 22, lineHeight: 28, letterSpacing: 0,     fontWeight: '500' },
  titleMedium:    { fontSize: 16, lineHeight: 24, letterSpacing: 0.15,  fontWeight: '500' },
  titleSmall:     { fontSize: 14, lineHeight: 20, letterSpacing: 0.1,   fontWeight: '500' },
  labelLarge:     { fontSize: 14, lineHeight: 20, letterSpacing: 0.1,   fontWeight: '500' },
  labelMedium:    { fontSize: 12, lineHeight: 16, letterSpacing: 0.5,   fontWeight: '500' },
  labelSmall:     { fontSize: 11, lineHeight: 16, letterSpacing: 0.5,   fontWeight: '500' },
  bodyLarge:      { fontSize: 16, lineHeight: 24, letterSpacing: 0.5,   fontWeight: '400' },
  bodyMedium:     { fontSize: 14, lineHeight: 20, letterSpacing: 0.25,  fontWeight: '400' },
  bodySmall:      { fontSize: 12, lineHeight: 16, letterSpacing: 0.4,   fontWeight: '400' },
};
```

---

## 4. Spacing & Grid

**Base unit: 4dp**

```
4   — micro gap (dot spacing, icon padding)
8   — small (list item inner padding, chip padding)
12  — compact (card inner sections)
16  — base (horizontal screen margins, card padding)
20  — comfortable
24  — section spacing
32  — large section gap
48  — hero spacing
```

**Screen horizontal margins:** 16dp left + 16dp right.
**Calendar cell size:** `(screenWidth - 32) / 7` — fills edge to edge.

---

## 5. Elevation & Shadow (M3 Tonal Elevation)

M3 uses **tonal** elevation — surfaces overlay the primary color at increasing opacities rather than casting drop shadows. Drop shadows are used sparingly.

| Level | Overlay Opacity | Usage |
|---|---|---|
| 0 | 0% | Background, flat surfaces |
| 1 | 5% | Cards, sheets resting on background |
| 2 | 8% | Bottom nav bar, elevated cards |
| 3 | 11% | FAB at rest |
| 4 | 12% | (unused) |
| 5 | 14% | FAB pressed, modal scrim |

The bottom navigation bar: `elevation: 2` tonal + thin `outlineVariant` top border (0.5dp).

---

## 6. Shape System

```typescript
export const ShapeScale = {
  extraSmall:   { borderRadius: 4  },   // Chips, small badges
  small:        { borderRadius: 8  },   // Input fields, small cards
  medium:       { borderRadius: 12 },   // Standard cards
  large:        { borderRadius: 16 },   // Bottom sheets top corners
  extraLarge:   { borderRadius: 28 },   // FAB, big action buttons
  full:         { borderRadius: 9999 }, // Pills, avatar circles
};
```

**Key shape applications:**
- Day cells in calendar: `borderRadius: 20` (soft squircle feel when filled)
- Event cards: `borderRadius: 16`
- Bottom sheet: `borderTopLeftRadius: 28, borderTopRightRadius: 28`
- FAB: `borderRadius: 9999` (perfect circle, 56dp)
- Account chips: `borderRadius: 9999` (pill)
- Tab bar pill indicator: `borderRadius: 9999`

---

## 7. Motion System

### 7.1 Spring Presets

```typescript
// src/theme/motion.ts
export const Springs = {
  // UI responses — snappy
  quick: { damping: 20, stiffness: 300, mass: 0.8 },
  
  // Standard transitions
  standard: { damping: 22, stiffness: 220, mass: 1.0 },
  
  // Tab bar pill — elastic feel
  tabSlide: { damping: 18, stiffness: 200, mass: 0.9 },
  
  // Card/sheet entrances — smooth landing
  enter: { damping: 26, stiffness: 180, mass: 1.0 },
  
  // Bouncy — for FAB, celebration moments
  bouncy: { damping: 14, stiffness: 280, mass: 0.9 },
  
  // Gentle — for fades, subtle shifts
  gentle: { damping: 30, stiffness: 120, mass: 1.2 },
};

export const Durations = {
  fast:     150,
  standard: 250,
  emphasis: 400,
  complex:  500,
};
```

### 7.2 Animation Patterns

#### Day Cell Press
```
Press In  → scale: 1.0 → 0.88, withSpring(Springs.quick)
Press Out → scale: 0.88 → 1.0, withSpring(Springs.bouncy)
```

#### Tab Switch
```
Pill position → withSpring(targetX, Springs.tabSlide)
Outgoing icon → scale: 1.0 → 0.85, opacity: 1 → 0.6, withSpring(Springs.quick)
Incoming icon → scale: 0.85 → 1.12 → 1.0, opacity: 0.6 → 1, withSpring(Springs.bouncy)
Active label  → opacity: 0 → 1, translateY: 4 → 0, withTiming(Durations.standard)
```

#### Screen Entry (Slide from Right)
```
translateX: screenWidth → 0, withSpring(Springs.enter)
opacity:    0.6 → 1,        withTiming(Durations.standard)
```

#### Bottom Sheet Open
```
translateY: sheetHeight → 0, withSpring(Springs.enter)
Backdrop opacity: 0 → 0.4,  withTiming(Durations.standard)
```

#### FAB Press
```
scale: 1.0 → 0.9 → 1.0,  withSpring(Springs.bouncy)
rotation: 0 → 45deg,      withSpring(Springs.standard)  (when sheet opens)
```

#### Calendar Month Swipe
```
Outgoing month: translateX → -screenWidth, opacity → 0, withSpring(Springs.standard)
Incoming month: translateX:  screenWidth → 0, opacity → 1, withSpring(Springs.enter)
```

#### Event Card Entry (Day View)
```
Staggered per card: delay = index * 40ms
translateY: 20 → 0, opacity: 0 → 1, withSpring(Springs.enter)
```

### 7.3 Reduced Motion
When `useReducedMotion()` returns `true`:
- Replace all spring/timing animations with instant `withTiming(0, { duration: 0 })`.
- Disable stagger delays.
- Keep haptics (they're not visual).

---

## 8. Bottom Navigation Design

### Layout
```
┌──────────────────────────────────────────────────────┐
│                                                      │
│   [Home]  [Remind]   [ ⊕ ]   [Birth.]  [Settings]   │
│                        ▲                             │
│              FAB floats above notch                  │
└──────────────────────────────────────────────────────┘
```

### Custom Tab Bar Anatomy
- Background: `surface` color + tonal elevation level 2.
- Height: 80dp (extra tall for comfortable touch targets + notch for FAB).
- Top border: `outlineVariant` at 0.5dp.
- Safe area: `paddingBottom` = `safeAreaBottom` value.
- Corner radius top: 24dp (the nav bar itself has soft top corners).

### FAB Notch
- The tab bar has a circular cutout (56dp + 16dp margin = 88dp diameter) centered.
- Implemented via SVG path clipping on the tab bar container, or `react-native-svg` background.
- FAB sits in an absolutely positioned view centered horizontally, 20dp above the tab bar top edge.
- FAB shadow: `shadowColor: primary`, `shadowRadius: 12`, `elevation: 8`.

### Pill Indicator
- Animated horizontal pill (width: 64dp, height: 32dp) sits behind the active tab icon+label.
- Color: tab's specific active color at 15% opacity.
- Position driven by `SharedValue` `tabPosition` updated on tab press.

### Tab Icons
- Lucide icon, size 22dp, `strokeWidth: 1.75`.
- Inactive: `onSurfaceVariant` at 65% opacity.
- Active: tab's specific active color, scale `1.08`.
- Label: `labelSmall` style. Visible only when active (animated opacity).

---

## 9. Calendar Grid Design

### Monthly Grid Anatomy
```
┌─────────────────────────────────────┐
│  ◀   September 2025   ▶             │  ← CalendarHeader
│  Mo  Tu  We  Th  Fr  Sa  Su         │  ← WeekDayLabels
├─────────────────────────────────────┤
│   1   2   3   4   5   6   7         │
│  ●○              ●   ○●             │  ← DotIndicators
├─────────────────────────────────────┤
│   8   9  10  11  12  13  14         │
│                 ●●                  │
├─────────────────────────────────────┤
│  15  16  17  18  19  20  21         │
│       ●       ●                     │
├─────────────────────────────────────┤
│ [22] 23  24  25  26  27  28         │  ← Today (filled circle)
│  ●   ○                   ●          │
├─────────────────────────────────────┤
│  29  30   1   2   3   4   5         │  ← Next month (greyed)
│      ●                              │
└─────────────────────────────────────┘
```

### Day Cell States

| State | Date Number Style | Background |
|---|---|---|
| Other month | `onSurfaceVariant` at 35% opacity | None |
| Normal | `onBackground` | None |
| Today | `onPrimary`, bold | `primary` filled circle |
| Selected | `primary`, bold | `primaryContainer` filled circle |
| Has entries | Normal + dots below | None (dots only) |
| Today + Selected | `onPrimary` | `primary` with `primaryContainer` ring |

### Calendar Header
- Left: `ChevronLeft` icon (Lucide, 24dp).
- Center: Month + Year in `headlineMedium` style.
- Right: `ChevronRight` icon.
- Tapping the month name expands a year/month picker (animated slide-down).
- Header has no border — floats above the grid with 8dp bottom margin.

### Week Day Labels
- 3-letter abbreviation (Mon, Tue...) or single letter (M, T...) based on locale.
- `labelMedium` style, `onSurfaceVariant` color.
- Saturday/Sunday: `tertiary` color to visually distinguish weekends.

### Dot Indicator Row
- 6dp below the date number.
- Up to 3 dots in a horizontal row with 3dp gap.
- If entries > 3: show 2 dots + `+N` text in `labelSmall`.
- Dots are `position: absolute` within the cell, centered horizontally.

---

## 10. Day Detail Screen

### Header
- Large date display: `displaySmall` — e.g., "Wednesday, 22".
- Month + Year in `titleMedium`, `onSurfaceVariant`.
- Shared element animation: the selected day cell expands and morphs into this header.

### Entry List
- Sectioned by entry type: **Events**, **Reminders**, **Tasks**, **Birthdays**.
- Each section has a `titleSmall` header with a colored dot matching the type.
- Empty sections are hidden (not shown).
- Entries sorted by time within each section.
- The list uses `FlashList` with `estimatedItemSize={72}`.

### Event Card in Day View
```
┌──────────────────────────────────────┐
│  ● 10:00 – 11:30                     │  ← colored dot + time
│    Team Standup                       │  ← title (titleMedium)
│    📍 Google Meet                     │  ← location (bodySmall)
└──────────────────────────────────────┘
```
- Border radius: 16dp.
- Left edge: 4dp thick color bar matching entry's `colorTag`.
- Background: `surfaceVariant` at 60% opacity.
- Swipe left to delete (with `react-native-gesture-handler` swipe + red trash icon reveal).
- Long press: quick action bottom sheet (edit, delete, duplicate).

---

## 11. Add Entry Sheet

### FAB → Sheet Open Flow
1. User taps FAB → FAB rotates 45° (becomes ✕).
2. Backdrop appears (scrim, opacity 0.4).
3. Bottom sheet slides up with entry type options.

### Sheet Layout
```
┌────────────────────────────────────────┐  ← drag handle
│         What would you like to add?    │
│                                        │
│  ⏰ Reminder      ✅ Task              │
│                                        │
│  📅 Event         🎂 Birthday          │
│                                        │
└────────────────────────────────────────┘
```
- 2×2 grid of large tappable cards.
- Each card: icon (32dp) + label below + matching dot color left border.
- Cards: `borderRadius: 20`, `surfaceVariant` background.
- Tapping a card → sheet closes + navigate to add form for that type.

### Add Form Screens
- Each type has a dedicated screen (not a modal) for focused input.
- Top: back arrow + save button (top-right, `primary` text).
- Form uses large, soft input fields (`borderRadius: 12`, `surfaceVariant` fill, no visible border).
- Date/time pickers are inline M3-style spinners, not native pickers.
- Color tag picker: row of 8 colored circles, tap to select, animated selection ring.
- Account picker: chip row of available accounts.

---

## 12. Settings Screen Design

### Sections

```
┌─────────────────────────────────┐
│  ACCOUNTS                       │
│  ┌─────────────────────────┐    │
│  │ 👤 work@gmail.com   ✓   │    │
│  │ 👤 personal@gmail.com   │    │
│  │ [+ Add account]         │    │
│  └─────────────────────────┘    │
│                                 │
│  APPEARANCE                     │
│  Theme         System ▾         │
│  Color Scheme  Default ▾        │
│                                 │
│  DATA                           │
│  Export all data   (↑ .calendify)│
│  Import data       (↓ .calendify)│
│  Export as .ics    (↑ .ics)     │
│  Import .ics       (↓ .ics)     │
│                                 │
│  ABOUT                          │
│  Version 1.0.0                  │
└─────────────────────────────────┘
```

### Account Cards
- Each account: avatar circle (initial letter, `avatarColor` background) + email + "Default" chip if primary.
- Swipe to delete with confirmation.
- Tap → account detail screen (rename, color, set as default).

### Theme Picker
- Bottom sheet with radio list: System / Light / Dark.
- Changes apply instantly (Zustand `themeMode` → `useThemeColors` recomputes).

### Color Scheme Picker
- Bottom sheet: Default (Material You) / Blue.
- "Default" shows a gradient swatch. "Blue" shows `#1A73E8` swatch.

---

## 13. Reminders Screen

### Layout
- Top: section filter chips row (All, Today, Upcoming, Overdue).
- Below: grouped list by date (relative: "Today", "Tomorrow", "This week", then absolute dates).
- Each reminder: time, title, account dot, completed toggle.
- Completed reminders appear in a collapsed "Done" section at the bottom.
- Empty state: illustrated empty state with `onSurfaceVariant` icon + caption.

---

## 14. Tasks Screen

### Layout
- Kanban-inspired flat list with status filter chips: **All**, **To Do**, **In Progress**, **Done**.
- Priority color coded: High = coral left bar, Medium = amber, Low = muted green.
- Checkmark toggle: animated check (scale spring + color fill).
- Long-press: reorder mode (haptic on lift, semi-transparent dragging card).

---

## 15. Birthdays Screen

### Layout
- Two sections: **Upcoming** (within 30 days) + **All Birthdays** (alphabetical).
- Each birthday card: avatar circle + name + date + age (if birth year provided).
- `BIRTHDAY` entry uses `tertiary` accent color throughout.
- Countdown chip: "In 3 days" — `tertiaryContainer` background.

---

## 16. Component Inventory

### Primitive UI Components (`src/components/ui/`)

| Component | Props | Purpose |
|---|---|---|
| `AnimatedScreen` | `children, entering?, exiting?` | Wraps every screen with entry animation |
| `HapticButton` | `onPress, hapticStyle, style, children` | Touchable + haptic combo |
| `Chip` | `label, selected, onPress, color, icon?` | Filterable chip |
| `Divider` | `inset?` | `outlineVariant` 0.5dp line |
| `EmptyState` | `icon, title, subtitle, action?` | Full-screen empty state |
| `Avatar` | `initials, color, size` | Circular letter avatar |
| `ColorDot` | `color, size?` | Semantic colored circle |
| `SectionHeader` | `title, color?` | Styled section label |
| `SettingsRow` | `icon, label, value?, onPress?` | Tappable settings list item |

### Calendar Components (`src/components/calendar/`)

| Component | Props | Purpose |
|---|---|---|
| `CalendarGrid` | `month, year, onDayPress, onSwipe` | Full monthly grid |
| `CalendarDay` | `date, state, dots, onPress` | Single interactive day cell |
| `CalendarHeader` | `month, year, onPrev, onNext, onTitlePress` | Month nav row |
| `WeekDayLabels` | `locale?` | Mon–Sun labels row |
| `DotIndicators` | `entries, max?` | Colored dot row for a day |

### Card Components (`src/components/cards/`)

All cards share: `borderRadius: 16`, `surfaceVariant` bg, `colorTag` left bar (4dp), `titleMedium` title, `bodySmall` subtitle, swipe-to-delete.

| Component | Unique Fields |
|---|---|
| `EventCard` | startTime, endTime, location |
| `ReminderCard` | time, repeat indicator icon |
| `TaskCard` | checkbox, priority indicator, dueDate |
| `BirthdayCard` | age, countdown chip, avatar |

---

## 17. Icon Map

| Feature | Lucide Icon |
|---|---|
| Home (tab) | `CalendarDays` |
| Reminders (tab) | `Bell` |
| Tasks (tab) | `CheckSquare` |
| Birthdays (tab) | `Cake` |
| Settings (tab) | `Settings2` |
| Add (FAB) | `Plus` |
| Close/Back | `X` / `ChevronLeft` |
| Delete | `Trash2` |
| Edit | `Pencil` |
| Export | `Upload` |
| Import | `Download` |
| Account | `User` |
| Event | `CalendarPlus` |
| Repeat | `RefreshCw` |
| Location | `MapPin` |
| Time | `Clock` |
| Done/Complete | `CheckCircle2` |
| Warning | `AlertTriangle` |
| Theme Light | `Sun` |
| Theme Dark | `Moon` |
| Theme System | `Smartphone` |

---

## 18. Accessibility & Inclusive Design

- All colors meet WCAG AA contrast ratio (4.5:1 for text, 3:1 for large text).
- Touch targets: minimum 44×44dp. Dot indicators are decorative, not sole information.
- Entry type never communicated via color alone — always icon + label.
- Screen reader labels on all interactive elements.
- Bottom nav: `accessibilityRole="tab"`, `accessibilityState={{ selected }}`.
- FAB: `accessibilityLabel="Add new entry"`, `accessibilityRole="button"`.
- Calendar grid: each day cell `accessibilityLabel="March 15, 3 events"`.

---

## 19. Onboarding (First Launch)

- If no accounts exist on first launch → modal sheet: "Add your first account" with email input.
- Account is stored locally — no OAuth, no network. Just an email label + name for organization.
- Dismiss allowed (app works fine with anonymous "Local" default account).
- After adding account → brief animation: calendar grid "fills in" with a staggered entrance.

---

## 20. Design Checklist (per feature)

Before any screen is considered done:

- [ ] All colors from `useThemeColors()` — zero hardcoded colors
- [ ] All spacing from spacing tokens — zero magic numbers
- [ ] All shapes from `ShapeScale` — no ad-hoc border radii
- [ ] All animations use `react-native-reanimated` worklets
- [ ] `useReducedMotion()` check implemented
- [ ] Haptic feedback on all interactive elements
- [ ] `accessibilityLabel` on all interactive elements
- [ ] Empty state designed and implemented
- [ ] Loading state designed and implemented
- [ ] Works in both light and dark mode
- [ ] Works in blue theme
- [ ] Tested on Android + iOS

---

*Last updated: Calendify v1.0 — DESIGN.md*