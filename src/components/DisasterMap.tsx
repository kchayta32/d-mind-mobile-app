
import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { Icon } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { RefreshCw, AlertTriangle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';

interface Earthquake {
  id: string;
  magnitude: number;
  location: string;
  time: number; // timestamp
  coordinates: [number, number]; // [latitude, longitude]
}

const DisasterMap: React.FC = () => {
  const [earthquakes, setEarthquakes] = useState<Earthquake[]>([]);
  const [filteredEarthquakes, setFilteredEarthquakes] = useState<Earthquake[]>([]);
  const [magnitudeFilter, setMagnitudeFilter] = useState<number[]>([0]);
  const [timeFilter, setTimeFilter] = useState<string>("all");
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Custom icon for earthquake markers
  const earthquakeIcon = new Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });

  // Fetch earthquake data from USGS API
  const fetchEarthquakeData = async () => {
    setRefreshing(true);
    setError(null);
    
    try {
      const response = await fetch('https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson');
      
      if (!response.ok) {
        throw new Error(`Failed to fetch earthquake data: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Transform GeoJSON features to our Earthquake interface
      const transformedData: Earthquake[] = data.features.map((feature: any) => ({
        id: feature.id,
        magnitude: feature.properties.mag,
        location: feature.properties.place,
        time: feature.properties.time,
        // GeoJSON uses [longitude, latitude] format, but we need [latitude, longitude] for Leaflet
        coordinates: [feature.geometry.coordinates[1], feature.geometry.coordinates[0]]
      }));
      
      setEarthquakes(transformedData);
      toast({
        title: "ข้อมูลอัพเดทแล้ว",
        description: `พบแผ่นดินไหว ${transformedData.length} ครั้งในรอบ 24 ชั่วโมง`,
      });
    } catch (err) {
      console.error('Error fetching earthquake data:', err);
      setError('ไม่สามารถโหลดข้อมูลแผ่นดินไหวได้');
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถโหลดข้อมูลแผ่นดินไหวได้",
        variant: "destructive"
      });
    } finally {
      setRefreshing(false);
    }
  };

  // Fetch data on component mount
  useEffect(() => {
    fetchEarthquakeData();
    // Optional: Set up interval to refresh data periodically
    // const intervalId = setInterval(fetchEarthquakeData, 30 * 60 * 1000); // every 30 minutes
    // return () => clearInterval(intervalId);
  }, []);

  // Filter earthquakes based on magnitude and time
  useEffect(() => {
    let filtered = earthquakes;
    
    // Filter by magnitude
    if (magnitudeFilter[0] > 0) {
      filtered = filtered.filter(eq => eq.magnitude >= magnitudeFilter[0]);
    }
    
    // Filter by time
    const now = Date.now();
    switch (timeFilter) {
      case "1h":
        filtered = filtered.filter(eq => now - eq.time < 60 * 60 * 1000);
        break;
      case "6h":
        filtered = filtered.filter(eq => now - eq.time < 6 * 60 * 60 * 1000);
        break;
      case "24h":
        filtered = filtered.filter(eq => now - eq.time < 24 * 60 * 60 * 1000);
        break;
      case "7d":
        filtered = filtered.filter(eq => now - eq.time < 7 * 24 * 60 * 60 * 1000);
        break;
      // "all" case doesn't need filtering
    }
    
    setFilteredEarthquakes(filtered);
  }, [earthquakes, magnitudeFilter, timeFilter]);

  // Handle manual refresh button click
  const handleRefresh = () => {
    fetchEarthquakeData();
  };

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  const getMagnitudeColor = (magnitude: number) => {
    if (magnitude >= 6) return "destructive";
    if (magnitude >= 5) return "default"; // red
    if (magnitude >= 4) return "secondary"; // yellow
    return "outline"; // green or lower intensity
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
          {error ? (
            <div className="flex flex-col items-center justify-center h-full bg-gray-50">
              <AlertTriangle className="h-10 w-10 text-destructive mb-2" />
              <p className="text-destructive">{error}</p>
              <Button variant="outline" size="sm" className="mt-2" onClick={handleRefresh}>
                ลองอีกครั้ง
              </Button>
            </div>
          ) : (
            <MapContainer 
              center={[15.8700, 100.9925]} // Center of Thailand
              zoom={3} // Zoomed out to see more earthquakes globally
              style={{ height: '100%', width: '100%' }} 
              scrollWheelZoom={false}
              attributionControl={false}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              />
              {filteredEarthquakes.map((earthquake) => (
                <Marker 
                  key={earthquake.id} 
                  position={[earthquake.coordinates[0], earthquake.coordinates[1]]}
                  icon={earthquakeIcon}
                >
                  <Popup>
                    <div className="text-sm">
                      <div className="font-bold">{earthquake.location}</div>
                      <div>
                        Magnitude: <Badge variant={getMagnitudeColor(earthquake.magnitude)}>
                          {earthquake.magnitude}
                        </Badge>
                      </div>
                      <div>Time: {formatTime(earthquake.time)}</div>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          )}
        </div>

        {/* Filter controls */}
        <div className="px-4 pt-4 space-y-3">
          <div>
            <div className="flex justify-between">
              <label className="text-sm font-medium">Magnitude: {magnitudeFilter[0]}+</label>
            </div>
            <Slider 
              value={magnitudeFilter} 
              min={0}
              max={9}
              step={0.5}
              onValueChange={setMagnitudeFilter}
              className="mt-2"
            />
          </div>
          
          <div>
            <label className="text-sm font-medium block mb-2">Time Period:</label>
            <Select value={timeFilter} onValueChange={setTimeFilter}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select time period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All time</SelectItem>
                <SelectItem value="1h">Last hour</SelectItem>
                <SelectItem value="6h">Last 6 hours</SelectItem>
                <SelectItem value="24h">Last 24 hours</SelectItem>
                <SelectItem value="7d">Last 7 days</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="text-sm text-muted-foreground">
            Showing {filteredEarthquakes.length} earthquake{filteredEarthquakes.length !== 1 ? 's' : ''}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DisasterMap;
