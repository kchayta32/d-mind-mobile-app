
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useUserPreferences } from '@/hooks/useUserPreferences';
import { MapPin, Bell, Plus, X } from 'lucide-react';

const provinces = [
  'กรุงเทพมหานคร', 'กระบี่', 'กาญจนบุรี', 'กาฬสินธุ์', 'กำแพงเพชร', 'ขอนแก่น', 'จันทบุรี', 'ฉะเชิงเทรา',
  'ชลบุรี', 'ชัยนาท', 'ชัยภูมิ', 'ชุมพร', 'เชียงราย', 'เชียงใหม่', 'ตรัง', 'ตราด', 'ตาก', 'นครนายก',
  'นครปฐม', 'นครพนม', 'นครราชสีมา', 'นครศรีธรรมราช', 'นครสวรรค์', 'นนทบุรี', 'นราธิวาส', 'น่าน',
  'บึงกาฬ', 'บุรีรัมย์', 'ปทุมธานี', 'ประจวบคีรีขันธ์', 'ปราจีนบุรี', 'ปัตตานี', 'พระนครศรีอยุธยา',
  'พังงา', 'พัทลุง', 'พิจิตร', 'พิษณุโลก', 'เพชรบุรี', 'เพชรบูรณ์', 'แพร่', 'ภูเก็ต', 'มหาสารคาม',
  'มุกดาหาร', 'แม่ฮ่องสอน', 'ยโสธร', 'ยะลา', 'ร้อยเอ็ด', 'ระนอง', 'ระยอง', 'ราชบุรี', 'ลพบุรี',
  'ลำปาง', 'ลำพูน', 'เลย', 'ศรีสะเกษ', 'สกลนคร', 'สงขลา', 'สตูล', 'สมุทรปราการ', 'สมุทรสงคราม',
  'สมุทรสาคร', 'สระแก้ว', 'สระบุรี', 'สิงห์บุรี', 'สุโขทัย', 'สุพรรณบุรี', 'สุราษฎร์ธานี', 'สุรินทร์',
  'หนองคาย', 'หนองบัวลำภู', 'อ่างทอง', 'อำนาจเจริญ', 'อุดรธานี', 'อุตรดิตถ์', 'อุทัยธานี', 'อุบลราชธานี'
];

const UserPreferencesSettings: React.FC = () => {
  const { preferences, isLoading, savePreferences } = useUserPreferences();
  const [newArea, setNewArea] = useState('');
  const [filteredProvinces, setFilteredProvinces] = useState<string[]>([]);

  useEffect(() => {
    if (newArea) {
      const filtered = provinces.filter(province => 
        province.toLowerCase().includes(newArea.toLowerCase())
      ).slice(0, 5);
      setFilteredProvinces(filtered);
    } else {
      setFilteredProvinces([]);
    }
  }, [newArea]);

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  const handleAddArea = (area: string) => {
    if (!preferences) return;
    
    const currentAreas = preferences.preferred_areas || [];
    if (!currentAreas.includes(area)) {
      savePreferences({
        preferred_areas: [...currentAreas, area]
      });
    }
    setNewArea('');
    setFilteredProvinces([]);
  };

  const handleRemoveArea = (areaToRemove: string) => {
    if (!preferences) return;
    
    const currentAreas = preferences.preferred_areas || [];
    savePreferences({
      preferred_areas: currentAreas.filter(area => area !== areaToRemove)
    });
  };

  const handleNotificationChange = (type: string, enabled: boolean) => {
    if (!preferences) return;
    
    savePreferences({
      notification_settings: {
        ...preferences.notification_settings,
        [type]: enabled
      }
    });
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">การตั้งค่าผู้ใช้</h1>
        <p className="text-gray-600">จัดการพื้นที่ที่สนใจและการแจ้งเตือน</p>
      </div>

      {/* Preferred Areas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <MapPin className="mr-2 h-5 w-5" />
            พื้นที่ที่สนใจ
          </CardTitle>
          <CardDescription>
            เลือกจังหวัดที่คุณต้องการติดตามข้อมูลภัยพิบัติเป็นพิเศษ
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative">
            <Label htmlFor="newArea">เพิ่มจังหวัดใหม่</Label>
            <Input
              id="newArea"
              value={newArea}
              onChange={(e) => setNewArea(e.target.value)}
              placeholder="พิมพ์ชื่อจังหวัด..."
              className="mt-1"
            />
            
            {filteredProvinces.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg">
                {filteredProvinces.map((province) => (
                  <button
                    key={province}
                    onClick={() => handleAddArea(province)}
                    className="w-full px-4 py-2 text-left hover:bg-gray-100 first:rounded-t-md last:rounded-b-md"
                  >
                    {province}
                  </button>
                ))}
              </div>
            )}
          </div>
          
          <div className="flex flex-wrap gap-2">
            {preferences?.preferred_areas?.map((area) => (
              <Badge key={area} variant="secondary" className="flex items-center gap-1">
                {area}
                <button
                  onClick={() => handleRemoveArea(area)}
                  className="ml-1 hover:text-red-500"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
          
          {(!preferences?.preferred_areas || preferences.preferred_areas.length === 0) && (
            <p className="text-sm text-gray-500">ยังไม่ได้เลือกพื้นที่ที่สนใจ</p>
          )}
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Bell className="mr-2 h-5 w-5" />
            การตั้งค่าการแจ้งเตือน
          </CardTitle>
          <CardDescription>
            เลือกประเภทภัยพิบัติที่ต้องการรับการแจ้งเตือน
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="earthquakes" className="text-sm font-medium">
                  แผ่นดินไหว
                </Label>
                <p className="text-sm text-gray-500">รับแจ้งเตือนเมื่อมีแผ่นดินไหว</p>
              </div>
              <Switch
                id="earthquakes"
                checked={preferences?.notification_settings?.earthquakes || false}
                onCheckedChange={(checked) => handleNotificationChange('earthquakes', checked)}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="floods" className="text-sm font-medium">
                  น้ำท่วม
                </Label>
                <p className="text-sm text-gray-500">รับแจ้งเตือนเมื่อมีน้ำท่วม</p>
              </div>
              <Switch
                id="floods"
                checked={preferences?.notification_settings?.floods || false}
                onCheckedChange={(checked) => handleNotificationChange('floods', checked)}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="wildfires" className="text-sm font-medium">
                  ไฟป่า
                </Label>
                <p className="text-sm text-gray-500">รับแจ้งเตือนเมื่อมีไฟป่า</p>
              </div>
              <Switch
                id="wildfires"
                checked={preferences?.notification_settings?.wildfires || false}
                onCheckedChange={(checked) => handleNotificationChange('wildfires', checked)}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="airPollution" className="text-sm font-medium">
                  มลพิษอากาศ
                </Label>
                <p className="text-sm text-gray-500">รับแจ้งเตือนเมื่อมีมลพิษอากาศ</p>
              </div>
              <Switch
                id="airPollution"
                checked={preferences?.notification_settings?.airPollution || false}
                onCheckedChange={(checked) => handleNotificationChange('airPollution', checked)}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserPreferencesSettings;
