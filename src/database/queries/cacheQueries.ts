import { getDatabase } from '../db';
import { Opportunity } from '../../types';

const CACHE_TTL_MS = 30 * 60 * 1000; // 30 minutes

interface CacheRow {
  id: number;
  source: string;
  event_data: string;
  cached_at: string;
}

export const getCachedEvents = async (
  source: string
): Promise<{ data: Opportunity[]; isFresh: boolean } | null> => {
  const db = getDatabase();
  const row = await db.getFirstAsync<CacheRow>(
    'SELECT * FROM cached_events WHERE source = ? LIMIT 1',
    [source]
  );
  if (!row) return null;
  try {
    const data: Opportunity[] = JSON.parse(row.event_data);
    const cachedMs = new Date(row.cached_at).getTime();
    const isFresh = Date.now() - cachedMs < CACHE_TTL_MS;
    return { data, isFresh };
  } catch {
    return null;
  }
};

export const saveCachedEvents = async (
  source: string,
  events: Opportunity[]
): Promise<void> => {
  const db = getDatabase();
  await db.runAsync(
    `INSERT INTO cached_events (source, event_data)
     VALUES (?, ?)
     ON CONFLICT(source)
     DO UPDATE SET event_data = excluded.event_data,
                   cached_at = CURRENT_TIMESTAMP`,
    [source, JSON.stringify(events)]
  );
};

export const clearCachedEvents = async (source?: string): Promise<void> => {
  const db = getDatabase();
  if (source) {
    await db.runAsync('DELETE FROM cached_events WHERE source = ?', [source]);
  } else {
    await db.runAsync('DELETE FROM cached_events');
  }
};
