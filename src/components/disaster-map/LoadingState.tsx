
import React from 'react';
import { Loader2, Wifi, WifiOff } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface LoadingStateProps {
  type: 'loading' | 'error' | 'offline';
  message?: string;
  onRetry?: () => void;
}

export const LoadingState: React.FC<LoadingStateProps> = ({ 
  type, 
  message, 
  onRetry 
}) => {
  if (type === 'loading') {
    return (
      <div className="absolute inset-0 bg-white/90 backdrop-blur-sm flex items-center justify-center z-[1000]">
        <Card className="bg-white/95 shadow-lg border-0">
          <CardContent className="p-6 text-center">
            <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              กำลังโหลดข้อมูล
            </h3>
            <p className="text-sm text-gray-600">
              {message || 'กรุณารอสักครู่...'}
            </p>
            <div className="mt-4 flex space-x-1 justify-center">
              <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (type === 'error') {
    return (
      <div className="absolute inset-0 bg-red-50/90 backdrop-blur-sm flex items-center justify-center z-[1000]">
        <Card className="bg-white/95 shadow-lg border-red-200">
          <CardContent className="p-6 text-center max-w-sm">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <WifiOff className="h-8 w-8 text-red-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              เกิดข้อผิดพลาด
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              {message || 'ไม่สามารถโหลดข้อมูลได้ กรุณาลองใหม่อีกครั้ง'}
            </p>
            {onRetry && (
              <button
                onClick={onRetry}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
              >
                ลองใหม่
              </button>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  if (type === 'offline') {
    return (
      <div className="absolute inset-0 bg-gray-50/90 backdrop-blur-sm flex items-center justify-center z-[1000]">
        <Card className="bg-white/95 shadow-lg border-gray-200">
          <CardContent className="p-6 text-center max-w-sm">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <WifiOff className="h-8 w-8 text-gray-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              ไม่มีการเชื่อมต่อ
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              กรุณาตรวจสอบการเชื่อมต่ออินเทอร์เน็ต
            </p>
            <div className="flex items-center justify-center space-x-2 text-xs text-gray-500">
              <div className="w-3 h-3 bg-gray-300 rounded-full animate-ping"></div>
              <span>กำลังตรวจสอบ...</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return null;
};
