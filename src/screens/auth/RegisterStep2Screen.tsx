import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Colors, Typography, Strings } from '../../constants';
import { AuthStackParamList } from '../../types';
import { Input } from '../../components/common';
import { useAuth } from '../../context';

type Nav = NativeStackNavigationProp<AuthStackParamList>;
type Route = RouteProp<AuthStackParamList, 'RegisterStep2'>;

const YEAR_OPTIONS = ['1', '2', '3', '4', '5'];

const getPasswordStrength = (password: string): { level: number; label: string; color: string } => {
  if (password.length === 0) return { level: 0, label: '', color: Colors.ui.border };
  if (password.length < 6) return { level: 1, label: Strings.auth.passwordStrength.weak, color: Colors.status.error };
  if (password.length < 8 || !/[A-Z]/.test(password) || !/[0-9]/.test(password)) {
    return { level: 2, label: Strings.auth.passwordStrength.medium, color: Colors.status.warning };
  }
  return { level: 3, label: Strings.auth.passwordStrength.strong, color: Colors.status.success };
};

const RegisterStep2Screen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const insets = useSafeAreaInsets();
  const { register } = useAuth();

  const { step1Data } = route.params;

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [academicYear, setAcademicYear] = useState(2);
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ password?: string; confirm?: string; skills?: string; general?: string }>({});

  const strength = getPasswordStrength(password);

  const toggleSkill = (skill: string) => {
    setSelectedSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
    );
  };

  const validate = () => {
    const newErrors: typeof errors = {};
    if (!password) newErrors.password = Strings.auth.errors.passwordRequired;
    else if (password.length < 8) newErrors.password = Strings.auth.errors.passwordMin;
    if (password !== confirmPassword) newErrors.confirm = Strings.auth.errors.passwordMismatch;
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCreateAccount = async () => {
    if (!validate()) return;
    setIsLoading(true);
    const result = await register({
      ...step1Data,
      password,
      academicYear,
      skills: selectedSkills,
    });
    setIsLoading(false);
    if (!result.success) {
      setErrors({ general: result.error });
    } else {
      navigation.navigate('OTPVerify', { email: step1Data.email });
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.keyboardView}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <LinearGradient
        colors={[Colors.gradient.start, Colors.gradient.end]}
        style={[styles.header, { paddingTop: insets.top + 16 }]}
      >
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="chevron-forward" size={24} color={Colors.text.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{Strings.auth.register.title}</Text>
        <Text style={styles.headerSubtitle}>{Strings.auth.register.step2Title}</Text>
      </LinearGradient>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.formContent, { paddingBottom: insets.bottom + 32 }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Step indicator */}
        <View style={styles.stepRow}>
          {[1, 2, 3].map((s, i) => (
            <View key={s} style={[styles.stepDot, i === 1 ? styles.stepActive : i < 1 ? styles.stepDone : styles.stepInactive]} />
          ))}
        </View>

        {errors.general ? (
          <View style={styles.errorBanner}>
            <Text style={styles.errorBannerText}>{errors.general}</Text>
          </View>
        ) : null}

        <Input
          label={Strings.auth.register.passwordLabel}
          value={password}
          onChangeText={setPassword}
          placeholder={Strings.auth.register.passwordPlaceholder}
          secureTextEntry
          leftIcon="lock-closed-outline"
          error={errors.password}
        />

        {/* Password strength bar */}
        {password.length > 0 && (
          <View style={styles.strengthContainer}>
            <View style={styles.strengthBar}>
              {[1, 2, 3].map((level) => (
                <View
                  key={level}
                  style={[
                    styles.strengthSegment,
                    {
                      backgroundColor:
                        level <= strength.level ? strength.color : Colors.ui.border,
                    },
                  ]}
                />
              ))}
            </View>
            <Text style={[styles.strengthLabel, { color: strength.color }]}>
              {strength.label}
            </Text>
          </View>
        )}

        <Input
          label={Strings.auth.register.confirmPasswordLabel}
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          placeholder={Strings.auth.register.confirmPasswordPlaceholder}
          secureTextEntry
          leftIcon="lock-closed-outline"
          error={errors.confirm}
        />

        {/* Academic year */}
        <Text style={styles.sectionLabel}>{Strings.auth.register.academicYearLabel}</Text>
        <View style={styles.yearRow}>
          {YEAR_OPTIONS.map((y) => (
            <TouchableOpacity
              key={y}
              onPress={() => setAcademicYear(Number(y))}
              style={[
                styles.yearChip,
                academicYear === Number(y) && styles.yearChipActive,
              ]}
            >
              <Text
                style={[
                  styles.yearText,
                  academicYear === Number(y) && styles.yearTextActive,
                ]}
              >
                {y}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Skills */}
        <Text style={styles.sectionLabel}>{Strings.auth.register.skillsLabel}</Text>
        <View style={styles.skillsGrid}>
          {Strings.auth.skills.map((skill) => {
            const isSelected = selectedSkills.includes(skill);
            return (
              <TouchableOpacity
                key={skill}
                onPress={() => toggleSkill(skill)}
                style={[styles.skillChip, isSelected && styles.skillChipActive]}
              >
                <Text style={[styles.skillText, isSelected && styles.skillTextActive]}>
                  {skill}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <TouchableOpacity
          onPress={handleCreateAccount}
          disabled={isLoading}
          activeOpacity={0.9}
          style={styles.createButton}
        >
          <LinearGradient
            colors={isLoading ? [Colors.ui.disabled, Colors.ui.disabled] : [Colors.gradient.start, Colors.gradient.end]}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
            style={styles.createGradient}
          >
            <Text style={styles.createText}>
              {isLoading ? '...' : `${Strings.auth.register.nextButton} 3`}
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </ScrollView>
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
    color: Colors.text.white,
  },
  headerSubtitle: {
    fontFamily: Typography.fontFamily.regular, fontSize: Typography.fontSize.base,
    color: 'rgba(255,255,255,0.85)', marginTop: 4,
  },
  scroll: { flex: 1 },
  formContent: { paddingHorizontal: 24, paddingTop: 24 },
  stepRow: { flexDirection: 'row', gap: 6, marginBottom: 24 },
  stepDot: { flex: 1, height: 4, borderRadius: 2 },
  stepActive: { backgroundColor: Colors.primary.purple },
  stepDone: { backgroundColor: Colors.status.success },
  stepInactive: { backgroundColor: Colors.ui.border },
  errorBanner: {
    backgroundColor: '#FEF2F2', borderRadius: 10, padding: 12, marginBottom: 16,
    borderWidth: 1, borderColor: '#FCA5A5',
  },
  errorBannerText: {
    fontFamily: Typography.fontFamily.regular, fontSize: Typography.fontSize.sm,
    color: Colors.status.error, textAlign: 'right',
  },
  strengthContainer: {
    flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: -8, marginBottom: 12,
  },
  strengthBar: { flex: 1, flexDirection: 'row', gap: 4 },
  strengthSegment: { flex: 1, height: 4, borderRadius: 2 },
  strengthLabel: {
    fontFamily: Typography.fontFamily.medium, fontSize: Typography.fontSize.xs,
  },
  sectionLabel: {
    fontFamily: Typography.fontFamily.semiBold, fontSize: Typography.fontSize.base,
    color: Colors.text.primary, textAlign: 'right', marginBottom: 10,
  },
  yearRow: { flexDirection: 'row', gap: 8, marginBottom: 20 },
  yearChip: {
    width: 48, height: 48, borderRadius: 12, borderWidth: 1.5,
    borderColor: Colors.ui.border, alignItems: 'center', justifyContent: 'center',
    backgroundColor: Colors.background.card,
  },
  yearChipActive: { borderColor: Colors.primary.purple, backgroundColor: Colors.opportunity.hackathonLight },
  yearText: {
    fontFamily: Typography.fontFamily.semiBold, fontSize: Typography.fontSize.base,
    color: Colors.text.secondary,
  },
  yearTextActive: { color: Colors.primary.purple },
  skillsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 24 },
  skillChip: {
    paddingVertical: 7, paddingHorizontal: 14, borderRadius: 20,
    borderWidth: 1.5, borderColor: Colors.ui.border,
    backgroundColor: Colors.background.card,
  },
  skillChipActive: { borderColor: Colors.primary.purple, backgroundColor: Colors.opportunity.hackathonLight },
  skillText: {
    fontFamily: Typography.fontFamily.medium, fontSize: Typography.fontSize.sm,
    color: Colors.text.secondary,
  },
  skillTextActive: { color: Colors.primary.purple },
  createButton: {},
  createGradient: {
    borderRadius: 16, paddingVertical: 15, alignItems: 'center',
  },
  createText: {
    fontFamily: Typography.fontFamily.semiBold, fontSize: Typography.fontSize.lg,
    color: Colors.text.white,
  },
});

export default RegisterStep2Screen;
