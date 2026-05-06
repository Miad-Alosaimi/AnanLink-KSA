import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography } from '../../constants';
import { Opportunity, OpportunityType } from '../../types';
import { Strings } from '../../constants/strings';

interface OpportunityCardProps {
  opportunity: Opportunity;
  onPress: () => void;
  onBookmark?: () => void;
  isBookmarked?: boolean;
  compact?: boolean;
}

const TYPE_CONFIG: Record<
  OpportunityType,
  { color: string; lightColor: string; icon: string; label: string }
> = {
  bootcamp: {
    color: Colors.opportunity.hackathon,
    lightColor: Colors.opportunity.hackathonLight,
    icon: 'rocket-outline',
    label: Strings.opportunities.types.bootcamp,
  },
  internship: {
    color: Colors.opportunity.internship,
    lightColor: Colors.opportunity.internshipLight,
    icon: 'briefcase-outline',
    label: Strings.opportunities.types.internship,
  },
  opensource: {
    color: Colors.opportunity.opensource,
    lightColor: Colors.opportunity.opensourceLight,
    icon: 'code-slash-outline',
    label: Strings.opportunities.types.opensource,
  },
  volunteer: {
    color: Colors.opportunity.volunteer,
    lightColor: Colors.opportunity.volunteerLight,
    icon: 'heart-outline',
    label: Strings.opportunities.types.volunteer,
  },
};

const OpportunityCard: React.FC<OpportunityCardProps> = ({
  opportunity,
  onPress,
  onBookmark,
  isBookmarked = false,
  compact = false,
}) => {
  const config = TYPE_CONFIG[opportunity.type] ?? TYPE_CONFIG.bootcamp;

  const formatDeadline = (deadline: string | null) => {
    if (!deadline) return null;
    const date = new Date(deadline);
    const now = new Date();
    const diffDays = Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return null;
    if (diffDays === 0) return 'اليوم';
    if (diffDays === 1) return 'غداً';
    if (diffDays <= 7) return `${diffDays} أيام`;
    return date.toLocaleDateString('ar-SA', { month: 'short', day: 'numeric' });
  };

  const deadlineText = formatDeadline(opportunity.deadline);

  if (compact) {
    return (
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.9}
        style={[styles.compactCard, { borderLeftColor: config.color }]}
      >
        <View style={[styles.compactIcon, { backgroundColor: config.lightColor }]}>
          <Ionicons name={config.icon as any} size={18} color={config.color} />
        </View>
        <View style={styles.compactContent}>
          <Text style={styles.compactTitle} numberOfLines={1}>{opportunity.title}</Text>
          <Text style={styles.compactOrg} numberOfLines={1}>{opportunity.organization}</Text>
        </View>
        {deadlineText && (
          <View style={[styles.deadlineBadge, { backgroundColor: config.lightColor }]}>
            <Text style={[styles.deadlineText, { color: config.color }]}>{deadlineText}</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.9}
      style={[styles.card, { borderRightColor: config.color }]}
    >
      <View style={styles.topRow}>
        <View style={[styles.iconCircle, { backgroundColor: config.lightColor }]}>
          <Ionicons name={config.icon as any} size={22} color={config.color} />
        </View>
        <View style={styles.titleSection}>
          <Text style={styles.title} numberOfLines={2}>{opportunity.title}</Text>
          <Text style={styles.organization} numberOfLines={1}>{opportunity.organization}</Text>
        </View>
        {onBookmark && (
          <TouchableOpacity
            onPress={onBookmark}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons
              name={isBookmarked ? 'bookmark' : 'bookmark-outline'}
              size={20}
              color={isBookmarked ? Colors.primary.purple : Colors.text.secondary}
            />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.locationRow}>
        <Ionicons name="location-outline" size={13} color={Colors.text.secondary} />
        <Text style={styles.location} numberOfLines={1}>{opportunity.location}</Text>
      </View>

      <View style={styles.bottomRow}>
        <View style={styles.badgesRow}>
          <View style={[styles.typeBadge, { backgroundColor: config.lightColor }]}>
            <Text style={[styles.typeBadgeText, { color: config.color }]}>{config.label}</Text>
          </View>
          {deadlineText && (
            <View style={styles.deadlineChip}>
              <Ionicons name="time-outline" size={11} color={Colors.text.secondary} />
              <Text style={styles.deadlineChipText}>{deadlineText}</Text>
            </View>
          )}
        </View>
        <View style={styles.xpBadge}>
          <Ionicons name="star" size={11} color={Colors.xp.gold} />
          <Text style={styles.xpText}>{opportunity.xpReward} XP</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.background.card,
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    borderRightWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
    gap: 10,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleSection: {
    flex: 1,
  },
  title: {
    fontFamily: Typography.fontFamily.semiBold,
    fontSize: Typography.fontSize.base,
    color: Colors.text.primary,
    textAlign: 'right',
    marginBottom: 2,
  },
  organization: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.fontSize.sm,
    color: Colors.text.secondary,
    textAlign: 'right',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: 4,
    justifyContent: 'flex-end',
  },
  location: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.fontSize.xs,
    color: Colors.text.secondary,
    textAlign: 'right',
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  badgesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  typeBadge: {
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  typeBadgeText: {
    fontFamily: Typography.fontFamily.medium,
    fontSize: Typography.fontSize.xs,
  },
  deadlineChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  deadlineChipText: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.fontSize.xs,
    color: Colors.text.secondary,
  },
  xpBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.xp.goldLight,
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 6,
    gap: 3,
  },
  xpText: {
    fontFamily: Typography.fontFamily.semiBold,
    fontSize: Typography.fontSize.xs,
    color: Colors.xp.gold,
  },
  // Compact variant
  compactCard: {
    backgroundColor: Colors.background.card,
    borderRadius: 12,
    padding: 12,
    marginRight: 12,
    borderLeftWidth: 3,
    flexDirection: 'row',
    alignItems: 'center',
    width: 220,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    gap: 10,
  },
  compactIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  compactContent: {
    flex: 1,
  },
  compactTitle: {
    fontFamily: Typography.fontFamily.semiBold,
    fontSize: Typography.fontSize.sm,
    color: Colors.text.primary,
    textAlign: 'right',
    marginBottom: 2,
  },
  compactOrg: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.fontSize.xs,
    color: Colors.text.secondary,
    textAlign: 'right',
  },
  deadlineBadge: {
    paddingVertical: 3,
    paddingHorizontal: 7,
    borderRadius: 8,
  },
  deadlineText: {
    fontFamily: Typography.fontFamily.medium,
    fontSize: Typography.fontSize.xs,
  },
});

export default OpportunityCard;
