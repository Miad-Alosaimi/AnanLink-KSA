import { getDatabase } from '../db';

export const getSkillProgress = async (userId: number, trackId: string): Promise<number[]> => {
  const db = getDatabase();
  const row = await db.getFirstAsync<{ completedUnits: string }>(
    'SELECT completedUnits FROM skill_progress WHERE userId = ? AND trackId = ?',
    [userId, trackId]
  );
  if (!row) return [];
  try {
    return JSON.parse(row.completedUnits);
  } catch {
    return [];
  }
};

export const saveSkillProgress = async (
  userId: number,
  trackId: string,
  completedUnits: number[]
): Promise<void> => {
  const db = getDatabase();
  await db.runAsync(
    `INSERT INTO skill_progress (userId, trackId, completedUnits)
     VALUES (?, ?, ?)
     ON CONFLICT(userId, trackId)
     DO UPDATE SET completedUnits = excluded.completedUnits,
                   updatedAt = datetime('now')`,
    [userId, trackId, JSON.stringify(completedUnits)]
  );
};
