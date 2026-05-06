import AsyncStorage from '@react-native-async-storage/async-storage';
import { useState, useEffect, useCallback } from 'react';

/**
 * Lightweight user preferences manager backed by AsyncStorage.
 * Used for non-sensitive on/off settings like the notification toggle.
 *
 * Why AsyncStorage instead of SQLite?
 * - These settings are tiny key/value pairs, not relational
 * - AsyncStorage is faster for this (no query overhead)
 * - Survives app restarts; cleared on uninstall — exactly what we want for prefs
 */

const PREF_KEYS = {
  notificationsEnabled: '@ananlink_pref_notifications_enabled',
} as const;

export const getNotificationsEnabled = async (): Promise<boolean> => {
  try {
    const v = await AsyncStorage.getItem(PREF_KEYS.notificationsEnabled);
    // Default to true on first launch
    return v === null ? true : v === 'true';
  } catch {
    return true;
  }
};

export const setNotificationsEnabled = async (enabled: boolean): Promise<void> => {
  await AsyncStorage.setItem(PREF_KEYS.notificationsEnabled, String(enabled));
};

/**
 * React hook for the notifications toggle.
 * Reads on mount, writes on change. Safe for use in multiple components — they
 * each track their own state independently, but reads after write reflect the
 * latest value.
 */
export const useNotificationsPref = () => {
  const [enabled, setEnabled] = useState<boolean>(true);
  const [isLoaded, setIsLoaded] = useState<boolean>(false);

  useEffect(() => {
    getNotificationsEnabled().then(v => {
      setEnabled(v);
      setIsLoaded(true);
    });
  }, []);

  const toggle = useCallback(async (next?: boolean) => {
    const newValue = next === undefined ? !enabled : next;
    setEnabled(newValue);
    await setNotificationsEnabled(newValue);
  }, [enabled]);

  return { enabled, isLoaded, toggle };
};
