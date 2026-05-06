import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { OpportunitiesStackParamList } from '../types';

import OpportunityListScreen from '../screens/opportunities/OpportunityListScreen';
import BootcampDetailScreen from '../screens/opportunities/details/BootcampDetailScreen';
import InternshipDetailScreen from '../screens/opportunities/details/InternshipDetailScreen';
import VolunteerDetailScreen from '../screens/opportunities/details/VolunteerDetailScreen';
import OpenSourceDetailScreen from '../screens/opportunities/details/OpenSourceDetailScreen';

const Stack = createNativeStackNavigator<OpportunitiesStackParamList>();

const OpportunitiesStackNavigator: React.FC = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="OpportunityList" component={OpportunityListScreen} />
      <Stack.Screen name="BootcampDetail" component={BootcampDetailScreen} />
      <Stack.Screen name="InternshipDetail" component={InternshipDetailScreen} />
      <Stack.Screen name="OpenSourceDetail" component={OpenSourceDetailScreen} />
      <Stack.Screen name="VolunteerDetail" component={VolunteerDetailScreen} />
    </Stack.Navigator>
  );
};

export default OpportunitiesStackNavigator;
