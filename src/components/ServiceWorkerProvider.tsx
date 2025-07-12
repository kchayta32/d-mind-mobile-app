import { useEffect } from 'react';
import { useServiceWorker } from '@/hooks/useServiceWorker';

interface ServiceWorkerProviderProps {
  children: React.ReactNode;
}

const ServiceWorkerProvider = ({ children }: ServiceWorkerProviderProps) => {
  useServiceWorker();
  
  return <>{children}</>;
};

export default ServiceWorkerProvider;