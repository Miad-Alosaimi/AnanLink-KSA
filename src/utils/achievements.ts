// Achievement unlock logic — automatically grants achievements based on user actions.
// IMPORTANT: imports specific query files directly (not via barrel) to avoid
// circular imports when bookmarkQueries -> achievements -> queries/index -> bookmarkQueries.
import { getUserAchievements, addAchievement } from '../database/queries/userQueries';
import { getCheckInCount } from '../database/queries/qrQueries';
import { getBookmarkCount } from '../database/queries/bookmarkQueries';

export interface AchievementDef {
  id: string;            // stable id (used to dedupe)
  badgeIcon: string;     // Ionicon name
  title: string;         // Arabic title shown to user
  description: string;   // Arabic description
}

export const ACHIEVEMENTS: Record<string, AchievementDef> = {
  ROCKET: {
    id: 'rocket',
    badgeIcon: 'rocket',
    title: 'انطلاقة رائعة!',
    description: 'سجّلت في عنان لينك وأضفت مهاراتك',
  },
  FIRST_SCAN: {
    id: 'first_scan',
    badgeIcon: 'qr-code',
    title: 'أول مسح QR',
    description: 'سجّلت حضورك في أول فعالية',
  },
  FIRST_BOOKMARK: {
    id: 'first_bookmark',
    badgeIcon: 'bookmark',
    title: 'جامع الفرص',
    description: 'حفظت أول فرصة في المفضلة',
  },
  FIVE_SCANS: {
    id: 'five_scans',
    badgeIcon: 'ribbon',
    title: 'متطوع نشط',
    description: 'سجّلت حضورك في 5 فعاليات',
  },
  TEN_BOOKMARKS: {
    id: 'ten_bookmarks',
    badgeIcon: 'library',
    title: 'مكتشف محترف',
    description: 'حفظت 10 فرص في المفضلة',
  },
  LEVEL_5: {
    id: 'level_5',
    badgeIcon: 'trophy',
    title: 'على الطريق الصحيح',
    description: 'وصلت إلى المستوى الخامس',
  },
};

/** Checks if user already has an achievement (by badgeIcon, which we use as stable id). */
async function hasAchievement(userId: number, achievementId: string): Promise<boolean> {
  const existing = await getUserAchievements(userId);
  return existing.some(a => a.badgeIcon === ACHIEVEMENTS[achievementId]?.badgeIcon
    || a.title === ACHIEVEMENTS[achievementId]?.title);
}

/** Grants an achievement if not already unlocked. Returns true if newly granted. */
export async function tryGrantAchievement(
  userId: number,
  key: keyof typeof ACHIEVEMENTS
): Promise<boolean> {
  const def = ACHIEVEMENTS[key];
  if (!def) return false;
  const already = await hasAchievement(userId, key);
  if (already) return false;
  await addAchievement(userId, def.badgeIcon, def.title, def.description);
  return true;
}

/** Run after a QR scan — grants first-scan and 5-scans achievements as appropriate. */
export async function checkScanAchievements(userId: number): Promise<string[]> {
  const granted: string[] = [];
  const count = await getCheckInCount(userId);

  if (count >= 1 && await tryGrantAchievement(userId, 'FIRST_SCAN')) {
    granted.push('FIRST_SCAN');
  }
  if (count >= 5 && await tryGrantAchievement(userId, 'FIVE_SCANS')) {
    granted.push('FIVE_SCANS');
  }
  return granted;
}

/** Run after a bookmark toggle — grants first-bookmark and ten-bookmarks as appropriate. */
export async function checkBookmarkAchievements(userId: number): Promise<string[]> {
  const granted: string[] = [];
  const count = await getBookmarkCount(userId);

  if (count >= 1 && await tryGrantAchievement(userId, 'FIRST_BOOKMARK')) {
    granted.push('FIRST_BOOKMARK');
  }
  if (count >= 10 && await tryGrantAchievement(userId, 'TEN_BOOKMARKS')) {
    granted.push('TEN_BOOKMARKS');
  }
  return granted;
}

/** Run after an XP change — grants level achievements as appropriate. */
export async function checkLevelAchievements(
  userId: number,
  currentLevel: number
): Promise<string[]> {
  const granted: string[] = [];
  if (currentLevel >= 5 && await tryGrantAchievement(userId, 'LEVEL_5')) {
    granted.push('LEVEL_5');
  }
  return granted;
}
