import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRoute, RouteProp } from '@react-navigation/native';

import { Colors, Typography } from '../../../constants';
import { OpportunitiesStackParamList, Opportunity } from '../../../types';
import { useAuth } from '../../../context';
import { getOpportunityById } from '../../../database/queries/opportunityQueries';
import { toggleBookmark, getBookmarkedIds } from '../../../database/queries/bookmarkQueries';
import { LoadingSpinner } from '../../../components/common';
import DetailLayout, { openLink } from './DetailLayout';

type Route = RouteProp<OpportunitiesStackParamList, 'BootcampDetail'>;

const BootcampDetailScreen: React.FC = () => {
  const route = useRoute<Route>();
  const { userId } = useAuth();

  const [opportunity, setOpportunity] = useState<Opportunity | null>(null);
  const [isBookmarked, setIsBookmarked] = useState(false);

  useEffect(() => {
    getOpportunityById(route.params.id).then(setOpportunity);
  }, [route.params.id]);

  useEffect(() => {
    if (!userId) return;
    getBookmarkedIds(userId).then(ids => setIsBookmarked(ids.includes(route.params.id)));
  }, [userId, route.params.id]);

  if (!opportunity) return <LoadingSpinner />;
  const o = opportunity;

  const handleBookmark = async () => {
    if (!userId) return;
    await toggleBookmark(userId, o.id);
    setIsBookmarked(!isBookmarked);
  };

  const isOpen = o.level === 'متاح';
  const daysUntilStart = o.startDate ? Math.ceil((new Date(o.startDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)) : null;

  return (
    <DetailLayout
      opportunity={o}
      gradient={[Colors.opportunity.hackathon, Colors.primary.purpleMid]}
      typePill={{ label: 'معسكر', iconName: 'rocket' }}
      heroTitle={o.title}
      heroSubtitle={o.subtitle}
      stats={[
        { value: `${o.durationWeeks ?? '-'}`, label: 'أسبوع' },
        { value: o.category ?? 'تقني', label: 'المجال' },
        { value: isOpen ? 'متاح' : 'مغلق', label: 'التسجيل', valueColor: isOpen ? Colors.status.success : Colors.status.error },
      ]}
      banner={
        daysUntilStart !== null && daysUntilStart > 0 && daysUntilStart <= 14 && isOpen ? (
          <View style={styles.deadlineBanner}>
            <Text style={styles.deadlineIcon}>⏰</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.deadlineTitle}>أسرع! المعسكر يبدأ قريباً</Text>
              <Text style={styles.deadlineSub}>{daysUntilStart} يوم متبقي على بدء المعسكر</Text>
            </View>
          </View>
        ) : null
      }
      infoSectionTitle="تفاصيل المعسكر"
      infoRows={[
        { icon: 'calendar-outline', label: 'تاريخ البدء', value: o.startDate ? formatDate(o.startDate) : '—' },
        { icon: 'time-outline', label: 'المدة', value: o.durationWeeks ? `${o.durationWeeks} أسبوع` : '—' },
        { icon: 'location-outline', label: 'المكان', value: o.location || 'الرياض' },
        { icon: 'school-outline', label: 'المنظّم', value: o.organization },
        { icon: 'ribbon-outline', label: 'المجال', value: o.category ?? 'تقني' },
      ]}
      aboutTitle="عن المعسكر"
      aboutText={o.description}
      primaryAction={{
        label: isOpen ? 'سجّل الآن' : 'عرض التفاصيل',
        onPress: () => openLink(o.registrationLink),
      }}
      isBookmarked={isBookmarked}
      onBookmark={handleBookmark}
    />
  );
};

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('ar-SA', { day: 'numeric', month: 'long', year: 'numeric' });
  } catch { return iso; }
}

const styles = StyleSheet.create({
  deadlineBanner: {
    backgroundColor: '#FEE2E2', borderRadius: 14, padding: 14,
    flexDirection: 'row', alignItems: 'center', gap: 10,
  },
  deadlineIcon: { fontSize: 22 },
  deadlineTitle: {
    fontFamily: Typography.fontFamily.bold,
    fontSize: Typography.fontSize.sm,
    color: Colors.status.error, textAlign: 'right',
  },
  deadlineSub: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.fontSize.xs,
    color: Colors.text.secondary, textAlign: 'right', marginTop: 2,
  },
});

export default BootcampDetailScreen;
