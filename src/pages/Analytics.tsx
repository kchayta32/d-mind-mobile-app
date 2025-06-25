
import React from 'react';
import { useAnalytics } from '@/hooks/useAnalytics';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, BarChart3, PieChart, TrendingUp } from 'lucide-react';
import DashboardChart from '@/components/analytics/DashboardChart';
import MetricsOverview from '@/components/analytics/MetricsOverview';

const Analytics: React.FC = () => {
  const { processedData, activeAlerts, incidentReports, disasterStats, isLoading } = useAnalytics();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">กำลังโหลดข้อมูลสถิติ...</p>
        </div>
      </div>
    );
  }

  // Transform data for charts
  const disasterTypeData = Object.entries(processedData.disasterTypes).map(([name, value]) => ({
    name: name,
    value: value as number
  }));

  const severityData = Object.entries(processedData.severityDistribution).map(([name, value]) => ({
    name: name,
    value: value as number
  }));

  const monthlyData = Object.entries(processedData.monthlyTrends).map(([name, value]) => ({
    name: name,
    value: value as number
  }));

  const provinceData = Object.entries(processedData.provinceStats)
    .sort(([,a], [,b]) => (b as number) - (a as number))
    .slice(0, 10)
    .map(([name, value]) => ({
      name: name,
      value: value as number
    }));

  const statusData = Object.entries(processedData.incidentStatus).map(([name, value]) => ({
    name: name === 'pending' ? 'รอดำเนินการ' : 
          name === 'in_progress' ? 'กำลังดำเนินการ' : 
          name === 'resolved' ? 'แก้ไขแล้ว' : name,
    value: value as number
  }));

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard Analytics</h1>
          <p className="text-gray-600">ภาพรวมและสถิติระบบติดตามภัยพิบัติ</p>
        </div>

        {/* Metrics Overview */}
        <div className="mb-8">
          <MetricsOverview 
            activeAlerts={activeAlerts}
            incidentReports={incidentReports}
            disasterStats={disasterStats}
          />
        </div>

        {/* Charts Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full lg:w-[600px] grid-cols-4">
            <TabsTrigger value="overview">ภาพรวม</TabsTrigger>
            <TabsTrigger value="disasters">ภัยพิบัติ</TabsTrigger>
            <TabsTrigger value="incidents">เหตุการณ์</TabsTrigger>
            <TabsTrigger value="geography">พื้นที่</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <DashboardChart
                title="การแจ้งเตือนตามระดับความรุนแรง"
                description="จำนวนการแจ้งเตือนที่ใช้งานอยู่แยกตามระดับ"
                data={severityData}
                type="pie"
              />
              <DashboardChart
                title="แนวโน้มรายเดือน"
                description="จำนวนเหตุการณ์ภัยพิบัติรายเดือน"
                data={monthlyData}
                type="line"
              />
            </div>
          </TabsContent>

          <TabsContent value="disasters" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <DashboardChart
                title="ประเภทภัยพิบัติ"
                description="การแบ่งตามประเภทของภัยพิบัติ"
                data={disasterTypeData}
                type="bar"
              />
              <DashboardChart
                title="การกระจายตามระดับความรุนแรง"
                description="สัดส่วนของภัยพิบัติตามระดับความรุนแรง"
                data={severityData}
                type="pie"
              />
            </div>
          </TabsContent>

          <TabsContent value="incidents" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <DashboardChart
                title="สถานะการรายงานเหตุการณ์"
                description="การแบ่งตามสถานะของรายงานเหตุการณ์"
                data={statusData}
                type="pie"
              />
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <TrendingUp className="mr-2 h-5 w-5 text-green-600" />
                    สถิติการรายงาน
                  </CardTitle>
                  <CardDescription>
                    ข้อมูลการรายงานเหตุการณ์ในระบบ
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                      <span className="font-medium">รายงานทั้งหมด</span>
                      <span className="text-2xl font-bold text-blue-600">{incidentReports.length}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                      <span className="font-medium">ได้รับการยืนยัน</span>
                      <span className="text-2xl font-bold text-green-600">
                        {incidentReports.filter(r => r.is_verified).length}
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg">
                      <span className="font-medium">อยู่ระหว่างดำเนินการ</span>
                      <span className="text-2xl font-bold text-orange-600">
                        {incidentReports.filter(r => r.status === 'pending').length}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="geography" className="space-y-6">
            <DashboardChart
              title="จังหวัดที่มีเหตุการณ์มากที่สุด (10 อันดับ)"
              description="จำนวนเหตุการณ์ภัยพิบัติแยกตามจังหวัด"
              data={provinceData}
              type="bar"
              height={400}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Analytics;
