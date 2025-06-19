
import React, { useState } from 'react';
import { useRealtimeAlerts } from '@/hooks/useRealtimeAlerts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { MapPin, Bell, Settings, AlertTriangle } from 'lucide-react';

const AlertSubscriptionSettings = () => {
  const { subscription, saveSubscription, userLocation } = useRealtimeAlerts();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(subscription || {
    alert_types: [],
    location_preferences: { lat: 0, lng: 0 },
    radius_km: 50,
    min_severity_level: 1,
    notification_methods: { push: true, email: false, sms: false },
    is_active: true
  });

  const alertTypeOptions = [
    { value: 'earthquake', label: 'แผ่นดินไหว', icon: '🌍' },
    { value: 'flood', label: 'น้ำท่วม', icon: '🌊' },
    { value: 'wildfire', label: 'ไฟป่า', icon: '🔥' },
    { value: 'storm', label: 'พายุ', icon: '🌪️' },
    { value: 'heavyrain', label: 'ฝนตกหนัก', icon: '🌧️' },
    { value: 'drought', label: 'ภัยแล้ง', icon: '☀️' },
    { value: 'airpollution', label: 'มลพิษอากาศ', icon: '💨' }
  ];

  const severityLevels = [
    { value: 1, label: 'ทุกระดับ', color: 'text-green-600' },
    { value: 2, label: 'ปานกลางขึ้นไป', color: 'text-yellow-600' },
    { value: 3, label: 'สูงขึ้นไป', color: 'text-orange-600' },
    { value: 4, label: 'รุนแรงขึ้นไป', color: 'text-red-600' },
    { value: 5, label: 'วิกฤตเท่านั้น', color: 'text-red-800' }
  ];

  const handleSave = async () => {
    await saveSubscription(formData);
    setIsEditing(false);
  };

  const handleAlertTypeChange = (alertType: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      alert_types: checked 
        ? [...prev.alert_types, alertType]
        : prev.alert_types.filter(type => type !== alertType)
    }));
  };

  React.useEffect(() => {
    if (subscription) {
      setFormData(subscription);
    }
  }, [subscription]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            การตั้งค่าการแจ้งเตือน
          </CardTitle>
          <CardDescription>
            จัดการการรับการแจ้งเตือนภัยพิบัติตามความต้องการของคุณ
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Active Status */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">เปิดใช้งานการแจ้งเตือน</Label>
              <p className="text-sm text-muted-foreground">
                รับการแจ้งเตือนภัยพิบัติแบบเรียลไทม์
              </p>
            </div>
            <Switch
              checked={formData.is_active}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
              disabled={!isEditing}
            />
          </div>

          {/* Location Info */}
          <div className="space-y-3">
            <Label className="text-base flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              ตำแหน่งปัจจุบัน
            </Label>
            <div className="text-sm text-muted-foreground">
              {userLocation ? (
                <span>
                  ละติจูด: {userLocation[0].toFixed(6)}, ลองจิจูด: {userLocation[1].toFixed(6)}
                </span>
              ) : (
                <span>กำลังตรวจสอบตำแหน่ง...</span>
              )}
            </div>
          </div>

          {/* Detection Radius */}
          <div className="space-y-3">
            <Label className="text-base">รัศมีการตรวจจับ: {formData.radius_km} กิโลเมตร</Label>
            <Slider
              value={[formData.radius_km]}
              onValueChange={(value) => setFormData(prev => ({ ...prev, radius_km: value[0] }))}
              max={200}
              min={5}
              step={5}
              disabled={!isEditing}
              className="w-full"
            />
            <p className="text-sm text-muted-foreground">
              รับการแจ้งเตือนเมื่อเกิดภัยพิบัติในรัศมี {formData.radius_km} กิโลเมตร จากตำแหน่งของคุณ
            </p>
          </div>

          {/* Alert Types */}
          <div className="space-y-3">
            <Label className="text-base">ประเภทภัยพิบัติที่สนใจ</Label>
            <div className="grid grid-cols-2 gap-3">
              {alertTypeOptions.map(option => (
                <div key={option.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={option.value}
                    checked={formData.alert_types.includes(option.value)}
                    onCheckedChange={(checked) => handleAlertTypeChange(option.value, !!checked)}
                    disabled={!isEditing}
                  />
                  <Label 
                    htmlFor={option.value}
                    className="text-sm font-normal cursor-pointer flex items-center gap-2"
                  >
                    <span>{option.icon}</span>
                    {option.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Severity Level */}
          <div className="space-y-3">
            <Label className="text-base flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              ระดับความรุนแรงขั้นต่ำ
            </Label>
            <Select
              value={formData.min_severity_level.toString()}
              onValueChange={(value) => setFormData(prev => ({ ...prev, min_severity_level: parseInt(value) }))}
              disabled={!isEditing}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {severityLevels.map(level => (
                  <SelectItem key={level.value} value={level.value.toString()}>
                    <span className={level.color}>{level.label}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Notification Methods */}
          <div className="space-y-3">
            <Label className="text-base">วิธีการแจ้งเตือน</Label>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="push-notifications" className="text-sm font-normal">
                  การแจ้งเตือนผ่านเบราว์เซอร์
                </Label>
                <Switch
                  id="push-notifications"
                  checked={formData.notification_methods.push}
                  onCheckedChange={(checked) => 
                    setFormData(prev => ({
                      ...prev,
                      notification_methods: { ...prev.notification_methods, push: checked }
                    }))
                  }
                  disabled={!isEditing}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="email-notifications" className="text-sm font-normal">
                  อีเมล (เร็วๆ นี้)
                </Label>
                <Switch
                  id="email-notifications"
                  checked={formData.notification_methods.email}
                  onCheckedChange={(checked) => 
                    setFormData(prev => ({
                      ...prev,
                      notification_methods: { ...prev.notification_methods, email: checked }
                    }))
                  }
                  disabled={true}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="sms-notifications" className="text-sm font-normal">
                  SMS (เร็วๆ นี้)
                </Label>
                <Switch
                  id="sms-notifications"
                  checked={formData.notification_methods.sms}
                  onCheckedChange={(checked) => 
                    setFormData(prev => ({
                      ...prev,
                      notification_methods: { ...prev.notification_methods, sms: checked }
                    }))
                  }
                  disabled={true}
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            {!isEditing ? (
              <Button 
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2"
              >
                <Settings className="h-4 w-4" />
                แก้ไขการตั้งค่า
              </Button>
            ) : (
              <>
                <Button onClick={handleSave}>
                  บันทึกการตั้งค่า
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setIsEditing(false);
                    setFormData(subscription || formData);
                  }}
                >
                  ยกเลิก
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AlertSubscriptionSettings;
