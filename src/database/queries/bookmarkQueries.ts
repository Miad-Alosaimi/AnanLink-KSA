import { getDatabase } from '../db';
import { Bookmark, Opportunity } from '../../types';
import { OpportunityType } from '../../types/opportunity.types';

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

/** Count bookmarks grouped by opportunity type (used by profile stats). */
export const getBookmarkCountByType = async (
  userId: number
): Promise<Record<OpportunityType, number>> => {
  const db = getDatabase();
  const results = await db.getAllAsync<{ type: string; count: number }>(
    `SELECT o.type AS type, COUNT(*) AS count
     FROM bookmarks b INNER JOIN opportunities o ON b.opportunityId = o.id
     WHERE b.userId = ? GROUP BY o.type`,
    [userId]
  );
  const counts: Record<string, number> = {};
  for (const row of results) {
    counts[row.type] = row.count;
  }
  return {
    bootcamp: counts['bootcamp'] ?? 0,
    internship: counts['internship'] ?? 0,
    opensource: counts['opensource'] ?? 0,
    volunteer: counts['volunteer'] ?? 0,
  };
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
