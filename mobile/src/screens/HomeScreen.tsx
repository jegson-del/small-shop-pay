import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '@/contexts/AuthContext';
import { getPayments, type PaymentItem } from '@/api/payments';
import { colors } from '@/theme/colors';
import { typography } from '@/theme/typography';
import { GradientHeader } from '@/components/GradientHeader';

/** Subscription allows payments when active or trialing (per plan sub-6). */
function canTakePayment(subscriptionStatus: string | null | undefined, appAccess: boolean | undefined): boolean {
  if (appAccess === true) return true;
  const status = subscriptionStatus ?? 'none';
  return status === 'active' || status === 'trialing';
}

function formatAmount(amount: number, currency: string): string {
  const value = (amount / 100).toFixed(2);
  return currency.toUpperCase() === 'GBP' ? `£${value}` : `${currency} ${value}`;
}

function displayName(email: string | undefined): string {
  if (!email) return 'there';
  const part = email.split('@')[0];
  return part ? part.charAt(0).toUpperCase() + part.slice(1) : 'there';
}

export function HomeScreen() {
  const navigation = useNavigation();
  const { user, logout } = useAuth();
  const allowed = canTakePayment(user?.subscription_status, user?.app_access);
  const [payments, setPayments] = useState<PaymentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const name = displayName(user?.email);
  const recentPayments = payments.slice(0, 3);

  const loadPayments = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    try {
      const list = await getPayments();
      setPayments(list);
    } catch {
      setPayments([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadPayments();
  }, [loadPayments]);

  const statusColor = (status: string) => {
    const s = status?.toLowerCase() ?? '';
    if (s === 'succeeded') return colors.success;
    if (s === 'failed' || s === 'canceled') return colors.error;
    return colors.pending;
  };

  const handleTakePayment = () => {
    navigation.getParent()?.navigate('TakePayment' as never);
  };

  const handleLogout = () => {
    logout();
  };

  return (
    <View style={styles.container}>
      <GradientHeader
        title={`Hi, ${name}`}
        subtitle={allowed ? "You're ready to accept payments" : 'Activate your account to start'}
        rightElement={
          <TouchableOpacity onPress={handleLogout} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
            <Text style={styles.logoutText}>Log out</Text>
          </TouchableOpacity>
        }
      />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => loadPayments(true)} colors={[colors.primary]} />
        }
        showsVerticalScrollIndicator={false}
      >
        {allowed ? (
          <TouchableOpacity style={styles.ctaWrap} activeOpacity={0.9} onPress={handleTakePayment}>
            <LinearGradient
              colors={[colors.primary, colors.stripe]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.ctaButton}
            >
              <Text style={styles.ctaIcon}>💳</Text>
              <Text style={styles.ctaLabel}>Take Payment</Text>
              <Text style={styles.ctaHint}>Tap to charge via contactless</Text>
            </LinearGradient>
          </TouchableOpacity>
        ) : (
          <View style={styles.activateCard}>
            <Text style={styles.activateIcon}>🔒</Text>
            <Text style={styles.activateTitle}>Activate your account</Text>
            <Text style={styles.activateText}>
              Log in to the web dashboard to start your free trial and accept payments.
            </Text>
            <Text style={styles.activateHint}>Dashboard → Start Free Trial</Text>
          </View>
        )}

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Recent payments</Text>
            {payments.length > 0 && (
              <TouchableOpacity onPress={() => navigation.navigate('Payments' as never)}>
                <Text style={styles.seeAll}>See all</Text>
              </TouchableOpacity>
            )}
          </View>
          {loading && !refreshing ? (
            <ActivityIndicator size="small" color={colors.primary} style={styles.loader} />
          ) : recentPayments.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>📋</Text>
              <Text style={styles.emptyText}>No payments yet</Text>
            </View>
          ) : (
            <View style={styles.paymentList}>
              {recentPayments.map((p) => (
                <View key={p.id} style={styles.paymentRow}>
                  <View style={[styles.statusDot, { backgroundColor: statusColor(p.status) }]} />
                  <View style={styles.paymentLeft}>
                    <Text style={styles.paymentAmount}>{formatAmount(p.amount, p.currency)}</Text>
                    <Text style={styles.paymentMeta}>
                      {p.created_at
                        ? new Date(p.created_at).toLocaleDateString(undefined, { dateStyle: 'medium' })
                        : ''}{' '}
                      · {p.status}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>{user?.email}</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  logoutText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  ctaWrap: {
    marginBottom: 24,
    borderRadius: 18,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 12,
      },
      android: { elevation: 6 },
    }),
  },
  ctaButton: {
    borderRadius: 18,
    paddingVertical: 24,
    paddingHorizontal: 24,
  },
  ctaIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  ctaLabel: {
    ...typography.h3,
    fontSize: 20,
    color: '#fff',
    marginBottom: 4,
  },
  ctaHint: {
    ...typography.caption,
    color: 'rgba(255,255,255,0.9)',
  },
  activateCard: {
    backgroundColor: colors.background,
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  activateIcon: {
    fontSize: 28,
    marginBottom: 12,
  },
  activateTitle: {
    ...typography.label,
    color: colors.textPrimary,
    marginBottom: 8,
  },
  activateText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  activateHint: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '600',
  },
  card: {
    backgroundColor: colors.background,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    ...Platform.select({
      ios: {
        shadowColor: '#0F172A',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
      },
      android: { elevation: 2 },
    }),
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardTitle: {
    ...typography.label,
    color: colors.textPrimary,
    fontSize: 15,
  },
  seeAll: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '600',
  },
  loader: {
    marginVertical: 12,
  },
  emptyState: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 12,
  },
  emptyIcon: {
    fontSize: 20,
  },
  emptyText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  paymentList: {
    gap: 0,
  },
  paymentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  paymentLeft: {
    flex: 1,
    marginLeft: 12,
  },
  paymentAmount: {
    ...typography.body,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  paymentMeta: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  footer: {
    paddingTop: 24,
    alignItems: 'center',
  },
  footerText: {
    ...typography.caption,
    color: colors.textSecondary,
  },
});
