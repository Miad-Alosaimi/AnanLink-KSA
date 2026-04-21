import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardTypeOptions,
  ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography } from '../../constants';

interface InputProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  secureTextEntry?: boolean;
  keyboardType?: KeyboardTypeOptions;
  error?: string;
  leftIcon?: string;
  rightIcon?: string;
  onRightIconPress?: () => void;
  multiline?: boolean;
  numberOfLines?: number;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  autoCorrect?: boolean;
  editable?: boolean;
  containerStyle?: ViewStyle;
  onPress?: () => void;
}

const Input: React.FC<InputProps> = ({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry = false,
  keyboardType = 'default',
  error,
  leftIcon,
  rightIcon,
  onRightIconPress,
  multiline = false,
  numberOfLines = 1,
  autoCapitalize = 'none',
  autoCorrect = false,
  editable = true,
  containerStyle,
  onPress,
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const isPassword = secureTextEntry;

  const borderColor = error
    ? Colors.status.error
    : isFocused
    ? Colors.primary.purple
    : Colors.ui.border;

  const InputWrapper = onPress ? TouchableOpacity : View;

  return (
    <View style={[styles.container, containerStyle]}>
      <Text style={styles.label}>{label}</Text>
      <InputWrapper
        onPress={onPress}
        style={[
          styles.inputContainer,
          { borderColor },
          !editable && styles.disabledInput,
        ]}
        activeOpacity={onPress ? 0.8 : 1}
      >
        {leftIcon && (
          <Ionicons
            name={leftIcon as any}
            size={18}
            color={Colors.text.secondary}
            style={styles.leftIcon}
          />
        )}
        {onPress ? (
          <Text
            style={[
              styles.input,
              !value && styles.placeholderText,
            ]}
            numberOfLines={1}
          >
            {value || placeholder}
          </Text>
        ) : (
          <TextInput
            value={value}
            onChangeText={onChangeText}
            placeholder={placeholder}
            placeholderTextColor={Colors.ui.placeholder}
            secureTextEntry={isPassword && !showPassword}
            keyboardType={keyboardType}
            autoCapitalize={autoCapitalize}
            autoCorrect={autoCorrect}
            editable={editable}
            multiline={multiline}
            numberOfLines={numberOfLines}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            style={[
              styles.input,
              multiline && { height: numberOfLines * 20, textAlignVertical: 'top' },
            ]}
            textAlign="right"
          />
        )}
        {isPassword && (
          <TouchableOpacity
            onPress={() => setShowPassword(!showPassword)}
            style={styles.rightIcon}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons
              name={showPassword ? 'eye-off-outline' : 'eye-outline'}
              size={18}
              color={Colors.text.secondary}
            />
          </TouchableOpacity>
        )}
        {rightIcon && !isPassword && (
          <TouchableOpacity
            onPress={onRightIconPress}
            style={styles.rightIcon}
            disabled={!onRightIconPress}
          >
            <Ionicons
              name={rightIcon as any}
              size={18}
              color={Colors.text.secondary}
            />
          </TouchableOpacity>
        )}
      </InputWrapper>
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontFamily: Typography.fontFamily.medium,
    fontSize: Typography.fontSize.sm,
    color: Colors.text.primary,
    marginBottom: 6,
    textAlign: 'right',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.ui.inputBg,
    borderWidth: 1.5,
    borderRadius: 12,
    paddingHorizontal: 14,
    minHeight: 50,
  },
  input: {
    flex: 1,
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.fontSize.base,
    color: Colors.text.primary,
    textAlign: 'right',
    paddingVertical: 10,
  },
  placeholderText: {
    color: Colors.ui.placeholder,
    paddingVertical: 10,
  },
  leftIcon: {
    marginLeft: 4,
    marginRight: 8,
  },
  rightIcon: {
    marginLeft: 8,
  },
  error: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.fontSize.xs,
    color: Colors.status.error,
    marginTop: 4,
    textAlign: 'right',
  },
  disabledInput: {
    opacity: 0.6,
  },
});

export default Input;
