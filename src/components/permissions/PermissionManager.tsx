import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, Bell, CheckCircle2, Loader2, Settings, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Geolocation } from '@capacitor/geolocation';
import { Capacitor } from '@capacitor/core';

interface PermissionStatus {
    location: 'granted' | 'denied' | 'prompt' | 'unavailable';
    notification: 'granted' | 'denied' | 'default' | 'unavailable';
}

interface PermissionManagerProps {
    onComplete?: () => void;
    showOnlyIfNeeded?: boolean;
}

// Lazy load LocalNotifications to avoid build errors
let LocalNotificationsPlugin: any = null;
let pluginLoadAttempted = false;

const getLocalNotifications = async () => {
    // Only try to load once, return cached result
    if (LocalNotificationsPlugin) {
        return LocalNotificationsPlugin;
    }

    // Skip if already attempted and failed
    if (pluginLoadAttempted) {
        return null;
    }

    if (Capacitor.isNativePlatform()) {
        pluginLoadAttempted = true;
        try {
            console.log('[PermissionManager] Loading LocalNotifications plugin...');
            const module = await import('@capacitor/local-notifications');
            LocalNotificationsPlugin = module.LocalNotifications;
            console.log('[PermissionManager] LocalNotifications plugin loaded successfully');
        } catch (e) {
            console.warn('[PermissionManager] LocalNotifications plugin not available:', e);
            LocalNotificationsPlugin = null;
        }
    }
    return LocalNotificationsPlugin;
};

export const PermissionManager: React.FC<PermissionManagerProps> = ({
    onComplete,
    showOnlyIfNeeded = true
}) => {
    const [status, setStatus] = useState<PermissionStatus>({
        location: 'prompt',
        notification: 'default'
    });
    const [loading, setLoading] = useState<'location' | 'notification' | null>(null);
    const [dismissed, setDismissed] = useState(false);
    const { toast } = useToast();

    const isNative = Capacitor.isNativePlatform();

    useEffect(() => {
        // Pre-load the plugin on mount for faster permission checks
        const init = async () => {
            if (isNative) {
                await getLocalNotifications();
            }
            checkPermissions();
        };
        init();
    }, []);

    const checkPermissions = async () => {
        const newStatus: PermissionStatus = {
            location: 'prompt',
            notification: 'default'
        };

        // Check Location Permission
        if (isNative) {
            try {
                const locStatus = await Geolocation.checkPermissions();
                newStatus.location = locStatus.location as 'granted' | 'denied' | 'prompt';
            } catch {
                newStatus.location = 'prompt';
            }
        } else if ('permissions' in navigator) {
            try {
                const locationPerm = await navigator.permissions.query({ name: 'geolocation' });
                newStatus.location = locationPerm.state as 'granted' | 'denied' | 'prompt';
            } catch {
                newStatus.location = 'prompt';
            }
        } else if (!('geolocation' in navigator)) {
            newStatus.location = 'unavailable';
        }

        // Check Notification Permission
        if (isNative) {
            // Use Capacitor LocalNotifications for native
            try {
                const LN = await getLocalNotifications();
                if (LN) {
                    const permStatus = await LN.checkPermissions();
                    if (permStatus.display === 'granted') {
                        newStatus.notification = 'granted';
                    } else if (permStatus.display === 'denied') {
                        newStatus.notification = 'denied';
                    } else {
                        newStatus.notification = 'default';
                    }
                } else {
                    newStatus.notification = 'default';
                }
            } catch (e) {
                console.warn('Error checking native notification permission:', e);
                newStatus.notification = 'default';
            }
        } else if ('Notification' in window) {
            newStatus.notification = Notification.permission;
        } else {
            newStatus.notification = 'unavailable';
        }

        setStatus(newStatus);
    };

    const requestLocation = async () => {
        setLoading('location');
        try {
            if (isNative) {
                const result = await Geolocation.requestPermissions();
                if (result.location === 'granted') {
                    await Geolocation.getCurrentPosition({
                        enableHighAccuracy: true,
                        timeout: 10000
                    });
                    setStatus(prev => ({ ...prev, location: 'granted' }));
                    toast({
                        title: "อนุญาตตำแหน่งแล้ว",
                        description: "คุณจะได้รับการแจ้งเตือนตามพื้นที่",
                    });
                } else {
                    setStatus(prev => ({ ...prev, location: 'denied' }));
                }
            } else {
                await new Promise<GeolocationPosition>((resolve, reject) => {
                    navigator.geolocation.getCurrentPosition(resolve, reject, {
                        enableHighAccuracy: true,
                        timeout: 10000
                    });
                });
                setStatus(prev => ({ ...prev, location: 'granted' }));
            }
        } catch {
            setStatus(prev => ({ ...prev, location: 'denied' }));
        }
        setLoading(null);
    };

    const requestNotification = async () => {
        setLoading('notification');
        try {
            if (isNative) {
                // Use Capacitor LocalNotifications for native Android
                const LN = await getLocalNotifications();
                if (LN) {
                    // Check current status first
                    const check = await LN.checkPermissions();

                    if (check.display === 'granted') {
                        setStatus(prev => ({ ...prev, notification: 'granted' }));
                        toast({
                            title: "การแจ้งเตือนเปิดใช้งานแล้ว",
                            description: "คุณจะได้รับการแจ้งเตือนภัยพิบัติ",
                        });
                        setLoading(null);
                        return;
                    }

                    // Request permission
                    const result = await LN.requestPermissions();

                    if (result.display === 'granted') {
                        setStatus(prev => ({ ...prev, notification: 'granted' }));
                        toast({
                            title: "เปิดการแจ้งเตือนสำเร็จ",
                            description: "คุณจะได้รับการแจ้งเตือนบนแถบแจ้งเตือนของโทรศัพท์",
                        });
                    } else {
                        setStatus(prev => ({ ...prev, notification: 'denied' }));
                        toast({
                            title: "ไม่ได้รับอนุญาต",
                            description: "กรุณาอนุญาตการแจ้งเตือนในการตั้งค่าแอพ",
                            variant: "destructive",
                        });
                    }
                } else {
                    // Plugin not available, use fallback
                    setStatus(prev => ({ ...prev, notification: 'granted' }));
                    toast({
                        title: "เปิดการแจ้งเตือนแบบ In-App",
                        description: "คุณจะได้รับการแจ้งเตือนภายในแอพ",
                    });
                }
            } else {
                // Web browser notification
                if ('Notification' in window) {
                    const result = await Notification.requestPermission();
                    setStatus(prev => ({ ...prev, notification: result }));
                    if (result === 'granted') {
                        toast({
                            title: "เปิดการแจ้งเตือนสำเร็จ",
                            description: "คุณจะได้รับการแจ้งเตือนเมื่อมีข้อมูลภัยพิบัติใหม่",
                        });
                    }
                } else {
                    setStatus(prev => ({ ...prev, notification: 'unavailable' }));
                }
            }
        } catch (e) {
            console.error('Error requesting notification permission:', e);
            setStatus(prev => ({ ...prev, notification: 'denied' }));
        }
        setLoading(null);
    };

    const openAppSettings = useCallback(() => {
        toast({
            title: "เปิดการตั้งค่า",
            description: "กรุณาไปที่ ตั้งค่า > แอปพลิเคชัน > D-MIND > สิทธิ์ เพื่ออนุญาตการเข้าถึง",
            duration: 8000,
        });
    }, [toast]);

    // Check if all permissions are granted
    const allGranted = status.location === 'granted' && status.notification === 'granted';

    // If showing only when needed and permissions are granted, don't show
    if (showOnlyIfNeeded && allGranted) {
        return null;
    }

    if (dismissed) {
        return null;
    }

    const getStatusIcon = (permStatus: string) => {
        switch (permStatus) {
            case 'granted':
                return <CheckCircle2 className="h-5 w-5 text-green-500" />;
            case 'denied':
                return null;
            default:
                return null;
        }
    };

    const renderLocationControl = () => {
        if (loading === 'location') {
            return <Loader2 className="h-4 w-4 animate-spin" />;
        }

        if (status.location === 'granted') {
            return getStatusIcon('granted');
        }

        if (status.location === 'denied') {
            return (
                <div className="flex items-center gap-1">
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={requestLocation}
                        className="h-7 px-2 text-xs"
                    >
                        <RefreshCw className="h-3 w-3 mr-1" />
                        ลองใหม่
                    </Button>
                    <Button
                        size="sm"
                        variant="ghost"
                        onClick={openAppSettings}
                        className="h-7 px-2 text-xs"
                    >
                        <Settings className="h-3 w-3 mr-1" />
                        ตั้งค่า
                    </Button>
                </div>
            );
        }

        return (
            <Button
                size="sm"
                onClick={requestLocation}
                disabled={loading !== null}
                className="bg-blue-600 hover:bg-blue-700"
            >
                อนุญาต
            </Button>
        );
    };

    const renderNotificationControl = () => {
        if (loading === 'notification') {
            return <Loader2 className="h-4 w-4 animate-spin" />;
        }

        if (status.notification === 'granted') {
            return getStatusIcon('granted');
        }

        if (status.notification === 'denied') {
            return (
                <div className="flex items-center gap-1">
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={requestNotification}
                        className="h-7 px-2 text-xs"
                    >
                        <RefreshCw className="h-3 w-3 mr-1" />
                        ลองใหม่
                    </Button>
                    <Button
                        size="sm"
                        variant="ghost"
                        onClick={openAppSettings}
                        className="h-7 px-2 text-xs"
                    >
                        <Settings className="h-3 w-3 mr-1" />
                        ตั้งค่า
                    </Button>
                </div>
            );
        }

        return (
            <Button
                size="sm"
                onClick={requestNotification}
                disabled={loading !== null}
                className="bg-orange-600 hover:bg-orange-700"
            >
                อนุญาต
            </Button>
        );
    };

    return (
        <Card className="mx-auto max-w-md border-0 shadow-lg">
            <CardHeader className="pb-3">
                <CardTitle className="text-lg">ขออนุญาตการเข้าถึง</CardTitle>
                <CardDescription>
                    เพื่อประสบการณ์ใช้งานที่ดีที่สุด กรุณาอนุญาตสิทธิ์ดังนี้
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Location Permission */}
                <div className={`flex items-center justify-between p-3 rounded-xl ${status.location === 'denied' ? 'bg-red-50' : 'bg-blue-50'
                    }`}>
                    <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${status.location === 'denied' ? 'bg-red-100' : 'bg-blue-100'
                            }`}>
                            <MapPin className={`h-5 w-5 ${status.location === 'denied' ? 'text-red-600' : 'text-blue-600'
                                }`} />
                        </div>
                        <div>
                            <p className="font-medium text-sm">ตำแหน่งที่ตั้ง</p>
                            <p className="text-xs text-gray-500">
                                {status.location === 'denied'
                                    ? 'ถูกปฏิเสธ - กรุณาลองใหม่หรือเปิดตั้งค่า'
                                    : status.location === 'granted'
                                        ? 'อนุญาตแล้ว'
                                        : 'สำหรับแจ้งเตือนตามพื้นที่'
                                }
                            </p>
                        </div>
                    </div>
                    {renderLocationControl()}
                </div>

                {/* Notification Permission */}
                <div className={`flex items-center justify-between p-3 rounded-xl ${status.notification === 'denied' ? 'bg-red-50' : 'bg-orange-50'
                    }`}>
                    <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${status.notification === 'denied' ? 'bg-red-100' : 'bg-orange-100'
                            }`}>
                            <Bell className={`h-5 w-5 ${status.notification === 'denied' ? 'text-red-600' : 'text-orange-600'
                                }`} />
                        </div>
                        <div>
                            <p className="font-medium text-sm">การแจ้งเตือน</p>
                            <p className="text-xs text-gray-500">
                                {status.notification === 'denied'
                                    ? 'ถูกปฏิเสธ - กรุณาลองใหม่หรือเปิดตั้งค่า'
                                    : status.notification === 'granted'
                                        ? 'อนุญาตแล้ว'
                                        : 'สำหรับแจ้งเตือนภัยพิบัติ'
                                }
                            </p>
                        </div>
                    </div>
                    {renderNotificationControl()}
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-2">
                    <Button
                        variant="outline"
                        className="flex-1"
                        onClick={() => {
                            setDismissed(true);
                            onComplete?.();
                        }}
                    >
                        ข้ามไปก่อน
                    </Button>
                    {allGranted && (
                        <Button
                            className="flex-1 bg-green-600 hover:bg-green-700"
                            onClick={onComplete}
                        >
                            เสร็จสิ้น
                        </Button>
                    )}
                </div>
            </CardContent>
        </Card>
    );
};
