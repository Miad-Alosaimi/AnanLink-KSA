import React, { useEffect, useState } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { RootStackParamList } from '../types';
import { useAuth } from '../context';

import SplashScreen from '../screens/auth/SplashScreen';
import OnboardingScreen from '../screens/auth/OnboardingScreen';
import IntroScreen1 from '../screens/intro/IntroScreen1';
import IntroScreen2 from '../screens/intro/IntroScreen2';
import IntroScreen3 from '../screens/intro/IntroScreen3';
import IntroScreen4 from '../screens/intro/IntroScreen4';
import AuthNavigator from './AuthNavigator';
import TabNavigator from './TabNavigator';

const Stack = createNativeStackNavigator<RootStackParamList>();

const ONBOARDING_KEY = '@ananlink_hasSeenOnboarding';

const RootNavigator: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState<boolean | null>(null);
  const [checkingOnboarding, setCheckingOnboarding] = useState(true);

  useEffect(() => {
    AsyncStorage.getItem(ONBOARDING_KEY).then((value) => {
      setHasSeenOnboarding(value === 'true');
      setCheckingOnboarding(false);
    });
  }, []);

  if (isLoading || checkingOnboarding) {
    return (
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Splash" component={SplashScreen} />
      </Stack.Navigator>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_left' }}>
      {isAuthenticated ? (
        <Stack.Screen name="Main" component={TabNavigator} />
      ) : hasSeenOnboarding ? (
        <Stack.Screen name="Auth" component={AuthNavigator} />
      ) : (
        <>
          <Stack.Screen name="Intro1" component={IntroScreen1} />
          <Stack.Screen name="Intro2" component={IntroScreen2} />
          <Stack.Screen name="Intro3" component={IntroScreen3} />
          <Stack.Screen name="Intro4" component={IntroScreen4} />
          <Stack.Screen name="Onboarding" component={OnboardingScreen} />
          <Stack.Screen name="Auth" component={AuthNavigator} />
        </>
      )}
    </Stack.Navigator>
  );
};

export default RootNavigator;
