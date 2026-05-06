import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Image,
  Alert,
  ActionSheetIOS,
  Platform,
  Modal,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import * as ImagePicker from 'expo-image-picker';

import { Colors, Typography, Strings, CAREERS, getCareerById } from '../../constants';
import { useAuth, useUser } from '../../context';
import { updateUserProfile } from '../../database/queries/userQueries';

const ACADEMIC_YEARS = [
  { value: '1', label: 'السنة الأولى' },
  { value: '2', label: 'السنة الثانية' },
  { value: '3', label: 'السنة الثالثة' },
  { value: '4', label: 'السنة الرابعة' },
  { value: '5', label: 'السنة الخامسة' },
  { value: 'graduated', label: 'متخرج' },
];

const EditProfileScreen: React.FC = () => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { userId } = useAuth();
  const { user, refreshUser } = useUser();

  const [firstName, setFirstName] = useState(user?.firstName ?? '');
  const [lastName, setLastName] = useState(user?.lastName ?? '');
  const [university, setUniversity] = useState(user?.university ?? '');
  const [major, setMajor] = useState(user?.major ?? '');
  const [specialty, setSpecialty] = useState(user?.specialty ?? '');
  const [academicYear, setAcademicYear] = useState(String(user?.academicYear ?? ''));
  const [avatarUri, setAvatarUri] = useState<string | null>(user?.avatarUri ?? null);

  const [isSaving, setIsSaving] = useState(false);
  const [careerPickerOpen, setCareerPickerOpen] = useState(false);
  const [yearPickerOpen, setYearPickerOpen] = useState(false);

  const initials = `${firstName[0] ?? ''}${lastName[0] ?? ''}`.trim() || '؟';

  const pickFromGallery = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert('الإذن مطلوب', 'نحتاج إذن الوصول للصور لاختيار صورة الملف الشخصي.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true, aspect: [1, 1], quality: 0.7,
    });
    if (!result.canceled && result.assets[0]) {
      setAvatarUri(result.assets[0].uri);
    }
  };

  const pickFromCamera = async () => {
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) {
      Alert.alert('الإذن مطلوب', 'نحتاج إذن الكاميرا لالتقاط صورة جديدة.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true, aspect: [1, 1], quality: 0.7,
    });
    if (!result.canceled && result.assets[0]) {
      setAvatarUri(result.assets[0].uri);
    }
  };

  const removeAvatar = () => {
    setAvatarUri(null);
  };

  const handleAvatarPress = () => {
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ['إلغاء', 'التقاط صورة', 'اختيار من المعرض', 'إزالة الصورة'],
          cancelButtonIndex: 0,
          destructiveButtonIndex: 3,
        },
        (idx) => {
          if (idx === 1) pickFromCamera();
          else if (idx === 2) pickFromGallery();
          else if (idx === 3) removeAvatar();
        }
      );
    } else {
      Alert.alert('صورة الملف الشخصي', 'اختر مصدر الصورة', [
        { text: 'التقاط صورة', onPress: pickFromCamera },
        { text: 'اختيار من المعرض', onPress: pickFromGallery },
        { text: 'إزالة الصورة', style: 'destructive', onPress: removeAvatar },
        { text: 'إلغاء', style: 'cancel' },
      ]);
    }
  };

  const handleSave = async () => {
    if (!userId) return;
    if (!firstName.trim() || !lastName.trim()) {
      Alert.alert('بيانات ناقصة', 'الاسم الأول والأخير مطلوبان.');
      return;
    }
    setIsSaving(true);
    try {
      await updateUserProfile(userId, {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        university: university.trim(),
        major: major.trim(),
        specialty,
        academicYear,
        avatarUri,
      });
      await refreshUser();
      Alert.alert('تم الحفظ', 'تم تحديث ملفك الشخصي بنجاح', [
        { text: 'حسناً', onPress: () => navigation.goBack() },
      ]);
    } catch (e: any) {
      console.error('[EditProfile] save error:', e);
      Alert.alert('خطأ في الحفظ', e?.message ?? 'تعذّر حفظ التغييرات. حاول مرة أخرى.');
    } finally {
      setIsSaving(false);
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
          <Text style={styles.heroTitle}>تعديل الملف الشخصي</Text>
          <View style={{ width: 36 }} />
        </View>

        {/* Avatar */}
        <TouchableOpacity onPress={handleAvatarPress} activeOpacity={0.85} style={styles.avatarWrap}>
          {avatarUri ? (
            <Image source={{ uri: avatarUri }} style={styles.avatarImg} />
          ) : (
            <View style={styles.avatarFallback}>
              <Text style={styles.avatarInitials}>{initials}</Text>
            </View>
          )}
          <View style={styles.cameraBadge}>
            <Ionicons name="camera" size={14} color={Colors.text.white} />
          </View>
        </TouchableOpacity>
        <Text style={styles.changePhotoText}>اضغط لتغيير الصورة</Text>
      </LinearGradient>

      <ScrollView
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.formCard}>
          <Text style={styles.sectionTitle}>المعلومات الشخصية</Text>

          <Field label="الاسم الأول">
            <TextInput
              value={firstName}
              onChangeText={setFirstName}
              style={styles.input}
              textAlign="right"
              placeholderTextColor={Colors.text.muted}
            />
          </Field>

          <Field label="الاسم الأخير">
            <TextInput
              value={lastName}
              onChangeText={setLastName}
              style={styles.input}
              textAlign="right"
              placeholderTextColor={Colors.text.muted}
            />
          </Field>
        </View>

        <View style={styles.formCard}>
          <Text style={styles.sectionTitle}>المعلومات الأكاديمية</Text>

          <Field label="الجامعة">
            <TextInput
              value={university}
              onChangeText={setUniversity}
              style={styles.input}
              textAlign="right"
              placeholderTextColor={Colors.text.muted}
            />
          </Field>

          <Field label="التخصص الجامعي">
            <TextInput
              value={major}
              onChangeText={setMajor}
              style={styles.input}
              textAlign="right"
              placeholderTextColor={Colors.text.muted}
            />
          </Field>

          <Field label="السنة الدراسية">
            <TouchableOpacity
              style={styles.pickerInput}
              onPress={() => setYearPickerOpen(true)}
            >
              <Ionicons name="chevron-down" size={18} color={Colors.text.muted} />
              <Text style={styles.pickerText}>
                {ACADEMIC_YEARS.find(y => y.value === academicYear)?.label ?? academicYear ?? 'اختر السنة'}
              </Text>
            </TouchableOpacity>
          </Field>

          <Field label="المسار التقني">
            <TouchableOpacity
              style={styles.pickerInput}
              onPress={() => setCareerPickerOpen(true)}
            >
              <Ionicons name="chevron-down" size={18} color={Colors.text.muted} />
              <Text style={styles.pickerText}>
                {getCareerById(specialty)?.title ?? specialty ?? 'اختر المسار'}
              </Text>
            </TouchableOpacity>
          </Field>
        </View>
      </ScrollView>

      {/* Save bar */}
      <View style={[styles.bottomBar, { paddingBottom: insets.bottom + 12 }]}>
        <TouchableOpacity activeOpacity={0.9} onPress={handleSave} disabled={isSaving}>
          <LinearGradient
            colors={Colors.gradient.all}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
            style={[styles.saveBtn, isSaving && { opacity: 0.6 }]}
          >
            <Ionicons name="checkmark" size={18} color={Colors.text.white} />
            <Text style={styles.saveText}>{isSaving ? 'جاري الحفظ...' : 'حفظ التغييرات'}</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>

      {/* Career picker */}
      <PickerSheet
        visible={careerPickerOpen}
        title="اختر مسارك التقني"
        options={CAREERS.map(c => ({ value: c.id, label: c.title, icon: c.icon }))}
        selectedValue={specialty}
        onSelect={(v) => { setSpecialty(v); setCareerPickerOpen(false); }}
        onClose={() => setCareerPickerOpen(false)}
      />

      {/* Year picker */}
      <PickerSheet
        visible={yearPickerOpen}
        title="اختر السنة الدراسية"
        options={ACADEMIC_YEARS}
        selectedValue={academicYear}
        onSelect={(v) => { setAcademicYear(v); setYearPickerOpen(false); }}
        onClose={() => setYearPickerOpen(false)}
      />
    </View>
  );
};

const Field: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <View style={styles.field}>
    <Text style={styles.fieldLabel}>{label}</Text>
    {children}
  </View>
);

interface PickerOption { value: string; label: string; icon?: string }

const PickerSheet: React.FC<{
  visible: boolean;
  title: string;
  options: PickerOption[];
  selectedValue: string;
  onSelect: (v: string) => void;
  onClose: () => void;
}> = ({ visible, title, options, selectedValue, onSelect, onClose }) => {
  const insets = useSafeAreaInsets();
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <TouchableOpacity style={styles.modalBackdrop} onPress={onClose} activeOpacity={1}>
        <View style={[styles.modalSheet, { paddingBottom: insets.bottom + 16 }]}>
          <View style={styles.modalHandle} />
          <Text style={styles.modalTitle}>{title}</Text>
          <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 400 }}>
            {options.map(opt => {
              const isSelected = opt.value === selectedValue;
              return (
                <TouchableOpacity
                  key={opt.value}
                  style={[styles.modalOption, isSelected && styles.modalOptionSelected]}
                  onPress={() => onSelect(opt.value)}
                  activeOpacity={0.7}
                >
                  {isSelected && <Ionicons name="checkmark" size={20} color={Colors.primary.purple} />}
                  <Text style={[styles.modalOptionText, isSelected && styles.modalOptionTextSelected]}>
                    {opt.label}
                  </Text>
                  {opt.icon && <Text style={styles.modalOptionIcon}>{opt.icon}</Text>}
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background.app },

  hero: {
    paddingHorizontal: 20, paddingBottom: 24,
    alignItems: 'center',
  },
  heroTopBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    width: '100%', marginBottom: 18,
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
  avatarWrap: { width: 110, height: 110, marginBottom: 8 },
  avatarImg: {
    width: 110, height: 110, borderRadius: 55,
    borderWidth: 3, borderColor: Colors.text.white,
  },
  avatarFallback: {
    width: 110, height: 110, borderRadius: 55,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 3, borderColor: 'rgba(255,255,255,0.45)',
  },
  avatarInitials: {
    fontFamily: Typography.fontFamily.bold,
    fontSize: 38, color: Colors.text.white,
  },
  cameraBadge: {
    position: 'absolute', bottom: 4, right: 4,
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: Colors.primary.purple,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: Colors.text.white,
  },
  changePhotoText: {
    fontFamily: Typography.fontFamily.medium,
    fontSize: Typography.fontSize.xs,
    color: 'rgba(255,255,255,0.85)',
  },

  formCard: {
    backgroundColor: Colors.background.card,
    borderRadius: 16, padding: 16,
    marginHorizontal: 16, marginTop: 14,
  },
  sectionTitle: {
    fontFamily: Typography.fontFamily.bold,
    fontSize: Typography.fontSize.base,
    color: Colors.text.primary,
    textAlign: 'right', marginBottom: 12,
  },
  field: { marginBottom: 12 },
  fieldLabel: {
    fontFamily: Typography.fontFamily.medium,
    fontSize: Typography.fontSize.xs,
    color: Colors.text.secondary,
    textAlign: 'right', marginBottom: 6,
  },
  input: {
    backgroundColor: Colors.ui.inputBg,
    borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12,
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.fontSize.sm,
    color: Colors.text.primary,
    borderWidth: 1, borderColor: Colors.ui.border,
  },
  pickerInput: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: Colors.ui.inputBg,
    borderRadius: 12, paddingHorizontal: 14, paddingVertical: 13,
    borderWidth: 1, borderColor: Colors.ui.border,
  },
  pickerText: {
    flex: 1,
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.fontSize.sm,
    color: Colors.text.primary,
    textAlign: 'right',
  },

  bottomBar: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: Colors.background.card,
    paddingHorizontal: 16, paddingTop: 10,
    borderTopWidth: 1, borderTopColor: Colors.ui.divider,
  },
  saveBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, paddingVertical: 14, borderRadius: 14,
    shadowColor: Colors.primary.purple,
    shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.25, shadowRadius: 10,
    elevation: 4,
  },
  saveText: {
    fontFamily: Typography.fontFamily.semiBold,
    fontSize: Typography.fontSize.base,
    color: Colors.text.white,
  },

  modalBackdrop: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: Colors.background.card,
    borderTopLeftRadius: 24, borderTopRightRadius: 24,
    paddingHorizontal: 20, paddingTop: 12,
  },
  modalHandle: {
    width: 42, height: 4, borderRadius: 2,
    backgroundColor: Colors.ui.border,
    alignSelf: 'center', marginBottom: 14,
  },
  modalTitle: {
    fontFamily: Typography.fontFamily.bold,
    fontSize: Typography.fontSize.lg,
    color: Colors.text.primary,
    textAlign: 'center', marginBottom: 14,
  },
  modalOption: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingVertical: 14, paddingHorizontal: 12, borderRadius: 12,
    borderBottomWidth: 1, borderBottomColor: Colors.ui.divider,
  },
  modalOptionSelected: {
    backgroundColor: Colors.opportunity.hackathonLight,
  },
  modalOptionText: {
    flex: 1,
    fontFamily: Typography.fontFamily.medium,
    fontSize: Typography.fontSize.base,
    color: Colors.text.primary,
    textAlign: 'right',
  },
  modalOptionTextSelected: { color: Colors.primary.purple },
  modalOptionIcon: { fontSize: 22 },
});

export default EditProfileScreen;
