import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.accurate.voltaic',
  appName: 'Voltaic',
  webDir: 'apps/frontend/dist',
  server: {
    hostname: '192.168.10.69',
    cleartext: true,
    androidScheme: 'http'
  },
  android: {
    allowMixedContent: false
  }
};

export default config;
