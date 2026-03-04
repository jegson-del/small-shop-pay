import './global.css';
import { StatusBar } from 'expo-status-bar';
import { Text, View } from 'react-native';
import { AuthProvider } from '@/contexts/AuthContext';

export default function App() {
  return (
    <AuthProvider>
      <View className="flex-1 bg-white items-center justify-center">
        <Text className="text-2xl font-bold text-primary">SmallShopPay</Text>
        <StatusBar style="auto" />
      </View>
    </AuthProvider>
  );
}
