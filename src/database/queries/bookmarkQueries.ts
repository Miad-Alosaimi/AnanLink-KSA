import { getDatabase } from '../db';
import { Bookmark, Opportunity } from '../../types';

export const toggleBookmark = async (
  userId: number,
  opportunityId: number
): Promise<boolean> => {
  const db = getDatabase();
  const existing = await db.getFirstAsync<{ id: number }>(
    'SELECT id FROM bookmarks WHERE userId = ? AND opportunityId = ?',
    [userId, opportunityId]
  );

  if (existing) {
    await db.runAsync('DELETE FROM bookmarks WHERE userId = ? AND opportunityId = ?', [
      userId,
      opportunityId,
    ]);
    return false;
  } else {
    await db.runAsync(
      'INSERT INTO bookmarks (userId, opportunityId) VALUES (?, ?)',
      [userId, opportunityId]
    );
    return true;
  }
};

export const isBookmarked = async (
  userId: number,
  opportunityId: number
): Promise<boolean> => {
  const db = getDatabase();
  const result = await db.getFirstAsync<{ id: number }>(
    'SELECT id FROM bookmarks WHERE userId = ? AND opportunityId = ?',
    [userId, opportunityId]
  );
  return !!result;
};

export const getUserBookmarks = async (userId: number): Promise<Opportunity[]> => {
  const db = getDatabase();
  return db.getAllAsync<Opportunity>(
    `SELECT o.* FROM opportunities o
     INNER JOIN bookmarks b ON o.id = b.opportunityId
     WHERE b.userId = ?
     ORDER BY b.createdAt DESC`,
    [userId]
  );
};

export const getBookmarkCount = async (userId: number): Promise<number> => {
  const db = getDatabase();
  const result = await db.getFirstAsync<{ count: number }>(
    'SELECT COUNT(*) as count FROM bookmarks WHERE userId = ?',
    [userId]
  );
  return result?.count ?? 0;
};

export const getBookmarkedIds = async (userId: number): Promise<number[]> => {
  const db = getDatabase();
  const rows = await db.getAllAsync<{ opportunityId: number }>(
    'SELECT opportunityId FROM bookmarks WHERE userId = ?',
    [userId]
  );
  return rows.map((r) => r.opportunityId);
};
