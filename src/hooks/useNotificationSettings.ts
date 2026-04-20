import { useCallback } from 'react';
import { useEventsStore } from '../stores/useEventsStore';
import {
  useNotificationStore,
  selectMasterEnabled,
  selectRemindersEnabled,
  selectEventsEnabled,
  selectBirthdaysEnabled,
} from '../stores/useNotificationStore';
import { NotificationService } from '../services/NotificationService';
import { useHaptics } from './useHaptics';

export function useNotificationSettings() {
  const haptics = useHaptics();
  const entries = useEventsStore((s) => s.entries);

  const masterEnabled    = useNotificationStore(selectMasterEnabled);
  const remindersEnabled = useNotificationStore(selectRemindersEnabled);
  const eventsEnabled    = useNotificationStore(selectEventsEnabled);
  const birthdaysEnabled = useNotificationStore(selectBirthdaysEnabled);

  const {
    setMasterEnabled,
    setRemindersEnabled,
    setEventsEnabled,
    setBirthdaysEnabled,
  } = useNotificationStore();

  const handleMasterToggle = useCallback(async (val: boolean) => {
    haptics.selection();
    if (val) {
      const status = await NotificationService.requestPermissions();
      if (status === 'denied') {
        NotificationService.openOSSettings();
        return;
      }
      await NotificationService.syncAll(entries);
    } else {
      setMasterEnabled(false);
      await NotificationService.syncAll([]); 
    }
  }, [entries, haptics, setMasterEnabled]);

  const handleRemindersToggle = useCallback(async (val: boolean) => {
    haptics.selection();
    setRemindersEnabled(val);
    await NotificationService.onTypeToggle('REMINDER', val, entries);
  }, [entries, haptics, setRemindersEnabled]);

  const handleEventsToggle = useCallback(async (val: boolean) => {
    haptics.selection();
    setEventsEnabled(val);
    await NotificationService.onTypeToggle('EVENT', val, entries);
  }, [entries, haptics, setEventsEnabled]);

  const handleBirthdaysToggle = useCallback(async (val: boolean) => {
    haptics.selection();
    setBirthdaysEnabled(val);
    await NotificationService.onTypeToggle('BIRTHDAY', val, entries);
  }, [entries, haptics, setBirthdaysEnabled]);

  return {
    masterEnabled,
    remindersEnabled,
    eventsEnabled,
    birthdaysEnabled,
    handleMasterToggle,
    handleRemindersToggle,
    handleEventsToggle,
    handleBirthdaysToggle,
  };
}
