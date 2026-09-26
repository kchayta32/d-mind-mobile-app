import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import NotificationCenter from '@/components/notifications/NotificationCenter';
import NotificationHistory from '@/components/notifications/NotificationHistory';
import LocationBasedAlerts from '@/components/notifications/LocationBasedAlerts';
import { PermissionManager } from '@/components/permissions/PermissionManager';
import NativeReliabilityPanel from '@/components/permissions/NativeReliabilityPanel';
import OfflineMapManager from '@/components/disaster-map/OfflineMapManager';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  ArrowLeft,
  Bell,
  MapPin,
  History,
  Shield,
  HardDrive,
  Zap,
  Sparkles,
  Smartphone,
  ShieldAlert
} from 'lucide-react';

const NotificationSettings: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'location' | 'permissions' | 'settings' | 'history' | 'storage'>('location');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-orange-50/20 to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800 pb-28">
      {/* Modern /ui-ux-pro-max Hero Header */}
      <header className="relative bg-gradient-to-r from-orange-600 via-red-600 to-pink-600 text-white pt-6 pb-10 px-5 rounded-b-[2.5rem] shadow-2xl overflow-hidden">
        {/* Ambient background blur elements */}
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-8 -left-8 w-40 h-40 bg-orange-400/20 rounded-full blur-xl pointer-events-none" />

        <div className="relative z-10 flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="text-white/90 hover:bg-white/20 rounded-2xl h-10 w-10 backdrop-blur-sm transition-transform active:scale-95"
              onClick={() => navigate('/')}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-2.5 rounded-2xl backdrop-blur-md shadow-inner border border-white/20">
                <Bell className="h-5 w-5 text-white animate-pulse" />
              </div>
              <div>
                <h1 className="text-xl font-extrabold tracking-tight flex items-center gap-2">
                  การตั้งค่าการแจ้งเตือน
                  <Badge className="bg-white/20 text-white border-0 text-[10px] px-2 py-0.5 rounded-full font-medium">
                    Native Push
                  </Badge>
                </h1>
                <p className="text-white/80 text-xs font-light">
                  แถบสถานะ Android &bull; ตรวจจับพิกัดภัยพิบัติจริง
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Live Status Pill Strip */}
        <div className="relative z-10 flex items-center gap-2 pt-1 overflow-x-auto scrollbar-hide text-[11px]">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/15 backdrop-blur-md rounded-full text-white/90 border border-white/15 whitespace-nowrap">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
            Android Status Bar: พร้อมส่ง
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/15 backdrop-blur-md rounded-full text-white/90 border border-white/15 whitespace-nowrap">
            <ShieldAlert className="w-3.5 h-3.5 text-amber-300" />
            3 ระดับ: Critical &bull; Warning &bull; Info
          </span>
        </div>
      </header>

      {/* Tab Navigation - Elegant Floating Segmented Bar */}
      <div className="px-4 -mt-5 relative z-20">
        <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl rounded-2xl shadow-xl border border-slate-200/80 dark:border-slate-800 p-1.5 overflow-x-auto scrollbar-hide">
          <div className="flex gap-1.5 min-w-max">
            {[
              {
                id: 'location',
                label: 'ตำแหน่ง & ทดสอบ',
                icon: <MapPin className="w-3.5 h-3.5" />,
                badge: 'Hot'
              },
              {
                id: 'permissions',
                label: 'สิทธิ์ระบบ',
                icon: <Shield className="w-3.5 h-3.5" />
              },
              {
                id: 'settings',
                label: 'ตั้งค่าทั่วไป',
                icon: <Bell className="w-3.5 h-3.5" />
              },
              {
                id: 'history',
                label: 'ประวัติแจ้งเตือน',
                icon: <History className="w-3.5 h-3.5" />
              },
              {
                id: 'storage',
                label: 'ออฟไลน์',
                icon: <HardDrive className="w-3.5 h-3.5" />
              }
            ].map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`py-2 px-3.5 rounded-xl text-xs font-semibold transition-all duration-200 flex items-center justify-center gap-1.5 whitespace-nowrap active:scale-95 ${
                    isActive
                      ? 'bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 text-white shadow-md shadow-orange-500/25 scale-[1.02]'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60'
                  }`}
                >
                  {tab.icon}
                  <span>{tab.label}</span>
                  {tab.badge && !isActive && (
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Tab Panels with Smooth Flow */}
      <main className="px-4 pt-5 max-w-4xl mx-auto transition-opacity duration-300">
        {activeTab === 'location' && (
          <div className="animate-in fade-in-50 duration-300">
            <LocationBasedAlerts />
          </div>
        )}

        {activeTab === 'permissions' && (
          <div className="space-y-5 animate-in fade-in-50 duration-300">
            <PermissionManager showOnlyIfNeeded={false} />
            <NativeReliabilityPanel />
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="animate-in fade-in-50 duration-300">
            <NotificationCenter />
          </div>
        )}

        {activeTab === 'history' && (
          <div className="animate-in fade-in-50 duration-300">
            <NotificationHistory />
          </div>
        )}

        {activeTab === 'storage' && (
          <div className="animate-in fade-in-50 duration-300">
            <OfflineMapManager />
          </div>
        )}
      </main>
    </div>
  );
};

export default NotificationSettings;
