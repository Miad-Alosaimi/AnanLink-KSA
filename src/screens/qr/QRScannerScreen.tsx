import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

import { Colors, Typography, Strings } from '../../constants';
import { QRPayload } from '../../types';
import { saveScanLog } from '../../database/queries/qrQueries';
import { useAuth, useUser } from '../../context';
import * as Haptics from 'expo-haptics';

const { width } = Dimensions.get('window');
const SCANNER_SIZE = width * 0.7;

const QRScannerScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const { userId } = useAuth();
  const { addXP } = useUser();

  const [permission, setPermission] = useState<'granted' | 'denied' | 'undetermined'>('undetermined');
  const [scanned, setScanned] = useState(false);
  const [scanResult, setScanResult] = useState<QRPayload | null>(null);

  // Try to load camera
  let CameraView: any = null;
  let useCameraPermissions: any = null;
  try {
    const cam = require('expo-camera');
    CameraView = cam.CameraView;
    useCameraPermissions = cam.useCameraPermissions;
  } catch {
    // camera not available
  }

  const [camPermission, requestPermission] = useCameraPermissions ? useCameraPermissions() : [null, async () => {}];

  useEffect(() => {
    if (camPermission) {
      if (camPermission.granted) setPermission('granted');
      else if (camPermission.canAskAgain === false) setPermission('denied');
    }
  }, [camPermission]);

  const handleRequest = async () => {
    const result = await requestPermission();
    if (result?.granted) setPermission('granted');
    else setPermission('denied');
  };

  const handleBarcode = async ({ data }: { data: string }) => {
    if (scanned) return;
    setScanned(true);

    let payload: QRPayload;
    try {
      payload = JSON.parse(data) as QRPayload;
    } catch {
      // Raw text QR — treat as event name
      payload = { eventId: 'unknown', eventName: data.slice(0, 50), xpReward: 30 };
    }

    setScanResult(payload);
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    if (userId) {
      await saveScanLog({
        userId,
        eventId: payload.eventId,
        eventTitle: payload.eventName,
        eventType: payload.eventType ?? 'event',
        xpEarned: payload.xpReward,
        rawQrData: data,
      });
      await addXP(payload.xpReward);
    }
  };

  const handleReset = () => {
    setScanned(false);
    setScanResult(null);
  };

  // Success screen
  if (scanResult) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <StatusBar style="light" />
        <LinearGradient colors={[Colors.gradient.start, Colors.gradient.end]} style={styles.successScreen}>
          <View style={styles.successIcon}>
            <Ionicons name="checkmark-circle" size={90} color={Colors.text.white} />
          </View>
          <Text style={styles.successTitle}>{Strings.qr.success}</Text>
          <Text style={styles.successEvent}>{scanResult.eventName}</Text>
          <View style={styles.xpEarnedBadge}>
            <Ionicons name="star" size={18} color={Colors.xp.gold} />
            <Text style={styles.xpEarnedText}>
              {Strings.qr.xpEarned} {scanResult.xpReward} {Strings.qr.xpUnit}
            </Text>
          </View>
          <TouchableOpacity onPress={handleReset} style={styles.doneButton}>
            <Text style={styles.doneText}>{Strings.qr.done}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleReset}>
            <Text style={styles.scanAgainText}>{Strings.qr.scanAgain}</Text>
          </TouchableOpacity>
        </LinearGradient>
      </View>
    );
  }

  // Permission screens
  if (!CameraView || permission !== 'granted') {
    return (
      <View style={[styles.container, styles.permissionContainer, { paddingTop: insets.top }]}>
        <StatusBar style="dark" />
        <LinearGradient
          colors={[Colors.gradient.start, Colors.gradient.end]}
          style={styles.qrHeader}
        >
          <Text style={styles.qrHeaderTitle}>{Strings.qr.title}</Text>
        </LinearGradient>

        <View style={styles.permissionContent}>
          {permission === 'denied' ? (
            <>
              <Ionicons name="camera-outline" size={70} color={Colors.ui.border} />
              <Text style={styles.permTitle}>{Strings.qr.permissionTitle}</Text>
              <Text style={styles.permMessage}>{Strings.qr.permissionDenied}</Text>
              <TouchableOpacity onPress={() => Linking.openSettings()} style={styles.permButton}>
                <Text style={styles.permButtonText}>{Strings.qr.openSettings}</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <Ionicons name="qr-code-outline" size={70} color={Colors.primary.purple} />
              <Text style={styles.permTitle}>{Strings.qr.permissionTitle}</Text>
              <Text style={styles.permMessage}>{Strings.qr.permissionMessage}</Text>
              <TouchableOpacity onPress={handleRequest} activeOpacity={0.9}>
                <LinearGradient
                  colors={[Colors.gradient.start, Colors.gradient.end]}
                  start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                  style={styles.permButton}
                >
                  <Text style={styles.permButtonTextWhite}>{Strings.qr.requestPermission}</Text>
                </LinearGradient>
              </TouchableOpacity>
            </>
          )}

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

  // Camera scanner
  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar style="light" />
      {CameraView && (
        <CameraView
          style={StyleSheet.absoluteFill}
          facing="back"
          barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
          onBarcodeScanned={handleBarcode}
        />
      )}

      {/* Dark overlay with cutout effect */}
      <View style={styles.overlay}>
        <View style={styles.overlayTop} />
        <View style={styles.overlayMiddle}>
          <View style={styles.overlaySide} />
          <View style={styles.scannerFrame}>
            {/* Corner markers */}
            {[['topLeft', 0, 0, undefined, undefined], ['topRight', 0, undefined, 0, undefined], ['bottomLeft', undefined, 0, undefined, 0], ['bottomRight', undefined, undefined, 0, 0]].map(([name, t, l, b, r]) => (
              <View key={name as string} style={[styles.corner, { top: t as any, left: l as any, bottom: b as any, right: r as any }]} />
            ))}
          </View>
          <View style={styles.overlaySide} />
        </View>
        <View style={styles.overlayBottom}>
          <Text style={styles.scanInstruction}>{Strings.qr.instruction}</Text>
        </View>
      </View>

      {/* Header */}
      <View style={styles.scanHeader}>
        <Text style={styles.scanHeaderTitle}>{Strings.qr.title}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background.app },
  qrHeader: { paddingHorizontal: 24, paddingTop: 20, paddingBottom: 24, alignItems: 'center' },
  qrHeaderTitle: { fontFamily: Typography.fontFamily.bold, fontSize: Typography.fontSize['2xl'], color: Colors.text.white },
  permissionContainer: { backgroundColor: Colors.background.app },
  permissionContent: { flex: 1, alignItems: 'center', paddingHorizontal: 32, paddingTop: 40, gap: 14 },
  permTitle: { fontFamily: Typography.fontFamily.bold, fontSize: Typography.fontSize.xl, color: Colors.text.primary, textAlign: 'center' },
  permMessage: { fontFamily: Typography.fontFamily.regular, fontSize: Typography.fontSize.base, color: Colors.text.secondary, textAlign: 'center', lineHeight: 22 },
  permButton: { borderRadius: 14, paddingVertical: 14, paddingHorizontal: 32 },
  permButtonText: { fontFamily: Typography.fontFamily.semiBold, fontSize: Typography.fontSize.base, color: Colors.primary.purple },
  permButtonTextWhite: { fontFamily: Typography.fontFamily.semiBold, fontSize: Typography.fontSize.base, color: Colors.text.white },
  howToCard: { backgroundColor: Colors.background.card, borderRadius: 16, padding: 16, width: '100%', marginTop: 8, gap: 10 },
  howToTitle: { fontFamily: Typography.fontFamily.semiBold, fontSize: Typography.fontSize.base, color: Colors.text.primary, textAlign: 'right' },
  howToStep: { flexDirection: 'row', alignItems: 'center', gap: 10, justifyContent: 'flex-end' },
  howToNum: { width: 24, height: 24, borderRadius: 12, backgroundColor: Colors.primary.purple, alignItems: 'center', justifyContent: 'center' },
  howToNumText: { fontFamily: Typography.fontFamily.bold, fontSize: Typography.fontSize.xs, color: Colors.text.white },
  howToStepText: { fontFamily: Typography.fontFamily.regular, fontSize: Typography.fontSize.sm, color: Colors.text.primary, textAlign: 'right', flex: 1 },
  // Scanner overlay
  overlay: { ...StyleSheet.absoluteFillObject },
  overlayTop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.65)' },
  overlayMiddle: { flexDirection: 'row', height: SCANNER_SIZE },
  overlaySide: { flex: 1, backgroundColor: 'rgba(0,0,0,0.65)' },
  scannerFrame: { width: SCANNER_SIZE, height: SCANNER_SIZE },
  corner: {
    position: 'absolute', width: 28, height: 28,
    borderColor: Colors.text.white, borderWidth: 3,
  },
  overlayBottom: { flex: 1, backgroundColor: 'rgba(0,0,0,0.65)', alignItems: 'center', paddingTop: 24 },
  scanInstruction: { fontFamily: Typography.fontFamily.medium, fontSize: Typography.fontSize.base, color: Colors.text.white, textAlign: 'center' },
  scanHeader: { position: 'absolute', top: 60, left: 0, right: 0, alignItems: 'center' },
  scanHeaderTitle: { fontFamily: Typography.fontFamily.bold, fontSize: Typography.fontSize.xl, color: Colors.text.white },
  // Success
  successScreen: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16, paddingHorizontal: 32 },
  successIcon: {},
  successTitle: { fontFamily: Typography.fontFamily.bold, fontSize: Typography.fontSize['2xl'], color: Colors.text.white, textAlign: 'center' },
  successEvent: { fontFamily: Typography.fontFamily.medium, fontSize: Typography.fontSize.lg, color: 'rgba(255,255,255,0.9)', textAlign: 'center' },
  xpEarnedBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(255,255,255,0.2)', paddingVertical: 8, paddingHorizontal: 20, borderRadius: 24 },
  xpEarnedText: { fontFamily: Typography.fontFamily.bold, fontSize: Typography.fontSize.lg, color: Colors.text.white },
  doneButton: { backgroundColor: Colors.text.white, borderRadius: 16, paddingVertical: 14, paddingHorizontal: 48, marginTop: 8 },
  doneText: { fontFamily: Typography.fontFamily.semiBold, fontSize: Typography.fontSize.lg, color: Colors.primary.purple },
  scanAgainText: { fontFamily: Typography.fontFamily.medium, fontSize: Typography.fontSize.base, color: 'rgba(255,255,255,0.8)' },
});

export default QRScannerScreen;
