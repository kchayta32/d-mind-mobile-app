import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.dmind.app',
  appName: 'D-MIND',
  webDir: 'dist',

  // Server configuration
  server: {
    // Allow navigation to external API domains
    allowNavigation: [
      'evxjnivabxdlgfvncdcu.supabase.co',
      '*.supabase.co',
      'api.tmd.go.th',
      'disaster.gistda.or.th',
      'fire.gistda.or.th',
      'fonts.googleapis.com',
      'fonts.gstatic.com',
      'api.openmeteo.com',
    ],
    // Clear text traffic for development
    androidScheme: 'https',
  },

  // Plugins configuration
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: true,
      launchFadeOutDuration: 300,
      backgroundColor: '#1E3A8AFF',
      androidSplashResourceName: 'splash',
      androidScaleType: 'CENTER_CROP',
      showSpinner: false,
      splashFullScreen: true,
      splashImmersive: true,
    },
    StatusBar: {
      style: 'LIGHT',
      backgroundColor: '#1E40AF',
      overlaysWebView: false,
    },
    Keyboard: {
      resize: 'body',
      resizeOnFullScreen: true,
    },
    LocalNotifications: {
      smallIcon: 'ic_stat_notification',
      iconColor: '#3B82F6',
      sound: 'default',
    },
    Geolocation: {
      // Use high accuracy for disaster proximity alerts
    },
  },

  // Android-specific configuration
  android: {
    allowMixedContent: false,
    captureInput: true,
    webContentsDebuggingEnabled: false,
    buildOptions: {
      keystorePath: undefined,
      keystorePassword: undefined,
      keystoreAlias: undefined,
      keystoreAliasPassword: undefined,
      releaseType: 'APK',
    },
  },
};

export default config;
