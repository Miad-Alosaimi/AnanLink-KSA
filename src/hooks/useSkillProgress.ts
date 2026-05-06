import { useState, useCallback, useEffect, useMemo } from 'react';
import {
  completeUnit,
  uncompleteUnit,
  getCompletionCountsByTrack,
  getCompletedUnitsForTrack,
  getAllUnlockStates,
  getTotalCompletedUnits,
} from '../database/queries/skillQueries';
import { useAuth, useUser } from '../context';
import {
  XP_PER_UNIT,
  SKILL_TRACKS,
  SkillTrack,
  getTracksForCareer,
  CareerId,
} from '../constants/skillTracks';

/**
 * Catalog-wide progress.
 *
 * - `careerTracks`: the tracks matching the user's specialty (for profile).
 *   If user has no specialty set, falls back to all tracks.
 * - `allTracks`: always the full catalog (for SkillPathList "explore" view).
 */
export const useAllSkillProgress = () => {
  const { userId } = useAuth();
  const { user } = useUser();

  const [counts, setCounts] = useState<Record<string, number>>({});
  const [unlockStates, setUnlockStates] = useState<Record<string, boolean>>({});
  const [totalUnits, setTotalUnits] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const load = useCallback(async () => {
    if (!userId) {
      setCounts({});
      setUnlockStates({});
      setTotalUnits(0);
      setIsLoading(false);
      return;
    }
    const [c, u, t] = await Promise.all([
      getCompletionCountsByTrack(userId),
      getAllUnlockStates(userId),
      getTotalCompletedUnits(userId),
    ]);
    setCounts(c);
    setUnlockStates(u);
    setTotalUnits(t);
    setIsLoading(false);
  }, [userId]);

  useEffect(() => { load(); }, [load]);

  // Career-filtered track list (used on profile).
  // Fallback: existing users without a valid career stored in `specialty`
  // see the full catalog so the profile doesn't look empty for them.
  const careerTracks: SkillTrack[] = useMemo(() => {
    const filtered = getTracksForCareer(user?.specialty as CareerId | undefined);
    return filtered.length > 0 ? filtered : SKILL_TRACKS;
  }, [user?.specialty]);

  return {
    counts,
    unlockStates,
    totalUnits,
    isLoading,
    refresh: load,
    careerTracks,
    allTracks: SKILL_TRACKS,
  };
};

/** Per-track progress for the detail screen — tracks completed unit indices. */
export const useTrackProgress = (trackId: string) => {
  const { userId } = useAuth();
  const { addXP, refreshUser } = useUser();

  const [completed, setCompleted] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const load = useCallback(async () => {
    if (!userId) {
      setCompleted([]);
      setIsLoading(false);
      return;
    }
    const indices = await getCompletedUnitsForTrack(userId, trackId);
    setCompleted(indices);
    setIsLoading(false);
  }, [userId, trackId]);

  useEffect(() => { load(); }, [load]);

  const toggle = useCallback(
    async (unitIndex: number): Promise<{ nowCompleted: boolean; xpDelta: number }> => {
      if (!userId) return { nowCompleted: false, xpDelta: 0 };
      const isCurrentlyCompleted = completed.includes(unitIndex);

      if (isCurrentlyCompleted) {
        const didDelete = await uncompleteUnit(userId, trackId, unitIndex);
        if (didDelete) {
          await addXP(-XP_PER_UNIT);
          setCompleted(prev => prev.filter(i => i !== unitIndex));
          return { nowCompleted: false, xpDelta: -XP_PER_UNIT };
        }
        return { nowCompleted: false, xpDelta: 0 };
      } else {
        const didInsert = await completeUnit(userId, trackId, unitIndex);
        if (didInsert) {
          await addXP(XP_PER_UNIT);
          setCompleted(prev => [...prev, unitIndex].sort((a, b) => a - b));
          return { nowCompleted: true, xpDelta: XP_PER_UNIT };
        }
        return { nowCompleted: true, xpDelta: 0 };
      }
    },
    [userId, trackId, completed, addXP]
  );

  return { completed, isLoading, toggle, refresh: load };
};
