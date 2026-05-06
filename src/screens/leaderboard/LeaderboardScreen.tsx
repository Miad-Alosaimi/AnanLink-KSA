import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  RefreshControl,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

import { Colors, Typography } from '../../constants';
import { LeaderboardStackParamList } from '../../types';
import { useAuth } from '../../context';
import { getLeaderboard, LeaderboardEntry } from '../../database/queries/friendQueries';

type Nav = NativeStackNavigationProp<LeaderboardStackParamList>;

const LeaderboardScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const insets = useSafeAreaInsets();
  const { userId } = useAuth();

  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [period, setPeriod] = useState<'weekly' | 'monthly'>('weekly');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const load = useCallback(async () => {
    if (!userId) return;
    const data = await getLeaderboard(userId);
    setEntries(data);
  }, [userId]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const onRefresh = async () => {
    setIsRefreshing(true);
    await load();
    setIsRefreshing(false);
  };

  const hasFriends = entries.length > 1; // user alone = empty state
  const top3 = entries.slice(0, 3);
  const rest = entries.slice(3);

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      <LinearGradient
        colors={Colors.gradient.all}
        start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
        style={[styles.hero, { paddingTop: insets.top + 16 }]}
      >
        <View style={styles.heroTopBar}>
          <TouchableOpacity
            onPress={() => navigation.navigate('AddFriends')}
            style={styles.addBtn}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="person-add" size={20} color={Colors.text.white} />
          </TouchableOpacity>
          <Text style={styles.heroTitle}>المتصدرون</Text>
          <View style={{ width: 40 }} />
        </View>

        {hasFriends && (
          <View style={styles.periodToggle}>
            <TouchableOpacity
              onPress={() => setPeriod('monthly')}
              style={[styles.periodBtn, period === 'monthly' && styles.periodBtnActive]}
            >
              <Text style={[styles.periodText, period === 'monthly' && styles.periodTextActive]}>
                شهري
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setPeriod('weekly')}
              style={[styles.periodBtn, period === 'weekly' && styles.periodBtnActive]}
            >
              <Text style={[styles.periodText, period === 'weekly' && styles.periodTextActive]}>
                أسبوعي
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </LinearGradient>

      {!hasFriends ? (
        <EmptyState onAddFriends={() => navigation.navigate('AddFriends')} />
      ) : (
        <ScrollView
          contentContainerStyle={{ paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={onRefresh}
              tintColor={Colors.primary.purple}
            />
          }
        >
          {/* Podium */}
          <Podium top3={top3} />

          {/* Rest of the leaderboard */}
          {rest.length > 0 && (
            <View style={styles.listSection}>
              <Text style={styles.listSectionTitle}>المركز</Text>
              {rest.map(entry => (
                <View
                  key={entry.id}
                  style={[styles.listRow, entry.isMe && styles.listRowMe]}
                >
                  <Text style={styles.rankText}>#{entry.rank}</Text>
                  <Avatar user={entry} size={42} />
                  <View style={styles.listInfo}>
                    <Text style={styles.listName}>
                      {entry.fullName}{entry.isMe ? ' (أنت)' : ''}
                    </Text>
                    <Text style={styles.listUni}>{entry.university}</Text>
                  </View>
                  <View style={styles.xpChip}>
                    <Ionicons name="star" size={11} color={Colors.xp.gold} />
                    <Text style={styles.xpChipText}>{entry.xp}</Text>
                  </View>
                </View>
              ))}
            </View>
          )}
        </ScrollView>
      )}
    </View>
  );
};

// ----------------------------------------------------------------
// Sub-components
// ----------------------------------------------------------------

const EmptyState: React.FC<{ onAddFriends: () => void }> = ({ onAddFriends }) => (
  <View style={styles.empty}>
    <View style={styles.emptyIcon}>
      <Ionicons name="people-outline" size={64} color={Colors.primary.purple} />
    </View>
    <Text style={styles.emptyTitle}>لوحة المتصدرين فارغة</Text>
    <Text style={styles.emptyDesc}>
      أضف أصدقاءك لتشاهد منافستكم على نقاط الخبرة وتحفّزوا بعضكم البعض في رحلتكم التقنية!
    </Text>

    <TouchableOpacity activeOpacity={0.9} onPress={onAddFriends}>
      <LinearGradient
        colors={Colors.gradient.all}
        start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
        style={styles.emptyCta}
      >
        <Ionicons name="person-add" size={18} color={Colors.text.white} />
        <Text style={styles.emptyCtaText}>إضافة أصدقاء</Text>
      </LinearGradient>
    </TouchableOpacity>

    <View style={styles.emptyHints}>
      <View style={styles.emptyHintRow}>
        <Ionicons name="qr-code" size={16} color={Colors.text.secondary} />
        <Text style={styles.emptyHintText}>امسح رمز QR صديقك</Text>
      </View>
      <View style={styles.emptyHintRow}>
        <Ionicons name="mail-outline" size={16} color={Colors.text.secondary} />
        <Text style={styles.emptyHintText}>أو أضِف بالبريد الإلكتروني</Text>
      </View>
      <View style={styles.emptyHintRow}>
        <Ionicons name="sparkles-outline" size={16} color={Colors.text.secondary} />
        <Text style={styles.emptyHintText}>أو من المقترحات لك</Text>
      </View>
    </View>
  </View>
);

const Podium: React.FC<{ top3: LeaderboardEntry[] }> = ({ top3 }) => {
  const first = top3[0];
  const second = top3[1];
  const third = top3[2];

  return (
    <View style={styles.podium}>
      {/* Second place — left */}
      {second ? (
        <View style={styles.podiumColumn}>
          <Avatar user={second} size={72} ringColor="#A0A0A0" />
          <Text style={styles.podiumMedal}>🥈</Text>
          <Text style={styles.podiumName}>{second.firstName}</Text>
          <Text style={styles.podiumXp}>{second.xp}</Text>
          <View style={[styles.podiumBar, styles.podiumBarSecond]}>
            <Text style={styles.podiumRank}>#2</Text>
          </View>
        </View>
      ) : <View style={styles.podiumColumn} />}

      {/* First place — center */}
      {first ? (
        <View style={styles.podiumColumn}>
          <Text style={styles.crown}>👑</Text>
          <Avatar user={first} size={84} ringColor={Colors.xp.gold} />
          <Text style={styles.podiumMedal}>🥇</Text>
          <Text style={styles.podiumName}>{first.firstName}</Text>
          <Text style={[styles.podiumXp, { color: Colors.xp.gold }]}>{first.xp}</Text>
          <View style={[styles.podiumBar, styles.podiumBarFirst]}>
            <Text style={styles.podiumRank}>#1</Text>
          </View>
        </View>
      ) : <View style={styles.podiumColumn} />}

      {/* Third place — right */}
      {third ? (
        <View style={styles.podiumColumn}>
          <Avatar user={third} size={66} ringColor="#CD7F32" />
          <Text style={styles.podiumMedal}>🥉</Text>
          <Text style={styles.podiumName}>{third.firstName}</Text>
          <Text style={styles.podiumXp}>{third.xp}</Text>
          <View style={[styles.podiumBar, styles.podiumBarThird]}>
            <Text style={styles.podiumRank}>#3</Text>
          </View>
        </View>
      ) : <View style={styles.podiumColumn} />}
    </View>
  );
};

const Avatar: React.FC<{
  user: { firstName?: string; avatarUri?: string | null };
  size: number;
  ringColor?: string;
}> = ({ user, size, ringColor }) => {
  const initials = user.firstName?.[0] ?? '؟';
  return (
    <View
      style={[
        { width: size, height: size, borderRadius: size / 2 },
        styles.avatarBase,
        ringColor ? { borderColor: ringColor, borderWidth: 3 } : undefined,
      ]}
    >
      {user.avatarUri ? (
        <Image source={{ uri: user.avatarUri }} style={{ width: '100%', height: '100%', borderRadius: size / 2 }} />
      ) : (
        <Text style={[styles.avatarInitials, { fontSize: size * 0.4 }]}>{initials}</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background.app },

  hero: { paddingHorizontal: 20, paddingBottom: 24 },
  heroTopBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    marginBottom: 14,
  },
  addBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center', justifyContent: 'center',
  },
  heroTitle: {
    fontFamily: Typography.fontFamily.bold,
    fontSize: Typography.fontSize.xl,
    color: Colors.text.white,
  },
  periodToggle: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderRadius: 16, padding: 4,
    alignSelf: 'center',
  },
  periodBtn: { paddingVertical: 7, paddingHorizontal: 28, borderRadius: 12 },
  periodBtnActive: { backgroundColor: Colors.text.white },
  periodText: {
    fontFamily: Typography.fontFamily.semiBold,
    fontSize: Typography.fontSize.sm,
    color: 'rgba(255,255,255,0.85)',
  },
  periodTextActive: { color: Colors.primary.purple },

  // Empty state
  empty: { padding: 28, alignItems: 'center', paddingTop: 50 },
  emptyIcon: {
    width: 120, height: 120, borderRadius: 60,
    backgroundColor: Colors.opportunity.hackathonLight,
    alignItems: 'center', justifyContent: 'center', marginBottom: 20,
  },
  emptyTitle: {
    fontFamily: Typography.fontFamily.bold,
    fontSize: Typography.fontSize.xl,
    color: Colors.text.primary, textAlign: 'center', marginBottom: 8,
  },
  emptyDesc: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.fontSize.sm,
    color: Colors.text.secondary,
    textAlign: 'center', lineHeight: Typography.fontSize.sm * 1.7,
    marginBottom: 22, paddingHorizontal: 8,
  },
  emptyCta: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, paddingVertical: 14, paddingHorizontal: 32, borderRadius: 14,
    shadowColor: Colors.primary.purple,
    shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.25, shadowRadius: 10,
    elevation: 4,
  },
  emptyCtaText: {
    fontFamily: Typography.fontFamily.semiBold,
    fontSize: Typography.fontSize.base,
    color: Colors.text.white,
  },
  emptyHints: { marginTop: 28, gap: 10 },
  emptyHintRow: { flexDirection: 'row-reverse', alignItems: 'center', gap: 8 },
  emptyHintText: {
    fontFamily: Typography.fontFamily.medium,
    fontSize: Typography.fontSize.sm,
    color: Colors.text.secondary,
  },

  // Podium
  podium: {
    flexDirection: 'row',
    alignItems: 'flex-end', justifyContent: 'space-around',
    paddingHorizontal: 16, paddingTop: 30, paddingBottom: 12,
  },
  podiumColumn: { flex: 1, alignItems: 'center' },
  crown: { fontSize: 28, marginBottom: -2 },
  podiumMedal: { fontSize: 24, marginTop: -8, zIndex: 2 },
  podiumName: {
    fontFamily: Typography.fontFamily.semiBold,
    fontSize: Typography.fontSize.sm,
    color: Colors.text.primary, marginTop: 4,
  },
  podiumXp: {
    fontFamily: Typography.fontFamily.bold,
    fontSize: Typography.fontSize.base,
    color: Colors.text.primary, marginTop: 2, marginBottom: 6,
  },
  podiumBar: {
    width: '100%', alignItems: 'center', justifyContent: 'flex-end',
    paddingTop: 14, paddingBottom: 24,
    borderTopLeftRadius: 12, borderTopRightRadius: 12,
  },
  podiumBarFirst: { backgroundColor: '#FEF3C7', height: 110 },
  podiumBarSecond: { backgroundColor: '#E5E7EB', height: 80 },
  podiumBarThird: { backgroundColor: '#FED7AA', height: 64 },
  podiumRank: {
    fontFamily: Typography.fontFamily.bold,
    fontSize: Typography.fontSize.xl,
    color: Colors.text.primary,
  },

  avatarBase: {
    backgroundColor: Colors.opportunity.hackathonLight,
    alignItems: 'center', justifyContent: 'center',
    overflow: 'hidden',
  },
  avatarInitials: {
    fontFamily: Typography.fontFamily.bold,
    color: Colors.primary.purple,
  },

  // List
  listSection: { paddingHorizontal: 16, paddingTop: 18 },
  listSectionTitle: {
    fontFamily: Typography.fontFamily.bold,
    fontSize: Typography.fontSize.lg,
    color: Colors.text.primary, textAlign: 'right', marginBottom: 10,
  },
  listRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: Colors.background.card,
    borderRadius: 14, padding: 12, marginBottom: 8,
  },
  listRowMe: {
    backgroundColor: Colors.opportunity.hackathonLight,
    borderWidth: 1, borderColor: Colors.primary.purple,
  },
  rankText: {
    fontFamily: Typography.fontFamily.bold,
    fontSize: Typography.fontSize.sm,
    color: Colors.text.secondary, minWidth: 32, textAlign: 'center',
  },
  listInfo: { flex: 1 },
  listName: {
    fontFamily: Typography.fontFamily.semiBold,
    fontSize: Typography.fontSize.sm,
    color: Colors.text.primary, textAlign: 'right',
  },
  listUni: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.fontSize.xs,
    color: Colors.text.secondary, textAlign: 'right', marginTop: 2,
  },
  xpChip: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: Colors.xp.goldLight,
    borderRadius: 10, paddingVertical: 4, paddingHorizontal: 8,
  },
  xpChipText: {
    fontFamily: Typography.fontFamily.bold,
    fontSize: Typography.fontSize.xs,
    color: Colors.xp.bronze,
  },
});

export default LeaderboardScreen;
