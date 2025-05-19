
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
    <div className="min-h-screen bg-guardian-light-bg">
      <header className="bg-guardian-purple text-white p-4 flex items-center gap-2">
        <Button 
          variant="ghost" 
          size="icon"
          className="text-white hover:bg-guardian-purple/80 p-1" 
          onClick={() => navigate('/')}
        >
          <ArrowLeft className="h-6 w-6" />
          <span className="sr-only">กลับ</span>
        </Button>
        <h1 className="text-xl font-bold">รายงานสถานะผู้ประสบภัย</h1>
      </header>
      
      <main className="container max-w-md mx-auto p-4">
        <Tabs defaultValue="report" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="report">รายงานสถานะ</TabsTrigger>
            <TabsTrigger value="view">ดูรายงานทั้งหมด</TabsTrigger>
          </TabsList>
          
          <TabsContent value="report" className="space-y-4">
            <div className="bg-white rounded-lg shadow p-4">
              <h2 className="text-lg font-semibold mb-4">แจ้งสถานะของท่านหรือผู้ประสบภัย</h2>
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
