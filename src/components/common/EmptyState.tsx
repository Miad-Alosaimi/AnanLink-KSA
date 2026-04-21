import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography } from '../../constants';
import Button from './Button';

interface EmptyStateProps {
  icon?: string;
  title: string;
  message?: string;
  action?: { label: string; onPress: () => void };
}

const EmptyState: React.FC<EmptyStateProps> = ({ icon = 'search-outline', title, message, action }) => {
  return (
    <View style={styles.container}>
      <Ionicons name={icon as any} size={60} color={Colors.ui.border} style={styles.icon} />
      <Text style={styles.title}>{title}</Text>
      {message ? <Text style={styles.message}>{message}</Text> : null}
      {action ? (
        <Button
          title={action.label}
          onPress={action.onPress}
          variant="secondary"
          fullWidth={false}
          style={styles.button}
        />
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    paddingVertical: 60,
  },
  icon: {
    marginBottom: 16,
  },
  title: {
    fontFamily: Typography.fontFamily.semiBold,
    fontSize: Typography.fontSize.lg,
    color: Colors.text.primary,
    textAlign: 'center',
    marginBottom: 8,
  },
  message: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.fontSize.base,
    color: Colors.text.secondary,
    textAlign: 'center',
    lineHeight: Typography.fontSize.base * 1.6,
    marginBottom: 24,
  },
  button: {
    marginTop: 8,
  },
});

export default EmptyState;
