import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { Colors } from '../constants';
import { useAuth } from '../context';
import AuthNavigator from './AuthNavigator';
import TabNavigator from './TabNavigator';

const RootNavigator: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: Colors.primary.purple, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator color="#fff" size="large" />
      </View>
    );
  }

  return isAuthenticated ? <TabNavigator /> : <AuthNavigator />;
};

export default RootNavigator;
