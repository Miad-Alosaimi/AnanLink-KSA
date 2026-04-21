import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
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

const LoginScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const insets = useSafeAreaInsets();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string; general?: string }>({});

  const validate = () => {
    const newErrors: typeof errors = {};
    if (!email.trim()) {
      newErrors.email = Strings.auth.errors.emailRequired;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = Strings.auth.errors.emailInvalid;
    }
    if (!password.trim()) {
      newErrors.password = Strings.auth.errors.passwordRequired;
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validate()) return;
    setIsLoading(true);
    setErrors({});
    const result = await login(email, password);
    setIsLoading(false);
    if (!result.success) {
      setErrors({ general: result.error });
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.keyboardView}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar style="light" />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Gradient Header */}
        <LinearGradient
          colors={[Colors.gradient.start, Colors.gradient.end]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.header, { paddingTop: insets.top + 20 }]}
        >
          <View style={styles.decorCircle1} />
          <View style={styles.decorCircle2} />
          <View style={styles.logoBox}>
            <Text style={styles.logoEmoji}>✦</Text>
          </View>
          <Text style={styles.appName}>{Strings.app.name}</Text>
        </LinearGradient>

        {/* White form card */}
        <View style={styles.formCard}>
          <Text style={styles.formTitle}>{Strings.auth.login.title}</Text>
          <Text style={styles.formSubtitle}>{Strings.auth.login.subtitle}</Text>

          {errors.general ? (
            <View style={styles.errorBanner}>
              <Ionicons name="alert-circle-outline" size={16} color={Colors.status.error} />
              <Text style={styles.errorBannerText}>{errors.general}</Text>
            </View>
          ) : null}

          <Input
            label={Strings.auth.login.emailLabel}
            value={email}
            onChangeText={setEmail}
            placeholder={Strings.auth.login.emailPlaceholder}
            keyboardType="email-address"
            autoCapitalize="none"
            leftIcon="mail-outline"
            error={errors.email}
          />

          <Input
            label={Strings.auth.login.passwordLabel}
            value={password}
            onChangeText={setPassword}
            placeholder={Strings.auth.login.passwordPlaceholder}
            secureTextEntry
            leftIcon="lock-closed-outline"
            error={errors.password}
          />

          <TouchableOpacity
            onPress={() => navigation.navigate('ForgotPassword')}
            style={styles.forgotLink}
          >
            <Text style={styles.forgotText}>{Strings.auth.login.forgotPassword}</Text>
          </TouchableOpacity>

          <Button
            title={Strings.auth.login.loginButton}
            onPress={handleLogin}
            isLoading={isLoading}
            style={styles.loginButton}
          />

          {/* Social Auth */}
          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>{Strings.auth.login.orDivider}</Text>
            <View style={styles.dividerLine} />
          </View>

          <View style={styles.socialRow}>
            {[
              { label: 'GitHub', icon: 'logo-github' },
              { label: 'Apple', icon: 'logo-apple' },
              { label: 'Google', icon: 'logo-google' },
            ].map((social) => (
              <TouchableOpacity key={social.label} style={styles.socialButton} activeOpacity={0.8}>
                <Ionicons name={social.icon as any} size={18} color={Colors.text.primary} />
                <Text style={styles.socialText}>{social.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.registerRow}>
            <Text style={styles.registerText}>{Strings.auth.login.noAccount}</Text>
            <TouchableOpacity onPress={() => navigation.navigate('RegisterStep1')}>
              <Text style={styles.registerLink}>{Strings.auth.login.signUp}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  keyboardView: { flex: 1, backgroundColor: Colors.background.app },
  scroll: { flex: 1 },
  scrollContent: { flexGrow: 1 },
  header: {
    minHeight: 220,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 40,
    overflow: 'hidden',
  },
  decorCircle1: {
    position: 'absolute', width: 250, height: 250, borderRadius: 125,
    backgroundColor: 'rgba(255,255,255,0.07)', top: -60, right: -60,
  },
  decorCircle2: {
    position: 'absolute', width: 150, height: 150, borderRadius: 75,
    backgroundColor: 'rgba(255,255,255,0.07)', bottom: -30, left: -30,
  },
  logoBox: {
    width: 72, height: 72, borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.4)',
    marginBottom: 12,
  },
  logoEmoji: { fontSize: 32, color: Colors.text.white },
  appName: {
    fontFamily: Typography.fontFamily.bold,
    fontSize: Typography.fontSize['2xl'],
    color: Colors.text.white,
  },
  formCard: {
    flex: 1,
    backgroundColor: Colors.background.card,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    marginTop: -24,
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 40,
  },
  formTitle: {
    fontFamily: Typography.fontFamily.bold,
    fontSize: Typography.fontSize['2xl'],
    color: Colors.text.primary,
    textAlign: 'right',
    marginBottom: 6,
  },
  formSubtitle: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.fontSize.base,
    color: Colors.text.secondary,
    textAlign: 'right',
    marginBottom: 24,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 16,
    gap: 8,
    borderWidth: 1,
    borderColor: '#FCA5A5',
  },
  errorBannerText: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.fontSize.sm,
    color: Colors.status.error,
    textAlign: 'right',
    flex: 1,
  },
  forgotLink: { alignSelf: 'flex-end', marginBottom: 20, marginTop: -8 },
  forgotText: {
    fontFamily: Typography.fontFamily.medium,
    fontSize: Typography.fontSize.sm,
    color: Colors.primary.purple,
  },
  loginButton: { marginBottom: 24 },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 10,
  },
  dividerLine: { flex: 1, height: 1, backgroundColor: Colors.ui.border },
  dividerText: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.fontSize.sm,
    color: Colors.text.secondary,
  },
  socialRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 28,
  },
  socialButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderWidth: 1.5,
    borderColor: Colors.ui.border,
    borderRadius: 12,
    paddingVertical: 11,
    backgroundColor: Colors.background.card,
  },
  socialText: {
    fontFamily: Typography.fontFamily.medium,
    fontSize: Typography.fontSize.sm,
    color: Colors.text.primary,
  },
  registerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
    alignItems: 'center',
  },
  registerText: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.fontSize.base,
    color: Colors.text.secondary,
  },
  registerLink: {
    fontFamily: Typography.fontFamily.semiBold,
    fontSize: Typography.fontSize.base,
    color: Colors.primary.purple,
  },
});

export default LoginScreen;
