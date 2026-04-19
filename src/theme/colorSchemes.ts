import type { ColorPalette } from '@/src/types/theme';

// DOT colors are constant across all themes
const DOT_COLORS = {
  dotReminder: '#FFB300',
  dotTask: '#43A047',
  dotEvent: '#1E88E5',
  dotBirthday: '#E64A19',
};

interface GeneratedSchemeConfig {
  primary: string;
  secondary?: string;
  tertiary?: string;
  backgroundTint?: string;
}

function hexToRgb(hex: string) {
  const normalized = hex.replace('#', '');
  const value = normalized.length === 3
    ? normalized.split('').map((char) => char + char).join('')
    : normalized;

  return {
    r: parseInt(value.slice(0, 2), 16),
    g: parseInt(value.slice(2, 4), 16),
    b: parseInt(value.slice(4, 6), 16),
  };
}

function rgbToHex(r: number, g: number, b: number) {
  return `#${[r, g, b]
    .map((channel) => Math.max(0, Math.min(255, channel)).toString(16).padStart(2, '0'))
    .join('')}`;
}

function mixColors(base: string, target: string, amount: number) {
  const a = hexToRgb(base);
  const b = hexToRgb(target);

  return rgbToHex(
    Math.round(a.r + (b.r - a.r) * amount),
    Math.round(a.g + (b.g - a.g) * amount),
    Math.round(a.b + (b.b - a.b) * amount)
  );
}

function lighten(color: string, amount: number) {
  return mixColors(color, '#FFFFFF', amount);
}

function darken(color: string, amount: number) {
  return mixColors(color, '#000000', amount);
}

function relativeLuminance(color: string) {
  const { r, g, b } = hexToRgb(color);
  const channels = [r, g, b].map((channel) => {
    const value = channel / 255;
    return value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
  });

  return channels[0] * 0.2126 + channels[1] * 0.7152 + channels[2] * 0.0722;
}

function readableTextColor(background: string, light = '#FFFFFF', dark = '#1A1C1E') {
  return relativeLuminance(background) > 0.45 ? dark : light;
}

function buildLightScheme({
  primary,
  secondary = mixColors(primary, '#5F6368', 0.62),
  tertiary = mixColors(primary, '#6750A4', 0.5),
  backgroundTint = primary,
}: GeneratedSchemeConfig): ColorPalette {
  return {
    primary,
    onPrimary: readableTextColor(primary),
    primaryContainer: lighten(primary, 0.82),
    onPrimaryContainer: darken(primary, 0.72),
    secondary,
    onSecondary: readableTextColor(secondary),
    secondaryContainer: lighten(secondary, 0.84),
    onSecondaryContainer: darken(secondary, 0.72),
    tertiary,
    onTertiary: readableTextColor(tertiary),
    tertiaryContainer: lighten(tertiary, 0.82),
    onTertiaryContainer: darken(tertiary, 0.72),
    error: '#BA1A1A',
    onError: '#FFFFFF',
    errorContainer: '#FFDAD6',
    onErrorContainer: '#410002',
    background: mixColors('#FAFAFA', backgroundTint, 0.06),
    onBackground: '#1A1C1E',
    surface: '#FFFFFF',
    onSurface: '#1A1C1E',
    surfaceVariant: lighten(backgroundTint, 0.86),
    onSurfaceVariant: '#43474E',
    outline: mixColors('#73777F', backgroundTint, 0.18),
    outlineVariant: lighten(backgroundTint, 0.75),
    inverseSurface: '#2F3033',
    inverseOnSurface: '#F1F0F4',
    inversePrimary: lighten(primary, 0.5),
    scrim: '#000000',
    shadow: '#000000',
    ...DOT_COLORS,
  };
}

function buildDarkScheme({
  primary,
  secondary = mixColors(primary, '#5F6368', 0.62),
  tertiary = mixColors(primary, '#6750A4', 0.5),
  backgroundTint = primary,
}: GeneratedSchemeConfig): ColorPalette {
  const lightPrimary = lighten(primary, 0.34);
  const lightSecondary = lighten(secondary, 0.28);
  const lightTertiary = lighten(tertiary, 0.28);

  return {
    primary: lightPrimary,
    onPrimary: readableTextColor(lightPrimary),
    primaryContainer: darken(primary, 0.5),
    onPrimaryContainer: lighten(primary, 0.72),
    secondary: lightSecondary,
    onSecondary: readableTextColor(lightSecondary),
    secondaryContainer: darken(secondary, 0.44),
    onSecondaryContainer: lighten(secondary, 0.72),
    tertiary: lightTertiary,
    onTertiary: readableTextColor(lightTertiary),
    tertiaryContainer: darken(tertiary, 0.42),
    onTertiaryContainer: lighten(tertiary, 0.72),
    error: '#FFB4AB',
    onError: '#690005',
    errorContainer: '#93000A',
    onErrorContainer: '#FFDAD6',
    background: mixColors('#111418', backgroundTint, 0.14),
    onBackground: '#E2E2E5',
    surface: mixColors('#1A1F24', backgroundTint, 0.16),
    onSurface: '#E2E2E5',
    surfaceVariant: mixColors('#43474E', backgroundTint, 0.22),
    onSurfaceVariant: '#C3C6CF',
    outline: mixColors('#8D9199', backgroundTint, 0.18),
    outlineVariant: mixColors('#43474E', backgroundTint, 0.18),
    inverseSurface: '#E2E2E5',
    inverseOnSurface: '#1A1C1E',
    inversePrimary: darken(primary, 0.08),
    scrim: '#000000',
    shadow: '#000000',
    ...DOT_COLORS,
  };
}

export const LightTealScheme: ColorPalette = {
  primary: '#006A5C',
  onPrimary: '#FFFFFF',
  primaryContainer: '#74F8E2',
  onPrimaryContainer: '#00201B',
  secondary: '#4B635D',
  onSecondary: '#FFFFFF',
  secondaryContainer: '#CDE8DF',
  onSecondaryContainer: '#07201B',
  tertiary: '#426278',
  onTertiary: '#FFFFFF',
  tertiaryContainer: '#C6E7FF',
  onTertiaryContainer: '#001E2F',
  error: '#BA1A1A',
  onError: '#FFFFFF',
  errorContainer: '#FFDAD6',
  onErrorContainer: '#410002',
  background: '#FAFAFA',
  onBackground: '#191C1B',
  surface: '#FFFFFF',
  onSurface: '#191C1B',
  surfaceVariant: '#DBE5E0',
  onSurfaceVariant: '#3F4945',
  outline: '#6F7975',
  outlineVariant: '#BFC9C4',
  inverseSurface: '#2D3130',
  inverseOnSurface: '#EFF1EF',
  inversePrimary: '#54DBC6',
  scrim: '#000000',
  shadow: '#000000',
  ...DOT_COLORS,
};

export const DarkTealScheme: ColorPalette = {
  primary: '#4DCFBC',
  onPrimary: '#003730',
  primaryContainer: '#005045',
  onPrimaryContainer: '#74F8E2',
  secondary: '#B2CCC4',
  onSecondary: '#1D352F',
  secondaryContainer: '#344C46',
  onSecondaryContainer: '#CDE8DF',
  tertiary: '#AACBE3',
  onTertiary: '#103447',
  tertiaryContainer: '#2A4B5F',
  onTertiaryContainer: '#C6E7FF',
  error: '#FFB4AB',
  onError: '#690005',
  errorContainer: '#93000A',
  onErrorContainer: '#FFDAD6',
  background: '#0F1C1A',
  onBackground: '#E1E3E0',
  surface: '#1A2B29',
  onSurface: '#E1E3E0',
  surfaceVariant: '#3F4945',
  onSurfaceVariant: '#BFC9C4',
  outline: '#89938F',
  outlineVariant: '#3F4945',
  inverseSurface: '#E1E3E0',
  inverseOnSurface: '#191C1B',
  inversePrimary: '#006A5C',
  scrim: '#000000',
  shadow: '#000000',
  ...DOT_COLORS,
};

export const LightBlueScheme: ColorPalette = {
  primary: '#1A5FA8',
  onPrimary: '#FFFFFF',
  primaryContainer: '#D4E3FF',
  onPrimaryContainer: '#001C3A',
  secondary: '#555F71',
  onSecondary: '#FFFFFF',
  secondaryContainer: '#D9E3F8',
  onSecondaryContainer: '#121C2B',
  tertiary: '#6E5676',
  onTertiary: '#FFFFFF',
  tertiaryContainer: '#F7D8FF',
  onTertiaryContainer: '#271430',
  error: '#BA1A1A',
  onError: '#FFFFFF',
  errorContainer: '#FFDAD6',
  onErrorContainer: '#410002',
  background: '#F8FAFE',
  onBackground: '#1A1C1E',
  surface: '#FFFFFF',
  onSurface: '#1A1C1E',
  surfaceVariant: '#DFE2EB',
  onSurfaceVariant: '#43474E',
  outline: '#73777F',
  outlineVariant: '#C3C6CF',
  inverseSurface: '#2F3033',
  inverseOnSurface: '#F1F0F4',
  inversePrimary: '#A5C8FF',
  scrim: '#000000',
  shadow: '#000000',
  ...DOT_COLORS,
};

export const DarkBlueScheme: ColorPalette = {
  primary: '#7AB8F5',
  onPrimary: '#00315E',
  primaryContainer: '#004785',
  onPrimaryContainer: '#D4E3FF',
  secondary: '#BDC7DC',
  onSecondary: '#283141',
  secondaryContainer: '#3E4758',
  onSecondaryContainer: '#D9E3F8',
  tertiary: '#DBBCE2',
  onTertiary: '#3D2846',
  tertiaryContainer: '#553F5D',
  onTertiaryContainer: '#F7D8FF',
  error: '#FFB4AB',
  onError: '#690005',
  errorContainer: '#93000A',
  onErrorContainer: '#FFDAD6',
  background: '#0D1B2E',
  onBackground: '#E2E2E5',
  surface: '#1A2332',
  onSurface: '#E2E2E5',
  surfaceVariant: '#43474E',
  onSurfaceVariant: '#C3C6CF',
  outline: '#8D9199',
  outlineVariant: '#43474E',
  inverseSurface: '#E2E2E5',
  inverseOnSurface: '#1A1C1E',
  inversePrimary: '#1A5FA8',
  scrim: '#000000',
  shadow: '#000000',
  ...DOT_COLORS,
};

export const LightRedScheme = buildLightScheme({
  primary: '#C5221F',
  secondary: '#8D4A46',
  tertiary: '#A142F4',
  backgroundTint: '#D93025',
});

export const DarkRedScheme = buildDarkScheme({
  primary: '#C5221F',
  secondary: '#8D4A46',
  tertiary: '#A142F4',
  backgroundTint: '#D93025',
});

export const LightYellowScheme = buildLightScheme({
  primary: '#9E6A00',
  secondary: '#7A5B1A',
  tertiary: '#C26401',
  backgroundTint: '#F9AB00',
});

export const DarkYellowScheme = buildDarkScheme({
  primary: '#9E6A00',
  secondary: '#7A5B1A',
  tertiary: '#C26401',
  backgroundTint: '#F9AB00',
});

export const LightOrangeScheme = buildLightScheme({
  primary: '#B65400',
  secondary: '#8A5833',
  tertiary: '#D93025',
  backgroundTint: '#FA7B17',
});

export const DarkOrangeScheme = buildDarkScheme({
  primary: '#B65400',
  secondary: '#8A5833',
  tertiary: '#D93025',
  backgroundTint: '#FA7B17',
});

export const LightPurpleScheme = buildLightScheme({
  primary: '#7E3FF2',
  secondary: '#6750A4',
  tertiary: '#1A73E8',
  backgroundTint: '#A142F4',
});

export const DarkPurpleScheme = buildDarkScheme({
  primary: '#7E3FF2',
  secondary: '#6750A4',
  tertiary: '#1A73E8',
  backgroundTint: '#A142F4',
});

export const LightGreenScheme = buildLightScheme({
  primary: '#137333',
  secondary: '#46664D',
  tertiary: '#1A73E8',
  backgroundTint: '#34A853',
});

export const DarkGreenScheme = buildDarkScheme({
  primary: '#137333',
  secondary: '#46664D',
  tertiary: '#1A73E8',
  backgroundTint: '#34A853',
});
