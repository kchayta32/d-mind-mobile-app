
import React, { useState, useEffect } from 'react';

interface AppLoaderProps {
  children: React.ReactNode;
}

const AppLoader: React.FC<AppLoaderProps> = ({ children }) => {
  const [isReactReady, setIsReactReady] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);

  useEffect(() => {
    let mounted = true;
    
    const checkReactReadiness = () => {
      try {
        // More comprehensive React readiness check
        if (
          typeof React !== 'undefined' &&
          React &&
          React.useState &&
          React.useEffect &&
          React.useContext &&
          React.useLayoutEffect &&
          React.createElement &&
          React.Component &&
          // Check if we can actually create a hook
          typeof React.useState === 'function'
        ) {
          console.log('React is fully ready');
          return true;
        }
        return false;
      } catch (error) {
        console.error('Error checking React readiness:', error);
        return false;
      }
    };

    const initializeApp = async () => {
      // Simulate loading progress
      const progressSteps = [10, 30, 50, 70, 90, 100];
      
      for (let i = 0; i < progressSteps.length; i++) {
        if (!mounted) return;
        
        setLoadingProgress(progressSteps[i]);
        
        // Wait between progress updates
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Check React readiness at each step
        if (progressSteps[i] >= 70 && checkReactReadiness()) {
          if (mounted) {
            setLoadingProgress(100);
            // Give a brief moment for everything to settle
            setTimeout(() => {
              if (mounted) {
                setIsReactReady(true);
              }
            }, 200);
          }
          return;
        }
      }
      
      // If we get here, force proceed after timeout
      if (mounted) {
        console.warn('React readiness check completed with timeout');
        setIsReactReady(true);
      }
    };

    // Start initialization
    initializeApp();

    return () => {
      mounted = false;
    };
  }, []);

  if (!isReactReady) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 flex flex-col items-center justify-center">
        <div className="flex flex-col items-center gap-6">
          <div className="relative">
            <div className="absolute -inset-4 bg-gradient-to-br from-blue-400 to-blue-600 rounded-3xl blur-lg opacity-30 animate-pulse"></div>
            <div className="relative bg-gradient-to-br from-blue-500 to-blue-700 p-6 rounded-3xl shadow-2xl">
              <img 
                src="/lovable-uploads/b5550bd4-d83d-4e1e-ac09-025117b87c86.png" 
                alt="D-MIND Logo" 
                className="h-16 w-16 drop-shadow-lg"
              />
            </div>
          </div>
          
          <div className="text-center">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent mb-2">
              D-MIND
            </h1>
            <p className="text-blue-600/70 text-lg">กำลังเริ่มต้นระบบ...</p>
          </div>
          
          {/* Progress bar */}
          <div className="w-64 mt-4">
            <div className="h-2 w-full bg-blue-100 border border-blue-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-300 ease-out"
                style={{ width: `${loadingProgress}%` }}
              />
            </div>
            <div className="text-center mt-2 text-blue-500 text-sm font-medium">
              {loadingProgress}%
            </div>
          </div>
          
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default AppLoader;
