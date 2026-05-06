import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Dimensions,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { Colors, Typography, Strings } from '../../constants';
import { RootStackParamList } from '../../types';

const { width, height } = Dimensions.get('window');
const ONBOARDING_KEY = '@ananlink_hasSeenOnboarding';

type Nav = NativeStackNavigationProp<RootStackParamList>;

const SLIDES = [
  {
    id: '1',
    icon: 'rocket-outline' as const,
    emojiIcon: '🚀',
    gradient: [Colors.primary.purple, Colors.primary.purpleMid] as [string, string],
    title: Strings.onboarding.slide1.title,
    subtitle: Strings.onboarding.slide1.subtitle,
  },
  {
    id: '2',
    icon: 'star-outline' as const,
    emojiIcon: '⭐',
    gradient: [Colors.primary.purpleMid, Colors.primary.teal] as [string, string],
    title: Strings.onboarding.slide2.title,
    subtitle: Strings.onboarding.slide2.subtitle,
  },
  {
    id: '3',
    icon: 'map-outline' as const,
    emojiIcon: '🗺️',
    gradient: [Colors.primary.teal, Colors.primary.teal2] as [string, string],
    title: Strings.onboarding.slide3.title,
    subtitle: Strings.onboarding.slide3.subtitle,
  },
];

const OnboardingScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  const handleFinish = async () => {
    await AsyncStorage.setItem(ONBOARDING_KEY, 'true');
    navigation.navigate('Auth');
  };

  const handleNext = () => {
    if (currentIndex < SLIDES.length - 1) {
      const nextIndex = currentIndex + 1;
      flatListRef.current?.scrollToIndex({ index: nextIndex, animated: true });
      setCurrentIndex(nextIndex);
    } else {
      handleFinish();
    }
  };

  const handleSkip = () => {
    handleFinish();
  };

  const renderSlide = ({ item }: { item: typeof SLIDES[0] }) => (
    <View style={styles.slideContainer}>
      <LinearGradient
        colors={[...item.gradient]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.slideGradient}
      >
        {/* Decorative circles */}
        <View style={styles.decorCircle1} />
        <View style={styles.decorCircle2} />

        <View style={styles.iconWrapper}>
          <Text style={styles.emojiIcon}>{item.emojiIcon}</Text>
        </View>
      </LinearGradient>

      <View style={styles.textSection}>
        <Text style={styles.slideTitle}>{item.title}</Text>
        <Text style={styles.slideSubtitle}>{item.subtitle}</Text>
      </View>
    </View>
  );

  const isLastSlide = currentIndex === SLIDES.length - 1;

  return (
    <View style={styles.container}>
      {/* Skip button */}
      <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
        <Text style={styles.skipText}>{Strings.onboarding.skip}</Text>
      </TouchableOpacity>

      <FlatList
        ref={flatListRef}
        data={SLIDES}
        renderItem={renderSlide}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        scrollEnabled
        onMomentumScrollEnd={(e) => {
          const index = Math.round(e.nativeEvent.contentOffset.x / width);
          setCurrentIndex(index);
        }}
        style={styles.flatList}
      />

      {/* Dots */}
      <View style={styles.dotsContainer}>
        {SLIDES.map((_, index) => (
          <View
            key={index}
            style={[
              styles.dot,
              index === currentIndex ? styles.activeDot : styles.inactiveDot,
            ]}
          />
        ))}
      </View>

      {/* Next / Start button */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity onPress={handleNext} activeOpacity={0.9}>
          <LinearGradient
            colors={Colors.gradient.all}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.nextButton}
          >
            <Text style={styles.nextButtonText}>
              {isLastSlide ? Strings.onboarding.start : Strings.onboarding.next}
            </Text>
            {!isLastSlide && (
              <Ionicons name="arrow-back" size={18} color={Colors.text.white} style={styles.arrowIcon} />
            )}
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.app,
  },
  skipButton: {
    position: 'absolute',
    top: 56,
    left: 24,
    zIndex: 10,
  },
  skipText: {
    fontFamily: Typography.fontFamily.medium,
    fontSize: Typography.fontSize.base,
    color: Colors.text.secondary,
  },
  flatList: {
    flex: 1,
  },
  slideContainer: {
    width,
    flex: 1,
  },
  slideGradient: {
    height: height * 0.52,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  decorCircle1: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: 'rgba(255,255,255,0.07)',
    top: -80,
    right: -60,
  },
  decorCircle2: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(255,255,255,0.07)',
    bottom: -40,
    left: -40,
  },
  iconWrapper: {
    width: 120,
    height: 120,
    borderRadius: 36,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.35)',
  },
  emojiIcon: {
    fontSize: 56,
  },
  textSection: {
    flex: 1,
    paddingHorizontal: 32,
    paddingTop: 36,
    alignItems: 'center',
  },
  slideTitle: {
    fontFamily: Typography.fontFamily.bold,
    fontSize: Typography.fontSize['2xl'],
    color: Colors.text.primary,
    textAlign: 'center',
    marginBottom: 14,
  },
  slideSubtitle: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.fontSize.base,
    color: Colors.text.secondary,
    textAlign: 'center',
    lineHeight: Typography.fontSize.base * 1.7,
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    paddingBottom: 20,
  },
  dot: {
    borderRadius: 4,
    height: 8,
  },
  activeDot: {
    width: 24,
    backgroundColor: Colors.primary.purple,
  },
  inactiveDot: {
    width: 8,
    backgroundColor: Colors.ui.border,
  },
  buttonContainer: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  nextButton: {
    borderRadius: 16,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  nextButtonText: {
    fontFamily: Typography.fontFamily.semiBold,
    fontSize: Typography.fontSize.lg,
    color: Colors.text.white,
  },
  arrowIcon: {
    transform: [{ scaleX: -1 }],
  },
});

export default OnboardingScreen;
