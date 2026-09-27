import React, { useState } from 'react';
import { Marker, Popup } from 'react-map-gl/maplibre';
import { CrowdsourcedFloodReport } from './types';
import { Badge } from '@/components/ui/badge';
import { Clock, MapPin, CheckCircle2, AlertTriangle, User, ExternalLink, ShieldCheck } from 'lucide-react';

interface CrowdsourcedFloodMarkersProps {
  reports: CrowdsourcedFloodReport[];
}

const getWaterLevelBadge = (level: CrowdsourcedFloodReport['waterLevel'], cm?: number) => {
  switch (level) {
    case 'critical':
      return {
        label: `วิกฤติ (>100 ซม.)`,
        color: 'bg-red-600 text-white border-red-700',
        markerBg: '#dc2626',
        ripple: '#ef4444'
      };
    case 'chest':
      return {
        label: `ระดับอก (~80-100 ซม.)`,
        color: 'bg-rose-600 text-white border-rose-700',
        markerBg: '#e11d48',
        ripple: '#f43f5e'
      };
    case 'waist':
      return {
        label: `ระดับเอว (~50-80 ซม.)`,
        color: 'bg-amber-600 text-white border-amber-700',
        markerBg: '#d97706',
        ripple: '#f59e0b'
      };
    case 'knee':
      return {
        label: `ระดับหัวเข่า (~30-50 ซม.)`,
        color: 'bg-yellow-500 text-slate-900 border-yellow-600',
        markerBg: '#eab308',
        ripple: '#facc15'
      };
    case 'ankle':
    default:
      return {
        label: `ระดับข้อเท้า (10-30 ซม.)`,
        color: 'bg-blue-600 text-white border-blue-700',
        markerBg: '#2563eb',
        ripple: '#60a5fa'
      };
  }
};

export const CrowdsourcedFloodMarkers: React.FC<CrowdsourcedFloodMarkersProps> = ({ reports }) => {
  const [selectedReport, setSelectedReport] = useState<CrowdsourcedFloodReport | null>(null);

  if (!reports || reports.length === 0) return null;

  return (
    <>
      {reports.map((report) => {
        const badge = getWaterLevelBadge(report.waterLevel, report.waterLevelCm);
        const isVerified = report.verifiedBySatellite;

        return (
          <Marker
            key={report.id}
            longitude={report.lng}
            latitude={report.lat}
            anchor="center"
            onClick={(e) => {
              e.originalEvent.stopPropagation();
              setSelectedReport(report);
            }}
          >
            <div className="relative flex items-center justify-center cursor-pointer group">
              {/* Pulsing Animated Ping Ring */}
              <div
                className="absolute w-9 h-9 rounded-full animate-ping opacity-40 pointer-events-none"
                style={{ backgroundColor: badge.ripple }}
              />

              {/* Center Marker Pin */}
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs shadow-lg border-2 border-white transition-transform group-hover:scale-115 relative z-10"
                style={{ backgroundColor: badge.markerBg }}
                title={`${report.locationName} (${badge.label})`}
              >
                <span>🌊</span>

                {/* Verified Checkmark Badge */}
                {isVerified && (
                  <div className="absolute -bottom-1 -right-1 bg-emerald-500 text-white rounded-full w-3.5 h-3.5 text-[8px] font-bold flex items-center justify-center border border-white shadow-xs">
                    ✓
                  </div>
                )}
              </div>
            </div>
          </Marker>
        );
      })}

      {/* Interactive Popup for Selected Report */}
      {selectedReport && (
        <Popup
          longitude={selectedReport.lng}
          latitude={selectedReport.lat}
          anchor="bottom"
          offset={16}
          onClose={() => setSelectedReport(null)}
          closeOnClick={false}
          className="z-50"
        >
          {(() => {
            const badge = getWaterLevelBadge(selectedReport.waterLevel, selectedReport.waterLevelCm);
            const dateStr = new Date(selectedReport.createdAt).toLocaleString('th-TH', {
              day: 'numeric',
              month: 'short',
              hour: '2-digit',
              minute: '2-digit'
            });

            return (
              <div className="p-1 space-y-2 min-w-[260px] max-w-[310px] text-xs font-sans text-slate-800 dark:text-slate-100">
                {/* Header */}
                <div className="flex items-start justify-between gap-2 border-b pb-1.5">
                  <div className="flex items-center gap-1.5">
                    <span className="text-base">📢</span>
                    <div>
                      <h4 className="font-bold text-xs leading-tight">
                        รายงานน้ำท่วม (ภาคประชาชน)
                      </h4>
                      <p className="text-[10px] text-slate-500 flex items-center gap-1 mt-0.5">
                        <Clock className="w-3 h-3" />
                        <span>{dateStr}</span>
                      </p>
                    </div>
                  </div>

                  <Badge className={`${badge.color} text-[10px] px-1.5 py-0 shrink-0 font-medium`}>
                    {badge.label}
                  </Badge>
                </div>

                {/* Location */}
                <div className="bg-slate-50 dark:bg-slate-800/60 p-2 rounded-lg border border-slate-100 dark:border-slate-800 flex items-start gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-red-500 shrink-0 mt-0.5" />
                  <div className="text-[11px] leading-snug font-medium text-slate-800 dark:text-slate-200">
                    {selectedReport.locationName}
                  </div>
                </div>

                {/* Situation Description */}
                {selectedReport.situation && (
                  <p className="text-xs text-slate-700 dark:text-slate-300 bg-sky-50/50 dark:bg-sky-950/20 p-2 rounded-lg border border-sky-100/60 dark:border-sky-900/40 leading-relaxed">
                    "{selectedReport.situation}"
                  </p>
                )}

                {/* Photo Preview if available */}
                {selectedReport.imageUrl && (
                  <div className="rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 max-h-36 bg-slate-100 dark:bg-slate-800">
                    <img
                      src={selectedReport.imageUrl}
                      alt="รูปถ่ายน้ำท่วมจากพื้นที่จริง"
                      className="w-full h-full object-cover cursor-pointer hover:opacity-95 transition-opacity"
                      onClick={() => window.open(selectedReport.imageUrl, '_blank')}
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                  </div>
                )}

                {/* Verification & Reporter info */}
                <div className="pt-1 border-t border-slate-100 dark:border-slate-800 space-y-1.5 text-[10px]">
                  {selectedReport.verifiedBySatellite ? (
                    <div className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-1 rounded font-medium">
                      <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
                      <span>
                        ตรงกับดาวเทียม Sentinel-1 (ระยะ {selectedReport.satelliteDistanceMeters ?? 0} ม.)
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 text-slate-500 px-1">
                      <AlertTriangle className="w-3 h-3 text-amber-500 shrink-0" />
                      <span>รอการยืนยันรอบถ่ายดาวเทียมถัดไป</span>
                    </div>
                  )}

                  <div className="flex items-center justify-between text-slate-500 px-1 pt-0.5">
                    <span className="flex items-center gap-1">
                      <User className="w-3 h-3" />
                      <span>{selectedReport.reporterName || 'พลเมืองดี'}</span>
                    </span>
                    <span>พิกัด: {selectedReport.lat.toFixed(4)}, {selectedReport.lng.toFixed(4)}</span>
                  </div>
                </div>
              </div>
            );
          })()}
        </Popup>
      )}
    </>
  );
};

export default React.memo(CrowdsourcedFloodMarkers);
