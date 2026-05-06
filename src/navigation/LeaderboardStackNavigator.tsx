import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { LeaderboardStackParamList } from '../types';

import LeaderboardScreen from '../screens/leaderboard/LeaderboardScreen';
import AddFriendsScreen from '../screens/leaderboard/AddFriendsScreen';

const Stack = createNativeStackNavigator<LeaderboardStackParamList>();

const LeaderboardStackNavigator: React.FC = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Leaderboard" component={LeaderboardScreen} />
      <Stack.Screen name="AddFriends" component={AddFriendsScreen} />
    </Stack.Navigator>
  );
};

export default LeaderboardStackNavigator;
