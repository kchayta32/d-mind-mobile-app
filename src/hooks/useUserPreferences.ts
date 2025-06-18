
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface UserPreferences {
  id?: string;
  user_id: string;
  preferred_areas: string[];
  notification_settings: {
    earthquakes: boolean;
    floods: boolean;
    wildfires: boolean;
    airPollution: boolean;
  };
}

export const useUserPreferences = () => {
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const loadPreferences = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading preferences:', error);
        return;
      }

      if (data) {
        setPreferences(data);
      } else {
        // Create default preferences
        const defaultPreferences = {
          user_id: user.id,
          preferred_areas: [],
          notification_settings: {
            earthquakes: true,
            floods: true,
            wildfires: true,
            airPollution: true,
          }
        };
        setPreferences(defaultPreferences);
      }
    } catch (error) {
      console.error('Error in loadPreferences:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const savePreferences = async (newPreferences: Partial<UserPreferences>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "ต้องเข้าสู่ระบบ",
          description: "กรุณาเข้าสู่ระบบเพื่อบันทึกการตั้งค่า",
          variant: "destructive",
        });
        return;
      }

      const updatedPreferences = { ...preferences, ...newPreferences, user_id: user.id };

      const { error } = await supabase
        .from('user_preferences')
        .upsert(updatedPreferences, { onConflict: 'user_id' });

      if (error) {
        console.error('Error saving preferences:', error);
        toast({
          title: "เกิดข้อผิดพลาด",
          description: "ไม่สามารถบันทึกการตั้งค่าได้",
          variant: "destructive",
        });
        return;
      }

      setPreferences(updatedPreferences);
      toast({
        title: "บันทึกเรียบร้อย",
        description: "การตั้งค่าได้ถูกบันทึกแล้ว",
      });
    } catch (error) {
      console.error('Error in savePreferences:', error);
    }
  };

  useEffect(() => {
    loadPreferences();
  }, []);

  return {
    preferences,
    isLoading,
    savePreferences,
    loadPreferences
  };
};
