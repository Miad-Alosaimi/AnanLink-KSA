import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, TextInputProps } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography } from '../../constants';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  leftIcon?: keyof typeof Ionicons.glyphMap;
}

const Input: React.FC<InputProps> = ({ label, error, leftIcon, secureTextEntry, ...props }) => {
  const [hidden, setHidden] = useState(secureTextEntry ?? false);

  return (
    <View style={styles.wrapper}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <View style={[styles.row, error ? styles.rowError : null]}>
        {leftIcon ? <Ionicons name={leftIcon} size={18} color={Colors.text.secondary} style={styles.icon} /> : null}
        <TextInput
          style={styles.input}
          placeholderTextColor={Colors.ui.placeholder}
          textAlign="right"
          secureTextEntry={hidden}
          {...props}
        />
        {secureTextEntry ? (
          <TouchableOpacity onPress={() => setHidden(!hidden)}>
            <Ionicons name={hidden ? 'eye-outline' : 'eye-off-outline'} size={18} color={Colors.text.secondary} />
          </TouchableOpacity>
        ) : null}
      </View>
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: { marginBottom: 16 },
  label: {
    fontFamily: Typography.fontFamily.medium,
    fontSize: Typography.fontSize.sm,
    color: Colors.text.primary,
    textAlign: 'right',
    marginBottom: 6,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.ui.inputBg,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: Colors.ui.border,
    paddingHorizontal: 14,
    paddingVertical: 2,
    gap: 8,
  },
  rowError: { borderColor: Colors.status.error },
  icon: { },
  input: {
    flex: 1,
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.fontSize.base,
    color: Colors.text.primary,
    paddingVertical: 12,
  },
  error: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.fontSize.xs,
    color: Colors.status.error,
    textAlign: 'right',
    marginTop: 4,
  },
});

export default Input;
