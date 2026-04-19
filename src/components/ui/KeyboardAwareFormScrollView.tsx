import React from 'react';
import { Platform, StyleProp, StyleSheet, ViewStyle } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Spacing } from '@/src/theme/spacing';

interface KeyboardAwareFormScrollViewProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  contentContainerStyle?: StyleProp<ViewStyle>;
}

export function KeyboardAwareFormScrollView({
  children,
  style,
  contentContainerStyle,
}: KeyboardAwareFormScrollViewProps) {
  const insets = useSafeAreaInsets();

  return (
    <KeyboardAwareScrollView
      style={[styles.scrollView, style]}
      contentContainerStyle={[
        styles.scrollContent,
        { paddingBottom: insets.bottom + Spacing.hero },
        contentContainerStyle,
      ]}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'on-drag'}
      enableOnAndroid
      enableAutomaticScroll
      extraHeight={Spacing.hero}
      extraScrollHeight={Spacing.section}
      keyboardOpeningTime={0}
    >
      {children}
    </KeyboardAwareScrollView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
});
