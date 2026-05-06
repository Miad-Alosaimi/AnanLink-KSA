import React, { useState, useMemo } from 'react';
import {
  View, Text, FlatList, StyleSheet, ScrollView, RefreshControl,
  TouchableOpacity, TextInput, Modal,
} from 'react-native';
import { useNavigation, useRoute, RouteProp, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';

import { Colors, Typography } from '../../constants';
import { OpportunitiesStackParamList, OpportunityType, Opportunity } from '../../types';
import { LoadingSpinner } from '../../components/common';
import { toggleBookmark, getBookmarkedIds } from '../../database/queries/bookmarkQueries';
import { useAuth } from '../../context';
import { useAllOpportunities, OpportunityFilter } from '../../hooks/useOpportunities';
import { checkBookmarkAchievements } from '../../utils/achievements';

type Nav = NativeStackNavigationProp<OpportunitiesStackParamList>;
type Route = RouteProp<OpportunitiesStackParamList, 'OpportunityList'>;

const TYPE_HEADERS: Record<OpportunityFilter, string> = {
  all: 'الفرص',
  bootcamp: 'ساحة المعسكرات',
  internship: 'فرصتك المهنية',
  opensource: 'مساحة المطورين',
  volunteer: 'فرص تطوعية',
};

const TYPE_HEADER_GRADIENTS: Record<OpportunityFilter, readonly [string, string, ...string[]]> = {
  all: Colors.gradient.all,
  bootcamp: [Colors.opportunity.hackathon, Colors.primary.purpleMid] as const,
  internship: [Colors.opportunity.internship, '#0EA5E9'] as const,
  opensource: [Colors.opportunity.opensource, '#059669'] as const,
  volunteer: Colors.gradient.tealAll,
};

const TYPE_TABS: { label: string; value: OpportunityFilter }[] = [
  { label: 'الكل', value: 'all' },
  { label: 'معسكرات', value: 'bootcamp' },
  { label: 'تدريب', value: 'internship' },
  { label: 'مصدر مفتوح', value: 'opensource' },
  { label: 'تطوع', value: 'volunteer' },
];

const SAUDI_CITIES: string[] = [
  'أبها', 'أبو عريش', 'أحد رفيدة', 'الأحساء', 'الأفلاج', 'أملج',
  'الباحة', 'البدائع', 'البدع', 'البكيرية', 'البيشة', 'بدر', 'بريدة', 'بلجرشي', 'بيش',
  'تبوك', 'تنومة', 'تيماء', 'ثادق',
  'جازان', 'جدة',
  'حائل', 'حفر الباطن', 'حوطة بني تميم',
  'الخبر', 'الخرج', 'خميس مشيط', 'خيبر',
  'الدرعية', 'الدلم', 'الدمام', 'الدوادمي',
  'رأس تنورة', 'الرس', 'رفحاء', 'الرياض', 'رياض الخبراء',
  'الزلفي',
  'سكاكا', 'سيهات', 'شرورة', 'شقراء',
  'الطائف', 'طريف', 'ضباء', 'ضرما', 'الظهران',
  'العلا', 'عرعر', 'عقلة الصقور', 'عنيزة', 'عيون الجواء',
  'الغاط',
  'فيفاء',
  'القريات', 'القطيف', 'القنفذة', 'القيصومة',
  'الليث',
  'مكة المكرمة', 'المجمعة', 'محايل عسير', 'المدينة المنورة', 'المذنب', 'مرات',
  'المزاحمية', 'مهد الذهب',
  'نجران', 'النعيرية', 'النماص',
  'الهفوف',
  'وادي الدواسر', 'الوجه',
  'ينبع',
];

const OpportunityListScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const insets = useSafeAreaInsets();
  const { userId } = useAuth();

  const typeParam = route.params?.type as OpportunityFilter | undefined;

  const [activeFilter, setActiveFilter] = useState<OpportunityFilter>(typeParam ?? 'all');
  const [bookmarkedIds, setBookmarkedIds] = useState<number[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState<string | null>(null);
  const [cityPickerOpen, setCityPickerOpen] = useState(false);

  const { opportunities, isLoading, refetch } = useAllOpportunities(activeFilter);

  // Reset city filter when switching type tabs
  React.useEffect(() => {
    setSelectedCity(null);
  }, [activeFilter]);

  useFocusEffect(
    React.useCallback(() => {
      if (userId) {
        getBookmarkedIds(userId).then(setBookmarkedIds).catch(() => {});
      }
    }, [userId])
  );

  const filteredOpportunities = useMemo(() => {
    let result = opportunities;

    // City filter
    if (selectedCity) {
      result = result.filter(o => o.city?.trim() === selectedCity);
    }

    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      result = result.filter(o =>
        o.title.toLowerCase().includes(q) ||
        o.organization.toLowerCase().includes(q) ||
        (o.subtitle ?? '').toLowerCase().includes(q) ||
        (o.city ?? '').toLowerCase().includes(q)
      );
    }

    return result;
  }, [opportunities, searchQuery, selectedCity]);

  const onRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    if (userId) {
      const ids = await getBookmarkedIds(userId);
      setBookmarkedIds(ids);
    }
    setIsRefreshing(false);
  };

  const handleBookmark = async (opp: Opportunity) => {
    if (!userId || opp.id < 0) return;
    await toggleBookmark(userId, opp.id);
    setBookmarkedIds(ids =>
      ids.includes(opp.id) ? ids.filter(id => id !== opp.id) : [...ids, opp.id]
    );
    checkBookmarkAchievements(userId).catch(() => {});
  };

  const navigateToDetail = (opp: Opportunity) => {
    const routeMap: Record<OpportunityType, keyof OpportunitiesStackParamList> = {
      bootcamp: 'BootcampDetail',
      internship: 'InternshipDetail',
      opensource: 'OpenSourceDetail',
      volunteer: 'VolunteerDetail',
    };
    navigation.navigate(routeMap[opp.type] as any, { id: opp.id });
  };

  const headerGradient = TYPE_HEADER_GRADIENTS[activeFilter];
  const headerTitle = TYPE_HEADERS[activeFilter];
  const headerCountText = activeFilter === 'all'
    ? `${filteredOpportunities.length} فرصة`
    : `${filteredOpportunities.length} ${activeFilter === 'bootcamp' ? 'معسكر' : activeFilter === 'internship' ? 'فرصة تدريبية' : activeFilter === 'volunteer' ? 'فرصة تطوعية' : 'مشروع'}`;

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      <LinearGradient
        colors={headerGradient}
        start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
        style={[styles.hero, { paddingTop: insets.top + 12 }]}
      >
        <View style={styles.heroTopRow}>
          <TouchableOpacity hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Ionicons name="notifications-outline" size={22} color={Colors.text.white} />
          </TouchableOpacity>
          <View style={styles.heroTitleRow}>
            <Text style={styles.heroTitle}>{headerTitle}</Text>
            <Ionicons name="menu" size={22} color={Colors.text.white} />
          </View>
        </View>

        <View style={styles.searchBar}>
          <Ionicons name="search" size={18} color={Colors.text.muted} />
          <TextInput
            style={styles.searchInput}
            placeholder={
              activeFilter === 'opensource' ? 'ابحث في GitHub...' :
              activeFilter === 'bootcamp' ? 'ابحث عن معسكر...' :
              activeFilter === 'volunteer' ? 'ابحث عن فرصة تطوع...' :
              activeFilter === 'internship' ? 'الدور، الشركة، أو المدينة...' :
              'ابحث في كل الفرص...'
            }
            placeholderTextColor={Colors.text.muted}
            value={searchQuery}
            onChangeText={setSearchQuery}
            textAlign="right"
            returnKeyType="search"
          />
        </View>
      </LinearGradient>

      {/* Type filter tabs — single horizontally scrollable row */}
      <View style={styles.tabsWrap}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabsScrollContent}
        >
          {TYPE_TABS.map(tab => {
            const isActive = activeFilter === tab.value;
            return (
              <TouchableOpacity
                key={tab.value}
                onPress={() => setActiveFilter(tab.value)}
                style={[styles.segTab, isActive && styles.segTabActive]}
                activeOpacity={0.85}
              >
                <Text style={[styles.segTabText, isActive && styles.segTabTextActive]}>
                  {tab.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* City filter — dropdown trigger button */}
      {activeFilter !== 'opensource' && (
        <View style={styles.cityRowWrap}>
          <TouchableOpacity
            style={[styles.cityDropdownBtn, selectedCity !== null && styles.cityDropdownBtnActive]}
            onPress={() => setCityPickerOpen(true)}
            activeOpacity={0.85}
          >
            <Ionicons
              name="chevron-down"
              size={14}
              color={selectedCity !== null ? Colors.text.white : Colors.primary.purple}
            />
            <Text style={[styles.cityDropdownText, selectedCity !== null && styles.cityDropdownTextActive]}>
              {selectedCity ?? 'كل المدن'}
            </Text>
            <Ionicons
              name="location-outline"
              size={14}
              color={selectedCity !== null ? Colors.text.white : Colors.primary.purple}
            />
          </TouchableOpacity>

          <CityPickerModal
            visible={cityPickerOpen}
            cities={SAUDI_CITIES}
            selectedCity={selectedCity}
            onSelect={(city) => { setSelectedCity(city); setCityPickerOpen(false); }}
            onClose={() => setCityPickerOpen(false)}
          />
        </View>
      )}

      <View style={styles.countRow}>
        <Text style={styles.countText}>ترتيب ↓</Text>
        <Text style={styles.countTitle}>{headerCountText}</Text>
      </View>

      {isLoading ? (
        <LoadingSpinner />
      ) : (
        <FlatList
          data={filteredOpportunities}
          keyExtractor={(item) => `${item.type}-${item.id}`}
          renderItem={({ item }) => (
            <OpportunityRichCard
              opportunity={item}
              onPress={() => navigateToDetail(item)}
              onBookmark={() => handleBookmark(item)}
              isBookmarked={bookmarkedIds.includes(item.id)}
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
            <View style={styles.emptyContainer}>
              <Ionicons name="search-outline" size={48} color={Colors.text.muted} />
              <Text style={styles.emptyTitle}>لا توجد فرص</Text>
              <Text style={styles.emptyHint}>جرّب فلتر آخر أو غيّر مصطلح البحث</Text>
            </View>
          }
        />
      )}
    </View>
  );
};

interface CardProps {
  opportunity: Opportunity;
  onPress: () => void;
  onBookmark: () => void;
  isBookmarked: boolean;
}

const TYPE_META: Record<OpportunityType, { label: string; color: string; bg: string; icon: string }> = {
  bootcamp:   { label: 'معسكر',     color: Colors.primary.purple,        bg: Colors.opportunity.hackathonLight, icon: 'rocket' },
  internship: { label: 'تدريب',     color: Colors.opportunity.internship, bg: '#DBEAFE',                         icon: 'briefcase' },
  opensource: { label: 'مفتوح المصدر', color: Colors.opportunity.opensource, bg: Colors.opportunity.opensourceLight, icon: 'logo-github' },
  volunteer:  { label: 'تطوع',      color: Colors.opportunity.volunteer,  bg: '#FEF3C7',                         icon: 'heart' },
};

const OpportunityRichCard: React.FC<CardProps> = ({ opportunity, onPress, onBookmark, isBookmarked }) => {
  const o = opportunity;
  const meta = TYPE_META[o.type];

  return (
    <TouchableOpacity activeOpacity={0.9} onPress={onPress} style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={[styles.cardTypeChip, { backgroundColor: meta.bg }]}>
          <Ionicons name={meta.icon as any} size={11} color={meta.color} />
          <Text style={[styles.cardTypeText, { color: meta.color }]}>{meta.label}</Text>
        </View>
        {o.id >= 0 && (
          <TouchableOpacity onPress={onBookmark} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Ionicons
              name={isBookmarked ? 'bookmark' : 'bookmark-outline'}
              size={20}
              color={isBookmarked ? Colors.primary.purple : Colors.text.muted}
            />
          </TouchableOpacity>
        )}
      </View>

      <Text style={styles.cardTitle} numberOfLines={2}>{o.title}</Text>
      {o.subtitle && (
        <Text style={styles.cardSubtitle} numberOfLines={1}>{o.subtitle}</Text>
      )}

      <View style={styles.cardMetaRow}>
        {o.type === 'bootcamp' && o.durationWeeks && (
          <MetaItem icon="time-outline" text={`${o.durationWeeks} أسبوع`} />
        )}
        {o.type === 'bootcamp' && o.startDate && (
          <MetaItem icon="calendar-outline" text={`يبدأ ${formatArDate(o.startDate)}`} />
        )}
        {o.type === 'bootcamp' && o.level === 'مغلق' && (
          <View style={styles.closedChip}>
            <Text style={styles.closedChipText}>مغلق التسجيل</Text>
          </View>
        )}
        {o.type === 'volunteer' && o.seats && (
          <MetaItem icon="people-outline" text={`${o.seats} مقعد`} />
        )}
        {o.type === 'volunteer' && o.endDate && (
          <MetaItem icon="hourglass-outline" text={`ينتهي ${formatArDate(o.endDate)}`} />
        )}
        {o.type === 'volunteer' && o.city && (
          <MetaItem icon="location-outline" text={String(o.city)} />
        )}
        {o.type === 'internship' && o.jobType && (
          <View style={[styles.jobTypeChip, { backgroundColor: '#DBEAFE' }]}>
            <Text style={styles.jobTypeText}>{o.jobType}</Text>
          </View>
        )}
        {o.type === 'internship' && o.city && (
          <MetaItem icon="location-outline" text={o.city} />
        )}
        {o.type === 'opensource' && o.stars !== undefined && (
          <MetaItem icon="star" text={formatNum(o.stars)} iconColor={Colors.xp.gold} />
        )}
        {o.type === 'opensource' && o.forks !== undefined && (
          <MetaItem icon="git-branch-outline" text={formatNum(o.forks)} />
        )}
        {o.type === 'opensource' && o.language && (
          <View style={styles.metaItem}>
            <View style={[styles.langDot, { backgroundColor: getLangColor(o.language) }]} />
            <Text style={styles.metaText}>{o.language}</Text>
          </View>
        )}
      </View>

      <View style={styles.cardFooter}>
        <View style={styles.xpReward}>
          <Ionicons name="star" size={11} color={Colors.xp.gold} />
          <Text style={styles.xpRewardText}>+{o.xpReward} XP</Text>
        </View>
        <View style={styles.viewDetailsRow}>
          <Text style={styles.viewDetailsText}>عرض التفاصيل</Text>
          <Ionicons name="chevron-back" size={14} color={Colors.primary.purple} />
        </View>
      </View>
    </TouchableOpacity>
  );
};

const MetaItem: React.FC<{ icon: string; text: string; iconColor?: string }> = ({ icon, text, iconColor }) => (
  <View style={styles.metaItem}>
    <Ionicons name={icon as any} size={13} color={iconColor ?? Colors.text.secondary} />
    <Text style={styles.metaText}>{text}</Text>
  </View>
);

function formatArDate(iso: string | null): string {
  if (!iso) return '';
  try {
    const d = new Date(iso);
    return d.toLocaleDateString('ar-SA', { day: 'numeric', month: 'short' });
  } catch { return iso; }
}
function formatNum(n: number | undefined): string {
  if (n === undefined) return '0';
  if (n >= 1000) return (n / 1000).toFixed(1) + 'k';
  return String(n);
}
function getLangColor(lang: string): string {
  const map: Record<string, string> = {
    JavaScript: '#F7DF1E', TypeScript: '#3178C6', Python: '#3776AB',
    Java: '#B07219', 'C++': '#F34B7D', C: '#555555', Go: '#00ADD8',
    Ruby: '#CC342D', PHP: '#777BB4', CSS: '#1572B6', HTML: '#E34F26',
    Dart: '#00B4AB', Markdown: '#083fa1', Clojure: '#5881D8',
  };
  return map[lang] ?? Colors.primary.purple;
}

// ─── City Picker Modal (bottom-sheet, same pattern as PickerSheet in EditProfileScreen) ───

interface CityPickerModalProps {
  visible: boolean;
  cities: string[];
  selectedCity: string | null;
  onSelect: (city: string | null) => void;
  onClose: () => void;
}

const CityPickerModal: React.FC<CityPickerModalProps> = ({
  visible, cities, selectedCity, onSelect, onClose,
}) => {
  const insets = useSafeAreaInsets();
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <TouchableOpacity style={pickerStyles.overlay} onPress={onClose} activeOpacity={1}>
        <View style={[pickerStyles.sheet, { paddingBottom: insets.bottom + 16 }]}>
          <View style={pickerStyles.handle} />
          <Text style={pickerStyles.title}>اختر المدينة</Text>
          <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 400 }}>
            <TouchableOpacity
              style={[pickerStyles.option, selectedCity === null && pickerStyles.optionSelected]}
              onPress={() => onSelect(null)}
              activeOpacity={0.7}
            >
              {selectedCity === null && (
                <Ionicons name="checkmark" size={20} color={Colors.primary.purple} />
              )}
              <Ionicons name="location-outline" size={16} color={selectedCity === null ? Colors.primary.purple : Colors.text.secondary} />
              <Text style={[pickerStyles.optionText, selectedCity === null && pickerStyles.optionTextSelected]}>
                كل المدن
              </Text>
            </TouchableOpacity>
            {cities.map(city => {
              const isSelected = selectedCity === city;
              return (
                <TouchableOpacity
                  key={city}
                  style={[pickerStyles.option, isSelected && pickerStyles.optionSelected]}
                  onPress={() => onSelect(city)}
                  activeOpacity={0.7}
                >
                  {isSelected && <Ionicons name="checkmark" size={20} color={Colors.primary.purple} />}
                  <Text style={[pickerStyles.optionText, isSelected && pickerStyles.optionTextSelected]}>
                    {city}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

const pickerStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: Colors.background.card,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 12,
    paddingHorizontal: 20,
  },
  handle: {
    width: 40, height: 4, borderRadius: 2,
    backgroundColor: Colors.ui.border,
    alignSelf: 'center',
    marginBottom: 16,
  },
  title: {
    fontFamily: Typography.fontFamily.bold,
    fontSize: Typography.fontSize.lg,
    color: Colors.text.primary,
    textAlign: 'right',
    marginBottom: 8,
  },
  option: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: Colors.ui.divider,
  },
  optionSelected: { backgroundColor: Colors.opportunity.hackathonLight, borderRadius: 10 },
  optionText: {
    flex: 1,
    fontFamily: Typography.fontFamily.medium,
    fontSize: Typography.fontSize.base,
    color: Colors.text.primary,
    textAlign: 'right',
  },
  optionTextSelected: { color: Colors.primary.purple, fontFamily: Typography.fontFamily.bold },
});

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background.app },
  hero: { paddingHorizontal: 20, paddingBottom: 20 },
  heroTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  heroTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  heroTitle: { fontFamily: Typography.fontFamily.bold, fontSize: Typography.fontSize.xl, color: Colors.text.white },
  searchBar: {
    flexDirection: 'row-reverse', alignItems: 'center', gap: 10,
    backgroundColor: Colors.background.card, borderRadius: 14, paddingHorizontal: 14, paddingVertical: 10,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 4, elevation: 2,
  },
  searchInput: {
    flex: 1, fontFamily: Typography.fontFamily.regular, fontSize: Typography.fontSize.sm,
    color: Colors.text.primary, padding: 0,
  },
  // Segmented-control tabs — single horizontally scrollable row
  tabsWrap: { paddingHorizontal: 20, paddingTop: 14 },
  tabsScrollContent: {
    flexDirection: 'row',
    backgroundColor: Colors.opportunity.hackathonLight,
    borderRadius: 16,
    padding: 5,
    gap: 0,
  },
  segTab: {
    paddingVertical: 9,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
  },
  segTabActive: {
    backgroundColor: Colors.background.card,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 4,
    elevation: 2,
  },
  segTabText: {
    fontFamily: Typography.fontFamily.semiBold,
    fontSize: Typography.fontSize.sm,
    color: Colors.primary.purple,
  },
  segTabTextActive: { color: Colors.primary.teal2 },

  // City filter — dropdown trigger
  cityRowWrap: { paddingHorizontal: 20, marginTop: 12 },
  cityDropdownBtn: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 8,
    alignSelf: 'flex-end',
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 20,
    backgroundColor: Colors.background.card,
    borderWidth: 1,
    borderColor: Colors.ui.border,
  },
  cityDropdownBtnActive: {
    backgroundColor: Colors.primary.purple,
    borderColor: Colors.primary.purple,
  },
  cityDropdownText: {
    fontFamily: Typography.fontFamily.semiBold,
    fontSize: Typography.fontSize.sm,
    color: Colors.primary.purple,
  },
  cityDropdownTextActive: { color: Colors.text.white },
  countRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20, paddingTop: 12, paddingBottom: 4,
  },
  countText: { fontFamily: Typography.fontFamily.medium, fontSize: Typography.fontSize.xs, color: Colors.text.muted },
  countTitle: { fontFamily: Typography.fontFamily.bold, fontSize: Typography.fontSize.base, color: Colors.text.primary },
  listContent: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 24 },
  card: {
    backgroundColor: Colors.background.card, borderRadius: 16, padding: 14, marginBottom: 10,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 6, elevation: 2,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  cardTypeChip: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingVertical: 4, paddingHorizontal: 10, borderRadius: 12 },
  cardTypeText: { fontFamily: Typography.fontFamily.semiBold, fontSize: 11 },
  cardTitle: { fontFamily: Typography.fontFamily.bold, fontSize: Typography.fontSize.base, color: Colors.text.primary, textAlign: 'right', marginBottom: 4 },
  cardSubtitle: { fontFamily: Typography.fontFamily.regular, fontSize: Typography.fontSize.sm, color: Colors.text.secondary, textAlign: 'right', marginBottom: 8 },
  cardMetaRow: { flexDirection: 'row-reverse', flexWrap: 'wrap', gap: 12, marginBottom: 8, marginTop: 2 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { fontFamily: Typography.fontFamily.regular, fontSize: Typography.fontSize.xs, color: Colors.text.secondary },
  langDot: { width: 9, height: 9, borderRadius: 5 },
  closedChip: { backgroundColor: '#FEE2E2', paddingVertical: 3, paddingHorizontal: 8, borderRadius: 10 },
  closedChipText: { fontFamily: Typography.fontFamily.semiBold, fontSize: 11, color: Colors.status.error },
  jobTypeChip: { paddingVertical: 3, paddingHorizontal: 8, borderRadius: 10 },
  jobTypeText: { fontFamily: Typography.fontFamily.medium, fontSize: 11, color: Colors.opportunity.internship },
  cardFooter: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginTop: 6, borderTopWidth: 1, borderTopColor: Colors.ui.divider, paddingTop: 8,
  },
  xpReward: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: Colors.xp.goldLight, borderRadius: 10, paddingVertical: 3, paddingHorizontal: 8,
  },
  xpRewardText: { fontFamily: Typography.fontFamily.bold, fontSize: 11, color: Colors.xp.bronze },
  viewDetailsRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  viewDetailsText: { fontFamily: Typography.fontFamily.semiBold, fontSize: Typography.fontSize.xs, color: Colors.primary.purple },
  emptyContainer: { alignItems: 'center', paddingVertical: 60, gap: 8 },
  emptyTitle: { fontFamily: Typography.fontFamily.bold, fontSize: Typography.fontSize.lg, color: Colors.text.secondary, marginTop: 8 },
  emptyHint: { fontFamily: Typography.fontFamily.regular, fontSize: Typography.fontSize.sm, color: Colors.text.muted },
});

export default OpportunityListScreen;
