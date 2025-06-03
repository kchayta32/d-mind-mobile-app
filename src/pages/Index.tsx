
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useIsMobile } from '@/hooks/use-mobile';
import AppLogo from '@/components/AppLogo';
import SecurityBadge from '@/components/SecurityBadge';
import NavBar from '@/components/NavBar';
import DisasterAlert from '@/components/DisasterAlert';
import NotificationManager from '@/components/NotificationManager';

const Index = () => {
  const isMobile = useIsMobile();
  const navigate = useNavigate();

  const handleAssistantClick = () => {
    navigate('/assistant');
  };

  const handleManualClick = () => {
    navigate('/manual');
  };

  const handleContactsClick = () => {
    navigate('/contacts');
  };

  const handleAlertsClick = () => {
    navigate('/alerts');
  };

  if (isMobile) {
    // Mobile layout
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 p-4">
        <div className="max-w-md mx-auto">
          <AppLogo />
          <div className="space-y-4">
            <DisasterAlert isActive={false} />
            <NotificationManager />
            <NavBar 
              onAssistantClick={handleAssistantClick}
              onManualClick={handleManualClick}
              onContactsClick={handleContactsClick}
              onAlertsClick={handleAlertsClick}
            />
            <SecurityBadge type="secure" />
          </div>
        </div>
      </div>
    );
  }

  // Desktop layout
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex">
      {/* Sidebar */}
      <aside className="w-80 bg-white shadow-xl border-r border-blue-100">
        <div className="p-6">
          <AppLogo />
          <div className="mt-6 space-y-4">
            <DisasterAlert isActive={false} />
            <NotificationManager />
            <NavBar 
              onAssistantClick={handleAssistantClick}
              onManualClick={handleManualClick}
              onContactsClick={handleContactsClick}
              onAlertsClick={handleAlertsClick}
            />
            <SecurityBadge type="secure" />
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        <header className="bg-white shadow-sm border-b border-gray-200 p-6">
          <div className="flex items-center">
            <img 
              src="/lovable-uploads/b5550bd4-d83d-4e1e-ac09-025117b87c86.png" 
              alt="D-MIND Logo" 
              className="h-8 w-8 mr-3"
            />
            <div>
              <h1 className="text-2xl font-bold text-blue-700">D-MIND</h1>
              <p className="text-gray-600">ระบบเตือนภัยและช่วยเหลือประชาชนอัจฉริยะ</p>
            </div>
          </div>
        </header>

        <div className="flex-1 p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">ข้อมูลภัยพิบัติ</h2>
              <p className="text-gray-600">
                ติดตามข้อมูลภัยพิบัติและสถานการณ์ฉุกเฉินแบบเรียลไทม์
              </p>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">AI Assistant</h2>
              <p className="text-gray-600">
                ปรึกษาผู้ช่วยปัญญาประดิษฐ์เพื่อรับคำแนะนำในการรับมือภัยพิบัติ
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
