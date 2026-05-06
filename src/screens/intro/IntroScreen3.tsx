import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import IntroLayout from './_shared/IntroLayout';
import { Colors, Typography, Strings } from '../../constants';
import { RootStackParamList } from '../../types';

type Nav = NativeStackNavigationProp<RootStackParamList>;

const IntroScreen3: React.FC = () => {
  const navigation = useNavigation<Nav>();

  const SkillBar: React.FC<{ label: string; progress: number; percent: string }> = ({
    label, progress, percent,
  }) => (
    <View style={styles.skillRow}>
      <View style={styles.skillHeader}>
        <Text style={styles.skillLabel}>{label}</Text>
        <Text style={styles.skillPercent}>{percent}</Text>
      </View>
      <View style={styles.skillTrack}>
        <LinearGradient
          colors={Colors.gradient.all}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
          style={[styles.skillFill, { width: `${progress}%` }]}
        />
      </View>
    </View>
  );

  return (
    <IntroLayout
      index={1}
      accentGradient={[Colors.primary.teal2, Colors.primary.teal3]}
      ringColor="rgba(67, 177, 163, 0.10)"
      iconTile={<Text style={styles.starEmoji}>⭐</Text>}
      topBadge={
        <View style={styles.levelChip}>
          <Text style={styles.levelChipText}>{Strings.intro.screen3.badge}</Text>
          <Text style={styles.levelChipEmoji}>🏆</Text>
        </View>
      }
      sideBadge={
        <View style={styles.rankChip}>
          <Ionicons name="podium" size={11} color={Colors.primary.teal2} />
          <Text style={styles.rankChipText}>{Strings.intro.screen3.subBadge}</Text>
        </View>
      }
      title={Strings.intro.screen3.title}
      titleBottom={Strings.intro.screen3.titleBottom}
      subtitle={Strings.intro.screen3.subtitle}
      extraContent={
        <View style={styles.skillsCard}>
          <SkillBar label={Strings.intro.screen3.skill1} progress={75} percent="75%" />
          <SkillBar label={Strings.intro.screen3.skill2} progress={62} percent="62%" />
        </View>
      }
      primaryLabel={Strings.intro.next}
      secondaryLabel={Strings.intro.skip}
      onPrimaryPress={() => navigation.navigate('Intro4' as any)}
      onSecondaryPress={() => navigation.navigate('Onboarding' as any)}
    />
  );
};

const styles = StyleSheet.create({
  starEmoji: { fontSize: 62 },
  levelChip: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: Colors.text.white, borderRadius: 16,
    paddingVertical: 6, paddingHorizontal: 12,
    shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.12, shadowRadius: 6,
    elevation: 3,
  },
  levelChipText: {
    fontFamily: Typography.fontFamily.semiBold, fontSize: 11,
    color: Colors.text.primary,
  },
  levelChipEmoji: { fontSize: 12 },
  rankChip: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: Colors.text.white, borderRadius: 14,
    paddingVertical: 6, paddingHorizontal: 10,
    shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.12, shadowRadius: 6,
    elevation: 3,
  },
  rankChipText: {
    fontFamily: Typography.fontFamily.medium, fontSize: 10,
    color: Colors.text.secondary,
  },
  skillsCard: {
    backgroundColor: Colors.background.card,
    borderRadius: 14, padding: 14,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8,
    elevation: 2,
    gap: 10,
  },
  skillRow: {},
  skillHeader: {
    flexDirection: 'row', justifyContent: 'space-between',
    marginBottom: 6,
  },
  skillLabel: {
    fontFamily: Typography.fontFamily.semiBold, fontSize: Typography.fontSize.sm,
    color: Colors.text.primary,
  },
  skillPercent: {
    fontFamily: Typography.fontFamily.medium, fontSize: Typography.fontSize.xs,
    color: Colors.text.secondary,
  },
  skillTrack: {
    height: 6, backgroundColor: Colors.ui.border, borderRadius: 3, overflow: 'hidden',
  },
  skillFill: { height: '100%', borderRadius: 3 },
});

export default IntroScreen3;
