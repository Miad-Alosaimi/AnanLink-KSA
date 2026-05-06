import * as SQLite from 'expo-sqlite';
import { ALL_TABLES } from './schema';
import { seedOpportunities } from './seeds';

let _db: SQLite.SQLiteDatabase | null = null;

export const getDatabase = (): SQLite.SQLiteDatabase => {
  if (!_db) {
    _db = SQLite.openDatabaseSync('ananphase1.db');
  }
  return _db;
};

export const initializeDatabase = async (): Promise<void> => {
  const db = getDatabase();
  await db.execAsync('PRAGMA journal_mode = WAL;');
  for (const sql of ALL_TABLES) {
    await db.execAsync(sql);
  }
  await seedOpportunities(db);
};

// User queries
export const createUser = async (data: {
  firstName: string;
  lastName: string;
  email: string;
  university: string;
  major: string;
  academicYear: number;
  password: string;
}): Promise<number> => {
  const db = getDatabase();
  const fullName = `${data.firstName} ${data.lastName}`;
  const result = await db.runAsync(
    `INSERT INTO users (fullName, firstName, lastName, email, university, major, academicYear, password)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [fullName, data.firstName, data.lastName, data.email, data.university, data.major, data.academicYear, data.password]
  );
  return result.lastInsertRowId;
};

export const getUserById = async (id: number) => {
  const db = getDatabase();
  return db.getFirstAsync<any>('SELECT * FROM users WHERE id = ?', [id]);
};

export const getUserByEmail = async (email: string) => {
  const db = getDatabase();
  return db.getFirstAsync<any>('SELECT * FROM users WHERE email = ?', [email]);
};

export const verifyUserCredentials = async (email: string, password: string) => {
  const db = getDatabase();
  return db.getFirstAsync<any>(
    'SELECT * FROM users WHERE email = ? AND password = ?',
    [email, password]
  );
};

// Opportunity queries
export const getAllOpportunities = async () => {
  const db = getDatabase();
  return db.getAllAsync<any>(
    'SELECT * FROM opportunities WHERE isActive = 1 ORDER BY createdAt DESC'
  );
};

export const getOpportunityById = async (id: number) => {
  const db = getDatabase();
  return db.getFirstAsync<any>('SELECT * FROM opportunities WHERE id = ?', [id]);
};

export const getRecentOpportunities = async (limit = 4) => {
  const db = getDatabase();
  return db.getAllAsync<any>(
    'SELECT * FROM opportunities WHERE isActive = 1 ORDER BY createdAt DESC LIMIT ?',
    [limit]
  );
};

export const getOpportunityCountByType = async (): Promise<Record<string, number>> => {
  const db = getDatabase();
  const rows = await db.getAllAsync<{ type: string; count: number }>(
    "SELECT type, COUNT(*) as count FROM opportunities WHERE isActive = 1 GROUP BY type"
  );
  const map: Record<string, number> = { hackathon: 0, internship: 0, opensource: 0, volunteer: 0 };
  for (const row of rows) {
    map[row.type] = row.count;
  }
  return map;
};
