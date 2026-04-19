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
} as const;

export const Durations = {
  fast: 150,
  standard: 250,
  emphasis: 400,
  complex: 500,
} as const;

export const ShapeScale = {
  extraSmall: { borderRadius: 4 },
  small: { borderRadius: 8 },
  medium: { borderRadius: 12 },
  large: { borderRadius: 16 },
  extraLarge: { borderRadius: 28 },
  full: { borderRadius: 9999 },
} as const;
