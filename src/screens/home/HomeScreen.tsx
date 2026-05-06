import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  RefreshControl,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

import { Colors, Typography, Strings } from '../../constants';
import { HomeStackParamList, OpportunityType, Opportunity } from '../../types';
import { OpportunityCard } from '../../components/opportunity';
import { ActiveEventBanner } from '../../components/home/ActiveEventBanner';
import { useUser } from '../../context';
import {
  getRecentOpportunities,
  getOpportunityCountByType,
  getOpportunities,
  getBookmarkCount,
  getCheckInCount,
} from '../../database/queries';
import { useAuth } from '../../context';
import { levelProgress, xpToNextLevel, xpAtNextLevel, getLevel } from '../../utils/levelCalc';

type Nav = NativeStackNavigationProp<HomeStackParamList>;

const CATEGORIES = [
  { type: 'bootcamp' as OpportunityType, label: Strings.home.categories.bootcamp, icon: 'rocket', color: Colors.opportunity.hackathon },
  { type: 'internship' as OpportunityType, label: Strings.home.categories.internship, icon: 'briefcase', color: Colors.opportunity.internship },
  { type: 'opensource' as OpportunityType, label: Strings.home.categories.opensource, icon: 'code-slash', color: Colors.opportunity.opensource },
  { type: 'volunteer' as OpportunityType, label: Strings.home.categories.volunteer, icon: 'heart', color: Colors.opportunity.volunteer },
];

const HomeScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const insets = useSafeAreaInsets();
  const { user, refreshUser } = useUser();
  const { userId } = useAuth();

  const [recentOpps, setRecentOpps] = useState<Opportunity[]>([]);
  const [counts, setCounts] = useState<Record<OpportunityType, number>>({
    bootcamp: 0, internship: 0, opensource: 0, volunteer: 0,
  });
  const [activeVolunteerEvent, setActiveVolunteerEvent] = useState<Opportunity | null>(null);
  const [bookmarkCount, setBookmarkCount] = useState(0);
  const [checkInCount, setCheckInCount] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    const [recent, countMap, volunteers, bmCount, scanCount] = await Promise.all([
      getRecentOpportunities(6),
      getOpportunityCountByType(),
      getOpportunities('volunteer', 5),
      userId ? getBookmarkCount(userId) : Promise.resolve(0),
      userId ? getCheckInCount(userId) : Promise.resolve(0),
    ]);
    setRecentOpps(recent);
    setCounts(countMap);
    setBookmarkCount(bmCount);
    setCheckInCount(scanCount);

    // Find the "most imminent" upcoming volunteer event for the banner
    const now = new Date();
    const upcoming = volunteers
      .filter(v => v.deadline && new Date(v.deadline) >= now)
      .sort((a, b) => new Date(a.deadline!).getTime() - new Date(b.deadline!).getTime());
    setActiveVolunteerEvent(upcoming[0] ?? null);
  }, [userId]);

  useEffect(() => { loadData(); }, [loadData]);

  // Reload when screen regains focus (e.g. after scanning QR or bookmarking)
  useFocusEffect(
    useCallback(() => {
      loadData();
      if (userId) refreshUser();
    }, [loadData, userId, refreshUser])
  );

  const onRefresh = async () => {
    setIsRefreshing(true);
    await loadData();
    if (userId) await refreshUser();
    setIsRefreshing(false);
  };

  const xp = user?.xp ?? 0;
  const level = user ? getLevel(user.xp) : 1;
  const progress = levelProgress(xp);
  const toNext = xpToNextLevel(xp);
  const nextThreshold = xpAtNextLevel(xp);

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} tintColor={Colors.primary.purple} />
        }
      >
        {/* Gradient Header */}
        <LinearGradient
          colors={Colors.gradient.all}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
          style={[styles.header, { paddingTop: insets.top + 16 }]}
        >
          <View style={styles.decorCircle} />
          <View style={styles.headerRow}>
            <TouchableOpacity
              onPress={() => navigation.navigate('HomeMap')}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="map-outline" size={24} color={Colors.text.white} />
            </TouchableOpacity>
            <View style={styles.headerTitles}>
              <Text style={styles.greeting}>
                {Strings.home.greeting} {user?.firstName ?? ''}
              </Text>
              <Text style={styles.subGreeting}>اكتشف الفرص المتاحة</Text>
            </View>
            <View style={styles.levelBadge}>
              <Text style={styles.levelBadgeText}>⭐ {Strings.home.level} {level}</Text>
            </View>
          </View>

          {/* XP Progress Card */}
          <View style={styles.xpCard}>
            <View style={styles.xpCardRow}>
              <View style={styles.xpLevelCircle}>
                <Text style={styles.xpLevelNum}>{level}</Text>
                <Text style={styles.xpLevelLabel}>{Strings.home.level}</Text>
              </View>
              <View style={styles.xpBarSection}>
                <Text style={styles.xpBarLabel}>
                  {xp} / {nextThreshold || xp} XP
                </Text>
                <View style={styles.xpBarTrack}>
                  <LinearGradient
                    colors={Colors.gradient.all}
                    start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                    style={[styles.xpBarFill, { width: `${Math.min(progress * 100, 100)}%` }]}
                  />
                </View>
                <Text style={styles.xpBarSub}>
                  {toNext > 0 ? `${toNext} ${Strings.home.xpProgress}` : 'وصلت للمستوى الأعلى!'}
                </Text>
              </View>
            </View>
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{bookmarkCount}</Text>
                <Text style={styles.statLabel}>محفوظات</Text>
              </View>
              <View style={[styles.statItem, styles.statItemBordered]}>
                <Text style={styles.statValue}>{checkInCount}</Text>
                <Text style={styles.statLabel}>تسجيل حضور</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{xp}</Text>
                <Text style={styles.statLabel}>{Strings.home.stats.points}</Text>
              </View>
            </View>
          </View>
        </LinearGradient>

        <View style={styles.content}>
          {/* Active Event Banner */}
          {activeVolunteerEvent && (
            <ActiveEventBanner
              event={activeVolunteerEvent}
              onPress={() =>
                navigation.navigate('OpportunityDetail', {
                  opportunityId: activeVolunteerEvent.id,
                  type: activeVolunteerEvent.type,
                })
              }
            />
          )}

          {/* Categories Grid */}
          <View style={styles.grid}>
            {CATEGORIES.map((cat) => (
              <TouchableOpacity
                key={cat.type}
                style={styles.categoryCard}
                activeOpacity={0.85}
                onPress={() => {
                  navigation.getParent()?.navigate('OpportunitiesTab' as any, { type: cat.type });
                }}
              >
                <LinearGradient
                  colors={[cat.color, cat.color + 'CC']}
                  start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                  style={styles.categoryGradient}
                >
                  <Ionicons name={cat.icon as any} size={28} color={Colors.text.white} />
                  <Text style={styles.categoryLabel}>{cat.label}</Text>
                  <Text style={styles.categoryCount}>{counts[cat.type]} {Strings.home.available}</Text>
                </LinearGradient>
              </TouchableOpacity>
            ))}
          </View>

          {/* Skill Path Quick Access */}
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => navigation.getParent()?.navigate('ProfileTab' as any, { screen: 'SkillPathList' })}
          >
            <LinearGradient
              colors={Colors.gradient.tealAll}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
              style={styles.skillPathCard}
            >
              <View style={styles.skillPathTextWrap}>
                <Text style={styles.skillPathTitle}>مسار المهارات</Text>
                <Text style={styles.skillPathSub}>طوّر مهاراتك خطوة بخطوة</Text>
              </View>
              <View style={styles.skillPathIconWrap}>
                <Ionicons name="bar-chart" size={28} color={Colors.text.white} />
              </View>
            </LinearGradient>
          </TouchableOpacity>

          {/* Recent Opportunities — horizontal scroll */}
          <View style={styles.sectionHeader}>
            <TouchableOpacity
              onPress={() => navigation.getParent()?.navigate('OpportunitiesTab' as any)}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Text style={styles.viewAll}>{Strings.home.viewAll}</Text>
            </TouchableOpacity>
            <Text style={styles.sectionTitle}>{Strings.home.recentOpportunities}</Text>
          </View>

          {recentOpps.length > 0 ? (
            <FlatList
              data={recentOpps}
              keyExtractor={(item) => String(item.id)}
              renderItem={({ item }) => (
                <OpportunityCard
                  opportunity={item}
                  onPress={() => navigation.navigate('OpportunityDetail', { opportunityId: item.id, type: item.type })}
                  compact
                />
              )}
              horizontal
              inverted
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalList}
              style={styles.horizontalScroller}
            />
          ) : null}

          {/* Map Preview */}
          <View style={styles.sectionHeader}>
            <TouchableOpacity
              onPress={() => navigation.navigate('HomeMap')}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Text style={styles.viewAll}>{Strings.home.openMap}</Text>
            </TouchableOpacity>
            <Text style={styles.sectionTitle}>{Strings.home.nearbyEvents}</Text>
          </View>

          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => navigation.navigate('HomeMap')}
            style={styles.mapPreviewCard}
          >
            <LinearGradient
              colors={Colors.gradient.tealAll}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
              style={styles.mapPreviewGradient}
            >
              {/* Decorative scattered dots to suggest a map */}
              <View style={[styles.mapDot, styles.mapDot1]} />
              <View style={[styles.mapDot, styles.mapDot2]} />
              <View style={[styles.mapDot, styles.mapDot3]} />

              {/* Floating pill markers */}
              <View style={[styles.mapPill, styles.mapPill1]}>
                <Text style={styles.mapPillText}>هاكاثون</Text>
              </View>
              <View style={[styles.mapPill, styles.mapPill2]}>
                <Text style={styles.mapPillText}>ورشة عمل</Text>
              </View>
              <View style={[styles.mapPill, styles.mapPill3]}>
                <Text style={styles.mapPillText}>تطوع</Text>
              </View>
            </LinearGradient>

            <View style={styles.mapPreviewFooter}>
              <Ionicons name="chevron-back" size={16} color={Colors.primary.purple} />
              <View style={{ flex: 1 }}>
                <Text style={styles.mapPreviewTitle}>
                  {counts.bootcamp + counts.volunteer} فعالية قريبة منك
                </Text>
                <Text style={styles.mapPreviewSub}>افتح الخريطة لاستكشاف كل الفرص</Text>
              </View>
              <View style={styles.mapPreviewIcon}>
                <Ionicons name="map" size={20} color={Colors.primary.teal2} />
              </View>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background.app },
  header: { paddingHorizontal: 20, paddingBottom: 32, overflow: 'hidden' },
  decorCircle: {
    position: 'absolute', width: 300, height: 300, borderRadius: 150,
    backgroundColor: 'rgba(255,255,255,0.07)', top: -80, right: -60,
  },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 },
  headerTitles: { flex: 1, alignItems: 'center' },
  greeting: {
    fontFamily: Typography.fontFamily.bold, fontSize: Typography.fontSize.lg,
    color: Colors.text.white, textAlign: 'center',
  },
  subGreeting: {
    fontFamily: Typography.fontFamily.regular, fontSize: Typography.fontSize.sm,
    color: 'rgba(255,255,255,0.8)', textAlign: 'center',
  },
  levelBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)', paddingVertical: 5, paddingHorizontal: 10,
    borderRadius: 20,
  },
  levelBadgeText: {
    fontFamily: Typography.fontFamily.medium, fontSize: Typography.fontSize.xs,
    color: Colors.text.white,
  },
  xpCard: {
    backgroundColor: 'rgba(255,255,255,0.96)', borderRadius: 20, padding: 16,
  },
  xpCardRow: { flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 12 },
  xpLevelCircle: {
    width: 60, height: 60, borderRadius: 30,
    backgroundColor: Colors.opportunity.hackathonLight,
    alignItems: 'center', justifyContent: 'center',
  },
  xpLevelNum: {
    fontFamily: Typography.fontFamily.bold, fontSize: Typography.fontSize['2xl'],
    color: Colors.primary.purple, lineHeight: 28,
  },
  xpLevelLabel: {
    fontFamily: Typography.fontFamily.regular, fontSize: 10,
    color: Colors.text.secondary, marginTop: -2,
  },
  xpBarSection: { flex: 1 },
  xpBarLabel: {
    fontFamily: Typography.fontFamily.semiBold, fontSize: Typography.fontSize.sm,
    color: Colors.text.primary, textAlign: 'right', marginBottom: 6,
  },
  xpBarTrack: {
    height: 8, backgroundColor: Colors.ui.border, borderRadius: 4, overflow: 'hidden',
  },
  xpBarFill: { height: '100%', borderRadius: 4 },
  xpBarSub: {
    fontFamily: Typography.fontFamily.regular, fontSize: Typography.fontSize.xs,
    color: Colors.text.secondary, textAlign: 'right', marginTop: 4,
  },
  statsRow: {
    flexDirection: 'row', justifyContent: 'space-around',
    paddingTop: 12, borderTopWidth: 1, borderTopColor: Colors.ui.divider,
  },
  statItem: { flex: 1, alignItems: 'center' },
  statItemBordered: {
    borderLeftWidth: 1, borderRightWidth: 1, borderColor: Colors.ui.divider,
  },
  statValue: {
    fontFamily: Typography.fontFamily.bold, fontSize: Typography.fontSize.lg,
    color: Colors.primary.purple,
  },
  statLabel: {
    fontFamily: Typography.fontFamily.regular, fontSize: Typography.fontSize.xs,
    color: Colors.text.secondary, marginTop: 2,
  },
  content: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 32 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 16 },
  categoryCard: { width: '47.5%', borderRadius: 16, overflow: 'hidden' },
  categoryGradient: { padding: 16, gap: 6, minHeight: 104 },
  categoryLabel: { fontFamily: Typography.fontFamily.semiBold, fontSize: Typography.fontSize.base, color: Colors.text.white },
  categoryCount: { fontFamily: Typography.fontFamily.regular, fontSize: Typography.fontSize.xs, color: 'rgba(255,255,255,0.9)' },
  skillPathCard: {
    borderRadius: 16, padding: 16, flexDirection: 'row',
    alignItems: 'center', justifyContent: 'space-between',
    marginBottom: 20,
  },
  skillPathTextWrap: { flex: 1 },
  skillPathTitle: { fontFamily: Typography.fontFamily.bold, fontSize: Typography.fontSize.lg, color: Colors.text.white, textAlign: 'right' },
  skillPathSub: { fontFamily: Typography.fontFamily.regular, fontSize: Typography.fontSize.sm, color: 'rgba(255,255,255,0.88)', textAlign: 'right', marginTop: 2 },
  skillPathIconWrap: {
    width: 48, height: 48, borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center', justifyContent: 'center',
  },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, marginTop: 8 },
  sectionTitle: { fontFamily: Typography.fontFamily.bold, fontSize: Typography.fontSize.lg, color: Colors.text.primary },
  viewAll: { fontFamily: Typography.fontFamily.medium, fontSize: Typography.fontSize.sm, color: Colors.primary.purple },

  // Horizontal scroll list
  horizontalScroller: { marginHorizontal: -20, marginBottom: 16 },
  horizontalList: { paddingHorizontal: 20, gap: 0 },

  // Map preview card
  mapPreviewCard: {
    borderRadius: 18, overflow: 'hidden', marginBottom: 8,
    backgroundColor: Colors.background.card,
    shadowColor: Colors.primary.teal2,
    shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 12,
    elevation: 4,
  },
  mapPreviewGradient: {
    height: 140, padding: 16, position: 'relative', overflow: 'hidden',
  },
  mapDot: {
    position: 'absolute', width: 8, height: 8, borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.7)',
  },
  mapDot1: { top: 24, left: '25%' },
  mapDot2: { top: '60%', left: '55%' },
  mapDot3: { top: '35%', left: '75%' },
  mapPill: {
    position: 'absolute',
    backgroundColor: Colors.text.primary,
    paddingVertical: 5, paddingHorizontal: 10, borderRadius: 12,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 4,
    elevation: 3,
  },
  mapPillText: { fontFamily: Typography.fontFamily.semiBold, fontSize: 11, color: Colors.text.white },
  mapPill1: { top: 18, right: '10%' },
  mapPill2: { top: '40%', left: '8%' },
  mapPill3: { bottom: 18, right: '38%' },
  mapPreviewFooter: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    padding: 14,
  },
  mapPreviewTitle: {
    fontFamily: Typography.fontFamily.semiBold, fontSize: Typography.fontSize.base,
    color: Colors.text.primary, textAlign: 'right',
  },
  mapPreviewSub: {
    fontFamily: Typography.fontFamily.regular, fontSize: Typography.fontSize.xs,
    color: Colors.text.secondary, textAlign: 'right', marginTop: 2,
  },
  mapPreviewIcon: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: Colors.opportunity.opensourceLight,
    alignItems: 'center', justifyContent: 'center',
  },
});

export default HomeScreen;
