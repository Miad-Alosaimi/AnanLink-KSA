import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { RegisterData } from '../types';
import { createUser, getUserByEmail, verifyUserCredentials } from '../database/db';

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
const AUTH_KEY = '@ananphase1_userId';

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userId, setUserId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    AsyncStorage.getItem(AUTH_KEY).then((stored) => {
      if (stored) {
        setUserId(parseInt(stored, 10));
        setIsAuthenticated(true);
      }
      setIsLoading(false);
    });
  }, []);

  const login = useCallback(async (email: string, password: string): Promise<AuthResult> => {
    try {
      const user = await verifyUserCredentials(email.toLowerCase().trim(), password);
      if (!user) return { success: false, error: 'البريد الإلكتروني أو كلمة المرور غير صحيحة' };
      await AsyncStorage.setItem(AUTH_KEY, String(user.id));
      setUserId(user.id);
      setIsAuthenticated(true);
      return { success: true };
    } catch {
      return { success: false, error: 'حدث خطأ. حاول مجدداً.' };
    }
  }, []);

  const register = useCallback(async (data: RegisterData): Promise<AuthResult> => {
    try {
      const existing = await getUserByEmail(data.email.toLowerCase().trim());
      if (existing) return { success: false, error: 'هذا البريد مسجّل مسبقاً' };
      const newId = await createUser({
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email.toLowerCase().trim(),
        university: data.university,
        major: data.major,
        academicYear: data.academicYear,
        password: data.password,
      });
      await AsyncStorage.setItem(AUTH_KEY, String(newId));
      setUserId(newId);
      setIsAuthenticated(true);
      return { success: true };
    } catch {
      return { success: false, error: 'حدث خطأ أثناء إنشاء الحساب. حاول مجدداً.' };
    }
  }, []);

  const logout = useCallback(async () => {
    await AsyncStorage.removeItem(AUTH_KEY);
    setIsAuthenticated(false);
    setUserId(null);
  }, []);

  return (
    <AuthContext.Provider value={{ isAuthenticated, userId, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
