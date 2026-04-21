import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from 'react';
import { User, UserSkill, Achievement, Opportunity } from '../types';
import {
  getUserById,
  getUserSkills,
  getUserAchievements,
  updateUserXP,
} from '../database/queries';
import { getUserBookmarks } from '../database/queries/bookmarkQueries';
import { useAuth } from './AuthContext';

interface UserContextType {
  user: User | null;
  isLoading: boolean;
  refreshUser: () => Promise<void>;
  getUserSkillsData: () => Promise<UserSkill[]>;
  getUserAchievementsData: () => Promise<Achievement[]>;
  getUserBookmarksData: () => Promise<Opportunity[]>;
  addXP: (amount: number) => Promise<void>;
}

const UserContext = createContext<UserContextType>({} as UserContextType);

export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { userId, isAuthenticated } = useAuth();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated && userId) {
      loadUser();
    } else {
      setUser(null);
    }
  }, [isAuthenticated, userId]);

  const loadUser = async () => {
    if (!userId) return;
    setIsLoading(true);
    try {
      const userData = await getUserById(userId);
      setUser(userData);
    } catch {
      // ignore
    } finally {
      setIsLoading(false);
    }
  };

  const refreshUser = useCallback(async () => {
    await loadUser();
  }, [userId]);

  const getUserSkillsData = useCallback(async (): Promise<UserSkill[]> => {
    if (!userId) return [];
    return getUserSkills(userId);
  }, [userId]);

  const getUserAchievementsData = useCallback(async (): Promise<Achievement[]> => {
    if (!userId) return [];
    return getUserAchievements(userId);
  }, [userId]);

  const getUserBookmarksData = useCallback(async (): Promise<Opportunity[]> => {
    if (!userId) return [];
    return getUserBookmarks(userId);
  }, [userId]);

  const addXP = useCallback(
    async (amount: number) => {
      if (!userId) return;
      await updateUserXP(userId, amount);
      await refreshUser();
    },
    [userId, refreshUser]
  );

  return (
    <UserContext.Provider
      value={{
        user,
        isLoading,
        refreshUser,
        getUserSkillsData,
        getUserAchievementsData,
        getUserBookmarksData,
        addXP,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = (): UserContextType => {
  const context = useContext(UserContext);
  if (!context) throw new Error('useUser must be used within UserProvider');
  return context;
};
