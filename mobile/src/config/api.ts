/**
 * API base URL – set via .env for development.
 * - Physical device: use your PC's LAN IP (e.g. http://192.168.1.146:8000/api).
 * - Android emulator: use 10.0.2.2 (e.g. http://10.0.2.2:8000/api).
 * - iOS simulator: localhost works.
 * Create mobile/.env from .env.example and set EXPO_PUBLIC_API_URL.
 */
const envUrl =
  typeof process.env.EXPO_PUBLIC_API_URL === 'string' && process.env.EXPO_PUBLIC_API_URL
    ? process.env.EXPO_PUBLIC_API_URL.replace(/\/$/, '')
    : '';

export const API_BASE_URL =
  envUrl ||
  (typeof __DEV__ !== 'undefined' && __DEV__
    ? 'http://localhost:8000/api'
    : 'https://api.smallshoppay.com/api');
