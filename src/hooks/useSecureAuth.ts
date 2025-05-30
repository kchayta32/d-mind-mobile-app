
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';
import { useToast } from '@/components/ui/use-toast';
import { handleSecureError } from '@/utils/security';

export const useSecureAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          console.error('Session error:', error);
        } else {
          setUser(session?.user ?? null);
        }
      } catch (error) {
        console.error('Failed to get session:', error);
      } finally {
        setLoading(false);
      }
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null);
        setLoading(false);

        if (event === 'SIGNED_OUT') {
          toast({
            title: "ออกจากระบบแล้ว",
            description: "คุณได้ออกจากระบบเรียบร้อยแล้ว",
          });
        } else if (event === 'SIGNED_IN') {
          toast({
            title: "เข้าสู่ระบบสำเร็จ",
            description: "ยินดีต้อนรับ!",
          });
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [toast]);

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error) {
      const errorMessage = handleSecureError(error);
      toast({
        title: "เกิดข้อผิดพลาดในการออกจากระบบ",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const requireAuth = (): boolean => {
    if (!user) {
      toast({
        title: "ต้องเข้าสู่ระบบ",
        description: "กรุณาเข้าสู่ระบบเพื่อใช้งานฟีเจอร์นี้",
        variant: "destructive",
      });
      return false;
    }
    return true;
  };

  return {
    user,
    loading,
    signOut,
    requireAuth,
    isAuthenticated: !!user
  };
};
