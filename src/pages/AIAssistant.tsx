
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import EnhancedChatBot from '@/components/chat/EnhancedChatBot';
import AppLogo from '@/components/AppLogo';

const AIAssistant = () => {
  const navigate = useNavigate();

  const handleGoBack = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 flex flex-col">
      {/* Header - Compact for mobile */}
      <header className="bg-white shadow-md border-b border-blue-100 sticky top-0 z-50">
        <div className="px-3 py-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleGoBack}
                className="p-1.5 hover:bg-blue-50 h-8 w-8"
              >
                <ArrowLeft className="h-4 w-4 text-blue-600" />
              </Button>
              <div className="flex items-center gap-2">
                <AppLogo />
                <div>
                  <h1 className="text-sm font-bold text-gray-800 leading-tight">Dr.Mind - ผู้เชี่ยวชาญฉุกเฉิน</h1>
                  <p className="text-[10px] text-gray-500">ภัยธรรมชาติ & แพทย์ฉุกเฉิน</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <div className="h-1.5 w-1.5 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-[10px] text-gray-600">ออนไลน์</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content - Full height */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <EnhancedChatBot className="flex-1 border-0 shadow-none rounded-none" />
      </main>
    </div>
  );
};

export default AIAssistant;
