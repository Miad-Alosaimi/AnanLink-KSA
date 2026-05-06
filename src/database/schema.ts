/**
 * SCHEMA VERSION HISTORY
 * v1 — initial schema (hackathon type, mock data)
 * v2 — adds user_skill_progress, MAX(0,...) XP clamp
 * v3 — opportunity type 'hackathon' → 'bootcamp'; adds rich opportunity columns
 *      (subtitle, startDate, endDate, seats, region, city, category, jobType,
 *      level, durationWeeks, extId). Drops + reseeds `opportunities` on upgrade.
 * v4 — adds friends table + avatarUri column on users; wipes mock leaderboard
 *      users so they only appear as suggestions, never as default leaderboard.
 * v5 — adds updatedAt column to users (required by updateUserProfile).
 */
export const SCHEMA_VERSION = 5;

export const CREATE_USERS_TABLE = `
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    fullName TEXT NOT NULL,
    firstName TEXT NOT NULL,
    lastName TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    university TEXT NOT NULL,
    major TEXT NOT NULL,
    specialty TEXT NOT NULL,
    academicYear TEXT,
    avatarUri TEXT,
    isSuggestion INTEGER NOT NULL DEFAULT 0,
    xp INTEGER NOT NULL DEFAULT 0,
    level INTEGER NOT NULL DEFAULT 1,
    createdAt TEXT NOT NULL DEFAULT (datetime('now')),
    updatedAt TEXT NOT NULL DEFAULT (datetime('now'))
  );
`;

export const CREATE_FRIENDS_TABLE = `
  CREATE TABLE IF NOT EXISTS friends (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userId INTEGER NOT NULL,
    friendId INTEGER NOT NULL,
    addedAt TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (friendId) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE(userId, friendId)
  );
`;

export const CREATE_USER_SKILLS_TABLE = `
  CREATE TABLE IF NOT EXISTS user_skills (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userId INTEGER NOT NULL,
    skill TEXT NOT NULL,
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE(userId, skill)
  );
`;

export const CREATE_OPPORTUNITIES_TABLE = `
  CREATE TABLE IF NOT EXISTS opportunities (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    extId TEXT,
    type TEXT NOT NULL CHECK(type IN ('bootcamp','internship','opensource','volunteer')),
    title TEXT NOT NULL,
    subtitle TEXT,
    organization TEXT NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    deadline TEXT,
    startDate TEXT,
    endDate TEXT,
    seats INTEGER,
    location TEXT NOT NULL DEFAULT '',
    city TEXT,
    region TEXT,
    category TEXT,
    jobType TEXT,
    level TEXT,
    durationWeeks INTEGER,
    latitude REAL,
    longitude REAL,
    xpReward INTEGER NOT NULL DEFAULT 0,
    registrationLink TEXT NOT NULL DEFAULT '',
    imageUrl TEXT,
    isActive INTEGER NOT NULL DEFAULT 1,
    createdAt TEXT NOT NULL DEFAULT (datetime('now')),
    UNIQUE(extId, type)
  );
`;

export const CREATE_BOOKMARKS_TABLE = `
  CREATE TABLE IF NOT EXISTS bookmarks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userId INTEGER NOT NULL,
    opportunityId INTEGER NOT NULL,
    createdAt TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (opportunityId) REFERENCES opportunities(id) ON DELETE CASCADE,
    UNIQUE(userId, opportunityId)
  );
`;

export const CREATE_ACHIEVEMENTS_TABLE = `
  CREATE TABLE IF NOT EXISTS achievements (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userId INTEGER NOT NULL,
    code TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    badgeIcon TEXT NOT NULL,
    earnedAt TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE(userId, code)
  );
`;

export const CREATE_QR_CHECKINS_TABLE = `
  CREATE TABLE IF NOT EXISTS qr_checkins (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userId INTEGER NOT NULL,
    opportunityId INTEGER,
    eventName TEXT NOT NULL,
    xpEarned INTEGER NOT NULL DEFAULT 0,
    scannedAt TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
  );
`;

export const CREATE_USER_SKILL_PROGRESS_TABLE = `
  CREATE TABLE IF NOT EXISTS user_skill_progress (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userId INTEGER NOT NULL,
    trackId TEXT NOT NULL,
    unitIndex INTEGER NOT NULL,
    completedAt TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE(userId, trackId, unitIndex)
  );
`;

/** schema_meta tracks migration state. */
export const CREATE_SCHEMA_META_TABLE = `
  CREATE TABLE IF NOT EXISTS schema_meta (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL
  );
`;

export const ALL_TABLES = [
  CREATE_SCHEMA_META_TABLE,
  CREATE_USERS_TABLE,
  CREATE_USER_SKILLS_TABLE,
  CREATE_OPPORTUNITIES_TABLE,
  CREATE_BOOKMARKS_TABLE,
  CREATE_ACHIEVEMENTS_TABLE,
  CREATE_QR_CHECKINS_TABLE,
  CREATE_USER_SKILL_PROGRESS_TABLE,
  CREATE_FRIENDS_TABLE,
];
