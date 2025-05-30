
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { sanitizeText, validateCoordinates, approximateLocation, handleSecureError, LocationPrivacyOptions } from '@/utils/security';
import { Loader2, MapPin } from 'lucide-react';

interface VictimReportFormData {
  name: string;
  contact: string;
  description: string;
  coordinates: { lat: number; lng: number } | null;
  privacyOptions: LocationPrivacyOptions;
}

const SecureVictimReportForm: React.FC = () => {
  const [formData, setFormData] = useState<VictimReportFormData>({
    name: '',
    contact: '',
    description: '',
    coordinates: null,
    privacyOptions: {
      useExactLocation: false,
      approximationRadius: 1000
    }
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const { toast } = useToast();

  const getCurrentLocation = () => {
    setIsGettingLocation(true);
    
    if (!navigator.geolocation) {
      toast({
        title: "ข้อผิดพลาด",
        description: "เบราว์เซอร์ของคุณไม่รองรับการระบุตำแหน่ง",
        variant: "destructive",
      });
      setIsGettingLocation(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        
        if (validateCoordinates(latitude, longitude)) {
          setFormData(prev => ({
            ...prev,
            coordinates: { lat: latitude, lng: longitude }
          }));
          
          toast({
            title: "สำเร็จ",
            description: "ได้รับตำแหน่งปัจจุบันแล้ว",
          });
        } else {
          toast({
            title: "ข้อผิดพลาด",
            description: "ตำแหน่งที่ได้รับไม่ถูกต้อง",
            variant: "destructive",
          });
        }
        setIsGettingLocation(false);
      },
      () => {
        toast({
          title: "ข้อผิดพลาด",
          description: "ไม่สามารถดึงตำแหน่งได้ กรุณาอนุญาตการเข้าถึงตำแหน่ง",
          variant: "destructive",
        });
        setIsGettingLocation(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000
      }
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isSubmitting) return;
    
    try {
      setIsSubmitting(true);
      
      // Check authentication
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "ต้องเข้าสู่ระบบ",
          description: "กรุณาเข้าสู่ระบบก่อนส่งรายงาน",
          variant: "destructive",
        });
        return;
      }

      // Validate required fields
      if (!formData.name.trim() || !formData.contact.trim()) {
        toast({
          title: "ข้อมูลไม่ครบถ้วน",
          description: "กรุณากรอกชื่อและข้อมูลติดต่อ",
          variant: "destructive",
        });
        return;
      }

      if (!formData.coordinates) {
        toast({
          title: "ขาดตำแหน่งที่ตั้ง",
          description: "กรุณาระบุตำแหน่งที่ตั้ง",
          variant: "destructive",
        });
        return;
      }

      // Sanitize inputs
      const sanitizedData = {
        name: sanitizeText(formData.name, 100),
        contact: sanitizeText(formData.contact, 200),
        description: sanitizeText(formData.description, 1000),
        coordinates: formData.privacyOptions.useExactLocation 
          ? formData.coordinates
          : approximateLocation(
              formData.coordinates.lat, 
              formData.coordinates.lng, 
              formData.privacyOptions.approximationRadius
            ),
        status: 'รอการตรวจสอบ',
        user_id: user.id
      };

      // Validate coordinates one more time
      if (!validateCoordinates(sanitizedData.coordinates.lat, sanitizedData.coordinates.lng)) {
        toast({
          title: "ข้อผิดพลาด",
          description: "ตำแหน่งที่ระบุไม่ถูกต้อง",
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase
        .from('victim_reports')
        .insert([sanitizedData]);

      if (error) {
        throw error;
      }

      toast({
        title: "ส่งรายงานสำเร็จ",
        description: "ได้รับรายงานของคุณแล้ว เจ้าหน้าที่จะติดต่อกลับโดยเร็ว",
      });

      // Reset form
      setFormData({
        name: '',
        contact: '',
        description: '',
        coordinates: null,
        privacyOptions: {
          useExactLocation: false,
          approximationRadius: 1000
        }
      });

    } catch (error) {
      const errorMessage = handleSecureError(error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-center text-lg">รายงานผู้ประสบภัย</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">ชื่อ-นามสกุล *</Label>
            <Input
              id="name"
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="ระบุชื่อ-นามสกุล"
              maxLength={100}
              required
            />
          </div>

          <div>
            <Label htmlFor="contact">ข้อมูลติดต่อ *</Label>
            <Input
              id="contact"
              type="text"
              value={formData.contact}
              onChange={(e) => setFormData(prev => ({ ...prev, contact: e.target.value }))}
              placeholder="เบอร์โทรศัพท์หรืออีเมล"
              maxLength={200}
              required
            />
          </div>

          <div>
            <Label htmlFor="description">รายละเอียดเพิ่มเติม</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="อธิบายสถานการณ์หรือความต้องการความช่วยเหลือ"
              maxLength={1000}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label>ตำแหน่งที่ตั้ง *</Label>
            <Button
              type="button"
              variant="outline"
              onClick={getCurrentLocation}
              disabled={isGettingLocation}
              className="w-full"
            >
              {isGettingLocation ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <MapPin className="h-4 w-4 mr-2" />
              )}
              {isGettingLocation ? 'กำลังดึงตำแหน่ง...' : 'ดึงตำแหน่งปัจจุบัน'}
            </Button>
            
            {formData.coordinates && (
              <p className="text-sm text-gray-600">
                ตำแหน่ง: {formData.coordinates.lat.toFixed(6)}, {formData.coordinates.lng.toFixed(6)}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="exactLocation"
                checked={formData.privacyOptions.useExactLocation}
                onCheckedChange={(checked) => 
                  setFormData(prev => ({
                    ...prev,
                    privacyOptions: { ...prev.privacyOptions, useExactLocation: checked as boolean }
                  }))
                }
              />
              <Label htmlFor="exactLocation" className="text-sm">
                ใช้ตำแหน่งที่แน่นอน (ไม่แนะนำเพื่อความเป็นส่วนตัว)
              </Label>
            </div>
            
            {!formData.privacyOptions.useExactLocation && (
              <p className="text-xs text-gray-500">
                ตำแหน่งจะถูกปรับให้คลาดเคลื่อนประมาณ 1 กม. เพื่อปกป้องความเป็นส่วนตัว
              </p>
            )}
          </div>

          <Button 
            type="submit" 
            className="w-full" 
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                กำลังส่งรายงาน...
              </>
            ) : (
              'ส่งรายงาน'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default SecureVictimReportForm;
