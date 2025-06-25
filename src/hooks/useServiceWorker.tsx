
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
                    action: (
                      <button 
                        onClick={() => window.location.reload()}
                        className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
                      >
                        รีเฟรช
                      </button>
                    )
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
          action: (
            <button 
              onClick={() => {
                (e as any).prompt();
              }}
              className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
            >
              ติดตั้ง
            </button>
          )
        });
      });
    }
  };

  useEffect(() => {
    installPrompt();
  }, []);
};
