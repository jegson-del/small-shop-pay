/**
 * Biometric unlock gate (Step 1.22).
 * When the user is authenticated and the device has biometrics enrolled,
 * requires Face ID / Touch ID (or fingerprint on Android) to unlock the app
 * on open and when returning from background.
 */
import React, { useCallback, useEffect, useState } from 'react';
import { AppState, type AppStateStatus } from 'react-native';
import * as LocalAuthentication from 'expo-local-authentication';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import { colors } from '@/theme/colors';

type Props = {
  children: React.ReactNode;
};

export function BiometricGate({ children }: Props) {
  const { logout } = useAuth();
  const [biometricAvailable, setBiometricAvailable] = useState<boolean | null>(null);
  const [isUnlocked, setIsUnlocked] = useState(false);

  const checkBiometric = useCallback(async () => {
    try {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      setBiometricAvailable(hasHardware && isEnrolled);
      if (!hasHardware || !isEnrolled) {
        setIsUnlocked(true);
      }
    } catch {
      setBiometricAvailable(false);
      setIsUnlocked(true);
    }
  }, []);

  useEffect(() => {
    checkBiometric();
  }, [checkBiometric]);

  useEffect(() => {
    if (biometricAvailable !== true) return;

    const subscription = AppState.addEventListener('change', (nextState: AppStateStatus) => {
      if (nextState === 'background' || nextState === 'inactive') {
        setIsUnlocked(false);
      }
    });

    return () => subscription.remove();
  }, [biometricAvailable]);

  const attemptUnlock = useCallback(async () => {
    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Unlock SmallShopPay',
        cancelLabel: 'Cancel',
      });
      if (result.success) {
        setIsUnlocked(true);
      }
    } catch {
      // Keep locked on error
    }
  }, []);

  const handleLogout = useCallback(async () => {
    await logout();
  }, [logout]);

  if (biometricAvailable === null) {
    return (
      <View className="flex-1 bg-white items-center justify-center">
        <ActivityIndicator size="large" color={colors.primary} />
        <Text className="text-slate-600 mt-4">Checking security…</Text>
      </View>
    );
  }

  if (biometricAvailable && !isUnlocked) {
    return (
      <BiometricLockScreen
        onUnlock={attemptUnlock}
        onLogout={handleLogout}
      />
    );
  }

  return <>{children}</>;
}

function BiometricLockScreen({
  onUnlock,
  onLogout,
}: {
  onUnlock: () => Promise<void>;
  onLogout: () => Promise<void>;
}) {
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setIsAuthenticating(true);
      await onUnlock();
      if (mounted) setIsAuthenticating(false);
    })();
    return () => {
      mounted = false;
    };
  }, [onUnlock]);

  const handleUnlock = async () => {
    setIsAuthenticating(true);
    await onUnlock();
    setIsAuthenticating(false);
  };

  return (
    <View className="flex-1 bg-white items-center justify-center px-8">
      <Text className="text-xl font-semibold text-slate-900 text-center mb-2">
        Unlock SmallShopPay
      </Text>
      <Text className="text-slate-600 text-center mb-8">
        Use Face ID, Touch ID, or your device fingerprint to continue.
      </Text>

      <Pressable
        onPress={handleUnlock}
        disabled={isAuthenticating}
        className="bg-primary rounded-xl py-3 px-8 min-w-[200px] items-center active:opacity-80 disabled:opacity-70"
      >
        {isAuthenticating ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <Text className="text-white font-semibold">Unlock</Text>
        )}
      </Pressable>

      <Pressable
        onPress={onLogout}
        className="mt-8 py-2"
        accessibilityLabel="Log out"
      >
        <Text className="text-slate-500 text-sm">Log out</Text>
      </Pressable>
    </View>
  );
}
