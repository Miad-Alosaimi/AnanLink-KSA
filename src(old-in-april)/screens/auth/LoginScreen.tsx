import React, { useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  KeyboardAvoidingView, Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
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
    const e: typeof errors = {};
    if (!email.trim()) e.email = Strings.auth.errors.emailRequired;
    else if (!/\S+@\S+\.\S+/.test(email)) e.email = Strings.auth.errors.emailInvalid;
    if (!password.trim()) e.password = Strings.auth.errors.passwordRequired;
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleLogin = async () => {
    if (!validate()) return;
    setIsLoading(true);
    setErrors({});
    const result = await login(email, password);
    setIsLoading(false);
    if (!result.success) setErrors({ general: result.error });
  };

  return (
    <KeyboardAvoidingView style={styles.root} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <StatusBar style="light" />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <LinearGradient
          colors={[Colors.primary.purple, Colors.primary.teal]}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
          style={[styles.header, { paddingTop: insets.top + 24 }]}
        >
          <View style={styles.logoBox}>
            <Text style={styles.logoText}>✦</Text>
          </View>
          <Text style={styles.appName}>{Strings.app.name}</Text>
          <Text style={styles.tagline}>{Strings.app.tagline}</Text>
        </LinearGradient>

        <View style={styles.card}>
          <Text style={styles.title}>{Strings.auth.login.title}</Text>
          <Text style={styles.subtitle}>{Strings.auth.login.subtitle}</Text>

          {errors.general ? (
            <View style={styles.errorBanner}>
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

          <Button title={Strings.auth.login.loginButton} onPress={handleLogin} isLoading={isLoading} style={styles.btn} />

          <View style={styles.registerRow}>
            <Text style={styles.registerText}>{Strings.auth.login.noAccount}</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
              <Text style={styles.registerLink}>{Strings.auth.login.signUp}</Text>
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
    minHeight: 240, alignItems: 'center', justifyContent: 'center',
    paddingBottom: 48, paddingHorizontal: 24,
  },
  logoBox: {
    width: 68, height: 68, borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 14, borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.35)',
  },
  logoText: { fontSize: 30, color: '#fff' },
  appName: { fontFamily: Typography.fontFamily.bold, fontSize: Typography.fontSize['2xl'], color: '#fff', marginBottom: 4 },
  tagline: { fontFamily: Typography.fontFamily.regular, fontSize: Typography.fontSize.sm, color: 'rgba(255,255,255,0.8)', textAlign: 'center' },
  card: {
    flex: 1, backgroundColor: Colors.background.card,
    borderTopLeftRadius: 28, borderTopRightRadius: 28,
    marginTop: -20, paddingHorizontal: 24, paddingTop: 32, paddingBottom: 40,
  },
  title: { fontFamily: Typography.fontFamily.bold, fontSize: Typography.fontSize['2xl'], color: Colors.text.primary, textAlign: 'right', marginBottom: 6 },
  subtitle: { fontFamily: Typography.fontFamily.regular, fontSize: Typography.fontSize.base, color: Colors.text.secondary, textAlign: 'right', marginBottom: 24 },
  errorBanner: {
    backgroundColor: '#FEF2F2', borderRadius: 10, padding: 12,
    marginBottom: 16, borderWidth: 1, borderColor: '#FCA5A5',
  },
  errorBannerText: { fontFamily: Typography.fontFamily.regular, fontSize: Typography.fontSize.sm, color: Colors.status.error, textAlign: 'right' },
  btn: { marginTop: 8, marginBottom: 24 },
  registerRow: { flexDirection: 'row', justifyContent: 'center', gap: 6 },
  registerText: { fontFamily: Typography.fontFamily.regular, fontSize: Typography.fontSize.base, color: Colors.text.secondary },
  registerLink: { fontFamily: Typography.fontFamily.semiBold, fontSize: Typography.fontSize.base, color: Colors.primary.purple },
});

export default LoginScreen;
