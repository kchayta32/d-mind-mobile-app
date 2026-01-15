import React from 'react';
import {
  Phone,
  BookOpen,
  Info,
  Globe,
  MapPin,
  Bot,
  FileText,
  Cloud,
  Calendar
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useDailyDisasterStats } from '@/hooks/useDailyDisasterStats';

const MobileHome: React.FC = () => {
  const navigate = useNavigate();
  const { stats, isLoading } = useDailyDisasterStats();

  // Determine overall status based on stats
  const totalDisasters = (stats.earthquakes || 0) + (stats.floods || 0) + (stats.wildfires || 0) + (stats.landslides || 0);
  const statusColor = totalDisasters > 5 ? 'bg-red-500' : totalDisasters > 0 ? 'bg-orange-500' : 'bg-green-500';
  const statusText = totalDisasters > 5 ? 'ระวังภัยระดับสูง' : totalDisasters > 0 ? 'เฝ้าระวัง' : 'เหตุการณ์ปกติ';

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 pb-24">
      {/* Dynamic Header Background */}
      <div className="absolute top-0 left-0 right-0 h-64 bg-gradient-to-b from-blue-600 to-transparent bg-opacity-20 pointer-events-none" />

      <div className="px-4 pt-6 relative space-y-5">

        {/* Welcome & Status Section */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">สวัสดี, ผู้ใช้งาน</h1>
            <p className="text-xs text-gray-500 dark:text-gray-400">พร้อมรับมือทุกสถานการณ์</p>
          </div>
          <div className={`${statusColor} px-3 py-1.5 rounded-full text-white text-xs font-semibold shadow-md border border-white/20`}>
            {statusText}
          </div>
        </div>

        {/* Feature: AI Assistant (The Hero) */}
        <div
          onClick={() => navigate('/assistant')}
          className="w-full h-28 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-600 shadow-xl overflow-hidden relative cursor-pointer active:scale-95 transition-transform group"
        >
          <div className="absolute top-0 right-0 p-4 opacity-20 group-hover:opacity-30 transition-opacity">
            <Bot className="w-24 h-24 text-white" />
          </div>
          <div className="absolute inset-0 p-6 flex flex-col justify-center text-white">
            <div className="flex items-center gap-2 mb-1">
              <span className="bg-white/20 p-1.5 rounded-lg backdrop-blur-sm"><Bot className="w-5 h-5" /></span>
              <span className="text-xs font-medium bg-white/10 px-2 py-0.5 rounded-full">New</span>
            </div>
            <h2 className="text-xl font-bold">Dr.Mind AI</h2>
            <p className="text-indigo-100 text-xs opacity-90">ผู้ช่วยอัจฉริยะ ปรึกษาได้ตลอด 24 ชม.</p>
          </div>
        </div>

        {/* Stats Grid & Map Link */}
        <div className="grid grid-cols-2 gap-3">
          {/* Map Card */}
          <div
            onClick={() => navigate('/disaster-map')}
            className="col-span-2 bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-slate-800 flex items-center justify-between active:bg-gray-50 cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 dark:bg-blue-900 p-2.5 rounded-xl text-blue-600 dark:text-blue-300">
                <MapPin className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-gray-800 dark:text-gray-100">แผนที่ภัยพิบัติ</h3>
                <p className="text-xs text-gray-500">ติดตามสถานการณ์แบบเรียลไทม์</p>
              </div>
            </div>
            <div className="text-gray-400">
              <Globe className="w-5 h-5 animate-spin-slow" />
            </div>
          </div>

          {/* Quick Stats Widget */}
          <div className="col-span-2 bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-slate-800">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-sm">สถิติ 24 ชม. ล่าสุด</h3>
              <span className="text-[10px] text-gray-400">Last 24h</span>
            </div>
            <div className="grid grid-cols-4 gap-2 text-center">
              {[
                { label: 'แผ่นดินไหว', val: stats.earthquakes, color: 'text-yellow-600', bg: 'bg-yellow-50' },
                { label: 'น้ำท่วม', val: stats.floods, color: 'text-blue-600', bg: 'bg-blue-50' },
                { label: 'ไฟป่า', val: stats.wildfires, color: 'text-red-600', bg: 'bg-red-50' },
                { label: 'พายุ', val: '0', color: 'text-gray-600', bg: 'bg-gray-50' }
              ].map((item, idx) => (
                <div key={idx} className={`${item.bg} dark:bg-slate-800 rounded-xl p-2 flex flex-col items-center justify-center`}>
                  <span className={`text-lg font-bold ${item.color} dark:text-white`}>{isLoading ? '-' : item.val}</span>
                  <span className="text-[10px] text-gray-600 dark:text-gray-400 mt-0.5">{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Weather Forecast Link */}
        <div
          onClick={() => navigate('/weather-forecast')}
          className="bg-gradient-to-r from-sky-500 to-blue-600 rounded-2xl p-4 shadow-lg flex items-center justify-between cursor-pointer active:scale-98 transition-transform"
        >
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2.5 rounded-xl backdrop-blur-sm">
              <Cloud className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-white">พยากรณ์อากาศรายชั่วโมง</h3>
              <p className="text-xs text-sky-100">ข้อมูลจากกรมอุตุนิยมวิทยา (TMD)</p>
            </div>
          </div>
          <div className="text-white/70">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>

        {/* Daily Weather Forecast Link */}
        <div
          onClick={() => navigate('/daily-weather-forecast')}
          className="bg-gradient-to-r from-orange-500 to-amber-500 rounded-2xl p-4 shadow-lg flex items-center justify-between cursor-pointer active:scale-98 transition-transform"
        >
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2.5 rounded-xl backdrop-blur-sm">
              <Calendar className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-white">พยากรณ์อากาศ 7 วัน</h3>
              <p className="text-xs text-orange-100">อุณหภูมิสูงสุด-ต่ำสุด รายวัน</p>
            </div>
          </div>
          <div className="text-white/70">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>

        {/* Tools Grid */}
        <div>
          <h3 className="text-gray-500 font-medium text-sm mb-3 ml-1">เครื่องมือช่วยเหลือ</h3>
          <div className="grid grid-cols-2 gap-3">
            <div onClick={() => navigate('/contacts')} className="bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 flex flex-col items-center justify-center gap-2 cursor-pointer active:scale-95 transition-transform h-28">
              <div className="bg-red-100 dark:bg-red-900/30 p-2.5 rounded-full text-red-600 dark:text-red-400">
                <Phone className="w-6 h-6" />
              </div>
              <span className="text-xs font-medium text-center">เบอร์ฉุกเฉิน</span>
            </div>

            <div onClick={() => navigate('/incident-reports')} className="bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 flex flex-col items-center justify-center gap-2 cursor-pointer active:scale-95 transition-transform h-28">
              <div className="bg-orange-100 dark:bg-orange-900/30 p-2.5 rounded-full text-orange-600 dark:text-orange-400">
                <FileText className="w-6 h-6" />
              </div>
              <span className="text-xs font-medium text-center">รายงานสถานการณ์</span>
            </div>

            <div onClick={() => navigate('/manual')} className="bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 flex flex-col items-center justify-center gap-2 cursor-pointer active:scale-95 transition-transform h-28">
              <div className="bg-green-100 dark:bg-green-900/30 p-2.5 rounded-full text-green-600 dark:text-green-400">
                <BookOpen className="w-6 h-6" />
              </div>
              <span className="text-xs font-medium text-center">คู่มือ/วิจัย</span>
            </div>

            <div onClick={() => navigate('/app-guide')} className="bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 flex flex-col items-center justify-center gap-2 cursor-pointer active:scale-95 transition-transform h-28">
              <div className="bg-purple-100 dark:bg-purple-900/30 p-2.5 rounded-full text-purple-600 dark:text-purple-400">
                <Info className="w-6 h-6" />
              </div>
              <span className="text-xs font-medium text-center">เกี่ยวกับเรา</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MobileHome;
