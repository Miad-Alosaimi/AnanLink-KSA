import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { OpportunitiesStackParamList } from '../types';

import OpportunityListScreen from '../screens/opportunities/OpportunityListScreen';
import OpportunityDetailScreen from '../screens/opportunities/OpportunityDetailScreen';

const Stack = createNativeStackNavigator<OpportunitiesStackParamList>();

const OpportunitiesStackNavigator: React.FC = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="OpportunityList" component={OpportunityListScreen} />
      <Stack.Screen name="HackathonDetail" component={OpportunityDetailScreen} />
      <Stack.Screen name="InternshipDetail" component={OpportunityDetailScreen} />
      <Stack.Screen name="OpenSourceDetail" component={OpportunityDetailScreen} />
      <Stack.Screen name="VolunteerDetail" component={OpportunityDetailScreen} />
    </Stack.Navigator>
  );
};

export default OpportunitiesStackNavigator;
