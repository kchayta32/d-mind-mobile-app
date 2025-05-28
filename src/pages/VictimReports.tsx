
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import VictimReportForm from '@/components/victim-reports/VictimReportForm';
import VictimReportsList from '@/components/victim-reports/VictimReportsList';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useIsMobile } from '@/hooks/use-mobile';

const VictimReports: React.FC = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  if (isMobile) {
    // Mobile layout (existing)
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
        {/* Header */}
        <header className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4 shadow-lg">
          <div className="container max-w-7xl mx-auto flex items-center">
            <Button 
              variant="ghost" 
              size="icon"
              className="text-white mr-3 hover:bg-blue-400/30 rounded-full" 
              onClick={() => navigate('/')}
            >
              <ArrowLeft className="h-6 w-6" />
              <span className="sr-only">กลับ</span>
            </Button>
            <div className="flex items-center">
              <img 
                src="/lovable-uploads/b5550bd4-d83d-4e1e-ac09-025117b87c86.png" 
                alt="D-MIND Logo" 
                className="h-8 w-8 mr-3"
              />
              <h1 className="text-xl font-bold">รายงานสถานะผู้ประสบภัย</h1>
            </div>
          </div>
        </header>
        
        {/* Main Content - Responsive Layout */}
        <main className="container max-w-7xl mx-auto p-4">
          <Tabs defaultValue="report" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-4 bg-white border border-blue-200 max-w-md mx-auto lg:max-w-none">
              <TabsTrigger 
                value="report"
                className="data-[state=active]:bg-blue-500 data-[state=active]:text-white"
              >
                รายงานสถานะ
              </TabsTrigger>
              <TabsTrigger 
                value="view"
                className="data-[state=active]:bg-blue-500 data-[state=active]:text-white"
              >
                ดูรายงานทั้งหมด
              </TabsTrigger>
            </TabsList>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <TabsContent value="report" className="space-y-4 lg:col-span-1">
                <div className="bg-white rounded-lg shadow-md border border-blue-200 p-4">
                  <h2 className="text-lg font-semibold mb-4 text-blue-700">แจ้งสถานะของท่านหรือผู้ประสบภัย</h2>
                  <VictimReportForm />
                </div>
              </TabsContent>
              
              <TabsContent value="view" className="lg:col-span-2">
                <VictimReportsList />
              </TabsContent>
            </div>
          </Tabs>
        </main>
      </div>
    );
  }

  // Desktop layout
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex">
      {/* Sidebar */}
      <aside className="w-80 bg-white shadow-xl border-r border-blue-100">
        <div className="p-6">
          <Button 
            variant="ghost" 
            className="mb-4 text-blue-600 hover:bg-blue-50"
            onClick={() => navigate('/')}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            กลับหน้าหลัก
          </Button>
          
          <div className="flex items-center mb-6">
            <img 
              src="/lovable-uploads/b5550bd4-d83d-4e1e-ac09-025117b87c86.png" 
              alt="D-MIND Logo" 
              className="h-8 w-8 mr-3"
            />
            <h1 className="text-xl font-bold text-blue-700">รายงานสถานะผู้ประสบภัย</h1>
          </div>

          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <h2 className="text-lg font-semibold mb-4 text-blue-700">แจ้งสถานะใหม่</h2>
            <VictimReportForm />
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        <header className="bg-white shadow-sm border-b border-gray-200 p-6">
          <h2 className="text-2xl font-semibold text-gray-800">รายงานสถานะผู้ประสบภัย</h2>
          <p className="text-gray-600 mt-2">ติดตามและจัดการรายงานสถานะของผู้ประสบภัยในระบบ</p>
        </header>

        <div className="flex-1 p-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 h-full">
            <div className="p-6 border-b border-gray-200 bg-gray-50">
              <h3 className="font-semibold text-gray-800">รายงานทั้งหมด</h3>
            </div>
            <div className="p-6 overflow-auto">
              <VictimReportsList />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default VictimReports;
