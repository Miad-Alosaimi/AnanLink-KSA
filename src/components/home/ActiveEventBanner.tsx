import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

import { Colors, Typography } from '../../constants';
import { Opportunity } from '../../types';

interface Props {
  event: Opportunity;
  onPress?: () => void;
}

/** Calculates days until the deadline (inclusive). Returns 0 if today, negative if past. */
function daysUntil(dateStr: string | null): number | null {
  if (!dateStr) return null;
  const target = new Date(dateStr);
  const now = new Date();
  target.setHours(0, 0, 0, 0);
  now.setHours(0, 0, 0, 0);
  return Math.round((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

export const ActiveEventBanner: React.FC<Props> = ({ event, onPress }) => {
  const navigation = useNavigation<any>();
  const days = daysUntil(event.deadline);

  const timeLabel =
    days === null ? 'قريباً'
    : days === 0 ? 'اليوم'
    : days === 1 ? 'غداً'
    : `بعد ${days} ${days <= 10 ? 'أيام' : 'يوماً'}`;

  const isLive = days === 0;

  const handleScan = (e: any) => {
    e.stopPropagation();
    // Jump to QR tab
    navigation.getParent()?.navigate('QRTab');
  };

  return (
    <TouchableOpacity activeOpacity={0.9} onPress={onPress} style={styles.wrapper}>
      <LinearGradient
        colors={Colors.gradient.tealAll}
        start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
        style={styles.banner}
      >
        <View style={styles.accentCircle} />

        <View style={styles.content}>
          <View style={styles.topRow}>
            {isLive ? (
              <View style={styles.liveBadge}>
                <View style={styles.liveDot} />
                <Text style={styles.liveText}>مباشر</Text>
              </View>
            ) : (
              <View style={styles.timeBadge}>
                <Ionicons name="time-outline" size={12} color={Colors.text.white} />
                <Text style={styles.timeText}>{timeLabel}</Text>
              </View>
            )}
            <Text style={styles.kicker}>فعالية تطوعية قادمة</Text>
          </View>

          <Text style={styles.title} numberOfLines={2}>{event.title}</Text>
          <Text style={styles.location} numberOfLines={1}>
            <Ionicons name="location" size={11} color="rgba(255,255,255,0.85)" /> {event.location}
          </Text>

          <TouchableOpacity onPress={handleScan} style={styles.qrButton} activeOpacity={0.85}>
            <Ionicons name="qr-code" size={16} color={Colors.primary.teal2} />
            <Text style={styles.qrButtonText}>سجّل حضورك بـ QR</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  wrapper: { marginBottom: 16 },
  banner: {
    borderRadius: 18, padding: 16, overflow: 'hidden',
    shadowColor: Colors.primary.teal2, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25, shadowRadius: 10, elevation: 6,
  },
  accentCircle: {
    position: 'absolute', width: 140, height: 140, borderRadius: 70,
    backgroundColor: 'rgba(255,255,255,0.12)', top: -30, right: -30,
  },
  content: { gap: 6 },
  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 },
  liveBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: Colors.status.error, paddingVertical: 3, paddingHorizontal: 8, borderRadius: 10,
  },
  liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.text.white },
  liveText: { fontFamily: Typography.fontFamily.bold, fontSize: Typography.fontSize.xs, color: Colors.text.white, letterSpacing: 0.5 },
  timeBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: 'rgba(255,255,255,0.22)', paddingVertical: 3, paddingHorizontal: 8, borderRadius: 10,
  },
  timeText: { fontFamily: Typography.fontFamily.medium, fontSize: Typography.fontSize.xs, color: Colors.text.white },
  kicker: { fontFamily: Typography.fontFamily.medium, fontSize: Typography.fontSize.xs, color: 'rgba(255,255,255,0.9)' },
  title: { fontFamily: Typography.fontFamily.bold, fontSize: Typography.fontSize.lg, color: Colors.text.white, textAlign: 'right' },
  location: { fontFamily: Typography.fontFamily.regular, fontSize: Typography.fontSize.xs, color: 'rgba(255,255,255,0.88)', textAlign: 'right', marginBottom: 6 },
  qrButton: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    backgroundColor: Colors.text.white, paddingVertical: 10, borderRadius: 12, marginTop: 4,
  },
  qrButtonText: { fontFamily: Typography.fontFamily.semiBold, fontSize: Typography.fontSize.sm, color: Colors.primary.teal2 },
});
