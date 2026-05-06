import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Linking,
  Animated,
  Easing,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as Haptics from 'expo-haptics';

import { Colors, Typography, Strings } from '../../constants';
import { QRPayload } from '../../types';
import { saveQRCheckIn } from '../../database/queries/qrQueries';
import { useAuth, useUser } from '../../context';
import { checkScanAchievements, checkLevelAchievements } from '../../utils/achievements';
import { getLevel } from '../../utils/levelCalc';
import { XP_VALUES } from '../../constants/xpValues';

const { width } = Dimensions.get('window');
const SCANNER_SIZE = width * 0.7;

const QRScannerScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const { userId } = useAuth();
  const { addXP, refreshUser, user } = useUser();

  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [scanResult, setScanResult] = useState<QRPayload | null>(null);
  const [flashOn, setFlashOn] = useState(false);
  const [newAchievements, setNewAchievements] = useState<string[]>([]);

  // Animated laser line
  const laserAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (permission?.granted && !scanned && !scanResult) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(laserAnim, {
            toValue: 1,
            duration: 2000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(laserAnim, {
            toValue: 0,
            duration: 2000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }, [permission?.granted, scanned, scanResult]);

  const handleBarcode = async ({ data }: { data: string }) => {
    if (scanned) return;
    setScanned(true);

    let payload: QRPayload;
    try {
      payload = JSON.parse(data) as QRPayload;
      if (!payload.xpReward) payload.xpReward = XP_VALUES.VOLUNTEER_SCAN;
      if (!payload.eventName) payload.eventName = 'فعالية';
    } catch {
      // Fallback: treat raw string as event name
      payload = {
        eventId: 'unknown',
        eventName: data.slice(0, 50),
        xpReward: XP_VALUES.VOLUNTEER_SCAN,
      };
    }

    setScanResult(payload);
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    if (userId) {
      await saveQRCheckIn(userId, payload.eventName, payload.xpReward, payload.opportunityId);
      await addXP(payload.xpReward);
      await refreshUser();

      // Check achievements
      const scanAchs = await checkScanAchievements(userId);
      const newXp = (user?.xp ?? 0) + payload.xpReward;
      const newLevel = getLevel(newXp);
      const levelAchs = await checkLevelAchievements(userId, newLevel);
      setNewAchievements([...scanAchs, ...levelAchs]);
    }
  };

  const handleReset = () => {
    setScanned(false);
    setScanResult(null);
    setNewAchievements([]);
  };

  // --- SUCCESS STATE ---
  if (scanResult) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <StatusBar style="light" />
        <LinearGradient
          colors={Colors.gradient.all}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.successScreen}
        >
          <View style={styles.pulseOuter}>
            <View style={styles.pulseInner}>
              <Ionicons name="checkmark-circle" size={90} color={Colors.text.white} />
            </View>
          </View>
          <Text style={styles.successTitle}>{Strings.qr.success}</Text>
          <Text style={styles.successEvent}>{scanResult.eventName}</Text>

          <View style={styles.xpEarnedBadge}>
            <Ionicons name="star" size={18} color={Colors.xp.gold} />
            <Text style={styles.xpEarnedText}>
              +{scanResult.xpReward} XP
            </Text>
          </View>

          {newAchievements.length > 0 && (
            <View style={styles.newAchievementBox}>
              <Ionicons name="trophy" size={22} color={Colors.xp.gold} />
              <Text style={styles.newAchievementText}>
                إنجاز جديد مفتوح! 🎉
              </Text>
            </View>
          )}

          <View style={styles.successActions}>
            <TouchableOpacity onPress={handleReset} style={styles.doneButton}>
              <Text style={styles.doneText}>{Strings.qr.done}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleReset} style={styles.scanAgainButton}>
              <Text style={styles.scanAgainText}>{Strings.qr.scanAgain}</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </View>
    );
  }

  // --- PERMISSION STATES ---
  if (!permission) {
    // Still loading permission state
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <LinearGradient colors={Colors.gradient.all} style={styles.qrHeader}>
          <Text style={styles.qrHeaderTitle}>{Strings.qr.title}</Text>
        </LinearGradient>
      </View>
    );
  }

  if (!permission.granted) {
    const denied = !permission.canAskAgain;

    return (
      <View style={[styles.container, styles.permissionContainer]}>
        <StatusBar style="light" />
        <LinearGradient
          colors={Colors.gradient.all}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.qrHeader, { paddingTop: insets.top + 16 }]}
        >
          <Text style={styles.qrHeaderTitle}>{Strings.qr.title}</Text>
        </LinearGradient>

        <View style={styles.permissionContent}>
          <View style={styles.permIconWrap}>
            <Ionicons
              name={denied ? 'close-circle' : 'camera'}
              size={56}
              color={denied ? Colors.status.error : Colors.primary.purple}
            />
          </View>

          <Text style={styles.permTitle}>
            {denied ? 'تعذّر الوصول إلى الكاميرا' : Strings.qr.permissionTitle}
          </Text>
          <Text style={styles.permMessage}>
            {denied ? Strings.qr.permissionDenied : Strings.qr.permissionMessage}
          </Text>

          <TouchableOpacity
            onPress={() => (denied ? Linking.openSettings() : requestPermission())}
            activeOpacity={0.9}
            style={{ width: '100%' }}
          >
            <LinearGradient
              colors={Colors.gradient.all}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.permButton}
            >
              <Text style={styles.permButtonTextWhite}>
                {denied ? 'فتح الإعدادات' : Strings.qr.requestPermission}
              </Text>
            </LinearGradient>
          </TouchableOpacity>

          {/* How to use */}
          <View style={styles.howToCard}>
            <Text style={styles.howToTitle}>{Strings.qr.howToUse}</Text>
            {Strings.qr.steps.map((step, i) => (
              <View key={i} style={styles.howToStep}>
                <View style={styles.howToNum}>
                  <Text style={styles.howToNumText}>{i + 1}</Text>
                </View>
                <Text style={styles.howToStepText}>{step}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>
    );
  }

  // --- SCANNING STATE ---
  const laserY = laserAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, SCANNER_SIZE - 4],
  });

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <CameraView
        style={StyleSheet.absoluteFill}
        facing="back"
        enableTorch={flashOn}
        barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
        onBarcodeScanned={handleBarcode}
      />

      {/* Dark overlay with cutout */}
      <View style={styles.overlay}>
        <View style={styles.overlayTop} />
        <View style={styles.overlayMiddle}>
          <View style={styles.overlaySide} />
          <View style={styles.scannerFrame}>
            {/* Corner brackets */}
            <View style={[styles.corner, styles.cornerTL]} />
            <View style={[styles.corner, styles.cornerTR]} />
            <View style={[styles.corner, styles.cornerBL]} />
            <View style={[styles.corner, styles.cornerBR]} />
            {/* Animated laser line */}
            <Animated.View
              style={[
                styles.laser,
                { transform: [{ translateY: laserY }] },
              ]}
            >
              <LinearGradient
                colors={['transparent', Colors.primary.teal3, 'transparent']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.laserGradient}
              />
            </Animated.View>
          </View>
          <View style={styles.overlaySide} />
        </View>
        <View style={styles.overlayBottom}>
          <Text style={styles.scanInstruction}>{Strings.qr.instruction}</Text>
        </View>
      </View>

      {/* Header */}
      <View style={[styles.scanHeader, { paddingTop: insets.top + 12 }]}>
        <Text style={styles.scanHeaderTitle}>{Strings.qr.title}</Text>
      </View>

      {/* Flash toggle */}
      <TouchableOpacity
        style={[styles.flashBtn, { bottom: insets.bottom + 40 }]}
        onPress={() => setFlashOn(f => !f)}
        activeOpacity={0.8}
      >
        <Ionicons
          name={flashOn ? 'flash' : 'flash-outline'}
          size={26}
          color={Colors.text.white}
        />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  qrHeader: { paddingHorizontal: 24, paddingTop: 20, paddingBottom: 24, alignItems: 'center' },
  qrHeaderTitle: { fontFamily: Typography.fontFamily.bold, fontSize: Typography.fontSize['2xl'], color: Colors.text.white },

  // Permission screen
  permissionContainer: { backgroundColor: Colors.background.app },
  permissionContent: { flex: 1, alignItems: 'center', paddingHorizontal: 28, paddingTop: 32, gap: 14 },
  permIconWrap: {
    width: 96, height: 96, borderRadius: 48,
    backgroundColor: Colors.opportunity.hackathonLight,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 6,
  },
  permTitle: { fontFamily: Typography.fontFamily.bold, fontSize: Typography.fontSize.xl, color: Colors.text.primary, textAlign: 'center' },
  permMessage: { fontFamily: Typography.fontFamily.regular, fontSize: Typography.fontSize.base, color: Colors.text.secondary, textAlign: 'center', lineHeight: 24, marginBottom: 4 },
  permButton: { borderRadius: 14, paddingVertical: 15, paddingHorizontal: 32, alignItems: 'center' },
  permButtonTextWhite: { fontFamily: Typography.fontFamily.semiBold, fontSize: Typography.fontSize.base, color: Colors.text.white },

  howToCard: {
    backgroundColor: Colors.background.card, borderRadius: 16, padding: 16,
    width: '100%', marginTop: 12, gap: 10,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2,
  },
  howToTitle: { fontFamily: Typography.fontFamily.semiBold, fontSize: Typography.fontSize.base, color: Colors.text.primary, textAlign: 'right' },
  howToStep: { flexDirection: 'row', alignItems: 'center', gap: 10, justifyContent: 'flex-end' },
  howToNum: { width: 26, height: 26, borderRadius: 13, backgroundColor: Colors.primary.purple, alignItems: 'center', justifyContent: 'center' },
  howToNumText: { fontFamily: Typography.fontFamily.bold, fontSize: Typography.fontSize.xs, color: Colors.text.white },
  howToStepText: { fontFamily: Typography.fontFamily.regular, fontSize: Typography.fontSize.sm, color: Colors.text.primary, textAlign: 'right', flex: 1 },

  // Camera overlay
  overlay: { ...StyleSheet.absoluteFillObject },
  overlayTop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.65)' },
  overlayMiddle: { flexDirection: 'row', height: SCANNER_SIZE },
  overlaySide: { flex: 1, backgroundColor: 'rgba(0,0,0,0.65)' },
  scannerFrame: { width: SCANNER_SIZE, height: SCANNER_SIZE, overflow: 'hidden' },
  corner: {
    position: 'absolute', width: 32, height: 32,
    borderColor: Colors.primary.teal3, borderWidth: 3,
  },
  cornerTL: { top: 0, left: 0, borderRightWidth: 0, borderBottomWidth: 0 },
  cornerTR: { top: 0, right: 0, borderLeftWidth: 0, borderBottomWidth: 0 },
  cornerBL: { bottom: 0, left: 0, borderRightWidth: 0, borderTopWidth: 0 },
  cornerBR: { bottom: 0, right: 0, borderLeftWidth: 0, borderTopWidth: 0 },
  laser: {
    position: 'absolute', left: 0, right: 0, height: 2,
  },
  laserGradient: { height: 2, width: '100%' },
  overlayBottom: { flex: 1, backgroundColor: 'rgba(0,0,0,0.65)', alignItems: 'center', paddingTop: 28 },
  scanInstruction: { fontFamily: Typography.fontFamily.medium, fontSize: Typography.fontSize.base, color: Colors.text.white, textAlign: 'center' },
  scanHeader: { position: 'absolute', top: 0, left: 0, right: 0, alignItems: 'center', paddingBottom: 12 },
  scanHeaderTitle: { fontFamily: Typography.fontFamily.bold, fontSize: Typography.fontSize.xl, color: Colors.text.white },
  flashBtn: {
    position: 'absolute', alignSelf: 'center',
    width: 54, height: 54, borderRadius: 27,
    backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)',
  },

  // Success screen
  successScreen: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 14, paddingHorizontal: 32 },
  pulseOuter: {
    width: 160, height: 160, borderRadius: 80,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  pulseInner: {
    width: 130, height: 130, borderRadius: 65,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  successTitle: { fontFamily: Typography.fontFamily.bold, fontSize: Typography.fontSize['2xl'], color: Colors.text.white, textAlign: 'center' },
  successEvent: { fontFamily: Typography.fontFamily.medium, fontSize: Typography.fontSize.lg, color: 'rgba(255,255,255,0.9)', textAlign: 'center' },
  xpEarnedBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: 'rgba(255,215,0,0.2)', paddingVertical: 10, paddingHorizontal: 24, borderRadius: 24,
    borderWidth: 1.5, borderColor: Colors.xp.gold,
  },
  xpEarnedText: { fontFamily: Typography.fontFamily.bold, fontSize: Typography.fontSize.lg, color: Colors.xp.gold },
  newAchievementBox: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: 'rgba(255,255,255,0.15)', paddingVertical: 10, paddingHorizontal: 20, borderRadius: 16,
    marginTop: 4,
  },
  newAchievementText: { fontFamily: Typography.fontFamily.semiBold, fontSize: Typography.fontSize.base, color: Colors.text.white },
  successActions: { width: '100%', gap: 10, marginTop: 16 },
  doneButton: { backgroundColor: Colors.text.white, borderRadius: 16, paddingVertical: 14, alignItems: 'center' },
  doneText: { fontFamily: Typography.fontFamily.semiBold, fontSize: Typography.fontSize.lg, color: Colors.primary.purple },
  scanAgainButton: { paddingVertical: 10, alignItems: 'center' },
  scanAgainText: { fontFamily: Typography.fontFamily.medium, fontSize: Typography.fontSize.base, color: 'rgba(255,255,255,0.85)' },
});

export default QRScannerScreen;
