/**
 * API base URL – update for your environment.
 * For Android emulator use 10.0.2.2 instead of localhost.
 * For physical device use your machine's LAN IP.
 */
export const API_BASE_URL =
  typeof __DEV__ !== 'undefined' && __DEV__
    ? 'http://localhost:8000/api'
    : 'https://api.smallshoppay.com/api';
