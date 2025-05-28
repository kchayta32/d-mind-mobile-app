
import React from 'react';
import { useNavigate } from 'react-router-dom';
import DisasterAlert from '@/components/DisasterAlert';
import NavBar from '@/components/NavBar';
import DisasterResources from '@/components/DisasterResources';
import AIChat from '@/components/AIChat';
import DisasterMap from '@/components/DisasterMap';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { MessageSquare, AlertTriangle } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

const Index = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const isMobile = useIsMobile();

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
  
  const handleVictimReportsClick = () => {
    navigate('/victim-reports');
  };

  if (isMobile) {
    // Mobile layout (existing)
    return (
      <div className="min-h-screen bg-gradient-to-br from-guardian-light-blue to-white">
        {/* Header */}
        <header className="bg-gradient-to-r from-guardian-gradient-start to-guardian-gradient-end text-white p-4 flex flex-col items-start shadow-lg">
          <div className="flex items-center">
            <img 
              src="/lovable-uploads/b5550bd4-d83d-4e1e-ac09-025117b87c86.png" 
              alt="D-MIND Logo" 
              className="h-8 w-8 mr-3"
            />
            <h1 className="text-2xl font-bold font-sans">D-MIND</h1>
          </div>
          <p className="text-sm mt-2 font-sans opacity-90">
            ระบบติดตามภัยพิบัติและแจ้งเตือนอัจฉริยะ (Disaster Monitoring and Intelligent Notification Device)
          </p>
        </header>

        {/* Main Content */}
        <main className="container mx-auto p-4 max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-4">
              <DisasterAlert isActive={true} />
              
              <NavBar 
                onAssistantClick={handleAssistantClick}
                onManualClick={handleManualClick}
                onContactsClick={handleContactsClick}
                onAlertsClick={handleAlertsClick}
              />
              
              {/* Victim Reports Button */}
              <Button 
                className="w-full bg-red-600 hover:bg-red-700 text-white shadow-md"
                onClick={handleVictimReportsClick}
              >
                <MessageSquare className="mr-2 h-4 w-4" />
                รายงานสถานะผู้ประสบภัย
              </Button>
              
              <DisasterResources />
            </div>
            
            {/* Right Column */}
            <div className="space-y-4">
              <DisasterMap />
              
              <div id="ai-chat">
                <AIChat />
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Desktop/Landscape layout
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex">
      {/* Sidebar */}
      <aside className="w-80 bg-white shadow-xl border-r border-blue-100 flex flex-col">
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
              onAssistantClick={handleAssistantClick}
              onManualClick={handleManualClick}
              onContactsClick={handleContactsClick}
              onAlertsClick={handleAlertsClick}
            />
          </div>
          
          {/* Victim Reports Button */}
          <div className="pt-4 border-t border-gray-100">
            <Button 
              className="w-full bg-red-600 hover:bg-red-700 text-white shadow-md"
              onClick={handleVictimReportsClick}
            >
              <MessageSquare className="mr-2 h-4 w-4" />
              รายงานสถานะผู้ประสบภัย
            </Button>
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

        {/* Content Area */}
        <div className="flex-1 p-6">
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 h-full">
            {/* Left Panel - Map */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-4 border-b border-gray-200 bg-gray-50">
                <h3 className="font-semibold text-gray-800">แผนที่ภัยพิบัติ</h3>
              </div>
              <div className="p-4">
                <DisasterMap />
              </div>
            </div>
            
            {/* Right Panel - AI Chat */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-4 border-b border-gray-200 bg-gray-50">
                <h3 className="font-semibold text-gray-800">AI Assistant</h3>
              </div>
              <div className="p-4">
                <div id="ai-chat">
                  <AIChat />
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
