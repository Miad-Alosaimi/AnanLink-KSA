import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TextInput,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';

import { Colors, Strings } from '../../constants';
import { ProfileStackParamList, Opportunity, OpportunityType } from '../../types';
import { OpportunityCard, FilterChip } from '../../components/opportunity';
import { GradientHeader, EmptyState, LoadingSpinner } from '../../components/common';
import { getUserBookmarks } from '../../database/queries/bookmarkQueries';
import { useAuth } from '../../context/AuthContext';
import { useBookmarks } from '../../context/BookmarkContext';

type Nav = NativeStackNavigationProp<ProfileStackParamList>;

const FILTER_TABS: { label: string; value: OpportunityType | 'all' }[] = [
  { label: Strings.opportunities.filters.all, value: 'all' },
  { label: Strings.opportunities.types.hackathon, value: 'hackathon' },
  { label: Strings.opportunities.types.internship, value: 'internship' },
  { label: Strings.opportunities.types.volunteer, value: 'volunteer' },
  { label: Strings.opportunities.types.opensource, value: 'opensource' },
];

const BookmarksScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const { userId } = useAuth();
  const { bookmarkedIds, toggleBookmarkItem } = useBookmarks();

  const [bookmarks, setBookmarks] = useState<Opportunity[]>([]);
  const [filter, setFilter] = useState<OpportunityType | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadBookmarks = useCallback(async () => {
    if (!userId) return;
    const data = await getUserBookmarks(userId);
    setBookmarks(data);
    setIsLoading(false);
  }, [userId]);

  // Reload whenever the shared bookmarkedIds change (from DetailScreen toggles)
  useEffect(() => { loadBookmarks(); }, [loadBookmarks, bookmarkedIds]);

  const onRefresh = async () => {
    setIsRefreshing(true);
    await loadBookmarks();
    setIsRefreshing(false);
  };

  const handleRemoveBookmark = async (opp: Opportunity) => {
    await toggleBookmarkItem(opp.id);
  };

  const filtered = bookmarks
    .filter(b => filter === 'all' || b.type === filter)
    .filter(b =>
      searchQuery.trim()
        ? b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          b.organization.toLowerCase().includes(searchQuery.toLowerCase())
        : true
    );

  return (
    <View style={styles.container}>
      <GradientHeader
        title={Strings.bookmarks.title}
        showBack
        onBack={() => navigation.goBack()}
      />

      {/* Search bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search-outline" size={18} color={Colors.text.secondary} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="ابحث في المحفوظات..."
          placeholderTextColor={Colors.text.muted}
          value={searchQuery}
          onChangeText={setSearchQuery}
          returnKeyType="search"
          textAlign="right"
        />
      </View>

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
  filterBar: { maxHeight: 52, backgroundColor: Colors.background.card, borderBottomWidth: 1, borderBottomColor: Colors.ui.border, marginTop: 8 },
  filterContent: { paddingHorizontal: 16, paddingVertical: 8 },
  listContent: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 32 },
});

export default BookmarksScreen;
