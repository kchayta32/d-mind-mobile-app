
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useDisasterAlerts } from '@/components/disaster-alerts/useDisasterAlerts';
import AlertFilters from '@/components/disaster-alerts/AlertFilters';
import AlertsList from '@/components/disaster-alerts/AlertsList';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RefreshCw, ArrowLeft, Map, Expand, Plus, Minus } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { useEarthquakeData } from '@/components/disaster-map/useEarthquakeData';

const Alerts: React.FC = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { 
    alerts, 
    isLoading, 
    filters, 
    updateFilters, 
    refetch, 
    alertTypes, 
    severityLevels 
  } = useDisasterAlerts();

  const { earthquakes, statistics } = useEarthquakeData();

  // Filter earthquakes from last 24 hours
  const last24HoursEarthquakes = earthquakes.filter(eq => {
    const earthquakeTime = new Date(eq.time);
    const now = new Date();
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    return earthquakeTime >= twentyFourHoursAgo;
  });

  if (isMobile) {
    // Mobile layout
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
        {/* Header */}
        <header className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4 shadow-lg">
          <div className="container mx-auto max-w-7xl flex items-center">
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-white mr-3 hover:bg-blue-400/30 rounded-full" 
              onClick={() => navigate('/')}
            >
              <ArrowLeft className="h-6 w-6" />
            </Button>
            <div className="flex items-center">
              <img 
                src="/lovable-uploads/b5550bd4-d83d-4e1e-ac09-025117b87c86.png" 
                alt="D-MIND Logo" 
                className="h-8 w-8 mr-3"
              />
              <h1 className="text-xl font-bold">การแจ้งเตือนภัยพิบัติทั้งหมด</h1>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="container mx-auto p-4 max-w-7xl">
          {/* 24 Hour Earthquake Section */}
          <Card className="mb-6 border-orange-200 bg-white shadow-lg">
            <CardHeader className="bg-gradient-to-r from-orange-50 to-orange-100 border-b border-orange-200">
              <CardTitle className="text-lg text-orange-800 flex items-center gap-2">
                <Map className="h-5 w-5" />
                แผ่นดินไหวในช่วง 24 ชม.ที่ผ่านมา
                <span className="text-sm font-normal text-orange-600">
                  (กรมอุตุนิยมวิทยา)
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                <div className="text-center p-3 bg-orange-50 rounded-lg">
                  <div className="text-2xl font-bold text-orange-600">{statistics.last24Hours}</div>
                  <div className="text-sm text-orange-700">ครั้ง</div>
                </div>
                <div className="text-center p-3 bg-red-50 rounded-lg">
                  <div className="text-2xl font-bold text-red-600">{statistics.maxMagnitude}</div>
                  <div className="text-sm text-red-700">แมกนิจูดสูงสุด</div>
                </div>
                <div className="text-center p-3 bg-yellow-50 rounded-lg">
                  <div className="text-2xl font-bold text-yellow-600">{statistics.averageMagnitude}</div>
                  <div className="text-sm text-yellow-700">แมกนิจูดเฉลี่ย</div>
                </div>
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{statistics.averageDepth}</div>
                  <div className="text-sm text-blue-700">ความลึกเฉลี่ย (กม.)</div>
                </div>
              </div>
              
              {/* Map Placeholder */}
              <div className="relative h-64 bg-gray-100 rounded-lg border border-gray-200 overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-blue-100 to-blue-200">
                  <div className="text-center">
                    <Map className="h-12 w-12 text-blue-500 mx-auto mb-2" />
                    <p className="text-blue-700 font-medium">แผนที่แผ่นดินไหว 24 ชม.</p>
                    <p className="text-blue-600 text-sm">({last24HoursEarthquakes.length} จุด)</p>
                  </div>
                </div>
                
                {/* Map Controls */}
                <div className="absolute top-3 right-3 flex flex-col gap-2">
                  <Button size="sm" variant="outline" className="bg-white">
                    <Expand className="h-4 w-4" />
                  </Button>
                </div>
                <div className="absolute bottom-3 right-3 flex flex-col gap-1">
                  <Button size="sm" variant="outline" className="bg-white">
                    <Plus className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="outline" className="bg-white">
                    <Minus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Filters Sidebar */}
            <div className="lg:col-span-1">
              <div className="mb-4 flex justify-end lg:justify-start">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => refetch()} 
                  disabled={isLoading}
                  className="flex items-center gap-2 bg-white hover:bg-blue-50 border-blue-200 text-blue-600 hover:text-blue-700"
                >
                  <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                  รีเฟรช
                </Button>
              </div>
              
              <AlertFilters
                filters={filters}
                updateFilters={updateFilters}
                availableTypes={alertTypes}
                availableSeverities={severityLevels}
              />
            </div>
            
            {/* Alerts List */}
            <div className="lg:col-span-3">
              <AlertsList
                alerts={alerts}
                isLoading={isLoading}
              />
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Desktop layout
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex">
      {/* Sidebar */}
      <aside className="w-80 bg-white shadow-xl border-r border-blue-100">
        <div className="p-6">
          <Button 
            variant="ghost" 
            className="mb-4 text-blue-600 hover:bg-blue-50"
            onClick={() => navigate('/')}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            กลับหน้าหลัก
          </Button>
          
          <div className="flex items-center mb-6">
            <img 
              src="/lovable-uploads/b5550bd4-d83d-4e1e-ac09-025117b87c86.png" 
              alt="D-MIND Logo" 
              className="h-8 w-8 mr-3"
            />
            <h1 className="text-xl font-bold text-blue-700">การแจ้งเตือนภัยพิบัติ</h1>
          </div>

          <div className="mb-4">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => refetch()} 
              disabled={isLoading}
              className="w-full flex items-center gap-2 bg-white hover:bg-blue-50 border-blue-200 text-blue-600 hover:text-blue-700"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              รีเฟรชข้อมูล
            </Button>
          </div>
          
          <AlertFilters
            filters={filters}
            updateFilters={updateFilters}
            availableTypes={alertTypes}
            availableSeverities={severityLevels}
          />
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        <header className="bg-white shadow-sm border-b border-gray-200 p-6">
          <h2 className="text-2xl font-semibold text-gray-800">การแจ้งเตือนภัยพิบัติ</h2>
          <p className="text-gray-600 mt-2">ติดตามข้อมูลการแจ้งเตือนภัยพิบัติและสถานการณ์ฉุกเฉิน</p>
        </header>

        <div className="flex-1 p-6 space-y-6">
          {/* 24 Hour Earthquake Section */}
          <Card className="border-orange-200 bg-white shadow-sm">
            <CardHeader className="bg-gradient-to-r from-orange-50 to-orange-100 border-b border-orange-200">
              <CardTitle className="text-xl text-orange-800 flex items-center gap-2">
                <Map className="h-6 w-6" />
                แผ่นดินไหวในช่วง 24 ชม.ที่ผ่านมา
                <span className="text-sm font-normal text-orange-600">
                  (กรมอุตุนิยมวิทยา)
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-4 gap-6 mb-6">
                <div className="text-center p-4 bg-orange-50 rounded-lg border border-orange-100">
                  <div className="text-3xl font-bold text-orange-600">{statistics.last24Hours}</div>
                  <div className="text-sm text-orange-700 mt-1">จำนวนครั้ง</div>
                </div>
                <div className="text-center p-4 bg-red-50 rounded-lg border border-red-100">
                  <div className="text-3xl font-bold text-red-600">{statistics.maxMagnitude}</div>
                  <div className="text-sm text-red-700 mt-1">แมกนิจูดสูงสุด</div>
                </div>
                <div className="text-center p-4 bg-yellow-50 rounded-lg border border-yellow-100">
                  <div className="text-3xl font-bold text-yellow-600">{statistics.averageMagnitude}</div>
                  <div className="text-sm text-yellow-700 mt-1">แมกนิจูดเฉลี่ย</div>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-100">
                  <div className="text-3xl font-bold text-blue-600">{statistics.averageDepth}</div>
                  <div className="text-sm text-blue-700 mt-1">ความลึกเฉลี่ย (กม.)</div>
                </div>
              </div>
              
              {/* Map Placeholder */}
              <div className="relative h-80 bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-blue-100 to-blue-200">
                  <div className="text-center">
                    <Map className="h-16 w-16 text-blue-500 mx-auto mb-3" />
                    <p className="text-blue-700 font-medium text-lg">แผนที่แผ่นดินไหว 24 ชม.</p>
                    <p className="text-blue-600">แสดงตำแหน่ง {last24HoursEarthquakes.length} จุด</p>
                  </div>
                </div>
                
                {/* Map Controls */}
                <div className="absolute top-4 right-4 flex flex-col gap-2">
                  <Button size="sm" variant="outline" className="bg-white shadow-sm">
                    <Expand className="h-4 w-4" />
                  </Button>
                </div>
                <div className="absolute bottom-4 right-4 flex flex-col gap-1">
                  <Button size="sm" variant="outline" className="bg-white shadow-sm">
                    <Plus className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="outline" className="bg-white shadow-sm">
                    <Minus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Alerts List Section */}
          <Card className="bg-white shadow-sm border border-gray-200">
            <CardHeader className="border-b border-gray-200 bg-gray-50">
              <CardTitle className="font-semibold text-gray-800">รายการแจ้งเตือนทั้งหมด</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <AlertsList
                alerts={alerts}
                isLoading={isLoading}
              />
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Alerts;
