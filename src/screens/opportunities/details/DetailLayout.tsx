import React, { ReactNode } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity, Linking, Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

import { Colors, Typography } from '../../../constants';
import { Opportunity } from '../../../types';

export type GradientStops = readonly [string, string, ...string[]];

interface InfoRow {
  icon: string;
  label: string;
  value: string | number;
  iconColor?: string;
}

interface Props {
  opportunity: Opportunity;
  /** Header gradient colors */
  gradient: GradientStops;
  /** Pill text shown in the top-right of the header (e.g. "هاكاثون", "تدريب") */
  typePill?: { label: string; iconName: string };
  /** Hero title (usually opportunity.title) */
  heroTitle: string;
  /** Hero subtitle (usually opportunity.subtitle) */
  heroSubtitle?: string | null;
  /** Stat blocks shown in a strip just under the hero (3-4 items) */
  stats?: { value: string; label: string; valueColor?: string }[];
  /** Optional callout banner just above the info section */
  banner?: ReactNode;
  /** Section title for the info-rows block (e.g. "تفاصيل الفعالية") */
  infoSectionTitle: string;
  /** Info rows shown in cards under the title */
  infoRows: InfoRow[];
  /** Optional "About" section content (full description) */
  aboutTitle?: string;
  aboutText?: string;
  /** Custom extra section (e.g. tech tags, tags chips) */
  extraSection?: ReactNode;
  /** Action bar at the bottom */
  primaryAction: { label: string; onPress: () => void };
  /** Bookmark button state */
  isBookmarked?: boolean;
  onBookmark?: () => void;
}

const DetailLayout: React.FC<Props> = ({
  opportunity,
  gradient,
  typePill,
  heroTitle,
  heroSubtitle,
  stats,
  banner,
  infoSectionTitle,
  infoRows,
  aboutTitle,
  aboutText,
  extraSection,
  primaryAction,
  isBookmarked,
  onBookmark,
}) => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      <ScrollView
        contentContainerStyle={{ paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Gradient header */}
        <LinearGradient
          colors={gradient}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
          style={[styles.hero, { paddingTop: insets.top + 12 }]}
        >
          <View style={styles.heroTopBar}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={styles.backBtn}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="chevron-forward" size={22} color={Colors.text.white} />
            </TouchableOpacity>
            {typePill && (
              <View style={styles.typePill}>
                <Ionicons name={typePill.iconName as any} size={11} color={Colors.text.white} />
                <Text style={styles.typePillText}>{typePill.label}</Text>
              </View>
            )}
          </View>

          <Text style={styles.heroTitle}>{heroTitle}</Text>
          {heroSubtitle && <Text style={styles.heroSubtitle}>{heroSubtitle}</Text>}
        </LinearGradient>

        {/* Floating stats strip */}
        {stats && stats.length > 0 && (
          <View style={styles.statsStrip}>
            {stats.map((s, i) => (
              <View key={i} style={[styles.statCard, i < stats.length - 1 && styles.statBorder]}>
                <Text style={[styles.statValue, s.valueColor && { color: s.valueColor }]}>
                  {s.value}
                </Text>
                <Text style={styles.statLabel}>{s.label}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Banner (optional) */}
        {banner && <View style={styles.bannerWrap}>{banner}</View>}

        {/* Info section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{infoSectionTitle}</Text>
          {infoRows.map((row, i) => (
            <View key={i} style={[styles.infoRow, i < infoRows.length - 1 && styles.infoRowBorder]}>
              <Text style={styles.infoValue} numberOfLines={2}>{row.value}</Text>
              <View style={styles.infoLabelWrap}>
                <Text style={styles.infoLabel}>{row.label}</Text>
                <Ionicons
                  name={row.icon as any}
                  size={16}
                  color={row.iconColor ?? Colors.text.secondary}
                />
              </View>
            </View>
          ))}
        </View>

        {/* About */}
        {aboutText && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{aboutTitle ?? 'عن الفرصة'}</Text>
            <Text style={styles.aboutText}>{aboutText}</Text>
          </View>
        )}

        {extraSection}
      </ScrollView>

      {/* Bottom action bar */}
      <View style={[styles.bottomBar, { paddingBottom: insets.bottom + 12 }]}>
        <View style={styles.bottomRow}>
          {onBookmark && (
            <TouchableOpacity
              onPress={onBookmark}
              style={styles.bookmarkBtn}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons
                name={isBookmarked ? 'bookmark' : 'bookmark-outline'}
                size={22}
                color={isBookmarked ? Colors.primary.purple : Colors.text.secondary}
              />
              <Text style={styles.bookmarkText}>حفظ</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={primaryAction.onPress}
            style={styles.primaryActionWrap}
          >
            <LinearGradient
              colors={gradient}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
              style={styles.primaryAction}
            >
              <Ionicons name="arrow-back" size={18} color={Colors.text.white} />
              <Text style={styles.primaryActionText}>{primaryAction.label}</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* XP earn label */}
        <View style={styles.xpEarnRow}>
          <Ionicons name="star" size={12} color={Colors.xp.gold} />
          <Text style={styles.xpEarnText}>اكسب +{opportunity.xpReward} XP عند المشاركة</Text>
        </View>
      </View>
    </View>
  );
};

export const openLink = async (url: string | null | undefined) => {
  if (!url) {
    Alert.alert('لا يوجد رابط متاح');
    return;
  }
  try {
    const supported = await Linking.canOpenURL(url);
    if (supported) {
      await Linking.openURL(url);
    } else {
      Alert.alert('تعذّر فتح الرابط', url);
    }
  } catch (e) {
    Alert.alert('حدث خطأ', String(e));
  }
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background.app },

  hero: { paddingHorizontal: 20, paddingBottom: 60, alignItems: 'center', overflow: 'hidden' },
  heroTopBar: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    width: '100%', marginBottom: 20,
  },
  backBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center', justifyContent: 'center',
  },
  typePill: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: 'rgba(255,255,255,0.22)',
    paddingVertical: 5, paddingHorizontal: 12, borderRadius: 14,
  },
  typePillText: {
    fontFamily: Typography.fontFamily.semiBold,
    fontSize: Typography.fontSize.xs, color: Colors.text.white,
  },
  heroTitle: {
    fontFamily: Typography.fontFamily.bold,
    fontSize: Typography.fontSize.xl,
    color: Colors.text.white, textAlign: 'center',
  },
  heroSubtitle: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.fontSize.sm,
    color: 'rgba(255,255,255,0.85)',
    textAlign: 'center', marginTop: 6,
  },

  statsStrip: {
    flexDirection: 'row',
    backgroundColor: Colors.background.card,
    marginHorizontal: 20, marginTop: -36,
    borderRadius: 18,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 12,
    elevation: 4,
  },
  statCard: { flex: 1, paddingVertical: 14, alignItems: 'center' },
  statBorder: { borderLeftWidth: 1, borderLeftColor: Colors.ui.divider },
  statValue: {
    fontFamily: Typography.fontFamily.bold,
    fontSize: Typography.fontSize.xl,
    color: Colors.text.primary,
  },
  statLabel: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.fontSize.xs,
    color: Colors.text.secondary, marginTop: 2,
  },

  bannerWrap: { paddingHorizontal: 20, marginTop: 16 },

  section: { paddingHorizontal: 20, marginTop: 18 },
  sectionTitle: {
    fontFamily: Typography.fontFamily.bold,
    fontSize: Typography.fontSize.lg,
    color: Colors.text.primary, textAlign: 'right',
    marginBottom: 8,
  },
  infoRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: 12,
  },
  infoRowBorder: { borderBottomWidth: 1, borderBottomColor: Colors.ui.divider },
  infoLabelWrap: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  infoLabel: {
    fontFamily: Typography.fontFamily.medium,
    fontSize: Typography.fontSize.sm,
    color: Colors.text.secondary,
  },
  infoValue: {
    flex: 1,
    fontFamily: Typography.fontFamily.semiBold,
    fontSize: Typography.fontSize.sm,
    color: Colors.text.primary, textAlign: 'left',
  },
  aboutText: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.fontSize.sm,
    color: Colors.text.primary,
    textAlign: 'right',
    lineHeight: Typography.fontSize.sm * 1.7,
  },

  bottomBar: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: Colors.background.card,
    paddingHorizontal: 16, paddingTop: 10,
    borderTopWidth: 1, borderTopColor: Colors.ui.divider,
    shadowColor: '#000', shadowOffset: { width: 0, height: -2 }, shadowOpacity: 0.06, shadowRadius: 6,
    elevation: 8,
  },
  bottomRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
  },
  bookmarkBtn: {
    paddingHorizontal: 14, paddingVertical: 12,
    borderRadius: 12, borderWidth: 1.5, borderColor: Colors.ui.border,
    flexDirection: 'row', alignItems: 'center', gap: 4,
  },
  bookmarkText: {
    fontFamily: Typography.fontFamily.medium,
    fontSize: Typography.fontSize.sm, color: Colors.text.secondary,
  },
  primaryActionWrap: { flex: 1 },
  primaryAction: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, paddingVertical: 14, borderRadius: 14,
    shadowColor: Colors.primary.purple,
    shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.25, shadowRadius: 10,
    elevation: 4,
  },
  primaryActionText: {
    fontFamily: Typography.fontFamily.semiBold,
    fontSize: Typography.fontSize.base,
    color: Colors.text.white,
  },
  xpEarnRow: {
    flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'center',
    gap: 4, marginTop: 6,
  },
  xpEarnText: {
    fontFamily: Typography.fontFamily.medium,
    fontSize: Typography.fontSize.xs, color: Colors.text.secondary,
  },
});

export default DetailLayout;
