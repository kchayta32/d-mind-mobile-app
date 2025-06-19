
import React from 'react';
import { AlertTriangle, Map, Shield, MessageSquare, HeartHandshake, FileText, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface MobileMainContentProps {
  onAssistantClick: () => void;
  onManualClick: () => void;
  onContactsClick: () => void;
  onAlertsClick: () => void;
  onVictimReportsClick: () => void;
  onIncidentReportsClick: () => void;
  onLineClick: () => void;
}

const MobileMainContent: React.FC<MobileMainContentProps> = ({
  onAssistantClick,
  onManualClick,
  onContactsClick,
  onAlertsClick,
  onVictimReportsClick,
  onIncidentReportsClick,
  onLineClick
}) => {
  return (
    <main className="container mx-auto p-4 space-y-6 max-w-7xl">
      {/* Quick Actions Grid */}
      <div className="grid grid-cols-2 gap-4">
        <Button 
          className="h-16 bg-red-600 hover:bg-red-700 text-white flex-col gap-1 shadow-lg"
          onClick={onAssistantClick}
        >
          <MessageSquare className="h-6 w-6" />
          <span className="text-sm font-medium">Dr.Mind AI</span>
        </Button>
        
        <Button 
          className="h-16 bg-blue-600 hover:bg-blue-700 text-white flex-col gap-1 shadow-lg"
          onClick={onAlertsClick}
        >
          <AlertTriangle className="h-6 w-6" />
          <span className="text-sm font-medium">แจ้งเตือนภัย</span>
        </Button>
      </div>

      {/* Emergency Services */}
      <Card className="bg-gradient-to-r from-red-50 to-orange-50 border-red-200">
        <CardContent className="p-4">
          <h2 className="text-lg font-bold text-red-700 mb-3 flex items-center">
            <Shield className="mr-2 h-5 w-5" />
            บริการฉุกเฉิน
          </h2>
          <div className="grid grid-cols-2 gap-3">
            <Button 
              variant="outline" 
              className="h-14 flex-col gap-1 border-red-200 text-red-700 hover:bg-red-50"
              onClick={onVictimReportsClick}
            >
              <HeartHandshake className="h-5 w-5" />
              <span className="text-xs">รายงานผู้ประสบภัย</span>
            </Button>
            
            <Button 
              variant="outline" 
              className="h-14 flex-col gap-1 border-red-200 text-red-700 hover:bg-red-50"
              onClick={onIncidentReportsClick}
            >
              <FileText className="h-5 w-5" />
              <span className="text-xs">รายงานเหตุการณ์</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Information Services */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
        <CardContent className="p-4">
          <h2 className="text-lg font-bold text-blue-700 mb-3 flex items-center">
            <Map className="mr-2 h-5 w-5" />
            ข้อมูลและคู่มือ
          </h2>
          <div className="grid grid-cols-2 gap-3">
            <Button 
              variant="outline" 
              className="h-14 flex-col gap-1 border-blue-200 text-blue-700 hover:bg-blue-50"
              onClick={onManualClick}
            >
              <FileText className="h-5 w-5" />
              <span className="text-xs">คู่มือฉุกเฉิน</span>
            </Button>
            
            <Button 
              variant="outline" 
              className="h-14 flex-col gap-1 border-blue-200 text-blue-700 hover:bg-blue-50"
              onClick={onContactsClick}
            >
              <MessageSquare className="h-5 w-5" />
              <span className="text-xs">เบอร์ฉุกเฉิน</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* LINE Contact */}
      <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
        <CardContent className="p-4">
          <h2 className="text-lg font-bold text-green-700 mb-3 flex items-center">
            <MessageCircle className="mr-2 h-5 w-5" />
            ติดต่อด่วน
          </h2>
          <Button 
            className="w-full h-12 bg-green-500 hover:bg-green-600 text-white"
            onClick={onLineClick}
          >
            <MessageCircle className="mr-2 h-5 w-5" />
            แชทกับเจ้าหน้าที่ผ่าน LINE
          </Button>
        </CardContent>
      </Card>
    </main>
  );
};

export default MobileMainContent;
