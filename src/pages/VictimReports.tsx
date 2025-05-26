
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import VictimReportForm from '@/components/victim-reports/VictimReportForm';
import VictimReportsList from '@/components/victim-reports/VictimReportsList';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const VictimReports: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4 shadow-lg">
        <div className="container max-w-md mx-auto flex items-center">
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
      
      {/* Main Content */}
      <main className="container max-w-md mx-auto p-4">
        <Tabs defaultValue="report" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4 bg-white border border-blue-200">
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
          
          <TabsContent value="report" className="space-y-4">
            <div className="bg-white rounded-lg shadow-md border border-blue-200 p-4">
              <h2 className="text-lg font-semibold mb-4 text-blue-700">แจ้งสถานะของท่านหรือผู้ประสบภัย</h2>
              <VictimReportForm />
            </div>
          </TabsContent>
          
          <TabsContent value="view">
            <VictimReportsList />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default VictimReports;
