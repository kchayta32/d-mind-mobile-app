
import React, { useEffect, useState } from 'react';
import { Progress } from '@/components/ui/progress';
import { Circle } from 'lucide-react';

const LoadingScreen = ({ onComplete }: { onComplete: () => void }) => {
  const [progress, setProgress] = useState(0);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      if (progress < 100) {
        setProgress(prev => {
          const newProgress = prev + 10;
          if (newProgress >= 100) {
            onComplete();
            return 100;
          }
          return newProgress;
        });
      }
    }, 300);
    
    return () => clearTimeout(timer);
  }, [progress, onComplete]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-400 to-blue-600 flex flex-col items-center justify-center">
      <div className="flex flex-col items-center gap-6">
        <Circle className="h-24 w-24 text-white/80 stroke-[1.5]" />
        
        <h1 className="text-3xl font-bold text-white">
          D-MIND
        </h1>
        
        <div className="text-xl text-white/80">
          กำลังโหลด...
        </div>
        
        <div className="w-64 mt-2">
          <Progress value={progress} className="h-2" />
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;
