import React, { ReactNode } from 'react';
import {
  TouchableOpacity,
  TouchableNativeFeedback,
  View,
  Platform,
  ViewStyle,
  StyleProp,
} from 'react-native';

interface TouchableProps {
  children: ReactNode;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  activeOpacity?: number;
  rippleColor?: string;
  borderless?: boolean;
}

const Touchable: React.FC<TouchableProps> = ({
  children,
  onPress,
  style,
  activeOpacity = 0.9,
  rippleColor = 'rgba(0,0,0,0.1)',
  borderless = false,
}) => {
  if (Platform.OS === 'android') {
    return (
      <TouchableNativeFeedback
        onPress={onPress}
        background={TouchableNativeFeedback.Ripple(rippleColor, borderless)}
      >
        <View style={style}>{children}</View>
      </TouchableNativeFeedback>
    );
  }

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={activeOpacity} style={style}>
      {children}
    </TouchableOpacity>
  );
};

export default Touchable;
