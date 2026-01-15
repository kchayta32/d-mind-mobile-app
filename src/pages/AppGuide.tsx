import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Info, Map, Bot, Phone, BookOpen, Bell, MessageSquare, Lightbulb, HelpCircle } from 'lucide-react';

const AppGuide: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');

  const features = [
    { icon: <Map className="w-5 h-5" />, title: 'แผนที่ภัยพิบัติ', desc: 'แสดงตำแหน่งแผ่นดินไหว เซ็นเซอร์ฝน และภัยต่างๆ แบบเรียลไทม์', color: 'bg-green-500' },
    { icon: <Bot className="w-5 h-5" />, title: 'Dr.Mind AI', desc: 'ปรึกษาผู้เชี่ยวชาญด้านภัยธรรมชาติและแพทย์ฉุกเฉิน', color: 'bg-purple-500' },
    { icon: <BookOpen className="w-5 h-5" />, title: 'คู่มือและบทความ', desc: 'แนวทางปฏิบัติและบทความเตือนภัยล่าสุด', color: 'bg-blue-500' },
    { icon: <Phone className="w-5 h-5" />, title: 'หมายเลขฉุกเฉิน', desc: 'เข้าถึงหมายเลขโทรศัพท์ฉุกเฉินได้อย่างรวดเร็ว', color: 'bg-red-500' },
    { icon: <Bell className="w-5 h-5" />, title: 'การแจ้งเตือนภัย', desc: 'รับการแจ้งเตือนภัยแบบเรียลไทม์พร้อมรายละเอียด', color: 'bg-orange-500' },
    { icon: <MessageSquare className="w-5 h-5" />, title: 'รายงานผู้ประสบภัย', desc: 'รายงานสถานการณ์และขอความช่วยเหลือ', color: 'bg-pink-500' }
  ];

  const tips = [
    { emoji: '💡', title: 'การใช้งานแผนที่', desc: 'ใช้นิ้วหุบและขยายเพื่อซูม แตะที่จุดต่างๆ เพื่อดูรายละเอียด', color: 'border-yellow-400 bg-yellow-50' },
    { emoji: '✅', title: 'การสื่อสารกับ AI', desc: 'พิมพ์คำถามแบบชัดเจน เช่น "ควรทำอย่างไรเมื่อเกิดแผ่นดินไหว"', color: 'border-green-400 bg-green-50' },
    { emoji: '📱', title: 'การแจ้งเตือน', desc: 'เปิดการแจ้งเตือนในเบราว์เซอร์เพื่อรับข่าวสารทันที', color: 'border-blue-400 bg-blue-50' },
    { emoji: '🚨', title: 'ในกรณีฉุกเฉิน', desc: 'หากสถานการณ์รุนแรง โทร 191 หรือ 1669 ทันที', color: 'border-red-400 bg-red-50' }
  ];

  const faqs = [
    { q: 'แอพใช้ข้อมูลจากแหล่งใด?', a: 'ใช้ข้อมูลจากกรมอุตุนิยมวิทยา และหน่วยงานราชการที่เกี่ยวข้อง' },
    { q: 'ใช้งานแอพได้โดยไม่ต้องสมัครสมาชิกหรือไม่?', a: 'ได้ครับ สามารถใช้งานฟีเจอร์ทั้งหมดได้ทันที' },
    { q: 'AI จะตอบคำถามได้ทุกเรื่องหรือไม่?', a: 'AI เชี่ยวชาญด้านภัยธรรมชาติและการแพทย์ฉุกเฉินเป็นหลัก' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800 pb-24">
      {/* Modern Header */}
      <header className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white pt-6 pb-8 px-5 rounded-b-3xl shadow-xl">
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
              <Info className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold">คู่มือการใช้งาน</h1>
              <p className="text-white/70 text-xs">D-MIND Application Guide</p>
            </div>
          </div>
        </div>
      </header>

      {/* Tab Pills */}
      <div className="px-4 -mt-4">
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-1.5 flex gap-1">
          {[
            { id: 'overview', label: 'ภาพรวม' },
            { id: 'features', label: 'ฟีเจอร์' },
            { id: 'tips', label: 'เคล็ดลับ' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-medium transition-all ${activeTab === tab.id
                  ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-md'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700'
                }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="px-4 pt-5 space-y-4">
        {activeTab === 'overview' && (
          <>
            {/* Welcome Card */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="bg-indigo-100 dark:bg-indigo-900/30 p-2 rounded-xl">
                  <Info className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                </div>
                <h2 className="font-bold text-gray-900 dark:text-white">ยินดีต้อนรับสู่ D-MIND</h2>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                ระบบติดตามภัยพิบัติและแจ้งเตือนอัจฉริยะ ช่วยให้คุณติดตามสถานการณ์ภัยธรรมชาติและได้รับความช่วยเหลือเมื่อเกิดเหตุฉุกเฉิน
              </p>
              <div className="bg-indigo-50 dark:bg-indigo-900/20 p-3 rounded-xl">
                <h3 className="font-semibold text-sm text-indigo-700 dark:text-indigo-400 mb-2">จุดประสงค์หลัก:</h3>
                <ul className="text-xs text-gray-700 dark:text-gray-300 space-y-1">
                  <li>• ติดตามภัยพิบัติแบบเรียลไทม์</li>
                  <li>• แจ้งเตือนภัยล่วงหน้า</li>
                  <li>• ให้คำแนะนำจากผู้เชี่ยวชาญ AI</li>
                  <li>• เข้าถึงข้อมูลฉุกเฉินได้รวดเร็ว</li>
                </ul>
              </div>
            </div>

            {/* Getting Started */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 p-4">
              <h3 className="font-bold text-gray-900 dark:text-white mb-3">วิธีเริ่มต้นใช้งาน</h3>
              <div className="space-y-3">
                {['เปิดแอพและดูการแจ้งเตือนภัย', 'ตรวจสอบแผนที่ภัยพิบัติ', 'ใช้ AI Assistant เพื่อขอคำปรึกษา', 'บันทึกหมายเลขฉุกเฉิน'].map((step, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="bg-indigo-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold">{i + 1}</div>
                    <p className="text-sm text-gray-700 dark:text-gray-300">{step}</p>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {activeTab === 'features' && (
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 p-4 space-y-3">
            {features.map((feature, i) => (
              <div key={i} className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-slate-700/50 rounded-xl">
                <div className={`${feature.color} p-2 rounded-xl text-white`}>
                  {feature.icon}
                </div>
                <div>
                  <h3 className="font-semibold text-sm text-gray-900 dark:text-white">{feature.title}</h3>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'tips' && (
          <>
            {/* Tips */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 p-4 space-y-3">
              <div className="flex items-center gap-2 mb-2">
                <Lightbulb className="w-5 h-5 text-yellow-500" />
                <h3 className="font-bold text-gray-900 dark:text-white">เคล็ดลับการใช้งาน</h3>
              </div>
              {tips.map((tip, i) => (
                <div key={i} className={`p-3 rounded-xl border-l-4 ${tip.color} dark:bg-slate-700/50`}>
                  <h4 className="font-medium text-sm text-gray-800 dark:text-white">{tip.emoji} {tip.title}</h4>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">{tip.desc}</p>
                </div>
              ))}
            </div>

            {/* FAQ */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 p-4">
              <div className="flex items-center gap-2 mb-3">
                <HelpCircle className="w-5 h-5 text-indigo-500" />
                <h3 className="font-bold text-gray-900 dark:text-white">คำถามที่พบบ่อย</h3>
              </div>
              <div className="space-y-3">
                {faqs.map((faq, i) => (
                  <div key={i}>
                    <h4 className="font-medium text-sm text-gray-800 dark:text-white">Q: {faq.q}</h4>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">A: {faq.a}</p>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AppGuide;

