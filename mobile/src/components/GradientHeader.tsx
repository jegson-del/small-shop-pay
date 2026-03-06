import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '@/theme/colors';

type GradientHeaderProps = {
  title: string;
  subtitle?: string;
  rightElement?: React.ReactNode;
};

export function GradientHeader({ title, subtitle, rightElement }: GradientHeaderProps) {
  const insets = useSafeAreaInsets();
  const paddingTop = Math.max(insets.top, 12);

  return (
    <LinearGradient
      colors={[colors.primary, colors.stripe]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.gradient, { paddingTop }]}
    >
      <View style={styles.inner}>
        <View style={styles.left}>
          <Text style={styles.title}>{title}</Text>
          {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
        </View>
        {rightElement ? <View style={styles.right}>{rightElement}</View> : null}
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    paddingBottom: 16,
    paddingHorizontal: 20,
    ...Platform.select({
      ios: {
        shadowColor: '#0F172A',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
      },
      android: { elevation: 4 },
    }),
  },
  inner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  left: {
    flex: 1,
  },
  right: {
    marginLeft: 12,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    marginTop: 2,
    fontWeight: '500',
  },
});
