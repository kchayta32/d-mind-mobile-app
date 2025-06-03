
import React from 'react';
import { useNavigate } from 'react-router-dom';
import DisasterAlert from '@/components/DisasterAlert';
import NavBar from '@/components/NavBar';
import DisasterResources from '@/components/DisasterResources';
import EnhancedChatBot from '@/components/chat/EnhancedChatBot';
import DisasterMap from '@/components/DisasterMap';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { MessageSquare, Shield } from 'lucide-react';
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
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        {/* Modern Header with Glass Effect */}
        <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-white/20 shadow-lg">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl blur opacity-60"></div>
                  <div className="relative bg-gradient-to-br from-blue-600 to-indigo-700 p-3 rounded-2xl shadow-xl">
                    <img 
                      src="/lovable-uploads/b5550bd4-d83d-4e1e-ac09-025117b87c86.png" 
                      alt="D-MIND Logo" 
                      className="h-6 w-6"
                    />
                  </div>
                </div>
                <div>
                  <h1 className="text-xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">D-MIND</h1>
                  <p className="text-xs text-gray-500 font-medium">Disaster Intelligence System</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <div className="h-2 w-2 bg-emerald-500 rounded-full animate-pulse shadow-lg shadow-emerald-500/50"></div>
                <span className="text-xs text-gray-600 font-medium">ออนไลน์</span>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content with Better Spacing */}
        <main className="px-4 py-6 space-y-8 max-w-md mx-auto pb-8">
          {/* Alert Section with Improved Design */}
          <div className="relative">
            <DisasterAlert isActive={true} />
          </div>
          
          {/* Navigation Section with Modern Card Design */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-white/40 to-blue-50/60 rounded-3xl blur-sm"></div>
            <div className="relative bg-white/90 backdrop-blur-md rounded-3xl shadow-xl border border-white/30 p-6">
              <div className="flex items-center mb-6">
                <div className="h-1 w-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full mr-3"></div>
                <h2 className="text-lg font-semibold text-gray-800">เมนูหลัก</h2>
              </div>
              <NavBar 
                onAssistantClick={handleAssistantClick}
                onManualClick={handleManualClick}
                onContactsClick={handleContactsClick}
                onAlertsClick={handleAlertsClick}
              />
            </div>
          </div>
          
          {/* Emergency Report Button with Enhanced Design */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-red-400 to-red-600 rounded-2xl blur opacity-30"></div>
            <Button 
              className="relative w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-xl hover:shadow-2xl border-0 rounded-2xl py-6 font-semibold text-base transition-all duration-300 transform hover:scale-[1.02]"
              onClick={handleVictimReportsClick}
            >
              <MessageSquare className="mr-3 h-5 w-5" />
              รายงานสถานะผู้ประสบภัย
            </Button>
          </div>
          
          {/* Disaster Map Section with Improved Height */}
          <div className="relative">
            <div className="absolute inset-0 bg-white/40 rounded-3xl blur-sm"></div>
            <div className="relative bg-white/90 backdrop-blur-md rounded-3xl shadow-xl border border-white/30 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-50/80 to-indigo-50/80 px-6 py-5 border-b border-gray-100/50">
                <div className="flex items-center">
                  <div className="h-1 w-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full mr-3"></div>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-800">แผนที่ภัยพิบัติ</h2>
                    <p className="text-sm text-gray-600 mt-1">ข้อมูลสถานการณ์แบบเรียลไทม์</p>
                  </div>
                </div>
              </div>
              <div className="h-[800px] relative">
                <DisasterMap />
              </div>
            </div>
          </div>

          {/* AI Expert Section with Premium Design */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-100/60 to-blue-100/60 rounded-3xl blur-sm"></div>
            <div className="relative bg-white/90 backdrop-blur-md rounded-3xl shadow-xl border border-white/30 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-50/80 to-purple-50/80 px-6 py-5 border-b border-gray-100/50">
                <div className="flex items-center">
                  <div className="h-1 w-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mr-3"></div>
                  <div className="flex-1">
                    <h2 className="text-lg font-semibold text-gray-800 flex items-center">
                      <Shield className="mr-2 h-5 w-5 text-blue-600" />
                      ปรึกษาผู้เชี่ยวชาญ
                    </h2>
                    <p className="text-sm text-gray-600 mt-1">Dr.Mind ผู้เชี่ยวชาญด้านภัยธรรมชาติและแพทย์ฉุกเฉิน</p>
                  </div>
                </div>
              </div>
              <div className="h-[500px]">
                <EnhancedChatBot />
              </div>
            </div>
          </div>
          
          {/* Resources Section with Modern Design */}
          <div className="relative">
            <div className="absolute inset-0 bg-white/40 rounded-3xl blur-sm"></div>
            <div className="relative bg-white/90 backdrop-blur-md rounded-3xl shadow-xl border border-white/30 p-6">
              <div className="flex items-center mb-6">
                <div className="h-1 w-10 bg-gradient-to-r from-emerald-500 to-green-600 rounded-full mr-3"></div>
                <h2 className="text-lg font-semibold text-gray-800">แหล่งข้อมูลฉุกเฉิน</h2>
              </div>
              <DisasterResources />
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Desktop Layout with Improved Design
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex">
      {/* Modern Sidebar */}
      <aside className="w-80 bg-white/90 backdrop-blur-md shadow-2xl border-r border-white/30 flex flex-col">
        {/* Sidebar Header with Gradient */}
        <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 text-white p-6">
          <div className="flex items-center mb-4">
            <div className="relative">
              <div className="absolute inset-0 bg-white/20 rounded-xl blur"></div>
              <img 
                src="/lovable-uploads/b5550bd4-d83d-4e1e-ac09-025117b87c86.png" 
                alt="D-MIND Logo" 
                className="relative h-10 w-10 mr-3"
              />
            </div>
            <h1 className="text-2xl font-bold">D-MIND</h1>
          </div>
          <p className="text-sm opacity-95 leading-relaxed">
            ระบบติดตามภัยพิบัติและแจ้งเตือนอัจฉริยะ
          </p>
        </div>

        {/* Sidebar Content with Better Spacing */}
        <div className="p-6 space-y-6 flex-1">
          <DisasterAlert isActive={true} />
          
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide flex items-center">
              <div className="h-1 w-6 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full mr-2"></div>
              เมนูหลัก
            </h3>
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
              className="w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]"
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

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col">
        {/* Top Bar with Modern Design */}
        <header className="bg-white/90 backdrop-blur-md shadow-lg border-b border-white/30 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="h-1 w-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full mr-3"></div>
              <h2 className="text-xl font-semibold text-gray-800">แผงควบคุมหลัก</h2>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-600 flex items-center">
                สถานะระบบ: 
                <div className="flex items-center ml-2">
                  <div className="h-2 w-2 bg-emerald-500 rounded-full animate-pulse mr-1"></div>
                  <span className="text-emerald-600 font-medium">ออนไลน์</span>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Content Grid with Better Proportions */}
        <div className="flex-1 p-6 grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Map Section */}
          <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-xl border border-white/30 overflow-hidden">
            <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-blue-50/80 to-indigo-50/80">
              <div className="flex items-center">
                <div className="h-1 w-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full mr-3"></div>
                <div>
                  <h3 className="font-semibold text-gray-800">แผนที่ภัยพิบัติ</h3>
                  <p className="text-sm text-gray-600 mt-1">ข้อมูลสถานการณ์แบบเรียลไทม์</p>
                </div>
              </div>
            </div>
            <div className="h-[600px] p-4">
              <DisasterMap />
            </div>
          </div>

          {/* Chatbot Section */}
          <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-xl border border-white/30 overflow-hidden">
            <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-blue-50/80 to-purple-50/80">
              <div className="flex items-center">
                <div className="h-1 w-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mr-3"></div>
                <div className="flex items-center">
                  <Shield className="mr-2 h-5 w-5 text-blue-600" />
                  <div>
                    <h3 className="font-semibold text-gray-800">ปรึกษาผู้เชี่ยวชาญ</h3>
                    <p className="text-sm text-gray-600 mt-1">Dr.Mind ผู้เชี่ยวชาญด้านภัยธรรมชาติและแพทย์ฉุกเฉิน</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="h-[600px]">
              <EnhancedChatBot className="h-full border-0 shadow-none" />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
