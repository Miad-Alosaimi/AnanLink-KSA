import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { Platform } from 'react-native';

import { Colors, Typography, Strings } from '../constants';
import { TabParamList, HomeStackParamList, OpportunitiesStackParamList, ProfileStackParamList } from '../types';

import HomeScreen from '../screens/home/HomeScreen';
import OpportunityListScreen from '../screens/opportunities/OpportunityListScreen';
import OpportunityDetailScreen from '../screens/opportunities/OpportunityDetailScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';

const Tab = createBottomTabNavigator<TabParamList>();
const HomeStack = createNativeStackNavigator<HomeStackParamList>();
const OppStack = createNativeStackNavigator<OpportunitiesStackParamList>();
const ProfileStack = createNativeStackNavigator<ProfileStackParamList>();

const HomeStackNav = () => (
  <HomeStack.Navigator screenOptions={{ headerShown: false }}>
    <HomeStack.Screen name="Home" component={HomeScreen} />
  </HomeStack.Navigator>
);

const OppStackNav = () => (
  <OppStack.Navigator screenOptions={{ headerShown: false }}>
    <OppStack.Screen name="OpportunityList" component={OpportunityListScreen} />
    <OppStack.Screen name="OpportunityDetail" component={OpportunityDetailScreen} />
  </OppStack.Navigator>
);

const ProfileStackNav = () => (
  <ProfileStack.Navigator screenOptions={{ headerShown: false }}>
    <ProfileStack.Screen name="Profile" component={ProfileScreen} />
  </ProfileStack.Navigator>
);

const TabNavigator: React.FC = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      headerShown: false,
      tabBarActiveTintColor: Colors.primary.purple,
      tabBarInactiveTintColor: Colors.text.muted,
      tabBarStyle: {
        backgroundColor: Colors.ui.tabBar,
        borderTopWidth: 1,
        borderTopColor: Colors.ui.border,
        height: Platform.OS === 'ios' ? 84 : 64,
        paddingBottom: Platform.OS === 'ios' ? 24 : 8,
      },
      tabBarLabelStyle: { fontFamily: Typography.fontFamily.medium, fontSize: 11 },
      tabBarIcon: ({ focused, color, size }) => {
        let iconName: keyof typeof Ionicons.glyphMap = 'home';
        if (route.name === 'HomeTab') iconName = focused ? 'home' : 'home-outline';
        else if (route.name === 'OpportunitiesTab') iconName = focused ? 'grid' : 'grid-outline';
        else if (route.name === 'ProfileTab') iconName = focused ? 'person' : 'person-outline';
        return <Ionicons name={iconName} size={size} color={color} />;
      },
    })}
  >
    <Tab.Screen name="HomeTab" component={HomeStackNav} options={{ title: Strings.navigation.home }} />
    <Tab.Screen name="OpportunitiesTab" component={OppStackNav} options={{ title: Strings.navigation.opportunities }} />
    <Tab.Screen name="ProfileTab" component={ProfileStackNav} options={{ title: Strings.navigation.profile }} />
  </Tab.Navigator>
);

export default TabNavigator;
