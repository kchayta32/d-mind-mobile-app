import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DisasterType } from './types';
import { EarthquakeFilters } from './filter-components/EarthquakeFilters';
import { HeavyRainFilters } from './filter-components/HeavyRainFilters';
import { WildfireFilters } from './filter-components/WildfireFilters';
import { AirPollutionFilters } from './filter-components/AirPollutionFilters';
import { DroughtFilters } from './filter-components/DroughtFilters';
import { FloodFilters } from './filter-components/FloodFilters';
import {
  Activity,
  CloudRain,
  Flame,
  Wind,
  Sun,
  Waves,
  SlidersHorizontal,
  RotateCcw,
  Check,
  Sparkles,
} from 'lucide-react';

export interface FilterControlsProps {
  selectedType: DisasterType;
  onTypeChange?: (type: DisasterType) => void;
  magnitudeFilter: number;
  onMagnitudeChange: (value: number) => void;
  humidityFilter: number;
  onHumidityChange: (value: number) => void;
  rainTimeFilter: string;
  onRainTimeFilterChange: (value: string) => void;
  pm25Filter: number;
  onPm25Change: (value: number) => void;
  wildfireTimeFilter: string;
  onWildfireTimeFilterChange: (value: string) => void;
  showBurnFreq: boolean;
  onShowBurnFreqChange: (value: boolean) => void;
  droughtLayers: string[];
  onDroughtLayersChange: (layers: string[]) => void;
  floodTimeFilter: string;
  onFloodTimeFilterChange: (value: string) => void;
  showFloodFrequency: boolean;
  onShowFloodFrequencyChange: (show: boolean) => void;
  onResetFilters?: () => void;
  matchCount?: number;
}

const disasterTabs: { type: DisasterType; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { type: 'earthquake', label: 'แผ่นดินไหว', icon: Activity },
  { type: 'heavyrain', label: 'ฝนตกหนัก', icon: CloudRain },
  { type: 'wildfire', label: 'ไฟป่า', icon: Flame },
  { type: 'airpollution', label: 'PM2.5', icon: Wind },
  { type: 'flood', label: 'น้ำท่วม', icon: Waves },
  { type: 'drought', label: 'ภัยแล้ง', icon: Sun },
];

const FilterControls: React.FC<FilterControlsProps> = ({
  selectedType,
  onTypeChange,
  magnitudeFilter,
  onMagnitudeChange,
  humidityFilter,
  onHumidityChange,
  rainTimeFilter,
  onRainTimeFilterChange,
  pm25Filter,
  onPm25Change,
  wildfireTimeFilter,
  onWildfireTimeFilterChange,
  showBurnFreq,
  onShowBurnFreqChange,
  droughtLayers,
  onDroughtLayersChange,
  floodTimeFilter,
  onFloodTimeFilterChange,
  showFloodFrequency,
  onShowFloodFrequencyChange,
  onResetFilters,
  matchCount,
}) => {
  // ตรวจสอบจำนวนตัวกรองที่เปิดใช้งานสำหรับประเภทภัยที่เลือกอยู่
  const getActiveFilterCount = (): number => {
    let count = 0;
    switch (selectedType) {
      case 'earthquake':
        if (magnitudeFilter > 1.0) count++;
        break;
      case 'heavyrain':
        if (humidityFilter > 0) count++;
        if (rainTimeFilter !== 'realtime') count++;
        break;
      case 'wildfire':
        if (wildfireTimeFilter !== '3days') count++;
        if (showBurnFreq) count++;
        break;
      case 'airpollution':
        if (pm25Filter > 0) count++;
        break;
      case 'flood':
        if (floodTimeFilter !== '3days') count++;
        if (!showFloodFrequency) count++;
        break;
      case 'drought':
        if (droughtLayers.length !== 1 || droughtLayers[0] !== 'dri') count++;
        break;
      default:
        break;
    }
    return count;
  };

  const activeCount = getActiveFilterCount();

  // รีเซ็ตตัวกรองของประเภทภัยที่เลือกอยู่ให้กลับเป็นค่ามาตรฐาน
  const handleResetType = () => {
    switch (selectedType) {
      case 'earthquake':
        onMagnitudeChange(1.0);
        break;
      case 'heavyrain':
        onHumidityChange(0);
        onRainTimeFilterChange('realtime');
        break;
      case 'wildfire':
        onWildfireTimeFilterChange('3days');
        onShowBurnFreqChange(false);
        break;
      case 'airpollution':
        onPm25Change(0);
        break;
      case 'flood':
        onFloodTimeFilterChange('3days');
        onShowFloodFrequencyChange(true);
        break;
      case 'drought':
        onDroughtLayersChange(['dri']);
        break;
      default:
        break;
    }
    if (onResetFilters) {
      onResetFilters();
    }
  };

  return (
    <Card className="overflow-hidden border border-slate-200/80 dark:border-slate-800/80 bg-white/85 dark:bg-slate-900/85 backdrop-blur-md shadow-md rounded-2xl transition-all duration-200">
      {/* ส่วนหัวพร้อมตัวชี้วัดสถานะตัวกรองและการรีเซ็ต */}
      <CardHeader className="p-4 pb-3 border-b border-slate-100 dark:border-slate-800/60 bg-gradient-to-r from-blue-50/50 via-white/50 to-indigo-50/40 dark:from-slate-900/80 dark:via-slate-900/60 dark:to-blue-950/30">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-blue-100/80 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300">
              <SlidersHorizontal className="w-4 h-4" />
            </div>
            <div>
              <CardTitle className="text-base font-bold text-slate-900 dark:text-slate-100 leading-tight">
                ตัวกรองข้อมูล
              </CardTitle>
              {matchCount !== undefined && (
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-0.5">
                  ตรงตามเงื่อนไข: <span className="font-semibold text-blue-600 dark:text-blue-400">{matchCount}</span> รายการ
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {activeCount > 0 ? (
              <Badge
                variant="secondary"
                className="bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300 font-semibold px-2 py-0.5 text-xs rounded-full border border-blue-200/60 dark:border-blue-800/60"
              >
                {activeCount} ตัวกรอง
              </Badge>
            ) : (
              <Badge
                variant="outline"
                className="text-slate-500 dark:text-slate-400 font-normal px-2 py-0.5 text-xs rounded-full border-slate-200 dark:border-slate-700"
              >
                ค่าเริ่มต้น
              </Badge>
            )}

            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleResetType}
              aria-label="รีเซ็ตตัวกรองประเภทนี้"
              title="รีเซ็ตตัวกรองประเภทนี้"
              className="h-8 px-2 text-xs text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg min-h-[36px]"
            >
              <RotateCcw className="w-3.5 h-3.5 mr-1" />
              รีเซ็ต
            </Button>
          </div>
        </div>

        {/* แถบเลือกประเภทภัยพิบัติแบบ Touch-friendly (Touch target >= 44px) */}
        {onTypeChange && (
          <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800 flex flex-wrap gap-1.5">
            {disasterTabs.map((tab) => {
              const IconComp = tab.icon;
              const isSelected = selectedType === tab.type;
              return (
                <button
                  key={tab.type}
                  type="button"
                  onClick={() => onTypeChange(tab.type)}
                  aria-pressed={isSelected}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-all duration-150 min-h-[44px] min-w-[44px] ${
                    isSelected
                      ? 'bg-blue-600 text-white shadow-sm font-semibold'
                      : 'bg-slate-100/80 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  <IconComp className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : 'text-slate-500 dark:text-slate-400'}`} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        )}
      </CardHeader>

      <CardContent className="p-4 space-y-4">
        {/* กล่อง Presets ด่วนสำหรับแต่ละประเภทภัยพิบัติ */}
        {selectedType === 'earthquake' && (
          <div className="space-y-3">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-blue-500" />
                  พรีเซ็ตขนาดแผ่นดินไหว
                </span>
                <span className="text-xs font-bold text-blue-600 dark:text-blue-400">
                  {magnitudeFilter.toFixed(1)}+ ริกเตอร์
                </span>
              </div>
              <div className="grid grid-cols-4 gap-1.5">
                {[
                  { label: 'ทั้งหมด', value: 1.0 },
                  { label: '3.0+', value: 3.0 },
                  { label: '5.0+', value: 5.0 },
                  { label: '7.0+', value: 7.0 },
                ].map((preset) => {
                  const isActive = magnitudeFilter === preset.value;
                  return (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => onMagnitudeChange(preset.value)}
                      className={`min-h-[44px] rounded-xl text-xs font-medium flex items-center justify-center transition-all ${
                        isActive
                          ? 'bg-blue-600 text-white font-bold shadow-sm'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                      }`}
                    >
                      {isActive && <Check className="w-3 h-3 mr-1 inline" />}
                      {preset.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
              <EarthquakeFilters
                magnitudeFilter={magnitudeFilter}
                onMagnitudeChange={onMagnitudeChange}
              />
            </div>
          </div>
        )}

        {selectedType === 'heavyrain' && (
          <div className="space-y-3">
            <div>
              <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 flex items-center gap-1 mb-1.5">
                <Sparkles className="w-3.5 h-3.5 text-blue-500" />
                พรีเซ็ตเกณฑ์ความชื้น
              </span>
              <div className="grid grid-cols-3 gap-1.5">
                {[
                  { label: 'ทั้งหมด (0%)', value: 0 },
                  { label: 'ชื้นปานกลาง (60%)', value: 60 },
                  { label: 'ชื้นสูง (80%)', value: 80 },
                ].map((preset) => {
                  const isActive = humidityFilter === preset.value;
                  return (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => onHumidityChange(preset.value)}
                      className={`min-h-[44px] rounded-xl text-xs font-medium flex items-center justify-center transition-all ${
                        isActive
                          ? 'bg-blue-600 text-white font-bold shadow-sm'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                      }`}
                    >
                      {isActive && <Check className="w-3 h-3 mr-1 inline" />}
                      {preset.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
              <HeavyRainFilters
                humidityFilter={humidityFilter}
                onHumidityChange={onHumidityChange}
                timeFilter={rainTimeFilter}
                onTimeFilterChange={onRainTimeFilterChange}
              />
            </div>
          </div>
        )}

        {selectedType === 'wildfire' && (
          <div className="space-y-3">
            <div>
              <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 flex items-center gap-1 mb-1.5">
                <Sparkles className="w-3.5 h-3.5 text-blue-500" />
                พรีเซ็ตช่วงเวลาจุดความร้อน
              </span>
              <div className="grid grid-cols-3 gap-1.5">
                {[
                  { label: 'วันนี้ (24ชม.)', value: '1day' },
                  { label: '3 วันล่าสุด', value: '3days' },
                  { label: '7 วันล่าสุด', value: '7days' },
                ].map((preset) => {
                  const isActive = wildfireTimeFilter === preset.value;
                  return (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => onWildfireTimeFilterChange(preset.value)}
                      className={`min-h-[44px] rounded-xl text-xs font-medium flex items-center justify-center transition-all ${
                        isActive
                          ? 'bg-blue-600 text-white font-bold shadow-sm'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                      }`}
                    >
                      {isActive && <Check className="w-3 h-3 mr-1 inline" />}
                      {preset.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
              <WildfireFilters
                wildfireTimeFilter={wildfireTimeFilter}
                onWildfireTimeFilterChange={onWildfireTimeFilterChange}
                showBurnFreq={showBurnFreq}
                onShowBurnFreqChange={onShowBurnFreqChange}
              />
            </div>
          </div>
        )}

        {selectedType === 'airpollution' && (
          <div className="space-y-3">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-blue-500" />
                  พรีเซ็ตเกณฑ์ PM2.5 (มคก./ลบ.ม.)
                </span>
                <span className="text-xs font-bold text-blue-600 dark:text-blue-400">
                  {pm25Filter}+ μg/m³
                </span>
              </div>
              <div className="grid grid-cols-3 gap-1.5">
                {[
                  { label: 'ทั้งหมด (0+)', value: 0 },
                  { label: 'เริ่มมีผล (>37.5)', value: 38 },
                  { label: 'มีผลต่อสุขภาพ (>75)', value: 75 },
                ].map((preset) => {
                  const isActive = pm25Filter === preset.value;
                  return (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => onPm25Change(preset.value)}
                      className={`min-h-[44px] px-2 rounded-xl text-xs font-medium flex items-center justify-center text-center transition-all ${
                        isActive
                          ? 'bg-blue-600 text-white font-bold shadow-sm'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                      }`}
                    >
                      {preset.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
              <AirPollutionFilters
                pm25Filter={pm25Filter}
                onPm25Change={onPm25Change}
              />
            </div>
          </div>
        )}

        {selectedType === 'flood' && (
          <div className="space-y-3">
            <div>
              <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 flex items-center gap-1 mb-1.5">
                <Sparkles className="w-3.5 h-3.5 text-blue-500" />
                พรีเซ็ตช่วงเวลาน้ำท่วม (GISTDA)
              </span>
              <div className="grid grid-cols-2 gap-1.5">
                {[
                  { label: 'วันนี้ (ย้อนหลัง 1 วัน)', value: '1day' },
                  { label: '3 วันล่าสุด', value: '3days' },
                ].map((preset) => {
                  const isActive = floodTimeFilter === preset.value;
                  return (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => onFloodTimeFilterChange(preset.value)}
                      className={`min-h-[44px] rounded-xl text-xs font-medium flex items-center justify-center transition-all ${
                        isActive
                          ? 'bg-blue-600 text-white font-bold shadow-sm'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                      }`}
                    >
                      {isActive && <Check className="w-3 h-3 mr-1 inline" />}
                      {preset.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
              <FloodFilters
                floodTimeFilter={floodTimeFilter}
                onFloodTimeFilterChange={onFloodTimeFilterChange}
                showFloodFrequency={showFloodFrequency}
                onShowFloodFrequencyChange={onShowFloodFrequencyChange}
              />
            </div>
          </div>
        )}

        {selectedType === 'drought' && (
          <div className="space-y-3">
            <div>
              <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 flex items-center gap-1 mb-1.5">
                <Sparkles className="w-3.5 h-3.5 text-blue-500" />
                ชั้นข้อมูลภัยแล้ง
              </span>
              <div className="grid grid-cols-3 gap-1.5">
                {[
                  { label: 'DRI (ภัยแล้ง)', id: 'dri' },
                  { label: 'NDWI (พืช)', id: 'ndwi' },
                  { label: 'SMAP (ดิน)', id: 'smap' },
                ].map((layer) => {
                  const isChecked = droughtLayers.includes(layer.id);
                  return (
                    <button
                      key={layer.id}
                      type="button"
                      onClick={() => {
                        const newLayers = isChecked
                          ? droughtLayers.filter((l) => l !== layer.id)
                          : [...droughtLayers, layer.id];
                        onDroughtLayersChange(newLayers.length > 0 ? newLayers : ['dri']);
                      }}
                      className={`min-h-[44px] rounded-xl text-xs font-medium flex items-center justify-center transition-all ${
                        isChecked
                          ? 'bg-blue-600 text-white font-bold shadow-sm'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                      }`}
                    >
                      {isChecked && <Check className="w-3 h-3 mr-1 inline" />}
                      {layer.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
              <DroughtFilters
                droughtLayers={droughtLayers}
                onDroughtLayersChange={onDroughtLayersChange}
              />
            </div>
          </div>
        )}

        {selectedType !== 'earthquake' &&
          selectedType !== 'heavyrain' &&
          selectedType !== 'wildfire' &&
          selectedType !== 'airpollution' &&
          selectedType !== 'drought' &&
          selectedType !== 'flood' && (
            <div className="text-sm text-slate-500 dark:text-slate-400 p-4 text-center bg-slate-50 dark:bg-slate-800/50 rounded-xl">
              ไม่มีตัวกรองเพิ่มเติมสำหรับประเภทภัยพิบัตินี้
            </div>
          )}
      </CardContent>
    </Card>
  );
};

export default FilterControls;
