import 'react-native-gesture-handler';
import React, { useEffect, useState } from 'react';
import {
  I18nManager,
  View,
  ActivityIndicator,
  DevSettings,
  NativeModules,
  Platform,
} from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

import { ThemeProvider, AuthProvider, UserProvider, useTheme } from './src/context';
import { initializeDatabase } from './src/database/db';
import RootNavigator from './src/navigation/RootNavigator';
import { Colors } from './src/constants';

// Force RTL for Arabic layout. allowRTL must be true before forceRTL.
// IMPORTANT: forceRTL only takes effect on the NEXT app launch, since
// React Native reads the layout direction during native bridge initialization.
// We set the flag synchronously, then check if the running session is already
// RTL — if not, we trigger a one-time reload below to flip the layout.
I18nManager.allowRTL(true);
I18nManager.forceRTL(true);

/**
 * Force the JS bridge to reload so the new RTL layout direction takes effect.
 * In dev / Expo Go: DevSettings.reload() works.
 * In production builds: NativeModules.DevSettings exists too. As a last resort
 * we set a flag and stop rendering, hoping the user restarts manually.
 */
const reloadForRTL = () => {
  try {
    if (DevSettings && typeof DevSettings.reload === 'function') {
      DevSettings.reload();
      return true;
    }
  } catch {}
  try {
    // RN 0.74+: hidden API but stable across Expo versions
    NativeModules?.DevSettings?.reload?.();
  } catch {}
  return false;
};

const AppContent: React.FC = () => {
  const { fontsLoaded } = useTheme();
  const [dbReady, setDbReady] = useState(false);

  useEffect(() => {
    // If layout is currently LTR, the forceRTL call above only persisted the
    // flag for the next launch. Trigger a reload so RTL takes effect now.
    if (!I18nManager.isRTL) {
      const ok = reloadForRTL();
      if (ok) return; // bail — we're about to reload
      // Fallback: continue rendering. User will see correct layout
      // after the next manual app restart.
    }

    initializeDatabase()
      .then(() => setDbReady(true))
      .catch((err) => {
        console.error('Database initialization failed:', err);
        setDbReady(true);
      });
  }, []);

  if (!fontsLoaded || !dbReady) {
    return (
      <View style={{ flex: 1, backgroundColor: Colors.gradient.start, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator color={Colors.text.white} size="large" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <StatusBar style="auto" />
      <RootNavigator />
    </NavigationContainer>
  );
};

export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AuthProvider>
          <UserProvider>
            <AppContent />
          </UserProvider>
        </AuthProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
