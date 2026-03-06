import React from 'react';
import { ActivityIndicator, Text, View, Platform, StyleSheet, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useAuth } from '@/contexts/AuthContext';
import { BiometricGate } from '@/components/BiometricGate';
import { colors } from '@/theme/colors';
import { LoginScreen } from '@/screens/LoginScreen';
import { HomeScreen } from '@/screens/HomeScreen';
import { PaymentsScreen } from '@/screens/PaymentsScreen';
import { TakePaymentScreen } from '@/screens/TakePaymentScreen';

export type RootStackParamList = {
  Login: undefined;
  MainTabs: undefined;
  TakePayment: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Payments: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const styles = StyleSheet.create({
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 16,
    marginVertical: 4,
    borderRadius: 24,
    minHeight: 44,
  },
  tabButtonActive: {
    backgroundColor: 'rgba(10, 94, 215, 0.2)',
  },
});

const Tab = createBottomTabNavigator<MainTabParamList>();

function TabBarButton({ children, onPress, onLongPress, accessibilityRole, accessibilityState, style, ...rest }: any) {
  const focused = accessibilityState?.selected;
  return (
    <Pressable
      onPress={onPress}
      onLongPress={onLongPress}
      accessibilityRole={accessibilityRole}
      accessibilityState={accessibilityState}
      style={[styles.tabButton, focused && styles.tabButtonActive]}
      {...rest}
    >
      {children}
    </Pressable>
  );
}

function TabIcon({ name, focused }: { name: string; focused: boolean }) {
  const size = 26;
  const color = focused ? colors.primary : colors.textSecondary;
  if (name === 'Home') {
    return <Ionicons name={focused ? 'home' : 'home-outline'} size={size} color={color} />;
  }
  return <Ionicons name={focused ? 'receipt' : 'receipt-outline'} size={size} color={color} />;
}

function MainTabs() {
  const insets = useSafeAreaInsets();
  const tabBarHeight = 48;
  const paddingBottom = Math.max(insets.bottom + 8, 16);
  const paddingTop = 6;

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: {
          backgroundColor: colors.background,
          borderTopColor: '#E2E8F0',
          borderTopWidth: 1,
          height: tabBarHeight + paddingTop + paddingBottom,
          paddingTop,
          paddingBottom,
          ...Platform.select({
            ios: {
              shadowColor: '#0F172A',
              shadowOffset: { width: 0, height: -2 },
              shadowOpacity: 0.08,
              shadowRadius: 8,
            },
            android: { elevation: 8 },
          }),
        },
        tabBarItemStyle: {
          paddingVertical: 8,
        },
        tabBarActiveBackgroundColor: 'transparent',
        tabBarButton: (props) => <TabBarButton {...props} />,
        tabBarShowLabel: false,
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeWithBiometricGate}
        options={{
          tabBarAccessibilityLabel: 'Home',
          tabBarIcon: ({ focused }) => <TabIcon name="Home" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="Payments"
        component={PaymentsScreen}
        options={{
          tabBarAccessibilityLabel: 'Payments',
          tabBarIcon: ({ focused }) => <TabIcon name="Payments" focused={focused} />,
        }}
      />
    </Tab.Navigator>
  );
}

const HomeWithBiometricGate = () => (
  <BiometricGate>
    <HomeScreen />
  </BiometricGate>
);

function LoadingScreen() {
  return (
    <View style={{ flex: 1, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center' }}>
      <ActivityIndicator size="large" color={colors.primary} />
      <Text style={{ fontSize: 18, fontWeight: '600', marginTop: 16, color: colors.primary }}>SmallShopPay</Text>
    </View>
  );
}

export function RootNavigator() {
  const { isLoading, isAuthenticated } = useAuth();

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.surface },
          animation: 'slide_from_right',
        }}
      >
        {!isAuthenticated ? (
          <Stack.Screen name="Login" component={LoginScreen} />
        ) : (
          <>
            <Stack.Screen
              name="MainTabs"
              component={MainTabs}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="TakePayment"
              component={TakePaymentScreen}
              options={{ headerShown: false }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
