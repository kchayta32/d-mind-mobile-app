
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

interface GeolocationState {
  coordinates: { lat: number; lng: number } | null;
  error: string | null;
  loading: boolean;
}

export const useGeolocation = () => {
  const [state, setState] = useState<GeolocationState>({
    coordinates: null,
    error: null,
    loading: true
  });
  const { toast } = useToast();

  useEffect(() => {
    if (!navigator.geolocation) {
      setState({
        coordinates: null,
        error: 'Geolocation is not supported',
        loading: false
      });
      return;
    }

    const handleSuccess = (position: GeolocationPosition) => {
      setState({
        coordinates: {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        },
        error: null,
        loading: false
      });
    };

    const handleError = (error: GeolocationPositionError) => {
      let errorMessage = 'Failed to get location';
      
      switch (error.code) {
        case error.PERMISSION_DENIED:
          errorMessage = 'Location access denied by user';
          break;
        case error.POSITION_UNAVAILABLE:
          errorMessage = 'Location information unavailable';
          break;
        case error.TIMEOUT:
          errorMessage = 'Location request timed out';
          break;
      }

      setState({
        coordinates: null,
        error: errorMessage,
        loading: false
      });

      toast({
        title: "ไม่สามารถระบุตำแหน่งได้",
        description: errorMessage,
        variant: "destructive",
      });
    };

    navigator.geolocation.getCurrentPosition(handleSuccess, handleError, {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 300000 // 5 minutes
    });
  }, [toast]);

  const refreshLocation = () => {
    setState(prev => ({ ...prev, loading: true }));
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setState({
          coordinates: {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          },
          error: null,
          loading: false
        });
      },
      (error) => {
        setState({
          coordinates: null,
          error: error.message,
          loading: false
        });
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0 // Force fresh location
      }
    );
  };

  return {
    ...state,
    refreshLocation
  };
};
