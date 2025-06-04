
import React, { useState } from 'react';
import { MapContainer, TileLayer } from 'react-leaflet';
import { Earthquake, RainSensor } from './types';
import { GISTDAHotspot } from './useGISTDAData';
import { RainViewerData } from './useRainViewerData';
import EarthquakeMarker from './EarthquakeMarker';
import RainSensorMarker from './RainSensorMarker';
import HotspotMarker from './HotspotMarker';
import RainOverlay from './RainOverlay';
import { DisasterType } from './DisasterMap';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import 'leaflet/dist/leaflet.css';

interface MapViewProps {
  earthquakes: Earthquake[];
  rainSensors: RainSensor[];
  hotspots: GISTDAHotspot[];
  rainData: RainViewerData | null;
  selectedType: DisasterType;
  magnitudeFilter: number;
  humidityFilter: number;
  isLoading: boolean;
}

export const MapView: React.FC<MapViewProps> = ({ 
  earthquakes, 
  rainSensors,
  hotspots,
  rainData,
  selectedType,
  magnitudeFilter,
  humidityFilter,
  isLoading 
}) => {
  const [rainOverlayType, setRainOverlayType] = useState<'radar' | 'satellite'>('radar');
  const [rainTimeType, setRainTimeType] = useState<'past' | 'future'>('past');
  const [showRainOverlay, setShowRainOverlay] = useState(false);

  console.log('MapView props:', { 
    earthquakes: earthquakes.length, 
    rainSensors: rainSensors.length,
    hotspots: hotspots.length,
    rainData: rainData ? 'loaded' : 'null',
    selectedType, 
    isLoading 
  });

  // Filter data based on current filters
  const filteredEarthquakes = earthquakes.filter(eq => eq.magnitude >= magnitudeFilter);
  const filteredRainSensors = rainSensors.filter(sensor => 
    (sensor.humidity || 0) >= humidityFilter
  );

  console.log('Filtered data:', { 
    filteredEarthquakes: filteredEarthquakes.length, 
    filteredRainSensors: filteredRainSensors.length,
    hotspots: hotspots.length
  });

  // Thailand center coordinates
  const center: [number, number] = [13.7563, 100.5018];

  const renderMarkers = () => {
    switch (selectedType) {
      case 'earthquake':
        console.log('Rendering earthquake markers:', filteredEarthquakes.length);
        return filteredEarthquakes.map((earthquake) => (
          <EarthquakeMarker key={earthquake.id} earthquake={earthquake} />
        ));
      
      case 'heavyrain':
        console.log('Rendering rain sensor markers:', filteredRainSensors.length);
        return filteredRainSensors.map((sensor) => (
          <RainSensorMarker key={`rain-sensor-${sensor.id}`} sensor={sensor} />
        ));
      
      case 'wildfire':
        console.log('Rendering hotspot markers:', hotspots.length);
        return hotspots.map((hotspot, index) => (
          <HotspotMarker key={`hotspot-${index}`} hotspot={hotspot} />
        ));
      
      default:
        return null;
    }
  };

  const renderComingSoon = () => {
    if (['flood', 'storm'].includes(selectedType)) {
      return (
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[1000]">
          <div className="bg-white p-8 rounded-lg shadow-lg text-center">
            <h3 className="text-xl font-bold mb-2">🚧 เร็วๆ นี้</h3>
            <p className="text-gray-600">
              แผนที่{selectedType === 'flood' ? 'น้ำท่วม' : 'พายุ'}
              จะเปิดให้บริการเร็วๆ นี้
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  const renderRainControls = () => {
    if (selectedType !== 'heavyrain' || !rainData) return null;

    return (
      <Card className="absolute top-4 right-4 z-[1000] bg-white/90 backdrop-blur">
        <CardContent className="p-3">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">เรดาร์ฝน:</span>
              <Button
                size="sm"
                variant={showRainOverlay ? "default" : "outline"}
                onClick={() => setShowRainOverlay(!showRainOverlay)}
              >
                {showRainOverlay ? 'ซ่อน' : 'แสดง'}
              </Button>
            </div>
            
            {showRainOverlay && (
              <Tabs value={rainOverlayType} onValueChange={(value) => setRainOverlayType(value as 'radar' | 'satellite')}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="radar" className="text-xs">Radar</TabsTrigger>
                  <TabsTrigger value="satellite" className="text-xs">Satellite</TabsTrigger>
                </TabsList>
                
                <TabsContent value="radar" className="mt-2">
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      variant={rainTimeType === 'past' ? "default" : "outline"}
                      onClick={() => setRainTimeType('past')}
                      className="text-xs"
                    >
                      ย้อนหลัง
                    </Button>
                    <Button
                      size="sm"
                      variant={rainTimeType === 'future' ? "default" : "outline"}
                      onClick={() => setRainTimeType('future')}
                      className="text-xs"
                    >
                      พยากรณ์
                    </Button>
                  </div>
                </TabsContent>
              </Tabs>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="relative h-full w-full">
      <MapContainer
        center={center}
        zoom={6}
        style={{ height: '100%', width: '100%' }}
        className="rounded-lg"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {/* Rain overlay for heavy rain type */}
        {selectedType === 'heavyrain' && showRainOverlay && rainData && (
          <RainOverlay 
            rainData={rainData}
            overlayType={rainOverlayType}
            timeType={rainTimeType}
          />
        )}
        
        {!isLoading && renderMarkers()}
      </MapContainer>
      
      {renderRainControls()}
      {renderComingSoon()}
      
      {isLoading && (
        <div className="absolute inset-0 bg-white bg-opacity-70 flex items-center justify-center z-[1000]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
            <p className="text-gray-600">กำลังโหลดข้อมูล...</p>
          </div>
        </div>
      )}

      {/* Debug information */}
      {selectedType === 'heavyrain' && !isLoading && (
        <div className="absolute bottom-4 left-4 bg-white p-2 rounded shadow text-xs z-[1000]">
          <div>เซ็นเซอร์ทั้งหมด: {rainSensors.length}</div>
          <div>เซ็นเซอร์ที่แสดง: {filteredRainSensors.length}</div>
          <div>ตัวกรองความชื้น: {humidityFilter}%+</div>
          {rainData && (
            <>
              <div>เรดาร์ย้อนหลัง: {rainData.radar?.past?.length || 0} เฟรม</div>
              <div>พยากรณ์: {rainData.radar?.nowcast?.length || 0} เฟรม</div>
            </>
          )}
        </div>
      )}

      {/* Debug information for wildfire */}
      {selectedType === 'wildfire' && !isLoading && (
        <div className="absolute bottom-4 left-4 bg-white p-2 rounded shadow text-xs z-[1000]">
          <div>จุดความร้อนทั้งหมด: {hotspots.length}</div>
          <div className="flex items-center gap-2 mt-1">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <span>MODIS</span>
            <div className="w-3 h-3 bg-red-500"></div>
            <span>VIIRS</span>
          </div>
        </div>
      )}
    </div>
  );
};
