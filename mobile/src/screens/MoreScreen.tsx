import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Platform,
  Linking,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { GradientHeader } from '@/components/GradientHeader';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/api/client';
import { WEB_BASE_URL } from '@/config/api';
import { colors } from '@/theme/colors';
import { typography } from '@/theme/typography';

type RowItem = {
  label: string;
  icon: React.ComponentProps<typeof Ionicons>['name'];
  url?: string;
  action?: 'billing-portal';
  onPress?: () => void;
};

const HELP_ITEMS: RowItem[] = [
  { label: 'Contact us', icon: 'mail-outline', url: '/contact' },
  { label: 'Cancel subscription', icon: 'card-outline', action: 'billing-portal' },
];

const LEGAL_ITEMS: RowItem[] = [{ label: 'Terms & Conditions', icon: 'document-text-outline', url: '/terms' }];

function ListRow({ item, onPress, disabled }: { item: RowItem; onPress: () => void; disabled?: boolean }) {
  return (
    <TouchableOpacity style={styles.row} onPress={onPress} activeOpacity={0.7} disabled={disabled}>
      <Ionicons name={item.icon} size={22} color={colors.textSecondary} style={styles.rowIcon} />
      <Text style={[styles.rowLabel, disabled && styles.rowLabelDisabled]}>{item.label}</Text>
      {disabled ? (
        <ActivityIndicator size="small" color={colors.primary} />
      ) : (
        <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
      )}
    </TouchableOpacity>
  );
}

function Section({
  title,
  items,
  getOnPress,
  getDisabled,
}: {
  title: string;
  items: RowItem[];
  getOnPress: (item: RowItem) => () => void;
  getDisabled?: (item: RowItem) => boolean;
}) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionCard}>
        {items.map((item, i) => (
          <View key={item.label + i}>
            <ListRow item={item} onPress={getOnPress(item)} disabled={getDisabled?.(item)} />
            {i < items.length - 1 ? <View style={styles.rowDivider} /> : null}
          </View>
        ))}
      </View>
    </View>
  );
}

export function MoreScreen() {
  const navigation = useNavigation();
  const { logout } = useAuth();
  const [billingPortalLoading, setBillingPortalLoading] = useState(false);

  const accountItems: RowItem[] = [{ label: 'Log out', icon: 'log-out-outline', onPress: logout }];

  const openBillingPortal = async () => {
    setBillingPortalLoading(true);
    try {
      const data = await api.post<{ url: string }>('/stripe/billing-portal');
      if (data?.url) {
        await Linking.openURL(data.url);
      } else {
        Alert.alert('Error', 'Could not open billing portal.');
      }
    } catch {
      Alert.alert('Error', 'Failed to open billing portal. Please try again.');
    } finally {
      setBillingPortalLoading(false);
    }
  };

  const getHelpOnPress = (item: RowItem) => {
    if (item.action === 'billing-portal') return openBillingPortal;
    return item.url ? () => Linking.openURL(`${WEB_BASE_URL}${item.url}`) : (item.onPress ?? (() => {}));
  };

  const getHelpDisabled = (item: RowItem) => item.action === 'billing-portal' && billingPortalLoading;

  const getLegalOnPress = (item: RowItem) =>
    item.url ? () => Linking.openURL(`${WEB_BASE_URL}${item.url}`) : (item.onPress ?? (() => {}));

  const getAccountOnPress = (item: RowItem) =>
    item.onPress ? () => item.onPress!() : item.url ? () => Linking.openURL(`${WEB_BASE_URL}${item.url}`) : () => {};

  return (
    <View style={styles.container}>
      <GradientHeader
        title="Account settings"
        leftElement={
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            style={styles.backButton}
          >
            <Ionicons name="chevron-back" size={28} color="#fff" />
          </TouchableOpacity>
        }
      />
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Section title="Help & support" items={HELP_ITEMS} getOnPress={getHelpOnPress} getDisabled={getHelpDisabled} />
        <Section title="Legal" items={LEGAL_ITEMS} getOnPress={getLegalOnPress} />
        <Section title="Account" items={accountItems} getOnPress={getAccountOnPress} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  backButton: {
    marginRight: 8,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    ...typography.caption,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
    marginLeft: 4,
  },
  sectionCard: {
    backgroundColor: colors.background,
    borderRadius: 16,
    overflow: 'hidden',
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
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  rowIcon: {
    marginRight: 14,
  },
  rowLabel: {
    ...typography.body,
    color: colors.textPrimary,
    flex: 1,
  },
  rowLabelDisabled: {
    opacity: 0.6,
  },
  rowDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginLeft: 52,
  },
});
