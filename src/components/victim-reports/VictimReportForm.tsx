
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Loader2, MapPin } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';

// Form schema validation
const formSchema = z.object({
  name: z.string().min(2, { message: 'กรุณาระบุชื่อ (อย่างน้อย 2 ตัวอักษร)' }),
  status: z.string().min(1, { message: 'กรุณาเลือกสถานะ' }),
  description: z.string().optional(),
  contact: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

const VictimReportForm: React.FC = () => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [coordinates, setCoordinates] = useState<{ lat: number; lng: number } | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [showLocationDialog, setShowLocationDialog] = useState(false);

  // Initialize form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      status: '',
      description: '',
      contact: '',
    },
  });

  // Handle getting geolocation
  const handleGetLocation = () => {
    setIsGettingLocation(true);
    setLocationError(null);
    
    if (!navigator.geolocation) {
      setLocationError('อุปกรณ์ของท่านไม่รองรับการระบุตำแหน่ง');
      setIsGettingLocation(false);
      return;
    }
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setCoordinates({ lat: latitude, lng: longitude });
        setIsGettingLocation(false);
        setShowLocationDialog(false);
        
        toast({
          title: 'ระบุตำแหน่งสำเร็จ',
          description: `พิกัด: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
        });
      },
      (error) => {
        console.error('Geolocation error:', error);
        setLocationError('ไม่สามารถระบุตำแหน่งได้ กรุณาลองอีกครั้ง');
        setIsGettingLocation(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  // Check for geolocation support when component mounts
  useEffect(() => {
    if (!navigator.geolocation) {
      setLocationError('อุปกรณ์ของท่านไม่รองรับการระบุตำแหน่ง');
    }
  }, []);

  // Handle form submission
  const onSubmit = async (data: FormValues) => {
    if (!coordinates) {
      setShowLocationDialog(true);
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Submit to Supabase
      const { error } = await supabase
        .from('victim_reports')
        .insert([{
          name: data.name,
          status: data.status,
          description: data.description || null,
          contact: data.contact || null,
          coordinates: { 
            latitude: coordinates.lat, 
            longitude: coordinates.lng 
          },
        }]);

      if (error) {
        throw error;
      }

      // Show success toast
      toast({
        title: 'ส่งรายงานสำเร็จ',
        description: 'ข้อมูลของท่านได้รับการบันทึกแล้ว',
      });

      // Reset form
      form.reset();
      setCoordinates(null);

    } catch (error) {
      console.error('Error submitting report:', error);
      toast({
        title: 'เกิดข้อผิดพลาด',
        description: 'ไม่สามารถส่งรายงานได้ กรุณาลองอีกครั้งภายหลัง',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>ชื่อ-นามสกุล</FormLabel>
                <FormControl>
                  <Input placeholder="ระบุชื่อผู้ประสบภัย" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>สถานะ</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="เลือกสถานะ" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="ปลอดภัย">ปลอดภัย</SelectItem>
                    <SelectItem value="ต้องการความช่วยเหลือด่วน">ต้องการความช่วยเหลือด่วน</SelectItem>
                    <SelectItem value="มีบาดเจ็บ">มีบาดเจ็บ</SelectItem>
                    <SelectItem value="สูญหาย">สูญหาย</SelectItem>
                    <SelectItem value="ติดอยู่ในพื้นที่">ติดอยู่ในพื้นที่</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>รายละเอียดเพิ่มเติม</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="ระบุรายละเอียดเพิ่มเติม (ถ้ามี)" 
                    className="min-h-[100px]" 
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="contact"
            render={({ field }) => (
              <FormItem>
                <FormLabel>ช่องทางการติดต่อ</FormLabel>
                <FormControl>
                  <Input placeholder="เบอร์โทรศัพท์ หรือ ไลน์ไอดี" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="bg-gray-50 p-3 rounded-md border border-gray-200">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-sm font-medium">ตำแหน่งปัจจุบัน</h3>
                {coordinates ? (
                  <p className="text-sm text-green-600 mt-1">
                    <MapPin className="inline-block w-4 h-4 mr-1" />
                    {coordinates.lat.toFixed(6)}, {coordinates.lng.toFixed(6)}
                  </p>
                ) : (
                  <p className="text-sm text-gray-500 mt-1">กรุณากดรับตำแหน่งปัจจุบันเพื่อระบุตำแหน่ง</p>
                )}
              </div>
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleGetLocation}
                disabled={isGettingLocation}
              >
                {isGettingLocation ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> กำลังระบุตำแหน่ง</>
                ) : (
                  <>รับตำแหน่ง</>
                )}
              </Button>
            </div>
            {locationError && <p className="text-sm text-red-500 mt-1">{locationError}</p>}
          </div>

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> กำลังส่งข้อมูล...</>
            ) : (
              'ส่งรายงาน'
            )}
          </Button>
        </form>
      </Form>

      <Dialog open={showLocationDialog} onOpenChange={setShowLocationDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>กรุณาระบุตำแหน่ง</DialogTitle>
            <DialogDescription>
              ต้องระบุตำแหน่งปัจจุบันเพื่อสามารถส่งรายงานได้
            </DialogDescription>
          </DialogHeader>
          <Button onClick={handleGetLocation} disabled={isGettingLocation}>
            {isGettingLocation ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> กำลังระบุตำแหน่ง</>
            ) : (
              'ระบุตำแหน่งปัจจุบัน'
            )}
          </Button>
          {locationError && <p className="text-sm text-red-500 mt-1">{locationError}</p>}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default VictimReportForm;
