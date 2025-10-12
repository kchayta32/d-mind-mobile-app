import React, { useEffect, useLayoutEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useIsMobile } from '@/hooks/use-mobile';
import { useOfflineMode } from '@/hooks/useOfflineMode';
import { useNotifications } from '@/hooks/useNotifications';
import NewMobileLayout from '@/components/home/NewMobileLayout';
import NewDesktopLayout from '@/components/home/NewDesktopLayout';
import ErrorBoundary from '@/components/ErrorBoundary';

const Index = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { isOnline, cacheData } = useOfflineMode();
  const { requestPermission } = useNotifications();

  // Prevent auto-scroll with useLayoutEffect for immediate execution
  useLayoutEffect(() => {
    // Force scroll to top immediately
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
    
    // Prevent any scroll restoration
    if ('scrollRestoration' in history) {
      history.scrollRestoration = 'manual';
    }
  }, []);

  // Additional scroll prevention with useEffect
  useEffect(() => {
    const preventAutoScroll = () => {
      window.scrollTo(0, 0);
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    };

    // Multiple prevention methods
    preventAutoScroll();
    
    const timeoutId = setTimeout(preventAutoScroll, 0);
    const intervalId = setInterval(preventAutoScroll, 100);
    
    // Stop the interval after 1 second
    const stopInterval = setTimeout(() => {
      clearInterval(intervalId);
    }, 1000);

    return () => {
      clearTimeout(timeoutId);
      clearInterval(intervalId);
      clearTimeout(stopInterval);
    };
  }, []);

  // Request notification permission immediately on first load
  useEffect(() => {
    const hasRequestedPermission = localStorage.getItem('dmind-notification-requested');
    if (!hasRequestedPermission) {
      // Request permission immediately when app loads
      setTimeout(() => {
        requestPermission();
        localStorage.setItem('dmind-notification-requested', 'true');
      }, 1000); // Reduced from 3000 to 1000ms
    }
  }, [requestPermission]);

  if (isMobile) {
    return (
      <ErrorBoundary>
        <NewMobileLayout />
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary>
      <NewDesktopLayout />
    </ErrorBoundary>
  );
};

export default Index;
