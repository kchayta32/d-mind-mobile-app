
import React, { useState } from 'react';
import { GISTDAHotspot } from './useGISTDAData';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Flame, Calendar, Gauge, Satellite, MapPin, AlertTriangle, TreePine } from 'lucide-react';
import { format } from 'date-fns';
import { th } from 'date-fns/locale';
import { MapLibreMarker } from './maplibre/MapLibreMarker';

interface HotspotMarkerProps {
  hotspot: GISTDAHotspot;
}

const HotspotMarker: React.FC<HotspotMarkerProps> = ({ hotspot }) => {
  const [showPopup, setShowPopup] = useState(false);

  // Helper to get marker styles
  const getMarkerStyle = (riskLevel: string, instrument: string, confidence: number | string) => {
    let color = '#ef4444'; // Default red for VIIRS
    let size = 10;

    // Risk level colors
    const riskColors = {
      'very_high': '#7f1d1d', // Dark red
      'high': '#dc2626',      // Red  
      'medium': '#ea580c',    // Orange
      'low': '#f97316'        // Light orange
    };

    color = riskColors[riskLevel as keyof typeof riskColors] || '#f97316';

    // Use blue colors for MODIS
    if (instrument === 'MODIS') {
      const modisColors = {
        'very_high': '#1e3a8a', // Dark blue
        'high': '#1e40af',      // Blue
        'medium': '#3b82f6',    // Medium blue
        'low': '#60a5fa'        // Light blue
      };
      color = modisColors[riskLevel as keyof typeof modisColors] || '#60a5fa';
    }

    // Size based on risk level
    size = riskLevel === 'very_high' ? 14 :
      riskLevel === 'high' ? 12 :
        riskLevel === 'medium' ? 10 : 8;

    return { color, size, instrument };
  };

  const formatDateTime = (date: string, time: string) => {
    try {
      const dateTimeString = `${date} ${time}`;
      const dateTime = new Date(dateTimeString);
      return format(dateTime, 'PPP p', { locale: th });
    } catch (e) {
      return `${date} ${time}`;
    }
  };

  const getRiskLevelColor = (riskLevel: string) => {
    const colors = {
      'very_high': 'bg-red-100 text-red-800',
      'high': 'bg-orange-100 text-orange-800',
      'medium': 'bg-yellow-100 text-yellow-800',
      'low': 'bg-green-100 text-green-800'
    };
    return colors[riskLevel as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getRiskLevelLabel = (riskLevel: string) => {
    const labels = {
      'very_high': 'เสี่ยงมากที่สุด',
      'high': 'เสี่ยงสูง',
      'medium': 'เสี่ยงปานกลาง',
      'low': 'เสี่ยงต่ำ'
    };
    return labels[riskLevel as keyof typeof labels] || 'ไม่ระบุ';
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
    // console.warn('Invalid coordinates for hotspot:', hotspot);
    return null;
  }

  const [longitude, latitude] = hotspot.geometry.coordinates;

  if (typeof latitude !== 'number' || typeof longitude !== 'number') {
    // console.warn('Invalid coordinate types for hotspot:', hotspot);
    return null;
  }

  const riskLevel = hotspot.properties?.risk_level || 'low';
  const areaRai = hotspot.properties?.area_rai || 1;
  const instrument = hotspot.properties?.instrument || 'VIIRS';

  const { color, size } = getMarkerStyle(riskLevel, instrument, hotspot.properties?.confidence || 0);

  const PopupContent = (
    <Card className="border-0 shadow-none min-w-[300px]">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2">
            <Flame className="h-4 w-4 text-red-500" />
            จุดเกิดไฟป่า {hotspot.properties?.instrument || 'VIIRS'}
          </CardTitle>
          <div className="flex gap-1">
            <Badge className={getRiskLevelColor(riskLevel)}>
              {getRiskLevelLabel(riskLevel)}
            </Badge>
            <Badge className={getConfidenceColor(hotspot.properties?.confidence || 0)}>
              {getConfidenceLabel(hotspot.properties?.confidence || 0)}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Location Information */}
        <div className="bg-blue-50 p-2 rounded-lg">
          <h4 className="text-sm font-semibold text-blue-800 mb-1">ข้อมูลตำแหน่ง</h4>
          <div className="space-y-1 text-xs">
            <div className="flex items-center gap-2">
              <MapPin className="h-3 w-3 text-blue-600" />
              <span>จังหวัด: {hotspot.properties?.changwat || hotspot.properties?.pv_tn || 'ไม่ระบุ'}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-3 w-3 text-blue-600" />
              <span>อำเภอ: {hotspot.properties?.ap_tn || 'อ.เมือง'}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-3 w-3 text-blue-600" />
              <span>ตำบล: {hotspot.properties?.tambon || 'ต.ศรีภูมิ'}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-3 w-3 text-blue-600" />
              <span>หมู่บ้าน: {hotspot.properties?.village || 'บ้านป่าแดด'}</span>
            </div>
          </div>
        </div>

        {/* Risk Assessment */}
        <div className="bg-orange-50 p-2 rounded-lg">
          <h4 className="text-sm font-semibold text-orange-800 mb-1 flex items-center gap-1">
            <AlertTriangle className="h-3.5 w-3.5" />
            การประเมินความเสี่ยง
          </h4>
          <div className="space-y-1 text-xs">
            <div className="flex justify-between">
              <span>ระดับความเสี่ยง:</span>
              <span className="font-semibold">{getRiskLevelLabel(riskLevel)}</span>
            </div>
            <div className="flex justify-between">
              <span>พื้นที่เสี่ยงประมาณ:</span>
              <span className="font-semibold">{areaRai.toLocaleString()} ไร่</span>
            </div>
            <div className="flex justify-between">
              <span>ประเภทพื้นที่:</span>
              <span className="font-semibold">{hotspot.properties?.lu_name || 'ป่าไผ่'}</span>
            </div>
          </div>
        </div>

        {/* Fire Details */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <Gauge className="h-3.5 w-3.5 text-gray-500" />
            <span>ความเชื่อมั่น: {hotspot.properties?.confidence}{typeof hotspot.properties?.confidence === 'number' ? '%' : ''}</span>
          </div>

          <div className="flex items-center gap-2 text-sm">
            <Flame className="h-3.5 w-3.5 text-gray-500" />
            <span>FRP: {(hotspot.properties?.frp || 0).toFixed(1)} MW</span>
          </div>

          <div className="flex items-center gap-2 text-sm">
            <Satellite className="h-3.5 w-3.5 text-gray-500" />
            <span>ดาวเทียม: {hotspot.properties?.satellite || 'Terra'}</span>
          </div>

          <div className="flex items-center gap-2 text-sm">
            <TreePine className="h-3.5 w-3.5 text-gray-500" />
            <span>ความสว่าง: {hotspot.BRIGHTNESS?.toFixed(0)} K</span>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-gray-500 pt-2 border-t">
          <Calendar className="h-3 w-3" />
          <span>ตรวจจับ: {formatDateTime(hotspot.properties?.th_date || hotspot.ACQ_DATE, hotspot.properties?.th_time || hotspot.ACQ_TIME)}</span>
        </div>

        <div className="text-xs text-gray-400 pt-1">
          <div>พิกัด: {latitude.toFixed(4)}, {longitude.toFixed(4)}</div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <MapLibreMarker
      latitude={latitude}
      longitude={longitude}
      showPopup={showPopup}
      popupContent={PopupContent}
      onClosePopup={() => setShowPopup(false)}
      onClick={() => setShowPopup(!showPopup)}
      className="cursor-pointer"
    >
      {instrument === 'MODIS' ? (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="12" cy="12" r="10" fill={color} stroke="white" strokeWidth="2" opacity="0.9" />
          <circle cx="12" cy="12" r="6" fill={color} opacity="0.6" />
        </svg>
      ) : (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="2" y="2" width="20" height="20" fill={color} stroke="white" strokeWidth="2" opacity="0.9" />
          <rect x="6" y="6" width="12" height="12" fill={color} opacity="0.6" />
        </svg>
      )}
    </MapLibreMarker>
  );
};

export default HotspotMarker;
