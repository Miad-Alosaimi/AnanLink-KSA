import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Typography } from '../../constants';

interface FilterChipProps {
  label: string;
  isSelected: boolean;
  onPress: () => void;
  count?: number;
}

const FilterChip: React.FC<FilterChipProps> = ({ label, isSelected, onPress, count }) => {
  const displayLabel = count !== undefined ? `${label} (${count})` : label;

  if (isSelected) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.85} style={styles.wrapper}>
        <LinearGradient
          colors={Colors.gradient.all}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.selectedChip}
        >
          <Text style={styles.selectedText}>{displayLabel}</Text>
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      style={styles.chip}
    >
      <Text style={styles.text}>{displayLabel}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    marginLeft: 8,
  },
  selectedChip: {
    paddingVertical: 7,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginLeft: 8,
  },
  chip: {
    paddingVertical: 7,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: Colors.ui.border,
    backgroundColor: Colors.background.card,
    marginLeft: 8,
  },
  selectedText: {
    fontFamily: Typography.fontFamily.semiBold,
    fontSize: Typography.fontSize.sm,
    color: Colors.text.white,
  },
  text: {
    fontFamily: Typography.fontFamily.medium,
    fontSize: Typography.fontSize.sm,
    color: Colors.text.secondary,
  },
});

export default FilterChip;
