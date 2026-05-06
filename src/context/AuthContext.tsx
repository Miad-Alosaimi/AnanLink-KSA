import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { RegisterData } from '../types';
import {
  createUser,
  addUserSkills,
  getUserByEmail,
  addAchievement,
  updateUserXP,
} from '../database/queries';
import { XP_VALUES } from '../constants/xpValues';
import { ACHIEVEMENTS } from '../utils/achievements';

interface AuthResult {
  success: boolean;
  error?: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  userId: number | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<AuthResult>;
  register: (data: RegisterData) => Promise<AuthResult>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

const AUTH_USER_ID_KEY = '@ananlink_userId';

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userId, setUserId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkPersistedSession();
  }, []);

  const checkPersistedSession = async () => {
    try {
      const storedId = await AsyncStorage.getItem(AUTH_USER_ID_KEY);
      if (storedId) {
        setUserId(parseInt(storedId, 10));
        setIsAuthenticated(true);
      }
    } catch {
      // ignore storage errors
    } finally {
      setIsLoading(false);
    }
  };

  const login = useCallback(
    async (email: string, _password: string): Promise<AuthResult> => {
      try {
        const user = await getUserByEmail(email.toLowerCase().trim());
        if (!user) {
          return { success: false, error: 'البريد الإلكتروني أو كلمة المرور غير صحيحة' };
        }
        await AsyncStorage.setItem(AUTH_USER_ID_KEY, String(user.id));
        setUserId(user.id);
        setIsAuthenticated(true);
        return { success: true };
      } catch (e) {
        return { success: false, error: 'حدث خطأ غير متوقع. حاول مجدداً.' };
      }
    },
    []
  );

  const register = useCallback(async (data: RegisterData): Promise<AuthResult> => {
    let newUserId: number | null = null;
    try {
      const existing = await getUserByEmail(data.email.toLowerCase().trim());
      if (existing) {
        return { success: false, error: 'هذا البريد مسجّل مسبقاً' };
      }

      newUserId = await createUser({
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email.toLowerCase().trim(),
        university: data.university,
        major: data.major,
        specialty: data.specialty,
        academicYear: data.academicYear,
      });

      // Skills are best-effort — log but don't fail the whole signup if one
      // skill is malformed (the user record is what matters; they can add
      // skills later from their profile).
      if (data.skills && data.skills.length > 0) {
        try { await addUserSkills(newUserId, data.skills); }
        catch (e) { console.warn('[Register] skills insert failed:', e); }
      }

      // Welcome XP + achievement are also best-effort
      try { await updateUserXP(newUserId, XP_VALUES.WELCOME_BONUS); }
      catch (e) { console.warn('[Register] welcome XP failed:', e); }

      try {
        await addAchievement(
          newUserId,
          ACHIEVEMENTS.ROCKET.badgeIcon,
          ACHIEVEMENTS.ROCKET.title,
          ACHIEVEMENTS.ROCKET.description
        );
      } catch (e) { console.warn('[Register] welcome achievement failed:', e); }

      await AsyncStorage.setItem(AUTH_USER_ID_KEY, String(newUserId));
      setUserId(newUserId);
      setIsAuthenticated(true);
      return { success: true };
    } catch (e: any) {
      console.error('[Register] failed:', e);
      const msg = e?.message ?? 'حدث خطأ أثناء إنشاء الحساب. حاول مجدداً.';
      return { success: false, error: msg };
    }
  }, []);

  const logout = useCallback(async () => {
    await AsyncStorage.removeItem(AUTH_USER_ID_KEY);
    setIsAuthenticated(false);
    setUserId(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{ isAuthenticated, userId, isLoading, login, register, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
