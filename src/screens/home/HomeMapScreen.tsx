import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';

import { Colors, Typography, Strings } from '../../constants';
import { Opportunity, OpportunityType } from '../../types';
import { getOpportunitiesWithLocation } from '../../database/queries';
import { FilterChip } from '../../components/opportunity';
import { GradientHeader } from '../../components/common';

const TYPE_FILTERS: { label: string; value: OpportunityType | 'all' }[] = [
  { label: Strings.opportunities.filters.all, value: 'all' },
  { label: Strings.opportunities.types.hackathon, value: 'hackathon' },
  { label: Strings.opportunities.types.internship, value: 'internship' },
  { label: Strings.opportunities.types.opensource, value: 'opensource' },
  { label: Strings.opportunities.types.volunteer, value: 'volunteer' },
];

const HomeMapScreen: React.FC = () => {
  const navigation = useNavigation();
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [filter, setFilter] = useState<OpportunityType | 'all'>('all');
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [locationDenied, setLocationDenied] = useState(false);

  useEffect(() => {
    getOpportunitiesWithLocation().then(setOpportunities);

    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
        setUserLocation({ latitude: loc.coords.latitude, longitude: loc.coords.longitude });
      } else {
        setLocationDenied(true);
      }
    })();
  }, []);

  const filtered = filter === 'all' ? opportunities : opportunities.filter(o => o.type === filter);

  // Dynamic import to handle potential missing react-native-maps gracefully
  let MapView: any = null;
  let Marker: any = null;
  let Callout: any = null;
  try {
    const maps = require('react-native-maps');
    MapView = maps.default;
    Marker = maps.Marker;
    Callout = maps.Callout;
  } catch {
    // maps not available
  }

  const TYPE_COLORS: Record<string, string> = {
    hackathon: Colors.opportunity.hackathon,
    internship: Colors.opportunity.internship,
    opensource: Colors.opportunity.opensource,
    volunteer: Colors.opportunity.volunteer,
  };

  const initialRegion = userLocation
    ? { latitude: userLocation.latitude, longitude: userLocation.longitude, latitudeDelta: 0.5, longitudeDelta: 0.5 }
    : { latitude: 24.7136, longitude: 46.6753, latitudeDelta: 8, longitudeDelta: 8 };

  return (
    <View style={styles.container}>
      <GradientHeader
        title={Strings.home.mapTitle}
        showBack
        onBack={() => navigation.goBack()}
      />

      {/* Location denied banner */}
      {locationDenied && (
        <TouchableOpacity style={styles.locationBanner} onPress={() => Linking.openSettings()}>
          <Ionicons name="location-outline" size={16} color={Colors.status.warning} />
          <Text style={styles.locationBannerText}>
            {Strings.home.locationDenied}
          </Text>
          <Ionicons name="chevron-back-outline" size={16} color={Colors.status.warning} />
        </TouchableOpacity>
      )}

      {/* Filter chips */}
      <View style={styles.filterBar}>
        {TYPE_FILTERS.map(f => (
          <FilterChip
            key={f.value}
            label={f.label}
            isSelected={filter === f.value}
            onPress={() => setFilter(f.value)}
          />
        ))}
      </View>

      {MapView ? (
        <MapView
          style={styles.map}
          initialRegion={initialRegion}
          showsUserLocation={!!userLocation}
          showsMyLocationButton={!!userLocation}
        >
          {filtered.map(opp => (
            <Marker
              key={opp.id}
              coordinate={{ latitude: opp.latitude!, longitude: opp.longitude! }}
              pinColor={TYPE_COLORS[opp.type]}
            >
              {Callout && (
                <Callout>
                  <View style={styles.callout}>
                    <Text style={styles.calloutTitle}>{opp.title}</Text>
                    <Text style={styles.calloutOrg}>{opp.organization}</Text>
                  </View>
                </Callout>
              )}
            </Marker>
          ))}
        </MapView>
      ) : (
        <View style={styles.mapFallback}>
          <Ionicons name="map-outline" size={60} color={Colors.ui.border} />
          <Text style={styles.mapFallbackText}>{Strings.home.mapUnavailable}</Text>
          <Text style={styles.mapFallbackSub}>{filtered.length} {Strings.home.mapOpportunitiesInArea}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background.app },
  locationBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: Colors.status.warning + '18',
    paddingHorizontal: 16, paddingVertical: 10,
    borderBottomWidth: 1, borderBottomColor: Colors.status.warning + '44',
  },
  locationBannerText: {
    flex: 1,
    fontFamily: Typography.fontFamily.medium,
    fontSize: Typography.fontSize.sm,
    color: Colors.status.warning,
    textAlign: 'right',
  },
  filterBar: {
    flexDirection: 'row', paddingHorizontal: 12, paddingVertical: 10,
    backgroundColor: Colors.background.card,
    borderBottomWidth: 1, borderBottomColor: Colors.ui.border,
  },
  map: { flex: 1 },
  callout: { padding: 8, maxWidth: 180 },
  calloutTitle: { fontFamily: Typography.fontFamily.semiBold, fontSize: Typography.fontSize.sm, textAlign: 'right' },
  calloutOrg: { fontFamily: Typography.fontFamily.regular, fontSize: Typography.fontSize.xs, color: Colors.text.secondary, textAlign: 'right' },
  mapFallback: {
    flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12,
    backgroundColor: Colors.background.app,
  },
  mapFallbackText: {
    fontFamily: Typography.fontFamily.semiBold, fontSize: Typography.fontSize.lg,
    color: Colors.text.secondary,
  },
  mapFallbackSub: {
    fontFamily: Typography.fontFamily.regular, fontSize: Typography.fontSize.base,
    color: Colors.text.muted,
  },
});

export default HomeMapScreen;
