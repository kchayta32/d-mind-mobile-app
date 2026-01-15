
import React, { useState, useEffect } from 'react';
import { useNotifications } from '@/hooks/useNotifications';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Bell, BellOff, Settings, Volume2, VolumeX, MapPin } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';

interface NotificationSettings {
  enabled: boolean;
  sound: boolean;
  volume: number;
  emergencyOnly: boolean;
  areas: string[];
  types: string[];
}

const NotificationCenter: React.FC = () => {
  const { permission, requestPermission, sendNotification } = useNotifications();
  const { toast } = useToast();
  const [settings, setSettings] = useState<NotificationSettings>({
    enabled: false,
    sound: true,
    volume: 80,
    emergencyOnly: false,
    areas: [],
    types: ['earthquake', 'flood', 'wildfire', 'storm']
  });
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Load settings from localStorage
  useEffect(() => {
    const savedSettings = localStorage.getItem('dmind-notification-settings');
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
  }, []);

  // Save settings to localStorage
  const saveSettings = (newSettings: NotificationSettings) => {
    setSettings(newSettings);
    localStorage.setItem('dmind-notification-settings', JSON.stringify(newSettings));
  };

  const handleEnableNotifications = async () => {
    const granted = await requestPermission();
    if (granted) {
      saveSettings({ ...settings, enabled: true });
      toast({
        title: "การแจ้งเตือนเปิดใช้งานแล้ว",
        description: "คุณจะได้รับการแจ้งเตือนเมื่อมีเหตุการณ์ภัยพิบัติ",
      });
    } else {
      // Handle the case where permission is denied
      // Check if Notification API exists (it won't on native apps)
      if (typeof Notification !== 'undefined' && Notification.permission === 'denied') {
        toast({
          title: "การแจ้งเตือนถูกปิดกั้น",
          description: "กรุณาไปที่การตั้งค่าของเบราว์เซอร์/อุปกรณ์เพื่ออนุญาตการแจ้งเตือนสำหรับเว็บไซต์นี้",
          variant: "destructive",
        });
      }
    }
  };

  const handleDisableNotifications = () => {
    saveSettings({ ...settings, enabled: false });
    toast({
      title: "การแจ้งเตือนปิดใช้งานแล้ว",
      description: "คุณจะไม่ได้รับการแจ้งเตือนอีกต่อไป",
      variant: "destructive",
    });
  };

  const testNotification = () => {
    if (settings.enabled) {
      sendNotification("🚨 ทดสอบการแจ้งเตือน", {
        body: "ระบบแจ้งเตือนทำงานปกติ - D-MIND",
        icon: "/lovable-uploads/b5550bd4-d83d-4e1e-ac09-025117b87c86.png",
        badge: "/lovable-uploads/b5550bd4-d83d-4e1e-ac09-025117b87c86.png",
        tag: "test-notification",
        requireInteraction: true,
      });
    }
  };

  const emergencySound = () => {
    if (settings.sound) {
      // Create emergency sound
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
      oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.1);
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime + 0.2);

      gainNode.gain.setValueAtTime(settings.volume / 100, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.3);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5 text-orange-500" />
          ระบบแจ้งเตือนภัยพิบัติ
        </CardTitle>
        <CardDescription>
          รับแจ้งเตือนแบบเรียลไทม์เมื่อมีเหตุการณ์ภัยพิบัติ
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Permission Status */}
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-2">
            {permission === 'granted' ? (
              <Bell className="h-4 w-4 text-green-500" />
            ) : (
              <BellOff className="h-4 w-4 text-red-500" />
            )}
            <span className="text-sm font-medium">
              สถานะ: {permission === 'granted' ? 'เปิดใช้งาน' : 'ปิดใช้งาน'}
            </span>
          </div>
          <Badge variant={permission === 'granted' ? 'default' : 'destructive'}>
            {permission === 'granted' ? 'ใช้งานได้' : 'ไม่ได้รับอนุญาต'}
          </Badge>
        </div>

        {/* Main Controls */}
        <div className="space-y-3">
          {permission !== 'granted' ? (
            <Button onClick={handleEnableNotifications} className="w-full">
              <Bell className="mr-2 h-4 w-4" />
              เปิดใช้งานการแจ้งเตือน
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button
                variant={settings.enabled ? "destructive" : "default"}
                onClick={settings.enabled ? handleDisableNotifications : handleEnableNotifications}
                className="flex-1"
              >
                {settings.enabled ? (
                  <>
                    <BellOff className="mr-2 h-4 w-4" />
                    ปิดการแจ้งเตือน
                  </>
                ) : (
                  <>
                    <Bell className="mr-2 h-4 w-4" />
                    เปิดการแจ้งเตือน
                  </>
                )}
              </Button>

              <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="icon">
                    <Settings className="h-4 w-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md bg-white dark:bg-gray-900 border shadow-lg max-h-[85vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      <Settings className="h-5 w-5 text-gray-500" />
                      ตั้งค่าการแจ้งเตือน
                    </DialogTitle>
                    <DialogDescription>
                      ปรับแต่งการแจ้งเตือนตามความต้องการของท่าน
                    </DialogDescription>
                  </DialogHeader>

                  <div className="space-y-6 pt-4">
                    {/* Sound Settings */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="sound-toggle" className="flex items-center gap-2 text-base font-medium">
                          {settings.sound ? <Volume2 className="h-4 w-4 text-blue-500" /> : <VolumeX className="h-4 w-4 text-gray-400" />}
                          เสียงแจ้งเตือน
                        </Label>
                        <Switch
                          id="sound-toggle"
                          checked={settings.sound}
                          onCheckedChange={(checked) =>
                            saveSettings({ ...settings, sound: checked })
                          }
                        />
                      </div>

                      {settings.sound && (
                        <div className="space-y-3 px-2">
                          <div className="flex justify-between">
                            <Label className="text-xs text-gray-500">ความดัง</Label>
                            <span className="text-xs font-medium text-blue-600">{settings.volume}%</span>
                          </div>
                          <Slider
                            value={[settings.volume]}
                            onValueChange={([value]) =>
                              saveSettings({ ...settings, volume: value })
                            }
                            max={100}
                            step={10}
                            className="cursor-pointer"
                          />
                        </div>
                      )}
                    </div>

                    <div className="h-px bg-gray-100 dark:bg-gray-800" />

                    {/* Emergency Only */}
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="emergency-only" className="text-base font-medium">แจ้งเตือนเฉพาะภัยฉุกเฉิน</Label>
                        <p className="text-xs text-gray-500">ข้ามการแจ้งเตือนทั่วไป รับเฉพาะเหตุวิกฤต</p>
                      </div>
                      <Switch
                        id="emergency-only"
                        checked={settings.emergencyOnly}
                        onCheckedChange={(checked) =>
                          saveSettings({ ...settings, emergencyOnly: checked })
                        }
                      />
                    </div>

                    <div className="h-px bg-gray-100 dark:bg-gray-800" />

                    {/* Disaster Types */}
                    <div className="space-y-3">
                      <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                        ประเภทภัยที่ต้องการรับแจ้งเตือน
                      </Label>
                      <div className="grid grid-cols-2 gap-3">
                        {[
                          { value: 'earthquake', label: 'แผ่นดินไหว', icon: '📉', color: 'bg-orange-50 text-orange-600 border-orange-100' },
                          { value: 'flood', label: 'น้ำท่วม', icon: '🌊', color: 'bg-blue-50 text-blue-600 border-blue-100' },
                          { value: 'wildfire', label: 'ไฟป่า', icon: '🔥', color: 'bg-red-50 text-red-600 border-red-100' },
                          { value: 'storm', label: 'พายุ', icon: '🌪️', color: 'bg-gray-50 text-gray-600 border-gray-100' }
                        ].map((type) => (
                          <div
                            key={type.value}
                            className={`flex items-start space-x-3 p-3 rounded-xl border transition-all ${settings.types.includes(type.value) ? type.color : 'bg-gray-50 border-transparent opacity-60'
                              }`}
                          >
                            <Checkbox
                              id={type.value}
                              className="mt-1"
                              checked={settings.types.includes(type.value)}
                              onCheckedChange={(checked) => {
                                const newTypes = checked
                                  ? [...settings.types, type.value]
                                  : settings.types.filter(t => t !== type.value);
                                saveSettings({ ...settings, types: newTypes });
                              }}
                            />
                            <Label htmlFor={type.value} className="text-sm font-medium cursor-pointer flex-1">
                              <div className="text-lg mb-1">{type.icon}</div>
                              {type.label}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          )}

          {/* Test Buttons */}
          {settings.enabled && (
            <div className="flex gap-2">
              <Button variant="outline" onClick={testNotification} className="flex-1">
                ทดสอบการแจ้งเตือน
              </Button>
              <Button variant="outline" onClick={emergencySound} className="flex-1">
                ทดสอบเสียงเตือน
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default NotificationCenter;
