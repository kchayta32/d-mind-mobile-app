import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import NotificationCenter from '@/components/notifications/NotificationCenter';
import NotificationHistory from '@/components/notifications/NotificationHistory';
import LocationBasedAlerts from '@/components/notifications/LocationBasedAlerts';
import { PermissionManager } from '@/components/permissions/PermissionManager';
import OfflineMapManager from '@/components/disaster-map/OfflineMapManager';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Bell, MapPin, History, Shield, HardDrive } from 'lucide-react';

const NotificationSettings: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('permissions');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-orange-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800 pb-24">
      {/* Modern Header */}
      <header className="bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 text-white pt-6 pb-8 px-5 rounded-b-3xl shadow-xl">
        <div className="flex items-center gap-3 mb-2">
          <Button
            variant="ghost"
            size="icon"
            className="text-white/90 hover:bg-white/20 rounded-xl"
            onClick={() => navigate('/')}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2 rounded-xl backdrop-blur-sm">
              <Bell className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold">การตั้งค่าการแจ้งเตือน</h1>
              <p className="text-white/70 text-xs">จัดการการรับข่าวสารภัยพิบัติ</p>
            </div>
          </div>
        </div>
      </header>

      {/* Tab Pills - Horizontal Scrollable */}
      <div className="px-4 -mt-4">
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-1.5 overflow-x-auto scrollbar-hide">
          <div className="flex gap-1 min-w-max">
            {[
              { id: 'permissions', label: 'สิทธิ์', icon: <Shield className="w-3.5 h-3.5" /> },
              { id: 'settings', label: 'ตั้งค่า', icon: <Bell className="w-3.5 h-3.5" /> },
              { id: 'location', label: 'ตำแหน่ง', icon: <MapPin className="w-3.5 h-3.5" /> },
              { id: 'history', label: 'ประวัติ', icon: <History className="w-3.5 h-3.5" /> },
              { id: 'storage', label: 'ออฟไลน์', icon: <HardDrive className="w-3.5 h-3.5" /> }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2.5 px-4 rounded-xl text-xs font-medium transition-all flex items-center justify-center gap-1.5 whitespace-nowrap ${activeTab === tab.id
                  ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-md'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700'
                  }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 pt-5">
        {activeTab === 'permissions' && <PermissionManager showOnlyIfNeeded={false} />}
        {activeTab === 'settings' && <NotificationCenter />}
        {activeTab === 'location' && <LocationBasedAlerts />}
        {activeTab === 'history' && <NotificationHistory />}
        {activeTab === 'storage' && <OfflineMapManager />}
      </div>
    </div>
  );
};

export default NotificationSettings;

