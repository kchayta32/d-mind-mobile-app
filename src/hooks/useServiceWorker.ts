
import { useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

export const useServiceWorker = () => {
  const { toast } = useToast();

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('SW registered: ', registration);
          
          // Check for updates
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  toast({
                    title: "อัปเดตใหม่พร้อมใช้งาน",
                    description: "รีเฟรชหน้าเพื่อใช้เวอร์ชันล่าสุด",
                    action: {
                      altText: "รีเฟรช",
                      onClick: () => window.location.reload()
                    }
                  });
                }
              });
            }
          });
        })
        .catch((error) => {
          console.log('SW registration failed: ', error);
        });
    }
  }, [toast]);

  const installPrompt = () => {
    if ('beforeinstallprompt' in window) {
      window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        toast({
          title: "ติดตั้งแอป D-MIND",
          description: "เพิ่มไปยังหน้าจอหลักเพื่อเข้าถึงได้ง่ายขึ้น",
          action: {
            altText: "ติดตั้ง",
            onClick: () => {
              (e as any).prompt();
            }
          }
        });
      });
    }
  };

  useEffect(() => {
    installPrompt();
  }, []);
};
