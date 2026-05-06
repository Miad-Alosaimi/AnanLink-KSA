import React, { createContext, useContext, ReactNode } from 'react';
import { useFonts } from 'expo-font';
import {
  Cairo_400Regular,
  Cairo_500Medium,
  Cairo_600SemiBold,
  Cairo_700Bold,
} from '@expo-google-fonts/cairo';

interface ThemeContextType {
  fontsLoaded: boolean;
  isRTL: boolean;
}

const ThemeContext = createContext<ThemeContextType>({ fontsLoaded: false, isRTL: true });

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [fontsLoaded] = useFonts({
    Cairo_400Regular,
    Cairo_500Medium,
    Cairo_600SemiBold,
    Cairo_700Bold,
  });

  return (
    <ThemeContext.Provider value={{ fontsLoaded, isRTL: true }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
