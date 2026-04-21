import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography } from '../../constants';

interface BadgeProps {
  label: string;
  color?: string;
  textColor?: string;
  size?: 'sm' | 'md';
  icon?: string;
  style?: ViewStyle;
}

const Badge: React.FC<BadgeProps> = ({
  label,
  color = Colors.primary.purple,
  textColor = Colors.text.white,
  size = 'md',
  icon,
  style,
}) => {
  const padding = size === 'sm' ? { paddingVertical: 3, paddingHorizontal: 8 } : { paddingVertical: 5, paddingHorizontal: 12 };
  const fontSize = size === 'sm' ? Typography.fontSize.xs : Typography.fontSize.sm;
  const iconSize = size === 'sm' ? 10 : 12;

  return (
    <View style={[styles.badge, { backgroundColor: color }, padding, style]}>
      {icon && (
        <Ionicons
          name={icon as any}
          size={iconSize}
          color={textColor}
          style={styles.icon}
        />
      )}
      <Text style={[styles.text, { color: textColor, fontSize }]}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  icon: {
    marginRight: 4,
  },
  text: {
    fontFamily: Typography.fontFamily.medium,
    textAlign: 'center',
  },
});

export default Badge;
