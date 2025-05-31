
import React, { useEffect, useState } from 'react';
import { Progress } from '@/components/ui/progress';

const LoadingScreen = ({ onComplete }: { onComplete: () => void }) => {
  const [progress, setProgress] = useState(0);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      if (progress < 100) {
        setProgress(prev => {
          const newProgress = prev + 8;
          if (newProgress >= 100) {
            setTimeout(() => onComplete(), 500);
            return 100;
          }
          return newProgress;
        });
      }
    }, 200);
    
    return () => clearTimeout(timer);
  }, [progress, onComplete]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 flex flex-col items-center justify-center relative overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-20 left-20 w-32 h-32 bg-blue-400 rounded-full blur-xl"></div>
        <div className="absolute bottom-20 right-20 w-40 h-40 bg-blue-500 rounded-full blur-2xl"></div>
        <div className="absolute top-1/2 left-1/4 w-24 h-24 bg-blue-300 rounded-full blur-lg"></div>
      </div>
      
      <div className="flex flex-col items-center gap-8 z-10">
        {/* App Icon with enhanced styling */}
        <div className="relative">
          <div className="absolute -inset-4 bg-gradient-to-br from-blue-400 to-blue-600 rounded-3xl blur-lg opacity-30 animate-pulse"></div>
          <div className="relative bg-gradient-to-br from-blue-500 to-blue-700 p-6 rounded-3xl shadow-2xl">
            <img 
              src="/lovable-uploads/b5550bd4-d83d-4e1e-ac09-025117b87c86.png" 
              alt="D-MIND Logo" 
              className="h-20 w-20 drop-shadow-lg"
            />
          </div>
        </div>
        
        {/* App Name */}
        <div className="text-center">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent mb-2">
            D-MIND
          </h1>
          <p className="text-blue-600/70 text-lg font-medium">
            ระบบจัดการเหตุการณ์ภาวะฉุกเฉิน
          </p>
        </div>
        
        {/* Loading indicator */}
        <div className="text-blue-600/80 text-lg font-medium">
          กำลังโหลด...
        </div>
        
        {/* Progress bar */}
        <div className="w-80 mt-4">
          <Progress 
            value={progress} 
            className="h-3 bg-blue-100 border border-blue-200" 
          />
          <div className="text-center mt-3 text-blue-500 text-sm font-medium">
            {progress}%
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;
