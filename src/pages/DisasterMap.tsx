
import React from 'react';
import { ArrowLeft, Menu, Home, Phone, BookOpen, Settings, Info, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/use-mobile';
import DisasterMapComponent from '@/components/DisasterMap';
import { DisasterMapSidebar } from '@/components/disaster-map/DisasterMapSidebar';
import MobileUsageTip from '@/components/disaster-map/MobileUsageTip';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { SidebarProvider } from "@/components/ui/sidebar";

const DisasterMap: React.FC = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  const handleBack = () => {
    navigate('/');
  };

  const navItems = [
    { icon: <Home className="w-5 h-5" />, label: 'หน้าแรก', route: '/' },
    { icon: <Phone className="w-5 h-5" />, label: 'เบอร์ฉุกเฉิน', route: '/contacts' },
    { icon: <FileText className="w-5 h-5" />, label: 'รายงานเหตุการณ์', route: '/incident-reports' },
    { icon: <BookOpen className="w-5 h-5" />, label: 'คู่มือเตรียมพร้อม', route: '/manual' },
    { icon: <Settings className="w-5 h-5" />, label: 'ตั้งค่าการแจ้งเตือน', route: '/notifications' },
    { icon: <Info className="w-5 h-5" />, label: 'เกี่ยวกับแอพ', route: '/app-guide' },
  ];

  if (isMobile) {
    return (
      <div className="flex flex-col h-[100dvh] w-full bg-gray-50 overflow-hidden relative">
        {/* Floating Custom Header for Mobile */}
        <div className="absolute top-0 left-0 right-0 z-[50] p-4 pointer-events-none">
          <div className="flex items-center justify-between pointer-events-auto">
            {/* Back Button & Logo */}
            <div className="bg-white/90 backdrop-blur-md rounded-full shadow-lg p-1.5 pr-4 flex items-center gap-2 border border-gray-100">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-full hover:bg-gray-100"
                onClick={handleBack}
              >
                <ArrowLeft className="h-5 w-5 text-gray-700" />
              </Button>
              <div className="flex items-center gap-2">
                <img
                  src="/lovable-uploads/b5550bd4-d83d-4e1e-ac09-025117b87c86.png"
                  alt="Logo"
                  className="h-6 w-6"
                />
                <span className="text-sm font-bold text-gray-800">แผนที่ภัยพิบัติ</span>
              </div>
            </div>

            {/* Burger Menu */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="secondary" size="icon" className="h-11 w-11 rounded-full shadow-lg bg-white/90 backdrop-blur-md border border-gray-100">
                  <Menu className="h-6 w-6 text-gray-700" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[540px]">
                <SheetHeader className="mb-6 text-left">
                  <div className="flex items-center gap-3">
                    <img
                      src="/lovable-uploads/b5550bd4-d83d-4e1e-ac09-025117b87c86.png"
                      alt="Logo"
                      className="h-10 w-10"
                    />
                    <div>
                      <SheetTitle>เมนูหลัก</SheetTitle>
                      <p className="text-xs text-muted-foreground">D-MIND Disaster Monitor</p>
                    </div>
                  </div>
                </SheetHeader>
                <div className="flex flex-col gap-2">
                  {navItems.map((item) => (
                    <Button
                      key={item.route}
                      variant="ghost"
                      className="justify-start h-12 text-base font-normal"
                      onClick={() => navigate(item.route)}
                    >
                      <span className="mr-3 text-muted-foreground">{item.icon}</span>
                      {item.label}
                    </Button>
                  ))}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>

        {/* Map Content (Full Screen) */}
        <div className="flex-1 relative z-0">
          <React.Suspense fallback={
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                <p className="text-sm text-gray-500">กำลังโหลดแผนที่...</p>
              </div>
            </div>
          }>
            <DisasterMapComponent />
          </React.Suspense>
        </div>

        {/* Mobile Usage Tip Overlay - Optional if needed, but might clutter map */}
        {/* <div className="absolute top-20 left-1/2 transform -translate-x-1/2 z-40 pointer-events-none opacity-80">
           <MobileUsageTip /> 
        </div> */}
      </div>
    );
  }

  // Desktop View (Unchanged most parts, just ensure layout)
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gray-50">
        <DisasterMapSidebar />

        <div className="flex-1 flex flex-col h-screen">
          {/* Header */}
          <div className="bg-white shadow-sm border-b p-4 flex-none z-10">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleBack}
                  className="flex items-center space-x-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>กลับหน้าหลัก</span>
                </Button>
                <div className="h-6 w-px bg-gray-200" />
                <div>
                  <h1 className="text-xl font-bold text-gray-900">
                    แผนที่ภัยพิบัติและสถิติ
                  </h1>
                  <p className="text-sm text-gray-600">
                    ข้อมูลเวลาจริง (Real-time Data)
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 relative overflow-hidden">
            <DisasterMapComponent />
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default DisasterMap;
