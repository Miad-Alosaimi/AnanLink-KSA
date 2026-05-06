import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  Animated,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { Colors, Typography } from '../../constants';
import { Strings } from '../../constants/strings';

const { width, height } = Dimensions.get('window');

const SplashScreen: React.FC = () => {
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.7)).current;
  const subtitleOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 700,
          useNativeDriver: true,
        }),
        Animated.spring(scale, {
          toValue: 1,
          friction: 6,
          tension: 50,
          useNativeDriver: true,
        }),
      ]),
      Animated.timing(subtitleOpacity, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <LinearGradient
      colors={Colors.gradient.all}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <StatusBar style="light" />

      {/* Decorative circles */}
      <View style={[styles.circle, styles.circleTopRight]} />
      <View style={[styles.circle, styles.circleBottomLeft]} />

      <Animated.View style={{ opacity, transform: [{ scale }], alignItems: 'center' }}>
        {/* Logo */}
        <View style={styles.logoContainer}>
          <Image
            source={require('../../../assets/logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        <Text style={styles.appName}>{Strings.app.name}</Text>
      </Animated.View>

      <Animated.View style={{ opacity: subtitleOpacity, alignItems: 'center' }}>
        <Text style={styles.tagline}>{Strings.app.tagline}</Text>

        {/* Bottom features row */}
        <View style={styles.featuresRow}>
          {['🏆', '💼', '⭐'].map((emoji, i) => (
            <View key={i} style={styles.featureItem}>
              <Text style={styles.featureEmoji}>{emoji}</Text>
            </View>
          ))}
        </View>
      </Animated.View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 24,
  },
  circle: {
    position: 'absolute',
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  circleTopRight: {
    width: 300,
    height: 300,
    top: -80,
    right: -80,
  },
  circleBottomLeft: {
    width: 200,
    height: 200,
    bottom: -50,
    left: -50,
  },
  logoContainer: {
    width: 180,
    height: 180,
    borderRadius: 42,
    backgroundColor: Colors.text.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.32, shadowRadius: 26,
    elevation: 14,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)',
  },
  logo: {
    width: 128,
    height: 128,
  },
  appName: {
    fontFamily: Typography.fontFamily.extraBold,
    fontSize: Typography.fontSize['4xl'],
    color: Colors.text.white,
    textAlign: 'center',
    letterSpacing: 1,
  },
  tagline: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.fontSize.sm,
    color: 'rgba(255,255,255,0.85)',
    textAlign: 'center',
    paddingHorizontal: 48,
    lineHeight: Typography.fontSize.sm * 1.7,
  },
  featuresRow: {
    flexDirection: 'row',
    gap: 20,
    marginTop: 24,
  },
  featureItem: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureEmoji: {
    fontSize: 20,
  },
});

export default SplashScreen;
