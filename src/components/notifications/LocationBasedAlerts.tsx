
import React from 'react';
import { useGeolocation } from '@/hooks/useGeolocation';
import { useEnhancedNotifications } from '@/hooks/useEnhancedNotifications';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { MapPin, RefreshCw, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

const LocationBasedAlerts: React.FC = () => {
  const { coordinates, error, loading, refreshLocation } = useGeolocation();
  const { preferences, updatePreferences } = useEnhancedNotifications();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5 text-blue-500" />
          การแจ้งเตือนตามตำแหน่ง
        </CardTitle>
        <CardDescription>
          ตั้งค่าการรับแจ้งเตือนตามพื้นที่ที่คุณอยู่
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Current Location */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">ตำแหน่งปัจจุบัน</Label>
          {loading ? (
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <RefreshCw className="h-4 w-4 animate-spin" />
              กำลังระบุตำแหน่ง...
            </div>
          ) : error ? (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : coordinates ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                <div>
                  <div className="text-sm font-medium text-green-800">
                    ระบุตำแหน่งสำเร็จ
                  </div>
                  <div className="text-xs text-green-600">
                    {coordinates.lat.toFixed(6)}, {coordinates.lng.toFixed(6)}
                  </div>
                </div>
                <Button variant="outline" size="sm" onClick={refreshLocation}>
                  <RefreshCw className="h-3 w-3 mr-1" />
                  อัพเดท
                </Button>
              </div>
            </div>
          ) : (
            <Button onClick={refreshLocation} className="w-full">
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
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="push-notifications">การแจ้งเตือนแบบ Push</Label>
                <p className="text-xs text-gray-500">แจ้งเตือนผ่านเบราว์เซอร์</p>
              </div>
              <Switch
                id="push-notifications"
                checked={preferences.push}
                onCheckedChange={(checked) => updatePreferences({ push: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="email-notifications">อีเมล</Label>
                <p className="text-xs text-gray-500">ส่งการแจ้งเตือนทางอีเมล</p>
              </div>
              <Switch
                id="email-notifications"
                checked={preferences.email}
                onCheckedChange={(checked) => updatePreferences({ email: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="sms-notifications">SMS</Label>
                <p className="text-xs text-gray-500">ส่งข้อความผ่าน SMS</p>
              </div>
              <Switch
                id="sms-notifications"
                checked={preferences.sms}
                onCheckedChange={(checked) => updatePreferences({ sms: checked })}
              />
            </div>
          </div>
        </div>

        {/* Info Box */}
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            ระบบจะส่งการแจ้งเตือนเมื่อมีภัยพิบัติเกิดขึ้นในรัศมีที่คุณกำหนด 
            และมีระดับความรุนแรงตั้งแต่ระดับที่คุณเลือกขึ้นไป
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
};

export default LocationBasedAlerts;
