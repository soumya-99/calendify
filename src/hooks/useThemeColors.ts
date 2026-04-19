import { useColorScheme } from 'react-native';
import { useThemeStore } from '@/src/stores/useThemeStore';
import {
  LightTealScheme,
  DarkTealScheme,
  LightBlueScheme,
  DarkBlueScheme,
} from '@/src/theme/colorSchemes';
import type { ColorPalette } from '@/src/types/theme';

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

  if (colorScheme === 'blue') {
    return isDark ? DarkBlueScheme : LightBlueScheme;
  }

  return isDark ? DarkTealScheme : LightTealScheme;
}
