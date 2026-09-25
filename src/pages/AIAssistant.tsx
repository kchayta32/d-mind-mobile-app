import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, PhoneCall, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import EnhancedChatBot from '@/components/chat/EnhancedChatBot';

const AIAssistant: React.FC = () => {
  const navigate = useNavigate();

  const handleGoBack = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header - Modern AI Doctor branding with pulse status and quick emergency trigger */}
      <header className="bg-white/95 backdrop-blur-md shadow-xs border-b border-slate-200/80 sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-3 sm:px-4 py-2 sm:py-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 sm:gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleGoBack}
                className="p-1.5 hover:bg-blue-50 text-blue-600 rounded-full h-8 w-8 sm:h-9 sm:w-9 transition-colors flex-shrink-0"
                title="ย้อนกลับไปหน้าหลัก"
              >
                <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
              </Button>

              <div className="flex items-center gap-2.5">
                <div className="relative">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-blue-500 flex items-center justify-center text-white shadow-sm ring-2 ring-blue-100">
                    <span className="text-xl select-none">👨‍⚕️</span>
                  </div>
                  <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full">
                    <span className="absolute inset-0 rounded-full bg-emerald-400 animate-ping opacity-75"></span>
                  </span>
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h1 className="text-sm sm:text-base font-bold text-gray-900 leading-tight">
                      Dr.Mind - ผู้เชี่ยวชาญฉุกเฉิน
                    </h1>
                    <span className="inline-flex items-center gap-0.5 bg-blue-50 text-blue-700 text-[10px] font-semibold px-1.5 py-0.5 rounded-full border border-blue-200">
                      <Sparkles className="w-2.5 h-2.5 text-blue-500" /> AI
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] text-gray-500">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                    <span>ออนไลน์ 24 ชม. • พร้อมวิเคราะห์เหตุฉุกเฉิน</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Emergency 1669 Button */}
            <div className="flex items-center gap-2">
              <a
                href="tel:1669"
                className="inline-flex items-center gap-1.5 bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-sm hover:shadow transition-all active:scale-95"
                title="โทร 1669 สายด่วนการแพทย์ฉุกเฉินทันที"
              >
                <PhoneCall className="w-3.5 h-3.5 animate-bounce" />
                <span>โทร 1669</span>
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content - Full height */}
      <main className="flex-1 flex flex-col overflow-hidden max-w-5xl w-full mx-auto">
        <EnhancedChatBot className="flex-1 border-0 shadow-none rounded-none" />
      </main>
    </div>
  );
};

export default AIAssistant;
