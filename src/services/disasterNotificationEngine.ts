/**
 * D-MIND Disaster Notification Engine
 * Proximity evaluation and Native Push Notifications for Android Status Bar
 */

import { Capacitor } from '@capacitor/core';
import {
  generateNotificationId,
  NOTIFICATION_CHANNELS,
  initializeNotificationChannels,
  getLocalNotifications,
  checkIsNative
} from '@/hooks/useNotifications';
import { hapticEmergencyVibrate, hapticImpactHeavy } from '@/utils/native';

export type DisasterCategory = 'wildfire' | 'flood' | 'drought';
export type NotificationLevel = 'critical' | 'warning' | 'info';

export interface DisasterTriggeredAlert {
  id: string;
  category: DisasterCategory;
  level: NotificationLevel;
  channelId: 'disaster-critical' | 'disaster-warning' | 'disaster-info';
  title: string;
  body: string;
  distanceKm: number;
  severity: number; // 1-5
  locationName?: string;
  timestamp: number;
  metadata?: Record<string, any>;
}

export interface DisasterEngineSettings {
  enabled: boolean;
  radiusKm: number; // 5, 10, 25, 50 km
  categories: {
    wildfire: boolean;
    flood: boolean;
    drought: boolean;
  };
  enableSound: boolean;
  enableVibration: boolean;
}

export const DEFAULT_DISASTER_ENGINE_SETTINGS: DisasterEngineSettings = {
  enabled: true,
  radiusKm: 25,
  categories: {
    wildfire: true,
    flood: true,
    drought: true,
  },
  enableSound: true,
  enableVibration: true,
};

const SETTINGS_KEY = 'dmind-disaster-engine-settings';
const COOLDOWN_KEY = 'dmind-disaster-alert-cooldowns';
const HISTORY_KEY = 'dmind-notification-history';

/**
 * Load engine settings from localStorage
 */
export const getDisasterEngineSettings = (): DisasterEngineSettings => {
  if (typeof window === 'undefined') return DEFAULT_DISASTER_ENGINE_SETTINGS;
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return DEFAULT_DISASTER_ENGINE_SETTINGS;
    return { ...DEFAULT_DISASTER_ENGINE_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_DISASTER_ENGINE_SETTINGS;
  }
};

/**
 * Save engine settings to localStorage
 */
export const saveDisasterEngineSettings = (settings: DisasterEngineSettings): void => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (e) {
    console.error('[DisasterEngine] Failed to save settings:', e);
  }
};

// ============================================================
// Geographic Calculations
// ============================================================

/**
 * Calculate Great-Circle distance between two coordinates in kilometers (Haversine formula)
 */
export const calculateHaversineDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

/**
 * Check if a point [lng, lat] is inside a GeoJSON linear ring using Ray-Casting
 */
export const isPointInPolygonRing = (
  point: [number, number], // [lng, lat]
  ring: number[][]
): boolean => {
  const [lng, lat] = point;
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const xi = ring[i][0];
    const yi = ring[i][1];
    const xj = ring[j][0];
    const yj = ring[j][1];

    const intersect =
      yi > lat !== yj > lat &&
      lng < ((xj - xi) * (lat - yi)) / (yj - yi) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
};

/**
 * Check whether a user's location is inside or near a Polygon / MultiPolygon
 */
export const checkPointAgainstFloodGeometry = (
  userLat: number,
  userLng: number,
  geometry: {
    type: 'Polygon' | 'MultiPolygon' | string;
    coordinates: any;
  }
): { isInside: boolean; minDistanceKm: number } => {
  if (!geometry || !geometry.coordinates) {
    return { isInside: false, minDistanceKm: Infinity };
  }

  const point: [number, number] = [userLng, userLat];
  let isInside = false;
  let minDistanceKm = Infinity;

  const testRings = (rings: number[][][]) => {
    if (!rings || rings.length === 0) return;
    const outerRing = rings[0];
    if (outerRing && outerRing.length >= 3) {
      if (isPointInPolygonRing(point, outerRing)) {
        isInside = true;
        minDistanceKm = 0;
        return;
      }
      // Sample perimeter vertices to measure proximity distance
      const step = Math.max(1, Math.floor(outerRing.length / 30));
      for (let i = 0; i < outerRing.length; i += step) {
        const [vLng, vLat] = outerRing[i];
        const dist = calculateHaversineDistance(userLat, userLng, vLat, vLng);
        if (dist < minDistanceKm) {
          minDistanceKm = dist;
        }
      }
    }
  };

  if (geometry.type === 'Polygon') {
    testRings(geometry.coordinates);
  } else if (geometry.type === 'MultiPolygon') {
    for (const polyCoords of geometry.coordinates) {
      testRings(polyCoords);
      if (isInside) break;
    }
  }

  return { isInside, minDistanceKm: isInside ? 0 : minDistanceKm };
};

// ============================================================
// Proximity Evaluators for Real Disaster Conditions
// ============================================================

/**
 * Evaluate VIIRS Hotspots:
 * < 5 km  = Critical (Heads-up popup, emergency alarm, evacuate immediately)
 * < 15 km = Warning (High priority, close monitoring)
 * <= maxRadiusKm = Info
 */
export const evaluateHotspots = (
  userLat: number,
  userLng: number,
  hotspots: any[],
  maxRadiusKm: number = 25
): DisasterTriggeredAlert[] => {
  if (!hotspots || !Array.isArray(hotspots) || hotspots.length === 0) return [];

  const alerts: DisasterTriggeredAlert[] = [];
  let nearestHotspot: any = null;
  let minDistance = Infinity;

  for (const item of hotspots) {
    const lat = item.LATITUDE ?? item.geometry?.coordinates?.[1];
    const lng = item.LONGITUDE ?? item.geometry?.coordinates?.[0];

    if (typeof lat !== 'number' || typeof lng !== 'number') continue;

    const dist = calculateHaversineDistance(userLat, userLng, lat, lng);
    if (dist < minDistance) {
      minDistance = dist;
      nearestHotspot = item;
    }
  }

  if (!nearestHotspot || minDistance > maxRadiusKm) {
    return [];
  }

  const props = nearestHotspot.properties || {};
  const province = props.pv_tn || nearestHotspot.province || 'ใกล้ตัวคุณ';
  const amphoe = props.ap_tn || props.amphoe || '';
  const locationText = amphoe ? `${province} (${amphoe})` : province;

  if (minDistance < 5) {
    alerts.push({
      id: `viirs-crit-${Math.round(minDistance * 10)}`,
      category: 'wildfire',
      level: 'critical',
      channelId: 'disaster-critical',
      title: '🚨 เตือนภัยไฟป่าระดับวิกฤต! (อพยพด่วน)',
      body: `พบจุดความร้อน VIIRS ห่างจากตำแหน่งคุณเพียง ${minDistance.toFixed(1)} กม. (${locationText}) กรุณาเตรียมพร้อมอพยพทันที`,
      distanceKm: minDistance,
      severity: 5,
      locationName: locationText,
      timestamp: Date.now(),
      metadata: nearestHotspot,
    });
  } else if (minDistance < 15) {
    alerts.push({
      id: `viirs-warn-${Math.round(minDistance * 10)}`,
      category: 'wildfire',
      level: 'warning',
      channelId: 'disaster-warning',
      title: `⚠️ เฝ้าระวังไฟป่าระยะใกล้ (${minDistance.toFixed(1)} กม.)`,
      body: `พบจุดความร้อน VIIRS ห่างจากคุณ ${minDistance.toFixed(1)} กม. (${locationText}) เฝ้าระวังควันไฟและติดตามประกาศฉุกเฉิน`,
      distanceKm: minDistance,
      severity: 4,
      locationName: locationText,
      timestamp: Date.now(),
      metadata: nearestHotspot,
    });
  } else if (minDistance <= maxRadiusKm) {
    alerts.push({
      id: `viirs-info-${Math.round(minDistance * 10)}`,
      category: 'wildfire',
      level: 'info',
      channelId: 'disaster-info',
      title: `🔥 ข้อมูลจุดความร้อนในรัศมีเฝ้าระวัง`,
      body: `พบจุดความร้อนห่างจากคุณ ${minDistance.toFixed(1)} กม. (${locationText}) อยู่ในรัศมีเฝ้าระวัง`,
      distanceKm: minDistance,
      severity: 3,
      locationName: locationText,
      timestamp: Date.now(),
      metadata: nearestHotspot,
    });
  }

  return alerts;
};

/**
 * Evaluate Flood Polygons:
 * Inside polygon = Critical (In flood zone, evacuate/elevate goods)
 * < 10 km        = Warning (Flood water approaching)
 * <= maxRadiusKm = Info
 */
export const evaluateFloodPolygons = (
  userLat: number,
  userLng: number,
  floodFeatures: any[],
  maxRadiusKm: number = 25
): DisasterTriggeredAlert[] => {
  if (!floodFeatures || !Array.isArray(floodFeatures) || floodFeatures.length === 0) return [];

  const alerts: DisasterTriggeredAlert[] = [];
  let nearestFloodFeature: any = null;
  let minDistance = Infinity;
  let userIsInside = false;

  for (const feature of floodFeatures) {
    const geom = feature.geometry;
    if (!geom) continue;

    const { isInside, minDistanceKm } = checkPointAgainstFloodGeometry(userLat, userLng, geom);
    if (isInside) {
      userIsInside = true;
      nearestFloodFeature = feature;
      minDistance = 0;
      break;
    }

    if (minDistanceKm < minDistance) {
      minDistance = minDistanceKm;
      nearestFloodFeature = feature;
    }
  }

  if (!nearestFloodFeature) return [];

  const props = nearestFloodFeature.properties || {};
  const province = props.pv_tn || 'พื้นที่เสี่ยง';
  const amphoe = props.ap_tn || '';
  const locationText = amphoe ? `${province} (${amphoe})` : province;

  if (userIsInside) {
    alerts.push({
      id: `flood-inside-${Date.now()}`,
      category: 'flood',
      level: 'critical',
      channelId: 'disaster-critical',
      title: '🚨 เตือนภัยน้ำท่วมฉับพลัน! (อยู่ในพื้นที่น้ำท่วม)',
      body: `พิกัดของคุณอยู่ในเขตพื้นที่ประสบอุทกภัย (${locationText}) กรุณายกของขึ้นที่สูงและปฏิบัติตามแผนอพยพทันที`,
      distanceKm: 0,
      severity: 5,
      locationName: locationText,
      timestamp: Date.now(),
      metadata: nearestFloodFeature,
    });
  } else if (minDistance < 10) {
    alerts.push({
      id: `flood-warn-${Math.round(minDistance * 10)}`,
      category: 'flood',
      level: 'warning',
      channelId: 'disaster-warning',
      title: `🌊 แจ้งเตือนมวลน้ำใกล้พื้นที่ (${minDistance.toFixed(1)} กม.)`,
      body: `ตรวจพบพื้นที่น้ำท่วมห่างจากคุณ ${minDistance.toFixed(1)} กม. (${locationText}) เตรียมกระสอบทรายและเฝ้าระวังระดับน้ำ`,
      distanceKm: minDistance,
      severity: 4,
      locationName: locationText,
      timestamp: Date.now(),
      metadata: nearestFloodFeature,
    });
  } else if (minDistance <= maxRadiusKm) {
    alerts.push({
      id: `flood-info-${Math.round(minDistance * 10)}`,
      category: 'flood',
      level: 'info',
      channelId: 'disaster-info',
      title: `ℹ️ ข้อมูลพื้นที่น้ำท่วมในรัศมีเฝ้าระวัง`,
      body: `ตรวจพบพื้นที่น้ำท่วมห่างออกไป ${minDistance.toFixed(1)} กม. (${locationText})`,
      distanceKm: minDistance,
      severity: 3,
      locationName: locationText,
      timestamp: Date.now(),
      metadata: nearestFloodFeature,
    });
  }

  return alerts;
};

/**
 * Evaluate Severe Drought:
 * Risk level >= 70 or severe status
 */
export const evaluateDrought = (
  userLat: number,
  userLng: number,
  droughtProvinces: any[],
  maxRadiusKm: number = 50
): DisasterTriggeredAlert[] => {
  if (!droughtProvinces || !Array.isArray(droughtProvinces) || droughtProvinces.length === 0) return [];

  const alerts: DisasterTriggeredAlert[] = [];
  let nearestDrought: any = null;
  let minDistance = Infinity;

  for (const item of droughtProvinces) {
    if (!item.coordinates || (item.riskLevel < 70 && item.riskLevel !== undefined)) continue;

    const dist = calculateHaversineDistance(
      userLat,
      userLng,
      item.coordinates.lat,
      item.coordinates.lng
    );

    if (dist < minDistance) {
      minDistance = dist;
      nearestDrought = item;
    }
  }

  if (!nearestDrought || minDistance > Math.max(maxRadiusKm, 35)) return [];

  const risk = nearestDrought.riskLevel || 80;
  const isSevere = risk >= 80;

  alerts.push({
    id: `drought-warn-${nearestDrought.name}`,
    category: 'drought',
    level: isSevere ? 'warning' : 'info',
    channelId: isSevere ? 'disaster-warning' : 'disaster-info',
    title: `☀️ แจ้งเตือนภัยแล้งรุนแรงในพื้นที่ (${nearestDrought.name})`,
    body: `พื้นที่ของคุณหรือใกล้เคียงมีระดับความเสี่ยงภัยแล้ง ${risk}% กรุณาวางแผนสำรองน้ำใช้อุปโภคบริโภค`,
    distanceKm: minDistance,
    severity: isSevere ? 4 : 3,
    locationName: nearestDrought.name,
    timestamp: Date.now(),
    metadata: nearestDrought,
  });

  return alerts;
};

// ============================================================
// Dispatching Native Notifications to Android Status Bar Tray
// ============================================================

/**
 * Check if alert is in cooldown to prevent notification spam
 */
const isAlertInCooldown = (alertId: string, cooldownMinutes = 15): boolean => {
  if (typeof window === 'undefined') return false;
  try {
    const raw = localStorage.getItem(COOLDOWN_KEY);
    const cooldowns: Record<string, number> = raw ? JSON.parse(raw) : {};
    const lastSent = cooldowns[alertId];
    if (lastSent && Date.now() - lastSent < cooldownMinutes * 60 * 1000) {
      return true;
    }
    cooldowns[alertId] = Date.now();
    localStorage.setItem(COOLDOWN_KEY, JSON.stringify(cooldowns));
    return false;
  } catch {
    return false;
  }
};

/**
 * Save dispatched alert into notification history
 */
const recordInNotificationHistory = (alert: DisasterTriggeredAlert) => {
  if (typeof window === 'undefined') return;
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    const history = raw ? JSON.parse(raw) : [];
    history.unshift({
      id: alert.id,
      title: alert.title,
      message: alert.body,
      type: alert.category,
      level: alert.level,
      severity: alert.severity,
      distanceKm: alert.distanceKm,
      channelId: alert.channelId,
      created_at: new Date(alert.timestamp).toISOString(),
      read: false
    });
    // Keep last 100 items
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history.slice(0, 100)));
  } catch (e) {
    console.warn('[DisasterEngine] Could not save to history:', e);
  }
};

/**
 * Dispatch Native Push Notification to Android Status Bar / Shade
 */
export const dispatchDisasterNotification = async (
  alert: DisasterTriggeredAlert,
  ignoreCooldown = false
): Promise<{ success: boolean; notificationId: number; channelId: string; error?: string }> => {
  const safeId = generateNotificationId();

  if (!ignoreCooldown && isAlertInCooldown(alert.id)) {
    console.log(`[DisasterEngine] Alert ${alert.id} suppressed due to cooldown`);
    return { success: false, notificationId: safeId, channelId: alert.channelId, error: 'cooldown' };
  }

  // Save to history regardless
  recordInNotificationHistory(alert);

  const native = checkIsNative();

  if (native) {
    try {
      const LN = await getLocalNotifications();
      if (!LN) {
        throw new Error('LocalNotifications plugin not available');
      }

      await initializeNotificationChannels(LN);

      // Verify permission
      const perm = await LN.checkPermissions();
      if (perm.display !== 'granted') {
        const requested = await LN.requestPermissions();
        if (requested.display !== 'granted') {
          console.warn('[DisasterEngine] Notification permission denied');
          return { success: false, notificationId: safeId, channelId: alert.channelId, error: 'permission_denied' };
        }
      }

      const channel = NOTIFICATION_CHANNELS[alert.channelId] || NOTIFICATION_CHANNELS['disaster-info'];

      const scheduleConfig: Record<string, unknown> = {
        title: alert.title,
        body: alert.body,
        id: safeId, // 32-bit signed integer
        schedule: { at: new Date(Date.now() + 100) },
        channelId: channel.id,
        smallIcon: 'ic_stat_notification',
        largeIcon: 'ic_launcher',
        iconColor: alert.channelId === 'disaster-critical' ? '#DC2626' : (alert.channelId === 'disaster-warning' ? '#EA580C' : '#3B82F6'),
        ongoing: false,
        autoCancel: true,
        extra: {
          category: alert.category,
          level: alert.level,
          distanceKm: alert.distanceKm,
          severity: alert.severity,
          timestamp: alert.timestamp
        }
      };

      if (alert.channelId === 'disaster-critical') {
        scheduleConfig.sound = 'emergency_alert';
        (scheduleConfig as any).vibrate = true;
        // Trigger emergency haptic vibration pattern
        hapticEmergencyVibrate().catch(() => {});
      } else if (alert.channelId === 'disaster-warning') {
        scheduleConfig.sound = 'important_alert';
        (scheduleConfig as any).vibrate = true;
        hapticImpactHeavy().catch(() => {});
      } else {
        scheduleConfig.sound = 'default';
      }

      await LN.schedule({
        notifications: [scheduleConfig as any]
      });

      console.log(`[DisasterEngine] Successfully scheduled Native Notification #${safeId} on channel "${channel.id}"`);
      return { success: true, notificationId: safeId, channelId: channel.id };
    } catch (e: any) {
      console.error('[DisasterEngine] Error scheduling native notification:', e);
      return { success: false, notificationId: safeId, channelId: alert.channelId, error: e?.message || String(e) };
    }
  }

  // Web fallback (Notification API)
  if (typeof window !== 'undefined' && 'Notification' in window) {
    try {
      if (Notification.permission === 'granted') {
        new Notification(alert.title, {
          body: alert.body,
          icon: '/lovable-uploads/b5550bd4-d83d-4e1e-ac09-025117b87c86.png',
          tag: alert.id,
          requireInteraction: alert.level === 'critical',
        });
        return { success: true, notificationId: safeId, channelId: alert.channelId };
      }
    } catch (e: any) {
      console.warn('[DisasterEngine] Web notification error:', e);
    }
  }

  return { success: true, notificationId: safeId, channelId: alert.channelId };
};

// ============================================================
// Instant Test Push Notification for Status Bar
// ============================================================

/**
 * Triggers an immediate Test Push Notification straight to Android Status Bar Tray
 */
export const sendTestDisasterNotification = async (
  level: NotificationLevel = 'critical'
): Promise<{ success: boolean; notificationId: number; channelId: string; error?: string }> => {
  let title = '';
  let body = '';
  let channelId: 'disaster-critical' | 'disaster-warning' | 'disaster-info' = 'disaster-critical';
  let category: DisasterCategory = 'wildfire';
  let severity = 5;

  if (level === 'critical') {
    channelId = 'disaster-critical';
    category = 'wildfire';
    severity = 5;
    title = '🚨 [ทดสอบ] เตือนภัยไฟป่าระดับวิกฤต! (อพยพด่วน)';
    body = 'ตรวจพบจุดความร้อน VIIRS ห่าง 3.2 กม. จากตำแหน่งคุณ! กรุณาเตรียมพร้อมอพยพ (Heads-up alert)';
  } else if (level === 'warning') {
    channelId = 'disaster-warning';
    category = 'flood';
    severity = 4;
    title = '⚠️ [ทดสอบ] เฝ้าระวังมวลน้ำใกล้พื้นที่ (7.8 กม.)';
    body = 'ตรวจพบพื้นที่น้ำท่วมห่าง 7.8 กม. จากตำแหน่งของคุณ โปรดติดตามระดับน้ำและเฝ้าระวัง';
  } else {
    channelId = 'disaster-info';
    category = 'drought';
    severity = 3;
    title = 'ℹ️ [ทดสอบ] รายงานสภาพอากาศและการเตรียมพร้อม';
    body = 'สภาพอากาศโดยรวมในพื้นที่ปกติ ไม่พบสัญญาณภัยพิบัติในระยะ 25 กิโลเมตร';
  }

  const alert: DisasterTriggeredAlert = {
    id: `test-${level}-${Date.now()}`,
    category,
    level,
    channelId,
    title,
    body,
    distanceKm: level === 'critical' ? 3.2 : (level === 'warning' ? 7.8 : 25),
    severity,
    locationName: 'ตำแหน่งของคุณ (จำลอง)',
    timestamp: Date.now(),
  };

  return await dispatchDisasterNotification(alert, true);
};

// ============================================================
// Comprehensive Proximity Scan
// ============================================================

/**
 * Evaluate all datasets against user location and dispatch notifications for triggered threats
 */
export const runDisasterProximityScan = async (
  userLat: number,
  userLng: number,
  datasets: {
    hotspots?: any[];
    floodFeatures?: any[];
    droughtProvinces?: any[];
  },
  customSettings?: DisasterEngineSettings
): Promise<DisasterTriggeredAlert[]> => {
  const settings = customSettings || getDisasterEngineSettings();
  if (!settings.enabled) {
    console.log('[DisasterEngine] Notifications are disabled in settings');
    return [];
  }

  const triggeredAlerts: DisasterTriggeredAlert[] = [];

  // 1. VIIRS Hotspots
  if (settings.categories.wildfire && datasets.hotspots) {
    const wildfireAlerts = evaluateHotspots(userLat, userLng, datasets.hotspots, settings.radiusKm);
    triggeredAlerts.push(...wildfireAlerts);
  }

  // 2. Flood Polygons
  if (settings.categories.flood && datasets.floodFeatures) {
    const floodAlerts = evaluateFloodPolygons(userLat, userLng, datasets.floodFeatures, settings.radiusKm);
    triggeredAlerts.push(...floodAlerts);
  }

  // 3. Drought
  if (settings.categories.drought && datasets.droughtProvinces) {
    const droughtAlerts = evaluateDrought(userLat, userLng, datasets.droughtProvinces, settings.radiusKm);
    triggeredAlerts.push(...droughtAlerts);
  }

  // Dispatch notifications for highest severity alerts
  for (const alert of triggeredAlerts) {
    await dispatchDisasterNotification(alert);
  }

  return triggeredAlerts;
};
