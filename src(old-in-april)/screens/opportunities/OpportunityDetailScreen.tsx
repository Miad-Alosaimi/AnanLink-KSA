import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity, Linking, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

import { Colors, Typography, Strings } from '../../constants';
import { Opportunity, OpportunitiesStackParamList } from '../../types';
import { getOpportunityById } from '../../database/db';
import { Button, LoadingSpinner } from '../../components/common';

type Route = RouteProp<OpportunitiesStackParamList, 'OpportunityDetail'>;

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

const OpportunityDetailScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute<Route>();
  const insets = useSafeAreaInsets();
  const { opportunityId } = route.params;

  const [opportunity, setOpportunity] = useState<Opportunity | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getOpportunityById(opportunityId).then((data) => {
      setOpportunity(data);
      setIsLoading(false);
    });
  }, [opportunityId]);

  if (isLoading) return <LoadingSpinner />;
  if (!opportunity) return null;

  const color = TYPE_COLORS[opportunity.type];

  const handleRegister = () => {
    if (opportunity.registrationLink) {
      Linking.openURL(opportunity.registrationLink).catch(() =>
        Alert.alert('خطأ', 'تعذّر فتح الرابط')
      );
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 12, backgroundColor: color }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>
        <View style={[styles.typeChip, { backgroundColor: 'rgba(255,255,255,0.25)' }]}>
          <Text style={styles.typeChipText}>{TYPE_LABELS[opportunity.type]}</Text>
        </View>
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.titleSection}>
          <Text style={styles.title}>{opportunity.title}</Text>
          <Text style={styles.org}>{opportunity.organization}</Text>
        </View>

        {/* Meta Row */}
        <View style={styles.metaRow}>
          {opportunity.deadline ? (
            <View style={styles.metaItem}>
              <Ionicons name="calendar-outline" size={16} color={color} />
              <View>
                <Text style={styles.metaLabel}>{Strings.opportunities.details.deadline}</Text>
                <Text style={styles.metaValue}>{opportunity.deadline}</Text>
              </View>
            </View>
          ) : null}
          <View style={styles.metaItem}>
            <Ionicons name="location-outline" size={16} color={color} />
            <View>
              <Text style={styles.metaLabel}>{Strings.opportunities.details.location}</Text>
              <Text style={styles.metaValue}>{opportunity.location}</Text>
            </View>
          </View>
        </View>

        {/* Description */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{Strings.opportunities.details.about}</Text>
          <Text style={styles.description}>{opportunity.description}</Text>
        </View>

        <View style={styles.registerSection}>
          <Button
            title={Strings.opportunities.details.register}
            onPress={handleRegister}
          />
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background.app },
  header: {
    paddingHorizontal: 20, paddingBottom: 20,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
  },
  backBtn: { padding: 4 },
  typeChip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  typeChipText: { fontFamily: Typography.fontFamily.medium, fontSize: Typography.fontSize.sm, color: '#fff' },
  scroll: { flex: 1 },
  titleSection: { padding: 20, paddingBottom: 0 },
  title: { fontFamily: Typography.fontFamily.bold, fontSize: Typography.fontSize['2xl'], color: Colors.text.primary, textAlign: 'right', marginBottom: 6 },
  org: { fontFamily: Typography.fontFamily.medium, fontSize: Typography.fontSize.base, color: Colors.text.secondary, textAlign: 'right' },
  metaRow: {
    flexDirection: 'row', gap: 16, paddingHorizontal: 20, paddingVertical: 20,
    borderBottomWidth: 1, borderBottomColor: Colors.ui.divider,
  },
  metaItem: { flexDirection: 'row', gap: 8, alignItems: 'flex-start', flex: 1, justifyContent: 'flex-end' },
  metaLabel: { fontFamily: Typography.fontFamily.regular, fontSize: Typography.fontSize.xs, color: Colors.text.secondary, textAlign: 'right' },
  metaValue: { fontFamily: Typography.fontFamily.semiBold, fontSize: Typography.fontSize.sm, color: Colors.text.primary, textAlign: 'right' },
  section: { padding: 20 },
  sectionTitle: { fontFamily: Typography.fontFamily.bold, fontSize: Typography.fontSize.lg, color: Colors.text.primary, textAlign: 'right', marginBottom: 10 },
  description: { fontFamily: Typography.fontFamily.regular, fontSize: Typography.fontSize.base, color: Colors.text.secondary, textAlign: 'right', lineHeight: 26 },
  registerSection: { paddingHorizontal: 20, paddingBottom: 40 },
});

export default OpportunityDetailScreen;
