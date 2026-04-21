import * as SQLite from 'expo-sqlite';
import { ALL_TABLES } from './schema';
import { SEED_OPPORTUNITIES, MOCK_LEADERBOARD_USERS } from './seeds';

let db: SQLite.SQLiteDatabase | null = null;

export const getDatabase = (): SQLite.SQLiteDatabase => {
  if (!db) {
    db = SQLite.openDatabaseSync('ananlink.db');
  }
  return db;
};

export const initializeDatabase = async (): Promise<void> => {
  const database = getDatabase();

  await database.execAsync('PRAGMA foreign_keys = ON;');
  await database.execAsync('PRAGMA journal_mode = WAL;');

  for (const tableSQL of ALL_TABLES) {
    await database.execAsync(tableSQL);
  }

  // ── Column migrations (safe: each wrapped in try/catch) ──────────────────
  // Add password column to users (new in v1.1)
  try {
    await database.execAsync("ALTER TABLE users ADD COLUMN password TEXT NOT NULL DEFAULT ''");
  } catch { /* already exists */ }

  // Add scan_logs table columns don't need migration — table is new.
  // Add portfolio_items — also new, handled by CREATE TABLE IF NOT EXISTS above.
  // Add cached_events — also new.

  // Ensure qr_checkins still exists for older installs that predate scan_logs
  try {
    await database.execAsync(`
      CREATE TABLE IF NOT EXISTS qr_checkins (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        userId INTEGER NOT NULL,
        opportunityId INTEGER,
        eventName TEXT NOT NULL,
        xpEarned INTEGER NOT NULL DEFAULT 0,
        scannedAt TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
      );
    `);
  } catch { /* ignore */ }
  // ─────────────────────────────────────────────────────────────────────────

  await seedInitialData(database);
};

const seedInitialData = async (database: SQLite.SQLiteDatabase): Promise<void> => {
  const existing = await database.getFirstAsync<{ count: number }>(
    'SELECT COUNT(*) as count FROM opportunities'
  );

  if (existing && existing.count === 0) {
    for (const opp of SEED_OPPORTUNITIES) {
      await database.runAsync(
        `INSERT INTO opportunities (title, type, organization, description, deadline, location, latitude, longitude, xpReward, registrationLink, isActive)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)`,
        [
          opp.title,
          opp.type,
          opp.organization,
          opp.description,
          opp.deadline ?? null,
          opp.location,
          opp.latitude ?? null,
          opp.longitude ?? null,
          opp.xpReward,
          opp.registrationLink,
        ]
      );
    }
  }

  const existingUsers = await database.getFirstAsync<{ count: number }>(
    'SELECT COUNT(*) as count FROM users'
  );

  if (existingUsers && existingUsers.count === 0) {
    for (const user of MOCK_LEADERBOARD_USERS) {
      await database.runAsync(
        `INSERT INTO users (fullName, firstName, lastName, email, university, major, specialty, academicYear, xp, level)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          user.fullName,
          user.firstName,
          user.lastName,
          user.email,
          user.university,
          user.major,
          user.specialty,
          user.academicYear,
          user.xp,
          user.level,
        ]
      );
    }
  }
};
