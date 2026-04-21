import { getDatabase } from '../db';
import { Opportunity, OpportunityType } from '../../types';

export const getOpportunities = async (
  type?: OpportunityType,
  limit = 50,
  offset = 0
): Promise<Opportunity[]> => {
  const db = getDatabase();
  if (type) {
    return db.getAllAsync<Opportunity>(
      `SELECT * FROM opportunities WHERE type = ? AND isActive = 1
       ORDER BY createdAt DESC LIMIT ? OFFSET ?`,
      [type, limit, offset]
    );
  }
  return db.getAllAsync<Opportunity>(
    `SELECT * FROM opportunities WHERE isActive = 1
     ORDER BY createdAt DESC LIMIT ? OFFSET ?`,
    [limit, offset]
  );
};

export const getRecentOpportunities = async (limit = 6): Promise<Opportunity[]> => {
  const db = getDatabase();
  return db.getAllAsync<Opportunity>(
    `SELECT * FROM opportunities WHERE isActive = 1
     ORDER BY createdAt DESC LIMIT ?`,
    [limit]
  );
};

export const getOpportunityById = async (id: number): Promise<Opportunity | null> => {
  const db = getDatabase();
  return db.getFirstAsync<Opportunity>('SELECT * FROM opportunities WHERE id = ?', [id]);
};

export const searchOpportunities = async (query: string): Promise<Opportunity[]> => {
  const db = getDatabase();
  return db.getAllAsync<Opportunity>(
    `SELECT * FROM opportunities
     WHERE isActive = 1 AND (title LIKE ? OR organization LIKE ? OR description LIKE ?)
     ORDER BY createdAt DESC LIMIT 20`,
    [`%${query}%`, `%${query}%`, `%${query}%`]
  );
};

export const getOpportunitiesWithLocation = async (): Promise<Opportunity[]> => {
  const db = getDatabase();
  return db.getAllAsync<Opportunity>(
    `SELECT * FROM opportunities
     WHERE isActive = 1 AND latitude IS NOT NULL AND longitude IS NOT NULL`,
    []
  );
};

export const getOpportunityCountByType = async (): Promise<Record<OpportunityType, number>> => {
  const db = getDatabase();
  const results = await db.getAllAsync<{ type: string; count: number }>(
    `SELECT type, COUNT(*) as count FROM opportunities
     WHERE isActive = 1 GROUP BY type`,
    []
  );
  const counts: Record<string, number> = {};
  for (const row of results) {
    counts[row.type] = row.count;
  }
  return {
    hackathon: counts['hackathon'] ?? 0,
    internship: counts['internship'] ?? 0,
    opensource: counts['opensource'] ?? 0,
    volunteer: counts['volunteer'] ?? 0,
  };
};
