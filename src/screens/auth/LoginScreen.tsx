import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowRight, Phone, CreditCard } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../../theme';
import { useRequestPhoneOtp, useRequestAbhaOtp } from '../../api/authApi';
import type { AuthStackParamList } from '../../navigation/AuthStack';

type NavigationProp = NativeStackNavigationProp<AuthStackParamList>;

type LoginMode = 'phone' | 'abha';

export function LoginScreen() {
  const navigation = useNavigation<NavigationProp>();
  const [mode, setMode] = useState<LoginMode>('phone');

  const requestPhoneOtp = useRequestPhoneOtp();
  const requestAbhaOtp = useRequestAbhaOtp();

  const [phoneValue, setPhoneValue] = useState('');
  const [abhaValue, setAbhaValue] = useState('');
  const [error, setError] = useState('');

  const handlePhoneSubmit = async () => {
    setError('');
    if (phoneValue.length !== 10 || !/^\d+$/.test(phoneValue)) {
      setError('Please enter a valid 10-digit mobile number.');
      return;
    }
    try {
      const result = await requestPhoneOtp.mutateAsync({ phone: `+91${phoneValue}` });
      navigation.navigate('Otp', {
        phone: `+91${phoneValue}`,
        txnId: result.txnId,
        mode: 'phone',
      });
    } catch (e: any) {
      setError(e.message ?? 'Failed to send OTP.');
    }
  };

  const handleAbhaSubmit = async () => {
    setError('');
    if (!abhaValue.trim()) {
      setError('Please enter your ABHA ID.');
      return;
    }
    try {
      const result = await requestAbhaOtp.mutateAsync({ abhaId: abhaValue.trim() });
      navigation.navigate('Otp', {
        abhaId: abhaValue.trim(),
        txnId: result.txnId,
        mode: 'abha',
      });
    } catch (e: any) {
      setError(e.message ?? 'Failed to send OTP.');
    }
  };

  const isLoading = requestPhoneOtp.isPending || requestAbhaOtp.isPending;

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Header Gradient */}
          <LinearGradient
            colors={[Colors.tealBg, Colors.blueBg]}
            style={styles.headerGradient}
          >
            <View style={styles.logoRow}>
              <Text style={styles.logoEmoji}>🩺</Text>
              <Text style={styles.brandName}>Bionex</Text>
            </View>
            <Text style={styles.tagline}>Your complete health ecosystem</Text>
          </LinearGradient>

          {/* Card */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Welcome Back</Text>
            <Text style={styles.cardSubtitle}>Sign in to access your health records</Text>

            {/* Mode Toggle */}
            <View style={styles.modeToggle}>
              <TouchableOpacity
                id="btn-phone-mode"
                onPress={() => { setMode('phone'); setError(''); }}
                style={[styles.modeBtn, mode === 'phone' && styles.modeBtnActive]}
              >
                <Phone size={15} color={mode === 'phone' ? Colors.royalBlue : Colors.textMuted} strokeWidth={2} />
                <Text style={[styles.modeBtnText, mode === 'phone' && styles.modeBtnTextActive]}>
                  Mobile Number
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                id="btn-abha-mode"
                onPress={() => { setMode('abha'); setError(''); }}
                style={[styles.modeBtn, mode === 'abha' && styles.modeBtnActive]}
              >
                <CreditCard size={15} color={mode === 'abha' ? Colors.royalBlue : Colors.textMuted} strokeWidth={2} />
                <Text style={[styles.modeBtnText, mode === 'abha' && styles.modeBtnTextActive]}>
                  ABHA ID
                </Text>
              </TouchableOpacity>
            </View>

            {/* Form */}
            {mode === 'phone' ? (
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Mobile Number</Text>
                <View style={styles.phoneRow}>
                  <View style={styles.countryCode}>
                    <Text style={styles.countryCodeText}>🇮🇳 +91</Text>
                  </View>
                  <TextInput
                    id="input-phone"
                    style={styles.phoneInput}
                    placeholder="Enter 10-digit number"
                    placeholderTextColor={Colors.textMuted}
                    keyboardType="phone-pad"
                    maxLength={10}
                    value={phoneValue}
                    onChangeText={setPhoneValue}
                  />
                </View>
              </View>
            ) : (
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>ABHA ID / Address</Text>
                <TextInput
                  id="input-abha"
                  style={styles.textInput}
                  placeholder="Enter ABHA ID (xx-xxxx-xxxx-xxxx)"
                  placeholderTextColor={Colors.textMuted}
                  autoCapitalize="none"
                  value={abhaValue}
                  onChangeText={setAbhaValue}
                />
              </View>
            )}

            {/* Error */}
            {!!error && (
              <View style={styles.errorBanner}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            {/* Submit */}
            <TouchableOpacity
              id="btn-send-otp"
              onPress={mode === 'phone' ? handlePhoneSubmit : handleAbhaSubmit}
              disabled={isLoading}
              activeOpacity={0.85}
              style={styles.submitBtn}
            >
              <LinearGradient
                colors={[Colors.royalBlue, Colors.royalBlueDark]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.submitGradient}
              >
                {isLoading ? (
                  <ActivityIndicator color={Colors.white} size="small" />
                ) : (
                  <>
                    <Text style={styles.submitText}>Send OTP</Text>
                    <ArrowRight color={Colors.white} size={18} strokeWidth={2.5} />
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>

            {/* Terms */}
            <Text style={styles.terms}>
              By continuing, you agree to Bionex's{' '}
              <Text style={styles.termsLink}>Terms & Privacy Policy</Text>
            </Text>

            {/* ABHA badge */}
            <View style={styles.abhaInfo}>
              <Text style={styles.abhaInfoText}>
                🏥 ABHA Integrated · 🔒 HIPAA Compliant · 🛡️ End-to-End Encrypted
              </Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scrollContent: { flexGrow: 1 },
  headerGradient: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing['2xl'],
    paddingBottom: Spacing['3xl'],
    alignItems: 'center',
  },
  logoRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.sm },
  logoEmoji: { fontSize: 28 },
  brandName: {
    fontSize: Typography.fontSize['3xl'],
    fontFamily: Typography.fontFamily.bold,
    color: Colors.teal,
  },
  tagline: {
    fontSize: Typography.fontSize.base,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  card: {
    margin: Spacing.base,
    marginTop: -Spacing['2xl'],
    backgroundColor: Colors.white,
    borderRadius: BorderRadius['2xl'],
    padding: Spacing.xl,
    ...Shadows.lg,
  },
  cardTitle: {
    fontSize: Typography.fontSize['3xl'],
    fontFamily: Typography.fontFamily.bold,
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: Typography.fontSize.base,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.textSecondary,
    marginBottom: Spacing.xl,
  },
  modeToggle: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: 4,
    marginBottom: Spacing.xl,
    gap: 4,
  },
  modeBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
  },
  modeBtnActive: { backgroundColor: Colors.white, ...Shadows.sm },
  modeBtnText: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.medium,
    color: Colors.textMuted,
  },
  modeBtnTextActive: { color: Colors.royalBlue },
  inputGroup: { marginBottom: Spacing.base },
  inputLabel: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.semiBold,
    color: Colors.textSecondary,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  phoneRow: {
    flexDirection: 'row',
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
  },
  countryCode: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.surface,
    borderRightWidth: 1,
    borderRightColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  countryCodeText: {
    fontSize: Typography.fontSize.base,
    fontFamily: Typography.fontFamily.medium,
    color: Colors.textPrimary,
  },
  phoneInput: {
    flex: 1,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    fontSize: Typography.fontSize.lg,
    fontFamily: Typography.fontFamily.medium,
    color: Colors.textPrimary,
  },
  textInput: {
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    fontSize: Typography.fontSize.base,
    fontFamily: Typography.fontFamily.medium,
    color: Colors.textPrimary,
  },
  errorBanner: {
    backgroundColor: Colors.errorBg,
    borderRadius: BorderRadius.sm,
    padding: Spacing.sm,
    marginBottom: Spacing.md,
  },
  errorText: {
    color: Colors.error,
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.medium,
  },
  submitBtn: { marginBottom: Spacing.base, borderRadius: BorderRadius.full, overflow: 'hidden' },
  submitGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.md + 2,
  },
  submitText: {
    color: Colors.white,
    fontSize: Typography.fontSize.lg,
    fontFamily: Typography.fontFamily.semiBold,
  },
  terms: {
    fontSize: Typography.fontSize.xs,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.textMuted,
    textAlign: 'center',
    marginBottom: Spacing.base,
  },
  termsLink: { color: Colors.royalBlue, fontFamily: Typography.fontFamily.medium },
  abhaInfo: {
    backgroundColor: Colors.tealBg,
    borderRadius: BorderRadius.sm,
    padding: Spacing.sm,
  },
  abhaInfoText: {
    fontSize: Typography.fontSize.xs,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.tealDark,
    textAlign: 'center',
  },
});
