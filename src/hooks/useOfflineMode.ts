
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

export const useOfflineMode = () => {
  // Add defensive check for React initialization
  const [isOnline, setIsOnline] = useState(() => {
    if (typeof navigator !== 'undefined' && navigator.onLine !== undefined) {
      return navigator.onLine;
    }
    return true; // Default to online if navigator is not available
  });
  
  const [offlineData, setOfflineData] = useState<any>(null);
  
  // Only use toast if it's available
  let toast: any;
  try {
    const toastHook = useToast();
    toast = toastHook.toast;
  } catch (error) {
    // Fallback if toast is not available
    toast = () => {};
  }

  useEffect(() => {
    // Check if we're in a browser environment
    if (typeof window === 'undefined') return;

    const handleOnline = () => {
      setIsOnline(true);
      if (toast) {
        toast({
          title: "กลับมาออนไลน์แล้ว",
          description: "การเชื่อมต่ออินเทอร์เน็ตกลับมาปกติ",
          duration: 3000,
        });
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
      if (toast) {
        toast({
          title: "โหมดออฟไลน์",
          description: "คุณสามารถใช้งานข้อมูลที่บันทึกไว้ได้",
          duration: 5000,
        });
      }
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Load cached data from localStorage
    try {
      const cachedData = localStorage.getItem('dmind-offline-data');
      if (cachedData) {
        setOfflineData(JSON.parse(cachedData));
      }
    } catch (error) {
      console.warn('Failed to load cached data:', error);
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [toast]);

  const cacheData = (key: string, data: any) => {
    try {
      const currentCache = JSON.parse(localStorage.getItem('dmind-offline-data') || '{}');
      currentCache[key] = {
        data,
        timestamp: Date.now()
      };
      localStorage.setItem('dmind-offline-data', JSON.stringify(currentCache));
      setOfflineData(currentCache);
    } catch (error) {
      console.warn('Failed to cache data:', error);
    }
  };

  const getCachedData = (key: string) => {
    if (!offlineData || !offlineData[key]) return null;
    
    const cached = offlineData[key];
    const maxAge = 24 * 60 * 60 * 1000; // 24 hours
    
    if (Date.now() - cached.timestamp > maxAge) {
      return null;
    }
    
    return cached.data;
  };

  return {
    isOnline,
    offlineData,
    cacheData,
    getCachedData
  };
};
