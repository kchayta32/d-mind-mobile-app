
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Map, Users, TrendingUp, MapPin, Globe, BarChart3, Bell, Settings } from 'lucide-react';
import NavBar from '@/components/NavBar';
import MobileMainContent from './MobileMainContent';
import { useIsMobile } from '@/hooks/use-mobile';

const DesktopLayout: React.FC = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  const handleAssistantClick = () => navigate('/assistant');
  const handleManualClick = () => navigate('/manual');
  const handleContactsClick = () => navigate('/contacts');
  const handleAlertsClick = () => navigate('/alerts');
  const handleVictimReportsClick = () => navigate('/victim-reports');
  const handleIncidentReportsClick = () => navigate('/incident-reports');
  const handleAnalyticsClick = () => navigate('/analytics');
  const handleNotificationsClick = () => navigate('/notifications');
  const handleLineClick = () => {
    window.open('https://line.me/ti/p/@yourbotid', '_blank');
  };
  const handleDisasterMapClick = () => {
    navigate('/disaster-map');
  };

  if (isMobile) {
    return (
      <MobileMainContent
        onAssistantClick={handleAssistantClick}
        onManualClick={handleManualClick}
        onContactsClick={handleContactsClick}
        onAlertsClick={handleAlertsClick}
        onVictimReportsClick={handleVictimReportsClick}
        onIncidentReportsClick={handleIncidentReportsClick}
        onLineClick={handleLineClick}
        onDisasterMapClick={handleDisasterMapClick}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Left Sidebar - Navigation */}
          <div className="lg:col-span-1">
            <Card className="bg-white/80 backdrop-blur-sm shadow-xl border-0">
              <CardHeader className="pb-4">
                <div className="flex items-center space-x-3">
                  <div className="bg-gradient-to-br from-blue-600 to-blue-700 p-3 rounded-xl shadow-lg">
                    <img 
                      src="/lovable-uploads/b5550bd4-d83d-4e1e-ac09-025117b87c86.png" 
                      alt="D-MIND Logo" 
                      className="h-8 w-8"
                    />
                  </div>
                  <div>
                    <CardTitle className="text-2xl font-bold text-gray-800">D-MIND</CardTitle>
                    <p className="text-sm text-gray-600 font-medium">Disaster Monitoring System</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center space-x-2 text-green-600">
                  <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium">System Online</span>
                </div>
                
                <NavBar 
                  onAssistantClick={handleAssistantClick}
                  onManualClick={handleManualClick}
                  onContactsClick={handleContactsClick}
                  onAlertsClick={handleAlertsClick}
                />

                {/* Additional Navigation */}
                <div className="space-y-2 pt-4 border-t">
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start"
                    onClick={handleAnalyticsClick}
                  >
                    <BarChart3 className="mr-2 h-4 w-4" />
                    Dashboard Analytics
                  </Button>
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start"
                    onClick={handleNotificationsClick}
                  >
                    <Bell className="mr-2 h-4 w-4" />
                    การตั้งค่าการแจ้งเตือน
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-3 space-y-6">
            {/* Welcome Section */}
            <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-xl border-0">
              <CardContent className="p-8">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-3xl font-bold mb-2">ยินดีต้อนรับสู่ D-MIND</h1>
                    <p className="text-blue-100 text-lg">ระบบติดตามและเตือนภัยพิบัติแบบเรียลไทม์</p>
                  </div>
                  <div className="hidden md:block">
                    <Globe className="h-16 w-16 text-blue-200 animate-pulse" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="bg-white/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-shadow border-0">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">เหตุการณ์ภัยพิบัติ</p>
                      <p className="text-2xl font-bold text-gray-900">15</p>
                    </div>
                    <AlertTriangle className="h-8 w-8 text-red-500" />
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-white/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-shadow border-0">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">พื้นที่เสี่ยง</p>
                      <p className="text-2xl font-bold text-gray-900">8</p>
                    </div>
                    <MapPin className="h-8 w-8 text-orange-500" />
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-white/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-shadow border-0">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">ผู้ใช้งานออนไลน์</p>
                      <p className="text-2xl font-bold text-gray-900">1,247</p>
                    </div>
                    <Users className="h-8 w-8 text-green-500" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Main Action Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Emergency Reports */}
              <Card className="bg-white/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-shadow border-0">
                <CardHeader>
                  <CardTitle className="flex items-center text-red-700">
                    <AlertTriangle className="mr-2 h-5 w-5" />
                    บริการฉุกเฉิน
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button 
                    className="w-full bg-red-600 hover:bg-red-700 text-white"
                    onClick={handleVictimReportsClick}
                  >
                    รายงานผู้ประสบภัย
                  </Button>
                  <Button 
                    className="w-full bg-orange-600 hover:bg-orange-700 text-white"
                    onClick={handleIncidentReportsClick}
                  >
                    รายงานเหตุการณ์ภัยพิบัติ
                  </Button>
                </CardContent>
              </Card>

              {/* Analytics Dashboard */}
              <Card className="bg-white/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-shadow border-0">
                <CardHeader>
                  <CardTitle className="flex items-center text-blue-700">
                    <BarChart3 className="mr-2 h-5 w-5" />
                    Dashboard และสถิติ
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Button 
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                    onClick={handleAnalyticsClick}
                  >
                    <TrendingUp className="mr-2 h-4 w-4" />
                    ดูสถิติและแผนภูมิ
                  </Button>
                </CardContent>
              </Card>

              {/* Notifications */}
              <Card className="bg-white/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-shadow border-0">
                <CardHeader>
                  <CardTitle className="flex items-center text-green-700">
                    <Bell className="mr-2 h-5 w-5" />
                    การแจ้งเตือนอัจฉริยะ
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Button 
                    className="w-full bg-green-600 hover:bg-green-700 text-white"
                    onClick={handleNotificationsClick}
                  >
                    <Settings className="mr-2 h-4 w-4" />
                    ตั้งค่าการแจ้งเตือน
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Recent Alerts */}
            <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="mr-2 h-5 w-5 text-blue-600" />
                  การแจ้งเตือนล่าสุด
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                    <div className="flex items-center space-x-3">
                      <AlertTriangle className="h-4 w-4 text-yellow-600" />
                      <span className="text-sm font-medium">พายุฝนฟ้าคะนองบริเวณภาคเหนือ</span>
                    </div>
                    <Badge variant="outline" className="text-yellow-600">ปานกลาง</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-center space-x-3">
                      <Map className="h-4 w-4 text-blue-600" />
                      <span className="text-sm font-medium">อัพเดทข้อมูลแผนที่ภัยพิบัติ</span>
                    </div>
                    <Badge variant="outline" className="text-blue-600">ข้อมูล</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DesktopLayout;
