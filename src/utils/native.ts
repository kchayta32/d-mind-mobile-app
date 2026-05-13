/**
 * D-MIND Native Utilities
 * Centralized module for Capacitor native platform interactions
 */

import { Capacitor, registerPlugin } from '@capacitor/core';
import type { Style } from '@capacitor/status-bar';

type StatusBarController = typeof import('@capacitor/status-bar').StatusBar;
type SplashScreenController = typeof import('@capacitor/splash-screen').SplashScreen;
type HapticsController = typeof import('@capacitor/haptics').Haptics;
type NetworkController = typeof import('@capacitor/network').Network;
type KeyboardController = typeof import('@capacitor/keyboard').Keyboard;

interface DMindNativePlugin {
  startBackgroundMonitoring(): Promise<{ started: boolean }>;
  stopBackgroundMonitoring(): Promise<{ stopped: boolean }>;
  getReliabilityStatus(): Promise<NativeReliabilityStatus>;
  refreshFcmToken(): Promise<{ tokenAvailable: boolean; configured?: boolean }>;
  openBatteryOptimizationSettings(): Promise<void>;
  openAppSettings(): Promise<void>;
  isIgnoringBatteryOptimizations(): Promise<{ ignoring: boolean }>;
  openDndSettings(): Promise<void>;
  hasDndAccess(): Promise<{ granted: boolean }>;
  triggerEmergencyAlert(options: {
    title?: string;
    message?: string;
    alertType?: string;
  }): Promise<void>;
  queueSOS(options: {
    userId?: string;
    latitude: number;
    longitude: number;
    batteryLevel?: number;
    message?: string;
  }): Promise<{ id: number; queued: boolean }>;
  getPendingSOSCount(): Promise<{ count: number }>;
}

export const DMindNative = registerPlugin<DMindNativePlugin>('DMindNative');

export interface NativeReliabilityStatus {
  locationGranted: boolean;
  backgroundLocationGranted: boolean;
  notificationGranted: boolean;
  batteryIgnoring: boolean;
  dndGranted: boolean;
  monitoring: boolean;
  pendingSOSCount: number;
  sosEndpointConfigured: boolean;
  fcmTokenEndpointConfigured: boolean;
  fcmTokenAvailable: boolean;
}

// ============================================================
// Platform Detection
// ============================================================

/** Check if running on a native platform (Android/iOS) */
export const isNativePlatform = (): boolean => {
  try {
    return Capacitor.isNativePlatform();
  } catch {
    return false;
  }
};

/** Get current platform: 'android' | 'ios' | 'web' */
export const getPlatform = (): string => {
  try {
    return Capacitor.getPlatform();
  } catch {
    return 'web';
  }
};

/** Check if running on Android specifically */
export const isAndroid = (): boolean => getPlatform() === 'android';

// ============================================================
// D-MIND Native Android Bridge
// ============================================================

export const startDisasterMonitoring = async () => {
  if (!isNativePlatform()) return { started: false };

  try {
    const status = await getNativeReliabilityStatus();
    if (!status.locationGranted || !status.notificationGranted) {
      return { started: false };
    }
    return await DMindNative.startBackgroundMonitoring();
  } catch (e) {
    console.warn('[Native] Unable to start background monitoring:', e);
    return { started: false };
  }
};

export const getNativeReliabilityStatus = async (): Promise<NativeReliabilityStatus> => {
  if (!isNativePlatform()) {
    return {
      locationGranted: true,
      backgroundLocationGranted: true,
      notificationGranted: true,
      batteryIgnoring: true,
      dndGranted: true,
      monitoring: false,
      pendingSOSCount: getPendingNativeSOSCountFromStorage(),
      sosEndpointConfigured: false,
      fcmTokenEndpointConfigured: false,
      fcmTokenAvailable: false,
    };
  }

  try {
    return await DMindNative.getReliabilityStatus();
  } catch (e) {
    console.warn('[Native] Unable to read reliability status:', e);
    return {
      locationGranted: false,
      backgroundLocationGranted: false,
      notificationGranted: false,
      batteryIgnoring: false,
      dndGranted: false,
      monitoring: false,
      pendingSOSCount: 0,
      sosEndpointConfigured: false,
      fcmTokenEndpointConfigured: false,
      fcmTokenAvailable: false,
    };
  }
};

export const refreshNativeFcmToken = async () => {
  if (!isNativePlatform()) return { tokenAvailable: false };

  try {
    return await DMindNative.refreshFcmToken();
  } catch (e) {
    console.warn('[Native] Unable to refresh FCM token:', e);
    return { tokenAvailable: false };
  }
};

export const stopDisasterMonitoring = async () => {
  if (!isNativePlatform()) return { stopped: false };

  try {
    return await DMindNative.stopBackgroundMonitoring();
  } catch (e) {
    console.warn('[Native] Unable to stop background monitoring:', e);
    return { stopped: false };
  }
};

export const openBatteryOptimizationSettings = async () => {
  if (!isAndroid()) return;
  await DMindNative.openBatteryOptimizationSettings();
};

export const openNativeAppSettings = async () => {
  if (!isNativePlatform()) return;
  await DMindNative.openAppSettings();
};

export const isIgnoringBatteryOptimizations = async () => {
  if (!isAndroid()) return true;

  try {
    const result = await DMindNative.isIgnoringBatteryOptimizations();
    return result.ignoring;
  } catch {
    return false;
  }
};

export const openDndSettings = async () => {
  if (!isAndroid()) return;
  await DMindNative.openDndSettings();
};

export const hasDndAccess = async () => {
  if (!isAndroid()) return true;

  try {
    const result = await DMindNative.hasDndAccess();
    return result.granted;
  } catch {
    return false;
  }
};

export const triggerNativeEmergencyAlert = async (
  title: string,
  message: string,
  alertType = 'disaster'
) => {
  if (!isNativePlatform()) {
    await hapticEmergencyVibrate();
    return;
  }

  await DMindNative.triggerEmergencyAlert({ title, message, alertType });
};

export const queueNativeSOS = async (options: {
  userId?: string;
  latitude: number;
  longitude: number;
  batteryLevel?: number;
  message?: string;
}) => {
  if (!isNativePlatform()) {
    const queue = JSON.parse(localStorage.getItem('dmind-sos-queue') || '[]');
    const item = { ...options, id: Date.now(), createdAt: Date.now(), status: 'pending' };
    queue.push(item);
    localStorage.setItem('dmind-sos-queue', JSON.stringify(queue));
    return { id: item.id, queued: true };
  }

  return DMindNative.queueSOS(options);
};

export const getPendingNativeSOSCount = async () => {
  if (!isNativePlatform()) {
    return getPendingNativeSOSCountFromStorage();
  }

  const result = await DMindNative.getPendingSOSCount();
  return result.count;
};

const getPendingNativeSOSCountFromStorage = () => {
  const queue = JSON.parse(localStorage.getItem('dmind-sos-queue') || '[]');
  return queue.length;
};

// ============================================================
// Status Bar
// ============================================================

let StatusBarPlugin: StatusBarController | null = null;

const getStatusBar = async () => {
  if (!StatusBarPlugin && isNativePlatform()) {
    try {
      const module = await import('@capacitor/status-bar');
      StatusBarPlugin = module.StatusBar;
    } catch (e) {
      console.warn('[Native] StatusBar plugin not available:', e);
    }
  }
  return StatusBarPlugin;
};

/** Set status bar to light content (white icons on dark background) */
export const setStatusBarLight = async () => {
  const sb = await getStatusBar();
  if (sb) {
    try {
      await sb.setStyle({ style: 'LIGHT' as Style });
      if (isAndroid()) {
        await sb.setBackgroundColor({ color: '#1E40AF' });
      }
    } catch (e) {
      console.warn('[Native] Error setting status bar:', e);
    }
  }
};

/** Set status bar to dark content (dark icons on light background) */
export const setStatusBarDark = async () => {
  const sb = await getStatusBar();
  if (sb) {
    try {
      await sb.setStyle({ style: 'DARK' as Style });
      if (isAndroid()) {
        await sb.setBackgroundColor({ color: '#FFFFFF' });
      }
    } catch (e) {
      console.warn('[Native] Error setting status bar:', e);
    }
  }
};

// ============================================================
// Splash Screen
// ============================================================

let SplashScreenPlugin: SplashScreenController | null = null;

const getSplashScreen = async () => {
  if (!SplashScreenPlugin && isNativePlatform()) {
    try {
      const module = await import('@capacitor/splash-screen');
      SplashScreenPlugin = module.SplashScreen;
    } catch (e) {
      console.warn('[Native] SplashScreen plugin not available:', e);
    }
  }
  return SplashScreenPlugin;
};

/** Hide the native splash screen */
export const hideSplashScreen = async () => {
  const ss = await getSplashScreen();
  if (ss) {
    try {
      await ss.hide({ fadeOutDuration: 300 });
    } catch (e) {
      console.warn('[Native] Error hiding splash screen:', e);
    }
  }
};

// ============================================================
// Haptics
// ============================================================

let HapticsPlugin: HapticsController | null = null;

const getHaptics = async () => {
  if (!HapticsPlugin && isNativePlatform()) {
    try {
      const module = await import('@capacitor/haptics');
      HapticsPlugin = module.Haptics;
    } catch (e) {
      console.warn('[Native] Haptics plugin not available:', e);
    }
  }
  return HapticsPlugin;
};

/** Trigger a light impact haptic (for button taps) */
export const hapticImpactLight = async () => {
  const h = await getHaptics();
  if (h) {
    try {
      await h.impact({ style: 'LIGHT' });
    } catch { /* silent */ }
  }
};

/** Trigger a medium impact haptic (for selections) */
export const hapticImpactMedium = async () => {
  const h = await getHaptics();
  if (h) {
    try {
      await h.impact({ style: 'MEDIUM' });
    } catch { /* silent */ }
  }
};

/** Trigger a heavy impact haptic (for emergency alerts) */
export const hapticImpactHeavy = async () => {
  const h = await getHaptics();
  if (h) {
    try {
      await h.impact({ style: 'HEAVY' });
    } catch { /* silent */ }
  }
};

/** Trigger vibration pattern for emergency alerts */
export const hapticEmergencyVibrate = async () => {
  const h = await getHaptics();
  if (h) {
    try {
      await h.vibrate({ duration: 500 });
      setTimeout(async () => {
        try { await h.vibrate({ duration: 500 }); } catch { /* silent */ }
      }, 700);
      setTimeout(async () => {
        try { await h.vibrate({ duration: 500 }); } catch { /* silent */ }
      }, 1400);
    } catch { /* silent */ }
  }
};

// ============================================================
// Network
// ============================================================

let NetworkPlugin: NetworkController | null = null;

const getNetwork = async () => {
  if (!NetworkPlugin && isNativePlatform()) {
    try {
      const module = await import('@capacitor/network');
      NetworkPlugin = module.Network;
    } catch (e) {
      console.warn('[Native] Network plugin not available:', e);
    }
  }
  return NetworkPlugin;
};

/** Check current network status */
export const getNetworkStatus = async (): Promise<{ connected: boolean; connectionType: string }> => {
  const net = await getNetwork();
  if (net) {
    try {
      const status = await net.getStatus();
      return {
        connected: status.connected,
        connectionType: status.connectionType || 'unknown',
      };
    } catch {
      return { connected: true, connectionType: 'unknown' };
    }
  }
  // Web fallback
  return {
    connected: navigator.onLine,
    connectionType: 'unknown',
  };
};

/** Listen for network status changes */
export const onNetworkChange = async (callback: (status: { connected: boolean; connectionType: string }) => void) => {
  const net = await getNetwork();
  if (net) {
    try {
      const listener = await net.addListener('networkStatusChange', (status: { connected: boolean; connectionType?: string }) => {
        callback({
          connected: status.connected,
          connectionType: status.connectionType || 'unknown',
        });
      });
      return () => listener.remove();
    } catch {
      // Fallback to web events
    }
  }

  // Web fallback
  const onlineHandler = () => callback({ connected: true, connectionType: 'unknown' });
  const offlineHandler = () => callback({ connected: false, connectionType: 'none' });
  window.addEventListener('online', onlineHandler);
  window.addEventListener('offline', offlineHandler);
  return () => {
    window.removeEventListener('online', onlineHandler);
    window.removeEventListener('offline', offlineHandler);
  };
};

// ============================================================
// Keyboard
// ============================================================

let KeyboardPlugin: KeyboardController | null = null;

const getKeyboard = async () => {
  if (!KeyboardPlugin && isNativePlatform()) {
    try {
      const module = await import('@capacitor/keyboard');
      KeyboardPlugin = module.Keyboard;
    } catch (e) {
      console.warn('[Native] Keyboard plugin not available:', e);
    }
  }
  return KeyboardPlugin;
};

/** Hide the native keyboard */
export const hideKeyboard = async () => {
  const kb = await getKeyboard();
  if (kb) {
    try {
      await kb.hide();
    } catch { /* silent */ }
  }
};

// ============================================================
// App Initialization
// ============================================================

/**
 * Initialize all native app features.
 * Call this once at app startup (e.g., in App.tsx componentDidMount or useEffect).
 */
export const initializeNativeApp = async () => {
  if (!isNativePlatform()) {
    console.log('[Native] Running on web, skipping native initialization');
    return;
  }

  console.log('[Native] Initializing native app features...');

  document.addEventListener('contextmenu', (event) => {
    const target = event.target as HTMLElement | null;
    if (!target?.closest('input, textarea, [contenteditable="true"], .selectable-text')) {
      event.preventDefault();
    }
  });

  // 1. Set status bar style
  await setStatusBarLight();

  // 2. Hide splash screen after a brief delay to let web content render
  setTimeout(async () => {
    await hideSplashScreen();
  }, 500);

  // 3. Pre-load plugins for faster first-use
  await getHaptics();
  await getNetwork();
  await getKeyboard();

  // 4. Refresh FCM token if Firebase is configured. Monitoring is started
  // from the explicit Android reliability onboarding controls.
  await refreshNativeFcmToken();

  console.log('[Native] Native app initialization complete');
};
