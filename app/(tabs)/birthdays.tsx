import React, { useMemo } from 'react';
import { StyleSheet, View, ScrollView, Text } from 'react-native';

import { useRouter } from 'expo-router';
import { AnimatedScreen } from '@/src/components/ui/AnimatedScreen';
import { BirthdayCard } from '@/src/components/cards/BirthdayCard';
import { EmptyState } from '@/src/components/ui/EmptyState';
import { SectionHeader } from '@/src/components/ui/SectionHeader';
import { useEventsStore } from '@/src/stores/useEventsStore';
import { useThemeColors } from '@/src/hooks/useThemeColors';
import { TypeScale } from '@/src/theme/typography';
import { Spacing } from '@/src/theme/spacing';
import { DOT_COLORS } from '@/src/constants/dotColors';
import { daysUntilBirthday } from '@/src/utils/dateHelpers';
import { Cake } from 'lucide-react-native';
import type { Birthday } from '@/src/types/entries';

export default function BirthdaysScreen() {
  const colors = useThemeColors();

  const router = useRouter();

  const entries = useEventsStore((s) => s.entries);
  const birthdays = useMemo(
    () => entries.filter((e): e is Birthday => e.type === 'BIRTHDAY'),
    [entries]
  );

  const upcoming = useMemo(() => {
    return birthdays
      .filter((b) => daysUntilBirthday(b.date) <= 30)
      .sort((a, b) => daysUntilBirthday(a.date) - daysUntilBirthday(b.date));
  }, [birthdays]);

  const allSorted = useMemo(() => {
    return [...birthdays].sort((a, b) => (a.personName ?? a.title ?? '').localeCompare(b.personName ?? b.title ?? ''));
  }, [birthdays]);

  return (
    <AnimatedScreen style={{ backgroundColor: colors.background }}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { paddingTop: Spacing.base }]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[TypeScale.headlineMedium, styles.title, { color: colors.onBackground }]}>
          Birthdays
        </Text>

        {birthdays.length === 0 ? (
          <EmptyState
            icon={<Cake size={36} color={colors.onSurfaceVariant} strokeWidth={1.5} />}
            title="No birthdays"
            subtitle="Add birthdays to keep track of celebrations"
          />
        ) : (
          <>
            {upcoming.length > 0 && (
              <>
                <SectionHeader title="Upcoming (next 30 days)" color={DOT_COLORS.BIRTHDAY} />
                {upcoming.map((b) => (
                  <BirthdayCard
                    key={b.id}
                    birthday={b}
                    onPress={() => router.push(`/event/${b.id}` as never)}
                  />
                ))}
              </>
            )}

            <SectionHeader title="All Birthdays" color={DOT_COLORS.BIRTHDAY} />
            {allSorted.map((b) => (
              <BirthdayCard
                key={b.id}
                birthday={b}
                onPress={() => router.push(`/event/${b.id}` as never)}
              />
            ))}
          </>
        )}

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </AnimatedScreen>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  title: {
    paddingHorizontal: Spacing.base,
    marginBottom: Spacing.compact,
  },
  bottomSpacer: {
    height: 20,
  },
});
