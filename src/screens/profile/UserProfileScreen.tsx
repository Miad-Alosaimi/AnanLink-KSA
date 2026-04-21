import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

import { Colors, Typography, Strings } from '../../constants';
import { ProfileStackParamList, Achievement } from '../../types';
import { useAuth, useUser } from '../../context';
import { getBookmarkCount, getCheckInCount } from '../../database/queries';
import { LoadingSpinner } from '../../components/common';

type Nav = NativeStackNavigationProp<ProfileStackParamList>;

const SETTINGS = [
  { icon: 'bookmark-outline', label: Strings.profile.bookmarks, route: 'Bookmarks' as const },
  { icon: 'bar-chart-outline', label: Strings.profile.skillPaths, route: 'SkillPathList' as const },
  { icon: 'person-outline', label: Strings.profile.editProfile, route: null },
  { icon: 'notifications-outline', label: Strings.profile.notifications, route: null },
  { icon: 'information-circle-outline', label: Strings.profile.about, route: null },
];

const UserProfileScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const insets = useSafeAreaInsets();
  const { logout, userId } = useAuth();
  const { user, isLoading, getUserAchievementsData } = useUser();

  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [bookmarkCount, setBookmarkCount] = useState(0);
  const [checkInCount, setCheckInCount] = useState(0);

  useEffect(() => {
    if (!userId) return;
    Promise.all([
      getUserAchievementsData(),
      getBookmarkCount(userId),
      getCheckInCount(userId),
    ]).then(([ach, bCount, cCount]) => {
      setAchievements(ach);
      setBookmarkCount(bCount);
      setCheckInCount(cCount);
    });
  }, [userId]);

  const handleLogout = () => {
    Alert.alert(Strings.profile.logoutConfirm, '', [
      { text: Strings.profile.logoutNo, style: 'cancel' },
      { text: Strings.profile.logoutYes, style: 'destructive', onPress: logout },
    ]);
  };

  if (isLoading || !user) return <LoadingSpinner />;

  const levelProgress = (user.xp % 100) / 100;
  const xpToNext = user.level * 100 - user.xp;

  const initials = [user.firstName[0], user.lastName[0]].join('');

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Gradient header */}
        <LinearGradient
          colors={[Colors.gradient.start, Colors.gradient.end]}
          style={[styles.header, { paddingTop: insets.top + 16 }]}
        >
          <View style={styles.decorCircle} />
          <Text style={styles.headerTitle}>{Strings.profile.title}</Text>
        </LinearGradient>

        {/* Avatar overlapping header */}
        <View style={styles.avatarSection}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarInitials}>{initials}</Text>
          </View>
        </View>

        <View style={styles.content}>
          <Text style={styles.userName}>{user.fullName}</Text>
          <Text style={styles.userUni}>{user.university}</Text>

          {/* Level badge */}
          <LinearGradient
            colors={[Colors.gradient.start, Colors.gradient.end]}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
            style={styles.levelBadge}
          >
            <Ionicons name="star" size={14} color={Colors.text.white} />
            <Text style={styles.levelBadgeText}>{Strings.home.level} {user.level}</Text>
          </LinearGradient>

          {/* XP Card */}
          <View style={styles.xpCard}>
            <View style={styles.xpHeader}>
              <Text style={styles.xpLevel}>{Strings.home.level} {user.level}</Text>
              <Text style={styles.xpPoints}>{user.xp} XP</Text>
            </View>
            <View style={styles.xpBarTrack}>
              <LinearGradient
                colors={[Colors.gradient.start, Colors.gradient.end]}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                style={[styles.xpBarFill, { width: `${Math.min(levelProgress * 100, 100)}%` }]}
              />
            </View>
            <Text style={styles.xpSub}>{xpToNext} {Strings.home.xpProgress}</Text>
          </View>

          {/* Stats */}
          <View style={styles.statsRow}>
            {[
              { label: Strings.profile.bookmarks, value: bookmarkCount },
              { label: 'تسجيل حضور', value: checkInCount },
              { label: Strings.home.stats.points, value: user.xp },
            ].map((s, i) => (
              <View key={i} style={styles.statItem}>
                <Text style={styles.statValue}>{s.value}</Text>
                <Text style={styles.statLabel}>{s.label}</Text>
              </View>
            ))}
          </View>

          {/* Achievements */}
          {achievements.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{Strings.profile.achievements}</Text>
              <View style={styles.achievementsGrid}>
                {achievements.map((ach) => (
                  <View key={ach.id} style={styles.achievementItem}>
                    <View style={styles.achievementBadge}>
                      <Ionicons name={ach.badgeIcon as any} size={24} color={Colors.primary.purple} />
                    </View>
                    <Text style={styles.achievementTitle} numberOfLines={2}>{ach.title}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Settings */}
          <View style={styles.settingsCard}>
            {SETTINGS.map((item, i) => (
              <TouchableOpacity
                key={i}
                style={[styles.settingsItem, i < SETTINGS.length - 1 && styles.settingsBorder]}
                onPress={() => item.route && navigation.navigate(item.route)}
                activeOpacity={0.7}
              >
                <Ionicons name="chevron-back" size={18} color={Colors.text.secondary} />
                <Text style={styles.settingsLabel}>{item.label}</Text>
                <View style={styles.settingsIcon}>
                  <Ionicons name={item.icon as any} size={20} color={Colors.primary.purple} />
                </View>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
            <Ionicons name="log-out-outline" size={20} color={Colors.status.error} />
            <Text style={styles.logoutText}>{Strings.profile.logout}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background.app },
  header: { paddingHorizontal: 20, paddingBottom: 60, alignItems: 'center', overflow: 'hidden' },
  decorCircle: {
    position: 'absolute', width: 250, height: 250, borderRadius: 125,
    backgroundColor: 'rgba(255,255,255,0.06)', top: -80, right: -60,
  },
  headerTitle: { fontFamily: Typography.fontFamily.bold, fontSize: Typography.fontSize['2xl'], color: Colors.text.white },
  avatarSection: { alignItems: 'center', marginTop: -48 },
  avatarCircle: {
    width: 96, height: 96, borderRadius: 48,
    backgroundColor: Colors.primary.purple, alignItems: 'center', justifyContent: 'center',
    borderWidth: 4, borderColor: Colors.background.card,
    shadowColor: Colors.primary.purple, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 8,
  },
  avatarInitials: { fontFamily: Typography.fontFamily.bold, fontSize: Typography.fontSize['2xl'], color: Colors.text.white },
  content: { paddingHorizontal: 20, paddingBottom: 32, alignItems: 'center' },
  userName: { fontFamily: Typography.fontFamily.bold, fontSize: Typography.fontSize.xl, color: Colors.text.primary, marginTop: 12, textAlign: 'center' },
  userUni: { fontFamily: Typography.fontFamily.regular, fontSize: Typography.fontSize.sm, color: Colors.text.secondary, marginBottom: 16 },
  xpCard: { backgroundColor: Colors.background.card, borderRadius: 16, padding: 16, width: '100%', marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 },
  xpHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  xpLevel: { fontFamily: Typography.fontFamily.semiBold, fontSize: Typography.fontSize.base, color: Colors.text.primary },
  xpPoints: { fontFamily: Typography.fontFamily.semiBold, fontSize: Typography.fontSize.base, color: Colors.primary.purple },
  xpBarTrack: { height: 8, backgroundColor: Colors.ui.border, borderRadius: 4, overflow: 'hidden', marginBottom: 6 },
  xpBarFill: { height: '100%', borderRadius: 4 },
  xpSub: { fontFamily: Typography.fontFamily.regular, fontSize: Typography.fontSize.xs, color: Colors.text.secondary, textAlign: 'right' },
  statsRow: { flexDirection: 'row', backgroundColor: Colors.background.card, borderRadius: 16, paddingVertical: 16, width: '100%', marginBottom: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 },
  statItem: { flex: 1, alignItems: 'center', borderRightWidth: 1, borderRightColor: Colors.ui.divider },
  statValue: { fontFamily: Typography.fontFamily.bold, fontSize: Typography.fontSize.xl, color: Colors.primary.purple },
  statLabel: { fontFamily: Typography.fontFamily.regular, fontSize: Typography.fontSize.xs, color: Colors.text.secondary, marginTop: 2 },
  section: { width: '100%', marginBottom: 20 },
  sectionTitle: { fontFamily: Typography.fontFamily.bold, fontSize: Typography.fontSize.lg, color: Colors.text.primary, textAlign: 'right', marginBottom: 12 },
  achievementsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  achievementItem: { width: '30%', alignItems: 'center', gap: 6 },
  achievementBadge: { width: 56, height: 56, borderRadius: 28, backgroundColor: Colors.opportunity.hackathonLight, alignItems: 'center', justifyContent: 'center' },
  achievementTitle: { fontFamily: Typography.fontFamily.regular, fontSize: Typography.fontSize.xs, color: Colors.text.secondary, textAlign: 'center' },
  settingsCard: { backgroundColor: Colors.background.card, borderRadius: 16, width: '100%', marginBottom: 16, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 },
  settingsItem: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 15, gap: 10 },
  settingsBorder: { borderBottomWidth: 1, borderBottomColor: Colors.ui.divider },
  settingsIcon: { width: 36, height: 36, borderRadius: 10, backgroundColor: Colors.opportunity.hackathonLight, alignItems: 'center', justifyContent: 'center' },
  settingsLabel: { flex: 1, fontFamily: Typography.fontFamily.medium, fontSize: Typography.fontSize.base, color: Colors.text.primary, textAlign: 'right' },
  levelBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingVertical: 6, paddingHorizontal: 16, borderRadius: 20, marginBottom: 16,
  },
  levelBadgeText: {
    fontFamily: Typography.fontFamily.semiBold, fontSize: Typography.fontSize.sm, color: Colors.text.white,
  },
  logoutButton: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 12, paddingHorizontal: 20 },
  logoutText: { fontFamily: Typography.fontFamily.semiBold, fontSize: Typography.fontSize.base, color: Colors.status.error },
});

export default UserProfileScreen;
