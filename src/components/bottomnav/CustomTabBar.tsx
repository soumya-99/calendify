import { TAB_ACTIVE_COLORS } from '@/src/constants/dotColors';
import { useHaptics } from '@/src/hooks/useHaptics';
import { useThemeColors } from '@/src/hooks/useThemeColors';
import { TypeScale } from '@/src/theme/typography';
import { Bell, Cake, CalendarDays, Plus, Settings2 } from 'lucide-react-native';
import React, { useCallback, useEffect } from 'react';
import { Pressable, StyleSheet, useWindowDimensions, View } from 'react-native';
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withSpring,
  withTiming
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface TabItem {
  key: string;
  label: string;
  icon: typeof CalendarDays;
  color: string;
}

const TABS: TabItem[] = [
  { key: 'index', label: 'Home', icon: CalendarDays, color: TAB_ACTIVE_COLORS.home },
  { key: 'reminders', label: 'Reminders', icon: Bell, color: TAB_ACTIVE_COLORS.reminders },
  { key: 'birthdays', label: 'Birthdays', icon: Cake, color: TAB_ACTIVE_COLORS.birthdays },
  { key: 'settings', label: 'Settings', icon: Settings2, color: TAB_ACTIVE_COLORS.settings },
];

const TAB_INDEX_MAP: Record<string, number> = {
  'index': 0,
  'reminders': 1,
  'birthdays': 2,
  'settings': 3,
};

interface CustomTabBarProps {
  activeTab: string;
  onTabPress: (key: string) => void;
  onFABPress: () => void;
}

interface TabIconProps {
  item: TabItem;
  isActive: boolean;
  onPress: () => void;
  tabWidth: number;
}

function TabIcon({ item, isActive, onPress, tabWidth }: TabIconProps) {
  const colors = useThemeColors();
  const reducedMotion = useReducedMotion();
  const progress = useSharedValue(isActive ? 1 : 0);

  useEffect(() => {
    if (reducedMotion) {
      progress.value = isActive ? 1 : 0;
    } else {
      progress.value = withTiming(isActive ? 1 : 0, { duration: 250, easing: Easing.out(Easing.cubic) });
    }
  }, [isActive, progress, reducedMotion]);

  const iconAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: interpolate(progress.value, [0, 1], [1, 1.1]) }],
  }));

  const labelAnimStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [{ translateY: interpolate(progress.value, [0, 1], [6, 0]) }],
  }));

  const Icon = item.icon;
  const iconColor = isActive ? '#FFFFFF' : `${colors.onSurfaceVariant}99`;

  return (
    <AnimatedPressable
      onPress={onPress}
      style={[styles.tabItem, { width: tabWidth }]}
      accessibilityRole="tab"
      accessibilityLabel={item.label}
      accessibilityState={{ selected: isActive }}
    >
      <Animated.View style={iconAnimStyle}>
        <Icon size={24} color={iconColor} strokeWidth={isActive ? 2 : 1.5} />
      </Animated.View>
      <Animated.Text
        style={[
          TypeScale.labelMedium,
          labelAnimStyle,
          { color: item.color, marginTop: 8, fontSize: 11, fontWeight: '600' },
        ]}
        numberOfLines={1}
      >
        {item.label}
      </Animated.Text>
    </AnimatedPressable>
  );
}

export function CustomTabBar({ activeTab, onTabPress, onFABPress }: CustomTabBarProps) {
  const colors = useThemeColors();
  const haptics = useHaptics();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const reducedMotion = useReducedMotion();

  const fabScale = useSharedValue(1);

  const activeIndex = TAB_INDEX_MAP[activeTab] ?? 0;

  // Calculate specific positions for the 4 tabs dodging the center FAB
  const fabWidth = 64;
  const availableWidth = width - 32; // 16px padding on sides
  const halfEmptySpace = (availableWidth - fabWidth) / 2;
  const tabWidth = halfEmptySpace / 2;

  const positions = [
    16 + tabWidth / 2, // 0
    16 + tabWidth + tabWidth / 2, // 1
    16 + halfEmptySpace + fabWidth + tabWidth / 2, // 2
    16 + halfEmptySpace + fabWidth + tabWidth + tabWidth / 2, // 3
  ];

  const pillX = useSharedValue(positions[activeIndex]);
  const pillColor = useSharedValue(TABS[activeIndex]?.color || colors.primary);

  useEffect(() => {
    if (reducedMotion) {
      pillX.value = positions[activeIndex];
      pillColor.value = TABS[activeIndex]?.color || colors.primary;
    } else {
      pillX.value = withSpring(positions[activeIndex], {
        damping: 25,
        stiffness: 200,
        mass: 1,
      });
      pillColor.value = withTiming(TABS[activeIndex]?.color || colors.primary, { duration: 250 });
    }
  }, [activeIndex, pillX, pillColor, reducedMotion, positions, colors]);

  const pillAnimStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: pillX.value - 28 }], // 28 is half of pill width (56)
      backgroundColor: pillColor.value,
    };
  });

  const handleFABPress = useCallback(() => {
    haptics.heavy();
    if (!reducedMotion) {
      fabScale.value = withTiming(0.9, { duration: 100 });
      setTimeout(() => {
        fabScale.value = withTiming(1, { duration: 150 });
      }, 100);
    }
    onFABPress();
  }, [haptics, fabScale, onFABPress, reducedMotion]);

  const fabAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: fabScale.value }],
  }));

  const leftTabs = TABS.slice(0, 2);
  const rightTabs = TABS.slice(2);

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.surface,
          borderTopColor: `${colors.outlineVariant}50`,
          paddingBottom: Math.max(insets.bottom, 8),
          paddingHorizontal: 16,
        },
      ]}
    >
      <Animated.View style={[styles.activePill, pillAnimStyle]} />

      <View style={styles.tabsRow}>
        {leftTabs.map((tab) => (
          <TabIcon
            key={tab.key}
            item={tab}
            isActive={activeTab === tab.key}
            onPress={() => {
              if (activeTab !== tab.key) {
                haptics.light();
                onTabPress(tab.key);
              }
            }}
            tabWidth={tabWidth}
          />
        ))}

        <View style={styles.fabContainer}>
          <AnimatedPressable
            onPress={handleFABPress}
            style={[
              styles.fab,
              fabAnimStyle,
              { backgroundColor: colors.primaryContainer },
            ]}
            accessibilityLabel="Add new entry"
            accessibilityRole="button"
          >
            <Plus size={28} color={colors.onPrimaryContainer} strokeWidth={2.25} />
          </AnimatedPressable>
        </View>

        {rightTabs.map((tab) => (
          <TabIcon
            key={tab.key}
            item={tab}
            isActive={activeTab === tab.key}
            onPress={() => {
              if (activeTab !== tab.key) {
                haptics.light();
                onTabPress(tab.key);
              }
            }}
            tabWidth={tabWidth}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderTopWidth: StyleSheet.hairlineWidth,
    position: 'relative',
  },
  activePill: {
    position: 'absolute',
    top: 18,
    left: 0,
    width: 56,
    height: 34,
    borderRadius: 17,
  },
  tabsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 86,
    paddingTop: 8,
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 62,
  },
  fabContainer: {
    width: 64,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fab: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
