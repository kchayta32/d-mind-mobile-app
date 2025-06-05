import React from 'react';
import { Marker, Popup } from 'react-leaflet';
import { Icon } from 'leaflet';
import { GISTDAHotspot } from './useGISTDAData';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Flame, Calendar, Gauge, Satellite, MapPin } from 'lucide-react';
import { format } from 'date-fns';
import { th } from 'date-fns/locale';

interface HotspotMarkerProps {
  hotspot: GISTDAHotspot;
}

const HotspotMarker: React.FC<HotspotMarkerProps> = ({ hotspot }) => {
  console.log('Rendering HotspotMarker for hotspot:', hotspot);

  // Create custom icon based on confidence and instrument
  const createHotspotIcon = (confidence: number | string, instrument: string) => {
    let color = '#ef4444'; // Default red for VIIRS
    
    // Use blue colors for MODIS
    if (instrument === 'MODIS') {
      if (typeof confidence === 'number') {
        if (confidence >= 80) {
          color = '#1e40af'; // Dark blue for high confidence
        } else if (confidence >= 60) {
          color = '#3b82f6'; // Medium blue for medium confidence
        } else {
          color = '#60a5fa'; // Light blue for low confidence
        }
      } else if (typeof confidence === 'string') {
        if (confidence === 'nominal' || confidence === 'high') {
          color = '#1e40af'; // Dark blue for nominal/high
        } else {
          color = '#60a5fa'; // Light blue for other values
        }
      }
    } else {
      // Keep original red colors for VIIRS
      if (typeof confidence === 'number') {
        if (confidence >= 80) {
          color = '#dc2626'; // Dark red for high confidence
        } else if (confidence >= 60) {
          color = '#ea580c'; // Orange-red for medium confidence
        } else {
          color = '#f97316'; // Orange for low confidence
        }
      } else if (typeof confidence === 'string') {
        if (confidence === 'nominal' || confidence === 'high') {
          color = '#dc2626'; // Dark red for nominal/high
        } else {
          color = '#f97316'; // Orange for other values
        }
      }
    }
    
    // Different shapes for different instruments
    const size = (typeof confidence === 'number' && confidence >= 80) || confidence === 'nominal' ? 12 : 
                 (typeof confidence === 'number' && confidence >= 60) ? 10 : 8;
    
    const iconSvg = instrument === 'MODIS' 
      ? `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
           <circle cx="12" cy="12" r="10" fill="${color}" stroke="white" stroke-width="2"/>
         </svg>`
      : `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
           <rect x="2" y="2" width="20" height="20" fill="${color}" stroke="white" stroke-width="2"/>
         </svg>`;
    
    return new Icon({
      iconUrl: `data:image/svg+xml;base64,${btoa(iconSvg)}`,
      iconSize: [size, size],
      iconAnchor: [size/2, size/2],
      popupAnchor: [0, -size/2],
    });
  };

  const formatDateTime = (date: string, time: string) => {
    try {
      // Format Thai date and time
      const dateTimeString = `${date} ${time}`;
      const dateTime = new Date(dateTimeString);
      return format(dateTime, 'PPP p', { locale: th });
    } catch (e) {
      return `${date} ${time}`;
    }
  };

  const getConfidenceColor = (confidence: number | string) => {
    if (typeof confidence === 'number') {
      if (confidence >= 80) return 'bg-red-100 text-red-800';
      if (confidence >= 60) return 'bg-orange-100 text-orange-800';
      return 'bg-yellow-100 text-yellow-800';
    } else {
      if (confidence === 'nominal' || confidence === 'high') return 'bg-red-100 text-red-800';
      return 'bg-yellow-100 text-yellow-800';
    }
  };

  const getConfidenceLabel = (confidence: number | string) => {
    if (typeof confidence === 'number') {
      if (confidence >= 80) return 'ความเชื่อมั่นสูง';
      if (confidence >= 60) return 'ความเชื่อมั่นปานกลาง';
      return 'ความเชื่อมั่นต่ำ';
    } else {
      if (confidence === 'nominal') return 'ความเชื่อมั่นปกติ';
      if (confidence === 'high') return 'ความเชื่อมั่นสูง';
      return 'ความเชื่อมั่นต่ำ';
    }
  };

  // Ensure coordinates exist and are valid
  if (!hotspot.geometry?.coordinates || !Array.isArray(hotspot.geometry.coordinates) || hotspot.geometry.coordinates.length !== 2) {
    console.warn('Invalid coordinates for hotspot:', hotspot);
    return null;
  }

  const [longitude, latitude] = hotspot.geometry.coordinates;
  
  if (typeof latitude !== 'number' || typeof longitude !== 'number') {
    console.warn('Invalid coordinate types for hotspot:', hotspot);
    return null;
  }

  return (
    <Marker
      position={[latitude, longitude]}
      icon={createHotspotIcon(hotspot.properties.confidence, hotspot.properties.instrument)}
    >
      <Popup maxWidth={300}>
        <Card className="border-0 shadow-none">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm flex items-center gap-2">
                <Flame className="h-4 w-4 text-red-500" />
                จุดความร้อน {hotspot.properties.instrument}
              </CardTitle>
              <Badge className={getConfidenceColor(hotspot.properties.confidence)}>
                {getConfidenceLabel(hotspot.properties.confidence)}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <Gauge className="h-3.5 w-3.5 text-gray-500" />
              <span>ความเชื่อมั่น: {hotspot.properties.confidence}{typeof hotspot.properties.confidence === 'number' ? '%' : ''}</span>
            </div>
            
            <div className="flex items-center gap-2 text-sm">
              <Flame className="h-3.5 w-3.5 text-gray-500" />
              <span>FRP: {hotspot.properties.frp} MW</span>
            </div>

            <div className="flex items-center gap-2 text-sm">
              <Satellite className="h-3.5 w-3.5 text-gray-500" />
              <span>ดาวเทียม: {hotspot.properties.satellite}</span>
            </div>

            <div className="flex items-center gap-2 text-sm">
              <MapPin className="h-3.5 w-3.5 text-gray-500" />
              <span>จังหวัด: {hotspot.properties.pv_tn}</span>
            </div>

            <div className="flex items-center gap-2 text-sm">
              <MapPin className="h-3.5 w-3.5 text-gray-500" />
              <span>อำเภอ: {hotspot.properties.ap_tn}</span>
            </div>

            <div className="flex items-center gap-2 text-xs text-gray-500">
              <Calendar className="h-3 w-3" />
              <span>ตรวจจับ: {formatDateTime(hotspot.properties.th_date, hotspot.properties.th_time)}</span>
            </div>

            <div className="text-xs text-gray-400 mt-2 pt-2 border-t">
              <div>พิกัด: {latitude.toFixed(4)}, {longitude.toFixed(4)}</div>
              <div>หมู่บ้าน: {hotspot.properties.village}</div>
              <div>ประเภทพื้นที่: {hotspot.properties.lu_name}</div>
            </div>
          </CardContent>
        </Card>
      </Popup>
    </Marker>
  );
};

export default HotspotMarker;
