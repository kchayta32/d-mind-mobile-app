import React, { useState } from 'react';
import { AirPollutionData } from './types';
import { MapLibreMarker } from './maplibre/MapLibreMarker';
import { Wind, MapPin, AlertTriangle, ShieldCheck, HeartPulse, Sparkles } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface AirStationMarkerProps {
  station: AirPollutionData;
}

/**
 * Thailand Pollution Control Department (PCD / กรมควบคุมมลพิษ) Air Quality Standards
 */
export const getThaiPCDAQI = (pm25?: number) => {
  if (pm25 === undefined || pm25 === null || isNaN(pm25)) {
    return {
      status: 'ไม่มีข้อมูล',
      color: '#94a3b8',
      textColor: 'text-slate-500',
      bgColor: 'bg-slate-100',
      level: 'unknown',
      advice: 'ไม่มีข้อมูลตรวจวัดในขณะนี้'
    };
  }

  if (pm25 <= 15.0) {
    return {
      status: 'คุณภาพดีมาก',
      color: '#0284c7', // Sky Blue
      textColor: 'text-sky-700 dark:text-sky-300',
      bgColor: 'bg-sky-50 dark:bg-sky-950/40',
      level: 'very-good',
      advice: 'คุณภาพอากาศดีมาก เหมาะสำหรับกิจกรรมกลางแจ้งและการท่องเที่ยว'
    };
  }

  if (pm25 <= 25.0) {
    return {
      status: 'คุณภาพดี',
      color: '#16a34a', // Green
      textColor: 'text-emerald-700 dark:text-emerald-300',
      bgColor: 'bg-emerald-50 dark:bg-emerald-950/40',
      level: 'good',
      advice: 'สามารถทำกิจกรรมกลางแจ้งและการท่องเที่ยวได้ตามปกติ'
    };
  }

  if (pm25 <= 37.5) {
    return {
      status: 'ปานกลาง',
      color: '#eab308', // Yellow
      textColor: 'text-yellow-700 dark:text-yellow-300',
      bgColor: 'bg-yellow-50 dark:bg-yellow-950/40',
      level: 'moderate',
      advice: 'ประชาชนทั่วไปทำกิจกรรมได้ตามปกติ กลุ่มเสี่ยงควรลดกิจกรรมกลางแจ้ง'
    };
  }

  if (pm25 <= 75.0) {
    return {
      status: 'เริ่มมีผลกระทบต่อสุขภาพ',
      color: '#f97316', // Orange
      textColor: 'text-orange-700 dark:text-orange-300',
      bgColor: 'bg-orange-50 dark:bg-orange-950/40',
      level: 'unhealthy-sensitive',
      advice: 'ควรลดระยะเวลาการทำกิจกรรมกลางแจ้ง และสวมหน้ากากป้องกันฝุ่น PM2.5'
    };
  }

  return {
    status: 'มีผลกระทบต่อสุขภาพ',
    color: '#dc2626', // Red
    textColor: 'text-red-700 dark:text-red-300',
    bgColor: 'bg-red-50 dark:bg-red-950/40',
    level: 'hazardous',
    advice: 'ทุกคนควรงดกิจกรรมกลางแจ้ง ใช้อุปกรณ์ป้องกันฝุ่น PM2.5 ทุกครั้งที่ออกจากอาคาร'
  };
};

const AirStationMarker: React.FC<AirStationMarkerProps> = ({ station }) => {
  const [showPopup, setShowPopup] = useState(false);

  const lat = station.lat ?? station.latitude;
  const lng = station.lng ?? station.longitude;

  if (typeof lat !== 'number' || typeof lng !== 'number' || isNaN(lat) || isNaN(lng)) {
    return null;
  }

  const aqiInfo = getThaiPCDAQI(station.pm25);

  const formatValue = (value?: number, unit: string = '') => {
    return typeof value === 'number' && !isNaN(value) ? `${value.toFixed(1)} ${unit}` : 'ไม่มีข้อมูล';
  };

  const stationTitle =
    station.stationName ||
    station.name ||
    [station.subdistrict, station.district, station.province].filter(Boolean).join(' ') ||
    'สถานีตรวจวัดคุณภาพอากาศ';

  const PopupContent = (
    <div className="p-1 space-y-2 min-w-[240px] max-w-[290px] text-xs font-sans text-slate-800 dark:text-slate-100">
      {/* Header */}
      <div className="flex items-center justify-between border-b pb-1.5">
        <div className="flex items-center gap-1.5">
          <Wind className="w-4 h-4 text-sky-600 shrink-0" />
          <h3 className="font-bold text-xs leading-tight truncate max-w-[170px]" title={stationTitle}>
            {stationTitle}
          </h3>
        </div>
        <Badge
          className="text-[10px] px-1.5 py-0 font-bold shrink-0 text-white"
          style={{ backgroundColor: aqiInfo.color }}
        >
          {aqiInfo.status}
        </Badge>
      </div>

      {/* Primary PM2.5 Card */}
      <div
        className="p-2.5 rounded-xl border flex items-center justify-between"
        style={{ borderColor: `${aqiInfo.color}40`, backgroundColor: `${aqiInfo.color}15` }}
      >
        <div>
          <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-medium">
            ดัชนีฝุ่นละออง PM2.5 (PCD)
          </span>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="text-xl font-extrabold" style={{ color: aqiInfo.color }}>
              {typeof station.pm25 === 'number' ? station.pm25.toFixed(1) : 'N/A'}
            </span>
            <span className="text-[11px] text-slate-500 font-medium">μg/m³</span>
          </div>
        </div>

        {station.usAqi && (
          <div className="text-right border-l pl-3 border-slate-200 dark:border-slate-700">
            <span className="text-[9px] text-slate-500 block">US AQI</span>
            <span className="font-bold text-sm text-slate-700 dark:text-slate-200">
              {station.usAqi}
            </span>
          </div>
        )}
      </div>

      {/* Health Advisory */}
      <div className={`p-2 rounded-lg text-[10px] leading-relaxed flex items-start gap-1.5 ${aqiInfo.bgColor} ${aqiInfo.textColor}`}>
        <HeartPulse className="w-3.5 h-3.5 shrink-0 mt-0.5" />
        <span>{aqiInfo.advice}</span>
      </div>

      {/* Secondary Gas & Atmospheric Metrics */}
      {(station.pm10 || station.no2trop || station.so2 || station.o3total || station.aod443) && (
        <div className="grid grid-cols-2 gap-1.5 text-[10px] bg-slate-50 dark:bg-slate-800/60 p-2 rounded-lg border border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-300">
          {station.pm10 && <div><strong>PM10:</strong> {formatValue(station.pm10, 'μg/m³')}</div>}
          {station.aod443 && <div><strong>AOD:</strong> {formatValue(station.aod443)}</div>}
          {station.no2trop && <div><strong>NO2:</strong> {formatValue(station.no2trop)}</div>}
          {station.so2 && <div><strong>SO2:</strong> {formatValue(station.so2)}</div>}
          {station.o3total && <div><strong>O3:</strong> {formatValue(station.o3total)}</div>}
          {station.uvai && <div><strong>UV Index:</strong> {formatValue(station.uvai)}</div>}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-100 dark:border-slate-800">
        <span className="flex items-center gap-1">
          <MapPin className="w-3 h-3 text-red-400" />
          <span>{lat.toFixed(3)}, {lng.toFixed(3)}</span>
        </span>
        <span>เกณฑ์มาตรฐาน คพ. (ไทย)</span>
      </div>
    </div>
  );

  return (
    <MapLibreMarker
      latitude={lat}
      longitude={lng}
      showPopup={showPopup}
      popupContent={PopupContent}
      onClosePopup={() => setShowPopup(false)}
      onClick={() => setShowPopup(!showPopup)}
      className="cursor-pointer"
    >
      <div
        className="transition-transform hover:scale-125"
        style={{
          width: '13px',
          height: '13px',
          borderRadius: '50%',
          backgroundColor: aqiInfo.color,
          border: '2px solid #ffffff',
          boxShadow: `0 1px 4px rgba(0,0,0,0.35), 0 0 0 2px ${aqiInfo.color}40`,
        }}
        title={`${stationTitle}: PM2.5 = ${typeof station.pm25 === 'number' ? station.pm25.toFixed(1) : 'N/A'} μg/m³ (${aqiInfo.status})`}
      />
    </MapLibreMarker>
  );
};

export default React.memo(AirStationMarker);
