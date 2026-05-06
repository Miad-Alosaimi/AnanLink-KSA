import React, { useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import * as Haptics from 'expo-haptics';

import { Colors, Typography, Strings, SKILL_TRACKS, XP_PER_UNIT } from '../../constants';
import { ProfileStackParamList } from '../../types';
import { useTrackProgress } from '../../hooks/useSkillProgress';
import { LoadingSpinner } from '../../components/common';

type Route = RouteProp<ProfileStackParamList, 'SkillPathDetail'>;

const SkillPathDetailScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute<Route>();
  const insets = useSafeAreaInsets();

  const { trackId } = route.params;
  const track = useMemo(() => SKILL_TRACKS.find(t => t.id === trackId), [trackId]);
  const { completed, isLoading, toggle } = useTrackProgress(trackId);

  if (!track) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>مسار غير موجود</Text>
      </View>
    );
  }

  const total = track.units.length;
  const completedCount = completed.length;
  const progressPercent = total > 0 ? Math.round((completedCount / total) * 100) : 0;

  const handleToggle = async (unitIndex: number, isDone: boolean) => {
    const result = await toggle(unitIndex);

    if (result.xpDelta > 0) {
      // Completed — celebrate
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else if (result.xpDelta < 0) {
      await Haptics.selectionAsync();
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      <LinearGradient
        colors={track.gradient}
        start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
        style={[styles.header, { paddingTop: insets.top + 12 }]}
      >
        <View style={styles.topRow}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backBtn}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="chevron-forward" size={22} color={Colors.text.white} />
          </TouchableOpacity>
          <Text style={styles.iconEmoji}>{track.icon}</Text>
          <View style={{ width: 36 }} />
        </View>

        <Text style={styles.headerTitle}>{track.title}</Text>
        <Text style={styles.headerTech}>{track.tech}</Text>

        <View style={styles.statsRow}>
          <View style={styles.statPill}>
            <Ionicons name="checkmark-circle" size={14} color={Colors.text.white} />
            <Text style={styles.statPillText}>{completedCount}/{total}</Text>
          </View>
          <View style={styles.statPill}>
            <Ionicons name="star" size={14} color={Colors.xp.gold} />
            <Text style={styles.statPillText}>+{XP_PER_UNIT} XP لكل وحدة</Text>
          </View>
        </View>

        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${progressPercent}%` }]} />
        </View>
        <Text style={styles.progressLabel}>{progressPercent}% مكتمل</Text>
      </LinearGradient>

      {isLoading ? (
        <LoadingSpinner />
      ) : (
        <FlatList
          data={track.units}
          keyExtractor={(_, i) => String(i)}
          contentContainerStyle={styles.listContent}
          renderItem={({ item, index }) => {
            const isDone = completed.includes(index);
            return (
              <TouchableOpacity
                onPress={() => handleToggle(index, isDone)}
                activeOpacity={0.8}
                style={[styles.unitCard, isDone && styles.unitCardDone]}
              >
                <View style={styles.checkBtn}>
                  <Ionicons
                    name={isDone ? 'checkmark-circle' : 'ellipse-outline'}
                    size={26}
                    color={isDone ? Colors.status.success : Colors.ui.border}
                  />
                </View>
                <View style={styles.unitInfo}>
                  <Text style={[styles.unitTitle, isDone && styles.unitTitleDone]}>
                    {item.title}
                  </Text>
                  <Text style={styles.unitDesc}>{item.desc}</Text>
                  {item.tech && (
                    <View style={styles.unitTechRow}>
                      <Text style={styles.unitTech}>{item.tech}</Text>
                    </View>
                  )}
                  <View style={styles.unitMeta}>
                    <Ionicons name="time-outline" size={12} color={Colors.text.secondary} />
                    <Text style={styles.unitMetaText}>{item.hours} ساعة</Text>
                    <View style={styles.dot} />
                    <Ionicons name="star" size={12} color={Colors.xp.gold} />
                    <Text style={[styles.unitMetaText, styles.xpText]}>+{XP_PER_UNIT} XP</Text>
                  </View>
                </View>
                <View style={[
                  styles.unitNum,
                  { backgroundColor: isDone ? Colors.status.success + '22' : Colors.ui.inputBg },
                ]}>
                  <Text style={[
                    styles.unitNumText,
                    { color: isDone ? Colors.status.success : Colors.text.secondary },
                  ]}>
                    {index + 1}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          }}
          ListFooterComponent={
            completedCount === total ? (
              <View style={styles.completionBanner}>
                <Ionicons name="trophy" size={28} color={Colors.xp.gold} />
                <Text style={styles.completionText}>هنيئاً! أكملت المسار بالكامل 🎉</Text>
                <Text style={styles.completionXP}>
                  كسبت {total * XP_PER_UNIT} XP من هذا المسار
                </Text>
              </View>
            ) : null
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background.app },
  errorContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  errorText: {
    fontFamily: Typography.fontFamily.semiBold,
    fontSize: Typography.fontSize.lg,
    color: Colors.text.secondary,
  },

  header: {
    paddingHorizontal: 20, paddingBottom: 20,
    alignItems: 'center', gap: 8,
  },
  topRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    width: '100%', marginBottom: 4,
  },
  backBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center', justifyContent: 'center',
  },
  iconEmoji: { fontSize: 40 },
  headerTitle: {
    fontFamily: Typography.fontFamily.bold,
    fontSize: Typography.fontSize.xl,
    color: Colors.text.white,
  },
  headerTech: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.fontSize.sm,
    color: 'rgba(255,255,255,0.85)',
  },
  statsRow: {
    flexDirection: 'row', gap: 8, marginTop: 4, marginBottom: 6,
  },
  statPill: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: 'rgba(255,255,255,0.18)',
    paddingVertical: 5, paddingHorizontal: 10, borderRadius: 12,
  },
  statPillText: {
    fontFamily: Typography.fontFamily.semiBold,
    fontSize: Typography.fontSize.xs,
    color: Colors.text.white,
  },
  progressTrack: {
    width: '100%', height: 6,
    backgroundColor: 'rgba(255,255,255,0.25)',
    borderRadius: 3, overflow: 'hidden',
    marginTop: 8,
  },
  progressFill: {
    height: '100%', backgroundColor: Colors.text.white, borderRadius: 3,
  },
  progressLabel: {
    fontFamily: Typography.fontFamily.medium,
    fontSize: Typography.fontSize.xs,
    color: 'rgba(255,255,255,0.85)',
  },

  listContent: { padding: 16, gap: 10 },

  unitCard: {
    backgroundColor: Colors.background.card,
    borderRadius: 14, padding: 14,
    flexDirection: 'row', alignItems: 'center', gap: 12,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4,
    elevation: 1,
  },
  unitCardDone: { backgroundColor: Colors.status.success + '0C' },
  checkBtn: {},
  unitInfo: { flex: 1, gap: 2 },
  unitTitle: {
    fontFamily: Typography.fontFamily.semiBold,
    fontSize: Typography.fontSize.base,
    color: Colors.text.primary,
    textAlign: 'right',
  },
  unitTitleDone: { textDecorationLine: 'line-through', color: Colors.text.secondary },
  unitDesc: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.fontSize.sm,
    color: Colors.text.secondary,
    textAlign: 'right',
  },
  unitTechRow: { marginTop: 2 },
  unitTech: {
    fontFamily: Typography.fontFamily.medium,
    fontSize: 11,
    color: Colors.primary.purple,
    textAlign: 'right',
  },
  unitMeta: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    justifyContent: 'flex-end', marginTop: 4,
  },
  unitMetaText: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.fontSize.xs,
    color: Colors.text.secondary,
  },
  xpText: { color: Colors.xp.bronze, fontFamily: Typography.fontFamily.semiBold },
  dot: { width: 3, height: 3, borderRadius: 1.5, backgroundColor: Colors.text.muted, marginHorizontal: 4 },
  unitNum: {
    width: 36, height: 36, borderRadius: 10,
    alignItems: 'center', justifyContent: 'center',
  },
  unitNumText: {
    fontFamily: Typography.fontFamily.bold,
    fontSize: Typography.fontSize.base,
  },

  completionBanner: {
    backgroundColor: Colors.xp.goldLight,
    borderRadius: 16, padding: 20,
    alignItems: 'center', marginTop: 16,
    gap: 6,
  },
  completionText: {
    fontFamily: Typography.fontFamily.bold,
    fontSize: Typography.fontSize.base,
    color: Colors.text.primary,
    textAlign: 'center',
  },
  completionXP: {
    fontFamily: Typography.fontFamily.medium,
    fontSize: Typography.fontSize.sm,
    color: Colors.xp.bronze,
  },
});

export default SkillPathDetailScreen;
