import React, { ReactNode } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

import { Colors, Typography, Strings } from '../../../constants';

interface Props {
  /** Page index (0-based) for pagination dots. Screens 2/3/4 = 0/1/2 */
  index: 0 | 1 | 2;
  /** Color accent for the icon tile background gradient */
  accentGradient: readonly [string, string, ...string[]];
  /** Icon content rendered inside the tile (e.g. trophy, star, map emojis or Ionicons) */
  iconTile: ReactNode;
  /** Top-right floating badge */
  topBadge: ReactNode;
  /** Optional left-side extra badge (used on screens 3/4) */
  sideBadge?: ReactNode;
  /** Optional ring color around the icon tile (soft decorative ring) */
  ringColor?: string;

  title: string;
  titleBottom?: string;
  subtitle: string;

  /** Content rendered between subtitle and CTA bar (skill bars on screen 3) */
  extraContent?: ReactNode;

  /** Primary CTA handler (screens 2/3 = next, screen 4 = create account) */
  onPrimaryPress: () => void;
  primaryLabel: string;

  /** Secondary CTA handler (screens 2/3 = skip, screen 4 = login) */
  onSecondaryPress: () => void;
  secondaryLabel: string;

  /** If true, secondary CTA is rendered as a full white button below primary (screen 4 style) */
  stackedSecondary?: boolean;
}

const { width } = Dimensions.get('window');
const TILE_SIZE = Math.min(160, width * 0.44);

const IntroLayout: React.FC<Props> = ({
  index,
  accentGradient,
  iconTile,
  topBadge,
  sideBadge,
  ringColor,
  title,
  titleBottom,
  subtitle,
  extraContent,
  onPrimaryPress,
  primaryLabel,
  onSecondaryPress,
  secondaryLabel,
  stackedSecondary = false,
}) => {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />

      {/* Soft lavender background wash */}
      <LinearGradient
        colors={['#F8F3FD', '#F0EBF8']}
        start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      {/* Large decorative ring behind icon tile */}
      <View style={[styles.decorRing, { backgroundColor: (ringColor ?? 'rgba(143, 30, 174, 0.08)') }]} />
      <View style={[styles.decorRingInner, { backgroundColor: (ringColor ?? 'rgba(143, 30, 174, 0.12)') }]} />

      <View style={[styles.content, { paddingTop: insets.top + 36 }]}>
        {/* Icon tile zone */}
        <View style={styles.iconZone}>
          <LinearGradient
            colors={accentGradient}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
            style={styles.iconTile}
          >
            {iconTile}
          </LinearGradient>

          {/* Floating top badge */}
          <View style={styles.topBadgeWrap}>{topBadge}</View>

          {/* Floating side badge (optional) */}
          {sideBadge && <View style={styles.sideBadgeWrap}>{sideBadge}</View>}
        </View>

        {/* Pagination dots */}
        <View style={styles.dots}>
          {[0, 1, 2].map(i => (
            <View
              key={i}
              style={[
                styles.dot,
                i === index ? styles.dotActive : styles.dotInactive,
              ]}
            />
          ))}
        </View>

        {/* Title + subtitle */}
        <View style={styles.textBlock}>
          <Text style={styles.title}>{title}</Text>
          {titleBottom && <Text style={styles.title}>{titleBottom}</Text>}
          <Text style={styles.subtitle}>{subtitle}</Text>
        </View>

        {/* Extra content slot (skill bars on screen 3) */}
        {extraContent && <View style={styles.extraContent}>{extraContent}</View>}

        <View style={{ flex: 1 }} />

        {/* CTA bar */}
        <View style={[styles.ctaBar, { paddingBottom: insets.bottom + 20 }]}>
          {stackedSecondary ? (
            <>
              <TouchableOpacity
                activeOpacity={0.9}
                onPress={onPrimaryPress}
                style={styles.ctaWrapper}
              >
                <LinearGradient
                  colors={Colors.gradient.all}
                  start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                  style={styles.primaryButton}
                >
                  <Ionicons name="arrow-back" size={18} color={Colors.text.white} />
                  <Text style={styles.primaryText}>{primaryLabel}</Text>
                </LinearGradient>
              </TouchableOpacity>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={onSecondaryPress}
                style={styles.whiteButton}
              >
                <Text style={styles.whiteButtonText}>{secondaryLabel}</Text>
              </TouchableOpacity>
            </>
          ) : (
            <View style={styles.inlineRow}>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={onSecondaryPress}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Text style={styles.skipText}>{secondaryLabel}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                activeOpacity={0.9}
                onPress={onPrimaryPress}
                style={styles.ctaWrapperInline}
              >
                <LinearGradient
                  colors={Colors.gradient.all}
                  start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                  style={styles.primaryButton}
                >
                  <Ionicons name="arrow-back" size={18} color={Colors.text.white} />
                  <Text style={styles.primaryText}>{primaryLabel}</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background.app },
  decorRing: {
    position: 'absolute',
    top: 40, alignSelf: 'center',
    width: TILE_SIZE * 2.4, height: TILE_SIZE * 2.4,
    borderRadius: TILE_SIZE * 1.2,
    opacity: 0.9,
  },
  decorRingInner: {
    position: 'absolute',
    top: 70, alignSelf: 'center',
    width: TILE_SIZE * 1.8, height: TILE_SIZE * 1.8,
    borderRadius: TILE_SIZE * 0.9,
    opacity: 0.9,
  },
  content: { flex: 1, paddingHorizontal: 28, alignItems: 'center' },
  iconZone: {
    width: TILE_SIZE + 80, height: TILE_SIZE + 60,
    marginTop: 24, marginBottom: 20,
    alignItems: 'center', justifyContent: 'center',
  },
  iconTile: {
    width: TILE_SIZE, height: TILE_SIZE, borderRadius: 28,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: Colors.primary.purple,
    shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.22, shadowRadius: 20,
    elevation: 8,
  },
  topBadgeWrap: {
    position: 'absolute',
    top: 2, right: -8,
  },
  sideBadgeWrap: {
    position: 'absolute',
    bottom: 16, left: -12,
  },
  dots: {
    flexDirection: 'row', gap: 6,
    marginTop: 8, marginBottom: 18,
  },
  dot: { height: 6, borderRadius: 3 },
  dotActive: { width: 20, backgroundColor: Colors.primary.purple },
  dotInactive: { width: 6, backgroundColor: Colors.ui.border },
  textBlock: { alignItems: 'center', marginBottom: 14 },
  title: {
    fontFamily: Typography.fontFamily.bold,
    fontSize: Typography.fontSize['2xl'],
    color: Colors.text.primary,
    textAlign: 'center',
    lineHeight: Typography.fontSize['2xl'] * 1.35,
  },
  subtitle: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.fontSize.sm,
    color: Colors.text.secondary,
    textAlign: 'center',
    lineHeight: Typography.fontSize.sm * 1.7,
    marginTop: 12,
    paddingHorizontal: 10,
  },
  extraContent: { width: '100%', marginTop: 16 },
  ctaBar: { width: '100%', paddingTop: 12 },
  inlineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 14,
  },
  ctaWrapper: { width: '100%', marginBottom: 10 },
  ctaWrapperInline: { flex: 1 },
  primaryButton: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, paddingVertical: 15, borderRadius: 14,
    shadowColor: Colors.primary.purple,
    shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.25, shadowRadius: 12,
    elevation: 5,
  },
  primaryText: {
    fontFamily: Typography.fontFamily.semiBold,
    fontSize: Typography.fontSize.md,
    color: Colors.text.white,
  },
  skipText: {
    fontFamily: Typography.fontFamily.medium,
    fontSize: Typography.fontSize.sm,
    color: Colors.text.secondary,
    paddingHorizontal: 12,
  },
  whiteButton: {
    backgroundColor: Colors.background.card,
    paddingVertical: 14, borderRadius: 14,
    alignItems: 'center',
    borderWidth: 1.5, borderColor: Colors.ui.border,
  },
  whiteButtonText: {
    fontFamily: Typography.fontFamily.semiBold,
    fontSize: Typography.fontSize.md,
    color: Colors.text.primary,
  },
});

export default IntroLayout;
