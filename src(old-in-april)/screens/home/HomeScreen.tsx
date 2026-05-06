import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  FlatList, RefreshControl,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

import { Colors, Typography, Strings } from '../../constants';
import { HomeStackParamList, Opportunity } from '../../types';
import { getRecentOpportunities, getOpportunityCountByType, getUserById } from '../../database/db';
import { useAuth } from '../../context';
import { Card } from '../../components/common';

type Nav = NativeStackNavigationProp<HomeStackParamList>;

const TYPE_COLORS: Record<string, string> = {
  hackathon: Colors.opportunity.hackathon,
  internship: Colors.opportunity.internship,
  opensource: Colors.opportunity.opensource,
  volunteer: Colors.opportunity.volunteer,
};

const TYPE_ICONS: Record<string, string> = {
  hackathon: 'rocket',
  internship: 'briefcase',
  opensource: 'code-slash',
  volunteer: 'heart',
};

const CATEGORY_LABELS: Record<string, string> = {
  hackathon: Strings.home.categories.hackathon,
  internship: Strings.home.categories.internship,
  opensource: Strings.home.categories.opensource,
  volunteer: Strings.home.categories.volunteer,
};

const HomeScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const insets = useSafeAreaInsets();
  const { userId } = useAuth();

  const [userName, setUserName] = useState('');
  const [recentOpps, setRecentOpps] = useState<Opportunity[]>([]);
  const [counts, setCounts] = useState<Record<string, number>>({ hackathon: 0, internship: 0, opensource: 0, volunteer: 0 });
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadData = async () => {
    const [recent, countMap] = await Promise.all([
      getRecentOpportunities(4),
      getOpportunityCountByType(),
    ]);
    setRecentOpps(recent);
    setCounts(countMap);
    if (userId) {
      const user = await getUserById(userId);
      if (user) setUserName(user.firstName);
    }
  };

  useEffect(() => { loadData(); }, []);

  const onRefresh = async () => {
    setIsRefreshing(true);
    await loadData();
    setIsRefreshing(false);
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} tintColor={Colors.primary.purple} />}
      >
        {/* Header */}
        <LinearGradient
          colors={[Colors.primary.purple, Colors.primary.teal]}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
          style={[styles.header, { paddingTop: insets.top + 20 }]}
        >
          <Text style={styles.greeting}>{Strings.home.greeting} {userName} 👋</Text>
          <Text style={styles.subGreeting}>اكتشف الفرص المتاحة لك</Text>
        </LinearGradient>

        <View style={styles.content}>
          {/* Category Cards */}
          <Text style={styles.sectionTitle}>تصفّح حسب النوع</Text>
          <View style={styles.grid}>
            {Object.entries(CATEGORY_LABELS).map(([type, label]) => (
              <TouchableOpacity key={type} style={styles.categoryCard} activeOpacity={0.85}>
                <View style={[styles.categoryIconBox, { backgroundColor: TYPE_COLORS[type] + '22' }]}>
                  <Ionicons name={TYPE_ICONS[type] as any} size={24} color={TYPE_COLORS[type]} />
                </View>
                <Text style={styles.categoryLabel}>{label}</Text>
                <Text style={styles.categoryCount}>{counts[type]} {Strings.home.available}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Recent Opportunities */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{Strings.home.recentOpportunities}</Text>
            <TouchableOpacity>
              <Text style={styles.viewAll}>{Strings.home.viewAll}</Text>
            </TouchableOpacity>
          </View>

          {recentOpps.map((opp) => (
            <Card key={opp.id} style={styles.oppCard}>
              <TouchableOpacity activeOpacity={0.85} style={styles.oppInner}>
                <View style={styles.oppTop}>
                  <View style={[styles.typeBadge, { backgroundColor: TYPE_COLORS[opp.type] + '22' }]}>
                    <Text style={[styles.typeBadgeText, { color: TYPE_COLORS[opp.type] }]}>
                      {CATEGORY_LABELS[opp.type]}
                    </Text>
                  </View>
                  {opp.deadline ? (
                    <Text style={styles.deadline}>
                      <Ionicons name="time-outline" size={12} color={Colors.text.secondary} /> {opp.deadline}
                    </Text>
                  ) : null}
                </View>
                <Text style={styles.oppTitle}>{opp.title}</Text>
                <Text style={styles.oppOrg}>{opp.organization}</Text>
                <View style={styles.oppLocation}>
                  <Ionicons name="location-outline" size={13} color={Colors.text.secondary} />
                  <Text style={styles.oppLocationText}>{opp.location}</Text>
                </View>
              </TouchableOpacity>
            </Card>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background.app },
  header: { paddingHorizontal: 20, paddingBottom: 36 },
  greeting: { fontFamily: Typography.fontFamily.bold, fontSize: Typography.fontSize.xl, color: '#fff', textAlign: 'right', marginBottom: 4 },
  subGreeting: { fontFamily: Typography.fontFamily.regular, fontSize: Typography.fontSize.base, color: 'rgba(255,255,255,0.85)', textAlign: 'right' },
  content: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 32 },
  sectionTitle: { fontFamily: Typography.fontFamily.bold, fontSize: Typography.fontSize.lg, color: Colors.text.primary, textAlign: 'right', marginBottom: 14 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 24, marginBottom: 14 },
  viewAll: { fontFamily: Typography.fontFamily.medium, fontSize: Typography.fontSize.sm, color: Colors.primary.purple },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 8 },
  categoryCard: {
    width: '47%', backgroundColor: Colors.background.card,
    borderRadius: 16, padding: 16, alignItems: 'flex-end',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2,
  },
  categoryIconBox: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  categoryLabel: { fontFamily: Typography.fontFamily.semiBold, fontSize: Typography.fontSize.base, color: Colors.text.primary, textAlign: 'right', marginBottom: 2 },
  categoryCount: { fontFamily: Typography.fontFamily.regular, fontSize: Typography.fontSize.sm, color: Colors.text.secondary },
  oppCard: { marginBottom: 12 },
  oppInner: {},
  oppTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  typeBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  typeBadgeText: { fontFamily: Typography.fontFamily.medium, fontSize: Typography.fontSize.xs },
  deadline: { fontFamily: Typography.fontFamily.regular, fontSize: Typography.fontSize.xs, color: Colors.text.secondary },
  oppTitle: { fontFamily: Typography.fontFamily.semiBold, fontSize: Typography.fontSize.base, color: Colors.text.primary, textAlign: 'right', marginBottom: 4 },
  oppOrg: { fontFamily: Typography.fontFamily.regular, fontSize: Typography.fontSize.sm, color: Colors.text.secondary, textAlign: 'right', marginBottom: 8 },
  oppLocation: { flexDirection: 'row', alignItems: 'center', gap: 4, justifyContent: 'flex-end' },
  oppLocationText: { fontFamily: Typography.fontFamily.regular, fontSize: Typography.fontSize.xs, color: Colors.text.secondary },
});

export default HomeScreen;
