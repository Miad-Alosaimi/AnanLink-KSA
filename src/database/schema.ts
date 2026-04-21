export const CREATE_USERS_TABLE = `
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    fullName TEXT NOT NULL,
    firstName TEXT NOT NULL,
    lastName TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    university TEXT NOT NULL,
    major TEXT NOT NULL,
    specialty TEXT NOT NULL,
    academicYear INTEGER NOT NULL DEFAULT 1,
    xp INTEGER NOT NULL DEFAULT 0,
    level INTEGER NOT NULL DEFAULT 1,
    avatar TEXT,
    password TEXT NOT NULL DEFAULT '',
    createdAt TEXT DEFAULT CURRENT_TIMESTAMP
  );
`;

export const CREATE_USER_SKILLS_TABLE = `
  CREATE TABLE IF NOT EXISTS user_skills (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userId INTEGER NOT NULL,
    skillName TEXT NOT NULL,
    proficiencyLevel TEXT NOT NULL DEFAULT 'beginner',
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
  );
`;

export const CREATE_OPPORTUNITIES_TABLE = `
  CREATE TABLE IF NOT EXISTS opportunities (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    type TEXT NOT NULL CHECK(type IN ('hackathon','internship','opensource','volunteer')),
    organization TEXT NOT NULL,
    description TEXT NOT NULL,
    deadline TEXT,
    location TEXT NOT NULL,
    latitude REAL,
    longitude REAL,
    xpReward INTEGER NOT NULL DEFAULT 0,
    registrationLink TEXT NOT NULL DEFAULT '',
    imageUrl TEXT,
    isActive INTEGER NOT NULL DEFAULT 1,
    createdAt TEXT DEFAULT CURRENT_TIMESTAMP
  );
`;

export const CREATE_BOOKMARKS_TABLE = `
  CREATE TABLE IF NOT EXISTS bookmarks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userId INTEGER NOT NULL,
    opportunityId INTEGER NOT NULL,
    createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (opportunityId) REFERENCES opportunities(id) ON DELETE CASCADE,
    UNIQUE(userId, opportunityId)
  );
`;

export const CREATE_ACHIEVEMENTS_TABLE = `
  CREATE TABLE IF NOT EXISTS achievements (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userId INTEGER NOT NULL,
    badgeIcon TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    earnedAt TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
  );
`;

/** Legacy check-in table — kept for backwards compatibility */
export const CREATE_QR_CHECKINS_TABLE = `
  CREATE TABLE IF NOT EXISTS qr_checkins (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userId INTEGER NOT NULL,
    opportunityId INTEGER,
    eventName TEXT NOT NULL,
    xpEarned INTEGER NOT NULL DEFAULT 0,
    scannedAt TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
  );
`;

/**
 * scan_logs — canonical QR scan record with full event details and raw payload.
 * Column names match the spec: user_uid, event_id, event_title, event_type,
 * xp_earned, scanned_at, raw_qr_data.
 */
export const CREATE_SCAN_LOGS_TABLE = `
  CREATE TABLE IF NOT EXISTS scan_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_uid INTEGER NOT NULL,
    event_id TEXT NOT NULL,
    event_title TEXT NOT NULL,
    event_type TEXT NOT NULL DEFAULT 'event',
    xp_earned INTEGER NOT NULL DEFAULT 0,
    scanned_at TEXT DEFAULT CURRENT_TIMESTAMP,
    raw_qr_data TEXT NOT NULL,
    FOREIGN KEY (user_uid) REFERENCES users(id) ON DELETE CASCADE
  );
`;

/**
 * portfolio_items — user project/achievement portfolio entries.
 */
export const CREATE_PORTFOLIO_ITEMS_TABLE = `
  CREATE TABLE IF NOT EXISTS portfolio_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userId INTEGER NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    category TEXT NOT NULL DEFAULT 'project',
    link TEXT,
    imageUrl TEXT,
    createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
  );
`;

/**
 * cached_events — locally cached API responses for offline support.
 * Each row represents one data source; event_data holds a JSON array.
 */
export const CREATE_CACHED_EVENTS_TABLE = `
  CREATE TABLE IF NOT EXISTS cached_events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    source TEXT NOT NULL UNIQUE,
    event_data TEXT NOT NULL,
    cached_at TEXT DEFAULT CURRENT_TIMESTAMP
  );
`;

export const CREATE_SKILL_PROGRESS_TABLE = `
  CREATE TABLE IF NOT EXISTS skill_progress (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userId INTEGER NOT NULL,
    trackId TEXT NOT NULL,
    completedUnits TEXT NOT NULL DEFAULT '[]',
    updatedAt TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE(userId, trackId)
  );
`;

export const ALL_TABLES = [
  CREATE_USERS_TABLE,
  CREATE_USER_SKILLS_TABLE,
  CREATE_OPPORTUNITIES_TABLE,
  CREATE_BOOKMARKS_TABLE,
  CREATE_ACHIEVEMENTS_TABLE,
  CREATE_QR_CHECKINS_TABLE,
  CREATE_SCAN_LOGS_TABLE,
  CREATE_PORTFOLIO_ITEMS_TABLE,
  CREATE_CACHED_EVENTS_TABLE,
  CREATE_SKILL_PROGRESS_TABLE,
];
