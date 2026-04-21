import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { I18nManager } from 'react-native';
import {
  useFonts,
  Cairo_400Regular,
  Cairo_500Medium,
  Cairo_600SemiBold,
  Cairo_700Bold,
  Cairo_800ExtraBold,
} from '@expo-google-fonts/cairo';

interface ThemeContextType {
  isRTL: boolean;
  fontsLoaded: boolean;
}

const ThemeContext = createContext<ThemeContextType>({
  isRTL: true,
  fontsLoaded: false,
});

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [fontsLoaded] = useFonts({
    Cairo_400Regular,
    Cairo_500Medium,
    Cairo_600SemiBold,
    Cairo_700Bold,
    Cairo_800ExtraBold,
  });

  const isRTL = true;

  return (
    <ThemeContext.Provider value={{ isRTL, fontsLoaded }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within ThemeProvider');
  return context;
};
