import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';

import IntroLayout from './_shared/IntroLayout';
import { Colors, Typography, Strings } from '../../constants';
import { RootStackParamList } from '../../types';

type Nav = NativeStackNavigationProp<RootStackParamList>;

const IntroScreen4: React.FC = () => {
  const navigation = useNavigation<Nav>();

  const finish = async () => {
    await AsyncStorage.setItem('@ananlink_hasSeenOnboarding', 'true');
    navigation.reset({ index: 0, routes: [{ name: 'Auth' as any }] });
  };

  const handleCreateAccount = async () => {
    await AsyncStorage.setItem('@ananlink_hasSeenOnboarding', 'true');
    navigation.reset({
      index: 0,
      routes: [{ name: 'Auth' as any, params: { initialRoute: 'RegisterStep1' } }],
    });
  };

  return (
    <IntroLayout
      index={2}
      accentGradient={[Colors.primary.purpleMid, Colors.primary.teal]}
      ringColor="rgba(111, 203, 255, 0.12)"
      iconTile={<Text style={styles.mapEmoji}>🗺️</Text>}
      topBadge={
        <View style={styles.eventChip}>
          <Ionicons name="location" size={11} color={Colors.status.error} />
          <Text style={styles.eventChipText}>{Strings.intro.screen4.badge}</Text>
        </View>
      }
      sideBadge={
        <View style={styles.qrChip}>
          <Ionicons name="qr-code" size={11} color={Colors.primary.purple} />
          <Text style={styles.qrChipText}>{Strings.intro.screen4.subBadge}</Text>
        </View>
      }
      title={Strings.intro.screen4.title}
      titleBottom={Strings.intro.screen4.titleBottom}
      subtitle={Strings.intro.screen4.subtitle}
      primaryLabel={Strings.intro.screen4.createAccount}
      secondaryLabel={Strings.intro.screen4.hasAccount}
      onPrimaryPress={handleCreateAccount}
      onSecondaryPress={finish}
      stackedSecondary
    />
  );
};

const styles = StyleSheet.create({
  mapEmoji: { fontSize: 62 },
  eventChip: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: Colors.text.white, borderRadius: 16,
    paddingVertical: 6, paddingHorizontal: 12,
    shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.12, shadowRadius: 6,
    elevation: 3,
  },
  eventChipText: {
    fontFamily: Typography.fontFamily.semiBold, fontSize: 11,
    color: Colors.text.primary,
  },
  qrChip: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: Colors.text.white, borderRadius: 14,
    paddingVertical: 6, paddingHorizontal: 10,
    shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.12, shadowRadius: 6,
    elevation: 3,
  },
  qrChipText: {
    fontFamily: Typography.fontFamily.medium, fontSize: 10,
    color: Colors.text.secondary,
  },
});

export default IntroScreen4;
