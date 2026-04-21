import { getDatabase } from '../db';
import { QRCheckIn } from '../../types';

// ── Legacy helper (writes to qr_checkins for backwards compat) ───────────
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

// ── Canonical scan log (writes to scan_logs with full spec fields) ────────
export const saveScanLog = async (params: {
  userId: number;
  eventId: string;
  eventTitle: string;
  eventType: string;
  xpEarned: number;
  rawQrData: string;
}): Promise<void> => {
  const db = getDatabase();
  await db.runAsync(
    `INSERT INTO scan_logs (user_uid, event_id, event_title, event_type, xp_earned, raw_qr_data)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [
      params.userId,
      params.eventId,
      params.eventTitle,
      params.eventType,
      params.xpEarned,
      params.rawQrData,
    ]
  );
};

export const getScanLogs = async (userId: number): Promise<{
  id: number;
  user_uid: number;
  event_id: string;
  event_title: string;
  event_type: string;
  xp_earned: number;
  scanned_at: string;
  raw_qr_data: string;
}[]> => {
  const db = getDatabase();
  return db.getAllAsync(
    'SELECT * FROM scan_logs WHERE user_uid = ? ORDER BY scanned_at DESC',
    [userId]
  );
};

export const getScanLogCount = async (userId: number): Promise<number> => {
  const db = getDatabase();
  const result = await db.getFirstAsync<{ count: number }>(
    'SELECT COUNT(*) as count FROM scan_logs WHERE user_uid = ?',
    [userId]
  );
  return result?.count ?? 0;
};

// ── Legacy helpers ────────────────────────────────────────────────────────
export const getUserCheckIns = async (userId: number): Promise<QRCheckIn[]> => {
  const db = getDatabase();
  return db.getAllAsync<QRCheckIn>(
    'SELECT * FROM qr_checkins WHERE userId = ? ORDER BY scannedAt DESC',
    [userId]
  );
};

export const getCheckInCount = async (userId: number): Promise<number> => {
  const db = getDatabase();
  // Prefer scan_logs count; fall back to qr_checkins for legacy installs
  const scanCount = await getScanLogCount(userId);
  if (scanCount > 0) return scanCount;
  const result = await db.getFirstAsync<{ count: number }>(
    'SELECT COUNT(*) as count FROM qr_checkins WHERE userId = ?',
    [userId]
  );
  return result?.count ?? 0;
};
