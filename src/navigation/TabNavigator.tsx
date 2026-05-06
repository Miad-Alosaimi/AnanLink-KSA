import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { View, StyleSheet } from 'react-native';

import { MainTabParamList } from '../types';
import { Colors, Typography } from '../constants';

import HomeStackNavigator from './HomeStackNavigator';
import OpportunitiesStackNavigator from './OpportunitiesStackNavigator';
import ProfileStackNavigator from './ProfileStackNavigator';
import QRScannerScreen from '../screens/qr/QRScannerScreen';
import LeaderboardStackNavigator from './LeaderboardStackNavigator';
import { Strings } from '../constants/strings';

const Tab = createBottomTabNavigator<MainTabParamList>();

const QR_TAB_SIZE = 56;

const TabNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: Colors.primary.purple,
        tabBarInactiveTintColor: Colors.text.secondary,
        tabBarStyle: {
          backgroundColor: Colors.ui.tabBar,
          borderTopColor: Colors.ui.border,
          borderTopWidth: 1,
          height: 70,
          paddingBottom: 10,
          paddingTop: 6,
        },
        tabBarLabelStyle: {
          fontFamily: Typography.fontFamily.medium,
          fontSize: Typography.fontSize.xs,
        },
        tabBarIcon: ({ color, focused }) => {
          const icons: Record<string, { outline: string; filled: string }> = {
            HomeTab: { outline: 'home-outline', filled: 'home' },
            OpportunitiesTab: { outline: 'compass-outline', filled: 'compass' },
            QRTab: { outline: 'qr-code-outline', filled: 'qr-code' },
            LeaderboardTab: { outline: 'trophy-outline', filled: 'trophy' },
            ProfileTab: { outline: 'person-outline', filled: 'person' },
          };

          const iconSet = icons[route.name];
          const iconName = focused ? iconSet?.filled : iconSet?.outline;

          if (route.name === 'QRTab') {
            return (
              <View style={styles.qrButton}>
                <Ionicons name="qr-code" size={26} color={Colors.text.white} />
              </View>
            );
          }

          return (
            <Ionicons name={iconName as any} size={22} color={color} />
          );
        },
      })}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeStackNavigator}
        options={{ title: Strings.navigation.home }}
      />
      <Tab.Screen
        name="OpportunitiesTab"
        component={OpportunitiesStackNavigator}
        options={{ title: Strings.navigation.opportunities }}
      />
      <Tab.Screen
        name="QRTab"
        component={QRScannerScreen}
        options={{
          title: Strings.navigation.qrScanner,
          tabBarLabelStyle: {
            fontFamily: Typography.fontFamily.medium,
            fontSize: Typography.fontSize.xs,
            marginTop: 4,
          },
        }}
      />
      <Tab.Screen
        name="LeaderboardTab"
        component={LeaderboardStackNavigator}
        options={{ title: Strings.navigation.leaderboard }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={ProfileStackNavigator}
        options={{ title: Strings.navigation.profile }}
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  qrButton: {
    width: QR_TAB_SIZE,
    height: QR_TAB_SIZE,
    borderRadius: QR_TAB_SIZE / 2,
    backgroundColor: Colors.primary.purple,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    shadowColor: Colors.primary.purple,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
});

export default TabNavigator;
