
import { useState, useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';

interface AdminAuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
}

export const useAdminAuth = () => {
  const [authState, setAuthState] = useState<AdminAuthState>({
    isAuthenticated: false,
    isLoading: true
  });
  const { toast } = useToast();

  useEffect(() => {
    // Check if admin is already logged in
    const isAdminLoggedIn = localStorage.getItem('admin_authenticated') === 'true';
    setAuthState({
      isAuthenticated: isAdminLoggedIn,
      isLoading: false
    });
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    // Simple authentication check
    if (username === 'admindmind' && password === '1212312121!') {
      localStorage.setItem('admin_authenticated', 'true');
      setAuthState({
        isAuthenticated: true,
        isLoading: false
      });
      toast({
        title: "เข้าสู่ระบบสำเร็จ",
        description: "ยินดีต้อนรับสู่ระบบแอดมิน",
      });
      return true;
    } else {
      toast({
        title: "เข้าสู่ระบบไม่สำเร็จ",
        description: "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง",
        variant: "destructive",
      });
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('admin_authenticated');
    setAuthState({
      isAuthenticated: false,
      isLoading: false
    });
    toast({
      title: "ออกจากระบบแล้ว",
      description: "คุณได้ออกจากระบบแอดมินแล้ว",
    });
  };

  return {
    ...authState,
    login,
    logout
  };
};
