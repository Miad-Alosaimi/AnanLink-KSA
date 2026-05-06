import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ProfileStackParamList } from '../types';

import UserProfileScreen from '../screens/profile/UserProfileScreen';
import BookmarksScreen from '../screens/profile/BookmarksScreen';
import SkillPathListScreen from '../screens/profile/SkillPathListScreen';
import SkillPathDetailScreen from '../screens/profile/SkillPathDetailScreen';
import EditProfileScreen from '../screens/profile/EditProfileScreen';
import AboutScreen from '../screens/profile/AboutScreen';
import MyQRScreen from '../screens/profile/MyQRScreen';

const Stack = createNativeStackNavigator<ProfileStackParamList>();

const ProfileStackNavigator: React.FC = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Profile" component={UserProfileScreen} />
      <Stack.Screen name="Bookmarks" component={BookmarksScreen} />
      <Stack.Screen name="SkillPathList" component={SkillPathListScreen} />
      <Stack.Screen name="SkillPathDetail" component={SkillPathDetailScreen} />
      <Stack.Screen name="EditProfile" component={EditProfileScreen} />
      <Stack.Screen name="About" component={AboutScreen} />
      <Stack.Screen name="MyQR" component={MyQRScreen} />
    </Stack.Navigator>
  );
};

export default ProfileStackNavigator;
