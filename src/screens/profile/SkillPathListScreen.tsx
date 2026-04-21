import React from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { Colors, Typography, Strings } from '../../constants';
import { ProfileStackParamList } from '../../types';
import { GradientHeader } from '../../components/common';

type Nav = NativeStackNavigationProp<ProfileStackParamList>;

const TRACKS = [
  { id: 'ai', title: Strings.skillPath.tracks.ai, icon: '🤖', gradient: [Colors.gradient.start, Colors.gradient.end] as [string, string], units: 8, completed: 2, difficulty: 'intermediate' },
  { id: 'mobile', title: Strings.skillPath.tracks.mobile, icon: '📱', gradient: [Colors.opportunity.internship, '#0EA5E9'] as [string, string], units: 10, completed: 0, difficulty: 'beginner' },
  { id: 'backend', title: Strings.skillPath.tracks.backend, icon: '⚙️', gradient: [Colors.opportunity.opensource, '#059669'] as [string, string], units: 12, completed: 5, difficulty: 'intermediate' },
  { id: 'frontend', title: Strings.skillPath.tracks.frontend, icon: '🎨', gradient: ['#3B82F6', '#6366F1'] as [string, string], units: 9, completed: 0, difficulty: 'beginner' },
  { id: 'security', title: Strings.skillPath.tracks.security, icon: '🔒', gradient: ['#EF4444', '#DC2626'] as [string, string], units: 7, completed: 0, difficulty: 'advanced' },
  { id: 'cloud', title: Strings.skillPath.tracks.cloud, icon: '☁️', gradient: [Colors.opportunity.volunteer, '#D97706'] as [string, string], units: 6, completed: 1, difficulty: 'intermediate' },
];

const DIFFICULTY_COLORS: Record<string, string> = {
  beginner: Colors.status.success,
  intermediate: Colors.status.warning,
  advanced: Colors.status.error,
};

const SkillPathListScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();

  return (
    <View style={styles.container}>
      <GradientHeader title={Strings.skillPath.title} showBack onBack={() => navigation.goBack()} />
      <FlatList
        data={TRACKS}
        keyExtractor={item => item.id}
        numColumns={2}
        contentContainerStyle={styles.listContent}
        columnWrapperStyle={styles.row}
        renderItem={({ item }) => {
          const progress = item.units > 0 ? item.completed / item.units : 0;
          return (
            <TouchableOpacity
              style={styles.trackCard}
              onPress={() => navigation.navigate('SkillPathDetail', { trackId: item.id })}
              activeOpacity={0.9}
            >
              <LinearGradient colors={item.gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.trackGradient}>
                <Text style={styles.trackIcon}>{item.icon}</Text>
                <Text style={styles.trackTitle}>{item.title}</Text>
                <Text style={styles.trackUnits}>{item.completed}/{item.units} {Strings.skillPath.units}</Text>
                {/* Progress bar */}
                <View style={styles.progressTrack}>
                  <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
                </View>
                <View style={[styles.difficultyBadge, { backgroundColor: DIFFICULTY_COLORS[item.difficulty] + '33' }]}>
                  <Text style={[styles.difficultyText, { color: DIFFICULTY_COLORS[item.difficulty] }]}>
                    {Strings.skillPath.difficulty[item.difficulty as keyof typeof Strings.skillPath.difficulty]}
                  </Text>
                </View>
              </LinearGradient>
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background.app },
  listContent: { padding: 16 },
  row: { gap: 12, marginBottom: 12 },
  trackCard: { flex: 1, borderRadius: 16, overflow: 'hidden' },
  trackGradient: { padding: 16, gap: 6, minHeight: 160 },
  trackIcon: { fontSize: 32, marginBottom: 4 },
  trackTitle: { fontFamily: Typography.fontFamily.semiBold, fontSize: Typography.fontSize.base, color: Colors.text.white },
  trackUnits: { fontFamily: Typography.fontFamily.regular, fontSize: Typography.fontSize.xs, color: 'rgba(255,255,255,0.8)' },
  progressTrack: { height: 4, backgroundColor: 'rgba(255,255,255,0.3)', borderRadius: 2, marginTop: 4, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: Colors.text.white, borderRadius: 2 },
  difficultyBadge: { paddingVertical: 3, paddingHorizontal: 8, borderRadius: 8, alignSelf: 'flex-end', marginTop: 4 },
  difficultyText: { fontFamily: Typography.fontFamily.medium, fontSize: Typography.fontSize.xs },
});

export default SkillPathListScreen;
