import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Linking,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

import { Colors, Typography, Strings } from '../../constants';
import { Opportunity } from '../../types';
import { getOpportunityById } from '../../database/queries';
import { CountdownTimer } from '../../components/opportunity';
import { LoadingSpinner } from '../../components/common';
import { useBookmarks } from '../../context/BookmarkContext';

const TYPE_COLORS: Record<string, string> = {
  hackathon: Colors.opportunity.hackathon,
  internship: Colors.opportunity.internship,
  opensource: Colors.opportunity.opensource,
  volunteer: Colors.opportunity.volunteer,
};

const TYPE_ICONS: Record<string, string> = {
  hackathon: 'rocket-outline',
  internship: 'briefcase-outline',
  opensource: 'code-slash-outline',
  volunteer: 'heart-outline',
};

const TYPE_LABELS: Record<string, string> = {
  hackathon: Strings.opportunities.types.hackathon,
  internship: Strings.opportunities.types.internship,
  opensource: Strings.opportunities.types.opensource,
  volunteer: Strings.opportunities.types.volunteer,
};

const DetailRow: React.FC<{ icon: string; label: string; value: string; color?: string }> = ({
  icon, label, value, color,
}) => (
  <View style={styles.detailRow}>
    <Text style={styles.detailValue}>{value}</Text>
    <View style={styles.detailLabel}>
      <Text style={styles.detailLabelText}>{label}</Text>
      <Ionicons name={icon as any} size={16} color={color ?? Colors.primary.purple} />
    </View>
  </View>
);

const OpportunityDetailScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute<any>();
  const insets = useSafeAreaInsets();
  const { isBookmarkedItem, toggleBookmarkItem } = useBookmarks();

  const id = route.params?.id ?? route.params?.opportunityId;
  const [opportunity, setOpportunity] = useState<Opportunity | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [descExpanded, setDescExpanded] = useState(false);

  useEffect(() => {
    if (!id) return;
    getOpportunityById(id).then(opp => {
      setOpportunity(opp);
      setIsLoading(false);
    });
  }, [id]);

  const bookmarked = opportunity ? isBookmarkedItem(opportunity.id) : false;

  const handleBookmark = async () => {
    if (!opportunity) return;
    await toggleBookmarkItem(opportunity.id);
  };

  const handleRegister = () => {
    if (!opportunity) return;
    Linking.openURL(opportunity.registrationLink).catch(() =>
      Alert.alert('خطأ', 'تعذّر فتح الرابط')
    );
  };

  if (isLoading) return <LoadingSpinner />;
  if (!opportunity) {
    return (
      <View style={styles.notFound}>
        <Text style={styles.notFoundText}>{Strings.errors.notFound}</Text>
      </View>
    );
  }

  const typeColor = TYPE_COLORS[opportunity.type] ?? Colors.primary.purple;
  const typeIcon = TYPE_ICONS[opportunity.type] ?? 'star-outline';
  const typeLabel = TYPE_LABELS[opportunity.type] ?? '';
  const registerLabel = opportunity.type === 'internship'
    ? Strings.opportunities.details.apply
    : Strings.opportunities.details.register;

  const descText = opportunity.description;
  const shouldTruncate = descText.length > 180;
  const displayDesc = shouldTruncate && !descExpanded ? descText.slice(0, 180) + '...' : descText;

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        {/* Hero Header */}
        <LinearGradient
          colors={[typeColor + 'FF', typeColor + '88']}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
          style={[styles.hero, { paddingTop: insets.top + 16 }]}
        >
          <View style={styles.navRow}>
            <TouchableOpacity onPress={handleBookmark} style={styles.iconBtn}>
              <Ionicons name={bookmarked ? 'bookmark' : 'bookmark-outline'} size={22} color={Colors.text.white} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconBtn}>
              <Ionicons name="chevron-forward" size={24} color={Colors.text.white} />
            </TouchableOpacity>
          </View>

          <View style={[styles.typeBadge, { backgroundColor: 'rgba(255,255,255,0.25)' }]}>
            <Ionicons name={typeIcon as any} size={14} color={Colors.text.white} />
            <Text style={styles.typeBadgeText}>{typeLabel}</Text>
          </View>

          <Text style={styles.heroTitle}>{opportunity.title}</Text>
          <Text style={styles.heroOrg}>{opportunity.organization}</Text>
        </LinearGradient>

        <View style={styles.content}>
          {/* Countdown if deadline */}
          {opportunity.deadline && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>الوقت المتبقي</Text>
              <CountdownTimer deadline={opportunity.deadline} />
            </View>
          )}

          {/* Common details */}
          <View style={styles.detailsCard}>
            {opportunity.deadline && (
              <DetailRow
                icon="calendar-outline"
                label={Strings.opportunities.details.deadline}
                value={new Date(opportunity.deadline).toLocaleDateString('ar-SA', { year: 'numeric', month: 'long', day: 'numeric' })}
              />
            )}
            <DetailRow
              icon="location-outline"
              label={Strings.opportunities.details.location}
              value={opportunity.location}
            />
            <View style={[styles.detailRow, { borderBottomWidth: 0 }]}>
              <View style={styles.xpBadge}>
                <Ionicons name="star" size={14} color={Colors.xp.gold} />
                <Text style={styles.xpBadgeText}>{opportunity.xpReward} XP</Text>
              </View>
              <View style={styles.detailLabel}>
                <Text style={styles.detailLabelText}>{Strings.opportunities.details.xpReward}</Text>
                <Ionicons name="trophy-outline" size={16} color={Colors.primary.purple} />
              </View>
            </View>
          </View>

          {/* ── TYPE-SPECIFIC SECTIONS ── */}

          {/* Hackathon: Prize + Team Size */}
          {opportunity.type === 'hackathon' && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>تفاصيل الهاكاثون</Text>
              <View style={styles.detailsCard}>
                {opportunity.prize ? (
                  <DetailRow icon="gift-outline" label="الجائزة" value={opportunity.prize} color={Colors.opportunity.hackathon} />
                ) : null}
                {opportunity.teams != null ? (
                  <DetailRow icon="people-outline" label="حجم الفريق" value={`${opportunity.teams} أعضاء`} />
                ) : null}
                {opportunity.participants != null ? (
                  <View style={[styles.detailRow, { borderBottomWidth: 0 }]}>
                    <Text style={styles.detailValue}>{opportunity.participants} مشارك</Text>
                    <View style={styles.detailLabel}>
                      <Text style={styles.detailLabelText}>المشاركون</Text>
                      <Ionicons name="person-outline" size={16} color={Colors.primary.purple} />
                    </View>
                  </View>
                ) : null}
              </View>
            </View>
          )}

          {/* Internship: Salary + Duration + Link */}
          {opportunity.type === 'internship' && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>تفاصيل التدريب</Text>
              <View style={styles.detailsCard}>
                {opportunity.salary ? (
                  <DetailRow icon="cash-outline" label="الراتب" value={opportunity.salary} color={Colors.opportunity.internship} />
                ) : null}
                {opportunity.duration ? (
                  <DetailRow icon="time-outline" label="المدة" value={opportunity.duration} />
                ) : null}
                <View style={[styles.detailRow, { borderBottomWidth: 0 }]}>
                  <TouchableOpacity onPress={handleRegister}>
                    <Text style={[styles.detailValue, { color: Colors.opportunity.internship }]}>فتح الرابط</Text>
                  </TouchableOpacity>
                  <View style={styles.detailLabel}>
                    <Text style={styles.detailLabelText}>رابط التقديم</Text>
                    <Ionicons name="link-outline" size={16} color={Colors.opportunity.internship} />
                  </View>
                </View>
              </View>
            </View>
          )}

          {/* Volunteer: Spots + Duration + QR check-in button */}
          {opportunity.type === 'volunteer' && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>تفاصيل التطوع</Text>
              <View style={styles.detailsCard}>
                {opportunity.volunteerSpots != null ? (
                  <DetailRow
                    icon="people-circle-outline"
                    label="المقاعد المتاحة"
                    value={`${opportunity.volunteerSpots - (opportunity.volunteerFilled ?? 0)} / ${opportunity.volunteerSpots}`}
                    color={Colors.opportunity.volunteer}
                  />
                ) : null}
                {opportunity.duration ? (
                  <View style={[styles.detailRow, { borderBottomWidth: 0 }]}>
                    <Text style={styles.detailValue}>{opportunity.duration}</Text>
                    <View style={styles.detailLabel}>
                      <Text style={styles.detailLabelText}>الساعات المطلوبة</Text>
                      <Ionicons name="time-outline" size={16} color={Colors.primary.purple} />
                    </View>
                  </View>
                ) : null}
              </View>
              <TouchableOpacity
                style={styles.qrButton}
                onPress={() => (navigation as any).navigate('QRScanner')}
              >
                <Ionicons name="qr-code-outline" size={20} color={Colors.text.white} />
                <Text style={styles.qrButtonText}>تسجيل الحضور بـ QR</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Open Source: Stars + Forks + Language + Beginner-friendly */}
          {opportunity.type === 'opensource' && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>إحصائيات المستودع</Text>
              <View style={styles.repoStatsRow}>
                {opportunity.stars != null && (
                  <View style={styles.repoStatChip}>
                    <Ionicons name="star" size={14} color={Colors.xp.gold} />
                    <Text style={styles.repoStatText}>{opportunity.stars.toLocaleString()}</Text>
                    <Text style={styles.repoStatLabel}>نجوم</Text>
                  </View>
                )}
                {opportunity.forks != null && (
                  <View style={styles.repoStatChip}>
                    <Ionicons name="git-branch-outline" size={14} color={Colors.primary.teal} />
                    <Text style={styles.repoStatText}>{opportunity.forks.toLocaleString()}</Text>
                    <Text style={styles.repoStatLabel}>تفرعات</Text>
                  </View>
                )}
                {opportunity.language && (
                  <View style={styles.repoStatChip}>
                    <Ionicons name="code-slash-outline" size={14} color={Colors.opportunity.opensource} />
                    <Text style={styles.repoStatText}>{opportunity.language}</Text>
                    <Text style={styles.repoStatLabel}>اللغة</Text>
                  </View>
                )}
              </View>
              {opportunity.isBeginnerFriendly && (
                <View style={styles.beginnerBadge}>
                  <Ionicons name="checkmark-circle" size={16} color={Colors.status.success} />
                  <Text style={styles.beginnerText}>مناسب للمبتدئين — يحتوي على مهام good first issue</Text>
                </View>
              )}
            </View>
          )}

          {/* About */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{Strings.opportunities.details.about}</Text>
            <Text style={styles.descText}>{displayDesc}</Text>
            {shouldTruncate && (
              <TouchableOpacity onPress={() => setDescExpanded(!descExpanded)}>
                <Text style={styles.expandLink}>
                  {descExpanded ? Strings.opportunities.details.viewLess : Strings.opportunities.details.viewMore}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </ScrollView>

      {/* Sticky Register Button */}
      <View style={[styles.stickyBar, { paddingBottom: insets.bottom + 12 }]}>
        <TouchableOpacity onPress={handleRegister} activeOpacity={0.9}>
          <LinearGradient
            colors={[typeColor, typeColor + 'CC']}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
            style={styles.registerButton}
          >
            <Text style={styles.registerText}>{registerLabel}</Text>
            <Ionicons name="arrow-back-outline" size={18} color={Colors.text.white} style={{ transform: [{ scaleX: -1 }] }} />
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background.app },
  hero: { paddingHorizontal: 20, paddingBottom: 28 },
  navRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
  iconBtn: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center', justifyContent: 'center',
  },
  typeBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 5, paddingVertical: 5,
    paddingHorizontal: 12, borderRadius: 16, alignSelf: 'flex-end', marginBottom: 10,
  },
  typeBadgeText: { fontFamily: Typography.fontFamily.medium, fontSize: Typography.fontSize.xs, color: Colors.text.white },
  heroTitle: { fontFamily: Typography.fontFamily.bold, fontSize: Typography.fontSize['2xl'], color: Colors.text.white, textAlign: 'right', marginBottom: 6 },
  heroOrg: { fontFamily: Typography.fontFamily.regular, fontSize: Typography.fontSize.base, color: 'rgba(255,255,255,0.85)', textAlign: 'right' },
  content: { paddingHorizontal: 20, paddingTop: 20 },
  section: { marginBottom: 20 },
  sectionTitle: { fontFamily: Typography.fontFamily.bold, fontSize: Typography.fontSize.lg, color: Colors.text.primary, textAlign: 'right', marginBottom: 12 },
  detailsCard: {
    backgroundColor: Colors.background.card, borderRadius: 16, padding: 16, marginBottom: 0,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2,
  },
  detailRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: Colors.ui.divider,
  },
  detailLabel: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  detailLabelText: { fontFamily: Typography.fontFamily.medium, fontSize: Typography.fontSize.sm, color: Colors.text.secondary },
  detailValue: { fontFamily: Typography.fontFamily.semiBold, fontSize: Typography.fontSize.sm, color: Colors.text.primary, flex: 1, textAlign: 'right', marginRight: 12 },
  xpBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: Colors.xp.goldLight, paddingVertical: 4, paddingHorizontal: 10, borderRadius: 8,
  },
  xpBadgeText: { fontFamily: Typography.fontFamily.semiBold, fontSize: Typography.fontSize.sm, color: Colors.xp.gold },
  descText: { fontFamily: Typography.fontFamily.regular, fontSize: Typography.fontSize.base, color: Colors.text.primary, textAlign: 'right', lineHeight: Typography.fontSize.base * 1.7 },
  expandLink: { fontFamily: Typography.fontFamily.semiBold, fontSize: Typography.fontSize.sm, color: Colors.primary.purple, textAlign: 'right', marginTop: 6 },
  // QR button for volunteer
  qrButton: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: Colors.opportunity.volunteer, borderRadius: 12,
    paddingVertical: 12, marginTop: 12,
  },
  qrButtonText: { fontFamily: Typography.fontFamily.semiBold, fontSize: Typography.fontSize.base, color: Colors.text.white },
  // Open source repo stats
  repoStatsRow: { flexDirection: 'row', gap: 10, flexWrap: 'wrap' },
  repoStatChip: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: Colors.background.card, borderRadius: 10, paddingVertical: 8, paddingHorizontal: 12,
    borderWidth: 1, borderColor: Colors.ui.border,
  },
  repoStatText: { fontFamily: Typography.fontFamily.bold, fontSize: Typography.fontSize.sm, color: Colors.text.primary },
  repoStatLabel: { fontFamily: Typography.fontFamily.regular, fontSize: Typography.fontSize.xs, color: Colors.text.secondary },
  beginnerBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: Colors.status.success + '15', borderRadius: 10,
    paddingVertical: 10, paddingHorizontal: 14, marginTop: 10,
  },
  beginnerText: { fontFamily: Typography.fontFamily.medium, fontSize: Typography.fontSize.sm, color: Colors.status.success, textAlign: 'right', flex: 1 },
  stickyBar: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: Colors.background.card, paddingHorizontal: 20, paddingTop: 12,
    borderTopWidth: 1, borderTopColor: Colors.ui.border,
  },
  registerButton: {
    borderRadius: 16, paddingVertical: 15, flexDirection: 'row',
    alignItems: 'center', justifyContent: 'center', gap: 8,
  },
  registerText: { fontFamily: Typography.fontFamily.semiBold, fontSize: Typography.fontSize.lg, color: Colors.text.white },
  notFound: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  notFoundText: { fontFamily: Typography.fontFamily.semiBold, fontSize: Typography.fontSize.lg, color: Colors.text.secondary },
});

export default OpportunityDetailScreen;
