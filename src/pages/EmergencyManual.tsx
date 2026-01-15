import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Shield, BookOpen, Droplets, Mountain, Flame, AlertTriangle } from 'lucide-react';
import EmergencyArticles from '@/components/emergency-manual/EmergencyArticles';
import AcademicArticles from '@/components/emergency-manual/AcademicArticles';
import AdminLogin from '@/components/admin/AdminLogin';
import AdminPanel from '@/components/admin/AdminPanel';
import { useAdminAuth } from '@/hooks/useAdminAuth';

const EmergencyManual: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('guidelines');
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
        <header className="bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 text-white pt-6 pb-8 px-5 rounded-b-3xl shadow-xl">
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
              <h1 className="text-xl font-bold">ระบบแอดมิน</h1>
            </div>
          </div>
        </header>
        <div className="px-4 pt-5">
          <AdminPanel onLogout={logout} />
        </div>
      </div>
    );
  }

  const guidelines = [
    {
      title: "ความปลอดภัยจากน้ำท่วม",
      icon: <Droplets className="w-5 h-5" />,
      color: "bg-blue-500",
      items: [
        "เคลื่อนย้ายไปยังพื้นที่สูงทันทีเมื่อเกิดน้ำท่วม",
        "อย่าเดิน ว่ายน้ำ หรือขับรถผ่านน้ำท่วม",
        "หลีกเลี่ยงสะพานที่มีน้ำไหลเชี่ยว",
        "อพยพเมื่อได้รับคำสั่ง",
        "กลับบ้านเมื่อเจ้าหน้าที่ยืนยันว่าปลอดภัย"
      ]
    },
    {
      title: "การรับมือแผ่นดินไหว",
      icon: <Mountain className="w-5 h-5" />,
      color: "bg-orange-500",
      items: [
        "ลง ก้ม กอด ระหว่างที่เกิดการสั่นสะเทือน",
        "หากอยู่ในอาคาร ห่างจากหน้าต่างและผนังด้านนอก",
        "หากอยู่กลางแจ้ง ไปยังพื้นที่เปิดห่างจากอาคาร",
        "หลังหยุดสั่น ตรวจสอบการบาดเจ็บและความเสียหาย",
        "เตรียมพร้อมสำหรับอาฟเตอร์ช็อก"
      ]
    },
    {
      title: "ความปลอดภัยจากไฟไหม้",
      icon: <Flame className="w-5 h-5" />,
      color: "bg-red-500",
      items: [
        "อพยพทันทีเมื่อได้กลิ่นควันหรือเห็นไฟไหม้",
        "ใช้หลังมือตรวจสอบความร้อนก่อนเปิดประตู",
        "อยู่ในท่าต่ำเพื่อหลีกเลี่ยงการสูดควัน",
        "เมื่อออกมาแล้ว โทรขอความช่วยเหลือ",
        "หากติดอยู่ ใช้ผ้าเปียกอุดช่องว่างประตู"
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800 pb-24">
      {/* Modern Header */}
      <header className="bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 text-white pt-6 pb-8 px-5 rounded-b-3xl shadow-xl">
        <div className="flex items-center justify-between">
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
                <BookOpen className="h-5 w-5" />
              </div>
              <div>
                <h1 className="text-xl font-bold">คู่มือและบทความ</h1>
                <p className="text-white/70 text-xs">รู้ก่อน ปลอดภัยกว่า</p>
              </div>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="text-white/90 hover:bg-white/20 rounded-xl"
            onClick={() => setShowAdminLogin(true)}
          >
            <Shield className="h-5 w-5" />
          </Button>
        </div>
      </header>

      {/* Tab Pills */}
      <div className="px-4 -mt-4">
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-1.5 flex gap-1">
          {[
            { id: 'guidelines', label: 'แนวทาง' },
            { id: 'articles', label: 'เตือนภัย' },
            { id: 'academic', label: 'วิชาการ' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-medium transition-all ${activeTab === tab.id
                  ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-md'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700'
                }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="px-4 pt-5">
        {activeTab === 'guidelines' && (
          <div className="space-y-4">
            {guidelines.map((guide, idx) => (
              <div key={idx} className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className={`${guide.color} p-2 rounded-xl text-white`}>
                    {guide.icon}
                  </div>
                  <h2 className="font-bold text-gray-900 dark:text-white">{guide.title}</h2>
                </div>
                <ul className="space-y-2">
                  {guide.items.map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-300">
                      <AlertTriangle className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'articles' && <EmergencyArticles />}
        {activeTab === 'academic' && <AcademicArticles />}
      </div>
    </div>
  );
};

export default EmergencyManual;

