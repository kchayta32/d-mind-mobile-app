import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useGeolocation } from '@/hooks/useGeolocation';
import { useEnhancedNotifications } from '@/hooks/useEnhancedNotifications';
import { useGISTDAData } from '@/components/disaster-map/useGISTDAData';
import { useGISTDAFloodData } from '@/components/disaster-map/hooks/useGISTDAFloodData';
import { useDroughtData } from '@/components/disaster-map/hooks/useDroughtData';
import {
  sendTestDisasterNotification,
  runDisasterProximityScan,
  getDisasterEngineSettings,
  saveDisasterEngineSettings,
  DisasterEngineSettings,
  DisasterTriggeredAlert,
} from '@/services/disasterNotificationEngine';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import {
  MapPin,
  RefreshCw,
  AlertCircle,
  Settings,
  Mail,
  Send,
  Lock,
  Check,
  X,
  Flame,
  Waves,
  Sun,
  CloudRain,
  Activity,
  BellRing,
  Volume2,
  Vibrate,
  ShieldCheck,
  Smartphone,
  Radio,
  Zap,
} from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';

const RADIUS_PRESETS = [
  { value: 5, label: '5 กม.', desc: 'ระยะประชิด (เร่งด่วนสูงสุด)' },
  { value: 10, label: '10 กม.', desc: 'ระยะใกล้ (เฝ้าระวังมวลน้ำ/ไฟ)' },
  { value: 25, label: '25 กม.', desc: 'ระดับตำบล/อำเภอ (แนะนำ)' },
  { value: 50, label: '50 กม.', desc: 'ระดับจังหวัด (ครอบคลุมกว้าง)' },
];

const LocationBasedAlerts: React.FC = () => {
  const { coordinates, error, loading, refreshLocation, openAppSettings, permissionStatus } = useGeolocation();
  const { preferences, updatePreferences } = useEnhancedNotifications();
  const { toast } = useToast();

  // Engine settings state
  const [engineSettings, setEngineSettings] = useState<DisasterEngineSettings>(getDisasterEngineSettings);
  const [isTestingNotification, setIsTestingNotification] = useState<'critical' | 'warning' | 'info' | null>(null);
  const [lastTestResult, setLastTestResult] = useState<{ id: number; channel: string; timestamp: string } | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanResults, setScanResults] = useState<DisasterTriggeredAlert[] | null>(null);

  // Real-time disaster data sources for live proximity scan
  const { hotspots } = useGISTDAData('1day' as any);
  const { data: floodData } = useGISTDAFloodData('1day' as any);
  const { stats: droughtStats } = useDroughtData();

  // Local state for email input
  const [emailAddress, setEmailAddress] = useState('');
  const [isEmailValid, setIsEmailValid] = useState(false);
  const [isSendingTestEmail, setIsSendingTestEmail] = useState(false);

  // Load saved email from localStorage
  useEffect(() => {
    const savedEmail = localStorage.getItem('dmind-notification-email');
    if (savedEmail) {
      setEmailAddress(savedEmail);
      setIsEmailValid(validateEmail(savedEmail));
    }
  }, []);

  // Update engine settings and synchronize
  const updateEngineConfig = (partial: Partial<DisasterEngineSettings>) => {
    const updated = { ...engineSettings, ...partial };
    setEngineSettings(updated);
    saveDisasterEngineSettings(updated);
    if (partial.radiusKm !== undefined) {
      updatePreferences({ radius_km: partial.radiusKm });
    }
  };

  const toggleCategory = (cat: 'wildfire' | 'flood' | 'drought') => {
    const updated = {
      ...engineSettings,
      categories: {
        ...engineSettings.categories,
        [cat]: !engineSettings.categories[cat],
      },
    };
    setEngineSettings(updated);
    saveDisasterEngineSettings(updated);
  };

  // Validate email
  const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  // Handle email change
  const handleEmailChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const email = e.target.value;
    setEmailAddress(email);
    const valid = validateEmail(email);
    setIsEmailValid(valid);

    if (valid) {
      localStorage.setItem('dmind-notification-email', email);

      try {
        const { error } = await supabase
          .from('user_notification_settings')
          .upsert(
            {
              email: email,
              enabled: preferences.email,
              latitude: coordinates.lat,
              longitude: coordinates.lng,
              updated_at: new Date().toISOString(),
            },
            { onConflict: 'email' }
          );

        if (error) console.error('Error syncing email to server:', error);
      } catch (err) {
        console.error('Failed to sync settings:', err);
      }
    }
  };

  // Send test email via Supabase Edge Function
  const sendTestEmail = async () => {
    if (!isEmailValid) {
      toast({
        title: 'อีเมลไม่ถูกต้อง',
        description: 'กรุณากรอกอีเมลที่ถูกต้อง',
        variant: 'destructive',
      });
      return;
    }

    setIsSendingTestEmail(true);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-notification-email`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({
            to: emailAddress,
            type: 'test',
          }),
        }
      );

      const result = await response.json();

      if (result.success) {
        toast({
          title: 'ส่งอีเมลทดสอบสำเร็จ',
          description: `ส่งไปยัง ${emailAddress} แล้ว กรุณาตรวจสอบกล่องจดหมาย`,
        });
      } else {
        throw new Error(result.error || 'Failed to send email');
      }
    } catch (error) {
      console.error('Error sending test email:', error);
      toast({
        title: 'ส่งอีเมลไม่สำเร็จ',
        description: error instanceof Error ? error.message : 'กรุณาลองใหม่อีกครั้ง',
        variant: 'destructive',
      });
    } finally {
      setIsSendingTestEmail(false);
    }
  };

  // Handler for Native Test Push Notification
  const handleTestNativePush = async (level: 'critical' | 'warning' | 'info') => {
    setIsTestingNotification(level);
    try {
      const result = await sendTestDisasterNotification(level);
      if (result.success) {
        const timeStr = new Date().toLocaleTimeString('th-TH');
        setLastTestResult({
          id: result.notificationId,
          channel: result.channelId,
          timestamp: timeStr,
        });

        toast({
          title: '⚡ ส่งการแจ้งเตือนไปยังแถบสถานะแล้ว',
          description: `รหัส #${result.notificationId} ผ่านช่อง [${result.channelId}] ตรวจสอบที่แถบแจ้งเตือนด้านบน`,
        });
      } else {
        toast({
          title: 'ไม่สามารถส่งการแจ้งเตือนได้',
          description: result.error || 'กรุณาตรวจสอบสิทธิ์การแจ้งเตือน',
          variant: 'destructive',
        });
      }
    } catch (err: any) {
      toast({
        title: 'เกิดข้อผิดพลาดในการทดสอบ',
        description: err?.message || String(err),
        variant: 'destructive',
      });
    } finally {
      setIsTestingNotification(null);
    }
  };

  // Handler for Live Proximity Scan
  const handleLiveProximityScan = async () => {
    if (!coordinates || (coordinates.lat === 0 && coordinates.lng === 0)) {
      toast({
        title: 'ไม่พบตำแหน่ง GPS',
        description: 'กรุณากดระบุตำแหน่งปัจจุบันก่อนทำการสแกน',
        variant: 'destructive',
      });
      return;
    }

    setIsScanning(true);
    setScanResults(null);

    try {
      const results = await runDisasterProximityScan(
        coordinates.lat,
        coordinates.lng,
        {
          hotspots: hotspots || [],
          floodFeatures: floodData?.features || [],
          droughtProvinces: droughtStats?.provinces || [],
        },
        engineSettings
      );

      setScanResults(results);

      if (results.length > 0) {
        toast({
          title: `🚨 ตรวจพบภัยพิบัติ ${results.length} รายการในรัศมี!`,
          description: 'ระบบได้ส่งสัญญาณแจ้งเตือนไปยังแถบสถานะของคุณเรียบร้อยแล้ว',
          variant: 'destructive',
        });
      } else {
        toast({
          title: '✨ ปลอดภัย ไม่พบภัยพิบัติใกล้ตัว',
          description: `ไม่พบจุดความร้อนหรือพื้นที่น้ำท่วมในรัศมี ${engineSettings.radiusKm} กม.`,
        });
      }
    } catch (err: any) {
      toast({
        title: 'เกิดข้อผิดพลาดในการสแกน',
        description: err?.message || String(err),
        variant: 'destructive',
      });
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Proximity Shield & Location Status Card */}
      <Card className="border border-orange-200/60 dark:border-orange-900/40 bg-gradient-to-br from-white via-orange-50/30 to-amber-50/40 dark:from-slate-900 dark:via-slate-800/80 dark:to-slate-900 shadow-xl rounded-2xl overflow-hidden backdrop-blur-sm">
        <CardHeader className="pb-3 border-b border-orange-100/60 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-gradient-to-tr from-orange-500 to-red-500 text-white rounded-xl shadow-md shadow-orange-500/20">
                <Radio className="h-5 w-5 animate-pulse" />
              </div>
              <div>
                <CardTitle className="text-base font-bold text-slate-900 dark:text-slate-100">
                  ระบบเรดาร์และตำแหน่งเฝ้าระวัง
                </CardTitle>
                <CardDescription className="text-xs text-slate-500 dark:text-slate-400">
                  ตรวจจับเงื่อนไขเชิงพิกัด (Proximity Alert) จากดาวเทียมจริง
                </CardDescription>
              </div>
            </div>
            <Badge
              variant="outline"
              className="bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border-emerald-200 text-xs px-2.5 py-0.5"
            >
              <ShieldCheck className="h-3.5 w-3.5 mr-1" />
              เรดาร์พร้อมทำงาน
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="pt-4 space-y-4">
          {/* GPS Location Details */}
          {loading ? (
            <div className="flex items-center justify-center gap-2.5 p-4 bg-orange-50/50 dark:bg-slate-800/60 rounded-xl border border-orange-100 dark:border-slate-700 text-sm text-slate-600 dark:text-slate-300">
              <RefreshCw className="h-4 w-4 animate-spin text-orange-500" />
              กำลังเชื่อมต่อสัญญาณดาวเทียม GPS...
            </div>
          ) : error ? (
            <Alert className="bg-red-50/80 dark:bg-red-950/40 border-red-200 dark:border-red-800/60 rounded-xl">
              <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
              <AlertDescription className="text-xs text-red-700 dark:text-red-300 space-y-2">
                <p>{error}</p>
                <div className="flex gap-2 pt-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={refreshLocation}
                    className="h-7 text-xs border-red-200 hover:bg-red-100 dark:border-red-800"
                  >
                    <RefreshCw className="h-3 w-3 mr-1" />
                    ลองระบุพิกัดใหม่
                  </Button>
                  {permissionStatus === 'denied' && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={openAppSettings}
                      className="h-7 text-xs hover:bg-red-100 text-red-700 dark:text-red-300"
                    >
                      <Settings className="h-3 w-3 mr-1" />
                      เปิดตั้งค่าเครื่อง
                    </Button>
                  )}
                </div>
              </AlertDescription>
            </Alert>
          ) : coordinates && (coordinates.lat !== 0 || coordinates.lng !== 0) ? (
            <div className="flex items-center justify-between p-3.5 bg-white/80 dark:bg-slate-800/70 rounded-xl border border-slate-200/80 dark:border-slate-700 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="bg-orange-100 dark:bg-orange-950/60 p-2.5 rounded-xl text-orange-600 dark:text-orange-400">
                  <MapPin className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                    พิกัดปัจจุบันของคุณ
                    <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5">
                    ละติจูด {coordinates.lat.toFixed(4)}, ลองจิจูด {coordinates.lng.toFixed(4)}
                  </div>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={refreshLocation}
                disabled={loading}
                className="h-8 w-8 rounded-full hover:bg-orange-100 text-orange-600 dark:hover:bg-slate-700"
                title="อัปเดตพิกัด"
              >
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          ) : (
            <Button
              onClick={refreshLocation}
              className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white rounded-xl shadow-md"
            >
              <MapPin className="h-4 w-4 mr-2" />
              กดระบุตำแหน่ง GPS ปัจจุบัน
            </Button>
          )}

          {/* Quick Scan Action */}
          <div className="flex items-center justify-between pt-1">
            <span className="text-xs text-slate-500 dark:text-slate-400">
              สแกนจุดเสี่ยงรอบตัว: {engineSettings.radiusKm} กม.
            </span>
            <Button
              size="sm"
              variant="outline"
              disabled={isScanning || !coordinates}
              onClick={handleLiveProximityScan}
              className="h-8 text-xs font-medium border-orange-300 dark:border-orange-800 text-orange-700 dark:text-orange-400 hover:bg-orange-100/60 dark:hover:bg-orange-950/40 rounded-xl"
            >
              {isScanning ? (
                <>
                  <RefreshCw className="h-3 w-3 mr-1.5 animate-spin" />
                  กำลังสแกนภัยพิบัติ...
                </>
              ) : (
                <>
                  <Zap className="h-3 w-3 mr-1.5 text-amber-500" />
                  สแกนตรวจจับภัยเดี๋ยวนี้
                </>
              )}
            </Button>
          </div>

          {/* Scan result banner if present */}
          {scanResults && scanResults.length > 0 && (
            <div className="p-3 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900 rounded-xl space-y-1.5">
              <div className="text-xs font-bold text-red-700 dark:text-red-300 flex items-center gap-1.5">
                <AlertCircle className="h-3.5 w-3.5" />
                พบภัยพิบัติใกล้ตัวคุณ {scanResults.length} รายการ:
              </div>
              {scanResults.map((item, idx) => (
                <div key={idx} className="text-xs text-red-600 dark:text-red-400 pl-4 border-l-2 border-red-400">
                  {item.title} - {item.distanceKm === 0 ? 'อยู่ในพื้นที่' : `ห่าง ${item.distanceKm.toFixed(1)} กม.`}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* 2. Instant Push Notification Tester (Requested Feature) */}
      <Card className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl rounded-2xl overflow-hidden">
        <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-gradient-to-tr from-blue-600 to-indigo-600 text-white rounded-xl shadow-md shadow-blue-500/20">
                <Smartphone className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-base font-bold text-slate-900 dark:text-slate-100">
                  ทดสอบส่งการแจ้งเตือนทันที (Test Push Notification)
                </CardTitle>
                <CardDescription className="text-xs text-slate-500 dark:text-slate-400">
                  ทดสอบส่ง Native Notification ไปยังแถบสถานะ (Notification Shade) ของ Android ทันที
                </CardDescription>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-4 space-y-4">
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            กดปุ่มด้านล่างเพื่อทดสอบการทำงานของ Capacitor LocalNotifications โดยระบบจะสร้าง Notification ID ที่ปลอดภัย (32-bit Integer) และส่งไปยัง Notification Channel บน Android:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* 1. Critical Test */}
            <div className="p-3.5 bg-gradient-to-br from-red-50 to-red-100/60 dark:from-red-950/40 dark:to-red-900/20 border border-red-200 dark:border-red-800/60 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <Badge className="bg-red-600 text-white text-[10px] px-1.5 py-0.5">
                  Critical
                </Badge>
                <span className="text-[10px] text-red-600 dark:text-red-400 font-mono">
                  disaster-critical
                </span>
              </div>
              <div>
                <div className="text-xs font-bold text-red-900 dark:text-red-200">
                  🚨 แจ้งเตือนวิกฤต (Heads-up)
                </div>
                <p className="text-[11px] text-red-700/80 dark:text-red-300/80 mt-0.5 line-clamp-2">
                  ความสำคัญสูงสุด เด้งป๊อปอัป มีเสียงไซเรนฉุกเฉิน และสั่นเตือนยาว
                </p>
              </div>
              <Button
                size="sm"
                onClick={() => handleTestNativePush('critical')}
                disabled={isTestingNotification !== null}
                className="w-full bg-red-600 hover:bg-red-700 text-white text-xs h-8 rounded-lg shadow-sm"
              >
                {isTestingNotification === 'critical' ? (
                  <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <>
                    <BellRing className="h-3.5 w-3.5 mr-1.5" />
                    ส่งทดสอบวิกฤต
                  </>
                )}
              </Button>
            </div>

            {/* 2. Warning Test */}
            <div className="p-3.5 bg-gradient-to-br from-amber-50 to-orange-100/60 dark:from-amber-950/40 dark:to-orange-900/20 border border-amber-200 dark:border-amber-800/60 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <Badge className="bg-amber-500 text-white text-[10px] px-1.5 py-0.5">
                  Warning
                </Badge>
                <span className="text-[10px] text-amber-700 dark:text-amber-400 font-mono">
                  disaster-warning
                </span>
              </div>
              <div>
                <div className="text-xs font-bold text-amber-900 dark:text-amber-200">
                  ⚠️ แจ้งเตือนเฝ้าระวัง
                </div>
                <p className="text-[11px] text-amber-800/80 dark:text-amber-300/80 mt-0.5 line-clamp-2">
                  ความสำคัญสูง สำหรับภัยที่ใกล้เข้ามา มีเสียงเตือนและการสั่น
                </p>
              </div>
              <Button
                size="sm"
                onClick={() => handleTestNativePush('warning')}
                disabled={isTestingNotification !== null}
                className="w-full bg-amber-500 hover:bg-amber-600 text-white text-xs h-8 rounded-lg shadow-sm"
              >
                {isTestingNotification === 'warning' ? (
                  <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <>
                    <BellRing className="h-3.5 w-3.5 mr-1.5" />
                    ส่งทดสอบเฝ้าระวัง
                  </>
                )}
              </Button>
            </div>

            {/* 3. Info Test */}
            <div className="p-3.5 bg-gradient-to-br from-blue-50 to-indigo-100/60 dark:from-blue-950/40 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800/60 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <Badge className="bg-blue-600 text-white text-[10px] px-1.5 py-0.5">
                  Info
                </Badge>
                <span className="text-[10px] text-blue-600 dark:text-blue-400 font-mono">
                  disaster-info
                </span>
              </div>
              <div>
                <div className="text-xs font-bold text-blue-900 dark:text-blue-200">
                  ℹ️ ข้อมูลสภาพอากาศ
                </div>
                <p className="text-[11px] text-blue-700/80 dark:text-blue-300/80 mt-0.5 line-clamp-2">
                  ความสำคัญปกติ แจ้งข้อมูลและการเตรียมพร้อม ไม่รบกวนหน้าจอ
                </p>
              </div>
              <Button
                size="sm"
                onClick={() => handleTestNativePush('info')}
                disabled={isTestingNotification !== null}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white text-xs h-8 rounded-lg shadow-sm"
              >
                {isTestingNotification === 'info' ? (
                  <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <>
                    <BellRing className="h-3.5 w-3.5 mr-1.5" />
                    ส่งทดสอบข้อมูล
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Test Status Bar Indicator */}
          {lastTestResult && (
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl flex items-center justify-between text-xs text-emerald-800 dark:text-emerald-300">
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-emerald-600" />
                <span>
                  ส่งการแจ้งเตือนสำเร็จ: รหัส ID <code className="font-mono font-bold">#{lastTestResult.id}</code> ช่อง <code className="font-mono">{lastTestResult.channel}</code> ({lastTestResult.timestamp})
                </span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 3. Alert Radius Settings (5km, 10km, 25km, 50km) */}
      <Card className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl rounded-2xl overflow-hidden">
        <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <MapPin className="h-4 w-4 text-orange-500" />
                กำหนดระยะรัศมีการแจ้งเตือน (Proximity Radius)
              </CardTitle>
              <CardDescription className="text-xs text-slate-500 dark:text-slate-400">
                เลือกระยะห่างจากตำแหน่งคุณที่จะให้ระบบแจ้งเตือนเมื่อเกิดภัยพิบัติ
              </CardDescription>
            </div>
            <Badge className="bg-orange-500 text-white font-mono text-xs px-2.5 py-0.5">
              {engineSettings.radiusKm} กม.
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="pt-4 space-y-4">
          {/* Preset Buttons */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {RADIUS_PRESETS.map((preset) => (
              <button
                key={preset.value}
                type="button"
                onClick={() => updateEngineConfig({ radiusKm: preset.value })}
                className={`p-3 rounded-xl border text-left transition-all ${
                  engineSettings.radiusKm === preset.value
                    ? 'border-orange-500 bg-orange-50/80 dark:bg-orange-950/40 text-orange-900 dark:text-orange-200 shadow-sm ring-1 ring-orange-500'
                    : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-300'
                }`}
              >
                <div className="font-bold text-sm">{preset.label}</div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">{preset.desc}</div>
              </button>
            ))}
          </div>

          {/* Continuous Slider for Custom Radius */}
          <div className="space-y-2 pt-2">
            <div className="flex justify-between text-xs text-slate-600 dark:text-slate-400">
              <span>ปรับแต่งระยะละเอียด (1 - 100 กม.)</span>
              <span className="font-semibold text-orange-600">{engineSettings.radiusKm} กิโลเมตร</span>
            </div>
            <Slider
              value={[engineSettings.radiusKm]}
              onValueChange={([val]) => updateEngineConfig({ radiusKm: val })}
              max={100}
              min={1}
              step={1}
              className="w-full"
            />
          </div>
        </CardContent>
      </Card>

      {/* 4. Disaster Type Toggles (เปิด-ปิดแต่ละประเภทภัย) */}
      <Card className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl rounded-2xl overflow-hidden">
        <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800">
          <CardTitle className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Activity className="h-4 w-4 text-red-500" />
            การเปิด-ปิดแจ้งเตือนแต่ละประเภทภัย (Disaster Categories)
          </CardTitle>
          <CardDescription className="text-xs text-slate-500 dark:text-slate-400">
            ระบบจะคำนวณพิกัดและส่งการแจ้งเตือนตามเกณฑ์ความปลอดภัยของแต่ละประเภทภัย
          </CardDescription>
        </CardHeader>

        <CardContent className="pt-4 space-y-3">
          {/* Wildfire / VIIRS Hotspots */}
          <div className="flex items-center justify-between p-3.5 bg-gradient-to-r from-red-50/70 to-transparent dark:from-red-950/30 rounded-xl border border-red-100 dark:border-red-900/50">
            <div className="flex items-center gap-3">
              <div className="bg-red-500 text-white p-2.5 rounded-xl shadow-sm">
                <Flame className="h-5 w-5" />
              </div>
              <div>
                <div className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  จุดความร้อนและไฟป่า (VIIRS Hotspots)
                  <Badge variant="outline" className="text-[10px] bg-red-100 text-red-700 border-red-200 dark:bg-red-950/60 dark:text-red-400">
                    ดาวเทียม GISTDA
                  </Badge>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  &lt; 5 กม. = วิกฤต อพยพด่วน | &lt; 15 กม. = เฝ้าระวังควันไฟ
                </p>
              </div>
            </div>
            <Switch
              checked={engineSettings.categories.wildfire}
              onCheckedChange={() => toggleCategory('wildfire')}
            />
          </div>

          {/* Flood Polygons */}
          <div className="flex items-center justify-between p-3.5 bg-gradient-to-r from-blue-50/70 to-transparent dark:from-blue-950/30 rounded-xl border border-blue-100 dark:border-blue-900/50">
            <div className="flex items-center gap-3">
              <div className="bg-blue-500 text-white p-2.5 rounded-xl shadow-sm">
                <Waves className="h-5 w-5" />
              </div>
              <div>
                <div className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  พื้นที่น้ำท่วมและอุทกภัย (Flood Polygons)
                  <Badge variant="outline" className="text-[10px] bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-950/60 dark:text-blue-400">
                    รูปหลายเหลี่ยมน้ำท่วม
                  </Badge>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  อยู่ในพื้นที่ = วิกฤต | &lt; 10 กม. = เฝ้าระวังมวลน้ำ
                </p>
              </div>
            </div>
            <Switch
              checked={engineSettings.categories.flood}
              onCheckedChange={() => toggleCategory('flood')}
            />
          </div>

          {/* Severe Drought */}
          <div className="flex items-center justify-between p-3.5 bg-gradient-to-r from-amber-50/70 to-transparent dark:from-amber-950/30 rounded-xl border border-amber-100 dark:border-amber-900/50">
            <div className="flex items-center gap-3">
              <div className="bg-amber-500 text-white p-2.5 rounded-xl shadow-sm">
                <Sun className="h-5 w-5" />
              </div>
              <div>
                <div className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  พื้นที่ภัยแล้งรุนแรง (Severe Drought)
                  <Badge variant="outline" className="text-[10px] bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-950/60 dark:text-amber-400">
                    ความเสี่ยง &gt; 70%
                  </Badge>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  แจ้งเตือนการบริหารจัดการน้ำและการสำรองน้ำอุปโภคบริโภค
                </p>
              </div>
            </div>
            <Switch
              checked={engineSettings.categories.drought}
              onCheckedChange={() => toggleCategory('drought')}
            />
          </div>
        </CardContent>
      </Card>

      {/* 5. Additional Delivery Methods (Email & SMS) */}
      <Card className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl rounded-2xl overflow-hidden">
        <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800">
          <CardTitle className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Mail className="h-4 w-4 text-purple-500" />
            ช่องทางการรับการแจ้งเตือนเพิ่มเติม (Backup Channels)
          </CardTitle>
          <CardDescription className="text-xs text-slate-500 dark:text-slate-400">
            รับสำเนาการแจ้งเตือนเหตุวิกฤตผ่านทางอีเมลเพื่อความปลอดภัยสูงสุด
          </CardDescription>
        </CardHeader>

        <CardContent className="pt-4 space-y-4">
          {/* Email Option */}
          <div className="p-3.5 bg-purple-50/60 dark:bg-purple-950/30 rounded-xl border border-purple-100 dark:border-purple-900/50 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-purple-600 text-white p-2 rounded-lg">
                  <Mail className="h-4 w-4" />
                </div>
                <div>
                  <Label htmlFor="email-notifications" className="font-semibold text-sm">
                    แจ้งเตือนผ่านอีเมล (Email Notification)
                  </Label>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    ส่งสรุปสถานการณ์ภัยพิบัติไปยังกล่องข้อความ
                  </p>
                </div>
              </div>
              <Switch
                id="email-notifications"
                checked={preferences.email}
                onCheckedChange={(checked) => updatePreferences({ email: checked })}
              />
            </div>

            {/* Email Input Field */}
            {preferences.email && (
              <div className="space-y-2 pt-2 border-t border-purple-100 dark:border-purple-900/60">
                <Label className="text-xs text-slate-600 dark:text-slate-400">
                  ระบุที่อยู่อีเมลของคุณ
                </Label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Input
                      type="email"
                      placeholder="name@example.com"
                      value={emailAddress}
                      onChange={handleEmailChange}
                      className={`pr-8 ${
                        isEmailValid
                          ? 'border-emerald-300 focus:border-emerald-500'
                          : emailAddress
                          ? 'border-red-300'
                          : ''
                      }`}
                    />
                    {emailAddress && (
                      <div className="absolute right-2.5 top-1/2 -translate-y-1/2">
                        {isEmailValid ? (
                          <Check className="h-4 w-4 text-emerald-600" />
                        ) : (
                          <X className="h-4 w-4 text-red-500" />
                        )}
                      </div>
                    )}
                  </div>
                  <Button
                    size="sm"
                    onClick={sendTestEmail}
                    disabled={!isEmailValid || isSendingTestEmail}
                    className="bg-purple-600 hover:bg-purple-700 text-white whitespace-nowrap text-xs h-9 px-3.5"
                  >
                    {isSendingTestEmail ? (
                      <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <>
                        <Send className="h-3.5 w-3.5 mr-1" />
                        ส่งทดสอบ
                      </>
                    )}
                  </Button>
                </div>
                {!isEmailValid && emailAddress && (
                  <p className="text-xs text-red-500">กรุณากรอกอีเมลที่ถูกต้อง</p>
                )}
              </div>
            )}
          </div>

          {/* SMS Option */}
          <div className="p-3.5 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-800 opacity-60">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-slate-300 dark:bg-slate-700 p-2 rounded-lg relative text-slate-600 dark:text-slate-300">
                  <Mail className="h-4 w-4" />
                  <Lock className="h-2.5 w-2.5 text-slate-500 absolute -bottom-0.5 -right-0.5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <Label htmlFor="sms-notifications" className="font-semibold text-sm text-slate-600 dark:text-slate-300">
                      ข้อความสั้น SMS
                    </Label>
                    <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                      แผนพัฒนาในอนาคต
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-400">ส่ง SMS ฉุกเฉินเมื่อไม่มีสัญญาณอินเทอร์เน็ต</p>
                </div>
              </div>
              <Switch id="sms-notifications" checked={false} disabled={true} />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LocationBasedAlerts;
