import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
  PermissionsAndroid,
  Modal,
  Pressable,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import * as Location from 'expo-location';
import { useStripeTerminal } from '@stripe/stripe-terminal-react-native';
import type { Reader } from '@stripe/stripe-terminal-react-native';
import { createPaymentIntent, getTerminalConfig } from '@/api/terminal';
import { colors } from '@/theme/colors';
import { GradientHeader } from '@/components/GradientHeader';

async function ensureTerminalPermissions(): Promise<{ locationOk: boolean; bluetoothOk: boolean }> {
  let locationOk = true;
  let bluetoothOk = true;

  const { status } = await Location.requestForegroundPermissionsAsync();
  locationOk = status === 'granted';
  if (locationOk) {
    const enabled = await Location.hasServicesEnabledAsync();
    if (!enabled) {
      locationOk = false;
      Alert.alert(
        'Location required',
        'Stripe Terminal needs location to be turned on. Enable it in Settings → Location.',
        [{ text: 'OK' }]
      );
    }
  } else {
    Alert.alert(
      'Location permission',
      'Allow location access so the app can discover and connect to payment readers.',
      [{ text: 'OK' }]
    );
  }

  if (Platform.OS === 'android') {
    const apiLevel = typeof Platform.Version === 'number' ? Platform.Version : 0;
    if (apiLevel >= 31) {
      const scan = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
        { title: 'Bluetooth', message: 'Used to connect to Stripe card readers.', buttonNeutral: 'Later', buttonPositive: 'OK' }
      );
      const connect = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
        { title: 'Bluetooth', message: 'Used to connect to Stripe card readers.', buttonNeutral: 'Later', buttonPositive: 'OK' }
      );
      bluetoothOk = scan === 'granted' && connect === 'granted';
    } else {
      const result = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
      );
      bluetoothOk = result === 'granted';
    }
  }

  return { locationOk, bluetoothOk };
}

export function TakePaymentScreen() {
  const navigation = useNavigation();
  const discoveredReadersRef = useRef<Reader.Type[]>([]);
  const {
    initialize,
    discoverReaders,
    connectReader,
    connectedReader,
    retrievePaymentIntent,
    processPaymentIntent,
    isInitialized,
  } = useStripeTerminal({
    onUpdateDiscoveredReaders: (readers) => {
      discoveredReadersRef.current = readers ?? [];
      if (__DEV__ && (readers?.length ?? 0) > 0) {
        console.log('[TakePayment] Discovered readers:', readers?.length, readers?.[0]?.deviceType);
      }
    },
  });
  const [amountText, setAmountText] = useState('');
  const [loading, setLoading] = useState(false);
  const [processingPhase, setProcessingPhase] = useState<'connecting' | 'present_card' | null>(null);
  const [result, setResult] = useState<'idle' | 'ready' | 'succeeded' | 'failed' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const resetForAnother = () => {
    setResult('idle');
    setErrorMessage(null);
    setProcessingPhase(null);
  };

  const parseAmount = (): number | null => {
    const cleaned = amountText.replace(/[^0-9.]/g, '');
    const value = parseFloat(cleaned);
    if (Number.isNaN(value) || value <= 0) return null;
    return Math.round(value * 100);
  };

  const waitForDiscoveredReader = async (maxMs: number = 6000): Promise<Reader.Type | null> => {
    const intervalMs = 300;
    const start = Date.now();
    while (Date.now() - start < maxMs) {
      const reader = discoveredReadersRef.current[0];
      if (reader) return reader;
      await new Promise((r) => setTimeout(r, intervalMs));
    }
    return null;
  };

  const ensureReaderConnected = async (): Promise<boolean> => {
    if (connectedReader) return true;

    const { locationOk } = await ensureTerminalPermissions();
    if (!locationOk) {
      throw new Error('Location permission required for Tap to Pay. Enable location in Settings.');
    }

    if (!isInitialized) {
      const initResult = await initialize();
      if (initResult.error) throw new Error(initResult.error.message ?? 'Failed to initialize Terminal');
    }

    const { location_id: backendLocationId } = await getTerminalConfig();

    if (!backendLocationId) {
      throw new Error('Stripe Terminal location missing. Connect your Stripe account and try again.');
    }

    // Tap to Pay only (device NFC). Use simulated: false for real NFC; never mix with simulated.
    if (__DEV__) {
      console.log('[TakePayment] Discovering tapToPay, simulated: false, location:', backendLocationId);
    }
    discoveredReadersRef.current = [];
    const { error } = await discoverReaders({
      discoveryMethod: 'tapToPay',
      simulated: false,
    });
    if (error) {
      throw new Error(error.message ?? 'Failed to discover Tap to Pay reader.');
    }

    const reader = await waitForDiscoveredReader(6000);
    if (!reader) {
      throw new Error(
        'No Tap to Pay reader found. Turn on NFC, use a release build, and ensure Developer options are off.'
      );
    }

    const { reader: connected, error: connectError } = await connectReader(
      { reader, locationId: backendLocationId },
      'tapToPay'
    );
    if (connectError || !connected) {
      throw new Error(connectError?.message ?? 'Failed to connect Tap to Pay reader.');
    }
    return true;
  };

  const handleCharge = async () => {
    const pence = parseAmount();
    if (pence === null) {
      Alert.alert('Invalid amount', 'Enter a valid amount in pounds (e.g. 10.50).');
      return;
    }

    setLoading(true);
    setErrorMessage(null);
    setResult('idle');
    setProcessingPhase('connecting');

    try {
      await ensureReaderConnected();

      setProcessingPhase('present_card');

      const { client_secret } = await createPaymentIntent(pence, 'gbp');

      const retrieveResult = await retrievePaymentIntent(client_secret);
      if (retrieveResult.error || !retrieveResult.paymentIntent) {
        throw new Error(retrieveResult.error?.message ?? 'Failed to retrieve payment intent');
      }

      const processResult = await processPaymentIntent({
        paymentIntent: retrieveResult.paymentIntent,
      });

      if (processResult.error) {
        setResult('failed');
        setErrorMessage(processResult.error.message ?? 'Payment declined or failed');
        return;
      }
      if (processResult.paymentIntent?.status === 'succeeded') {
        setResult('succeeded');
      } else {
        setResult('failed');
        setErrorMessage(processResult.paymentIntent?.status ?? 'Payment not completed');
      }
    } catch (e) {
      setProcessingPhase(null);
      const msg = e instanceof Error ? e.message : 'Failed to create payment';
      if (msg.includes('adapter type does not exist') || msg.includes('adapter')) {
        setResult('error');
        setErrorMessage(
          'Adapter type does not exist: turn on NFC in Settings. Tap to Pay needs NFC enabled on a supported device.'
        );
      } else if (msg.includes('StripeTerminalProvider') || msg.includes('native') || msg.includes('not found')) {
        setResult('ready');
        setErrorMessage(
          'Tap to Pay requires a development build. Payment intent created; use a dev build to collect on device.'
        );
      } else {
        setErrorMessage(msg);
        setResult('error');
      }
    } finally {
      setLoading(false);
      setProcessingPhase(null);
    }
  };

  const pence = parseAmount();
  const isValid = pence !== null && pence >= 1;
  const showModal = loading && processingPhase !== null;
  const showResultModal = (result === 'succeeded' || result === 'failed') && !loading;

  return (
    <View style={styles.container}>
      <GradientHeader
        title="Take Payment"
        subtitle={pence ? `£${(pence / 100).toFixed(2)}` : 'Enter amount to charge'}
        rightElement={
          <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>
        }
      />

      {/* Processing overlay – shows when Charge is clicked */}
      <Modal visible={showModal} transparent animationType="fade">
        <Pressable style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.modalTitle}>
              {processingPhase === 'connecting'
                ? 'Connecting to Tap to Pay...'
                : 'Hold phone near card'}
            </Text>
            <Text style={styles.modalSubtitle}>
              {processingPhase === 'connecting'
                ? 'Setting up reader'
                : 'Present card or phone to pay'}
            </Text>
          </View>
        </Pressable>
      </Modal>

      {/* Result popup – success or decline */}
      <Modal visible={showResultModal} transparent animationType="fade">
        <Pressable style={styles.modalOverlay} onPress={resetForAnother}>
          <View style={[styles.modalCard, result === 'succeeded' ? styles.modalSuccess : styles.modalFailed]}>
            <Text style={[styles.resultIcon, { color: result === 'succeeded' ? colors.success : colors.error }]}>
              {result === 'succeeded' ? '✓' : '✕'}
            </Text>
            <Text style={styles.modalTitle}>
              {result === 'succeeded' ? 'Payment approved' : 'Payment declined'}
            </Text>
            <Text style={styles.modalSubtitle}>
              {result === 'succeeded'
                ? 'The payment was successful.'
                : (errorMessage ?? 'The payment could not be completed.')}
            </Text>
            <TouchableOpacity style={styles.modalButton} onPress={resetForAnother}>
              <Text style={styles.modalButtonText}>
                {result === 'succeeded' ? 'Take another payment' : 'Try again'}
              </Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>

    <KeyboardAvoidingView
      style={styles.keyboardView}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0}
    >
      <View style={styles.content}>
        <Text style={styles.label}>Amount (GBP)</Text>

        <View style={styles.inputRow}>
          <Text style={styles.currencySymbol}>£</Text>
          <TextInput
            style={styles.input}
            value={amountText}
            onChangeText={setAmountText}
            placeholder="0.00"
            placeholderTextColor={colors.textSecondary}
            keyboardType="decimal-pad"
            editable={result === 'idle' || result === 'error'}
            accessibilityLabel="Amount in pounds"
          />
        </View>

        {errorMessage && result !== 'ready' && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{errorMessage}</Text>
          </View>
        )}

        {result === 'succeeded' && (
          <View style={styles.successBox}>
            <Text style={styles.successTitle}>Payment approved</Text>
            <Text style={styles.successText}>The payment was successful.</Text>
          </View>
        )}

        {result === 'failed' && (
          <View style={styles.errorBox}>
            <Text style={styles.errorTitle}>Payment declined</Text>
            <Text style={styles.errorText}>{errorMessage ?? 'The payment could not be completed.'}</Text>
          </View>
        )}

        {result === 'ready' && (
          <View style={styles.readyBox}>
            <Text style={styles.readyTitle}>Ready to collect</Text>
            <Text style={styles.readyText}>
              {errorMessage ??
                'Payment intent created. Tap to Pay requires a development build to collect on this device.'}
            </Text>
          </View>
        )}

        <TouchableOpacity
          style={[styles.button, (loading || (result === 'idle' && !isValid)) && styles.buttonDisabled]}
          onPress={result === 'ready' || result === 'succeeded' || result === 'failed' ? resetForAnother : handleCharge}
          disabled={loading || (result === 'idle' && !isValid)}
          activeOpacity={0.8}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>
              {result === 'ready' || result === 'succeeded' || result === 'failed'
                ? 'Take another payment'
                : 'Charge'}
            </Text>
          )}
        </TouchableOpacity>

        {(result === 'ready' || result === 'succeeded' || result === 'failed') && (
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Text style={styles.backButtonText}>Back to Home</Text>
          </TouchableOpacity>
        )}
      </View>
    </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  backText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  keyboardView: {
    flex: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    minWidth: 280,
  },
  modalSuccess: {
    borderWidth: 2,
    borderColor: colors.success,
  },
  modalFailed: {
    borderWidth: 2,
    borderColor: colors.error,
  },
  resultIcon: {
    fontSize: 48,
    fontWeight: '700',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 8,
    textAlign: 'center',
  },
  modalSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 20,
  },
  modalButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 24,
  },
  modalButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textSecondary,
    marginBottom: 8,
  },
  content: {
    flex: 1,
    padding: 24,
    paddingTop: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 15,
    color: colors.textSecondary,
    marginBottom: 16,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  currencySymbol: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.textPrimary,
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 20,
    paddingVertical: 16,
    color: colors.textPrimary,
  },
  errorBox: {
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fecaca',
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
  },
  errorText: {
    color: colors.error,
    fontSize: 14,
  },
  readyBox: {
    backgroundColor: '#f0fdf4',
    borderWidth: 1,
    borderColor: '#bbf7d0',
    borderRadius: 10,
    padding: 16,
    marginBottom: 24,
  },
  readyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.success,
    marginBottom: 6,
  },
  readyText: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  successBox: {
    backgroundColor: '#f0fdf4',
    borderWidth: 1,
    borderColor: '#bbf7d0',
    borderRadius: 10,
    padding: 16,
    marginBottom: 24,
  },
  successTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.success,
    marginBottom: 4,
  },
  successText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  errorTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.error,
    marginBottom: 4,
  },
  button: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 52,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '600',
  },
  backButton: {
    marginTop: 16,
    paddingVertical: 12,
    alignItems: 'center',
  },
  backButtonText: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: '500',
  },
});
