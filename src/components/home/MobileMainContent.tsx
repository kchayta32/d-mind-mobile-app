
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  MessageSquare, 
  BookOpen, 
  Phone, 
  AlertTriangle, 
  MessageCircle,
  BarChart3,
  Settings,
  Share2
} from 'lucide-react';

interface MobileMainContentProps {
  onAssistantClick: () => void;
  onManualClick: () => void;
  onContactsClick: () => void;
  onAlertsClick: () => void;
  onVictimReportsClick: () => void;
  onLineClick: () => void;
}

const MobileMainContent: React.FC<MobileMainContentProps> = ({
  onAssistantClick,
  onManualClick,
  onContactsClick,
  onAlertsClick,
  onVictimReportsClick,
  onLineClick,
}) => {
  return (
    <main className="flex-1 p-4 pb-20">
      {/* Hero Section */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 border border-blue-100">
        <div className="text-center">
          <div className="bg-gradient-to-br from-blue-100 to-purple-100 rounded-full p-4 w-20 h-20 mx-auto mb-4 flex items-center justify-center">
            <MessageSquare className="h-10 w-10 text-blue-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">
            ยินดีต้อนรับสู่ D-MIND
          </h2>
          <p className="text-gray-600 text-sm leading-relaxed">
            ระบบติดตามภัยพิบัติและแจ้งเตือนอัจฉริยะ
            พร้อมให้ความช่วยเหลือคุณตลอด 24 ชั่วโมง
          </p>
        </div>
      </div>

      {/* Quick Actions Grid */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <Card className="hover:shadow-lg transition-all duration-200 border-blue-100">
          <CardContent className="p-4">
            <Button 
              onClick={onAssistantClick}
              className="w-full h-auto flex flex-col items-center space-y-3 bg-gradient-to-br from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0 py-6"
            >
              <MessageSquare className="h-8 w-8" />
              <div className="text-center">
                <div className="font-semibold">ปรึกษา Dr.Mind</div>
                <div className="text-xs opacity-90">ผู้เชี่ยวชาญ AI</div>
              </div>
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all duration-200 border-green-100">
          <CardContent className="p-4">
            <Button 
              onClick={onManualClick}
              className="w-full h-auto flex flex-col items-center space-y-3 bg-gradient-to-br from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white border-0 py-6"
            >
              <BookOpen className="h-8 w-8" />
              <div className="text-center">
                <div className="font-semibold">คู่มือฉุกเฉิน</div>
                <div className="text-xs opacity-90">แนวทางปฏิบัติ</div>
              </div>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* New Features Grid */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <Card className="hover:shadow-lg transition-all duration-200 border-orange-100">
          <CardContent className="p-4">
            <Button 
              onClick={() => window.location.href = '/dashboard'}
              className="w-full h-auto flex flex-col items-center space-y-3 bg-gradient-to-br from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white border-0 py-6"
            >
              <BarChart3 className="h-8 w-8" />
              <div className="text-center">
                <div className="font-semibold">แดชบอร์ด</div>
                <div className="text-xs opacity-90">สถิติภัยพิบัติ</div>
              </div>
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all duration-200 border-purple-100">
          <CardContent className="p-4">
            <Button 
              onClick={() => window.location.href = '/shared-data'}
              className="w-full h-auto flex flex-col items-center space-y-3 bg-gradient-to-br from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white border-0 py-6"
            >
              <Share2 className="h-8 w-8" />
              <div className="text-center">
                <div className="font-semibold">ข้อมูลแชร์</div>
                <div className="text-xs opacity-90">แชร์ภัยพิบัติ</div>
              </div>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Secondary Actions */}
      <div className="space-y-3 mb-6">
        <Button 
          onClick={onAlertsClick}
          className="w-full bg-white hover:bg-orange-50 text-orange-700 border-2 border-orange-200 hover:border-orange-300 h-14 text-left justify-start"
        >
          <AlertTriangle className="mr-3 h-5 w-5" />
          <div>
            <div className="font-semibold">การแจ้งเตือนภัยพิบัติ</div>
            <div className="text-sm opacity-75">ข้อมูลเตือนภัยล่าสุด</div>
          </div>
        </Button>

        <Button 
          onClick={onContactsClick}
          className="w-full bg-white hover:bg-blue-50 text-blue-700 border-2 border-blue-200 hover:border-blue-300 h-14 text-left justify-start"
        >
          <Phone className="mr-3 h-5 w-5" />
          <div>
            <div className="font-semibold">เบอร์โทรฉุกเฉิน</div>
            <div className="text-sm opacity-75">หน่วยงานช่วยเหลือ</div>
          </div>
        </Button>

        <Button 
          onClick={() => window.location.href = '/settings'}
          className="w-full bg-white hover:bg-gray-50 text-gray-700 border-2 border-gray-200 hover:border-gray-300 h-14 text-left justify-start"
        >
          <Settings className="mr-3 h-5 w-5" />
          <div>
            <div className="font-semibold">การตั้งค่า</div>
            <div className="text-sm opacity-75">พื้นที่ที่สนใจ</div>
          </div>
        </Button>
      </div>

      {/* Emergency Report Button */}
      <Card className="bg-gradient-to-r from-red-500 to-red-600 text-white border-0 shadow-lg">
        <CardContent className="p-4">
          <Button 
            onClick={onVictimReportsClick}
            className="w-full bg-transparent hover:bg-white/10 text-white border-2 border-white/20 hover:border-white/40 h-16"
          >
            <MessageCircle className="mr-3 h-6 w-6" />
            <div className="text-left">
              <div className="font-bold text-lg">รายงานสถานะผู้ประสบภัย</div>
              <div className="text-sm opacity-90">แจ้งสถานการณ์ฉุกเฉิน</div>
            </div>
          </Button>
        </CardContent>
      </Card>

      {/* LINE Contact */}
      <div className="mt-6 text-center">
        <Button 
          onClick={onLineClick}
          className="bg-green-500 hover:bg-green-600 text-white px-8 py-3 rounded-full shadow-lg"
        >
          <MessageCircle className="mr-2 h-5 w-5" />
          ติดต่อผ่าน LINE
        </Button>
      </div>
    </main>
  );
};

export default MobileMainContent;
