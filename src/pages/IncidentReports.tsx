import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, List, AlertTriangle, Radio } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import IncidentReportForm from '@/components/incident-reports/IncidentReportForm';
import IncidentReportsList from '@/components/incident-reports/IncidentReportsList';
import LiveIncidentFeed from '@/components/incident-reports/LiveIncidentFeed';
import { useIsMobile } from '@/hooks/use-mobile';

const IncidentReports: React.FC = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [activeTab, setActiveTab] = useState('list');

  if (isMobile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-orange-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800 pb-24">
        {/* Modern Header */}
        <header className="bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 text-white pt-6 pb-8 px-5 rounded-b-3xl shadow-xl">
          <div className="flex items-center gap-3 mb-4">
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
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div>
                <h1 className="text-xl font-bold">รายงานสถานการณ์</h1>
                <p className="text-white/70 text-xs">แจ้งเหตุและติดตามสถานะ</p>
              </div>
            </div>
          </div>
        </header>

        {/* Tab Pills */}
        <div className="px-4 -mt-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-1.5 flex gap-1">
            <button
              onClick={() => setActiveTab('list')}
              className={`flex-1 py-3 px-4 rounded-xl text-sm font-medium flex items-center justify-center gap-2 transition-all ${activeTab === 'list'
                ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-md'
                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700'
                }`}
            >
              <List className="h-4 w-4" />
              รายการแจ้ง
            </button>
            <button
              onClick={() => setActiveTab('report')}
              className={`flex-1 py-3 px-4 rounded-xl text-sm font-medium flex items-center justify-center gap-2 transition-all ${activeTab === 'report'
                ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-md'
                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700'
                }`}
            >
              <Plus className="h-4 w-4" />
              แจ้งเหตุ
            </button>
            <button
              onClick={() => setActiveTab('live')}
              className={`flex-1 py-3 px-4 rounded-xl text-sm font-medium flex items-center justify-center gap-2 transition-all ${activeTab === 'live'
                ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-md'
                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700'
                }`}
            >
              <Radio className="h-4 w-4" />
              Live
            </button>
          </div>
        </div>

        {/* Content */}
        <main className="px-4 pt-5">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 p-4">
            {activeTab === 'list' ? (
              <IncidentReportsList />
            ) : activeTab === 'live' ? (
              <LiveIncidentFeed />
            ) : (
              <IncidentReportForm />
            )}
          </div>
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
