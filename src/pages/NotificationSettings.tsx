
import React from 'react';
import NotificationCenter from '@/components/notifications/NotificationCenter';
import NotificationHistory from '@/components/notifications/NotificationHistory';
import LocationBasedAlerts from '@/components/notifications/LocationBasedAlerts';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const NotificationSettings: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">การตั้งค่าการแจ้งเตือน</h1>
          <p className="text-gray-600">จัดการการแจ้งเตือนและการรับข่าวสารภัยพิบัติ</p>
        </div>

        <Tabs defaultValue="settings" className="space-y-6">
          <TabsList className="grid w-full lg:w-[600px] grid-cols-3">
            <TabsTrigger value="settings">ตั้งค่าทั่วไป</TabsTrigger>
            <TabsTrigger value="location">ตำแหน่งและพื้นที่</TabsTrigger>
            <TabsTrigger value="history">ประวัติการแจ้งเตือน</TabsTrigger>
          </TabsList>

          <TabsContent value="settings">
            <NotificationCenter />
          </TabsContent>

          <TabsContent value="location">
            <LocationBasedAlerts />
          </TabsContent>

          <TabsContent value="history">
            <NotificationHistory />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default NotificationSettings;
