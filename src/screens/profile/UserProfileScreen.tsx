import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  Alert,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

import { Colors, Typography, Strings } from '../../constants';
import { ProfileStackParamList, Achievement, QRCheckIn } from '../../types';
import { useAuth, useUser } from '../../context';
import {
  getBookmarkCountByType,
  getCheckInCount,
  getUserCheckIns,
} from '../../database/queries';
import { LoadingSpinner } from '../../components/common';
import { SkillTrackCard, ProfileMenuModal } from '../../components/profile';
import { levelProgress, xpToNextLevel, xpAtNextLevel, getLevel } from '../../utils/levelCalc';
import { useAllSkillProgress } from '../../hooks/useSkillProgress';

type Nav = NativeStackNavigationProp<ProfileStackParamList>;

const MAX_ACHIEVEMENTS_SHOWN = 3;
const MAX_CONTRIBUTIONS_SHOWN = 4;
const MAX_TRACKS_SHOWN = 6;

const UserProfileScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const insets = useSafeAreaInsets();
  const { logout, userId } = useAuth();
  const { user, isLoading, getUserAchievementsData, refreshUser } = useUser();
  const {
    counts: skillCounts,
    unlockStates,
    careerTracks,
    refresh: refreshSkills,
  } = useAllSkillProgress();

  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [checkIns, setCheckIns] = useState<QRCheckIn[]>([]);
  const [bootcampCount, setBootcampCount] = useState(0);
  const [checkInCount, setCheckInCount] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);

  const load = useCallback(async () => {
    if (!userId) return;
    const [ach, countsByType, cCount, scans] = await Promise.all([
      getUserAchievementsData(),
      getBookmarkCountByType(userId),
      getCheckInCount(userId),
      getUserCheckIns(userId),
    ]);
    setAchievements(ach);
    setBootcampCount(countsByType.bootcamp);
    setCheckInCount(cCount);
    setCheckIns(scans);
  }, [userId, getUserAchievementsData]);

  useFocusEffect(
    useCallback(() => {
      load();
      refreshSkills();
      if (userId) refreshUser();
    }, [load, refreshSkills, userId, refreshUser])
  );

  const onRefresh = async () => {
    setIsRefreshing(true);
    await Promise.all([load(), refreshSkills()]);
    if (userId) await refreshUser();
    setIsRefreshing(false);
  };

  const handleLogout = () => {
    Alert.alert(Strings.profile.logoutConfirm, '', [
      { text: Strings.profile.logoutNo, style: 'cancel' },
      { text: Strings.profile.logoutYes, style: 'destructive', onPress: logout },
    ]);
  };

  if (isLoading || !user) return <LoadingSpinner />;

  const currentLevel = getLevel(user.xp);
  const progress = levelProgress(user.xp);
  const xpToNext = xpToNextLevel(user.xp);
  const nextThreshold = xpAtNextLevel(user.xp);
  const rankTitle = Strings.profile.levelRank[currentLevel as keyof typeof Strings.profile.levelRank] ?? '';
  const initials = [user.firstName[0], user.lastName[0]].filter(Boolean).join('');

  // Derive stats per the design:
  // Bootcamps = bookmarked bootcamps (proxy for "joined")
  // Volunteer hours = check-ins × 2 hrs (realistic avg volunteer event length)
  // Contributions = check-ins + achievements (total activity)
  const volunteerHours = checkInCount * 2;
  const contributions = checkInCount + achievements.length;

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      <ProfileMenuModal
        visible={menuVisible}
        onClose={() => setMenuVisible(false)}
        onLogout={handleLogout}
        onEditProfile={() => navigation.navigate('EditProfile')}
        onBookmarks={() => navigation.navigate('Bookmarks')}
        onMyQR={() => navigation.navigate('MyQR')}
        onAbout={() => navigation.navigate('About')}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} tintColor={Colors.text.white} />
        }
      >
        {/* Purple hero */}
        <LinearGradient
          colors={Colors.gradient.all}
          start={{ x: 0, y: 0 }} end={{ x: 0.6, y: 1 }}
          style={[styles.hero, { paddingTop: insets.top + 12 }]}
        >
          <View style={styles.decorCircle1} />
          <View style={styles.decorCircle2} />

          {/* Top bar with menu icon */}
          <View style={styles.topBar}>
            <TouchableOpacity
              onPress={() => setMenuVisible(true)}
              style={styles.menuButton}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="ellipsis-horizontal" size={22} color={Colors.text.white} />
            </TouchableOpacity>
            <View style={{ width: 36 }} />
          </View>

          {/* Avatar */}
          <View style={styles.avatar}>
            {user.avatarUri ? (
              <Image
                source={{ uri: user.avatarUri }}
                style={{ width: '100%', height: '100%', borderRadius: 1000 }}
              />
            ) : (
              <Text style={styles.avatarInitials}>{initials}</Text>
            )}
          </View>

          <Text style={styles.name}>{user.fullName}</Text>
          <Text style={styles.subtitle}>
            {user.major}{user.university ? ` — ${user.university}` : ''}
          </Text>

          {/* Level pill */}
          <View style={styles.levelPill}>
            <Ionicons name="star" size={14} color={Colors.xp.gold} />
            <Text style={styles.levelPillText}>
              {Strings.profile.xpLevel} {currentLevel}{rankTitle ? ` — ${rankTitle}` : ''}
            </Text>
          </View>
        </LinearGradient>

        {/* Stats strip (overlaps hero) */}
        <View style={styles.statsStrip}>
          {[
            { value: bootcampCount, label: Strings.profile.stats.bootcamps },
            { value: `${volunteerHours}${Strings.profile.stats.volunteerUnit}`, label: Strings.profile.stats.volunteerHours },
            { value: contributions, label: Strings.profile.stats.contributions },
          ].map((stat, i) => (
            <View key={i} style={[styles.statCard, i < 2 && styles.statCardBorder]}>
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </View>
          ))}
        </View>

        <View style={styles.content}>
          {/* XP Progress Card */}
          <View style={styles.xpCard}>
            <View style={styles.xpHeader}>
              <View style={styles.xpTotalRow}>
                <Text style={styles.xpTotal}>{user.xp}</Text>
                <Ionicons name="star" size={16} color={Colors.xp.gold} />
              </View>
              <Text style={styles.xpCardTitle}>{Strings.profile.xpProgress}</Text>
            </View>
            <View style={styles.xpBarTrack}>
              <LinearGradient
                colors={[Colors.primary.purple, Colors.xp.gold]}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                style={[styles.xpBarFill, { width: `${Math.min(progress * 100, 100)}%` }]}
              />
            </View>
            <View style={styles.xpFooterRow}>
              <Text style={styles.xpFooterText}>
                {Strings.profile.xpLevel} {Math.min(currentLevel + 1, 8)}
              </Text>
              <Text style={styles.xpFooterTextCenter}>
                {xpToNext > 0
                  ? `${xpToNext} نقطة للمستوى ${Math.min(currentLevel + 1, 8)}`
                  : 'وصلت للمستوى الأعلى!'}
              </Text>
              <Text style={styles.xpFooterText}>
                {Strings.profile.xpLevel} {currentLevel}
              </Text>
            </View>
          </View>

          {/* Achievements */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionActionText}>{Strings.profile.addNew}</Text>
            <Text style={styles.sectionTitle}>{Strings.profile.achievements}</Text>
          </View>

          {achievements.length === 0 ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyText}>{Strings.profile.noAchievements}</Text>
              <Text style={styles.emptyHint}>{Strings.profile.noAchievementsHint}</Text>
            </View>
          ) : (
            achievements.slice(0, MAX_ACHIEVEMENTS_SHOWN).map((ach) => (
              <View key={ach.id} style={styles.rowCard}>
                <View style={styles.xpReward}>
                  <Text style={styles.xpRewardText}>+50</Text>
                  <Ionicons name="star" size={10} color={Colors.xp.gold} />
                </View>
                <View style={styles.rowText}>
                  <Text style={styles.rowTitle} numberOfLines={1}>{ach.title}</Text>
                  <Text style={styles.rowSubtitle} numberOfLines={1}>{ach.description}</Text>
                </View>
                <View style={styles.rowIconCircle}>
                  <Ionicons name={ach.badgeIcon as any} size={20} color={Colors.primary.purple} />
                </View>
              </View>
            ))
          )}

          {/* Contributions */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionActionText}>+ إضافة جديد</Text>
            <Text style={styles.sectionTitle}>{Strings.profile.contributions}</Text>
          </View>

          {checkIns.length === 0 ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyText}>{Strings.profile.noContributions}</Text>
              <Text style={styles.emptyHint}>{Strings.profile.noContributionsHint}</Text>
            </View>
          ) : (
            checkIns.slice(0, MAX_CONTRIBUTIONS_SHOWN).map((scan) => (
              <View key={scan.id} style={styles.rowCard}>
                <View style={styles.rowActions}>
                  <TouchableOpacity hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                    <Ionicons name="trash-outline" size={15} color={Colors.text.muted} />
                  </TouchableOpacity>
                  <TouchableOpacity hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                    <Ionicons name="create-outline" size={15} color={Colors.text.muted} />
                  </TouchableOpacity>
                </View>
                <View style={styles.rowText}>
                  <Text style={styles.rowTitle} numberOfLines={1}>{scan.eventName}</Text>
                  <Text style={styles.rowSubtitle} numberOfLines={1}>
                    تطوع · {new Date(scan.scannedAt).toLocaleDateString('ar-SA', { month: 'long', year: 'numeric' })}
                  </Text>
                </View>
                <View style={styles.rowIconCircle}>
                  <Ionicons name="qr-code" size={18} color={Colors.primary.teal2} />
                </View>
              </View>
            ))
          )}

          {/* Skill Paths — inline */}
          <View style={styles.sectionHeader}>
            <TouchableOpacity
              onPress={() => navigation.navigate('SkillPathList')}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Text style={styles.sectionActionText}>{Strings.profile.explore}</Text>
            </TouchableOpacity>
            <Text style={styles.sectionTitle}>
              {Strings.profile.paths} ({careerTracks.length})
            </Text>
          </View>

          {careerTracks.slice(0, MAX_TRACKS_SHOWN).map((track) => (
            <SkillTrackCard
              key={track.id}
              track={track}
              completed={skillCounts[track.id] ?? 0}
              unlocked={unlockStates[track.id] ?? false}
              onPress={() => navigation.navigate('SkillPathDetail', { trackId: track.id })}
            />
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background.app },

  // Hero
  hero: {
    paddingHorizontal: 20,
    paddingBottom: 80,
    alignItems: 'center',
    overflow: 'hidden',
  },
  decorCircle1: {
    position: 'absolute',
    width: 240, height: 240, borderRadius: 120,
    backgroundColor: 'rgba(255,255,255,0.08)',
    top: -70, right: -60,
  },
  decorCircle2: {
    position: 'absolute',
    width: 180, height: 180, borderRadius: 90,
    backgroundColor: 'rgba(255,255,255,0.05)',
    bottom: 40, left: -50,
  },
  topBar: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    width: '100%', marginBottom: 8,
  },
  menuButton: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center', justifyContent: 'center',
  },
  avatar: {
    width: 84, height: 84, borderRadius: 42,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: 'rgba(255,255,255,0.4)',
    marginBottom: 10, overflow: 'hidden',
  },
  avatarInitials: {
    fontFamily: Typography.fontFamily.bold,
    fontSize: Typography.fontSize['3xl'],
    color: Colors.text.white,
  },
  name: {
    fontFamily: Typography.fontFamily.bold,
    fontSize: Typography.fontSize.xl,
    color: Colors.text.white,
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.fontSize.sm,
    color: 'rgba(255,255,255,0.85)',
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 12,
  },
  levelPill: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: 'rgba(255,255,255,0.18)',
    paddingVertical: 7, paddingHorizontal: 14,
    borderRadius: 18,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.22)',
  },
  levelPillText: {
    fontFamily: Typography.fontFamily.semiBold,
    fontSize: Typography.fontSize.sm,
    color: Colors.text.white,
  },

  // Stats strip (overlapping hero)
  statsStrip: {
    flexDirection: 'row',
    backgroundColor: Colors.background.card,
    marginHorizontal: 20, marginTop: -48,
    borderRadius: 18,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 12,
    elevation: 4,
  },
  statCard: { flex: 1, paddingVertical: 18, alignItems: 'center' },
  statCardBorder: {
    borderLeftWidth: 1, borderLeftColor: Colors.ui.divider,
  },
  statValue: {
    fontFamily: Typography.fontFamily.bold,
    fontSize: Typography.fontSize['2xl'],
    color: Colors.text.primary,
  },
  statLabel: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.fontSize.xs,
    color: Colors.text.secondary,
    marginTop: 2,
  },

  // Content
  content: {
    paddingHorizontal: 20, paddingTop: 20,
  },

  // XP Card
  xpCard: {
    backgroundColor: Colors.background.card,
    borderRadius: 16, padding: 14,
    marginBottom: 22,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 6,
    elevation: 2,
  },
  xpHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: 10,
  },
  xpTotalRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  xpTotal: {
    fontFamily: Typography.fontFamily.bold,
    fontSize: Typography.fontSize.lg,
    color: Colors.text.primary,
  },
  xpCardTitle: {
    fontFamily: Typography.fontFamily.semiBold,
    fontSize: Typography.fontSize.base,
    color: Colors.text.primary,
  },
  xpBarTrack: {
    height: 6, backgroundColor: Colors.ui.border, borderRadius: 3,
    overflow: 'hidden', marginBottom: 8,
  },
  xpBarFill: { height: '100%', borderRadius: 3 },
  xpFooterRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
  },
  xpFooterText: {
    fontFamily: Typography.fontFamily.medium,
    fontSize: Typography.fontSize.xs,
    color: Colors.text.secondary,
  },
  xpFooterTextCenter: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: 10,
    color: Colors.text.muted,
    flex: 1,
    textAlign: 'center',
  },

  // Sections
  sectionHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: 10, marginTop: 4,
  },
  sectionTitle: {
    fontFamily: Typography.fontFamily.bold,
    fontSize: Typography.fontSize.lg,
    color: Colors.text.primary,
  },
  sectionActionText: {
    fontFamily: Typography.fontFamily.medium,
    fontSize: Typography.fontSize.sm,
    color: Colors.primary.purple,
  },

  // Empty state
  emptyCard: {
    backgroundColor: Colors.background.card,
    borderRadius: 14, padding: 20,
    marginBottom: 18, alignItems: 'center',
    borderWidth: 1, borderColor: Colors.ui.divider,
    borderStyle: 'dashed',
  },
  emptyText: {
    fontFamily: Typography.fontFamily.semiBold,
    fontSize: Typography.fontSize.sm,
    color: Colors.text.secondary,
  },
  emptyHint: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.fontSize.xs,
    color: Colors.text.muted,
    marginTop: 4, textAlign: 'center',
  },

  // Row card (used for achievements + contributions)
  rowCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.background.card,
    borderRadius: 14, padding: 12, marginBottom: 8, gap: 10,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4,
    elevation: 1,
  },
  xpReward: {
    flexDirection: 'row', alignItems: 'center', gap: 3,
    backgroundColor: Colors.xp.goldLight, borderRadius: 10,
    paddingVertical: 4, paddingHorizontal: 8,
  },
  xpRewardText: {
    fontFamily: Typography.fontFamily.bold,
    fontSize: Typography.fontSize.xs,
    color: Colors.xp.bronze,
  },
  rowActions: {
    flexDirection: 'row', gap: 10,
  },
  rowText: { flex: 1 },
  rowTitle: {
    fontFamily: Typography.fontFamily.semiBold,
    fontSize: Typography.fontSize.sm,
    color: Colors.text.primary, textAlign: 'right',
  },
  rowSubtitle: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.fontSize.xs,
    color: Colors.text.secondary, textAlign: 'right',
    marginTop: 2,
  },
  rowIconCircle: {
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: Colors.opportunity.hackathonLight,
    alignItems: 'center', justifyContent: 'center',
  },
});

export default UserProfileScreen;
