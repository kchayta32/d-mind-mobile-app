
import { useState } from 'react';
import { AlertsFilterState } from './types';
import { useSharedDisasterAlerts } from '@/hooks/useSharedDisasterAlerts';

export const useDisasterAlerts = () => {
  const [filters, setFilters] = useState<AlertsFilterState>({
    types: [],
    severity: [],
    activeOnly: true,
    earthquakeMagnitude: [0],
    rainIntensity: [0],
    floodLevel: [0]
  });

  const { alerts: allAlerts, isLoading, error, refetch } = useSharedDisasterAlerts();

  // Apply filters
  let filteredAlerts = allAlerts;

  if (filters.activeOnly) {
    filteredAlerts = filteredAlerts.filter(alert => alert.is_active);
  }

  if (filters.types.length > 0) {
    filteredAlerts = filteredAlerts.filter(alert => filters.types.includes(alert.type));
  }

  if (filters.severity.length > 0) {
    filteredAlerts = filteredAlerts.filter(alert => filters.severity.includes(alert.severity));
  }

  // Apply advanced filters
  if (filters.earthquakeMagnitude && filters.earthquakeMagnitude[0] > 0) {
    filteredAlerts = filteredAlerts.filter(alert => 
      alert.type === 'earthquake' && 
      alert.magnitude && 
      alert.magnitude >= filters.earthquakeMagnitude![0]
    );
  }

  if (filters.rainIntensity && filters.rainIntensity[0] > 0) {
    filteredAlerts = filteredAlerts.filter(alert => 
      alert.type === 'heavyrain' && 
      alert.rain_intensity && 
      alert.rain_intensity >= filters.rainIntensity![0]
    );
  }

  if (filters.floodLevel && filters.floodLevel[0] > 0) {
    filteredAlerts = filteredAlerts.filter(alert => 
      alert.type === 'flood' && 
      alert.flood_level && 
      alert.flood_level >= filters.floodLevel![0]
    );
  }

  const alertTypes = [...new Set(allAlerts.map(alert => alert.type))];
  const severityLevels = [...new Set(allAlerts.map(alert => alert.severity))];

  const updateFilters = (newFilters: Partial<AlertsFilterState>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  return {
    alerts: filteredAlerts,
    isLoading,
    error,
    filters,
    updateFilters,
    refetch,
    alertTypes,
    severityLevels
  };
};
