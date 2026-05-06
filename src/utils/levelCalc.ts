// Level calculation — progressive thresholds per implementation guide section 7.3
// Level 1: 0–99, Level 2: 100–299, Level 3: 300–599, Level 4: 600–999,
// Level 5: 1000–1499, Level 6: 1500–2199, Level 7: 2200–2999, Level 8: 3000+

export const LEVEL_THRESHOLDS = [0, 100, 300, 600, 1000, 1500, 2200, 3000];
export const MAX_LEVEL = LEVEL_THRESHOLDS.length; // 8

/** Returns the user's current level based on their total XP. */
export function getLevel(xp: number): number {
  let level = 1;
  for (let i = 0; i < LEVEL_THRESHOLDS.length; i++) {
    if (xp >= LEVEL_THRESHOLDS[i]) level = i + 1;
    else break;
  }
  return Math.min(level, MAX_LEVEL);
}

/** XP required to reach the next level (0 if at max level). */
export function xpToNextLevel(xp: number): number {
  const currentLevel = getLevel(xp);
  if (currentLevel >= MAX_LEVEL) return 0;
  const nextThreshold = LEVEL_THRESHOLDS[currentLevel]; // index = currentLevel gives the next threshold
  return Math.max(0, nextThreshold - xp);
}

/** Returns progress toward next level as a value in [0, 1]. */
export function levelProgress(xp: number): number {
  const currentLevel = getLevel(xp);
  if (currentLevel >= MAX_LEVEL) return 1;
  const currentThreshold = LEVEL_THRESHOLDS[currentLevel - 1];
  const nextThreshold = LEVEL_THRESHOLDS[currentLevel];
  const span = nextThreshold - currentThreshold;
  if (span <= 0) return 1;
  return Math.min(1, Math.max(0, (xp - currentThreshold) / span));
}

/** XP at the start of the current level. */
export function xpAtLevelStart(xp: number): number {
  const currentLevel = getLevel(xp);
  return LEVEL_THRESHOLDS[currentLevel - 1] ?? 0;
}

/** XP at the start of the next level (or current XP if at max). */
export function xpAtNextLevel(xp: number): number {
  const currentLevel = getLevel(xp);
  if (currentLevel >= MAX_LEVEL) return xp;
  return LEVEL_THRESHOLDS[currentLevel];
}
