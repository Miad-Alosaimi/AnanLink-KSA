import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

import { Colors, Typography, Strings, SkillTrack, XP_PER_UNIT } from '../../constants';

interface Props {
  track: SkillTrack;
  /** How many units in this track the user has completed. */
  completed: number;
  /** Whether this track is unlocked for the user. */
  unlocked: boolean;
  onPress?: () => void;
  detailed?: boolean;
}

/**
 * Profile-style skill track card.
 * Takes per-user progress as props (no longer baked into the track data).
 */
export const SkillTrackCard: React.FC<Props> = ({
  track,
  completed,
  unlocked,
  onPress,
  detailed = true,
}) => {
  const total = track.units.length;
  const progress = total > 0 ? completed / total : 0;
  const progressPercent = Math.round(progress * 100);
  const isCompleted = total > 0 && completed === total;
  const isActive = completed > 0 && completed < total;
  const locked = !unlocked;

  // Status chip
  let statusColor = Colors.text.secondary;
  let statusBg = Colors.ui.divider;
  let statusLabel: string = Strings.profile.locked;
  if (locked) {
    statusColor = Colors.text.muted;
    statusBg = Colors.ui.divider;
    statusLabel = Strings.profile.locked;
  } else if (isCompleted) {
    statusColor = Colors.status.success;
    statusBg = Colors.opportunity.opensourceLight;
    statusLabel = Strings.profile.completed;
  } else if (isActive) {
    statusColor = Colors.status.success;
    statusBg = Colors.opportunity.opensourceLight;
    statusLabel = Strings.profile.active;
  }

  // XP remaining for this track
  const xpRemaining = (total - completed) * XP_PER_UNIT;

  return (
    <TouchableOpacity
      onPress={locked ? undefined : onPress}
      activeOpacity={locked ? 1 : 0.9}
      style={[styles.card, locked && styles.cardLocked]}
    >
      {/* Top row: progress% | title | icon tile */}
      <View style={styles.topRow}>
        {!locked && (
          <Text style={[styles.progressPercent, { color: track.gradient[0] }]}>
            {progressPercent}%
          </Text>
        )}
        {locked && (
          <View style={styles.lockIconWrap}>
            <Ionicons name="lock-closed" size={18} color={Colors.text.muted} />
          </View>
        )}

        <View style={styles.titleBlock}>
          <Text style={[styles.title, locked && styles.titleLocked]}>{track.title}</Text>
          <Text style={[styles.tech, locked && styles.techLocked]}>
            {locked
              ? (track.prerequisite
                  ? `مقفل — أكمل ${track.prerequisite.unitsRequired} وحدات أولاً`
                  : 'مقفل — أكمل مسار آخر')
              : `${track.tech} · ${total} وحدة`}
          </Text>
        </View>

        <LinearGradient
          colors={track.gradient}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
          style={[styles.iconTile, locked && styles.iconTileLocked]}
        >
          <Text style={[styles.iconEmoji, locked && { opacity: 0.4 }]}>{track.icon}</Text>
        </LinearGradient>
      </View>

      {detailed && !locked && (
        <>
          <View style={styles.progressTrack}>
            <LinearGradient
              colors={track.gradient}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
              style={[styles.progressFill, { width: `${progressPercent}%` }]}
            />
          </View>

          <View style={styles.bottomMetaRow}>
            <View style={styles.xpChip}>
              <Text style={styles.xpChipText}>+{xpRemaining} XP</Text>
              <Text style={styles.metaLabel}>متبقي</Text>
            </View>
            <Text style={styles.unitsText}>
              {completed} {Strings.profile.unitsOf} {total} {Strings.profile.unitsSingular}
            </Text>
          </View>

          {(track.tags || isActive || isCompleted) && (
            <View style={styles.tagsRow}>
              {track.tags?.slice(0, 3).map(tag => (
                <View key={tag} style={styles.techTag}>
                  <Text style={styles.techTagText}>{tag}</Text>
                </View>
              ))}
              {(isActive || isCompleted) && (
                <View style={[styles.statusChip, { backgroundColor: statusBg }]}>
                  <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
                  <Text style={[styles.statusLabel, { color: statusColor }]}>{statusLabel}</Text>
                </View>
              )}
            </View>
          )}
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.background.card,
    borderRadius: 16, padding: 14,
    marginBottom: 10,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8,
    elevation: 2,
  },
  cardLocked: { backgroundColor: Colors.ui.divider + '88' },
  topRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  progressPercent: {
    fontFamily: Typography.fontFamily.bold,
    fontSize: Typography.fontSize.lg,
    minWidth: 50,
  },
  lockIconWrap: { width: 50, alignItems: 'center' },
  titleBlock: { flex: 1 },
  title: {
    fontFamily: Typography.fontFamily.bold,
    fontSize: Typography.fontSize.base,
    color: Colors.text.primary,
    textAlign: 'right',
  },
  titleLocked: { color: Colors.text.muted },
  tech: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.fontSize.xs,
    color: Colors.text.secondary,
    textAlign: 'right',
    marginTop: 2,
  },
  techLocked: { color: Colors.text.muted },
  iconTile: {
    width: 48, height: 48, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center',
  },
  iconTileLocked: { opacity: 0.4 },
  iconEmoji: { fontSize: 24 },
  progressTrack: {
    height: 6, backgroundColor: Colors.ui.border, borderRadius: 3,
    overflow: 'hidden', marginTop: 12,
  },
  progressFill: { height: '100%', borderRadius: 3 },
  bottomMetaRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    marginTop: 8,
  },
  xpChip: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  xpChipText: {
    fontFamily: Typography.fontFamily.semiBold, fontSize: Typography.fontSize.xs,
    color: Colors.text.primary,
  },
  metaLabel: {
    fontFamily: Typography.fontFamily.regular, fontSize: 10,
    color: Colors.text.secondary,
  },
  unitsText: {
    fontFamily: Typography.fontFamily.regular, fontSize: Typography.fontSize.xs,
    color: Colors.text.secondary,
  },
  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 10 },
  techTag: {
    backgroundColor: Colors.opportunity.hackathonLight,
    paddingVertical: 3, paddingHorizontal: 10, borderRadius: 12,
  },
  techTagText: {
    fontFamily: Typography.fontFamily.medium, fontSize: 11,
    color: Colors.primary.purple,
  },
  statusChip: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingVertical: 3, paddingHorizontal: 8, borderRadius: 10,
    marginRight: 'auto',
  },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  statusLabel: {
    fontFamily: Typography.fontFamily.medium, fontSize: 11,
  },
});

export default SkillTrackCard;
