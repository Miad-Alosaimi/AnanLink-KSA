import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Modal,
  FlatList,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

import { Colors, Typography, Strings, CAREERS, getCareerById } from '../../constants';
import { AuthStackParamList, RegisterStep1Data } from '../../types';
import { Input } from '../../components/common';

type Nav = NativeStackNavigationProp<AuthStackParamList>;

const STEP_COUNT = 3;

const StepIndicator: React.FC<{ currentStep: number; total: number }> = ({
  currentStep,
  total,
}) => (
  <View style={indicatorStyles.container}>
    {Array.from({ length: total }).map((_, i) => (
      <View
        key={i}
        style={[
          indicatorStyles.step,
          i < currentStep ? indicatorStyles.completed :
          i === currentStep - 1 ? indicatorStyles.active :
          indicatorStyles.inactive,
        ]}
      />
    ))}
  </View>
);

const indicatorStyles = StyleSheet.create({
  container: { flexDirection: 'row', gap: 6, marginBottom: 24 },
  step: { flex: 1, height: 4, borderRadius: 2 },
  active: { backgroundColor: Colors.primary.purple },
  completed: { backgroundColor: Colors.status.success },
  inactive: { backgroundColor: Colors.ui.border },
});

type PickerOption = string | { value: string; label: string; icon?: string };

type PickerModalProps = {
  visible: boolean;
  options: PickerOption[];
  onSelect: (value: string) => void;
  onClose: () => void;
  title: string;
};

const optionValue = (o: PickerOption): string => typeof o === 'string' ? o : o.value;
const optionLabel = (o: PickerOption): string => typeof o === 'string' ? o : o.label;
const optionIcon  = (o: PickerOption): string | undefined => typeof o === 'string' ? undefined : o.icon;

const PickerModal: React.FC<PickerModalProps> = ({
  visible, options, onSelect, onClose, title,
}) => (
  <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
    <TouchableOpacity style={modalStyles.overlay} onPress={onClose} activeOpacity={1}>
      <View style={modalStyles.sheet}>
        <View style={modalStyles.handle} />
        <Text style={modalStyles.title}>{title}</Text>
        <FlatList
          data={options}
          keyExtractor={(item) => optionValue(item)}
          renderItem={({ item }) => {
            const icon = optionIcon(item);
            return (
              <TouchableOpacity
                style={modalStyles.option}
                onPress={() => onSelect(optionValue(item))}
              >
                {icon && <Text style={modalStyles.optionIcon}>{icon}</Text>}
                <Text style={modalStyles.optionText}>{optionLabel(item)}</Text>
              </TouchableOpacity>
            );
          }}
          showsVerticalScrollIndicator={false}
        />
      </View>
    </TouchableOpacity>
  </Modal>
);

const modalStyles = StyleSheet.create({
  overlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: Colors.background.card, borderTopLeftRadius: 24,
    borderTopRightRadius: 24, paddingTop: 12, paddingHorizontal: 20,
    paddingBottom: 40, maxHeight: '75%',
  },
  handle: {
    width: 40, height: 4, borderRadius: 2,
    backgroundColor: Colors.ui.border, alignSelf: 'center', marginBottom: 16,
  },
  title: {
    fontFamily: Typography.fontFamily.semiBold, fontSize: Typography.fontSize.lg,
    color: Colors.text.primary, textAlign: 'right', marginBottom: 12,
  },
  option: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: Colors.ui.divider,
  },
  optionIcon: { fontSize: 20 },
  optionText: {
    fontFamily: Typography.fontFamily.regular, fontSize: Typography.fontSize.base,
    color: Colors.text.primary, textAlign: 'right', flex: 1,
  },
});

const RegisterStep1Screen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const insets = useSafeAreaInsets();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [university, setUniversity] = useState('');
  const [major, setMajor] = useState('');
  const [specialty, setSpecialty] = useState('');
  const [errors, setErrors] = useState<Partial<Record<keyof RegisterStep1Data, string>>>({});

  const [uniModalVisible, setUniModalVisible] = useState(false);
  const [specModalVisible, setSpecModalVisible] = useState(false);

  const validate = () => {
    const newErrors: typeof errors = {};
    if (!firstName.trim()) newErrors.firstName = Strings.auth.errors.firstNameRequired;
    if (!lastName.trim()) newErrors.lastName = Strings.auth.errors.lastNameRequired;
    if (!email.trim()) newErrors.email = Strings.auth.errors.emailRequired;
    else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = Strings.auth.errors.emailInvalid;
    if (!university) newErrors.university = Strings.auth.errors.universityRequired;
    if (!major.trim()) newErrors.major = Strings.auth.errors.majorRequired;
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (!validate()) return;
    navigation.navigate('RegisterStep2', {
      step1Data: { firstName, lastName, email, university, major, specialty },
    });
  };

  return (
    <KeyboardAvoidingView
      style={styles.keyboardView}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar style="light" />
      <LinearGradient
        colors={Colors.gradient.all}
        style={[styles.header, { paddingTop: insets.top + 16 }]}
      >
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="chevron-forward" size={24} color={Colors.text.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{Strings.auth.register.title}</Text>
        <Text style={styles.headerSubtitle}>{Strings.auth.register.step1Title}</Text>
      </LinearGradient>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.formContent, { paddingBottom: insets.bottom + 32 }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <StepIndicator currentStep={1} total={STEP_COUNT} />

        <View style={styles.nameRow}>
          <Input
            label={Strings.auth.register.lastNameLabel}
            value={lastName}
            onChangeText={setLastName}
            placeholder={Strings.auth.register.lastNamePlaceholder}
            autoCapitalize="words"
            error={errors.lastName}
            containerStyle={styles.halfInput}
          />
          <Input
            label={Strings.auth.register.firstNameLabel}
            value={firstName}
            onChangeText={setFirstName}
            placeholder={Strings.auth.register.firstNamePlaceholder}
            autoCapitalize="words"
            error={errors.firstName}
            containerStyle={styles.halfInput}
          />
        </View>

        <Input
          label={Strings.auth.register.emailLabel}
          value={email}
          onChangeText={setEmail}
          placeholder={Strings.auth.register.emailPlaceholder}
          keyboardType="email-address"
          leftIcon="mail-outline"
          error={errors.email}
        />

        <Input
          label={Strings.auth.register.universityLabel}
          value={university}
          onChangeText={() => {}}
          placeholder="اختر جامعتك"
          leftIcon="school-outline"
          rightIcon="chevron-down-outline"
          error={errors.university}
          onPress={() => setUniModalVisible(true)}
        />

        <Input
          label={Strings.auth.register.majorLabel}
          value={major}
          onChangeText={setMajor}
          placeholder={Strings.auth.register.majorPlaceholder}
          leftIcon="book-outline"
          error={errors.major}
        />

        <Input
          label={Strings.auth.register.specialtyLabel}
          value={getCareerById(specialty)?.title ?? ''}
          onChangeText={() => {}}
          placeholder="اختر مسارك التقني"
          leftIcon="code-slash-outline"
          rightIcon="chevron-down-outline"
          onPress={() => setSpecModalVisible(true)}
        />

        <TouchableOpacity onPress={handleNext} activeOpacity={0.9} style={styles.nextButton}>
          <LinearGradient
            colors={Colors.gradient.all}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
            style={styles.nextGradient}
          >
            <Text style={styles.nextText}>
              {Strings.auth.register.nextButton} 2
            </Text>
          </LinearGradient>
        </TouchableOpacity>

        <View style={styles.loginRow}>
          <Text style={styles.loginHint}>{Strings.auth.register.alreadyHaveAccount}</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={styles.loginLink}>{Strings.auth.register.login}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <PickerModal
        visible={uniModalVisible}
        options={Strings.auth.universities}
        onSelect={(val) => { setUniversity(val); setUniModalVisible(false); }}
        onClose={() => setUniModalVisible(false)}
        title={Strings.auth.register.universityLabel}
      />
      <PickerModal
        visible={specModalVisible}
        options={CAREERS.map(c => ({ value: c.id, label: c.title, icon: c.icon }))}
        onSelect={(val) => { setSpecialty(val); setSpecModalVisible(false); }}
        onClose={() => setSpecModalVisible(false)}
        title={Strings.auth.register.specialtyLabel}
      />
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  keyboardView: { flex: 1, backgroundColor: Colors.background.card },
  header: {
    paddingHorizontal: 20, paddingBottom: 28, alignItems: 'center',
  },
  backBtn: { alignSelf: 'flex-start', marginBottom: 8 },
  headerTitle: {
    fontFamily: Typography.fontFamily.bold, fontSize: Typography.fontSize['2xl'],
    color: Colors.text.white, textAlign: 'center',
  },
  headerSubtitle: {
    fontFamily: Typography.fontFamily.regular, fontSize: Typography.fontSize.base,
    color: 'rgba(255,255,255,0.85)', marginTop: 4,
  },
  scroll: { flex: 1, backgroundColor: Colors.background.card },
  formContent: { paddingHorizontal: 24, paddingTop: 28 },
  nameRow: { flexDirection: 'row', gap: 12 },
  halfInput: { flex: 1, marginBottom: 16 },
  nextButton: { marginTop: 8 },
  nextGradient: {
    borderRadius: 16, paddingVertical: 15, alignItems: 'center', justifyContent: 'center',
  },
  nextText: {
    fontFamily: Typography.fontFamily.semiBold, fontSize: Typography.fontSize.lg,
    color: Colors.text.white,
  },
  loginRow: {
    flexDirection: 'row', justifyContent: 'center', gap: 6, marginTop: 20,
  },
  loginHint: {
    fontFamily: Typography.fontFamily.regular, fontSize: Typography.fontSize.base,
    color: Colors.text.secondary,
  },
  loginLink: {
    fontFamily: Typography.fontFamily.semiBold, fontSize: Typography.fontSize.base,
    color: Colors.primary.purple,
  },
});

export default RegisterStep1Screen;
