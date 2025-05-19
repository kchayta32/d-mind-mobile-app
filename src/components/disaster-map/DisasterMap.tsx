
import React from 'react';
import 'leaflet/dist/leaflet.css';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import MapView from './MapView';
import FilterControls from './FilterControls';
import { useEarthquakeData } from './useEarthquakeData';

const DisasterMap: React.FC = () => {
  const {
    filteredEarthquakes,
    magnitudeFilter,
    setMagnitudeFilter,
    timeFilter,
    setTimeFilter,
    refreshing,
    error,
    fetchEarthquakeData
  } = useEarthquakeData();

  // Handle manual refresh button click
  const handleRefresh = () => {
    fetchEarthquakeData();
  };

  return (
    <Card className="mb-6">
      <CardHeader className="flex flex-row items-center justify-between py-3">
        <CardTitle className="text-lg">Disaster Map</CardTitle>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={handleRefresh}
          disabled={refreshing}
        >
          <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
        </Button>
      </CardHeader>
      <CardContent className="p-0 pb-4">
        <div className="relative h-64 sm:h-72 md:h-80 w-full border-b">
          <MapView 
            error={error}
            filteredEarthquakes={filteredEarthquakes}
            handleRefresh={handleRefresh}
          />
        </div>

        <FilterControls
          magnitudeFilter={magnitudeFilter}
          setMagnitudeFilter={setMagnitudeFilter}
          timeFilter={timeFilter}
          setTimeFilter={setTimeFilter}
          filteredCount={filteredEarthquakes.length}
        />
      </CardContent>
    </Card>
  );
};

export default DisasterMap;
