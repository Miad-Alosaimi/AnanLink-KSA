import { getDatabase } from '../db';
import { User } from '../../types';

export interface SuggestedUser extends User {
  // No extra fields — just typed alias for clarity
}

/** Add a friend (idempotent — does nothing if already added). */
export const addFriend = async (userId: number, friendId: number): Promise<void> => {
  if (userId === friendId) return;
  const db = getDatabase();
  await db.runAsync(
    `INSERT OR IGNORE INTO friends (userId, friendId) VALUES (?, ?)`,
    [userId, friendId]
  );
};

export const removeFriend = async (userId: number, friendId: number): Promise<void> => {
  const db = getDatabase();
  await db.runAsync(
    `DELETE FROM friends WHERE userId = ? AND friendId = ?`,
    [userId, friendId]
  );
};

export const getFriends = async (userId: number): Promise<User[]> => {
  const db = getDatabase();
  return db.getAllAsync<User>(
    `SELECT u.* FROM users u
     INNER JOIN friends f ON f.friendId = u.id
     WHERE f.userId = ?
     ORDER BY u.xp DESC`,
    [userId]
  );
};

export const getFriendIds = async (userId: number): Promise<number[]> => {
  const db = getDatabase();
  const rows = await db.getAllAsync<{ friendId: number }>(
    `SELECT friendId FROM friends WHERE userId = ?`,
    [userId]
  );
  return rows.map(r => r.friendId);
};

/**
 * Returns suggested users (people not yet added as friends).
 * Suggestions = mock leaderboard users that were seeded with `isSuggestion = 1`.
 * Excludes already-added friends and the user themselves.
 */
export const getSuggestedFriends = async (userId: number): Promise<User[]> => {
  const db = getDatabase();
  return db.getAllAsync<User>(
    `SELECT * FROM users
     WHERE isSuggestion = 1
       AND id != ?
       AND id NOT IN (SELECT friendId FROM friends WHERE userId = ?)
     ORDER BY xp DESC`,
    [userId, userId]
  );
};

/**
 * Find a user by email (case-insensitive).
 * Used by the "add friend by email" feature.
 * Returns null if no user with that email exists yet.
 */
export const findUserByEmail = async (email: string): Promise<User | null> => {
  const db = getDatabase();
  const trimmed = email.trim().toLowerCase();
  if (!trimmed) return null;
  const row = await db.getFirstAsync<User>(
    `SELECT * FROM users WHERE LOWER(email) = ? LIMIT 1`,
    [trimmed]
  );
  return row ?? null;
};

/**
 * Builds the leaderboard for the user: themselves + all their friends,
 * ranked by XP. The user always appears in the list with a `isMe = true` flag.
 */
export interface LeaderboardEntry extends User {
  rank: number;
  isMe: boolean;
}

export const getLeaderboard = async (userId: number): Promise<LeaderboardEntry[]> => {
  const db = getDatabase();
  const rows = await db.getAllAsync<User>(
    `SELECT * FROM users
     WHERE id = ? OR id IN (SELECT friendId FROM friends WHERE userId = ?)
     ORDER BY xp DESC, id ASC`,
    [userId, userId]
  );
  return rows.map((u, i) => ({ ...u, rank: i + 1, isMe: u.id === userId }));
};
