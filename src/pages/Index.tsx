import React, { useEffect } from 'react';
import { useNotifications } from '@/hooks/useNotifications';
import MobileHome from '@/components/home/MobileHome';

const Index = () => {
  const { requestPermission } = useNotifications();

  useEffect(() => {
    // Request permission on mount
    const hasRequestedPermission = localStorage.getItem('dmind-notification-requested');
    if (!hasRequestedPermission) {
      setTimeout(() => {
        requestPermission();
        localStorage.setItem('dmind-notification-requested', 'true');
      }, 1000);
    }
  }, [requestPermission]);

  return <MobileHome />;
};

export default Index;
