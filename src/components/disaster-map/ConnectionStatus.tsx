
import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff, Signal } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

export const ConnectionStatus: React.FC = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [connectionType, setConnectionType] = useState<string>('unknown');

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      toast({
        title: "เชื่อมต่ออินเทอร์เน็ตแล้ว",
        description: "ระบบกลับมาทำงานปกติแล้ว",
        duration: 3000,
      });
    };

    const handleOffline = () => {
      setIsOnline(false);
      toast({
        title: "ขาดการเชื่อมต่ออินเทอร์เน็ต",
        description: "กรุณาตรวจสอบการเชื่อมต่อของคุณ",
        variant: "destructive",
        duration: 5000,
      });
    };

    const updateConnectionType = () => {
      if ('connection' in navigator) {
        const connection = (navigator as any).connection;
        setConnectionType(connection?.effectiveType || 'unknown');
      }
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    // Check connection type if available
    updateConnectionType();
    if ('connection' in navigator) {
      (navigator as any).connection?.addEventListener('change', updateConnectionType);
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      if ('connection' in navigator) {
        (navigator as any).connection?.removeEventListener('change', updateConnectionType);
      }
    };
  }, []);

  if (!isOnline) {
    return (
      <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-[1002] bg-red-600 text-white px-4 py-2 rounded-lg shadow-lg flex items-center space-x-2">
        <WifiOff className="h-4 w-4" />
        <span className="text-sm font-medium">ไม่มีการเชื่อมต่อ</span>
      </div>
    );
  }

  return (
    <div className="fixed top-4 right-4 z-[1002]">
      <div className="bg-white/90 backdrop-blur rounded-lg p-2 shadow-sm border border-gray-200 flex items-center space-x-2">
        <div className="flex items-center space-x-1">
          {connectionType === '4g' || connectionType === '3g' ? (
            <Signal className="h-3 w-3 text-green-600" />
          ) : (
            <Wifi className="h-3 w-3 text-green-600" />
          )}
          <span className="text-xs text-gray-600 uppercase font-medium">
            {connectionType !== 'unknown' ? connectionType : 'เชื่อมต่อแล้ว'}
          </span>
        </div>
      </div>
    </div>
  );
};
