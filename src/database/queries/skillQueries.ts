import { getDatabase } from '../db';
import { SKILL_TRACKS, getTrackById } from '../../constants/skillTracks';

export interface SkillProgressRow {
  userId: number;
  trackId: string;
  unitIndex: number;
  completedAt: string;
}

/**
 * Mark a unit as completed for a user. Idempotent — does nothing if already completed.
 * Returns true if the row was newly inserted (i.e. user should earn XP), false otherwise.
 */
export const completeUnit = async (
  userId: number,
  trackId: string,
  unitIndex: number
): Promise<boolean> => {
  const db = getDatabase();
  const existing = await db.getFirstAsync<{ id: number }>(
    'SELECT id FROM user_skill_progress WHERE userId = ? AND trackId = ? AND unitIndex = ?',
    [userId, trackId, unitIndex]
  );
  if (existing) return false;

  await db.runAsync(
    'INSERT INTO user_skill_progress (userId, trackId, unitIndex) VALUES (?, ?, ?)',
    [userId, trackId, unitIndex]
  );
  return true;
};

/**
 * Undo a unit completion. Returns true if a row was deleted (caller should deduct XP).
 */
export const uncompleteUnit = async (
  userId: number,
  trackId: string,
  unitIndex: number
): Promise<boolean> => {
  const db = getDatabase();
  const result = await db.runAsync(
    'DELETE FROM user_skill_progress WHERE userId = ? AND trackId = ? AND unitIndex = ?',
    [userId, trackId, unitIndex]
  );
  return (result.changes ?? 0) > 0;
};

/** All completed (trackId, unitIndex) pairs for a user, flattened. */
export const getUserProgress = async (userId: number): Promise<SkillProgressRow[]> => {
  const db = getDatabase();
  return db.getAllAsync<SkillProgressRow>(
    'SELECT * FROM user_skill_progress WHERE userId = ? ORDER BY completedAt ASC',
    [userId]
  );
};

/** Set of completed unit indices for a specific track. */
export const getCompletedUnitsForTrack = async (
  userId: number,
  trackId: string
): Promise<number[]> => {
  const db = getDatabase();
  const rows = await db.getAllAsync<{ unitIndex: number }>(
    'SELECT unitIndex FROM user_skill_progress WHERE userId = ? AND trackId = ? ORDER BY unitIndex ASC',
    [userId, trackId]
  );
  return rows.map(r => r.unitIndex);
};

/** Quick per-track counts for the whole catalog. Returns { trackId: completedCount }. */
export const getCompletionCountsByTrack = async (
  userId: number
): Promise<Record<string, number>> => {
  const db = getDatabase();
  const rows = await db.getAllAsync<{ trackId: string; count: number }>(
    `SELECT trackId, COUNT(*) AS count
     FROM user_skill_progress
     WHERE userId = ? GROUP BY trackId`,
    [userId]
  );
  const counts: Record<string, number> = {};
  for (const row of rows) {
    counts[row.trackId] = row.count;
  }
  return counts;
};

/** Total units completed across all tracks for a user. */
export const getTotalCompletedUnits = async (userId: number): Promise<number> => {
  const db = getDatabase();
  const result = await db.getFirstAsync<{ count: number }>(
    'SELECT COUNT(*) AS count FROM user_skill_progress WHERE userId = ?',
    [userId]
  );
  return result?.count ?? 0;
};

/**
 * Evaluates unlock rules for a track.
 * - No prerequisite → always unlocked
 * - Prerequisite with a specific required track → unlocked once that track has enough units
 * - Prerequisite without a specific track → unlocked once the user has enough units anywhere
 */
export const isTrackUnlocked = async (
  userId: number,
  trackId: string
): Promise<boolean> => {
  const track = getTrackById(trackId);
  if (!track || !track.prerequisite) return true;

  const { requiredTrackId, unitsRequired } = track.prerequisite;

  if (requiredTrackId) {
    const counts = await getCompletionCountsByTrack(userId);
    return (counts[requiredTrackId] ?? 0) >= unitsRequired;
  }

  const total = await getTotalCompletedUnits(userId);
  return total >= unitsRequired;
};

/** Batch version — returns `{ trackId: isUnlocked }` for all tracks in one pass. */
export const getAllUnlockStates = async (
  userId: number
): Promise<Record<string, boolean>> => {
  const counts = await getCompletionCountsByTrack(userId);
  const total = Object.values(counts).reduce((sum, n) => sum + n, 0);

  const states: Record<string, boolean> = {};
  for (const track of SKILL_TRACKS) {
    if (!track.prerequisite) {
      states[track.id] = true;
      continue;
    }
    const { requiredTrackId, unitsRequired } = track.prerequisite;
    const have = requiredTrackId ? (counts[requiredTrackId] ?? 0) : total;
    states[track.id] = have >= unitsRequired;
  }
  return states;
};
