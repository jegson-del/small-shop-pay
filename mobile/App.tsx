import './global.css';
import { StatusBar } from 'expo-status-bar';
import { StripeTerminalProvider } from '@stripe/stripe-terminal-react-native';
import { AuthProvider } from '@/contexts/AuthContext';
import { RootNavigator } from '@/navigation/RootNavigator';
import { getConnectionToken } from '@/api/terminal';

export default function App() {
  return (
    <AuthProvider>
      <StripeTerminalProvider
        tokenProvider={async () => {
          const secret = await getConnectionToken();
          return secret;
        }}
      >
        <RootNavigator />
        <StatusBar style="auto" />
      </StripeTerminalProvider>
    </AuthProvider>
  );
}
