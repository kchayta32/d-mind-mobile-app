import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Users, List, Plus } from 'lucide-react';
import VictimReportForm from '@/components/victim-reports/VictimReportForm';
import VictimReportsList from '@/components/victim-reports/VictimReportsList';
import { useIsMobile } from '@/hooks/use-mobile';

const VictimReports: React.FC = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [activeTab, setActiveTab] = useState('report');

  if (isMobile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800 pb-24">
        {/* Modern Header */}
        <header className="bg-gradient-to-r from-blue-500 via-cyan-500 to-teal-500 text-white pt-6 pb-8 px-5 rounded-b-3xl shadow-xl">
          <div className="flex items-center gap-3 mb-2">
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
                <Users className="h-5 w-5" />
              </div>
              <div>
                <h1 className="text-xl font-bold">รายงานผู้ประสบภัย</h1>
                <p className="text-white/70 text-xs">แจ้งและติดตามสถานะ</p>
              </div>
            </div>
          </div>
        </header>

        {/* Tab Pills */}
        <div className="px-4 -mt-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-1.5 flex gap-1">
            <button
              onClick={() => setActiveTab('report')}
              className={`flex-1 py-3 px-4 rounded-xl text-sm font-medium flex items-center justify-center gap-2 transition-all ${activeTab === 'report'
                  ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-md'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700'
                }`}
            >
              <Plus className="h-4 w-4" />
              รายงานใหม่
            </button>
            <button
              onClick={() => setActiveTab('view')}
              className={`flex-1 py-3 px-4 rounded-xl text-sm font-medium flex items-center justify-center gap-2 transition-all ${activeTab === 'view'
                  ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-md'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700'
                }`}
            >
              <List className="h-4 w-4" />
              รายงานทั้งหมด
            </button>
          </div>
        </div>

        {/* Content */}
        <main className="px-4 pt-5">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 p-4">
            {activeTab === 'report' ? <VictimReportForm /> : <VictimReportsList />}
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
