import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Platform,
} from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import { GradientHeader } from '@/components/GradientHeader';
import { getPayments, type PaymentItem } from '@/api/payments';
import { colors } from '@/theme/colors';
import { typography } from '@/theme/typography';

function formatAmount(amount: number, currency: string): string {
  const value = (amount / 100).toFixed(2);
  return currency.toUpperCase() === 'GBP' ? `£${value}` : `${currency} ${value}`;
}

export function PaymentsScreen() {
  const { user } = useAuth();
  const [payments, setPayments] = useState<PaymentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

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

  const statusLabel = (status: string) => {
    const s = status?.toLowerCase() ?? '';
    if (s === 'succeeded') return 'Paid';
    if (s === 'failed' || s === 'canceled') return 'Failed';
    return 'Pending';
  };

  return (
    <View style={styles.page}>
      <GradientHeader title="Payments" subtitle="Your payment history" />
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.scrollContent}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={() => loadPayments(true)} colors={[colors.primary]} />
      }
      showsVerticalScrollIndicator={false}
    >
      {loading && !refreshing ? (
        <View style={styles.loaderWrap}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : payments.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyIcon}>💳</Text>
          <Text style={styles.emptyTitle}>No payments yet</Text>
          <Text style={styles.emptyText}>Tap "Take Payment" on Home to accept your first payment.</Text>
        </View>
      ) : (
        <View style={styles.list}>
          {payments.map((p) => (
            <View key={p.id} style={styles.card}>
              <View style={styles.cardRow}>
                <Text style={styles.amount}>{formatAmount(p.amount, p.currency)}</Text>
                <View style={[styles.badge, { backgroundColor: statusColor(p.status) + '20' }]}>
                  <View style={[styles.badgeDot, { backgroundColor: statusColor(p.status) }]} />
                  <Text style={[styles.badgeText, { color: statusColor(p.status) }]}>{statusLabel(p.status)}</Text>
                </View>
              </View>
              <Text style={styles.date}>
                {p.created_at
                  ? new Date(p.created_at).toLocaleDateString(undefined, {
                      dateStyle: 'medium',
                      timeStyle: 'short',
                    })
                  : ''}
              </Text>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  scroll: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  loaderWrap: {
    paddingVertical: 48,
    alignItems: 'center',
  },
  emptyCard: {
    backgroundColor: colors.background,
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderStyle: 'dashed',
  },
  emptyIcon: {
    fontSize: 40,
    marginBottom: 12,
  },
  emptyTitle: {
    ...typography.label,
    color: colors.textPrimary,
    marginBottom: 8,
  },
  emptyText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  list: {
    gap: 12,
  },
  card: {
    backgroundColor: colors.background,
    borderRadius: 14,
    padding: 18,
    ...Platform.select({
      ios: {
        shadowColor: '#0F172A',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.06,
        shadowRadius: 6,
      },
      android: { elevation: 2 },
    }),
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  amount: {
    ...typography.h3,
    color: colors.textPrimary,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    gap: 6,
  },
  badgeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  badgeText: {
    ...typography.caption,
    fontWeight: '600',
  },
  date: {
    ...typography.caption,
    color: colors.textSecondary,
  },
});
