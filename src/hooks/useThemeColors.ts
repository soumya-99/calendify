import { useColorScheme } from 'react-native';
import { useThemeStore } from '@/src/stores/useThemeStore';
import {
  LightTealScheme,
  DarkTealScheme,
  LightBlueScheme,
  DarkBlueScheme,
  LightRedScheme,
  DarkRedScheme,
  LightYellowScheme,
  DarkYellowScheme,
  LightOrangeScheme,
  DarkOrangeScheme,
  LightPurpleScheme,
  DarkPurpleScheme,
  LightGreenScheme,
  DarkGreenScheme,
} from '@/src/theme/colorSchemes';
import type { ColorPalette, ColorSchemeChoice } from '@/src/types/theme';

const paletteByScheme: Record<ColorSchemeChoice, { light: ColorPalette; dark: ColorPalette }> = {
  default: { light: LightTealScheme, dark: DarkTealScheme },
  blue: { light: LightBlueScheme, dark: DarkBlueScheme },
  red: { light: LightRedScheme, dark: DarkRedScheme },
  yellow: { light: LightYellowScheme, dark: DarkYellowScheme },
  orange: { light: LightOrangeScheme, dark: DarkOrangeScheme },
  purple: { light: LightPurpleScheme, dark: DarkPurpleScheme },
  green: { light: LightGreenScheme, dark: DarkGreenScheme },
};

/**
 * Resolves the current color palette based on theme mode, color scheme,
 * and system appearance.
 */
export function useThemeColors(): ColorPalette {
  const systemColorScheme = useColorScheme();
  const themeMode = useThemeStore((s) => s.themeMode);
  const colorScheme = useThemeStore((s) => s.colorScheme);

  let isDark: boolean;
  if (themeMode === 'system') {
    isDark = systemColorScheme === 'dark';
  } else {
    isDark = themeMode === 'dark';
  }

  const selectedPalette = paletteByScheme[colorScheme] ?? paletteByScheme.default;
  return isDark ? selectedPalette.dark : selectedPalette.light;
}
