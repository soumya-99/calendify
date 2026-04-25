import { storage } from '@/src/hooks/useMMKV';
import * as BackgroundTask from 'expo-background-task';
import * as TaskManager from 'expo-task-manager';
import { MMKV_KEYS } from '../constants/mmkvKeys';
import { NotificationService } from '../services/NotificationService';
import type { AnyEntry } from '../types/entries';

export const BACKGROUND_SYNC_TASK = 'CALENDIFY_NOTIF_SYNC';

TaskManager.defineTask(BACKGROUND_SYNC_TASK, async () => {
  try {
    const raw = storage.getString(MMKV_KEYS.ENTRIES);
    if (!raw) return BackgroundTask.BackgroundTaskResult.Success;

    const parsed = JSON.parse(raw);
    const entries: AnyEntry[] = parsed.state?.entries || parsed.entries || [];
    await NotificationService.syncAll(entries);

    return BackgroundTask.BackgroundTaskResult.Success;
  } catch (err) {
    console.error('[CALENDIFY] Background sync failed:', err);
    return BackgroundTask.BackgroundTaskResult.Failed;
  }
});

export async function registerBackgroundSync(): Promise<void> {
  const status = await BackgroundTask.getStatusAsync();
  if (status === BackgroundTask.BackgroundTaskStatus.Restricted) return;

  const already = await TaskManager.isTaskRegisteredAsync(BACKGROUND_SYNC_TASK);
  if (already) return;

  await BackgroundTask.registerTaskAsync(BACKGROUND_SYNC_TASK, {
    minimumInterval: 15, // Minutes (minimum allowed is 15)
  });
}

export async function unregisterBackgroundSync(): Promise<void> {
  const already = await TaskManager.isTaskRegisteredAsync(BACKGROUND_SYNC_TASK);
  if (already) await BackgroundTask.unregisterTaskAsync(BACKGROUND_SYNC_TASK);
}
