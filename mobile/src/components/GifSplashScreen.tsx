/**
 * GIF splash screen - works reliably on emulator and devices.
 * Parent controls when to dismiss (auth + min duration). Tap to skip when ready.
 */
import React, { useCallback } from 'react';
import { StyleSheet, Image, Pressable } from 'react-native';

type Props = {
  onComplete: () => void;
};

const splashGif = require('../../assets/small_shop_pay_splash.gif');

export function GifSplashScreen({ onComplete }: Props) {
  const handlePress = useCallback(() => onComplete(), [onComplete]);

  return (
    <Pressable style={styles.container} onPress={handlePress}>
      <Image
        source={splashGif}
        style={styles.gif}
        resizeMode="contain"
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    alignItems: 'center',
    justifyContent: 'center',
  },
  gif: {
    width: '100%',
    height: '100%',
  },
});
