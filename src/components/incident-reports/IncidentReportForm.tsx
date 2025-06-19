
import React, { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Camera, MapPin, Upload, AlertTriangle, Phone } from 'lucide-react';

interface IncidentData {
  type: string;
  title: string;
  description: string;
  location: string;
  coordinates: { lat: number; lng: number } | null;
  severity: number;
  contact_info: string;
  images: File[];
}

const IncidentReportForm: React.FC = () => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<IncidentData>({
    type: '',
    title: '',
    description: '',
    location: '',
    coordinates: null,
    severity: 3,
    contact_info: '',
    images: []
  });

  const incidentTypes = [
    { value: 'earthquake', label: 'แผ่นดินไหว', icon: '🏢' },
    { value: 'flood', label: 'น้ำท่วม', icon: '🌊' },
    { value: 'wildfire', label: 'ไฟป่า', icon: '🔥' },
    { value: 'landslide', label: 'ดินถลม', icon: '⛰️' },
    { value: 'storm', label: 'พายุ', icon: '🌪️' },
    { value: 'accident', label: 'อุบัติเหตุ', icon: '🚗' },
    { value: 'other', label: 'อื่นๆ', icon: '⚠️' }
  ];

  const severityLevels = [
    { value: 1, label: 'ต่ำ', color: 'bg-green-500' },
    { value: 2, label: 'ปานกลาง', color: 'bg-yellow-500' },
    { value: 3, label: 'สูง', color: 'bg-orange-500' },
    { value: 4, label: 'วิกฤติ', color: 'bg-red-500' },
    { value: 5, label: 'ภัยฉุกเฉิน', color: 'bg-red-700' }
  ];

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData(prev => ({
            ...prev,
            coordinates: {
              lat: position.coords.latitude,
              lng: position.coords.longitude
            }
          }));
          toast({
            title: "ระบุตำแหน่งสำเร็จ",
            description: "ข้อมูลตำแหน่งถูกบันทึกแล้ว",
          });
        },
        (error) => {
          console.error('Error getting location:', error);
          toast({
            title: "ไม่สามารถระบุตำแหน่งได้",
            description: "กรุณาใส่ข้อมูลตำแหน่งด้วยตนเอง",
            variant: "destructive",
          });
        }
      );
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length + formData.images.length > 5) {
      toast({
        title: "ไม่สามารถอัพโหลดได้",
        description: "สามารถอัพโหลดได้สูงสุด 5 รูป",
        variant: "destructive",
      });
      return;
    }
    
    setFormData(prev => ({
      ...prev,
      images: [...prev.images, ...files]
    }));
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.type || !formData.title || !formData.description) {
      toast({
        title: "ข้อมูลไม่ครบถ้วน",
        description: "กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Upload images first
      const imageUrls: string[] = [];
      for (const image of formData.images) {
        const fileExt = image.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36)}.${fileExt}`;
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('incident-images')
          .upload(fileName, image);

        if (uploadError) throw uploadError;
        
        const { data: urlData } = supabase.storage
          .from('incident-images')
          .getPublicUrl(uploadData.path);
          
        imageUrls.push(urlData.publicUrl);
      }

      // Submit incident report
      const { data, error } = await supabase
        .from('incident_reports')
        .insert({
          type: formData.type,
          title: formData.title,
          description: formData.description,
          location: formData.location,
          coordinates: formData.coordinates,
          severity_level: formData.severity,
          contact_info: formData.contact_info,
          image_urls: imageUrls,
          status: 'pending',
          is_verified: false
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "รายงานสำเร็จ",
        description: "ขอบคุณสำหรับการรายงานเหตุการณ์ ข้อมูลจะถูกส่งไปยังหน่วยงานที่เกี่ยวข้อง",
      });

      // Reset form
      setFormData({
        type: '',
        title: '',
        description: '',
        location: '',
        coordinates: null,
        severity: 3,
        contact_info: '',
        images: []
      });

    } catch (error) {
      console.error('Error submitting report:', error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถส่งรายงานได้ กรุณาลองอีกครั้ง",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-red-500" />
          รายงานเหตุการณ์ภัยพิบัติ
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Incident Type */}
          <div className="space-y-2">
            <Label htmlFor="type">ประเภทเหตุการณ์ *</Label>
            <Select value={formData.type} onValueChange={(value) => setFormData(prev => ({ ...prev, type: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="เลือกประเภทเหตุการณ์" />
              </SelectTrigger>
              <SelectContent>
                {incidentTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    <span className="flex items-center gap-2">
                      <span>{type.icon}</span>
                      {type.label}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">หัวข้อเหตุการณ์ *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="เช่น น้ำท่วมถนนสุขุมวิท..."
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">รายละเอียดเหตุการณ์ *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="อธิบายสถานการณ์, ผลกระทบ, และสิ่งที่เห็น..."
              rows={4}
            />
          </div>

          {/* Location */}
          <div className="space-y-2">
            <Label htmlFor="location">ตำแหน่งที่เกิดเหตุ</Label>
            <div className="flex gap-2">
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                placeholder="ที่อยู่หรือชื่อสถานที่"
                className="flex-1"
              />
              <Button
                type="button"
                variant="outline"
                onClick={getCurrentLocation}
                className="px-3"
              >
                <MapPin className="h-4 w-4" />
              </Button>
            </div>
            {formData.coordinates && (
              <p className="text-sm text-gray-500">
                พิกัด: {formData.coordinates.lat.toFixed(6)}, {formData.coordinates.lng.toFixed(6)}
              </p>
            )}
          </div>

          {/* Severity Level */}
          <div className="space-y-2">
            <Label>ระดับความรุนแรง</Label>
            <div className="flex flex-wrap gap-2">
              {severityLevels.map((level) => (
                <button
                  key={level.value}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, severity: level.value }))}
                  className={`px-3 py-1 rounded-full text-white text-sm ${
                    formData.severity === level.value ? level.color : 'bg-gray-300'
                  }`}
                >
                  {level.label}
                </button>
              ))}
            </div>
          </div>

          {/* Contact Info */}
          <div className="space-y-2">
            <Label htmlFor="contact">ข้อมูลติดต่อ (ไม่บังคับ)</Label>
            <Input
              id="contact"
              value={formData.contact_info}
              onChange={(e) => setFormData(prev => ({ ...prev, contact_info: e.target.value }))}
              placeholder="เบอร์โทรหรือ Line ID"
            />
          </div>

          {/* Image Upload */}
          <div className="space-y-2">
            <Label>รูปภาพประกอบ (สูงสุด 5 รูป)</Label>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => document.getElementById('image-upload')?.click()}
                className="flex items-center gap-2"
              >
                <Camera className="h-4 w-4" />
                เลือกรูปภาพ
              </Button>
              <input
                id="image-upload"
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
                className="hidden"
              />
            </div>
            
            {formData.images.length > 0 && (
              <div className="grid grid-cols-2 gap-2 mt-2">
                {formData.images.map((image, index) => (
                  <div key={index} className="relative">
                    <img
                      src={URL.createObjectURL(image)}
                      alt={`Upload ${index + 1}`}
                      className="w-full h-24 object-cover rounded border"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="absolute top-1 right-1 h-6 w-6 p-0"
                      onClick={() => removeImage(index)}
                    >
                      ×
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-red-600 hover:bg-red-700"
          >
            {isSubmitting ? (
              <>
                <Upload className="mr-2 h-4 w-4 animate-spin" />
                กำลังส่งรายงาน...
              </>
            ) : (
              <>
                <AlertTriangle className="mr-2 h-4 w-4" />
                ส่งรายงานเหตุการณ์
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default IncidentReportForm;
