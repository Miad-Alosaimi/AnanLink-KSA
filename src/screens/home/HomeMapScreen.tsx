import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import MapView, { Marker, Callout, PROVIDER_DEFAULT } from 'react-native-maps';
import * as Location from 'expo-location';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';

import { Colors, Typography, Strings } from '../../constants';
import { Opportunity, OpportunityType, HomeStackParamList } from '../../types';
import { getOpportunitiesWithLocation } from '../../database/queries';
import { FilterChip } from '../../components/opportunity';
import { GradientHeader } from '../../components/common';

type Nav = NativeStackNavigationProp<HomeStackParamList>;

const TYPE_FILTERS: { label: string; value: OpportunityType | 'all' }[] = [
  { label: Strings.opportunities.filters.all, value: 'all' },
  { label: Strings.opportunities.types.bootcamp, value: 'bootcamp' },
  { label: Strings.opportunities.types.internship, value: 'internship' },
  { label: Strings.opportunities.types.volunteer, value: 'volunteer' },
];

const TYPE_COLORS: Record<OpportunityType, string> = {
  bootcamp: Colors.opportunity.hackathon,
  internship: Colors.opportunity.internship,
  opensource: Colors.opportunity.opensource, // unused on map, kept for type completeness
  volunteer: Colors.opportunity.volunteer,
};

const HomeMapScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [filter, setFilter] = useState<OpportunityType | 'all'>('all');
  const [userLocation, setUserLocation] = useState<Location.LocationObject | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      // Request location permission
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        try {
          const loc = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Balanced,
          });
          setUserLocation(loc);
        } catch {
          // fall through — map still renders, just centered on Riyadh default
        }
      }
      // Load opportunities
      const opps = await getOpportunitiesWithLocation();
      setOpportunities(opps);
      setIsLoading(false);
    })();
  }, []);

  const filtered = (filter === 'all'
    ? opportunities
    : opportunities.filter(o => o.type === filter)
  ).filter(o => o.type !== 'opensource'); // never plot github repos on a map

  const initialRegion = userLocation
    ? {
        latitude: userLocation.coords.latitude,
        longitude: userLocation.coords.longitude,
        latitudeDelta: 0.3,
        longitudeDelta: 0.3,
      }
    : {
        latitude: 24.7136, // Riyadh
        longitude: 46.6753,
        latitudeDelta: 8,
        longitudeDelta: 8,
      };

  const handleMarkerPress = (opp: Opportunity) => {
    navigation.navigate('OpportunityDetail', { opportunityId: opp.id, type: opp.type });
  };

  return (
    <View style={styles.container}>
      <GradientHeader
        title={Strings.home.mapTitle}
        showBack
        onBack={() => navigation.goBack()}
      />

      {/* Filter chips */}
      <View style={styles.filterBarWrap}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterBar}
        >
          {TYPE_FILTERS.map(f => (
            <FilterChip
              key={f.value}
              label={f.label}
              isSelected={filter === f.value}
              onPress={() => setFilter(f.value)}
            />
          ))}
        </ScrollView>
      </View>

      {isLoading ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator color={Colors.primary.purple} size="large" />
        </View>
      ) : (
        <>
          <MapView
            provider={PROVIDER_DEFAULT}
            style={styles.map}
            initialRegion={initialRegion}
            showsUserLocation
            showsMyLocationButton
          >
            {filtered.map(opp => (
              <Marker
                key={opp.id}
                coordinate={{ latitude: opp.latitude!, longitude: opp.longitude! }}
                pinColor={TYPE_COLORS[opp.type]}
                onPress={() => {}}
              >
                <Callout onPress={() => handleMarkerPress(opp)} tooltip>
                  <View style={styles.callout}>
                    <View style={[styles.calloutDot, { backgroundColor: TYPE_COLORS[opp.type] }]} />
                    <Text style={styles.calloutTitle} numberOfLines={2}>{opp.title}</Text>
                    <Text style={styles.calloutOrg} numberOfLines={1}>{opp.organization}</Text>
                    <View style={styles.calloutCta}>
                      <Text style={styles.calloutCtaText}>عرض التفاصيل</Text>
                      <Ionicons name="chevron-back" size={12} color={Colors.primary.purple} />
                    </View>
                  </View>
                </Callout>
              </Marker>
            ))}
          </MapView>

          {/* Legend */}
          <View style={styles.legend}>
            <Text style={styles.legendTitle}>{filtered.length} فرصة</Text>
            <View style={styles.legendRow}>
              {(Object.keys(TYPE_COLORS) as OpportunityType[])
                .filter(type => type !== 'opensource')
                .map(type => (
                <View key={type} style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: TYPE_COLORS[type] }]} />
                  <Text style={styles.legendText}>{Strings.opportunities.types[type]}</Text>
                </View>
              ))}
            </View>
          </View>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background.app },
  filterBarWrap: {
    backgroundColor: Colors.background.card,
    borderBottomWidth: 1,
    borderBottomColor: Colors.ui.border,
  },
  filterBar: { paddingHorizontal: 12, paddingVertical: 10 },
  map: { flex: 1 },
  loadingWrap: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  callout: {
    backgroundColor: Colors.background.card,
    padding: 10, maxWidth: 200, borderRadius: 10,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.15, shadowRadius: 6,
  },
  calloutDot: { width: 8, height: 8, borderRadius: 4, marginBottom: 4 },
  calloutTitle: { fontFamily: Typography.fontFamily.semiBold, fontSize: Typography.fontSize.sm, textAlign: 'right', color: Colors.text.primary },
  calloutOrg: { fontFamily: Typography.fontFamily.regular, fontSize: Typography.fontSize.xs, color: Colors.text.secondary, textAlign: 'right', marginTop: 2 },
  calloutCta: { flexDirection: 'row', alignItems: 'center', gap: 4, justifyContent: 'flex-end', marginTop: 6 },
  calloutCtaText: { fontFamily: Typography.fontFamily.medium, fontSize: Typography.fontSize.xs, color: Colors.primary.purple },
  legend: {
    position: 'absolute', bottom: 16, left: 16, right: 16,
    backgroundColor: Colors.background.card, borderRadius: 14, padding: 12,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 4,
  },
  legendTitle: {
    fontFamily: Typography.fontFamily.semiBold, fontSize: Typography.fontSize.sm,
    color: Colors.text.primary, textAlign: 'right', marginBottom: 8,
  },
  legendRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, justifyContent: 'flex-end' },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendText: { fontFamily: Typography.fontFamily.regular, fontSize: Typography.fontSize.xs, color: Colors.text.secondary },
});

export default HomeMapScreen;
