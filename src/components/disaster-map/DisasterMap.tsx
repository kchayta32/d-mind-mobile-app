
import React, { useState } from 'react';
import DisasterTypeSelector from './DisasterTypeSelector';
import { LocationSearch } from './LocationSearch';
import { DisasterMapContent } from './DisasterMapContent';

export type DisasterType = 'earthquake' | 'heavyrain' | 'openmeteorain' | 'wildfire' | 'airpollution' | 'drought' | 'flood' | 'storm';

const DisasterMap: React.FC = () => {
  const [selectedType, setSelectedType] = useState<DisasterType>('wildfire');
  const [mapRef, setMapRef] = useState<any>(null);

  const handleLocationSelect = (lat: number, lon: number, name: string) => {
    if (mapRef) {
      mapRef.setView([lat, lon], 12);
      console.log(`Navigated to: ${name} (${lat}, ${lon})`);
    }
  };

  return (
    <div className="h-full flex flex-col space-y-4">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <DisasterTypeSelector 
          selectedType={selectedType} 
          onTypeChange={setSelectedType}
        />
        
        {/* Location Search */}
        <div className="flex justify-end">
          <LocationSearch 
            onLocationSelect={handleLocationSelect}
            className="w-full sm:w-auto"
          />
        </div>
      </div>
      
      {/* Main Content */}
      <DisasterMapContent
        selectedType={selectedType}
        onTypeChange={setSelectedType}
        onLocationSelect={handleLocationSelect}
      />
    </div>
  );
};

export default DisasterMap;
