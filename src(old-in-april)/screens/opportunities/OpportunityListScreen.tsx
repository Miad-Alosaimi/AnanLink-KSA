import React, { useEffect, useState } from 'react';
import {
  View, Text, FlatList, StyleSheet, TouchableOpacity, ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

import { Colors, Typography, Strings } from '../../constants';
import { Opportunity, OpportunitiesStackParamList } from '../../types';
import { getAllOpportunities } from '../../database/db';
import { Card } from '../../components/common';

type Nav = NativeStackNavigationProp<OpportunitiesStackParamList>;

const TYPE_COLORS: Record<string, string> = {
  hackathon: Colors.opportunity.hackathon,
  internship: Colors.opportunity.internship,
  opensource: Colors.opportunity.opensource,
  volunteer: Colors.opportunity.volunteer,
};

const TYPE_LABELS: Record<string, string> = {
  hackathon: Strings.opportunities.types.hackathon,
  internship: Strings.opportunities.types.internship,
  opensource: Strings.opportunities.types.opensource,
  volunteer: Strings.opportunities.types.volunteer,
};

const TYPE_ICONS: Record<string, string> = {
  hackathon: 'rocket',
  internship: 'briefcase',
  opensource: 'code-slash',
  volunteer: 'heart',
};

const OpportunityListScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const insets = useSafeAreaInsets();
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getAllOpportunities().then((data) => {
      setOpportunities(data);
      setIsLoading(false);
    });
  }, []);

  const renderItem = ({ item }: { item: Opportunity }) => (
    <Card style={styles.card}>
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={() => navigation.navigate('OpportunityDetail', { opportunityId: item.id, type: item.type })}
      >
        <View style={styles.cardTop}>
          <View style={[styles.typeTag, { backgroundColor: TYPE_COLORS[item.type] + '20' }]}>
            <Ionicons name={TYPE_ICONS[item.type] as any} size={12} color={TYPE_COLORS[item.type]} />
            <Text style={[styles.typeTagText, { color: TYPE_COLORS[item.type] }]}>{TYPE_LABELS[item.type]}</Text>
          </View>
          {item.deadline ? (
            <View style={styles.deadlineTag}>
              <Ionicons name="calendar-outline" size={12} color={Colors.text.secondary} />
              <Text style={styles.deadlineText}>{item.deadline}</Text>
            </View>
          ) : null}
        </View>

        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.org}>{item.organization}</Text>
        <Text style={styles.desc} numberOfLines={2}>{item.description}</Text>

        <View style={styles.footer}>
          <View style={styles.locationRow}>
            <Ionicons name="location-outline" size={13} color={Colors.text.secondary} />
            <Text style={styles.locationText}>{item.location}</Text>
          </View>
          <Ionicons name="chevron-back" size={16} color={Colors.primary.purple} />
        </View>
      </TouchableOpacity>
    </Card>
  );

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <Text style={styles.headerTitle}>{Strings.opportunities.title}</Text>
      </View>

      {isLoading ? (
        <ActivityIndicator style={styles.loader} size="large" color={Colors.primary.purple} />
      ) : (
        <FlatList
          data={opportunities}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons name="search" size={48} color={Colors.ui.disabled} />
              <Text style={styles.emptyTitle}>{Strings.opportunities.empty.title}</Text>
              <Text style={styles.emptyMsg}>{Strings.opportunities.empty.message}</Text>
            </View>
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background.app },
  header: {
    backgroundColor: Colors.primary.purple, paddingHorizontal: 20, paddingBottom: 20,
  },
  headerTitle: { fontFamily: Typography.fontFamily.bold, fontSize: Typography.fontSize.xl, color: '#fff', textAlign: 'right' },
  loader: { flex: 1 },
  list: { padding: 20, paddingBottom: 32 },
  card: { marginBottom: 14 },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  typeTag: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8 },
  typeTagText: { fontFamily: Typography.fontFamily.medium, fontSize: Typography.fontSize.xs },
  deadlineTag: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  deadlineText: { fontFamily: Typography.fontFamily.regular, fontSize: Typography.fontSize.xs, color: Colors.text.secondary },
  title: { fontFamily: Typography.fontFamily.bold, fontSize: Typography.fontSize.base, color: Colors.text.primary, textAlign: 'right', marginBottom: 4 },
  org: { fontFamily: Typography.fontFamily.medium, fontSize: Typography.fontSize.sm, color: Colors.primary.purple, textAlign: 'right', marginBottom: 8 },
  desc: { fontFamily: Typography.fontFamily.regular, fontSize: Typography.fontSize.sm, color: Colors.text.secondary, textAlign: 'right', lineHeight: 20, marginBottom: 12 },
  footer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  locationText: { fontFamily: Typography.fontFamily.regular, fontSize: Typography.fontSize.xs, color: Colors.text.secondary },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 80, gap: 12 },
  emptyTitle: { fontFamily: Typography.fontFamily.semiBold, fontSize: Typography.fontSize.lg, color: Colors.text.primary },
  emptyMsg: { fontFamily: Typography.fontFamily.regular, fontSize: Typography.fontSize.base, color: Colors.text.secondary, textAlign: 'center' },
});

export default OpportunityListScreen;
