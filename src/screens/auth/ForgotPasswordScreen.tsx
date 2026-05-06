import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Colors, Typography, Strings } from '../../constants';
import { Input } from '../../components/common';

const ForgotPasswordScreen: React.FC = () => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSend = async () => {
    if (!email.trim()) {
      setEmailError(Strings.auth.errors.emailRequired);
      return;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setEmailError(Strings.auth.errors.emailInvalid);
      return;
    }
    setEmailError('');
    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 1000));
    setIsLoading(false);
    setSent(true);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <LinearGradient
        colors={Colors.gradient.all}
        style={[styles.header, { paddingTop: insets.top + 16 }]}
      >
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="chevron-forward" size={24} color={Colors.text.white} />
        </TouchableOpacity>
        <View style={styles.keyIcon}>
          <Ionicons name="key" size={40} color={Colors.text.white} />
        </View>
        <Text style={styles.headerTitle}>{Strings.auth.forgotPassword.title}</Text>
        <Text style={styles.headerSubtitle}>{Strings.auth.forgotPassword.subtitle}</Text>
      </LinearGradient>

      <ScrollView
        contentContainerStyle={[styles.formContent, { paddingBottom: insets.bottom + 32 }]}
        keyboardShouldPersistTaps="handled"
      >
        {sent ? (
          <View style={styles.successBox}>
            <Ionicons name="checkmark-circle" size={60} color={Colors.status.success} />
            <Text style={styles.successTitle}>{Strings.auth.forgotPassword.successTitle}</Text>
            <Text style={styles.successMessage}>{Strings.auth.forgotPassword.successMessage}</Text>
          </View>
        ) : (
          <>
            <Input
              label={Strings.auth.forgotPassword.emailLabel}
              value={email}
              onChangeText={setEmail}
              placeholder={Strings.auth.forgotPassword.emailPlaceholder}
              keyboardType="email-address"
              leftIcon="mail-outline"
              error={emailError}
            />

            <TouchableOpacity onPress={handleSend} disabled={isLoading} activeOpacity={0.9}>
              <LinearGradient
                colors={Colors.gradient.all}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                style={styles.sendButton}
              >
                <Text style={styles.sendText}>
                  {isLoading ? '...' : Strings.auth.forgotPassword.sendButton}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </>
        )}

        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backLink}>
          <Ionicons name="arrow-back-outline" size={16} color={Colors.primary.purple} />
          <Text style={styles.backLinkText}>{Strings.auth.forgotPassword.backToLogin}</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background.card },
  header: {
    paddingHorizontal: 20, paddingBottom: 36, alignItems: 'center', gap: 8,
  },
  backBtn: { alignSelf: 'flex-start', marginBottom: 8 },
  keyIcon: {
    width: 80, height: 80, borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center',
  },
  headerTitle: {
    fontFamily: Typography.fontFamily.bold, fontSize: Typography.fontSize['2xl'],
    color: Colors.text.white, textAlign: 'center',
  },
  headerSubtitle: {
    fontFamily: Typography.fontFamily.regular, fontSize: Typography.fontSize.base,
    color: 'rgba(255,255,255,0.85)', textAlign: 'center', paddingHorizontal: 16,
  },
  formContent: {
    paddingHorizontal: 24, paddingTop: 32,
  },
  sendButton: {
    borderRadius: 16, paddingVertical: 15, alignItems: 'center',
  },
  sendText: {
    fontFamily: Typography.fontFamily.semiBold, fontSize: Typography.fontSize.lg,
    color: Colors.text.white,
  },
  successBox: { alignItems: 'center', paddingVertical: 32, gap: 12 },
  successTitle: {
    fontFamily: Typography.fontFamily.bold, fontSize: Typography.fontSize.xl,
    color: Colors.text.primary, textAlign: 'center',
  },
  successMessage: {
    fontFamily: Typography.fontFamily.regular, fontSize: Typography.fontSize.base,
    color: Colors.text.secondary, textAlign: 'center', lineHeight: 22,
  },
  backLink: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 6, marginTop: 24,
  },
  backLinkText: {
    fontFamily: Typography.fontFamily.medium, fontSize: Typography.fontSize.base,
    color: Colors.primary.purple,
  },
});

export default ForgotPasswordScreen;
