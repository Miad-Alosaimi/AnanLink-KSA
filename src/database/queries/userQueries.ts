import { getDatabase } from '../db';
import { User, UserSkill, Achievement, RegisterData, LeaderboardEntry } from '../../types';

export const createUser = async (
  userData: Omit<RegisterData, 'skills'>
): Promise<number> => {
  const db = getDatabase();
  const fullName = `${userData.firstName} ${userData.lastName}`;
  const result = await db.runAsync(
    `INSERT INTO users (fullName, firstName, lastName, email, university, major, specialty, academicYear, password)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      fullName,
      userData.firstName,
      userData.lastName,
      userData.email,
      userData.university,
      userData.major,
      userData.specialty,
      userData.academicYear,
      userData.password,
    ]
  );
  return result.lastInsertRowId;
};

export const getUserByEmail = async (email: string): Promise<User | null> => {
  const db = getDatabase();
  return db.getFirstAsync<User>('SELECT * FROM users WHERE email = ? LIMIT 1', [email]);
};

export const verifyUserCredentials = async (
  email: string,
  password: string
): Promise<User | null> => {
  const db = getDatabase();
  return db.getFirstAsync<User>(
    "SELECT * FROM users WHERE email = ? AND password = ? LIMIT 1",
    [email, password]
  );
};

export const getUserById = async (id: number): Promise<User | null> => {
  const db = getDatabase();
  return db.getFirstAsync<User>('SELECT * FROM users WHERE id = ? LIMIT 1', [id]);
};

export const updateUserXP = async (userId: number, xpToAdd: number): Promise<void> => {
  const db = getDatabase();
  await db.runAsync(
    `UPDATE users
     SET xp = xp + ?,
         level = MAX(1, (xp + ?) / 100 + 1)
     WHERE id = ?`,
    [xpToAdd, xpToAdd, userId]
  );
};

export const addUserSkills = async (userId: number, skills: string[]): Promise<void> => {
  const db = getDatabase();
  for (const skill of skills) {
    await db.runAsync(
      `INSERT OR IGNORE INTO user_skills (userId, skillName) VALUES (?, ?)`,
      [userId, skill]
    );
  }
};

export const getUserSkills = async (userId: number): Promise<UserSkill[]> => {
  const db = getDatabase();
  return db.getAllAsync<UserSkill>('SELECT * FROM user_skills WHERE userId = ?', [userId]);
};

export const getUserAchievements = async (userId: number): Promise<Achievement[]> => {
  const db = getDatabase();
  return db.getAllAsync<Achievement>(
    'SELECT * FROM achievements WHERE userId = ? ORDER BY earnedAt DESC',
    [userId]
  );
};

export const addAchievement = async (
  userId: number,
  badge: string,
  title: string,
  description: string
): Promise<void> => {
  const db = getDatabase();
  await db.runAsync(
    `INSERT INTO achievements (userId, badgeIcon, title, description) VALUES (?, ?, ?, ?)`,
    [userId, badge, title, description]
  );
};

export type LeaderboardPeriod = 'weekly' | 'monthly' | 'alltime';

export const getLeaderboard = async (
  limit = 20,
  period: LeaderboardPeriod = 'alltime'
): Promise<LeaderboardEntry[]> => {
  const db = getDatabase();

  let rows: Array<User & { periodXp?: number }>;

  if (period === 'alltime') {
    rows = await db.getAllAsync<User>(
      'SELECT * FROM users ORDER BY xp DESC LIMIT ?',
      [limit]
    );
    return rows.map((user, index) => ({
      id: user.id,
      fullName: user.fullName,
      university: user.university,
      xp: user.xp,
      level: user.level,
      rank: index + 1,
      avatar: user.avatar,
    }));
  }

  const interval = period === 'weekly' ? '-7 days' : '-30 days';
  const periodRows = await db.getAllAsync<{ id: number; fullName: string; university: string; avatar: string | null; level: number; periodXp: number }>(
    `SELECT u.id, u.fullName, u.university, u.avatar, u.level,
            COALESCE(SUM(q.xpEarned), 0) as periodXp
     FROM users u
     LEFT JOIN qr_checkins q ON u.id = q.userId
       AND q.scannedAt >= datetime('now', ?)
     GROUP BY u.id
     ORDER BY periodXp DESC
     LIMIT ?`,
    [interval, limit]
  );

  return periodRows.map((row, index) => ({
    id: row.id,
    fullName: row.fullName,
    university: row.university,
    xp: row.periodXp,
    level: row.level,
    rank: index + 1,
    avatar: row.avatar,
  }));
};
