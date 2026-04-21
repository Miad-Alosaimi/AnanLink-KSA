import React, { useEffect, useState } from 'react';
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
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

import { Colors, Typography, Strings } from '../../constants';
import { HomeStackParamList, OpportunityType, Opportunity } from '../../types';
import { OpportunityCard } from '../../components/opportunity';
import { useUser } from '../../context';
import { getRecentOpportunities, getOpportunityCountByType } from '../../database/queries';

type Nav = NativeStackNavigationProp<HomeStackParamList>;

const CATEGORIES = [
  { type: 'hackathon' as OpportunityType, label: Strings.home.categories.hackathon, icon: 'rocket', color: Colors.opportunity.hackathon, bgColor: Colors.opportunity.hackathonLight },
  { type: 'internship' as OpportunityType, label: Strings.home.categories.internship, icon: 'briefcase', color: Colors.opportunity.internship, bgColor: Colors.opportunity.internshipLight },
  { type: 'opensource' as OpportunityType, label: Strings.home.categories.opensource, icon: 'code-slash', color: Colors.opportunity.opensource, bgColor: Colors.opportunity.opensourceLight },
  { type: 'volunteer' as OpportunityType, label: Strings.home.categories.volunteer, icon: 'heart', color: Colors.opportunity.volunteer, bgColor: Colors.opportunity.volunteerLight },
];

const HomeScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const insets = useSafeAreaInsets();
  const { user } = useUser();

  const [recentOpps, setRecentOpps] = useState<Opportunity[]>([]);
  const [counts, setCounts] = useState<Record<OpportunityType, number>>({ hackathon: 0, internship: 0, opensource: 0, volunteer: 0 });
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadData = async () => {
    const [recent, countMap] = await Promise.all([
      getRecentOpportunities(6),
      getOpportunityCountByType(),
    ]);
    setRecentOpps(recent);
    setCounts(countMap);
  };

  useEffect(() => { loadData(); }, []);

  const onRefresh = async () => {
    setIsRefreshing(true);
    await loadData();
    setIsRefreshing(false);
  };

  const xpToNextLevel = ((user?.level ?? 1) * 100) - (user?.xp ?? 0);
  const levelProgress = user ? (user.xp % 100) / 100 : 0;

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} tintColor={Colors.primary.purple} />}
      >
        {/* Gradient Header */}
        <LinearGradient
          colors={[Colors.gradient.start, Colors.gradient.end]}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
          style={[styles.header, { paddingTop: insets.top + 16 }]}
        >
          <View style={styles.decorCircle} />
          <View style={styles.headerRow}>
            <TouchableOpacity onPress={() => navigation.navigate('HomeMap')}>
              <Ionicons name="map-outline" size={24} color={Colors.text.white} />
            </TouchableOpacity>
            <View style={styles.headerTitles}>
              <Text style={styles.greeting}>{Strings.home.greeting} {user?.firstName ?? ''}</Text>
              <Text style={styles.subGreeting}>اكتشف الفرص المتاحة</Text>
            </View>
            <View style={styles.levelBadge}>
              <Text style={styles.levelBadgeText}>⭐ {Strings.home.level} {user?.level ?? 1}</Text>
            </View>
          </View>

          {/* XP Progress Card */}
          <View style={styles.xpCard}>
            <View style={styles.xpCardRow}>
              <View style={styles.xpLevelCircle}>
                <Text style={styles.xpLevelNum}>{user?.level ?? 1}</Text>
                <Text style={styles.xpLevelLabel}>{Strings.home.level}</Text>
              </View>
              <View style={styles.xpBarSection}>
                <Text style={styles.xpBarLabel}>
                  {user?.xp ?? 0} / {(user?.level ?? 1) * 100} XP
                </Text>
                <View style={styles.xpBarTrack}>
                  <LinearGradient
                    colors={[Colors.gradient.start, Colors.gradient.end]}
                    start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                    style={[styles.xpBarFill, { width: `${Math.min(levelProgress * 100, 100)}%` }]}
                  />
                </View>
                <Text style={styles.xpBarSub}>{xpToNextLevel > 0 ? `${xpToNextLevel} ${Strings.home.xpProgress}` : 'وصلت للمستوى الأعلى!'}</Text>
              </View>
            </View>
            <View style={styles.statsRow}>
              {[
                { label: Strings.home.stats.applications, value: '0' },
                { label: Strings.home.stats.hackathons, value: '0' },
                { label: Strings.home.stats.points, value: String(user?.xp ?? 0) },
              ].map((stat, i) => (
                <View key={i} style={styles.statItem}>
                  <Text style={styles.statValue}>{stat.value}</Text>
                  <Text style={styles.statLabel}>{stat.label}</Text>
                </View>
              ))}
            </View>
          </View>
        </LinearGradient>

        <View style={styles.content}>
          {/* Categories Grid */}
          <View style={styles.grid}>
            {CATEGORIES.map((cat) => (
              <TouchableOpacity
                key={cat.type}
                style={styles.categoryCard}
                activeOpacity={0.85}
                onPress={() => {
                  navigation.getParent()?.navigate('OpportunitiesTab', { type: cat.type });
                }}
              >
                <LinearGradient
                  colors={[cat.color + 'DD', cat.color]}
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

          {/* Upcoming Opportunities — horizontal scroll */}
          <View style={styles.sectionHeader}>
            <TouchableOpacity onPress={() => navigation.getParent()?.navigate('OpportunitiesTab', {})}>
              <Text style={styles.viewAll}>{Strings.home.viewAll}</Text>
            </TouchableOpacity>
            <Text style={styles.sectionTitle}>{Strings.home.recentOpportunities}</Text>
          </View>

          <FlatList
            data={recentOpps}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(opp) => String(opp.id)}
            contentContainerStyle={styles.horizontalList}
            renderItem={({ item: opp }) => (
              <View style={styles.horizontalCard}>
                <OpportunityCard
                  opportunity={opp}
                  onPress={() => navigation.navigate('OpportunityDetail', { opportunityId: opp.id, type: opp.type })}
                />
              </View>
            )}
            ListEmptyComponent={null}
          />

          {/* Map Card */}
          <TouchableOpacity onPress={() => navigation.navigate('HomeMap')} activeOpacity={0.9}>
            <LinearGradient
              colors={[Colors.gradient.end + 'CC', Colors.gradient.start + 'CC']}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
              style={styles.mapCard}
            >
              <View style={styles.mapCardContent}>
                <Text style={styles.mapCardTitle}>{Strings.home.viewMap}</Text>
                <Text style={styles.mapCardSub}>اعثر على الفرص القريبة منك</Text>
              </View>
              <Ionicons name="map" size={40} color="rgba(255,255,255,0.8)" />
            </LinearGradient>
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
    backgroundColor: 'rgba(255,255,255,0.06)', top: -80, right: -60,
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
    backgroundColor: 'rgba(255,255,255,0.95)', borderRadius: 20, padding: 16,
  },
  xpCardRow: { flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 12 },
  xpLevelCircle: {
    width: 56, height: 56, borderRadius: 28, backgroundColor: Colors.opportunity.hackathonLight,
    alignItems: 'center', justifyContent: 'center',
  },
  xpLevelNum: {
    fontFamily: Typography.fontFamily.bold, fontSize: Typography.fontSize.xl,
    color: Colors.primary.purple,
  },
  xpLevelLabel: {
    fontFamily: Typography.fontFamily.regular, fontSize: Typography.fontSize.xs,
    color: Colors.text.secondary,
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
  statsRow: { flexDirection: 'row', justifyContent: 'space-around', paddingTop: 12, borderTopWidth: 1, borderTopColor: Colors.ui.divider },
  statItem: { alignItems: 'center' },
  statValue: { fontFamily: Typography.fontFamily.bold, fontSize: Typography.fontSize.lg, color: Colors.primary.purple },
  statLabel: { fontFamily: Typography.fontFamily.regular, fontSize: Typography.fontSize.xs, color: Colors.text.secondary },
  content: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 32 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 24 },
  categoryCard: { width: '47%', borderRadius: 16, overflow: 'hidden' },
  categoryGradient: { padding: 16, gap: 6, minHeight: 100 },
  categoryLabel: { fontFamily: Typography.fontFamily.semiBold, fontSize: Typography.fontSize.base, color: Colors.text.white },
  categoryCount: { fontFamily: Typography.fontFamily.regular, fontSize: Typography.fontSize.xs, color: 'rgba(255,255,255,0.85)' },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  sectionTitle: { fontFamily: Typography.fontFamily.bold, fontSize: Typography.fontSize.lg, color: Colors.text.primary },
  viewAll: { fontFamily: Typography.fontFamily.medium, fontSize: Typography.fontSize.sm, color: Colors.primary.purple },
  mapCard: { borderRadius: 16, padding: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 },
  mapCardContent: { gap: 4 },
  mapCardTitle: { fontFamily: Typography.fontFamily.bold, fontSize: Typography.fontSize.lg, color: Colors.text.white },
  mapCardSub: { fontFamily: Typography.fontFamily.regular, fontSize: Typography.fontSize.sm, color: 'rgba(255,255,255,0.85)' },
  horizontalList: { paddingBottom: 8, gap: 0 },
  horizontalCard: { width: 300, marginRight: 12 },
});

export default HomeScreen;
