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

type Route = RouteProp<OpportunitiesStackParamList, 'VolunteerDetail'>;

const VolunteerDetailScreen: React.FC = () => {
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

  const daysUntilEnd = o.endDate ? Math.ceil((new Date(o.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)) : null;

  return (
    <DetailLayout
      opportunity={o}
      gradient={Colors.gradient.tealAll}
      typePill={{ label: 'تطوع', iconName: 'heart' }}
      heroTitle={o.title}
      heroSubtitle={o.subtitle}
      stats={[
        { value: `${o.seats ?? '-'}`, label: 'مقعد' },
        { value: o.level ?? 'عام', label: 'المستوى' },
        { value: `${daysUntilEnd ?? '-'}`, label: 'يوم متبقي', valueColor: (daysUntilEnd !== null && daysUntilEnd <= 7) ? Colors.status.error : Colors.text.primary },
      ]}
      banner={
        daysUntilEnd !== null && daysUntilEnd > 0 && daysUntilEnd <= 7 ? (
          <View style={styles.urgentBanner}>
            <Text style={styles.urgentIcon}>⏰</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.urgentTitle}>أسرع! الفرصة تنتهي قريباً</Text>
              <Text style={styles.urgentSub}>{daysUntilEnd} يوم متبقي على انتهاء التسجيل</Text>
            </View>
          </View>
        ) : null
      }
      infoSectionTitle="تفاصيل الفرصة"
      infoRows={[
        { icon: 'calendar-outline', label: 'تاريخ البدء', value: o.startDate ? formatDate(o.startDate) : '—' },
        { icon: 'hourglass-outline', label: 'تاريخ الانتهاء', value: o.endDate ? formatDate(o.endDate) : '—' },
        { icon: 'people-outline', label: 'المقاعد المتاحة', value: `${o.seats ?? '-'}` },
        { icon: 'location-outline', label: 'المدينة', value: o.city ?? 'عن بُعد' },
        { icon: 'ribbon-outline', label: 'المجال', value: o.category ?? '—' },
        { icon: 'star-outline', label: 'المستوى', value: o.level ?? 'عام' },
      ]}
      aboutTitle="وصف الفرصة"
      aboutText={o.description}
      primaryAction={{
        label: 'سجّل اهتمامك',
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
  urgentBanner: {
    backgroundColor: '#FEF3C7', borderRadius: 14, padding: 14,
    flexDirection: 'row', alignItems: 'center', gap: 10,
  },
  urgentIcon: { fontSize: 22 },
  urgentTitle: {
    fontFamily: Typography.fontFamily.bold,
    fontSize: Typography.fontSize.sm,
    color: Colors.opportunity.volunteer, textAlign: 'right',
  },
  urgentSub: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.fontSize.xs,
    color: Colors.text.secondary, textAlign: 'right', marginTop: 2,
  },
});

export default VolunteerDetailScreen;
