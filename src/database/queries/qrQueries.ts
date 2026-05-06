import { getDatabase } from '../db';
import { QRCheckIn } from '../../types';

export const saveQRCheckIn = async (
  userId: number,
  eventName: string,
  xpEarned: number,
  opportunityId?: number
): Promise<void> => {
  const db = getDatabase();
  await db.runAsync(
    `INSERT INTO qr_checkins (userId, opportunityId, eventName, xpEarned) VALUES (?, ?, ?, ?)`,
    [userId, opportunityId ?? null, eventName, xpEarned]
  );
};

export const getUserCheckIns = async (userId: number): Promise<QRCheckIn[]> => {
  const db = getDatabase();
  return db.getAllAsync<QRCheckIn>(
    'SELECT * FROM qr_checkins WHERE userId = ? ORDER BY scannedAt DESC',
    [userId]
  );
};

export const getCheckInCount = async (userId: number): Promise<number> => {
  const db = getDatabase();
  const result = await db.getFirstAsync<{ count: number }>(
    'SELECT COUNT(*) as count FROM qr_checkins WHERE userId = ?',
    [userId]
  );
  return result?.count ?? 0;
};
