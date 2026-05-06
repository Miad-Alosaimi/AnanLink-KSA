import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Typography } from '../../constants';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled = false,
  fullWidth = true,
  style,
  textStyle,
}) => {
  const isDisabled = disabled || isLoading;

  const sizeStyles = {
    sm: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: 10 },
    md: { paddingVertical: 14, paddingHorizontal: 24, borderRadius: 14 },
    lg: { paddingVertical: 18, paddingHorizontal: 32, borderRadius: 16 },
  };

  const textSizes = {
    sm: Typography.fontSize.sm,
    md: Typography.fontSize.md,
    lg: Typography.fontSize.lg,
  };

  if (variant === 'primary') {
    return (
      <TouchableOpacity
        onPress={onPress}
        disabled={isDisabled}
        activeOpacity={0.85}
        style={[fullWidth && styles.fullWidth, style]}
      >
        <LinearGradient
          colors={
            isDisabled
              ? [Colors.ui.disabled, Colors.ui.disabled]
              : Colors.gradient.all
          }
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[styles.gradientButton, sizeStyles[size]]}
        >
          {isLoading ? (
            <ActivityIndicator color={Colors.text.white} size="small" />
          ) : (
            <Text
              style={[
                styles.primaryText,
                { fontSize: textSizes[size] },
                textStyle,
              ]}
            >
              {title}
            </Text>
          )}
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  if (variant === 'secondary') {
    return (
      <TouchableOpacity
        onPress={onPress}
        disabled={isDisabled}
        activeOpacity={0.85}
        style={[
          styles.secondaryButton,
          sizeStyles[size],
          fullWidth && styles.fullWidth,
          isDisabled && styles.disabledOpacity,
          style,
        ]}
      >
        {isLoading ? (
          <ActivityIndicator color={Colors.primary.purple} size="small" />
        ) : (
          <Text
            style={[styles.secondaryText, { fontSize: textSizes[size] }, textStyle]}
          >
            {title}
          </Text>
        )}
      </TouchableOpacity>
    );
  }

  if (variant === 'danger') {
    return (
      <TouchableOpacity
        onPress={onPress}
        disabled={isDisabled}
        activeOpacity={0.85}
        style={[
          styles.dangerButton,
          sizeStyles[size],
          fullWidth && styles.fullWidth,
          isDisabled && styles.disabledOpacity,
          style,
        ]}
      >
        <Text style={[styles.primaryText, { fontSize: textSizes[size] }, textStyle]}>
          {title}
        </Text>
      </TouchableOpacity>
    );
  }

  // ghost
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.7}
      style={[
        styles.ghostButton,
        sizeStyles[size],
        fullWidth && styles.fullWidth,
        isDisabled && styles.disabledOpacity,
        style,
      ]}
    >
      <Text style={[styles.ghostText, { fontSize: textSizes[size] }, textStyle]}>
        {title}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  fullWidth: {
    width: '100%',
  },
  gradientButton: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButton: {
    borderWidth: 1.5,
    borderColor: Colors.primary.purple,
    backgroundColor: Colors.background.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dangerButton: {
    backgroundColor: Colors.status.error,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ghostButton: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryText: {
    color: Colors.text.white,
    fontFamily: Typography.fontFamily.semiBold,
    textAlign: 'center',
  },
  secondaryText: {
    color: Colors.primary.purple,
    fontFamily: Typography.fontFamily.semiBold,
    textAlign: 'center',
  },
  ghostText: {
    color: Colors.primary.purple,
    fontFamily: Typography.fontFamily.medium,
    textAlign: 'center',
  },
  disabledOpacity: {
    opacity: 0.5,
  },
});

export default Button;
