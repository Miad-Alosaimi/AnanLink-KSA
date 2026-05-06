import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  ScrollView,
  RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { Colors, Strings } from '../../constants';
import { ProfileStackParamList, Opportunity, OpportunityType } from '../../types';
import { OpportunityCard, FilterChip } from '../../components/opportunity';
import { GradientHeader, EmptyState, LoadingSpinner } from '../../components/common';
import { getUserBookmarks } from '../../database/queries/bookmarkQueries';
import { toggleBookmark } from '../../database/queries/bookmarkQueries';
import { useAuth } from '../../context';

type Nav = NativeStackNavigationProp<ProfileStackParamList>;

const FILTER_TABS: { label: string; value: OpportunityType | 'all' }[] = [
  { label: Strings.opportunities.filters.all, value: 'all' },
  { label: Strings.opportunities.types.bootcamp, value: 'bootcamp' },
  { label: Strings.opportunities.types.internship, value: 'internship' },
  { label: Strings.opportunities.types.volunteer, value: 'volunteer' },
  { label: Strings.opportunities.types.opensource, value: 'opensource' },
];

const BookmarksScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const { userId } = useAuth();

  const [bookmarks, setBookmarks] = useState<Opportunity[]>([]);
  const [filter, setFilter] = useState<OpportunityType | 'all'>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadBookmarks = useCallback(async () => {
    if (!userId) return;
    const data = await getUserBookmarks(userId);
    setBookmarks(data);
    setIsLoading(false);
  }, [userId]);

  useEffect(() => { loadBookmarks(); }, [loadBookmarks]);

  const onRefresh = async () => {
    setIsRefreshing(true);
    await loadBookmarks();
    setIsRefreshing(false);
  };

  const handleRemoveBookmark = async (opp: Opportunity) => {
    if (!userId) return;
    await toggleBookmark(userId, opp.id);
    setBookmarks(prev => prev.filter(b => b.id !== opp.id));
  };

  const filtered = filter === 'all' ? bookmarks : bookmarks.filter(b => b.type === filter);

  return (
    <View style={styles.container}>
      <GradientHeader
        title={Strings.bookmarks.title}
        showBack
        onBack={() => navigation.goBack()}
      />

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterBar} contentContainerStyle={styles.filterContent}>
        {FILTER_TABS.map(tab => (
          <FilterChip
            key={tab.value}
            label={tab.label}
            isSelected={filter === tab.value}
            onPress={() => setFilter(tab.value)}
          />
        ))}
      </ScrollView>

      {isLoading ? (
        <LoadingSpinner />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={item => String(item.id)}
          renderItem={({ item }) => (
            <OpportunityCard
              opportunity={item}
              onPress={() => {}}
              onBookmark={() => handleRemoveBookmark(item)}
              isBookmarked
            />
          )}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} tintColor={Colors.primary.purple} />}
          ListEmptyComponent={
            <EmptyState
              icon="bookmark-outline"
              title={Strings.bookmarks.empty}
              message={Strings.bookmarks.emptyMessage}
            />
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background.app },
  filterBar: { maxHeight: 52, backgroundColor: Colors.background.card, borderBottomWidth: 1, borderBottomColor: Colors.ui.border },
  filterContent: { paddingHorizontal: 16, paddingVertical: 8 },
  listContent: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 32 },
});

export default BookmarksScreen;
