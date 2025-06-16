import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DisasterAlert from '@/components/DisasterAlert';
import NavBar from '@/components/NavBar';
import DisasterResources from '@/components/DisasterResources';
import EnhancedChatBot from '@/components/chat/EnhancedChatBot';
import DisasterMap from '@/components/DisasterMap';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { MessageSquare, AlertTriangle } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

const Index = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const isMobile = useIsMobile();

  // Fix auto-scroll issue
  useEffect(() => {
    // Reset scroll position to top when component mounts
    window.scrollTo(0, 0);
    
    // Prevent any auto-scrolling
    const preventAutoScroll = (e: Event) => {
      e.preventDefault();
    };
    
    // Add a small delay to ensure DOM is fully loaded
    const timeoutId = setTimeout(() => {
      window.scrollTo(0, 0);
    }, 100);

    return () => {
      clearTimeout(timeoutId);
    };
  }, []);

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

  const handleLineClick = () => {
    window.open('https://line.me/R/ti/p/@307rcire', '_blank');
  };

  if (isMobile) {
    // Enhanced Mobile layout with professional design
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100">
        {/* Enhanced Header */}
        <header className="bg-white shadow-lg border-b border-blue-100 sticky top-0 z-50">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="bg-gradient-to-br from-blue-600 to-blue-700 p-2 rounded-xl shadow-md">
                  <img 
                    src="/lovable-uploads/b5550bd4-d83d-4e1e-ac09-025117b87c86.png" 
                    alt="D-MIND Logo" 
                    className="h-6 w-6"
                  />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-800">D-MIND</h1>
                  <p className="text-xs text-gray-500 font-medium">Disaster Monitoring System</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-xs text-gray-600 font-medium">ออนไลน์</span>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content with improved spacing */}
        <main className="px-4 py-6 space-y-6 max-w-md mx-auto">
          {/* Alert Section */}
          <div className="space-y-4">
            <DisasterAlert isActive={true} />
          </div>
          
          {/* Navigation Section - Now icon-only */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <div className="h-1 w-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full mr-3"></div>
              เมนูหลัก
            </h2>
            <NavBar 
              onAssistantClick={handleAssistantClick}
              onManualClick={handleManualClick}
              onContactsClick={handleContactsClick}
              onAlertsClick={handleAlertsClick}
            />
          </div>
          
          {/* Emergency Report Button - Now red color */}
          <div className="bg-gradient-to-r from-red-500 to-red-600 rounded-2xl shadow-lg p-1">
            <Button 
              className="w-full bg-red-600 hover:bg-red-700 text-white shadow-none border-0 rounded-xl py-4 font-semibold text-base transition-all duration-200"
              onClick={handleVictimReportsClick}
            >
              <MessageSquare className="mr-3 h-5 w-5" />
              รายงานสถานะผู้ประสบภัย
            </Button>
          </div>
          
          {/* Disaster Map Section - Increased height significantly */}
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
                <DisasterMap />
              </div>
            </div>
          </div>

          {/* Enhanced AI Chat Section - Now with expert personality */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-50 to-purple-100 px-6 py-4 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-800 flex items-center">
                <div className="h-1 w-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mr-3"></div>
                ปรึกษาผู้เชี่ยวชาญ
              </h2>
                <p className="text-sm text-gray-600 mt-1">Dr.Mind ผู้เชี่ยวชาญด้านภัยธรรมชาติและแพทย์ฉุกเฉิน</p>
            </div>
            <div className="p-0">
              <EnhancedChatBot />
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
              onClick={handleLineClick}
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
      </div>
    );
  }

  // Desktop/Landscape layout - Improved proportions and removed AI Assistant
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex">
      {/* Sidebar - Made narrower for better proportions */}
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

      {/* Main Content - Split between map and chatbot */}
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
              <DisasterMap />
            </div>
          </div>

          {/* Enhanced Chatbot Section */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50">
              <h3 className="font-semibold text-gray-800">ปรึกษาผู้เชี่ยวชาญ</h3>
              <p className="text-sm text-gray-600 mt-1">Dr.Mind ผู้เชี่ยวชาญด้านภัยธรรมชาติและแพทย์ฉุกเฉิน</p>
            </div>
            <div className="h-[calc(100%-80px)]">
              <EnhancedChatBot className="h-full border-0 shadow-none" />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
