import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useRoute, RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

import { Colors, Typography } from '../../../constants';
import { OpportunitiesStackParamList, Opportunity } from '../../../types';
import { useUser } from '../../../context';
import { CareerId } from '../../../constants/skillTracks';
import {
  fetchRepoStats,
  RepoLiveStats,
  getRecommendedRepos,
  OpenSourceRepo,
} from '../../../services/githubService';
import { LoadingSpinner } from '../../../components/common';
import DetailLayout, { openLink } from './DetailLayout';

type Route = RouteProp<OpportunitiesStackParamList, 'OpenSourceDetail'>;

const OpenSourceDetailScreen: React.FC = () => {
  const route = useRoute<Route>();
  const { user } = useUser();

  const [repo, setRepo] = useState<OpenSourceRepo | null>(null);
  const [liveStats, setLiveStats] = useState<RepoLiveStats | null>(null);
  const [liveLoading, setLiveLoading] = useState(true);
  const [liveError, setLiveError] = useState(false);

  useEffect(() => {
    // Find the repo in the user's career recommendations (or defaults)
    const careerId = user?.specialty as CareerId | undefined;
    const recs = getRecommendedRepos(careerId);
    // List screen synthesized items with id = -(index+1), so reverse-derive
    const idx = Math.abs(route.params.id) - 1;
    setRepo(recs[idx] ?? recs[0]);
  }, [route.params.id, user?.specialty]);

  useEffect(() => {
    if (!repo) return;
    setLiveLoading(true);
    setLiveError(false);
    fetchRepoStats(repo.fullName)
      .then(stats => {
        if (stats) setLiveStats(stats);
        else setLiveError(true);
      })
      .catch(() => setLiveError(true))
      .finally(() => setLiveLoading(false));
  }, [repo?.fullName]);

  if (!repo) return <LoadingSpinner />;

  // Build an Opportunity shim for DetailLayout
  const opp: Opportunity = {
    id: route.params.id,
    extId: repo.id,
    type: 'opensource',
    title: repo.displayName,
    subtitle: repo.fullName,
    organization: repo.fullName.split('/')[0],
    description: liveStats?.description || repo.whyArabic,
    deadline: null, startDate: null, endDate: null, seats: null,
    location: 'GitHub', city: null, region: null,
    category: liveStats?.language || repo.language,
    jobType: null,
    level: repo.isBeginnerFriendly ? 'مناسب للمبتدئين' : 'متقدم',
    durationWeeks: null,
    latitude: null, longitude: null,
    xpReward: 50,
    registrationLink: `https://github.com/${repo.fullName}`,
    imageUrl: null,
    isActive: 1,
    createdAt: new Date().toISOString(),
  };

  const stars = liveStats?.stars ?? repo.starsBaseline;
  const forks = liveStats?.forks ?? repo.forksBaseline;
  const language = liveStats?.language || repo.language;
  const license = liveStats?.license || repo.license || '—';
  const openIssues = liveStats?.openIssues ?? null;

  return (
    <DetailLayout
      opportunity={opp}
      gradient={[Colors.opportunity.opensource, '#059669']}
      typePill={{ label: 'مفتوح المصدر', iconName: 'logo-github' }}
      heroTitle={repo.displayName}
      heroSubtitle={repo.fullName}
      stats={[
        { value: formatNum(stars), label: '⭐ Stars' },
        { value: formatNum(forks), label: '⑂ Forks' },
        { value: openIssues !== null ? formatNum(openIssues) : '—', label: 'Issues' },
      ]}
      banner={
        liveLoading ? (
          <View style={styles.loadingBanner}>
            <ActivityIndicator size="small" color={Colors.primary.purple} />
            <Text style={styles.loadingText}>جاري تحديث البيانات من GitHub...</Text>
          </View>
        ) : liveError ? (
          <View style={styles.offlineBanner}>
            <Ionicons name="cloud-offline-outline" size={18} color={Colors.text.secondary} />
            <Text style={styles.offlineText}>تعذّر الاتصال بـ GitHub. البيانات المعروضة مخزّنة.</Text>
          </View>
        ) : null
      }
      infoSectionTitle="معلومات المشروع"
      infoRows={[
        { icon: 'logo-github', label: 'المستودع', value: repo.fullName },
        { icon: 'code-slash-outline', label: 'اللغة', value: language },
        { icon: 'document-text-outline', label: 'الرخصة', value: license },
        { icon: 'star-outline', label: 'النجوم', value: formatNum(stars) },
        { icon: 'git-branch-outline', label: 'النسخ (Forks)', value: formatNum(forks) },
        ...(openIssues !== null ? [{ icon: 'alert-circle-outline', label: 'القضايا المفتوحة', value: formatNum(openIssues) }] : []),
        ...(liveStats?.pushedAt ? [{ icon: 'time-outline', label: 'آخر تحديث', value: formatRelative(liveStats.pushedAt) }] : []),
        { icon: 'ribbon-outline', label: 'المستوى', value: repo.isBeginnerFriendly ? 'مناسب للمبتدئين ✨' : 'متقدم' },
      ]}
      aboutTitle="عن المشروع"
      aboutText={repo.whyArabic}
      extraSection={
        liveStats?.topics && liveStats.topics.length > 0 ? (
          <View style={styles.tagsSection}>
            <Text style={styles.tagsSectionTitle}>المواضيع</Text>
            <View style={styles.tagsRow}>
              {liveStats.topics.slice(0, 8).map(t => (
                <View key={t} style={styles.topicTag}>
                  <Text style={styles.topicTagText}>{t}</Text>
                </View>
              ))}
            </View>
          </View>
        ) : null
      }
      primaryAction={{
        label: 'افتح على GitHub',
        onPress: () => openLink(`https://github.com/${repo.fullName}`),
      }}
    />
  );
};

function formatNum(n: number): string {
  if (n >= 1000) return (n / 1000).toFixed(1) + 'k';
  return String(n);
}
function formatRelative(iso: string): string {
  try {
    const diff = Date.now() - new Date(iso).getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (days === 0) return 'اليوم';
    if (days === 1) return 'أمس';
    if (days < 7) return `منذ ${days} أيام`;
    if (days < 30) return `منذ ${Math.floor(days / 7)} أسابيع`;
    if (days < 365) return `منذ ${Math.floor(days / 30)} أشهر`;
    return `منذ ${Math.floor(days / 365)} سنة`;
  } catch { return iso; }
}

const styles = StyleSheet.create({
  loadingBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: Colors.opportunity.opensourceLight,
    borderRadius: 12, padding: 12,
  },
  loadingText: {
    fontFamily: Typography.fontFamily.medium,
    fontSize: Typography.fontSize.sm,
    color: Colors.text.secondary,
  },
  offlineBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: Colors.ui.divider,
    borderRadius: 12, padding: 12,
  },
  offlineText: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.fontSize.sm,
    color: Colors.text.secondary, flex: 1,
  },
  tagsSection: { paddingHorizontal: 20, marginTop: 18 },
  tagsSectionTitle: {
    fontFamily: Typography.fontFamily.bold,
    fontSize: Typography.fontSize.lg,
    color: Colors.text.primary, textAlign: 'right',
    marginBottom: 10,
  },
  tagsRow: { flexDirection: 'row-reverse', flexWrap: 'wrap', gap: 8 },
  topicTag: {
    backgroundColor: Colors.opportunity.hackathonLight,
    paddingVertical: 5, paddingHorizontal: 12,
    borderRadius: 12,
  },
  topicTagText: {
    fontFamily: Typography.fontFamily.medium,
    fontSize: 12, color: Colors.primary.purple,
  },
});

export default OpenSourceDetailScreen;
