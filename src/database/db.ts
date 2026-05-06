import * as SQLite from 'expo-sqlite';
import { ALL_TABLES, SCHEMA_VERSION } from './schema';
import { seedOpportunities, MOCK_LEADERBOARD_USERS } from './seeds';

let db: SQLite.SQLiteDatabase | null = null;

export const getDatabase = (): SQLite.SQLiteDatabase => {
  if (!db) {
    db = SQLite.openDatabaseSync('ananlink.db');
  }
  return db;
};

const getSchemaVersion = async (database: SQLite.SQLiteDatabase): Promise<number> => {
  try {
    const row = await database.getFirstAsync<{ value: string }>(
      `SELECT value FROM schema_meta WHERE key = 'version'`
    );
    return row ? parseInt(row.value, 10) : 0;
  } catch {
    return 0;
  }
};

const setSchemaVersion = async (database: SQLite.SQLiteDatabase, version: number): Promise<void> => {
  await database.runAsync(
    `INSERT INTO schema_meta (key, value) VALUES ('version', ?)
     ON CONFLICT(key) DO UPDATE SET value = excluded.value`,
    [String(version)]
  );
};

/**
 * Apply schema changes for users upgrading from older versions.
 *
 * IMPORTANT: This runs AFTER `ALL_TABLES` has been created. So even on a
 * brand-new install (where currentVersion = 0), all the migrations below
 * are no-ops — the tables already exist with the up-to-date schema, and
 * the ALTER TABLE statements will fail (because the columns already exist)
 * but silently in their try/catch blocks.
 *
 * Migrations are only meaningful for users coming from v1/v2/v3 with an
 * older table layout. The CREATE TABLE statements in schema.ts are
 * idempotent — they only create tables that don't already exist; they
 * never alter existing ones.
 */
const migrateSchema = async (database: SQLite.SQLiteDatabase, fromVersion: number): Promise<void> => {
  // v3: opportunities table CHECK constraint changed (hackathon → bootcamp) +
  //     many new columns. SQLite can't ALTER a CHECK, so drop and recreate.
  //     This must happen BEFORE we run CREATE TABLE in initializeDatabase.
  //     We handle it as a special pre-step in initializeDatabase, not here.

  // v4: avatarUri + isSuggestion columns on users.
  if (fromVersion < 4) {
    console.log(`[DB] Migrating from v${fromVersion} → v4: friends + avatars`);
    try { await database.execAsync('ALTER TABLE users ADD COLUMN avatarUri TEXT'); } catch {}
    try { await database.execAsync('ALTER TABLE users ADD COLUMN isSuggestion INTEGER NOT NULL DEFAULT 0'); } catch {}
    // Mark previously-seeded mock users as suggestions
    try {
      await database.runAsync(
        `UPDATE users SET isSuggestion = 1
         WHERE email LIKE '%@kfupm.edu.sa' OR email LIKE '%@ksu.edu.sa'
            OR email LIKE '%@iau.edu.sa' OR email LIKE '%@kfu.edu.sa'
            OR email LIKE '%@uqu.edu.sa' OR email LIKE '%@psu.edu.sa'
            OR email LIKE '%@taibah.edu.sa' OR email LIKE '%@kau.edu.sa'`
      );
    } catch (e) {
      console.log('[DB] update suggestions skipped:', e);
    }
  }

  // v5: updatedAt column on users.
  // SQLite ALTER TABLE only allows literal default values — datetime('now')
  // would throw. Leave it as nullable; new INSERTs handle it via app code.
  if (fromVersion < 5) {
    console.log(`[DB] Migrating from v${fromVersion} → v5: adding updatedAt to users`);
    try { await database.execAsync('ALTER TABLE users ADD COLUMN updatedAt TEXT'); } catch {}
  }
};

/**
 * Special pre-migration step: handle destructive table changes that need
 * to happen BEFORE the create-tables phase. v3 dropped opportunities and
 * bookmarks because their schema changed in incompatible ways.
 */
const preMigrate = async (database: SQLite.SQLiteDatabase, fromVersion: number): Promise<void> => {
  if (fromVersion > 0 && fromVersion < 3) {
    console.log(`[DB] Pre-migration v${fromVersion} → v3: dropping opportunities + bookmarks`);
    await database.execAsync('DROP TABLE IF EXISTS bookmarks');
    await database.execAsync('DROP TABLE IF EXISTS opportunities');
  }
};

export const initializeDatabase = async (): Promise<void> => {
  const database = getDatabase();
  await database.execAsync('PRAGMA foreign_keys = ON;');
  await database.execAsync('PRAGMA journal_mode = WAL;');

  // Step 1: Always ensure schema_meta exists so we can read the version.
  await database.execAsync(`
    CREATE TABLE IF NOT EXISTS schema_meta (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );
  `);

  const currentVersion = await getSchemaVersion(database);

  // Step 2: Run any DESTRUCTIVE migrations (table drops) BEFORE creating tables.
  // This is only relevant for v3's opportunities/bookmarks rebuild.
  await preMigrate(database, currentVersion);

  // Step 3: Create all tables (idempotent — no-op if they already exist).
  // After this step we know every table exists with the latest schema.
  for (const tableSQL of ALL_TABLES) {
    await database.execAsync(tableSQL);
  }

  // Step 4: Run additive migrations (ALTER TABLE ADD COLUMN). Safe now
  // because all tables are guaranteed to exist.
  if (currentVersion < SCHEMA_VERSION) {
    await migrateSchema(database, currentVersion);
  }

  // Step 5: Safety net — idempotent column-add ALTERs run on every launch.
  // Catches edge cases where users had a partial migration (e.g. version
  // was bumped but ADD COLUMN failed silently). All wrapped in try/catch
  // since SQLite errors when the column already exists.
  await ensureUserColumns(database);

  // Step 6: Stamp the new version so we don't re-run migrations next time.
  await setSchemaVersion(database, SCHEMA_VERSION);

  // Step 7: Seed initial data (only inserts if tables are empty).
  await seedInitialData(database);
};

/** Idempotent — safe to run on every launch. */
const ensureUserColumns = async (database: SQLite.SQLiteDatabase): Promise<void> => {
  try { await database.execAsync('ALTER TABLE users ADD COLUMN avatarUri TEXT'); } catch {}
  try { await database.execAsync('ALTER TABLE users ADD COLUMN isSuggestion INTEGER NOT NULL DEFAULT 0'); } catch {}
  // No DEFAULT expression — SQLite ALTER TABLE only allows literal defaults.
  try { await database.execAsync('ALTER TABLE users ADD COLUMN updatedAt TEXT'); } catch {}
};

const seedInitialData = async (database: SQLite.SQLiteDatabase): Promise<void> => {
  // Seed opportunities only if table is empty
  const oppCount = await database.getFirstAsync<{ count: number }>(
    'SELECT COUNT(*) as count FROM opportunities'
  );

  if (oppCount && oppCount.count === 0) {
    console.log(`[DB] Seeding ${seedOpportunities.length} opportunities`);
    for (const opp of seedOpportunities) {
      await database.runAsync(
        `INSERT OR IGNORE INTO opportunities (
          extId, type, title, subtitle, organization, description,
          deadline, startDate, endDate, seats,
          location, city, region, category, jobType, level, durationWeeks,
          latitude, longitude, xpReward, registrationLink, imageUrl, isActive
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)`,
        [
          opp.extId ?? null,
          opp.type,
          opp.title,
          opp.subtitle ?? null,
          opp.organization,
          opp.description,
          opp.deadline ?? null,
          opp.startDate ?? null,
          opp.endDate ?? null,
          opp.seats ?? null,
          opp.location ?? '',
          opp.city ?? null,
          opp.region ?? null,
          opp.category ?? null,
          opp.jobType ?? null,
          opp.level ?? null,
          opp.durationWeeks ?? null,
          opp.latitude ?? null,
          opp.longitude ?? null,
          opp.xpReward,
          opp.registrationLink ?? '',
          opp.imageUrl ?? null,
        ]
      );
    }
  }

  // Seed mock leaderboard users only if no users exist
  const userCount = await database.getFirstAsync<{ count: number }>(
    'SELECT COUNT(*) as count FROM users'
  );

  if (userCount && userCount.count === 0) {
    for (const user of MOCK_LEADERBOARD_USERS) {
      await database.runAsync(
        `INSERT INTO users (fullName, firstName, lastName, email, university, major, specialty, academicYear, xp, level, isSuggestion)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)`,
        [
          user.fullName, user.firstName, user.lastName, user.email,
          user.university, user.major, user.specialty, user.academicYear,
          user.xp, user.level,
        ]
      );
    }
  }
};
