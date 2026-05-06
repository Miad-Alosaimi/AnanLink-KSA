import React, { useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  KeyboardAvoidingView, Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

import { Colors, Typography, Strings } from '../../constants';
import { AuthStackParamList } from '../../types';
import { Button, Input } from '../../components/common';
import { useAuth } from '../../context';

type Nav = NativeStackNavigationProp<AuthStackParamList>;

const UNIVERSITIES = Strings.auth.universities;

const RegisterScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const insets = useSafeAreaInsets();
  const { register } = useAuth();

  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '',
    university: '', major: '', academicYear: 1, password: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showUniPicker, setShowUniPicker] = useState(false);

  const set = (key: string, value: string | number) => setForm(f => ({ ...f, [key]: value }));

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.firstName.trim()) e.firstName = Strings.auth.errors.firstNameRequired;
    if (!form.lastName.trim()) e.lastName = Strings.auth.errors.lastNameRequired;
    if (!form.email.trim()) e.email = Strings.auth.errors.emailRequired;
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = Strings.auth.errors.emailInvalid;
    if (!form.university) e.university = Strings.auth.errors.universityRequired;
    if (!form.major.trim()) e.major = Strings.auth.errors.majorRequired;
    if (!form.password.trim()) e.password = Strings.auth.errors.passwordRequired;
    else if (form.password.length < 8) e.password = Strings.auth.errors.passwordMin;
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleRegister = async () => {
    if (!validate()) return;
    setIsLoading(true);
    const result = await register({ ...form });
    setIsLoading(false);
    if (!result.success) setErrors({ general: result.error ?? '' });
  };

  return (
    <KeyboardAvoidingView style={styles.root} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <StatusBar style="light" />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <LinearGradient
          colors={[Colors.primary.purple, Colors.primary.teal]}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
          style={[styles.header, { paddingTop: insets.top + 16 }]}
        >
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={22} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{Strings.auth.register.title}</Text>
        </LinearGradient>

        <View style={styles.card}>
          {errors.general ? (
            <View style={styles.errorBanner}>
              <Text style={styles.errorBannerText}>{errors.general}</Text>
            </View>
          ) : null}

          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Input
                label={Strings.auth.register.firstNameLabel}
                value={form.firstName}
                onChangeText={(v) => set('firstName', v)}
                placeholder={Strings.auth.register.firstNameLabel}
                error={errors.firstName}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Input
                label={Strings.auth.register.lastNameLabel}
                value={form.lastName}
                onChangeText={(v) => set('lastName', v)}
                placeholder={Strings.auth.register.lastNameLabel}
                error={errors.lastName}
              />
            </View>
          </View>

          <Input
            label={Strings.auth.register.emailLabel}
            value={form.email}
            onChangeText={(v) => set('email', v)}
            placeholder={Strings.auth.register.emailPlaceholder}
            keyboardType="email-address"
            autoCapitalize="none"
            leftIcon="mail-outline"
            error={errors.email}
          />

          {/* University Picker */}
          <View style={styles.fieldWrapper}>
            <Text style={styles.label}>{Strings.auth.register.universityLabel}</Text>
            <TouchableOpacity
              style={[styles.pickerBtn, errors.university ? styles.pickerBtnError : null]}
              onPress={() => setShowUniPicker(!showUniPicker)}
            >
              <Text style={form.university ? styles.pickerValue : styles.pickerPlaceholder}>
                {form.university || 'اختر جامعتك'}
              </Text>
              <Ionicons name={showUniPicker ? 'chevron-up' : 'chevron-down'} size={16} color={Colors.text.secondary} />
            </TouchableOpacity>
            {errors.university ? <Text style={styles.errorText}>{errors.university}</Text> : null}
            {showUniPicker && (
              <View style={styles.dropdown}>
                {UNIVERSITIES.map((uni) => (
                  <TouchableOpacity
                    key={uni}
                    style={styles.dropdownItem}
                    onPress={() => { set('university', uni); setShowUniPicker(false); }}
                  >
                    <Text style={[styles.dropdownText, form.university === uni && styles.dropdownSelected]}>
                      {uni}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          <Input
            label={Strings.auth.register.majorLabel}
            value={form.major}
            onChangeText={(v) => set('major', v)}
            placeholder={Strings.auth.register.majorPlaceholder}
            leftIcon="book-outline"
            error={errors.major}
          />

          <Input
            label={Strings.auth.register.passwordLabel}
            value={form.password}
            onChangeText={(v) => set('password', v)}
            placeholder={Strings.auth.register.passwordPlaceholder}
            secureTextEntry
            leftIcon="lock-closed-outline"
            error={errors.password}
          />

          <Button title={Strings.auth.register.createButton} onPress={handleRegister} isLoading={isLoading} style={styles.btn} />

          <View style={styles.loginRow}>
            <Text style={styles.loginText}>{Strings.auth.register.alreadyHaveAccount}</Text>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Text style={styles.loginLink}>{Strings.auth.register.login}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background.app },
  scroll: { flexGrow: 1 },
  header: {
    paddingBottom: 36, paddingHorizontal: 20, minHeight: 130,
    justifyContent: 'flex-end',
  },
  backBtn: { position: 'absolute', top: 50, right: 20 },
  headerTitle: { fontFamily: Typography.fontFamily.bold, fontSize: Typography.fontSize['2xl'], color: '#fff', textAlign: 'right' },
  card: {
    flex: 1, backgroundColor: Colors.background.card,
    borderTopLeftRadius: 28, borderTopRightRadius: 28,
    marginTop: -16, paddingHorizontal: 24, paddingTop: 28, paddingBottom: 40,
  },
  errorBanner: {
    backgroundColor: '#FEF2F2', borderRadius: 10, padding: 12,
    marginBottom: 16, borderWidth: 1, borderColor: '#FCA5A5',
  },
  errorBannerText: { fontFamily: Typography.fontFamily.regular, fontSize: Typography.fontSize.sm, color: Colors.status.error, textAlign: 'right' },
  row: { flexDirection: 'row', gap: 12 },
  fieldWrapper: { marginBottom: 16 },
  label: { fontFamily: Typography.fontFamily.medium, fontSize: Typography.fontSize.sm, color: Colors.text.primary, textAlign: 'right', marginBottom: 6 },
  pickerBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: Colors.ui.inputBg, borderRadius: 12, borderWidth: 1.5,
    borderColor: Colors.ui.border, paddingHorizontal: 14, paddingVertical: 14,
  },
  pickerBtnError: { borderColor: Colors.status.error },
  pickerValue: { fontFamily: Typography.fontFamily.regular, fontSize: Typography.fontSize.base, color: Colors.text.primary },
  pickerPlaceholder: { fontFamily: Typography.fontFamily.regular, fontSize: Typography.fontSize.base, color: Colors.ui.placeholder },
  errorText: { fontFamily: Typography.fontFamily.regular, fontSize: Typography.fontSize.xs, color: Colors.status.error, textAlign: 'right', marginTop: 4 },
  dropdown: {
    backgroundColor: Colors.background.card, borderRadius: 12,
    borderWidth: 1, borderColor: Colors.ui.border,
    marginTop: 4, overflow: 'hidden',
  },
  dropdownItem: { paddingHorizontal: 14, paddingVertical: 13, borderBottomWidth: 1, borderBottomColor: Colors.ui.divider },
  dropdownText: { fontFamily: Typography.fontFamily.regular, fontSize: Typography.fontSize.base, color: Colors.text.primary, textAlign: 'right' },
  dropdownSelected: { color: Colors.primary.purple, fontFamily: Typography.fontFamily.semiBold },
  btn: { marginTop: 8, marginBottom: 24 },
  loginRow: { flexDirection: 'row', justifyContent: 'center', gap: 6 },
  loginText: { fontFamily: Typography.fontFamily.regular, fontSize: Typography.fontSize.base, color: Colors.text.secondary },
  loginLink: { fontFamily: Typography.fontFamily.semiBold, fontSize: Typography.fontSize.base, color: Colors.primary.purple },
});

export default RegisterScreen;
