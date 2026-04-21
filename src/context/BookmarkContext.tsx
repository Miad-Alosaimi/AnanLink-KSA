import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from 'react';
import { toggleBookmark, getBookmarkedIds } from '../database/queries/bookmarkQueries';
import { useAuth } from './AuthContext';

interface BookmarkContextType {
  bookmarkedIds: number[];
  loadBookmarks: () => Promise<void>;
  toggleBookmarkItem: (id: number) => Promise<boolean>;
  isBookmarkedItem: (id: number) => boolean;
}

const BookmarkContext = createContext<BookmarkContextType>({} as BookmarkContextType);

export const BookmarkProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { userId, isAuthenticated } = useAuth();
  const [bookmarkedIds, setBookmarkedIds] = useState<number[]>([]);

  const loadBookmarks = useCallback(async () => {
    if (!userId) return;
    const ids = await getBookmarkedIds(userId);
    setBookmarkedIds(ids);
  }, [userId]);

  useEffect(() => {
    if (isAuthenticated) {
      loadBookmarks();
    } else {
      setBookmarkedIds([]);
    }
  }, [isAuthenticated, loadBookmarks]);

  const toggleBookmarkItem = useCallback(
    async (id: number): Promise<boolean> => {
      if (!userId) return false;
      const isNowBookmarked = await toggleBookmark(userId, id);
      setBookmarkedIds(prev =>
        isNowBookmarked ? [...prev, id] : prev.filter(i => i !== id)
      );
      return isNowBookmarked;
    },
    [userId]
  );

  const isBookmarkedItem = useCallback(
    (id: number) => bookmarkedIds.includes(id),
    [bookmarkedIds]
  );

  return (
    <BookmarkContext.Provider
      value={{ bookmarkedIds, loadBookmarks, toggleBookmarkItem, isBookmarkedItem }}
    >
      {children}
    </BookmarkContext.Provider>
  );
};

export const useBookmarks = (): BookmarkContextType => {
  const context = useContext(BookmarkContext);
  if (!context) throw new Error('useBookmarks must be used within BookmarkProvider');
  return context;
};
