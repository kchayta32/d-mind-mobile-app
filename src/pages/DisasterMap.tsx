
import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { SidebarProvider } from '@/components/ui/sidebar';
import { useIsMobile } from '@/hooks/use-mobile';
import DisasterMapComponent from '@/components/DisasterMap';
import { DisasterMapSidebar } from '@/components/disaster-map/DisasterMapSidebar';

const DisasterMap: React.FC = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  const handleBack = () => {
    navigate('/');
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gray-50">
        <DisasterMapSidebar />
        
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <div className="bg-white shadow-sm border-b p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleBack}
                  className="flex items-center space-x-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>กลับ</span>
                </Button>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">
                    แผนที่ภัยพิบัติและสถิติ
                  </h1>
                  <p className="text-sm text-gray-600">
                    ดูข้อมูลภัยพิบัติแบบเรียลไทม์
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 p-4">
            <div className="h-full bg-white rounded-lg shadow-sm">
              <DisasterMapComponent />
            </div>
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default DisasterMap;
