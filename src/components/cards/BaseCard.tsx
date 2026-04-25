import { HapticButton } from '@/src/components/ui/HapticButton';
import { useThemeColors } from '@/src/hooks/useThemeColors';
import { Spacing } from '@/src/theme/spacing';
import { TypeScale } from '@/src/theme/typography';
import React, { ReactNode } from 'react';
import { StyleProp, StyleSheet, Text, TextStyle, View, ViewStyle } from 'react-native';

interface BaseCardProps {
  title: string;
  titleStyle?: StyleProp<TextStyle>;
  style?: StyleProp<ViewStyle>;
  subtitle?: string | ReactNode;
  icon?: ReactNode;
  rightContent?: ReactNode;
  color?: string;
  onPress?: () => void;
  onLongPress?: () => void;
  children?: ReactNode;
  accentColor?: string;
}

export function BaseCard({
  title,
  subtitle,
  titleStyle,
  icon,
  rightContent,
  onPress,
  onLongPress,
  style,
  children,
  accentColor,
}: BaseCardProps) {
  const colors = useThemeColors();
  const themeAccent = accentColor || colors.primary;

  return (
    <HapticButton
      onPress={onPress}
      onLongPress={onLongPress}
      hapticStyle="light"
      style={[
        styles.card,
        {
          backgroundColor: colors.surface,
          borderColor: colors.outlineVariant,
        },
        style,
      ]}
    >
      {/* Left Accent Bar */}
      <View style={[styles.accentBar, { backgroundColor: themeAccent }]} />

      <View style={styles.container}>
        {icon && (
          <View style={[styles.iconBox, { backgroundColor: `${themeAccent}12` }]}>
            {icon}
          </View>
        )}

        <View style={styles.content}>
          <Text
            style={[TypeScale.titleSmall, { color: colors.onSurface }, titleStyle]}
            numberOfLines={1}
          >
            {title}
          </Text>

          {typeof subtitle === 'string' ? (
            <Text style={[TypeScale.bodySmall, { color: colors.onSurfaceVariant }]} numberOfLines={1}>
              {subtitle}
            </Text>
          ) : (
            subtitle
          )}

          {children}
        </View>

        {rightContent && (
          <View style={styles.rightSection}>
            {rightContent}
          </View>
        )}
      </View>
    </HapticButton>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: Spacing.base,
    marginBottom: Spacing.base,
    borderRadius: 20, // More rounded for modern look
    borderWidth: 1.5, // Crisp border instead of shadow
    overflow: 'hidden',
    flexDirection: 'row',
  },
  accentBar: {
    width: 6,
    height: '60%',
    alignSelf: 'center',
    borderRadius: 3,
    marginLeft: 4,
  },
  container: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    gap: 2,
  },
  rightSection: {
    marginLeft: 12,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
});
