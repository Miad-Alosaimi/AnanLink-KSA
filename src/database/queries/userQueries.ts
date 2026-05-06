import { getDatabase } from '../db';
import { User, UserSkill, Achievement, RegisterData } from '../../types';

export const createUser = async (
  userData: Omit<RegisterData, 'password' | 'skills'>
): Promise<number> => {
  const db = getDatabase();
  const fullName = `${userData.firstName} ${userData.lastName}`;
  const result = await db.runAsync(
    `INSERT INTO users (fullName, firstName, lastName, email, university, major, specialty, academicYear)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      fullName,
      userData.firstName,
      userData.lastName,
      userData.email,
      userData.university,
      userData.major,
      userData.specialty,
      userData.academicYear,
    ]
  );
  return result.lastInsertRowId;
};

export const getUserByEmail = async (email: string): Promise<User | null> => {
  const db = getDatabase();
  return db.getFirstAsync<User>('SELECT * FROM users WHERE email = ? LIMIT 1', [email]);
};

export const getUserById = async (id: number): Promise<User | null> => {
  const db = getDatabase();
  return db.getFirstAsync<User>('SELECT * FROM users WHERE id = ? LIMIT 1', [id]);
};

export const updateUserXP = async (userId: number, xpToAdd: number): Promise<void> => {
  const db = getDatabase();
  // Progressive level thresholds: 0/100/300/600/1000/1500/2200/3000 (see utils/levelCalc)
  // Clamp XP to zero minimum so unchecking a unit never produces negative XP.
  // The CASE expression re-evaluates level on every update, so deductions
  // (e.g. uncompleting a skill unit) also re-calibrate the user's level.
  await db.runAsync(
    `UPDATE users
     SET xp = MAX(0, xp + ?),
         level = CASE
           WHEN MAX(0, xp + ?) >= 3000 THEN 8
           WHEN MAX(0, xp + ?) >= 2200 THEN 7
           WHEN MAX(0, xp + ?) >= 1500 THEN 6
           WHEN MAX(0, xp + ?) >= 1000 THEN 5
           WHEN MAX(0, xp + ?) >= 600  THEN 4
           WHEN MAX(0, xp + ?) >= 300  THEN 3
           WHEN MAX(0, xp + ?) >= 100  THEN 2
           ELSE 1
         END
     WHERE id = ?`,
    [xpToAdd, xpToAdd, xpToAdd, xpToAdd, xpToAdd, xpToAdd, xpToAdd, xpToAdd, userId]
  );
};

export const addUserSkills = async (userId: number, skills: string[]): Promise<void> => {
  const db = getDatabase();
  for (const skill of skills) {
    await db.runAsync(
      `INSERT OR IGNORE INTO user_skills (userId, skill) VALUES (?, ?)`,
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

/**
 * Update editable profile fields. Pass undefined for fields you don't want to change.
 * Always updates the updatedAt timestamp.
 */
export interface UpdateProfileInput {
  firstName?: string;
  lastName?: string;
  university?: string;
  major?: string;
  specialty?: string;
  academicYear?: string;
  avatarUri?: string | null;
}

export const updateUserProfile = async (
  userId: number,
  patch: UpdateProfileInput
): Promise<void> => {
  const db = getDatabase();
  const fields: string[] = [];
  const values: (string | number | null)[] = [];

  if (patch.firstName !== undefined) {
    fields.push('firstName = ?'); values.push(patch.firstName);
  }
  if (patch.lastName !== undefined) {
    fields.push('lastName = ?'); values.push(patch.lastName);
  }
  if (patch.firstName !== undefined || patch.lastName !== undefined) {
    // Recompute fullName from latest first/last
    fields.push("fullName = (firstName || ' ' || lastName)");
  }
  if (patch.university !== undefined) {
    fields.push('university = ?'); values.push(patch.university);
  }
  if (patch.major !== undefined) {
    fields.push('major = ?'); values.push(patch.major);
  }
  if (patch.specialty !== undefined) {
    fields.push('specialty = ?'); values.push(patch.specialty);
  }
  if (patch.academicYear !== undefined) {
    fields.push('academicYear = ?'); values.push(patch.academicYear);
  }
  if (patch.avatarUri !== undefined) {
    fields.push('avatarUri = ?'); values.push(patch.avatarUri);
  }
  if (fields.length === 0) return;

  // Only include updatedAt if the column actually exists in this device's DB.
  // The column is added by migration v5, but older installs where the migration
  // failed silently would crash here without this guard.
  const tableInfo = await db.getAllAsync<{ name: string }>('PRAGMA table_info(users)');
  if (tableInfo.some(col => col.name === 'updatedAt')) {
    fields.push("updatedAt = datetime('now')");
  }
  values.push(userId);

  await db.runAsync(
    `UPDATE users SET ${fields.join(', ')} WHERE id = ?`,
    values
  );
};
