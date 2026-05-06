import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  Alert,
  Modal,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { CameraView, useCameraPermissions } from 'expo-camera';

import { Colors, Typography } from '../../constants';
import { useAuth } from '../../context';
import {
  addFriend,
  findUserByEmail,
  getSuggestedFriends,
} from '../../database/queries/friendQueries';
import { User } from '../../types';

const AddFriendsScreen: React.FC = () => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { userId } = useAuth();

  const [tab, setTab] = useState<'suggestions' | 'email' | 'qr'>('suggestions');
  const [suggestions, setSuggestions] = useState<User[]>([]);
  const [emailInput, setEmailInput] = useState('');
  const [emailLoading, setEmailLoading] = useState(false);
  const [qrPermission, requestQrPermission] = useCameraPermissions();
  const [qrScanned, setQrScanned] = useState(false);

  const loadSuggestions = useCallback(async () => {
    if (!userId) return;
    const list = await getSuggestedFriends(userId);
    setSuggestions(list);
  }, [userId]);

  useEffect(() => { loadSuggestions(); }, [loadSuggestions]);

  const handleAddSuggestion = async (friend: User) => {
    if (!userId) return;
    await addFriend(userId, friend.id);
    setSuggestions(prev => prev.filter(s => s.id !== friend.id));
    Alert.alert('تمت الإضافة ✨', `${friend.fullName} الآن في قائمة أصدقائك.`);
  };

  const handleEmailAdd = async () => {
    if (!userId) return;
    const email = emailInput.trim();
    if (!email || !email.includes('@')) {
      Alert.alert('بريد غير صالح', 'تأكّد من إدخال بريد إلكتروني صحيح.');
      return;
    }
    setEmailLoading(true);
    try {
      const user = await findUserByEmail(email);
      if (!user) {
        Alert.alert(
          'لم نجد هذا المستخدم',
          'البريد غير مسجّل في التطبيق. سنرسل دعوة لاحقاً عند انضمامه.'
        );
        setEmailInput('');
        return;
      }
      if (user.id === userId) {
        Alert.alert('هذا أنت!', 'لا يمكنك إضافة نفسك كصديق.');
        return;
      }
      await addFriend(userId, user.id);
      Alert.alert('تمت الإضافة ✨', `${user.fullName} الآن في قائمة أصدقائك.`);
      setEmailInput('');
      loadSuggestions();
    } catch {
      Alert.alert('خطأ', 'تعذّر إضافة الصديق. حاول مجدداً.');
    } finally {
      setEmailLoading(false);
    }
  };

  const handleQrScanned = async ({ data }: { data: string }) => {
    if (qrScanned || !userId) return;
    setQrScanned(true);
    try {
      // Friend QR is expected to be JSON: { type: 'ananlink-friend', email: '...' }
      // Or a plain email string for simplicity.
      let email = '';
      try {
        const parsed = JSON.parse(data);
        if (parsed.type === 'ananlink-friend' && parsed.email) email = parsed.email;
      } catch {
        if (data.includes('@')) email = data;
      }
      if (!email) {
        Alert.alert('رمز غير معروف', 'هذا الرمز ليس رمز صديق على عنان لينك.');
        return;
      }
      const user = await findUserByEmail(email);
      if (!user) {
        Alert.alert('لم نجد المستخدم', 'هذا الصديق لم يسجّل بعد على التطبيق.');
        return;
      }
      if (user.id === userId) {
        Alert.alert('هذا أنت!', 'لا يمكنك إضافة نفسك كصديق.');
        return;
      }
      await addFriend(userId, user.id);
      Alert.alert('تمت الإضافة ✨', `${user.fullName} الآن في قائمة أصدقائك.`);
      loadSuggestions();
    } finally {
      setTimeout(() => setQrScanned(false), 1500);
    }
  };

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
          <Text style={styles.heroTitle}>إضافة أصدقاء</Text>
          <View style={{ width: 36 }} />
        </View>

        <View style={styles.tabsBar}>
          <TabButton
            label="مقترحون"
            active={tab === 'suggestions'}
            onPress={() => setTab('suggestions')}
          />
          <TabButton
            label="بريد"
            active={tab === 'email'}
            onPress={() => setTab('email')}
          />
          <TabButton
            label="QR"
            active={tab === 'qr'}
            onPress={() => setTab('qr')}
          />
        </View>
      </LinearGradient>

      {tab === 'suggestions' && (
        <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
          {suggestions.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="checkmark-circle-outline" size={48} color={Colors.primary.purple} />
              <Text style={styles.emptyText}>أضفت كل المقترحات!</Text>
              <Text style={styles.emptyHint}>جرّب البحث بالبريد أو امسح رمز QR.</Text>
            </View>
          ) : (
            <>
              <Text style={styles.sectionHint}>طلاب مقترحون لك من جامعات سعودية</Text>
              {suggestions.map(s => (
                <View key={s.id} style={styles.suggestRow}>
                  <View style={styles.avatarSmall}>
                    {s.avatarUri ? (
                      <Image source={{ uri: s.avatarUri }} style={styles.avatarSmallImg} />
                    ) : (
                      <Text style={styles.avatarSmallText}>{s.firstName[0]}</Text>
                    )}
                  </View>
                  <View style={styles.suggestInfo}>
                    <Text style={styles.suggestName}>{s.fullName}</Text>
                    <Text style={styles.suggestUni}>{s.university} · {s.major}</Text>
                  </View>
                  <View style={styles.xpChip}>
                    <Ionicons name="star" size={11} color={Colors.xp.gold} />
                    <Text style={styles.xpChipText}>{s.xp}</Text>
                  </View>
                  <TouchableOpacity
                    style={styles.addCta}
                    activeOpacity={0.85}
                    onPress={() => handleAddSuggestion(s)}
                  >
                    <Ionicons name="add" size={20} color={Colors.text.white} />
                  </TouchableOpacity>
                </View>
              ))}
            </>
          )}
        </ScrollView>
      )}

      {tab === 'email' && (
        <View style={{ padding: 20 }}>
          <Text style={styles.sectionHint}>أدخل بريد صديقك الإلكتروني</Text>
          <View style={styles.emailRow}>
            <TextInput
              value={emailInput}
              onChangeText={setEmailInput}
              placeholder="friend@example.com"
              placeholderTextColor={Colors.text.muted}
              autoCapitalize="none"
              keyboardType="email-address"
              style={styles.emailInput}
              textAlign="right"
            />
          </View>
          <TouchableOpacity
            style={[styles.emailBtn, emailLoading && { opacity: 0.5 }]}
            onPress={handleEmailAdd}
            disabled={emailLoading}
            activeOpacity={0.9}
          >
            <LinearGradient
              colors={Colors.gradient.all}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
              style={styles.emailBtnInner}
            >
              <Ionicons name="person-add" size={18} color={Colors.text.white} />
              <Text style={styles.emailBtnText}>
                {emailLoading ? 'جاري البحث...' : 'إضافة بالبريد'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
          <Text style={styles.helperText}>
            ملاحظة: سنبحث عن الصديق في قاعدة بيانات التطبيق المحلية. إذا كان مسجّلاً،
            سيُضاف فوراً إلى قائمة أصدقائك.
          </Text>
        </View>
      )}

      {tab === 'qr' && (
        <View style={styles.qrTab}>
          {!qrPermission ? (
            <Text style={styles.helperText}>جاري تحميل الكاميرا...</Text>
          ) : !qrPermission.granted ? (
            <View style={styles.qrPermBox}>
              <Ionicons name="camera-outline" size={48} color={Colors.text.secondary} />
              <Text style={styles.qrPermTitle}>نحتاج إذن الكاميرا</Text>
              <Text style={styles.qrPermDesc}>للاستفادة من ميزة مسح رمز QR لصديقك.</Text>
              <TouchableOpacity
                style={styles.qrPermBtn}
                onPress={requestQrPermission}
                activeOpacity={0.85}
              >
                <Text style={styles.qrPermBtnText}>السماح بالوصول</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.qrFrame}>
              <CameraView
                style={StyleSheet.absoluteFill}
                facing="back"
                onBarcodeScanned={qrScanned ? undefined : handleQrScanned}
                barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
              />
              <View style={styles.qrOverlay} pointerEvents="none">
                <View style={styles.qrTarget} />
                <Text style={styles.qrHint}>وجّه الكاميرا لرمز QR صديقك</Text>
              </View>
            </View>
          )}
        </View>
      )}
    </View>
  );
};

const TabButton: React.FC<{ label: string; active: boolean; onPress: () => void }> = ({
  label, active, onPress,
}) => (
  <TouchableOpacity
    onPress={onPress}
    style={[styles.tabBtn, active && styles.tabBtnActive]}
    activeOpacity={0.85}
  >
    <Text style={[styles.tabBtnText, active && styles.tabBtnTextActive]}>{label}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background.app },

  hero: { paddingHorizontal: 20, paddingBottom: 18 },
  heroTopBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    marginBottom: 16,
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
  tabsBar: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderRadius: 16, padding: 4,
  },
  tabBtn: { flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: 12 },
  tabBtnActive: { backgroundColor: Colors.text.white },
  tabBtnText: {
    fontFamily: Typography.fontFamily.semiBold,
    fontSize: Typography.fontSize.sm,
    color: 'rgba(255,255,255,0.85)',
  },
  tabBtnTextActive: { color: Colors.primary.purple },

  sectionHint: {
    fontFamily: Typography.fontFamily.medium,
    fontSize: Typography.fontSize.sm,
    color: Colors.text.secondary,
    textAlign: 'right', marginBottom: 12,
  },

  // Suggestions
  suggestRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: Colors.background.card,
    borderRadius: 14, padding: 12, marginBottom: 8,
  },
  avatarSmall: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: Colors.opportunity.hackathonLight,
    alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
  },
  avatarSmallImg: { width: '100%', height: '100%' },
  avatarSmallText: {
    fontFamily: Typography.fontFamily.bold,
    fontSize: 18, color: Colors.primary.purple,
  },
  suggestInfo: { flex: 1 },
  suggestName: {
    fontFamily: Typography.fontFamily.semiBold,
    fontSize: Typography.fontSize.sm,
    color: Colors.text.primary, textAlign: 'right',
  },
  suggestUni: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.fontSize.xs,
    color: Colors.text.secondary, textAlign: 'right', marginTop: 2,
  },
  xpChip: {
    flexDirection: 'row', alignItems: 'center', gap: 3,
    backgroundColor: Colors.xp.goldLight,
    borderRadius: 8, paddingVertical: 3, paddingHorizontal: 6,
  },
  xpChipText: {
    fontFamily: Typography.fontFamily.bold,
    fontSize: 11, color: Colors.xp.bronze,
  },
  addCta: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: Colors.primary.purple,
    alignItems: 'center', justifyContent: 'center',
  },

  emptyState: { alignItems: 'center', paddingVertical: 40, gap: 8 },
  emptyText: {
    fontFamily: Typography.fontFamily.bold,
    fontSize: Typography.fontSize.base,
    color: Colors.text.primary, marginTop: 8,
  },
  emptyHint: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.fontSize.sm,
    color: Colors.text.secondary,
  },

  // Email
  emailRow: {
    backgroundColor: Colors.background.card,
    borderRadius: 14, paddingHorizontal: 14, paddingVertical: 4,
    borderWidth: 1, borderColor: Colors.ui.border,
  },
  emailInput: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.fontSize.sm,
    color: Colors.text.primary, paddingVertical: 12,
  },
  emailBtn: { marginTop: 14, borderRadius: 14, overflow: 'hidden' },
  emailBtnInner: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, paddingVertical: 14,
  },
  emailBtnText: {
    fontFamily: Typography.fontFamily.semiBold,
    fontSize: Typography.fontSize.base,
    color: Colors.text.white,
  },
  helperText: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.fontSize.xs,
    color: Colors.text.secondary,
    textAlign: 'right', marginTop: 16,
    lineHeight: Typography.fontSize.xs * 1.7,
  },

  // QR
  qrTab: { flex: 1, padding: 20 },
  qrPermBox: {
    backgroundColor: Colors.background.card, borderRadius: 16, padding: 24,
    alignItems: 'center', gap: 8,
  },
  qrPermTitle: {
    fontFamily: Typography.fontFamily.bold,
    fontSize: Typography.fontSize.lg,
    color: Colors.text.primary, marginTop: 8,
  },
  qrPermDesc: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.fontSize.sm,
    color: Colors.text.secondary, textAlign: 'center',
  },
  qrPermBtn: {
    backgroundColor: Colors.primary.purple,
    paddingVertical: 12, paddingHorizontal: 24,
    borderRadius: 12, marginTop: 8,
  },
  qrPermBtnText: {
    fontFamily: Typography.fontFamily.semiBold,
    fontSize: Typography.fontSize.sm,
    color: Colors.text.white,
  },
  qrFrame: {
    flex: 1, borderRadius: 24, overflow: 'hidden',
    backgroundColor: '#000', position: 'relative',
  },
  qrOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center', justifyContent: 'center',
  },
  qrTarget: {
    width: 240, height: 240,
    borderWidth: 3, borderColor: Colors.text.white,
    borderRadius: 18,
  },
  qrHint: {
    fontFamily: Typography.fontFamily.semiBold,
    fontSize: Typography.fontSize.sm,
    color: Colors.text.white, marginTop: 16,
    textAlign: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)', paddingVertical: 6, paddingHorizontal: 14,
    borderRadius: 8,
  },
});

export default AddFriendsScreen;
