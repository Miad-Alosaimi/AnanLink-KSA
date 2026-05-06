import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import IntroLayout from './_shared/IntroLayout';
import { Colors, Typography, Strings } from '../../constants';
import { RootStackParamList } from '../../types';

type Nav = NativeStackNavigationProp<RootStackParamList>;

const IntroScreen2: React.FC = () => {
  const navigation = useNavigation<Nav>();

  return (
    <IntroLayout
      index={0}
      accentGradient={[Colors.primary.purple, Colors.primary.purpleMid]}
      ringColor="rgba(143, 30, 174, 0.10)"
      iconTile={<Text style={styles.trophyEmoji}>🏆</Text>}
      topBadge={
        <View style={styles.topBadgePill}>
          <View style={styles.greenDot} />
        </View>
      }
      sideBadge={
        <View style={styles.xpChip}>
          <Ionicons name="star" size={11} color={Colors.xp.gold} />
          <Text style={styles.xpChipText}>{Strings.intro.screen2.badge}</Text>
        </View>
      }
      title={Strings.intro.screen2.title}
      titleBottom={Strings.intro.screen2.titleBottom}
      subtitle={Strings.intro.screen2.subtitle}
      primaryLabel={Strings.intro.next}
      secondaryLabel={Strings.intro.skip}
      onPrimaryPress={() => navigation.navigate('Intro3' as any)}
      onSecondaryPress={() => navigation.navigate('Onboarding' as any)}
    />
  );
};

const styles = StyleSheet.create({
  trophyEmoji: { fontSize: 62 },
  topBadgePill: {
    backgroundColor: Colors.text.white, borderRadius: 18,
    paddingVertical: 7, paddingHorizontal: 12,
    shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.12, shadowRadius: 6,
    elevation: 3,
  },
  greenDot: {
    width: 8, height: 8, borderRadius: 4,
    backgroundColor: Colors.status.success,
  },
  xpChip: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: Colors.text.white, borderRadius: 14,
    paddingVertical: 6, paddingHorizontal: 10,
    shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.12, shadowRadius: 6,
    elevation: 3,
  },
  xpChipText: {
    fontFamily: Typography.fontFamily.semiBold, fontSize: 11,
    color: Colors.text.primary,
  },
});

export default IntroScreen2;
