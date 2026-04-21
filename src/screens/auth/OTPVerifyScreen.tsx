import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Colors, Typography, Strings } from '../../constants';
import { AuthStackParamList, RootStackParamList } from '../../types';

type Nav = NativeStackNavigationProp<RootStackParamList>;
type Route = RouteProp<AuthStackParamList, 'OTPVerify'>;

const OTP_LENGTH = 4;
const RESEND_SECONDS = 60;

const OTPVerifyScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const insets = useSafeAreaInsets();

  const { email } = route.params;

  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(''));
  const [seconds, setSeconds] = useState(RESEND_SECONDS);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verified, setVerified] = useState(false);

  const inputRefs = useRef<(TextInput | null)[]>([]);

  useEffect(() => {
    if (seconds > 0) {
      const timer = setTimeout(() => setSeconds((s) => s - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [seconds]);

  const handleChange = (text: string, index: number) => {
    const cleaned = text.replace(/[^0-9]/g, '').slice(-1);
    const newOtp = [...otp];
    newOtp[index] = cleaned;
    setOtp(newOtp);

    if (cleaned && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto verify when all filled
    if (cleaned && newOtp.filter(Boolean).length === OTP_LENGTH) {
      setTimeout(() => handleVerify(newOtp), 300);
    }
  };

  const handleKeyPress = (key: string, index: number) => {
    if (key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async (currentOtp = otp) => {
    if (currentOtp.some((d) => !d)) return;
    setIsVerifying(true);

    // MVP: accept any 4-digit OTP
    await new Promise((r) => setTimeout(r, 800));
    setIsVerifying(false);
    setVerified(true);

    setTimeout(() => {
      navigation.reset({ index: 0, routes: [{ name: 'Main' }] });
    }, 1500);
  };

  const handleResend = () => {
    setSeconds(RESEND_SECONDS);
    setOtp(Array(OTP_LENGTH).fill(''));
    inputRefs.current[0]?.focus();
  };

  if (verified) {
    return (
      <View style={[styles.successContainer, { paddingTop: insets.top }]}>
        <LinearGradient
          colors={[Colors.gradient.start, Colors.gradient.end]}
          style={styles.successGradient}
        >
          <View style={styles.successIcon}>
            <Ionicons name="checkmark-circle" size={80} color={Colors.text.white} />
          </View>
          <Text style={styles.successTitle}>{Strings.auth.otp.successMessage}</Text>
        </LinearGradient>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={[styles.container, { paddingTop: insets.top }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <LinearGradient
        colors={[Colors.gradient.start, Colors.gradient.end]}
        style={styles.header}
      >
        <View style={styles.emailIconBox}>
          <Ionicons name="mail" size={40} color={Colors.text.white} />
        </View>
        <Text style={styles.headerTitle}>{Strings.auth.otp.title}</Text>
        <Text style={styles.headerSubtitle}>{Strings.auth.otp.subtitle}</Text>
        <Text style={styles.emailText}>{email}</Text>
      </LinearGradient>

      <View style={styles.formCard}>
        {/* OTP Inputs */}
        <View style={styles.otpRow}>
          {Array(OTP_LENGTH).fill(null).map((_, i) => (
            <TextInput
              key={i}
              ref={(ref) => { inputRefs.current[i] = ref; }}
              style={[styles.otpInput, otp[i] ? styles.otpInputFilled : null]}
              value={otp[i]}
              onChangeText={(t) => handleChange(t, i)}
              onKeyPress={({ nativeEvent }) => handleKeyPress(nativeEvent.key, i)}
              keyboardType="numeric"
              maxLength={1}
              textAlign="center"
              autoFocus={i === 0}
            />
          ))}
        </View>

        {/* Resend timer */}
        <View style={styles.resendRow}>
          {seconds > 0 ? (
            <Text style={styles.resendTimer}>
              {Strings.auth.otp.resendIn} {seconds} {Strings.auth.otp.seconds}
            </Text>
          ) : (
            <TouchableOpacity onPress={handleResend}>
              <Text style={styles.resendLink}>{Strings.auth.otp.resendCode}</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Verify button */}
        <TouchableOpacity
          onPress={() => handleVerify()}
          disabled={otp.some((d) => !d) || isVerifying}
          activeOpacity={0.9}
        >
          <LinearGradient
            colors={
              otp.some((d) => !d) || isVerifying
                ? [Colors.ui.disabled, Colors.ui.disabled]
                : [Colors.gradient.start, Colors.gradient.end]
            }
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
            style={styles.verifyButton}
          >
            <Text style={styles.verifyText}>
              {isVerifying ? '...' : Strings.auth.otp.verifyButton}
            </Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.changeEmailBtn}>
          <Text style={styles.changeEmailText}>{Strings.auth.otp.changeEmail}</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background.card },
  header: {
    paddingTop: 20, paddingBottom: 36, paddingHorizontal: 24, alignItems: 'center', gap: 8,
  },
  emailIconBox: {
    width: 80, height: 80, borderRadius: 24, backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center', justifyContent: 'center', marginBottom: 8,
  },
  headerTitle: {
    fontFamily: Typography.fontFamily.bold, fontSize: Typography.fontSize['2xl'],
    color: Colors.text.white,
  },
  headerSubtitle: {
    fontFamily: Typography.fontFamily.regular, fontSize: Typography.fontSize.base,
    color: 'rgba(255,255,255,0.85)', textAlign: 'center',
  },
  emailText: {
    fontFamily: Typography.fontFamily.semiBold, fontSize: Typography.fontSize.base,
    color: Colors.text.white,
  },
  formCard: {
    flex: 1, backgroundColor: Colors.background.card,
    borderTopLeftRadius: 30, borderTopRightRadius: 30,
    marginTop: -24, paddingTop: 40, paddingHorizontal: 32,
  },
  otpRow: {
    flexDirection: 'row', justifyContent: 'center', gap: 12, marginBottom: 24,
  },
  otpInput: {
    width: 64, height: 64, borderRadius: 16,
    borderWidth: 2, borderColor: Colors.ui.border,
    backgroundColor: Colors.ui.inputBg,
    fontFamily: Typography.fontFamily.bold, fontSize: Typography.fontSize['2xl'],
    color: Colors.text.primary, textAlign: 'center',
  },
  otpInputFilled: {
    borderColor: Colors.primary.purple, backgroundColor: Colors.opportunity.hackathonLight,
  },
  resendRow: { alignItems: 'center', marginBottom: 28 },
  resendTimer: {
    fontFamily: Typography.fontFamily.regular, fontSize: Typography.fontSize.base,
    color: Colors.text.secondary,
  },
  resendLink: {
    fontFamily: Typography.fontFamily.semiBold, fontSize: Typography.fontSize.base,
    color: Colors.primary.purple,
  },
  verifyButton: {
    borderRadius: 16, paddingVertical: 15, alignItems: 'center',
  },
  verifyText: {
    fontFamily: Typography.fontFamily.semiBold, fontSize: Typography.fontSize.lg,
    color: Colors.text.white,
  },
  changeEmailBtn: { alignItems: 'center', marginTop: 16 },
  changeEmailText: {
    fontFamily: Typography.fontFamily.medium, fontSize: Typography.fontSize.base,
    color: Colors.text.secondary,
  },
  // Success state
  successContainer: { flex: 1 },
  successGradient: {
    flex: 1, alignItems: 'center', justifyContent: 'center', gap: 20,
  },
  successIcon: {},
  successTitle: {
    fontFamily: Typography.fontFamily.bold, fontSize: Typography.fontSize.xl,
    color: Colors.text.white, textAlign: 'center', paddingHorizontal: 32,
  },
});

export default OTPVerifyScreen;
