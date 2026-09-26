import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { 
  ArrowLeft, Shield, BookOpen, Search, X, 
  Backpack, PhoneCall, ShieldAlert, Sparkles, 
  HelpCircle, AlertTriangle, Newspaper, GraduationCap
} from 'lucide-react';
import EmergencyArticles from '@/components/emergency-manual/EmergencyArticles';
import AcademicArticles from '@/components/emergency-manual/AcademicArticles';
import AdminLogin from '@/components/admin/AdminLogin';
import AdminPanel from '@/components/admin/AdminPanel';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { DisasterGuides } from '@/components/emergency-manual/DisasterGuides';
import { GoBagChecklist } from '@/components/emergency-manual/GoBagChecklist';
import { EmergencyHotlines } from '@/components/emergency-manual/EmergencyHotlines';
import { Badge } from '@/components/ui/badge';

const EmergencyManual: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'disasters' | 'gobag' | 'hotlines' | 'articles' | 'academic'>('disasters');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const { isAuthenticated, login, logout } = useAdminAuth();

  const handleBackFromLogin = () => {
    setShowAdminLogin(false);
  };

  // Show admin login if requested and not authenticated
  if (showAdminLogin && !isAuthenticated) {
    return <AdminLogin onLogin={login} onBack={handleBackFromLogin} />;
  }

  // Show admin panel if authenticated
  if (isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800 pb-24">
        <header className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white pt-6 pb-8 px-5 rounded-b-3xl shadow-xl">
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
                <Shield className="h-5 w-5" />
              </div>
              <div>
                <h1 className="text-xl font-bold">ระบบบริหารจัดการแอดมิน</h1>
                <p className="text-white/70 text-xs">Admin Management Console</p>
              </div>
            </div>
          </div>
        </header>
        <div className="px-4 pt-5 max-w-4xl mx-auto">
          <AdminPanel onLogout={logout} />
        </div>
      </div>
    );
  }

  const quickTags = [
    { label: 'น้ำท่วมฉับพลัน', query: 'น้ำท่วม' },
    { label: 'ไฟป่า & PM2.5', query: 'ไฟป่า' },
    { label: 'แผ่นดินไหว', query: 'แผ่นดินไหว' },
    { label: 'ดินถล่ม', query: 'ดินถล่ม' },
    { label: 'ภัยแล้ง', query: 'ภัยแล้ง' },
    { label: 'สายด่วน 1784', query: '1784' },
    { label: 'กระเป๋า 72 ชม.', tab: 'gobag' as const }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/40 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800 pb-28">
      {/* Modern Ultra-Polished Header with Glassmorphism */}
      <header className="relative bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white pt-5 pb-8 px-4 sm:px-6 rounded-b-[2.5rem] shadow-xl overflow-hidden">
        {/* Ambient Glow Circles */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-56 h-56 rounded-full bg-white/10 blur-2xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-10 w-40 h-40 rounded-full bg-pink-500/20 blur-xl pointer-events-none" />

        <div className="relative z-10 max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <Button
                variant="ghost"
                size="icon"
                className="text-white/90 hover:bg-white/20 rounded-2xl h-10 w-10 backdrop-blur-sm"
                onClick={() => navigate('/')}
                aria-label="ย้อนกลับหน้าหลัก"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div className="flex items-center gap-3">
                <div className="bg-white/20 p-2.5 rounded-2xl backdrop-blur-md shadow-inner border border-white/20">
                  <BookOpen className="h-5 w-5 text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white drop-shadow-sm">
                      คู่มือเอาตัวรอดจากภัยพิบัติ
                    </h1>
                    <span className="flex h-2 w-2 relative">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                  </div>
                  <p className="text-white/80 text-xs font-medium">
                    เตรียมพร้อม รู้ทัน รอดชีวิตในทุกสถานการณ์วิกฤต
                  </p>
                </div>
              </div>
            </div>

            <Button
              variant="ghost"
              size="icon"
              className="text-white/80 hover:bg-white/20 hover:text-white rounded-2xl h-10 w-10 backdrop-blur-sm"
              onClick={() => setShowAdminLogin(true)}
              title="เข้าสู่ระบบผู้ดูแล"
            >
              <Shield className="h-4 w-4" />
            </Button>
          </div>

          {/* Quick Instant Search Bar */}
          <div className="relative mt-2">
            <div className="relative flex items-center">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/70" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ค้นหาวิธีเอาตัวรอด, เบอร์โทรฉุกเฉิน, เช็กลิสต์ของจำเป็น..."
                className="w-full pl-10 pr-9 py-2.5 bg-white/15 dark:bg-slate-900/40 border border-white/25 dark:border-white/10 rounded-2xl text-xs sm:text-sm text-white placeholder-white/70 backdrop-blur-md focus:outline-none focus:ring-2 focus:ring-white/50 focus:bg-white/20 transition-all shadow-inner"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/70 hover:text-white p-1 rounded-full"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Quick Tag Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto mt-2.5 pb-1 scrollbar-none">
              <span className="text-[11px] text-white/70 flex-shrink-0 font-medium">ค้นหาด่วน:</span>
              {quickTags.map((tag, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    if (tag.tab) {
                      setActiveTab(tag.tab);
                    } else if (tag.query) {
                      setSearchQuery(tag.query);
                    }
                  }}
                  className="text-[11px] px-2.5 py-0.5 rounded-full bg-white/15 hover:bg-white/25 text-white/90 whitespace-nowrap transition-colors border border-white/15 backdrop-blur-sm"
                >
                  {tag.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </header>

      {/* Main Tab Navigation Pills */}
      <div className="px-4 sm:px-6 -mt-4 max-w-4xl mx-auto">
        <div className="bg-white/90 dark:bg-slate-800/90 rounded-2xl shadow-xl p-1.5 flex gap-1 border border-slate-200/80 dark:border-slate-700/80 backdrop-blur-md overflow-x-auto scrollbar-none">
          {[
            { id: 'disasters' as const, label: 'คู่มือ 5 ภัย', icon: <ShieldAlert className="w-4 h-4" /> },
            { id: 'gobag' as const, label: 'กระเป๋า 72 ชม.', icon: <Backpack className="w-4 h-4" /> },
            { id: 'hotlines' as const, label: 'สายด่วนฉุกเฉิน', icon: <PhoneCall className="w-4 h-4" /> },
            { id: 'articles' as const, label: 'เตือนภัย', icon: <Newspaper className="w-4 h-4" /> },
            { id: 'academic' as const, label: 'วิชาการ', icon: <GraduationCap className="w-4 h-4" /> }
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 min-w-[76px] py-2 px-2.5 rounded-xl text-xs font-bold transition-all duration-300 flex items-center justify-center gap-1.5 whitespace-nowrap ${
                  isActive
                    ? 'bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-500/25 scale-[1.01]'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/60'
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Content Container */}
      <main className="px-4 sm:px-6 pt-5 max-w-4xl mx-auto">
        {/* Active Tab: Disaster Guides */}
        {activeTab === 'disasters' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <span>แนวทางเอาชีวิตรอด 5 ภัยพิบัติหลัก</span>
                  <Badge variant="outline" className="text-[10px] bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                    มาตรฐาน ปภ.
                  </Badge>
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  คู่มือเชิงปฏิบัติการฉุกเฉิน แนะนำสิ่งที่ต้องทำทันทีเมื่อเกิดเหตุ
                </p>
              </div>
            </div>

            <DisasterGuides searchQuery={searchQuery} />
          </div>
        )}

        {/* Active Tab: 72h Survival Go-Bag */}
        {activeTab === 'gobag' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <span>เช็กลิสต์กระเป๋าฉุกเฉิน 72 ชั่วโมง (Go-Bag)</span>
                  <Badge className="text-[10px] bg-emerald-600 text-white">
                    บันทึกอัตโนมัติ
                  </Badge>
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  ติ๊กสิ่งที่จัดเตรียมแล้วเพื่อวัดระดับความพร้อมในการรับมือภัยพิบัติ
                </p>
              </div>
            </div>

            <GoBagChecklist searchQuery={searchQuery} />
          </div>
        )}

        {/* Active Tab: Emergency Hotlines */}
        {activeTab === 'hotlines' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <span>รวมเบอร์โทรสายด่วนภัยพิบัติแห่งชาติ</span>
                  <Badge variant="outline" className="text-[10px] bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300">
                    กดโทรได้ทันที
                  </Badge>
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  โทรฟรี 24 ชั่วโมง พร้อมระบบคัดลอกหมายเลขอย่างรวดเร็ว
                </p>
              </div>
            </div>

            <EmergencyHotlines searchQuery={searchQuery} />
          </div>
        )}

        {/* Active Tab: Articles & Academic (Preserved) */}
        {activeTab === 'articles' && (
          <div className="space-y-4">
            <div className="bg-white/80 dark:bg-slate-800/80 p-4 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm backdrop-blur-md mb-2">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-1">
                บทความเตือนภัยและสถานการณ์ล่าสุด
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                ข้อมูลการวิเคราะห์และข้อแนะนำจากหน่วยงานผู้เชี่ยวชาญด้านภัยธรรมชาติ
              </p>
            </div>
            <EmergencyArticles />
          </div>
        )}

        {activeTab === 'academic' && (
          <div className="space-y-4">
            <div className="bg-white/80 dark:bg-slate-800/80 p-4 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm backdrop-blur-md mb-2">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-1">
                คลังบทความวิชาการและการวิจัย
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                เอกสารทางวิชาการ แบบจำลองภัยพิบัติ และรายงานเชิงลึก
              </p>
            </div>
            <AcademicArticles />
          </div>
        )}
      </main>
    </div>
  );
};

export default EmergencyManual;
