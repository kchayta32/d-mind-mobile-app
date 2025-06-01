
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useDisasterAlerts } from '@/components/disaster-alerts/useDisasterAlerts';
import AlertFilters from '@/components/disaster-alerts/AlertFilters';
import AlertsList from '@/components/disaster-alerts/AlertsList';
import { Button } from '@/components/ui/button';
import { RefreshCw, ArrowLeft } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

const Alerts: React.FC = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { 
    alerts, 
    isLoading, 
    filters, 
    updateFilters, 
    refetch, 
    alertTypes, 
    severityLevels 
  } = useDisasterAlerts();

  if (isMobile) {
    // Mobile layout (existing)
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
        {/* Header */}
        <header className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4 shadow-lg">
          <div className="container mx-auto max-w-7xl flex items-center">
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-white mr-3 hover:bg-blue-400/30 rounded-full" 
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
              <h1 className="text-xl font-bold">การแจ้งเตือนภัยพิบัติทั้งหมด</h1>
            </div>
          </div>
        </header>

        {/* Main Content - Responsive Layout */}
        <main className="container mx-auto p-4 max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Filters Sidebar */}
            <div className="lg:col-span-1">
              <div className="mb-4 flex justify-end lg:justify-start">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => refetch()} 
                  disabled={isLoading}
                  className="flex items-center gap-2 bg-white hover:bg-blue-50 border-blue-200 text-blue-600 hover:text-blue-700"
                >
                  <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                  รีเฟรช
                </Button>
              </div>
              
              <AlertFilters
                filters={filters}
                updateFilters={updateFilters}
                availableTypes={alertTypes}
                availableSeverities={severityLevels}
              />
            </div>
            
            {/* Alerts List */}
            <div className="lg:col-span-3">
              <AlertsList
                alerts={alerts}
                isLoading={isLoading}
              />
            </div>
          </div>
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
            <h1 className="text-xl font-bold text-blue-700">การแจ้งเตือนภัยพิบัติ</h1>
          </div>

          <div className="mb-4">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => refetch()} 
              disabled={isLoading}
              className="w-full flex items-center gap-2 bg-white hover:bg-blue-50 border-blue-200 text-blue-600 hover:text-blue-700"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              รีเฟรชข้อมูล
            </Button>
          </div>
          
          <AlertFilters
            filters={filters}
            updateFilters={updateFilters}
            availableTypes={alertTypes}
            availableSeverities={severityLevels}
          />
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        <header className="bg-white shadow-sm border-b border-gray-200 p-6">
          <h2 className="text-2xl font-semibold text-gray-800">การแจ้งเตือนภัยพิบัติ</h2>
          <p className="text-gray-600 mt-2">ติดตามข้อมูลการแจ้งเตือนภัยพิบัติและสถานการณ์ฉุกเฉิน</p>
        </header>

        <div className="flex-1 p-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 h-full">
            <div className="p-6 border-b border-gray-200 bg-gray-50">
              <h3 className="font-semibold text-gray-800">รายการแจ้งเตือน</h3>
            </div>
            <div className="p-6 overflow-auto">
              <AlertsList
                alerts={alerts}
                isLoading={isLoading}
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Alerts;
