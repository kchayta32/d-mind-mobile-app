
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, List, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import IncidentReportForm from '@/components/incident-reports/IncidentReportForm';
import IncidentReportsList from '@/components/incident-reports/IncidentReportsList';
import { useIsMobile } from '@/hooks/use-mobile';

const IncidentReports: React.FC = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [activeTab, setActiveTab] = useState('list');

  if (isMobile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50">
        {/* Header */}
        <header className="bg-gradient-to-r from-red-500 to-red-600 text-white p-4 shadow-lg">
          <div className="container mx-auto max-w-7xl flex items-center">
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-white mr-3 hover:bg-red-400/30 rounded-full" 
              onClick={() => navigate('/')}
            >
              <ArrowLeft className="h-6 w-6" />
            </Button>
            <div className="flex items-center">
              <img 
                src="/lovable-uploads/b5550bd4-d83d-4e1e-ac09-025117b87c86.png" 
                alt="D-MIND Logo" 
                className="h-8 w-8 mr-3"
              />
              <h1 className="text-xl font-bold">รายงานเหตุการณ์ภัยพิบัติ</h1>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="container mx-auto p-4 max-w-7xl">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="list" className="flex items-center gap-2">
                <List className="h-4 w-4" />
                รายการรายงาน
              </TabsTrigger>
              <TabsTrigger value="report" className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                รายงานใหม่
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="list" className="mt-6">
              <IncidentReportsList />
            </TabsContent>
            
            <TabsContent value="report" className="mt-6">
              <IncidentReportForm />
            </TabsContent>
          </Tabs>
        </main>
      </div>
    );
  }

  // Desktop layout
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex">
      {/* Sidebar */}
      <aside className="w-80 bg-white shadow-xl border-r border-red-100">
        <div className="p-6">
          <Button 
            variant="ghost" 
            className="mb-4 text-red-600 hover:bg-red-50"
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
            <h1 className="text-xl font-bold text-red-700">รายงานเหตุการณ์</h1>
          </div>

          <div className="space-y-3">
            <Button
              variant={activeTab === 'list' ? 'default' : 'outline'}
              className="w-full justify-start"
              onClick={() => setActiveTab('list')}
            >
              <List className="mr-2 h-4 w-4" />
              รายการรายงาน
            </Button>
            <Button
              variant={activeTab === 'report' ? 'default' : 'outline'}
              className="w-full justify-start"
              onClick={() => setActiveTab('report')}
            >
              <Plus className="mr-2 h-4 w-4" />
              รายงานเหตุการณ์ใหม่
            </Button>
          </div>

          <div className="mt-6 p-4 bg-red-50 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="h-4 w-4 text-red-500" />
              <span className="font-semibold text-red-700">คำแนะนำ</span>
            </div>
            <ul className="text-sm text-red-600 space-y-1">
              <li>• รายงานเหตุการณ์ที่เกิดขึ้นจริง</li>
              <li>• แนบรูปภาพประกอบหากเป็นไปได้</li>
              <li>• ระบุตำแหน่งให้ชัดเจน</li>
              <li>• ข้อมูลจะถูกส่งไปยังหน่วยงานที่เกี่ยวข้อง</li>
            </ul>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        <header className="bg-white shadow-sm border-b border-gray-200 p-6">
          <h2 className="text-2xl font-semibold text-gray-800">
            {activeTab === 'list' ? 'รายการรายงานเหตุการณ์' : 'รายงานเหตุการณ์ใหม่'}
          </h2>
          <p className="text-gray-600 mt-2">
            {activeTab === 'list' 
              ? 'ติดตามสถานะรายงานเหตุการณ์ภัยพิบัติ' 
              : 'แจ้งเหตุการณ์ภัยพิบัติหรือสถานการณ์ฉุกเฉิน'
            }
          </p>
        </header>

        <div className="flex-1 p-6 overflow-auto">
          <div className="max-w-4xl mx-auto">
            {activeTab === 'list' ? <IncidentReportsList /> : <IncidentReportForm />}
          </div>
        </div>
      </main>
    </div>
  );
};

export default IncidentReports;
