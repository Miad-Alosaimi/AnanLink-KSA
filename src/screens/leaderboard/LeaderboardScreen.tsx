import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

import { Colors, Typography, Strings } from '../../constants';
import { LeaderboardEntry } from '../../types';
import { getLeaderboard, LeaderboardPeriod } from '../../database/queries';
import { useAuth } from '../../context';
import { LoadingSpinner } from '../../components/common';

const MEDAL_COLORS = [Colors.leaderboard.gold, Colors.leaderboard.silver, Colors.leaderboard.bronze];
const MEDAL_ICONS = ['🥇', '🥈', '🥉'];
const PODIUM_HEIGHTS = [120, 90, 70];

const AvatarCircle: React.FC<{ name: string; size: number; color?: string }> = ({ name, size, color = Colors.primary.purple }) => {
  const initials = name.split(' ').slice(0, 2).map(w => w[0]).join('');
  return (
    <View style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: color + '22', alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: color }}>
      <Text style={{ fontFamily: Typography.fontFamily.bold, fontSize: size * 0.35, color }}>{initials}</Text>
    </View>
  );
};

const PERIOD_TABS: { label: string; value: LeaderboardPeriod }[] = [
  { label: Strings.leaderboard.weekly, value: 'weekly' },
  { label: Strings.leaderboard.monthly, value: 'monthly' },
  { label: Strings.leaderboard.alltime, value: 'alltime' },
];

const LeaderboardScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const { userId } = useAuth();
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [period, setPeriod] = useState<LeaderboardPeriod>('alltime');

  useEffect(() => {
    setIsLoading(true);
    getLeaderboard(20, period).then(data => {
      setEntries(data);
      setIsLoading(false);
    });
  }, [period]);

  const top3 = entries.slice(0, 3);
  const rest = entries.slice(3);

  const myEntry = entries.find(e => e.id === userId);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar style="light" />
      <LinearGradient
        colors={[Colors.gradient.start, Colors.gradient.end]}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>{Strings.leaderboard.title}</Text>

        {/* Period tabs */}
        <View style={styles.periodTabs}>
          {PERIOD_TABS.map(p => (
            <TouchableOpacity
              key={p.value}
              onPress={() => setPeriod(p.value)}
              style={[styles.periodTab, period === p.value && styles.periodTabActive]}
            >
              <Text style={[styles.periodTabText, period === p.value && styles.periodTabTextActive]}>
                {p.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </LinearGradient>

      {isLoading ? <LoadingSpinner /> : (
        <FlatList
          data={rest}
          keyExtractor={(item) => String(item.id)}
          ListHeaderComponent={() => (
            <>
              {/* Podium */}
              {top3.length >= 3 && (
                <View style={styles.podiumContainer}>
                  {[1, 0, 2].map((realIdx) => {
                    const entry = top3[realIdx];
                    const displayRank = realIdx + 1;
                    const podiumH = PODIUM_HEIGHTS[realIdx];
                    return (
                      <View key={realIdx} style={styles.podiumItem}>
                        {realIdx === 0 && (
                          <Text style={styles.crownEmoji}>👑</Text>
                        )}
                        <AvatarCircle
                          name={entry.fullName}
                          size={realIdx === 0 ? 64 : 52}
                          color={MEDAL_COLORS[realIdx]}
                        />
                        <Text style={styles.podiumEmoji}>{MEDAL_ICONS[realIdx]}</Text>
                        <Text style={styles.podiumName} numberOfLines={1}>{entry.fullName.split(' ')[0]}</Text>
                        <Text style={[styles.podiumXP, { color: MEDAL_COLORS[realIdx] }]}>{entry.xp}</Text>
                        <View style={[styles.podiumBase, { height: podiumH, backgroundColor: MEDAL_COLORS[realIdx] + '22', borderTopColor: MEDAL_COLORS[realIdx] }]}>
                          <Text style={[styles.podiumRank, { color: MEDAL_COLORS[realIdx] }]}>#{displayRank}</Text>
                        </View>
                      </View>
                    );
                  })}
                </View>
              )}

              {rest.length > 0 && (
                <View style={styles.listHeader}>
                  <Text style={styles.listHeaderText}>{Strings.leaderboard.rank}</Text>
                </View>
              )}
            </>
          )}
          renderItem={({ item }) => (
            <View style={[styles.rankRow, item.id === userId && styles.myRankRow]}>
              <Text style={styles.rankNum}>#{item.rank}</Text>
              <AvatarCircle name={item.fullName} size={40} />
              <View style={styles.rankInfo}>
                <Text style={styles.rankName}>{item.fullName}</Text>
                <Text style={styles.rankUni}>{item.university}</Text>
              </View>
              <View style={styles.xpBadge}>
                <Ionicons name="star" size={12} color={Colors.xp.gold} />
                <Text style={styles.xpText}>{item.xp}</Text>
              </View>
            </View>
          )}
          ListFooterComponent={() =>
            myEntry && myEntry.rank > 3 ? (
              <View style={[styles.rankRow, styles.myRankSticky]}>
                <Text style={styles.rankNum}>#{myEntry.rank}</Text>
                <AvatarCircle name={myEntry.fullName} size={40} color={Colors.primary.purple} />
                <View style={styles.rankInfo}>
                  <Text style={[styles.rankName, { color: Colors.primary.purple }]}>{myEntry.fullName} (أنت)</Text>
                  <Text style={styles.rankUni}>{myEntry.university}</Text>
                </View>
                <View style={[styles.xpBadge, { backgroundColor: Colors.opportunity.hackathonLight }]}>
                  <Ionicons name="star" size={12} color={Colors.primary.purple} />
                  <Text style={[styles.xpText, { color: Colors.primary.purple }]}>{myEntry.xp}</Text>
                </View>
              </View>
            ) : null
          }
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background.app },
  header: { paddingHorizontal: 24, paddingTop: 16, paddingBottom: 24, alignItems: 'center', gap: 16 },
  headerTitle: { fontFamily: Typography.fontFamily.bold, fontSize: Typography.fontSize['2xl'], color: Colors.text.white },
  periodTabs: { flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 20, padding: 3 },
  periodTab: { paddingVertical: 6, paddingHorizontal: 20, borderRadius: 18 },
  periodTabActive: { backgroundColor: Colors.background.card },
  periodTabText: { fontFamily: Typography.fontFamily.medium, fontSize: Typography.fontSize.sm, color: 'rgba(255,255,255,0.8)' },
  periodTabTextActive: { color: Colors.primary.purple },
  podiumContainer: {
    flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'center',
    paddingHorizontal: 20, paddingTop: 24, paddingBottom: 16, gap: 8,
  },
  podiumItem: { flex: 1, alignItems: 'center', gap: 4 },
  crownEmoji: { fontSize: 24, marginBottom: 2 },
  podiumEmoji: { fontSize: 20, marginTop: 2 },
  podiumName: { fontFamily: Typography.fontFamily.semiBold, fontSize: Typography.fontSize.sm, color: Colors.text.primary, textAlign: 'center' },
  podiumXP: { fontFamily: Typography.fontFamily.bold, fontSize: Typography.fontSize.sm },
  podiumBase: {
    width: '100%', borderTopWidth: 3, borderTopLeftRadius: 8, borderTopRightRadius: 8,
    alignItems: 'center', justifyContent: 'flex-start', paddingTop: 8,
  },
  podiumRank: { fontFamily: Typography.fontFamily.bold, fontSize: Typography.fontSize.xl },
  listHeader: { paddingHorizontal: 20, paddingBottom: 8, borderTopWidth: 1, borderTopColor: Colors.ui.border },
  listHeaderText: { fontFamily: Typography.fontFamily.semiBold, fontSize: Typography.fontSize.sm, color: Colors.text.secondary, textAlign: 'right' },
  rankRow: {
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20,
    paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: Colors.ui.divider, gap: 12,
    backgroundColor: Colors.background.card,
  },
  myRankRow: { backgroundColor: Colors.opportunity.hackathonLight },
  myRankSticky: {
    margin: 16, borderRadius: 14, borderWidth: 2, borderColor: Colors.primary.purple,
    elevation: 4, shadowColor: Colors.primary.purple, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 6,
  },
  rankNum: { fontFamily: Typography.fontFamily.bold, fontSize: Typography.fontSize.sm, color: Colors.text.secondary, width: 28, textAlign: 'center' },
  rankInfo: { flex: 1 },
  rankName: { fontFamily: Typography.fontFamily.semiBold, fontSize: Typography.fontSize.base, color: Colors.text.primary, textAlign: 'right' },
  rankUni: { fontFamily: Typography.fontFamily.regular, fontSize: Typography.fontSize.xs, color: Colors.text.secondary, textAlign: 'right' },
  xpBadge: { flexDirection: 'row', alignItems: 'center', gap: 3, backgroundColor: Colors.xp.goldLight, paddingVertical: 4, paddingHorizontal: 8, borderRadius: 8 },
  xpText: { fontFamily: Typography.fontFamily.semiBold, fontSize: Typography.fontSize.xs, color: Colors.xp.gold },
  listContent: { paddingBottom: 32 },
});

export default LeaderboardScreen;
