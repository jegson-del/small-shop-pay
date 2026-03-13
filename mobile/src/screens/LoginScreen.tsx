import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Linking,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/contexts/AuthContext';
import { API_BASE_URL, WEB_BASE_URL } from '@/config/api';
import { colors } from '@/theme/colors';
import { typography } from '@/theme/typography';

const CARD_RADIUS = 24;
const INPUT_RADIUS = 14;

export function LoginScreen() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({});
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);

  const validate = (): boolean => {
    const err: { email?: string; password?: string } = {};
    if (!email.trim()) err.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) err.email = 'Enter a valid email';
    if (!password) err.password = 'Password is required';
    setFieldErrors(err);
    return Object.keys(err).length === 0;
  };

  const handleLogin = async () => {
    setError(null);
    if (!validate()) return;
    setLoading(true);
    try {
      await login(email.trim(), password);
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Login failed';
      const isNetwork = msg.toLowerCase().includes('network') || msg.toLowerCase().includes('failed');
      setError(
        isNetwork
          ? 'Cannot reach server. Use same Wi‑Fi as PC, ensure backend is running (port 8000), and firewall allows it.'
          : msg
      );
    } finally {
      setLoading(false);
    }
  };

  const inputBaseStyle = (focused: boolean, hasError: boolean) => [
    styles.input,
    focused && !hasError && styles.inputFocused,
    hasError && styles.inputError,
  ];

  return (
    <View style={styles.safeArea}>
      <LinearGradient
        colors={['#f8fafc', '#f1f5f9', '#e2e8f0']}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      />
      <View style={styles.shapeBg} pointerEvents="none">
        <View style={[styles.shape, styles.shape1]} />
        <View style={[styles.shape, styles.shape2]} />
        <View style={[styles.shape, styles.shape3]} />
        <View style={[styles.shape, styles.shape4]} />
        <View style={[styles.shape, styles.shape5]} />
      </View>
      <SafeAreaView style={styles.safeContent} edges={['bottom']}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.hero}>
              <Text style={styles.heroTitle}>Welcome back</Text>
              <Text style={styles.heroSubtitle}>
                <Text style={styles.heroSubtitleWhite}>Sign in to continue</Text>
                <Text style={styles.heroSubtitleDark}> to SmallShopPay</Text>
              </Text>
            </View>

            <View style={styles.card}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              value={email}
              onChangeText={(v) => {
                setEmail(v);
                if (fieldErrors.email) setFieldErrors((p) => ({ ...p, email: undefined }));
              }}
              onFocus={() => setEmailFocused(true)}
              onBlur={() => setEmailFocused(false)}
              placeholder="you@example.com"
              placeholderTextColor={colors.textSecondary}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
              autoComplete="email"
              editable={!loading}
              style={inputBaseStyle(emailFocused, !!fieldErrors.email)}
            />
            {fieldErrors.email ? (
              <Text style={styles.fieldError}>{fieldErrors.email}</Text>
            ) : null}

            <Text style={[styles.label, styles.labelSpacing]}>Password</Text>
            <TextInput
              value={password}
              onChangeText={(v) => {
                setPassword(v);
                if (fieldErrors.password) setFieldErrors((p) => ({ ...p, password: undefined }));
              }}
              onFocus={() => setPasswordFocused(true)}
              onBlur={() => setPasswordFocused(false)}
              placeholder="••••••••"
              placeholderTextColor={colors.textSecondary}
              secureTextEntry
              autoComplete="password"
              editable={!loading}
              style={inputBaseStyle(passwordFocused, !!fieldErrors.password)}
            />
            {fieldErrors.password ? (
              <Text style={styles.fieldError}>{fieldErrors.password}</Text>
            ) : null}

            {error ? (
              <View style={styles.errorBanner}>
                <Text style={styles.errorBannerText}>{error}</Text>
              </View>
            ) : null}

            <TouchableOpacity
              onPress={() => Linking.openURL(`${WEB_BASE_URL}/forgot-password`)}
              activeOpacity={0.7}
              style={styles.forgotLink}
            >
              <Text style={styles.forgotLinkText}>Forgot password?</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleLogin}
              disabled={loading}
              activeOpacity={0.9}
              style={[styles.buttonWrap, loading && styles.buttonDisabled]}
            >
              <LinearGradient
                colors={[colors.primary, colors.stripe]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.button}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={styles.buttonLabel}>Log in</Text>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>

          <Text style={styles.footer}>
            Use the same account as the web dashboard.
          </Text>
          {__DEV__ ? (
            <Text style={styles.apiDebug} numberOfLines={2}>
              API: {API_BASE_URL}
            </Text>
          ) : null}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  safeContent: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  shapeBg: {
    ...StyleSheet.absoluteFillObject,
  },
  shape: {
    position: 'absolute',
    borderRadius: 999,
    opacity: 0.5,
  },
  shape1: {
    width: 280,
    height: 280,
    backgroundColor: colors.primary,
    top: -80,
    right: -100,
  },
  shape2: {
    width: 200,
    height: 200,
    backgroundColor: colors.stripe,
    top: 120,
    left: -80,
  },
  shape3: {
    width: 160,
    height: 160,
    backgroundColor: colors.accent,
    top: 280,
    right: -40,
  },
  shape4: {
    width: 100,
    height: 100,
    backgroundColor: colors.primary,
    bottom: 180,
    left: -30,
  },
  shape5: {
    width: 80,
    height: 80,
    backgroundColor: colors.stripe,
    bottom: 80,
    right: 60,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 32,
    justifyContent: 'center',
    minHeight: '100%',
  },
  hero: {
    marginBottom: 32,
  },
  heroTitle: {
    ...typography.h1,
    fontSize: 32,
    letterSpacing: -0.5,
    color: colors.textPrimary,
    marginBottom: 10,
  },
  heroSubtitle: {
    ...typography.body,
    fontSize: 17,
    lineHeight: 24,
  },
  heroSubtitleWhite: {
    color: colors.accent,
    fontWeight: '700',
  },
  heroSubtitleDark: {
    color: colors.textPrimary,
    fontWeight: '500',
  },
  card: {
    backgroundColor: colors.background,
    borderRadius: CARD_RADIUS,
    padding: 28,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.04)',
    ...Platform.select({
      ios: {
        shadowColor: '#0F172A',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.08,
        shadowRadius: 24,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  label: {
    ...typography.label,
    color: colors.textPrimary,
    marginBottom: 8,
  },
  labelSpacing: {
    marginTop: 4,
  },
  input: {
    backgroundColor: '#f8fafc',
    borderRadius: INPUT_RADIUS,
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    paddingHorizontal: 18,
    paddingVertical: 16,
    fontSize: 16,
    color: colors.textPrimary,
  },
  inputFocused: {
    borderColor: colors.primary,
    borderWidth: 2,
    backgroundColor: '#fff',
  },
  inputError: {
    borderColor: colors.error,
    backgroundColor: '#FEF2F2',
  },
  fieldError: {
    ...typography.caption,
    color: colors.error,
    marginTop: 6,
    marginBottom: 2,
  },
  forgotLink: {
    alignSelf: 'flex-end',
    marginTop: 12,
  },
  forgotLinkText: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '600',
  },
  errorBanner: {
    backgroundColor: '#FEF2F2',
    borderRadius: INPUT_RADIUS,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginTop: 16,
    marginBottom: 4,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  errorBannerText: {
    ...typography.bodySmall,
    color: colors.error,
  },
  buttonWrap: {
    marginTop: 28,
    borderRadius: INPUT_RADIUS,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  button: {
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 56,
    borderRadius: INPUT_RADIUS,
  },
  buttonDisabled: {
    opacity: 0.8,
  },
  buttonLabel: {
    fontSize: 17,
    fontWeight: '600',
    color: '#fff',
  },
  footer: {
    ...typography.caption,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 28,
    lineHeight: 18,
  },
  apiDebug: {
    ...typography.caption,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 16,
    opacity: 0.8,
  },
});
