import React, { useEffect } from 'react';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { LoadingSpinner } from '../../components/common';
import { HomeStackParamList } from '../../types';

type Route = RouteProp<HomeStackParamList, 'OpportunityDetail'>;

/**
 * The home tab navigates to OpportunityDetail with { opportunityId, type }.
 * That route doesn't have its own screen anymore — we just replace ourselves
 * with the correct type-specific screen in the Opportunities stack.
 */
const OpportunityDetailDispatcher: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute<Route>();

  useEffect(() => {
    const { opportunityId, type } = route.params;
    const routeMap: Record<string, string> = {
      bootcamp: 'BootcampDetail',
      internship: 'InternshipDetail',
      opensource: 'OpenSourceDetail',
      volunteer: 'VolunteerDetail',
    };
    const target = routeMap[type] ?? 'BootcampDetail';
    // Jump to the opportunities tab and open the matching detail
    (navigation as any).getParent()?.navigate('OpportunitiesTab', {
      screen: target,
      params: { id: opportunityId },
    });
    // Leave this screen so the back button doesn't return here
    setTimeout(() => {
      if ((navigation as any).canGoBack()) navigation.goBack();
    }, 100);
  }, [route.params, navigation]);

  return <LoadingSpinner />;
};

export default OpportunityDetailDispatcher;
