export const CREATE_USERS_TABLE = `
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    fullName TEXT NOT NULL,
    firstName TEXT NOT NULL,
    lastName TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    university TEXT NOT NULL,
    major TEXT NOT NULL,
    academicYear INTEGER NOT NULL DEFAULT 1,
    password TEXT NOT NULL DEFAULT '',
    createdAt TEXT DEFAULT CURRENT_TIMESTAMP
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
    registrationLink TEXT NOT NULL DEFAULT '',
    isActive INTEGER NOT NULL DEFAULT 1,
    createdAt TEXT DEFAULT CURRENT_TIMESTAMP
  );
`;

export const ALL_TABLES = [
  CREATE_USERS_TABLE,
  CREATE_OPPORTUNITIES_TABLE,
];
