
import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Geolocation, Position, PermissionStatus } from '@capacitor/geolocation';
import { Capacitor } from '@capacitor/core';

interface GeolocationState {
  coordinates: { lat: number; lng: number } | null;
  error: string | null;
  loading: boolean;
  permissionStatus: 'granted' | 'denied' | 'prompt' | 'unknown';
}

export const useGeolocation = () => {
  const [state, setState] = useState<GeolocationState>({
    coordinates: null,
    error: null,
    loading: true,
    permissionStatus: 'unknown'
  });
  const { toast } = useToast();

  const isNative = Capacitor.isNativePlatform();

  // Check permission status
  const checkPermissions = useCallback(async () => {
    if (isNative) {
      try {
        const status: PermissionStatus = await Geolocation.checkPermissions();
        setState(prev => ({
          ...prev,
          permissionStatus: status.location as 'granted' | 'denied' | 'prompt'
        }));
        return status.location;
      } catch {
        setState(prev => ({ ...prev, permissionStatus: 'unknown' }));
        return 'unknown';
      }
    } else {
      // Web - check using permissions API
      try {
        const result = await navigator.permissions.query({ name: 'geolocation' });
        setState(prev => ({
          ...prev,
          permissionStatus: result.state as 'granted' | 'denied' | 'prompt'
        }));
        return result.state;
      } catch {
        return 'unknown';
      }
    }
  }, [isNative]);

  // Request permissions
  const requestPermissions = useCallback(async () => {
    if (isNative) {
      try {
        const status = await Geolocation.requestPermissions();
        setState(prev => ({
          ...prev,
          permissionStatus: status.location as 'granted' | 'denied' | 'prompt'
        }));
        return status.location === 'granted';
      } catch {
        return false;
      }
    }
    // Web - permissions are requested when getting location
    return true;
  }, [isNative]);

  // Get current position using Capacitor or fallback to Web API
  const getCurrentPosition = useCallback(async (): Promise<{ lat: number; lng: number } | null> => {
    if (isNative) {
      try {
        const position: Position = await Geolocation.getCurrentPosition({
          enableHighAccuracy: true,
          timeout: 15000
        });
        return {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
      } catch (error: unknown) {
        console.error('Capacitor Geolocation error:', error);
        throw error;
      }
    } else {
      // Fallback to Web API
      return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
          reject(new Error('Geolocation is not supported'));
          return;
        }

        navigator.geolocation.getCurrentPosition(
          (position) => {
            resolve({
              lat: position.coords.latitude,
              lng: position.coords.longitude
            });
          },
          (error) => {
            reject(error);
          },
          {
            enableHighAccuracy: true,
            timeout: 15000,
            maximumAge: 300000
          }
        );
      });
    }
  }, [isNative]);

  // Handle errors with Thai messages
  const handleError = useCallback((error: unknown) => {
    let errorMessage = 'ไม่สามารถระบุตำแหน่งได้';
    let permissionStatus: 'granted' | 'denied' | 'prompt' | 'unknown' = 'unknown';

    if (error instanceof GeolocationPositionError) {
      switch (error.code) {
        case error.PERMISSION_DENIED:
          errorMessage = 'ผู้ใช้ปฏิเสธการเข้าถึงตำแหน่ง';
          permissionStatus = 'denied';
          break;
        case error.POSITION_UNAVAILABLE:
          errorMessage = 'ไม่สามารถหาตำแหน่งได้';
          break;
        case error.TIMEOUT:
          errorMessage = 'หมดเวลาในการขอตำแหน่ง';
          break;
      }
    } else if (error instanceof Error) {
      if (error.message.includes('denied') || error.message.includes('permission')) {
        errorMessage = 'ผู้ใช้ปฏิเสธการเข้าถึงตำแหน่ง';
        permissionStatus = 'denied';
      } else {
        errorMessage = error.message;
      }
    }

    setState({
      coordinates: null,
      error: errorMessage,
      loading: false,
      permissionStatus
    });

    toast({
      title: "ไม่สามารถระบุตำแหน่งได้",
      description: errorMessage,
      variant: "destructive",
    });
  }, [toast]);

  // Refresh/get location
  const refreshLocation = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      // Check and request permissions first
      const permStatus = await checkPermissions();

      if (permStatus === 'denied') {
        setState({
          coordinates: null,
          error: 'ผู้ใช้ปฏิเสธการเข้าถึงตำแหน่ง กรุณาไปที่ตั้งค่าเพื่ออนุญาต',
          loading: false,
          permissionStatus: 'denied'
        });
        return;
      }

      if (permStatus === 'prompt' && isNative) {
        const granted = await requestPermissions();
        if (!granted) {
          setState({
            coordinates: null,
            error: 'ต้องการสิทธิ์ตำแหน่งเพื่อใช้งานฟีเจอร์นี้',
            loading: false,
            permissionStatus: 'denied'
          });
          return;
        }
      }

      const coords = await getCurrentPosition();
      if (coords) {
        setState({
          coordinates: coords,
          error: null,
          loading: false,
          permissionStatus: 'granted'
        });
      }
    } catch (error) {
      handleError(error);
    }
  }, [checkPermissions, requestPermissions, getCurrentPosition, handleError, isNative]);

  // Initial load
  useEffect(() => {
    refreshLocation();
  }, []);

  // Watch position for real-time updates
  const [isWatching, setIsWatching] = useState(false);
  const [watchId, setWatchId] = useState<string | number | null>(null);

  const startWatching = useCallback(async () => {
    if (isWatching) return;

    try {
      if (isNative) {
        const id = await Geolocation.watchPosition(
          { enableHighAccuracy: true },
          (position, err) => {
            if (err) {
              console.error('Watch position error:', err);
              return;
            }
            if (position) {
              setState(prev => ({
                ...prev,
                coordinates: {
                  lat: position.coords.latitude,
                  lng: position.coords.longitude
                },
                loading: false,
                error: null
              }));
            }
          }
        );
        setWatchId(id);
        setIsWatching(true);
      } else if (navigator.geolocation) {
        const id = navigator.geolocation.watchPosition(
          (position) => {
            setState(prev => ({
              ...prev,
              coordinates: {
                lat: position.coords.latitude,
                lng: position.coords.longitude
              },
              loading: false,
              error: null
            }));
          },
          (error) => console.error('Watch position error:', error),
          { enableHighAccuracy: true, timeout: 15000 }
        );
        setWatchId(id);
        setIsWatching(true);
      }
    } catch (error) {
      console.error('Failed to start watching position:', error);
    }
  }, [isWatching, isNative]);

  const stopWatching = useCallback(async () => {
    if (!isWatching || watchId === null) return;

    try {
      if (isNative) {
        await Geolocation.clearWatch({ id: watchId as string });
      } else if (navigator.geolocation) {
        navigator.geolocation.clearWatch(watchId as number);
      }
      setWatchId(null);
      setIsWatching(false);
    } catch (error) {
      console.error('Failed to stop watching position:', error);
    }
  }, [isWatching, watchId, isNative]);

  // Cleanup watch on unmount
  useEffect(() => {
    return () => {
      if (watchId !== null) {
        if (isNative) {
          Geolocation.clearWatch({ id: watchId as string });
        } else if (navigator.geolocation) {
          navigator.geolocation.clearWatch(watchId as number);
        }
      }
    };
  }, [watchId, isNative]);

  // Open app settings - guides user to enable permissions
  const openAppSettings = useCallback(() => {
    toast({
      title: "เปิดการตั้งค่า",
      description: "กรุณาไปที่ ตั้งค่า > แอปพลิเคชัน > D-MIND > สิทธิ์ > ตำแหน่งที่ตั้ง เพื่ออนุญาต",
      duration: 8000,
    });
  }, [toast]);

  return {
    ...state,
    refreshLocation,
    requestPermissions,
    openAppSettings,
    isNative,
    isWatching,
    startWatching,
    stopWatching
  };
};
