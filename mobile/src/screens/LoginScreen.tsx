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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/contexts/AuthContext';
import { API_BASE_URL } from '@/config/api';
import { colors } from '@/theme/colors';
import { typography } from '@/theme/typography';

const CARD_RADIUS = 20;
const INPUT_RADIUS = 12;

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
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
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
              Sign in to continue to SmallShopPay
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
              onPress={handleLogin}
              disabled={loading}
              activeOpacity={0.85}
              style={[styles.button, loading && styles.buttonDisabled]}
            >
              {loading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.buttonLabel}>Log in</Text>
              )}
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
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 32,
    justifyContent: 'center',
    minHeight: '100%',
  },
  hero: {
    marginBottom: 28,
  },
  heroTitle: {
    ...typography.h1,
    color: colors.textPrimary,
    marginBottom: 8,
  },
  heroSubtitle: {
    ...typography.body,
    color: colors.textSecondary,
    fontSize: 16,
  },
  card: {
    backgroundColor: colors.background,
    borderRadius: CARD_RADIUS,
    padding: 24,
    ...Platform.select({
      ios: {
        shadowColor: '#0F172A',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.06,
        shadowRadius: 12,
      },
      android: {
        elevation: 4,
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
    backgroundColor: colors.surface,
    borderRadius: INPUT_RADIUS,
    borderWidth: 1.5,
    borderColor: 'transparent',
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: colors.textPrimary,
  },
  inputFocused: {
    borderColor: colors.primary,
    backgroundColor: colors.background,
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
  button: {
    backgroundColor: colors.primary,
    borderRadius: INPUT_RADIUS,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 52,
    marginTop: 24,
    ...Platform.select({
      ios: {
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  buttonDisabled: {
    opacity: 0.8,
  },
  buttonLabel: {
    ...typography.label,
    fontSize: 16,
    color: '#fff',
  },
  footer: {
    ...typography.caption,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 24,
  },
  apiDebug: {
    ...typography.caption,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 16,
    opacity: 0.8,
  },
});
