
import React, { Suspense } from 'react';
import { useNavigate } from 'react-router-dom';
import DisasterAlert from '@/components/DisasterAlert';
import NavBar from '@/components/NavBar';
import DisasterResources from '@/components/DisasterResources';
import NotificationCenter from '@/components/notifications/NotificationCenter';
import EmergencyAlertSystem from '@/components/notifications/EmergencyAlertSystem';
import { Button } from '@/components/ui/button';
import { MessageSquare } from 'lucide-react';
import ErrorBoundary from '@/components/ErrorBoundary';

// Lazy load heavy components
const LazyDisasterMap = React.lazy(() => import('@/components/DisasterMap'));
const LazyEnhancedChatBot = React.lazy(() => import('@/components/chat/EnhancedChatBot'));

interface MobileMainContentProps {
  onAssistantClick: () => void;
  onManualClick: () => void;
  onContactsClick: () => void;
  onAlertsClick: () => void;
  onVictimReportsClick: () => void;
  onLineClick: () => void;
}

const MobileMainContent: React.FC<MobileMainContentProps> = ({
  onAssistantClick,
  onManualClick,
  onContactsClick,
  onAlertsClick,
  onVictimReportsClick,
  onLineClick
}) => {
  return (
    <main className="px-4 py-6 space-y-6 max-w-md mx-auto">
      {/* Alert Section */}
      <div className="space-y-4">
        <DisasterAlert isActive={true} />
      </div>

      {/* Emergency Alert System */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
          <div className="h-1 w-8 bg-gradient-to-r from-red-500 to-red-600 rounded-full mr-3"></div>
          ระบบแจ้งเตือนฉุกเฉิน
        </h2>
        <EmergencyAlertSystem />
      </div>

      {/* Notification Center */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
          <div className="h-1 w-8 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full mr-3"></div>
          ตั้งค่าการแจ้งเตือน
        </h2>
        <NotificationCenter />
      </div>
      
      {/* Navigation Section */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
          <div className="h-1 w-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full mr-3"></div>
          เมนูหลัก
        </h2>
        <NavBar 
          onAssistantClick={onAssistantClick}
          onManualClick={onManualClick}
          onContactsClick={onContactsClick}
          onAlertsClick={onAlertsClick}
        />
      </div>
      
      {/* Emergency Report Button */}
      <div className="bg-gradient-to-r from-red-500 to-red-600 rounded-2xl shadow-lg p-1">
        <Button 
          className="w-full bg-red-600 hover:bg-red-700 text-white shadow-none border-0 rounded-xl py-4 font-semibold text-base transition-all duration-200"
          onClick={onVictimReportsClick}
        >
          <MessageSquare className="mr-3 h-5 w-5" />
          รายงานสถานะผู้ประสบภัย
        </Button>
      </div>
      
      {/* Disaster Map Section with Lazy Loading */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800 flex items-center">
            <div className="h-1 w-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full mr-3"></div>
            แผนที่ภัยพิบัติ
          </h2>
          <p className="text-sm text-gray-600 mt-1">ข้อมูลสถานการณ์แบบเรียลไทม์</p>
        </div>
        <div className="h-[1000px] relative overflow-auto">
          <div className="min-h-full">
            <ErrorBoundary fallback={<div className="p-4 text-center text-red-500">เกิดข้อผิดพลาดในการโหลดแผนที่</div>}>
              <Suspense fallback={
                <div className="h-full flex items-center justify-center">
                  <div className="text-center">
                    <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
                    <p className="mt-2 text-gray-600">กำลังโหลดแผนที่...</p>
                  </div>
                </div>
              }>
                <LazyDisasterMap />
              </Suspense>
            </ErrorBoundary>
          </div>
        </div>
      </div>

      {/* Enhanced AI Chat Section with Lazy Loading */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-50 to-purple-100 px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800 flex items-center">
            <div className="h-1 w-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mr-3"></div>
            ปรึกษาผู้เชี่ยวชาญ
          </h2>
          <p className="text-sm text-gray-600 mt-1">Dr.Mind ผู้เชี่ยวชาญด้านภัยธรรมชาติและแพทย์ฉุกเฉิน</p>
        </div>
        <div className="p-0">
          <ErrorBoundary fallback={<div className="p-4 text-center text-red-500">เกิดข้อผิดพลาดในการโหลดชาทบอท</div>}>
            <Suspense fallback={
              <div className="h-64 flex items-center justify-center">
                <div className="text-center">
                  <div className="animate-spin w-6 h-6 border-4 border-purple-500 border-t-transparent rounded-full mx-auto"></div>
                  <p className="mt-2 text-gray-600">กำลังโหลดชาทบอท...</p>
                </div>
              </div>
            }>
              <LazyEnhancedChatBot />
            </Suspense>
          </ErrorBoundary>
        </div>
      </div>
      
      {/* Resources Section */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
          <div className="h-1 w-8 bg-gradient-to-r from-green-500 to-green-600 rounded-full mr-3"></div>
          แหล่งข้อมูลฉุกเฉิน
        </h2>
        <DisasterResources />
      </div>

      {/* LINE Contact Button */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
          <div className="h-1 w-8 bg-gradient-to-r from-green-500 to-green-600 rounded-full mr-3"></div>
          ติดต่อเรา
        </h2>
        <Button 
          className="w-full bg-green-500 hover:bg-green-600 text-white shadow-md rounded-xl py-4 font-semibold text-base transition-all duration-200"
          onClick={onLineClick}
        >
          <div className="flex items-center justify-center">
            <svg className="w-6 h-6 mr-3" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12.5 2C7.1 2 2.7 5.6 2.7 10.1c0 2.4 1.2 4.5 3.1 6.1-.4 1.4-1.3 4.8-1.3 4.8s-.1.4.2.4c.2 0 .4-.1.5-.2 0 0 3.7-2.5 5.4-3.7.5.1 1 .1 1.4.1 5.4 0 9.8-3.6 9.8-8.1S17.9 2 12.5 2z"/>
            </svg>
            เพิ่มเพื่อน LINE
          </div>
        </Button>
      </div>

      {/* Bottom spacing for better scroll experience */}
      <div className="h-6"></div>
    </main>
  );
};

export default MobileMainContent;
