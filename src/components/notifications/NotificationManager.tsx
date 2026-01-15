import React from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useNotifications } from '@/hooks/useNotifications';
import { useNotificationHistory } from '@/hooks/useNotificationHistory';

const processedAlertIds = new Set<string>();

// Map alert types to severity levels
const ALERT_TYPE_SEVERITY: Record<string, number> = {
    earthquake: 5,
    tsunami: 5,
    flood: 4,
    wildfire: 4,
    landslide: 4,
    storm: 3,
    drought: 3,
    sinkhole: 3,
    default: 2
};

// Map alert severity strings to numbers
const SEVERITY_STRING_MAP: Record<string, number> = {
    critical: 5,
    high: 4,
    medium: 3,
    low: 2,
    info: 1
};

const NotificationManager = () => {
    const { requestPermission, sendNotification } = useNotifications();
    const { addNotification } = useNotificationHistory();
    const lastNotificationTime = React.useRef<number>(0);

    React.useEffect(() => {
        // Request permission on mount
        const initNotifications = async () => {
            await requestPermission();
        };
        initNotifications();

        // Subscribe to realtime alerts
        const channel = supabase
            .channel('public:realtime_alerts')
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'realtime_alerts',
                    filter: 'is_active=eq.true',
                },
                (payload) => {
                    const newAlert = payload.new as Record<string, any>;

                    // 1. ID-based Deduplication
                    if (newAlert.id && processedAlertIds.has(newAlert.id)) {
                        return;
                    }

                    // 2. Throttling (reduced for emergency alerts)
                    const now = Date.now();
                    const alertType = (newAlert.alert_type || 'default').toLowerCase();
                    const baseSeverity = ALERT_TYPE_SEVERITY[alertType] || ALERT_TYPE_SEVERITY.default;

                    // Use severity from alert data if available, otherwise use type-based severity
                    const severityFromData = newAlert.severity
                        ? (typeof newAlert.severity === 'string'
                            ? SEVERITY_STRING_MAP[newAlert.severity.toLowerCase()] || 2
                            : newAlert.severity)
                        : baseSeverity;

                    const severity = Math.max(baseSeverity, severityFromData);

                    // Shorter cooldown for high severity alerts
                    const COOLDOWN = severity >= 4 ? 1000 : 2000;

                    if (now - lastNotificationTime.current < COOLDOWN) {
                        return;
                    }

                    // Mark as processed
                    if (newAlert.id) {
                        processedAlertIds.add(newAlert.id);
                        setTimeout(() => processedAlertIds.delete(newAlert.id), 60000);
                    }

                    // Check user settings
                    const storedSettings = localStorage.getItem('dmind-notification-settings');
                    let playSound = true;

                    if (storedSettings) {
                        const settings = JSON.parse(storedSettings);

                        // 1. Check if notifications are globally enabled
                        if (!settings.enabled) return;

                        // 2. Check if this specific alert type is enabled
                        if (alertType && settings.types && !settings.types.includes(alertType)) {
                            // Allow high severity alerts to bypass type filter
                            if (severity < 4) return;
                        }

                        // 3. Check emergency only setting
                        if (settings.emergencyOnly && severity < 4) return;

                        playSound = settings.sound;
                    }

                    // Update last notification timestamp
                    lastNotificationTime.current = now;

                    const title = newAlert.title || 'แจ้งเตือนภัยพิบัติ!';
                    const body = newAlert.description || 'มีเหตุการณ์ภัยพิบัติเกิดขึ้น กรุณาตรวจสอบ';

                    // Add to notification history
                    addNotification({
                        title,
                        body,
                        type: severity >= 4 ? 'emergency' : severity >= 3 ? 'alert' : 'info',
                        severity,
                        location: newAlert.location || newAlert.province,
                        data: {
                            alertId: newAlert.id,
                            alertType,
                            coordinates: newAlert.coordinates
                        }
                    });

                    // Send system notification with severity-based channel
                    sendNotification(title, {
                        body,
                        icon: '/lovable-uploads/b5550bd4-d83d-4e1e-ac09-025117b87c86.png',
                        tag: 'disaster-alert',
                        silent: !playSound,
                        severity,
                        groupId: `disaster-${alertType}`
                    });

                    // Send email notification if enabled
                    const storedPrefs = localStorage.getItem('dmind-notification-preferences');
                    const savedEmail = localStorage.getItem('dmind-notification-email');

                    if (storedPrefs && savedEmail) {
                        try {
                            const prefs = JSON.parse(storedPrefs);
                            if (prefs.email) {
                                // Send email via Edge Function
                                fetch(
                                    `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-notification-email`,
                                    {
                                        method: 'POST',
                                        headers: {
                                            'Content-Type': 'application/json',
                                            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
                                        },
                                        body: JSON.stringify({
                                            to: savedEmail,
                                            type: 'alert',
                                            alertData: {
                                                title,
                                                message: body,
                                                severity,
                                                location: newAlert.location || newAlert.province,
                                            },
                                        }),
                                    }
                                ).catch(err => console.error('Failed to send email notification:', err));
                            }
                        } catch (e) {
                            console.error('Error parsing notification preferences:', e);
                        }
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [requestPermission, sendNotification, addNotification]);

    return null; // This component doesn't render anything visible
};

export default NotificationManager;

