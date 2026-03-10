import './global.css';
import { useEffect, useRef, useState } from 'react';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { StripeTerminalProvider } from '@stripe/stripe-terminal-react-native';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { RootNavigator } from '@/navigation/RootNavigator';
import { getConnectionToken } from '@/api/terminal';
import { GifSplashScreen } from '@/components/GifSplashScreen';

SplashScreen.preventAutoHideAsync();

const MIN_SPLASH_MS = 2000;

function SplashGate({ children }: { children: React.ReactNode }) {
  const [showSplash, setShowSplash] = useState(true);
  const [userSkipped, setUserSkipped] = useState(false);
  const mountTime = useRef(Date.now());
  const { isLoading } = useAuth();

  const handleSplashComplete = () => setUserSkipped(true);

  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  useEffect(() => {
    if (isLoading || !showSplash) return;
    const elapsed = Date.now() - mountTime.current;
    const minElapsed = elapsed >= MIN_SPLASH_MS;
    if (minElapsed || userSkipped) {
      setShowSplash(false);
    } else {
      const remaining = MIN_SPLASH_MS - elapsed;
      const timer = setTimeout(() => setShowSplash(false), remaining);
      return () => clearTimeout(timer);
    }
  }, [isLoading, userSkipped]);

  if (showSplash) {
    return (
      <>
        <GifSplashScreen onComplete={handleSplashComplete} />
        <StatusBar style="light" hidden />
      </>
    );
  }

  return <>{children}</>;
}

export default function App() {
  return (
    <AuthProvider>
      <SplashGate>
        <StripeTerminalProvider
          tokenProvider={async () => {
            const secret = await getConnectionToken();
            return secret;
          }}
        >
          <RootNavigator />
          <StatusBar style="auto" />
        </StripeTerminalProvider>
      </SplashGate>
    </AuthProvider>
  );
}
