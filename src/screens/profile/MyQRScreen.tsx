import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import QRCode from 'react-native-qrcode-svg';

import { Colors, Typography } from '../../constants';
import { useUser } from '../../context';

const MyQRScreen: React.FC = () => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { user } = useUser();

  // QR payload — format consumed by AddFriendsScreen's scanner.
  // We include type so we can reject random QR codes scanned by accident.
  const qrPayload = JSON.stringify({
    type: 'ananlink-friend',
    email: user?.email ?? '',
    name: user?.fullName ?? '',
  });

  const initials = user
    ? `${user.firstName?.[0] ?? ''}${user.lastName?.[0] ?? ''}`.trim()
    : '؟';

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      <LinearGradient
        colors={Colors.gradient.all}
        start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
        style={[styles.hero, { paddingTop: insets.top + 12 }]}
      >
        <View style={styles.heroTopBar}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backBtn}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="chevron-forward" size={22} color={Colors.text.white} />
          </TouchableOpacity>
          <Text style={styles.heroTitle}>رمز QR الخاص بي</Text>
          <View style={{ width: 36 }} />
        </View>
      </LinearGradient>

      <ScrollView
        contentContainerStyle={{ alignItems: 'center', paddingTop: 20, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.intro}>
          اعرض هذا الرمز ليمسحه أصدقاؤك ويضيفوك في لوحة المتصدرين
        </Text>

        {/* QR card */}
        <View style={styles.qrCard}>
          <View style={styles.qrCardCorner1} />
          <View style={styles.qrCardCorner2} />
          <View style={styles.qrCardCorner3} />
          <View style={styles.qrCardCorner4} />

          <View style={styles.qrInner}>
            {user ? (
              <QRCode
                value={qrPayload}
                size={220}
                color={Colors.primary.purple}
                backgroundColor="white"
                ecl="M"
              />
            ) : null}
          </View>

          {/* Avatar circle on top */}
          <View style={styles.avatarWrap}>
            {user?.avatarUri ? (
              <Image source={{ uri: user.avatarUri }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarFallback}>
                <Text style={styles.avatarText}>{initials || '؟'}</Text>
              </View>
            )}
          </View>
        </View>

        <Text style={styles.userName}>{user?.fullName ?? '...'}</Text>
        {user?.university && (
          <Text style={styles.userMeta}>
            {user.major}{user.major && user.university ? ' · ' : ''}{user.university}
          </Text>
        )}

        <View style={styles.hintBox}>
          <Ionicons name="information-circle-outline" size={18} color={Colors.text.secondary} />
          <Text style={styles.hintText}>
            اطلب من صديقك فتح "إضافة أصدقاء" ← QR، ووجّه كاميرته لهذا الرمز.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background.app },

  hero: { paddingHorizontal: 20, paddingBottom: 18 },
  heroTopBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
  },
  backBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center', justifyContent: 'center',
  },
  heroTitle: {
    fontFamily: Typography.fontFamily.bold,
    fontSize: Typography.fontSize.lg,
    color: Colors.text.white,
  },

  intro: {
    fontFamily: Typography.fontFamily.medium,
    fontSize: Typography.fontSize.sm,
    color: Colors.text.secondary,
    textAlign: 'center',
    paddingHorizontal: 32, marginBottom: 24,
    lineHeight: Typography.fontSize.sm * 1.6,
  },

  qrCard: {
    backgroundColor: Colors.text.white,
    borderRadius: 28, padding: 28,
    shadowColor: Colors.primary.purple,
    shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.15, shadowRadius: 20,
    elevation: 8,
    position: 'relative',
  },
  // Decorative corner brackets — purple "L" shapes at each corner
  qrCardCorner1: {
    position: 'absolute', top: 12, left: 12, width: 24, height: 24,
    borderTopWidth: 4, borderLeftWidth: 4,
    borderColor: Colors.primary.purple, borderTopLeftRadius: 8,
  },
  qrCardCorner2: {
    position: 'absolute', top: 12, right: 12, width: 24, height: 24,
    borderTopWidth: 4, borderRightWidth: 4,
    borderColor: Colors.primary.purple, borderTopRightRadius: 8,
  },
  qrCardCorner3: {
    position: 'absolute', bottom: 12, left: 12, width: 24, height: 24,
    borderBottomWidth: 4, borderLeftWidth: 4,
    borderColor: Colors.primary.purple, borderBottomLeftRadius: 8,
  },
  qrCardCorner4: {
    position: 'absolute', bottom: 12, right: 12, width: 24, height: 24,
    borderBottomWidth: 4, borderRightWidth: 4,
    borderColor: Colors.primary.purple, borderBottomRightRadius: 8,
  },
  qrInner: {
    width: 220, height: 220,
    alignItems: 'center', justifyContent: 'center',
  },

  avatarWrap: {
    position: 'absolute', top: '50%', left: '50%',
    width: 56, height: 56, marginTop: -28, marginLeft: -28,
    borderRadius: 28, backgroundColor: Colors.text.white,
    padding: 4,
  },
  avatar: {
    width: 48, height: 48, borderRadius: 24,
  },
  avatarFallback: {
    width: 48, height: 48, borderRadius: 24,
    backgroundColor: Colors.primary.purple,
    alignItems: 'center', justifyContent: 'center',
  },
  avatarText: {
    fontFamily: Typography.fontFamily.bold,
    fontSize: 18, color: Colors.text.white,
  },

  userName: {
    fontFamily: Typography.fontFamily.bold,
    fontSize: Typography.fontSize.lg,
    color: Colors.text.primary,
    marginTop: 22,
  },
  userMeta: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.fontSize.sm,
    color: Colors.text.secondary,
    marginTop: 4,
  },

  hintBox: {
    flexDirection: 'row-reverse', alignItems: 'center', gap: 8,
    backgroundColor: Colors.opportunity.hackathonLight,
    borderRadius: 14, paddingVertical: 12, paddingHorizontal: 16,
    marginTop: 28, marginHorizontal: 24,
  },
  hintText: {
    flex: 1,
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.fontSize.xs,
    color: Colors.text.secondary,
    textAlign: 'right',
    lineHeight: Typography.fontSize.xs * 1.7,
  },
});

export default MyQRScreen;
