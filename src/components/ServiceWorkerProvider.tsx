
import React from 'react';
import { useServiceWorker } from '@/hooks/useServiceWorker';

interface ServiceWorkerProviderProps {
  children: React.ReactNode;
}

const ServiceWorkerProvider: React.FC<ServiceWorkerProviderProps> = ({ children }) => {
  // Initialize service worker only after React is ready
  useServiceWorker();
  
  return <>{children}</>;
};

export default ServiceWorkerProvider;
