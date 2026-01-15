
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useDisasterAlerts } from '@/components/disaster-alerts/useDisasterAlerts';
import AlertFilters from '@/components/disaster-alerts/AlertFilters';
import AlertsList from '@/components/disaster-alerts/AlertsList';
import { Button } from '@/components/ui/button';
import { RefreshCw, ArrowLeft, Bell } from 'lucide-react';
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
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-yellow-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800 pb-24">
        {/* Modern Header */}
        <header className="bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 text-white pt-6 pb-8 px-5 rounded-b-3xl shadow-xl">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                className="text-white/90 hover:bg-white/20 rounded-xl"
                onClick={() => navigate('/')}
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div className="flex items-center gap-3">
                <div className="bg-white/20 p-2 rounded-xl backdrop-blur-sm">
                  <Bell className="h-5 w-5" />
                </div>
                <div>
                  <h1 className="text-xl font-bold">การแจ้งเตือนภัย</h1>
                  <p className="text-white/70 text-xs">รับข่าวสารสถานการณ์</p>
                </div>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="text-white/90 hover:bg-white/20 rounded-xl"
              onClick={() => refetch()}
              disabled={isLoading}
            >
              <RefreshCw className={`h-5 w-5 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </header>

        {/* Filters */}
        <div className="px-4 -mt-4 mb-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-3">
            <AlertFilters
              filters={filters}
              updateFilters={updateFilters}
              availableTypes={alertTypes}
              availableSeverities={severityLevels}
            />
          </div>
        </div>

        {/* Alerts List */}
        <main className="px-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 p-4">
            <AlertsList
              alerts={alerts}
              isLoading={isLoading}
            />
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
