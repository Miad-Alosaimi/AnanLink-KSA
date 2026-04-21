import React, { ReactNode } from 'react';
import { View, StyleSheet, ViewStyle, Platform } from 'react-native';
import { Colors } from '../../constants';
import Touchable from './Touchable';

interface CardProps {
  children: ReactNode;
  style?: ViewStyle;
  onPress?: () => void;
  elevation?: number;
  borderRadius?: number;
}

const Card: React.FC<CardProps> = ({
  children,
  style,
  onPress,
  elevation = 3,
  borderRadius = 16,
}) => {
  const dynamicStyle: ViewStyle = {
    borderRadius,
    ...Platform.select({ android: { elevation } }),
  };

  if (onPress) {
    return (
      <Touchable
        onPress={onPress}
        activeOpacity={0.92}
        style={[styles.card, dynamicStyle, style]}
      >
        {children}
      </Touchable>
    );
  }

  return <View style={[styles.card, dynamicStyle, style]}>{children}</View>;
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.background.card,
    ...Platform.select({
      ios: {
        shadowColor: Colors.ui.shadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 1,
        shadowRadius: 8,
      },
    }),
  },
});

export default Card;
