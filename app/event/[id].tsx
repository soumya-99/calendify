import React, { useCallback, useMemo } from 'react';
import { StyleSheet, View, ScrollView, Text, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AnimatedScreen } from '@/src/components/ui/AnimatedScreen';
import { HapticButton } from '@/src/components/ui/HapticButton';
import { useEventsStore } from '@/src/stores/useEventsStore';
import { useThemeColors } from '@/src/hooks/useThemeColors';
import { useHaptics } from '@/src/hooks/useHaptics';
import { TypeScale } from '@/src/theme/typography';
import { Spacing } from '@/src/theme/spacing';
import { DOT_COLORS } from '@/src/constants/dotColors';
import { formatDateDisplay, formatTime, calculateAge, daysUntilBirthday } from '@/src/utils/dateHelpers';
import {
  ChevronLeft,
  Pencil,
  Trash2,
  Clock,
  MapPin,
  RefreshCw,
  CalendarDays,
  User,
  CheckCircle2,
  Circle,
  AlertTriangle,
  Gift,
  AlignLeft,
  ArrowUp,
  ArrowDown,
  Minus,
} from 'lucide-react-native';
import type { CalendarEvent, Reminder, Birthday, Task } from '@/src/types/entries';

export default function EventDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colors = useThemeColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const haptics = useHaptics();

  const entries = useEventsStore((s) => s.entries);
  const entry = useMemo(() => entries.find((e) => e.id === (id ?? '')), [entries, id]);
  const deleteEntry = useEventsStore((s) => s.deleteEntry);
  const toggleTaskComplete = useEventsStore((s) => s.toggleTaskComplete);

  const handleEdit = useCallback(() => {
    if (!entry) return;
    const routeByType = { EVENT: 'event', REMINDER: 'reminder', TASK: 'task', BIRTHDAY: 'birthday' } as const;
    router.push(`/add/${routeByType[entry.type]}?id=${entry.id}` as never);
  }, [entry, router]);

  const handleDelete = useCallback(() => {
    if (!entry) return;
    Alert.alert('Delete', `Are you sure you want to delete "${entry.title}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          haptics.warning();
          deleteEntry(entry.id);
          router.back();
        },
      },
    ]);
  }, [entry, deleteEntry, haptics, router]);

  if (!entry) return null;

  const accentColor = DOT_COLORS[entry.type] || colors.primary;
  
  const renderInfoTile = (icon: any, label: string, value: string | React.ReactNode, color?: string) => (
    <View style={[styles.tile, { backgroundColor: colors.surface, borderColor: colors.outlineVariant }]}>
      <View style={[styles.tileIcon, { backgroundColor: `${color || colors.primary}12` }]}>
        {React.createElement(icon, { size: 20, color: color || colors.primary, strokeWidth: 2 })}
      </View>
      <View style={styles.tileContent}>
        <Text style={[TypeScale.labelSmall, { color: colors.onSurfaceVariant, textTransform: 'uppercase', letterSpacing: 1 }]}>
          {label}
        </Text>
        <Text style={[TypeScale.bodyLarge, { color: colors.onSurface, fontWeight: '600', marginTop: 2 }]}>
          {value}
        </Text>
      </View>
    </View>
  );

  return (
    <AnimatedScreen style={{ backgroundColor: colors.background }}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 40 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Section */}
        <View style={[styles.hero, { backgroundColor: `${accentColor}12`, paddingTop: insets.top }]}>
          <View style={styles.header}>
            <HapticButton onPress={() => router.back()} style={styles.navBtn}>
              <ChevronLeft size={24} color={colors.onSurface} />
            </HapticButton>
            <View style={styles.headerRight}>
              <HapticButton onPress={handleEdit} style={styles.navBtn}>
                <Pencil size={20} color={colors.onSurface} />
              </HapticButton>
              <HapticButton onPress={handleDelete} style={styles.navBtn}>
                <Trash2 size={20} color={colors.error} />
              </HapticButton>
            </View>
          </View>
          
          <View style={styles.heroContent}>
            <View style={[styles.heroIconBox, { backgroundColor: accentColor }]}>
              {entry.type === 'EVENT' && <CalendarDays size={32} color="#FFF" />}
              {entry.type === 'REMINDER' && <Clock size={32} color="#FFF" />}
              {entry.type === 'TASK' && <CheckSquareIcon size={32} color="#FFF" />}
              {entry.type === 'BIRTHDAY' && <Gift size={32} color="#FFF" />}
            </View>
            <Text style={[TypeScale.headlineSmall, styles.heroTitle, { color: colors.onSurface }]}>
              {entry.title}
            </Text>
            <View style={[styles.typePill, { backgroundColor: `${accentColor}20` }]}>
              <Text style={[TypeScale.labelMedium, { color: accentColor, fontWeight: '700' }]}>
                {entry.type}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.body}>
          {/* Main Info */}
          {renderInfoTile(CalendarDays, 'Date', formatDateDisplay(entry.date), accentColor)}

          {entry.type === 'EVENT' && (
            <>
              {renderInfoTile(
                Clock, 
                'Time', 
                (entry as CalendarEvent).allDay 
                  ? 'All Day' 
                  : `${formatTime((entry as CalendarEvent).startTime)} – ${formatTime((entry as CalendarEvent).endTime)}`, 
                accentColor
              )}
              {(entry as CalendarEvent).location && renderInfoTile(MapPin, 'Location', (entry as CalendarEvent).location, accentColor)}
            </>
          )}

          {entry.type === 'REMINDER' && (
            <>
              {renderInfoTile(Clock, 'Alert Time', formatTime((entry as Reminder).time), accentColor)}
              {(entry as Reminder).repeat !== 'NONE' && renderInfoTile(RefreshCw, 'Repeat', (entry as Reminder).repeat, accentColor)}
            </>
          )}

          {entry.type === 'TASK' && (
            <>
              {renderInfoTile(
                (entry as Task).priority === 'HIGH' ? ArrowUp : (entry as Task).priority === 'LOW' ? ArrowDown : Minus,
                'Priority',
                (entry as Task).priority,
                (entry as Task).priority === 'HIGH' ? '#E64A19' : (entry as Task).priority === 'MEDIUM' ? '#FFB300' : '#43A047'
              )}
              <HapticButton 
                onPress={() => {
                  haptics.success();
                  toggleTaskComplete(entry.id);
                }}
                style={[styles.taskToggle, { backgroundColor: (entry as Task).completed ? `${accentColor}12` : colors.surface, borderColor: colors.outlineVariant }]}
              >
                {(entry as Task).completed ? (
                  <CheckCircle2 size={24} color={accentColor} />
                ) : (
                  <Circle size={24} color={colors.outline} />
                )}
                <Text style={[TypeScale.bodyLarge, { color: colors.onSurface, fontWeight: '600' }]}>
                  {(entry as Task).completed ? 'Completed' : 'Mark as Done'}
                </Text>
              </HapticButton>
            </>
          )}

          {entry.type === 'BIRTHDAY' && (
            <>
              {renderInfoTile(User, 'Person', (entry as Birthday).personName, accentColor)}
              {(entry as Birthday).birthYear && renderInfoTile(Gift, 'Age', `Turning ${calculateAge((entry as Birthday).birthYear!)}`, accentColor)}
              {renderInfoTile(AlertTriangle, 'Countdown', `${daysUntilBirthday(entry.date)} days remaining`, accentColor)}
            </>
          )}

          {/* Notes Section */}
          {entry.notes && (
            <View style={styles.notesSection}>
              <View style={styles.sectionHeader}>
                <AlignLeft size={18} color={colors.onSurfaceVariant} />
                <Text style={[TypeScale.titleSmall, { color: colors.onSurfaceVariant }]}>Notes</Text>
              </View>
              <View style={[styles.notesBox, { backgroundColor: colors.surface, borderColor: colors.outlineVariant }]}>
                <Text style={[TypeScale.bodyLarge, { color: colors.onSurface, lineHeight: 24 }]}>
                  {entry.notes}
                </Text>
              </View>
            </View>
          )}
        </View>
      </ScrollView>
    </AnimatedScreen>
  );
}

function CheckSquareIcon({ size, color }: { size: number; color: string }) {
  return <CheckCircle2 size={size} color={color} />;
}

const styles = StyleSheet.create({
  scrollView: { flex: 1 },
  scrollContent: { flexGrow: 1 },
  hero: {
    paddingBottom: 40,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  headerRight: { flexDirection: 'row', gap: 4 },
  navBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroContent: {
    alignItems: 'center',
    paddingHorizontal: 24,
    marginTop: 12,
  },
  heroIconBox: {
    width: 72,
    height: 72,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  heroTitle: {
    textAlign: 'center',
    fontWeight: '800',
    marginBottom: 12,
  },
  typePill: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 999,
  },
  body: {
    padding: 20,
    gap: 16,
  },
  tile: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 20,
    borderWidth: 1.5,
  },
  tileIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  tileContent: { flex: 1 },
  taskToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderRadius: 24,
    borderWidth: 1.5,
    gap: 16,
    marginTop: 8,
  },
  notesSection: { marginTop: 12, gap: 12 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 4 },
  notesBox: {
    padding: 20,
    borderRadius: 24,
    borderWidth: 1.5,
  },
});
