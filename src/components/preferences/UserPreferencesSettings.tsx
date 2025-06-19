
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { useUserPreferences } from '@/hooks/useUserPreferences';
import AlertSubscriptionSettings from '@/components/alerts/AlertSubscriptionSettings';
import RealtimeAlertDisplay from '@/components/alerts/RealtimeAlertDisplay';
import { MapPin, Bell, Settings, Trash2, Plus } from 'lucide-react';

const UserPreferencesSettings = () => {
  const { preferences, isLoading, savePreferences } = useUserPreferences();
  const [newArea, setNewArea] = useState('');

  const addPreferredArea = () => {
    if (newArea.trim() && preferences) {
      const updatedAreas = [...preferences.preferred_areas, newArea.trim()];
      savePreferences({ preferred_areas: updatedAreas });
      setNewArea('');
    }
  };

  const removePreferredArea = (areaToRemove: string) => {
    if (preferences) {
      const updatedAreas = preferences.preferred_areas.filter(area => area !== areaToRemove);
      savePreferences({ preferred_areas: updatedAreas });
    }
  };

  const updateNotificationSetting = (key: keyof typeof preferences.notification_settings, value: boolean) => {
    if (preferences) {
      savePreferences({
        notification_settings: {
          ...preferences.notification_settings,
          [key]: value
        }
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="container mx-auto max-w-4xl">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto max-w-6xl p-4">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">การตั้งค่า</h1>
          <p className="text-gray-600">จัดการการตั้งค่าของคุณและการแจ้งเตือน</p>
        </div>

        <Tabs defaultValue="alerts" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="alerts" className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              การแจ้งเตือน
            </TabsTrigger>
            <TabsTrigger value="areas" className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              พื้นที่ความสนใจ
            </TabsTrigger>
            <TabsTrigger value="general" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              ทั่วไป
            </TabsTrigger>
          </TabsList>

          <TabsContent value="alerts" className="space-y-6">
            <RealtimeAlertDisplay />
            <AlertSubscriptionSettings />
          </TabsContent>

          <TabsContent value="areas" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  พื้นที่ที่สนใจ
                </CardTitle>
                <CardDescription>
                  เพิ่มพื้นที่ที่คุณต้องการติดตามข้อมูลภัยพิบัติเป็นพิเศษ
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="เช่น: กรุงเทพมหานคร, เชียงใหม่"
                    value={newArea}
                    onChange={(e) => setNewArea(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        addPreferredArea();
                      }
                    }}
                  />
                  <Button onClick={addPreferredArea} disabled={!newArea.trim()}>
                    <Plus className="h-4 w-4 mr-2" />
                    เพิ่ม
                  </Button>
                </div>

                <div className="space-y-2">
                  <Label>พื้นที่ที่เลือก ({preferences?.preferred_areas.length || 0})</Label>
                  <div className="flex flex-wrap gap-2">
                    {preferences?.preferred_areas.map((area, index) => (
                      <Badge key={index} variant="secondary" className="flex items-center gap-1">
                        {area}
                        <button
                          onClick={() => removePreferredArea(area)}
                          className="ml-1 hover:text-red-600"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                  {(!preferences?.preferred_areas || preferences.preferred_areas.length === 0) && (
                    <p className="text-sm text-gray-500">ยังไม่มีพื้นที่ที่เลือก</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="general" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>การตั้งค่าทั่วไป</CardTitle>
                <CardDescription>
                  จัดการการตั้งค่าพื้นฐานสำหรับการแจ้งเตือนแต่ละประเภท
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base">แผ่นดินไหว</Label>
                      <p className="text-sm text-muted-foreground">
                        รับการแจ้งเตือนเกี่ยวกับแผ่นดินไหว
                      </p>
                    </div>
                    <Switch
                      checked={preferences?.notification_settings.earthquakes}
                      onCheckedChange={(checked) => updateNotificationSetting('earthquakes', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base">น้ำท่วม</Label>
                      <p className="text-sm text-muted-foreground">
                        รับการแจ้งเตือนเกี่ยวกับน้ำท่วม
                      </p>
                    </div>
                    <Switch
                      checked={preferences?.notification_settings.floods}
                      onCheckedChange={(checked) => updateNotificationSetting('floods', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base">ไฟป่า</Label>
                      <p className="text-sm text-muted-foreground">
                        รับการแจ้งเตือนเกี่ยวกับไฟป่า
                      </p>
                    </div>
                    <Switch
                      checked={preferences?.notification_settings.wildfires}
                      onCheckedChange={(checked) => updateNotificationSetting('wildfires', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base">มลพิษอากาศ</Label>
                      <p className="text-sm text-muted-foreground">
                        รับการแจ้งเตือนเกี่ยวกับมลพิษอากาศ
                      </p>
                    </div>
                    <Switch
                      checked={preferences?.notification_settings.airPollution}
                      onCheckedChange={(checked) => updateNotificationSetting('airPollution', checked)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default UserPreferencesSettings;
