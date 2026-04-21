import { useState, useCallback } from 'react';
import { toggleBookmark, isBookmarked, getBookmarkedIds } from '../database/queries';
import { useAuth } from '../context';

export const useBookmarkToggle = (opportunityId: number) => {
  const { userId } = useAuth();
  const [bookmarked, setBookmarked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const checkBookmark = useCallback(async () => {
    if (!userId) return;
    const result = await isBookmarked(userId, opportunityId);
    setBookmarked(result);
  }, [userId, opportunityId]);

  const toggle = useCallback(async () => {
    if (!userId) return;
    setIsLoading(true);
    try {
      const newState = await toggleBookmark(userId, opportunityId);
      setBookmarked(newState);
    } catch {
      // ignore
    } finally {
      setIsLoading(false);
    }
  }, [userId, opportunityId]);

  return { bookmarked, isLoading, checkBookmark, toggle };
};

export const useBookmarkedIds = () => {
  const { userId } = useAuth();
  const [ids, setIds] = useState<number[]>([]);

  const refresh = useCallback(async () => {
    if (!userId) return;
    const result = await getBookmarkedIds(userId);
    setIds(result);
  }, [userId]);

  return { ids, refresh };
};
