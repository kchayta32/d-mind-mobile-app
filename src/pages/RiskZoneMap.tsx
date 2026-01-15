import React, { useState } from 'react';
import { ArrowLeft, Menu, Home, Phone, BookOpen, Settings, Info, FileText, Map, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/use-mobile';
import { RiskZoneMapContent } from '@/components/risk-zone-map/RiskZoneMapContent';
import DisasterMapComponent from '@/components/DisasterMap';
import { DisasterMapSidebar } from '@/components/disaster-map/DisasterMapSidebar';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const RiskZoneMap: React.FC = () => {
    const navigate = useNavigate();
    const isMobile = useIsMobile();
    const [activeTab, setActiveTab] = useState<'risk-zones' | 'realtime'>('risk-zones');

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

    // Tab Switcher Component
    const MapTabSwitcher = () => (
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'risk-zones' | 'realtime')} className="w-full">
            <TabsList className="grid w-full grid-cols-2 h-10 bg-gray-100/80 backdrop-blur-sm">
                <TabsTrigger
                    value="risk-zones"
                    className="text-xs sm:text-sm data-[state=active]:bg-white data-[state=active]:shadow-sm flex items-center gap-1.5"
                >
                    <AlertTriangle className="h-3.5 w-3.5" />
                    <span>พื้นที่เสี่ยง</span>
                </TabsTrigger>
                <TabsTrigger
                    value="realtime"
                    className="text-xs sm:text-sm data-[state=active]:bg-white data-[state=active]:shadow-sm flex items-center gap-1.5"
                >
                    <Map className="h-3.5 w-3.5" />
                    <span>ภัยต่างๆ</span>
                </TabsTrigger>
            </TabsList>
        </Tabs>
    );

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
                                <span className="text-sm font-bold text-gray-800">แผนที่</span>
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

                {/* Tab Switcher - Fixed below header */}
                <div className="absolute top-[72px] left-0 right-0 z-[40] px-4 pointer-events-auto">
                    <div className="bg-white/95 backdrop-blur-md rounded-xl shadow-lg p-1 border border-gray-100">
                        <MapTabSwitcher />
                    </div>
                </div>

                {/* Map Content */}
                <div className="flex-1 pt-[130px] relative z-0">
                    {activeTab === 'risk-zones' ? (
                        <RiskZoneMapContent />
                    ) : (
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
                    )}
                </div>
            </div>
        );
    }

    // Desktop View
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
                                        {activeTab === 'risk-zones' ? 'แผนที่พื้นที่เสี่ยงภัยพิบัติ' : 'แผนที่ภัยพิบัติและสถิติ'}
                                    </h1>
                                    <p className="text-sm text-gray-600">
                                        {activeTab === 'risk-zones' ? 'ข้อมูลพื้นที่เสี่ยงทั่วประเทศไทย' : 'ข้อมูลเวลาจริง (Real-time Data)'}
                                    </p>
                                </div>
                            </div>

                            {/* Tab Switcher for Desktop */}
                            <div className="w-[400px]">
                                <MapTabSwitcher />
                            </div>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="flex-1 relative overflow-hidden">
                        {activeTab === 'risk-zones' ? (
                            <RiskZoneMapContent />
                        ) : (
                            <DisasterMapComponent />
                        )}
                    </div>
                </div>
            </div>
        </SidebarProvider>
    );
};

export default RiskZoneMap;
