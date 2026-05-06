import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Animated,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

import { Colors, Typography, Strings } from '../../constants';
import { RootStackParamList } from '../../types';

const { width, height } = Dimensions.get('window');
type Nav = NativeStackNavigationProp<RootStackParamList>;

const IntroScreen1: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const insets = useSafeAreaInsets();

  // Entrance animations
  const logoScale = useRef(new Animated.Value(0.7)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const contentOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.spring(logoScale, { toValue: 1, friction: 6, tension: 50, useNativeDriver: true }),
        Animated.timing(logoOpacity, { toValue: 1, duration: 600, useNativeDriver: true }),
      ]),
      Animated.timing(contentOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />

      {/* Soft background wash */}
      <LinearGradient
        colors={['#F8F3FD', '#F0EBF8', '#E9F5F2']}
        start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      {/* Decorative blobs — soft pink/purple top-right, teal bottom-left */}
      <View style={styles.blobTopRight} />
      <View style={styles.blobBottomLeft} />

      <View style={[styles.content, { paddingTop: insets.top + 80, paddingBottom: insets.bottom + 40 }]}>
        {/* Logo tile */}
        <Animated.View
          style={[
            styles.logoTile,
            { opacity: logoOpacity, transform: [{ scale: logoScale }] },
          ]}
        >
          <Image
            source={require('../../../assets/logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </Animated.View>

        {/* App name + tagline */}
        <Animated.View style={{ opacity: contentOpacity, alignItems: 'center' }}>
          <Text style={styles.appName}>{Strings.app.name}</Text>
          <Text style={styles.tagline}>{Strings.app.tagline}</Text>
        </Animated.View>

        <View style={{ flex: 1 }} />

        {/* CTAs */}
        <Animated.View style={{ opacity: contentOpacity, width: '100%', alignItems: 'center' }}>
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => navigation.navigate('Intro2' as any)}
            style={styles.ctaWrapper}
          >
            <LinearGradient
              colors={Colors.gradient.all}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
              style={styles.ctaButton}
            >
              <Ionicons name="arrow-back" size={18} color={Colors.text.white} />
              <Text style={styles.ctaText}>{Strings.intro.screen1.startButton}</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => navigation.navigate('Auth' as any)}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Text style={styles.loginLink}>{Strings.intro.screen1.loginLink}</Text>
          </TouchableOpacity>

          {/* Feature emojis */}
          <View style={styles.featuresRow}>
            {[
              { emoji: '🏆', label: 'هاكاثونات' },
              { emoji: '💼', label: 'تدريب' },
              { emoji: '🌟', label: 'مصدر مفتوح' },
              { emoji: '🤝', label: 'تطوع' },
            ].map((item, i) => (
              <View key={i} style={styles.featureItem}>
                <Text style={styles.featureEmoji}>{item.emoji}</Text>
                <Text style={styles.featureLabel}>{item.label}</Text>
              </View>
            ))}
          </View>
        </Animated.View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background.app },
  blobTopRight: {
    position: 'absolute',
    top: -60, right: -80,
    width: 280, height: 280, borderRadius: 140,
    backgroundColor: 'rgba(143, 30, 174, 0.12)',
  },
  blobBottomLeft: {
    position: 'absolute',
    bottom: -80, left: -60,
    width: 260, height: 260, borderRadius: 130,
    backgroundColor: 'rgba(67, 177, 163, 0.14)',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  logoTile: {
    width: 180, height: 180, borderRadius: 42,
    backgroundColor: Colors.text.white,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 28,
    shadowColor: Colors.primary.purple,
    shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.25, shadowRadius: 26,
    elevation: 12,
    borderWidth: 1, borderColor: 'rgba(143, 30, 174, 0.08)',
  },
  logo: { width: 128, height: 128 },
  appName: {
    fontFamily: Typography.fontFamily.extraBold,
    fontSize: Typography.fontSize['4xl'],
    color: Colors.text.primary,
    textAlign: 'center',
    marginBottom: 10,
    letterSpacing: 0.5,
  },
  tagline: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.fontSize.sm,
    color: Colors.text.secondary,
    textAlign: 'center',
    lineHeight: Typography.fontSize.sm * 1.7,
    paddingHorizontal: 20,
  },
  ctaWrapper: { width: '100%', marginBottom: 14 },
  ctaButton: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderRadius: 16,
    shadowColor: Colors.primary.purple,
    shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.28, shadowRadius: 14,
    elevation: 6,
  },
  ctaText: {
    fontFamily: Typography.fontFamily.semiBold,
    fontSize: Typography.fontSize.md,
    color: Colors.text.white,
  },
  loginLink: {
    fontFamily: Typography.fontFamily.medium,
    fontSize: Typography.fontSize.sm,
    color: Colors.primary.purple,
    marginBottom: 28,
  },
  featuresRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 22,
  },
  featureItem: { alignItems: 'center', gap: 4 },
  featureEmoji: { fontSize: 22 },
  featureLabel: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: 10,
    color: Colors.text.secondary,
  },
});

export default IntroScreen1;
