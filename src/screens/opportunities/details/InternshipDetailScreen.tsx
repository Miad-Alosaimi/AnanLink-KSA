import React, { useEffect, useState } from 'react';
import { useRoute, RouteProp } from '@react-navigation/native';

import { Colors } from '../../../constants';
import { OpportunitiesStackParamList, Opportunity } from '../../../types';
import { useAuth } from '../../../context';
import { getOpportunityById } from '../../../database/queries/opportunityQueries';
import { toggleBookmark, getBookmarkedIds } from '../../../database/queries/bookmarkQueries';
import { LoadingSpinner } from '../../../components/common';
import DetailLayout, { openLink } from './DetailLayout';

type Route = RouteProp<OpportunitiesStackParamList, 'InternshipDetail'>;

const InternshipDetailScreen: React.FC = () => {
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

  return (
    <DetailLayout
      opportunity={o}
      gradient={[Colors.opportunity.internship, '#0EA5E9']}
      typePill={{ label: 'تدريب', iconName: 'briefcase' }}
      heroTitle={o.title}
      heroSubtitle={o.subtitle}
      stats={[
        { value: o.jobType ?? 'تدريب', label: 'النوع' },
        { value: o.category ?? 'تقني', label: 'المجال' },
      ]}
      infoSectionTitle="تفاصيل الوظيفة"
      infoRows={[
        { icon: 'business-outline', label: 'الشركة', value: o.organization },
        { icon: 'location-outline', label: 'الموقع', value: o.city ?? o.location ?? '—' },
        { icon: 'briefcase-outline', label: 'نوع الوظيفة', value: o.jobType ?? '—' },
        { icon: 'ribbon-outline', label: 'فئة الوظيفة', value: o.category ?? '—' },
      ]}
      aboutTitle="وصف الوظيفة"
      aboutText={o.description}
      primaryAction={{
        label: 'تقدم للوظيفة',
        onPress: () => openLink(o.registrationLink),
      }}
      isBookmarked={isBookmarked}
      onBookmark={handleBookmark}
    />
  );
};

export default InternshipDetailScreen;
