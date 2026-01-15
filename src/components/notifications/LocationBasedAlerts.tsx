import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useGeolocation } from '@/hooks/useGeolocation';
import { useEnhancedNotifications } from '@/hooks/useEnhancedNotifications';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { MapPin, RefreshCw, AlertCircle, Settings, Mail, Send, Lock, Check, X } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';

const LocationBasedAlerts: React.FC = () => {
  const { coordinates, error, loading, refreshLocation, openAppSettings, permissionStatus } = useGeolocation();
  const { preferences, updatePreferences } = useEnhancedNotifications();
  const { toast } = useToast();

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

      // Sync to server
      try {
        const { error } = await supabase
          .from('user_notification_settings')
          .upsert(
            {
              email: email,
              enabled: preferences.email,
              latitude: coordinates.lat,
              longitude: coordinates.lng,
              updated_at: new Date().toISOString()
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
        title: "อีเมลไม่ถูกต้อง",
        description: "กรุณากรอกอีเมลที่ถูกต้อง",
        variant: "destructive",
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
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
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
          title: "ส่งอีเมลทดสอบสำเร็จ",
          description: `ส่งไปยัง ${emailAddress} แล้ว กรุณาตรวจสอบกล่องจดหมาย`,
        });
      } else {
        throw new Error(result.error || 'Failed to send email');
      }
    } catch (error) {
      console.error('Error sending test email:', error);
      toast({
        title: "ส่งอีเมลไม่สำเร็จ",
        description: error instanceof Error ? error.message : "กรุณาลองใหม่อีกครั้ง",
        variant: "destructive",
      });
    } finally {
      setIsSendingTestEmail(false);
    }
  };

  return (
    <Card className="border-0 shadow-none bg-transparent">
      <CardHeader className="px-0 pt-0">
        <CardTitle className="flex items-center gap-2 text-lg">
          <MapPin className="h-5 w-5 text-blue-500" />
          การแจ้งเตือนตามตำแหน่ง
        </CardTitle>
        <CardDescription className="text-sm">
          ตั้งค่าการรับแจ้งเตือนตามพื้นที่ที่คุณอยู่
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5 px-0 pb-0">
        {/* Current Location */}
        <div className="space-y-2">
          <Label className="text-sm font-medium flex items-center gap-2">
            ตำแหน่งปัจจุบัน
            {!coordinates && !loading && !error && (
              <Button
                variant="ghost"
                size="sm"
                onClick={refreshLocation}
                className="h-7 px-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
              >
                <MapPin className="h-3.5 w-3.5 mr-1" />
                ระบุตำแหน่ง
              </Button>
            )}
          </Label>
          {loading ? (
            <div className="flex items-center gap-2 text-sm text-gray-500 p-3 bg-gray-50 rounded-xl">
              <RefreshCw className="h-4 w-4 animate-spin" />
              กำลังระบุตำแหน่ง...
            </div>
          ) : error ? (
            <Alert className="bg-red-50 border-red-200">
              <AlertCircle className="h-4 w-4 text-red-500" />
              <AlertDescription className="text-red-700 text-sm space-y-2">
                <p>{error}</p>
                {permissionStatus === 'denied' && (
                  <p className="text-xs text-gray-600">
                    หากปฏิเสธสิทธิ์แล้ว กรุณาไปที่ตั้งค่าแอปเพื่ออนุญาต
                  </p>
                )}
                <div className="flex gap-2 mt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={refreshLocation}
                    className="h-7 text-xs"
                  >
                    <RefreshCw className="h-3 w-3 mr-1" />
                    ลองอีกครั้ง
                  </Button>
                  {permissionStatus === 'denied' && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={openAppSettings}
                      className="h-7 text-xs"
                    >
                      <Settings className="h-3 w-3 mr-1" />
                      เปิดตั้งค่า
                    </Button>
                  )}
                </div>
              </AlertDescription>
            </Alert>
          ) : coordinates ? (
            <div className="flex items-center justify-between p-3 bg-green-50/70 rounded-xl border border-green-100">
              <div className="flex items-center gap-3">
                <div className="bg-green-100 p-2 rounded-lg">
                  <MapPin className="h-4 w-4 text-green-600" />
                </div>
                <div>
                  <div className="text-sm font-medium text-green-800">ตำแหน่งของคุณ</div>
                  <code className="text-xs text-green-700 font-mono">
                    {coordinates.lat.toFixed(4)}, {coordinates.lng.toFixed(4)}
                  </code>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={refreshLocation}
                disabled={loading}
                className="h-8 w-8 rounded-full hover:bg-green-100 text-green-600"
              >
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          ) : (
            <Button onClick={refreshLocation} className="w-full bg-blue-600 hover:bg-blue-700">
              <MapPin className="h-4 w-4 mr-2" />
              ระบุตำแหน่งของฉัน
            </Button>
          )}
        </div>

        {/* Alert Radius */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">
            รัศมีการแจ้งเตือน: {preferences.radius_km} กิโลเมตร
          </Label>
          <Slider
            value={[preferences.radius_km]}
            onValueChange={([value]) => updatePreferences({ radius_km: value })}
            max={200}
            min={1}
            step={5}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-gray-500">
            <span>1 กม.</span>
            <span>200 กม.</span>
          </div>
        </div>

        {/* Severity Threshold */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">
            ระดับความรุนแรงขั้นต่ำ: {preferences.severity_threshold}
          </Label>
          <Slider
            value={[preferences.severity_threshold]}
            onValueChange={([value]) => updatePreferences({ severity_threshold: value })}
            max={5}
            min={1}
            step={1}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-gray-500">
            <span>1 (ต่ำ)</span>
            <span>5 (วิกฤติ)</span>
          </div>
        </div>

        {/* Notification Methods */}
        <div className="space-y-4">
          <Label className="text-sm font-medium">วิธีการแจ้งเตือน</Label>

          <div className="space-y-3">
            {/* Push Notifications */}
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="bg-blue-100 p-2 rounded-lg">
                  <AlertCircle className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <Label htmlFor="push-notifications" className="font-medium">การแจ้งเตือนแบบ Push</Label>
                  <p className="text-xs text-gray-500">แจ้งเตือนผ่านเบราว์เซอร์</p>
                </div>
              </div>
              <Switch
                id="push-notifications"
                checked={preferences.push}
                onCheckedChange={(checked) => updatePreferences({ push: checked })}
              />
            </div>

            {/* Email Notifications */}
            <div className="p-3 bg-purple-50 rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-purple-100 p-2 rounded-lg">
                    <Mail className="h-4 w-4 text-purple-600" />
                  </div>
                  <div>
                    <Label htmlFor="email-notifications" className="font-medium">อีเมล</Label>
                    <p className="text-xs text-gray-500">ส่งการแจ้งเตือนทางอีเมล</p>
                  </div>
                </div>
                <Switch
                  id="email-notifications"
                  checked={preferences.email}
                  onCheckedChange={(checked) => updatePreferences({ email: checked })}
                />
              </div>

              {/* Email Input - Show only when email is enabled */}
              {preferences.email && (
                <div className="space-y-2 pt-2 border-t border-purple-100">
                  <Label className="text-xs text-gray-600">กรอกอีเมลของคุณ</Label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Input
                        type="email"
                        placeholder="example@email.com"
                        value={emailAddress}
                        onChange={handleEmailChange}
                        className={`pr-8 ${isEmailValid ? 'border-green-300 focus:border-green-500' : emailAddress ? 'border-red-300' : ''}`}
                      />
                      {emailAddress && (
                        <div className="absolute right-2 top-1/2 -translate-y-1/2">
                          {isEmailValid ? (
                            <Check className="h-4 w-4 text-green-500" />
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
                      className="bg-purple-600 hover:bg-purple-700 whitespace-nowrap"
                    >
                      {isSendingTestEmail ? (
                        <RefreshCw className="h-4 w-4 animate-spin" />
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

            {/* SMS Notifications - Locked */}
            <div className="p-3 bg-gray-100 rounded-xl opacity-70">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-gray-200 p-2 rounded-lg relative">
                    <Mail className="h-4 w-4 text-gray-500" />
                    <Lock className="h-3 w-3 text-gray-600 absolute -bottom-0.5 -right-0.5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <Label htmlFor="sms-notifications" className="font-medium text-gray-500">SMS</Label>
                      <span className="text-[10px] bg-gray-300 text-gray-600 px-1.5 py-0.5 rounded-full">เร็วๆ นี้</span>
                    </div>
                    <p className="text-xs text-gray-400">ส่งข้อความผ่าน SMS</p>
                  </div>
                </div>
                <Switch
                  id="sms-notifications"
                  checked={false}
                  disabled={true}
                  className="opacity-50"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Info Box */}
        <Alert className="bg-blue-50 border-blue-200">
          <AlertCircle className="h-4 w-4 text-blue-500" />
          <AlertDescription className="text-sm text-blue-700">
            ระบบจะส่งการแจ้งเตือนเมื่อมีภัยพิบัติเกิดขึ้นในรัศมีที่คุณกำหนด
            และมีระดับความรุนแรงตั้งแต่ระดับที่คุณเลือกขึ้นไป
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
};

export default LocationBasedAlerts;
