import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, StyleSheet, ViewStyle } from 'react-native';
import { Colors, Typography } from '../../constants';

interface ButtonProps {
  title: string;
  onPress: () => void;
  isLoading?: boolean;
  disabled?: boolean;
  variant?: 'primary' | 'outline';
  style?: ViewStyle;
}

const Button: React.FC<ButtonProps> = ({
  title, onPress, isLoading, disabled, variant = 'primary', style,
}) => {
  const isPrimary = variant === 'primary';
  return (
    <TouchableOpacity
      style={[styles.base, isPrimary ? styles.primary : styles.outline, (disabled || isLoading) && styles.disabled, style]}
      onPress={onPress}
      disabled={disabled || isLoading}
      activeOpacity={0.85}
    >
      {isLoading
        ? <ActivityIndicator color={isPrimary ? '#fff' : Colors.primary.purple} size="small" />
        : <Text style={[styles.text, !isPrimary && styles.textOutline]}>{title}</Text>
      }
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: { borderRadius: 14, paddingVertical: 15, alignItems: 'center', justifyContent: 'center' },
  primary: { backgroundColor: Colors.primary.purple },
  outline: { backgroundColor: 'transparent', borderWidth: 1.5, borderColor: Colors.primary.purple },
  disabled: { opacity: 0.6 },
  text: { fontFamily: Typography.fontFamily.semiBold, fontSize: Typography.fontSize.base, color: '#fff' },
  textOutline: { color: Colors.primary.purple },
});

export default Button;
