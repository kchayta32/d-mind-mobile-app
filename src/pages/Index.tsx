
import React, { useEffect, useLayoutEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useIsMobile } from '@/hooks/use-mobile';
import { useOfflineMode } from '@/hooks/useOfflineMode';
import { useNotifications } from '@/hooks/useNotifications';
import MobileHeader from '@/components/home/MobileHeader';
import MobileMainContent from '@/components/home/MobileMainContent';
import DesktopLayout from '@/components/home/DesktopLayout';
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

  const handleAssistantClick = () => {
    navigate('/assistant');
  };

  const handleManualClick = () => {
    navigate('/manual');
  };

  const handleContactsClick = () => {
    navigate('/contacts');
  };

  const handleAlertsClick = () => {
    navigate('/alerts');
  };
  
  const handleVictimReportsClick = () => {
    navigate('/victim-reports');
  };

  const handleIncidentReportsClick = () => {
    navigate('/incident-reports');
  };

  const handleLineClick = () => {
    window.open('https://line.me/R/ti/p/@307rcire', '_blank');
  };

  if (isMobile) {
    return (
      <ErrorBoundary>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100">
          <MobileHeader />
          <MobileMainContent
            onAssistantClick={handleAssistantClick}
            onManualClick={handleManualClick}
            onContactsClick={handleContactsClick}
            onAlertsClick={handleAlertsClick}
            onVictimReportsClick={handleVictimReportsClick}
            onIncidentReportsClick={handleIncidentReportsClick}
            onLineClick={handleLineClick}
          />
        </div>
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary>
      <DesktopLayout
        onAssistantClick={handleAssistantClick}
        onManualClick={handleManualClick}
        onContactsClick={handleContactsClick}
        onAlertsClick={handleAlertsClick}
        onVictimReportsClick={handleVictimReportsClick}
        onIncidentReportsClick={handleIncidentReportsClick}
      />
    </ErrorBoundary>
  );
};

export default Index;
