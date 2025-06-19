
import React, { Suspense } from 'react';
import { useNavigate } from 'react-router-dom';
import DisasterAlert from '@/components/DisasterAlert';
import NavBar from '@/components/NavBar';
import DisasterResources from '@/components/DisasterResources';
import { Button } from '@/components/ui/button';
import { MessageSquare, FileText } from 'lucide-react';
import ErrorBoundary from '@/components/ErrorBoundary';

// Lazy load heavy components
const LazyDisasterMap = React.lazy(() => import('@/components/DisasterMap'));
const LazyEnhancedChatBot = React.lazy(() => import('@/components/chat/EnhancedChatBot'));

interface DesktopLayoutProps {
  onAssistantClick: () => void;
  onManualClick: () => void;
  onContactsClick: () => void;
  onAlertsClick: () => void;
  onVictimReportsClick: () => void;
  onIncidentReportsClick: () => void;
}

const DesktopLayout: React.FC<DesktopLayoutProps> = ({
  onAssistantClick,
  onManualClick,
  onContactsClick,
  onAlertsClick,
  onVictimReportsClick,
  onIncidentReportsClick
}) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex">
      {/* Sidebar */}
      <aside className="w-72 bg-white shadow-xl border-r border-blue-100 flex flex-col">
        {/* Sidebar Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6">
          <div className="flex items-center mb-3">
            <img 
              src="/lovable-uploads/b5550bd4-d83d-4e1e-ac09-025117b87c86.png" 
              alt="D-MIND Logo" 
              className="h-10 w-10 mr-3"
            />
            <h1 className="text-xl font-bold">D-MIND</h1>
          </div>
          <p className="text-sm opacity-90 leading-relaxed">
            ระบบติดตามภัยพิบัติและแจ้งเตือนอัจฉริยะ
          </p>
        </div>

        {/* Navigation */}
        <div className="p-6 space-y-4 flex-1">
          <DisasterAlert isActive={true} />
          
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">เมนูหลัก</h3>
            <NavBar 
              onAssistantClick={onAssistantClick}
              onManualClick={onManualClick}
              onContactsClick={onContactsClick}
              onAlertsClick={onAlertsClick}
            />
          </div>
          
          {/* Reporting Section */}
          <div className="pt-4 border-t border-gray-100">
            <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">รายงาน</h3>
            <div className="space-y-2">
              <Button 
                className="w-full bg-red-600 hover:bg-red-700 text-white shadow-md justify-start"
                onClick={onVictimReportsClick}
              >
                <MessageSquare className="mr-2 h-4 w-4" />
                รายงานสถานะผู้ประสบภัย
              </Button>
              
              <Button 
                className="w-full bg-orange-600 hover:bg-orange-700 text-white shadow-md justify-start"
                onClick={onIncidentReportsClick}
              >
                <FileText className="mr-2 h-4 w-4" />
                รายงานเหตุการณ์ภัยพิบัติ
              </Button>
            </div>
          </div>
          
          <div className="pt-4">
            <DisasterResources />
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        {/* Top Bar */}
        <header className="bg-white shadow-sm border-b border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-800">แผงควบคุมหลัก</h2>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-600">
                สถานะระบบ: <span className="text-green-600 font-medium">ออนไลน์</span>
              </div>
            </div>
          </div>
        </header>

        {/* Content Area - Split layout */}
        <div className="flex-1 p-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Map Section */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-4 border-b border-gray-200 bg-gray-50">
              <h3 className="font-semibold text-gray-800">แผนที่ภัยพิบัติ</h3>
              <p className="text-sm text-gray-600 mt-1">ข้อมูลสถานการณ์แบบเรียลไทม์</p>
            </div>
            <div className="p-6 h-[calc(100%-80px)] min-h-[500px]">
              <ErrorBoundary fallback={<div className="text-red-500 text-center">เกิดข้อผิดพลาดในการโหลดแผนที่</div>}>
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

          {/* Enhanced Chatbot Section */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50">
              <h3 className="font-semibold text-gray-800">ปรึกษาผู้เชี่ยวชาญ</h3>
              <p className="text-sm text-gray-600 mt-1">Dr.Mind ผู้เชี่ยวชาญด้านภัยธรรมชาติและแพทย์ฉุกเฉิน</p>
            </div>
            <div className="h-[calc(100%-80px)]">
              <ErrorBoundary fallback={<div className="text-red-500 text-center p-4">เกิดข้อผิดพลาดในการโหลดชาทบอท</div>}>
                <Suspense fallback={
                  <div className="h-full flex items-center justify-center">
                    <div className="text-center">
                      <div className="animate-spin w-6 h-6 border-4 border-purple-500 border-t-transparent rounded-full mx-auto"></div>
                      <p className="mt-2 text-gray-600">กำลังโหลดชาทบอท...</p>
                    </div>
                  </div>
                }>
                  <LazyEnhancedChatBot className="h-full border-0 shadow-none" />
                </Suspense>
              </ErrorBoundary>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DesktopLayout;
