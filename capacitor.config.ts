import type { CapacitorConfig } from '@capacitor/cli';

const config = {
  appId: 'com.accurate.voltaic',
  appName: 'Voltaic',
  webDir: 'apps/frontend/dist',
  bundledWebRuntime: false,
 server: {
    cleartext: false,                   // ✅ Because you're using HTTPS
    androidScheme: 'https'             // ✅ Must be 'https', not a full URL
  },
  android: {
    allowMixedContent: false           // 🔐 Disallow HTTP API calls from an HTTPS app
  }
};
