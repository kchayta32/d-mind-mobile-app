
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface SharedDisasterData {
  id?: string;
  user_id: string;
  disaster_type: string;
  data: any;
  location: {
    lat: number;
    lng: number;
    address?: string;
  };
  shared_with: string[];
  is_public: boolean;
  expires_at?: string;
  created_at?: string;
}

export const useSharedDisasterData = () => {
  const [sharedData, setSharedData] = useState<SharedDisasterData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const loadSharedData = async () => {
    try {
      const { data, error } = await supabase
        .from('shared_disaster_data')
        .select('*')
        .or('is_public.eq.true,user_id.eq.' + (await supabase.auth.getUser()).data.user?.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading shared data:', error);
        return;
      }

      setSharedData(data || []);
    } catch (error) {
      console.error('Error in loadSharedData:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const shareDisasterData = async (dataToShare: Omit<SharedDisasterData, 'id' | 'user_id' | 'created_at'>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "ต้องเข้าสู่ระบบ",
          description: "กรุณาเข้าสู่ระบบเพื่อแชร์ข้อมูล",
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase
        .from('shared_disaster_data')
        .insert({
          ...dataToShare,
          user_id: user.id,
        });

      if (error) {
        console.error('Error sharing data:', error);
        toast({
          title: "เกิดข้อผิดพลาด",
          description: "ไม่สามารถแชร์ข้อมูลได้",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "แชร์สำเร็จ",
        description: "ข้อมูลภัยพิบัติได้ถูกแชร์เรียบร้อยแล้ว",
      });

      loadSharedData();
    } catch (error) {
      console.error('Error in shareDisasterData:', error);
    }
  };

  const deleteSharedData = async (id: string) => {
    try {
      const { error } = await supabase
        .from('shared_disaster_data')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting shared data:', error);
        toast({
          title: "เกิดข้อผิดพลาด",
          description: "ไม่สามารถลบข้อมูลได้",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "ลบสำเร็จ",
        description: "ข้อมูลได้ถูกลบเรียบร้อยแล้ว",
      });

      loadSharedData();
    } catch (error) {
      console.error('Error in deleteSharedData:', error);
    }
  };

  useEffect(() => {
    loadSharedData();
  }, []);

  return {
    sharedData,
    isLoading,
    shareDisasterData,
    deleteSharedData,
    loadSharedData
  };
};
