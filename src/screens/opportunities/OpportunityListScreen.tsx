import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TextInput,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';

import { Colors, Strings } from '../../constants';
import { OpportunitiesStackParamList, OpportunityType, Opportunity } from '../../types';
import { OpportunityCard, FilterChip } from '../../components/opportunity';
import { GradientHeader, EmptyState, LoadingSpinner } from '../../components/common';
import { useBookmarks } from '../../context';
import { useAllOpportunities, OpportunityFilter } from '../../hooks/useOpportunities';

type Nav = NativeStackNavigationProp<OpportunitiesStackParamList>;
type Route = RouteProp<OpportunitiesStackParamList, 'OpportunityList'>;

const TYPE_HEADERS: Record<string, string> = {
  hackathon: 'ساحة الهاكاثون',
  internship: 'فرص التدريب',
  opensource: 'مساحة المطورين',
  volunteer: 'فرص تطوعية',
};

const TYPE_TABS: { label: string; value: OpportunityFilter }[] = [
  { label: 'الكل', value: 'all' },
  { label: 'هاكاثون', value: 'hackathon' },
  { label: 'تدريب', value: 'internship' },
  { label: 'مصدر مفتوح', value: 'opensource' },
  { label: 'تطوع', value: 'volunteer' },
];

const OpportunityListScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const { toggleBookmarkItem, isBookmarkedItem } = useBookmarks();

  const typeParam = route.params?.type as OpportunityFilter | undefined;

  const [activeFilter, setActiveFilter] = useState<OpportunityFilter>(typeParam ?? 'all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const { opportunities, isLoading, refetch } = useAllOpportunities(activeFilter);

  // Client-side filter: apply search query on top of the already type-filtered results
  const displayed = searchQuery.trim()
    ? opportunities.filter(o =>
        o.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        o.organization.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : opportunities;

  const onRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    setIsRefreshing(false);
  };

  const navigateToDetail = (opp: Opportunity) => {
    const routeMap: Record<OpportunityType, keyof OpportunitiesStackParamList> = {
      hackathon: 'HackathonDetail',
      internship: 'InternshipDetail',
      opensource: 'OpenSourceDetail',
      volunteer: 'VolunteerDetail',
    };
    navigation.navigate(routeMap[opp.type] as any, { id: opp.id });
  };

  const headerTitle = activeFilter !== 'all'
    ? TYPE_HEADERS[activeFilter]
    : Strings.navigation.opportunities;

  return (
    <View style={styles.container}>
      <GradientHeader title={headerTitle} />

      {/* Search bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search-outline" size={18} color={Colors.text.secondary} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="ابحث عن فرصة أو جهة..."
          placeholderTextColor={Colors.text.muted}
          value={searchQuery}
          onChangeText={setSearchQuery}
          returnKeyType="search"
          textAlign="right"
        />
      </View>

      {/* Type filter tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.typeTabsContainer}
        contentContainerStyle={styles.typeTabs}
      >
        {TYPE_TABS.map(tab => (
          <FilterChip
            key={tab.value}
            label={tab.label}
            isSelected={activeFilter === tab.value}
            onPress={() => setActiveFilter(tab.value)}
          />
        ))}
      </ScrollView>

      {/* Results count */}
      {!isLoading && (
        <View style={styles.countRow}>
          <Text style={styles.countText}>
            {displayed.length} نتيجة
          </Text>
        </View>
      )}

      {isLoading ? (
        <LoadingSpinner />
      ) : (
        <FlatList
          data={displayed}
          keyExtractor={(item) => `${item.type}-${item.id}`}
          renderItem={({ item }) => (
            <OpportunityCard
              opportunity={item}
              onPress={() => navigateToDetail(item)}
              onBookmark={() => toggleBookmarkItem(item.id)}
              isBookmarked={isBookmarkedItem(item.id)}
            />
          )}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={onRefresh}
              tintColor={Colors.primary.purple}
            />
          }
          ListEmptyComponent={
            <EmptyState
              icon="search-outline"
              title="لا توجد فرص"
              message="لا توجد فرص متاحة حالياً. حاول تغيير الفلتر أو اسحب للأسفل للتحديث."
            />
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background.app },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background.card,
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.ui.border,
    paddingHorizontal: 12,
    height: 44,
  },
  searchIcon: { marginLeft: 6 },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: Colors.text.primary,
    paddingVertical: 0,
  },
  typeTabsContainer: {
    backgroundColor: Colors.background.card,
    borderBottomWidth: 1,
    borderBottomColor: Colors.ui.border,
    marginTop: 8,
  },
  typeTabs: { paddingHorizontal: 16, paddingVertical: 10 },
  countRow: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 4 },
  countText: { fontSize: 13, color: Colors.text.secondary },
  listContent: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 32 },
});

export default OpportunityListScreen;
