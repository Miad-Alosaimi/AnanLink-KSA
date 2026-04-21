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
  verifyUserCredentials,
  addAchievement,
  updateUserXP,
} from '../database/queries';
// getUserByEmail is used in register to check for duplicate emails

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
    async (email: string, password: string): Promise<AuthResult> => {
      try {
        const user = await verifyUserCredentials(email.toLowerCase().trim(), password);
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
    try {
      const existing = await getUserByEmail(data.email.toLowerCase().trim());
      if (existing) {
        return { success: false, error: 'هذا البريد مسجّل مسبقاً' };
      }

      const newUserId = await createUser({
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email.toLowerCase().trim(),
        university: data.university,
        major: data.major,
        specialty: data.specialty,
        academicYear: data.academicYear,
        password: data.password,
      });

      if (data.skills && data.skills.length > 0) {
        await addUserSkills(newUserId, data.skills);
      }

      // Welcome XP bonus
      await updateUserXP(newUserId, 30);

      // Welcome achievement
      await addAchievement(
        newUserId,
        'rocket',
        'انطلاقة رائعة!',
        'سجّلت في عنان لينك وأضفت مهاراتك'
      );

      await AsyncStorage.setItem(AUTH_USER_ID_KEY, String(newUserId));
      setUserId(newUserId);
      setIsAuthenticated(true);
      return { success: true };
    } catch (e) {
      return { success: false, error: 'حدث خطأ أثناء إنشاء الحساب. حاول مجدداً.' };
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
