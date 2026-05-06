import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { HomeStackParamList } from '../types';

import HomeScreen from '../screens/home/HomeScreen';
import HomeMapScreen from '../screens/home/HomeMapScreen';
import OpportunityDetailDispatcher from '../screens/home/OpportunityDetailDispatcher';

const Stack = createNativeStackNavigator<HomeStackParamList>();

const HomeStackNavigator: React.FC = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="HomeMap" component={HomeMapScreen} />
      <Stack.Screen name="OpportunityDetail" component={OpportunityDetailDispatcher} />
    </Stack.Navigator>
  );
};

export default HomeStackNavigator;
