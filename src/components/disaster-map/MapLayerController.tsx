import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  Layers,
  ChevronDown,
  ChevronUp,
  Droplets,
  Flame,
  Sun,
  Eye,
  Sliders,
  Sparkles,
  Info
} from 'lucide-react';
import { DisasterType } from './types';

interface MapLayerControllerProps {
  selectedType: DisasterType;
  onTypeChange: (type: DisasterType) => void;
  // Flood props
  floodTimeFilter: string;
  setFloodTimeFilter: (filter: '1day' | '3days' | '7days' | '30days') => void;
  showFloodFrequency: boolean;
  setShowFloodFrequency: (show: boolean) => void;
  showWaterHyacinth: boolean;
  setShowWaterHyacinth: (show: boolean) => void;
  // Wildfire props
  wildfireTimeFilter: string;
  setWildfireTimeFilter: (filter: '1day' | '3days' | '7days' | '30days') => void;
  showBurnFreq: boolean;
  setShowBurnFreq: (show: boolean) => void;
  showBurnScar: boolean;
  setShowBurnScar: (show: boolean) => void;
  // Drought props
  droughtLayers: string[];
  setDroughtLayers: (layers: string[]) => void;
  // Common layer rendering settings
  tileFormat: 'wmts' | 'tms';
  setTileFormat: (format: 'wmts' | 'tms') => void;
  layerOpacity: number;
  setLayerOpacity: (opacity: number) => void;
}

export const MapLayerController: React.FC<MapLayerControllerProps> = ({
  selectedType,
  onTypeChange,
  floodTimeFilter,
  setFloodTimeFilter,
  showFloodFrequency,
  setShowFloodFrequency,
  showWaterHyacinth,
  setShowWaterHyacinth,
  wildfireTimeFilter,
  setWildfireTimeFilter,
  showBurnFreq,
  setShowBurnFreq,
  showBurnScar,
  setShowBurnScar,
  droughtLayers,
  setDroughtLayers,
  tileFormat,
  setTileFormat,
  layerOpacity,
  setLayerOpacity
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showLegend, setShowLegend] = useState(false);

  const toggleDroughtLayer = (layer: string) => {
    if (droughtLayers.includes(layer)) {
      setDroughtLayers(droughtLayers.filter((l) => l !== layer));
    } else {
      setDroughtLayers([...droughtLayers, layer]);
    }
  };

  return (
    <div className="absolute top-3 left-3 z-30 max-w-[340px] w-[calc(100vw-24px)] pointer-events-auto">
      <Card className="border border-white/40 dark:border-slate-800/80 bg-white/85 dark:bg-slate-900/85 backdrop-blur-xl shadow-xl rounded-2xl overflow-hidden transition-all duration-300">
        {/* Header Bar */}
        <div
          className="flex items-center justify-between px-3.5 py-2.5 cursor-pointer hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-sm">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-100">
                  ชั้นข้อมูลดาวเทียม GISTDA
                </span>
                <Badge
                  variant="outline"
                  className="text-[9px] px-1.5 py-0 h-4 bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200"
                >
                  LIVE
                </Badge>
              </div>
              <p className="text-[10px] text-slate-500 dark:text-slate-400">
                {selectedType === 'flood' && `น้ำท่วม (${floodTimeFilter})`}
                {selectedType === 'wildfire' && `ไฟป่า (${wildfireTimeFilter})`}
                {selectedType === 'drought' && `ภัยแล้ง (${droughtLayers.length} เลเยอร์)`}
                {!['flood', 'wildfire', 'drought'].includes(selectedType) && 'เลือกชั้นข้อมูล'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-white"
              onClick={(e) => {
                e.stopPropagation();
                setShowLegend(!showLegend);
              }}
              title="คำอธิบายสัญลักษณ์ (Legend)"
            >
              <Info className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-white"
            >
              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </Button>
          </div>
        </div>

        {/* Expandable Control Body */}
        {isExpanded && (
          <CardContent className="p-3 pt-1 border-t border-slate-100 dark:border-slate-800/60 space-y-3 text-xs">
            {/* Quick Disaster Category Switcher */}
            <div className="grid grid-cols-3 gap-1 p-1 bg-slate-100/80 dark:bg-slate-800/80 rounded-xl">
              <button
                type="button"
                onClick={() => onTypeChange('flood')}
                className={`py-1.5 px-2 rounded-lg text-center flex items-center justify-center gap-1 font-medium transition-all ${
                  selectedType === 'flood'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-white/50'
                }`}
              >
                <Droplets className="w-3.5 h-3.5" />
                <span>น้ำท่วม</span>
              </button>
              <button
                type="button"
                onClick={() => onTypeChange('wildfire')}
                className={`py-1.5 px-2 rounded-lg text-center flex items-center justify-center gap-1 font-medium transition-all ${
                  selectedType === 'wildfire'
                    ? 'bg-orange-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-white/50'
                }`}
              >
                <Flame className="w-3.5 h-3.5" />
                <span>ไฟป่า</span>
              </button>
              <button
                type="button"
                onClick={() => onTypeChange('drought')}
                className={`py-1.5 px-2 rounded-lg text-center flex items-center justify-center gap-1 font-medium transition-all ${
                  selectedType === 'drought'
                    ? 'bg-amber-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-white/50'
                }`}
              >
                <Sun className="w-3.5 h-3.5" />
                <span>ภัยแล้ง</span>
              </button>
            </div>

            {/* FLOOD CONTROLS */}
            {selectedType === 'flood' && (
              <div className="space-y-2.5 animate-in fade-in duration-200">
                <div>
                  <Label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
                    ช่วงเวลาย้อนหลัง (Sentinel-1 SAR)
                  </Label>
                  <div className="grid grid-cols-4 gap-1">
                    {(['1day', '3days', '7days', '30days'] as const).map((tf) => (
                      <Button
                        key={tf}
                        size="sm"
                        variant={floodTimeFilter === tf ? 'default' : 'outline'}
                        className={`h-7 text-[10px] px-1 rounded-lg ${
                          floodTimeFilter === tf ? 'bg-blue-600 text-white' : ''
                        }`}
                        onClick={() => setFloodTimeFilter(tf)}
                      >
                        {tf === '1day' && '1 วัน'}
                        {tf === '3days' && '3 วัน'}
                        {tf === '7days' && '7 วัน'}
                        {tf === '30days' && '30 วัน'}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5 pt-1 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-slate-600 dark:text-slate-300">
                      พื้นที่น้ำท่วมซ้ำซาก (10 ปี)
                    </span>
                    <Switch
                      checked={showFloodFrequency}
                      onCheckedChange={setShowFloodFrequency}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-slate-600 dark:text-slate-300">
                      สิ่งกีดขวางทางน้ำ (ผักตบชวา)
                    </span>
                    <Switch
                      checked={showWaterHyacinth}
                      onCheckedChange={setShowWaterHyacinth}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* WILDFIRE CONTROLS */}
            {selectedType === 'wildfire' && (
              <div className="space-y-2.5 animate-in fade-in duration-200">
                <div>
                  <Label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
                    จุดความร้อน VIIRS (375m)
                  </Label>
                  <div className="grid grid-cols-4 gap-1">
                    {(['1day', '3days', '7days', '30days'] as const).map((tf) => (
                      <Button
                        key={tf}
                        size="sm"
                        variant={wildfireTimeFilter === tf ? 'default' : 'outline'}
                        className={`h-7 text-[10px] px-1 rounded-lg ${
                          wildfireTimeFilter === tf ? 'bg-orange-600 text-white' : ''
                        }`}
                        onClick={() => setWildfireTimeFilter(tf)}
                      >
                        {tf === '1day' && 'วันนี้/1d'}
                        {tf === '3days' && '3 วัน'}
                        {tf === '7days' && '7 วัน'}
                        {tf === '30days' && '30 วัน'}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5 pt-1 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-slate-600 dark:text-slate-300">
                      ร่องรอยเผาไหม้ (Burn Scar รายสัปดาห์)
                    </span>
                    <Switch
                      checked={showBurnScar}
                      onCheckedChange={setShowBurnScar}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-slate-600 dark:text-slate-300">
                      พื้นที่เผาไหม้ซ้ำซาก (Burn Frequency)
                    </span>
                    <Switch
                      checked={showBurnFreq}
                      onCheckedChange={setShowBurnFreq}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* DROUGHT CONTROLS */}
            {selectedType === 'drought' && (
              <div className="space-y-2 animate-in fade-in duration-200">
                <Label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
                  ชั้นข้อมูลความชื้น & ดัชนีภัยแล้ง (7 วันล่าสุด)
                </Label>
                <div className="space-y-1.5">
                  <div
                    onClick={() => toggleDroughtLayer('dri')}
                    className={`flex items-center justify-between p-2 rounded-xl border cursor-pointer transition-all ${
                      droughtLayers.includes('dri')
                        ? 'border-amber-500 bg-amber-50/70 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200'
                        : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div>
                      <div className="font-semibold text-[11px]">DRIPlus (ดัชนีภัยแล้ง)</div>
                      <div className="text-[9px] text-slate-500">บูรณาการ SPI, VCI, SMI</div>
                    </div>
                    <Badge variant={droughtLayers.includes('dri') ? 'default' : 'outline'} className="text-[10px]">
                      {droughtLayers.includes('dri') ? 'เปิด' : 'ปิด'}
                    </Badge>
                  </div>

                  <div
                    onClick={() => toggleDroughtLayer('ndwi')}
                    className={`flex items-center justify-between p-2 rounded-xl border cursor-pointer transition-all ${
                      droughtLayers.includes('ndwi')
                        ? 'border-emerald-500 bg-emerald-50/70 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200'
                        : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div>
                      <div className="font-semibold text-[11px]">NDWI (ความชื้นพืชพรรณ)</div>
                      <div className="text-[9px] text-slate-500">ดัชนีน้ำในใบไม้ / เชื้อเพลิง</div>
                    </div>
                    <Badge variant={droughtLayers.includes('ndwi') ? 'default' : 'outline'} className="text-[10px]">
                      {droughtLayers.includes('ndwi') ? 'เปิด' : 'ปิด'}
                    </Badge>
                  </div>

                  <div
                    onClick={() => toggleDroughtLayer('smap')}
                    className={`flex items-center justify-between p-2 rounded-xl border cursor-pointer transition-all ${
                      droughtLayers.includes('smap')
                        ? 'border-blue-500 bg-blue-50/70 dark:bg-blue-950/40 text-blue-900 dark:text-blue-200'
                        : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div>
                      <div className="font-semibold text-[11px]">SMAP (ความชื้นในดิน)</div>
                      <div className="text-[9px] text-slate-500">ระดับ 0-5 ซม. / ผิวดิน</div>
                    </div>
                    <Badge variant={droughtLayers.includes('smap') ? 'default' : 'outline'} className="text-[10px]">
                      {droughtLayers.includes('smap') ? 'เปิด' : 'ปิด'}
                    </Badge>
                  </div>
                </div>
              </div>
            )}

            {/* COMMON CONTROLS: Engine & Opacity */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-slate-600 dark:text-slate-400">โหมดเรนเดอร์ไทล์</span>
                <div className="flex gap-1 bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg">
                  <button
                    type="button"
                    onClick={() => setTileFormat('tms')}
                    className={`px-2 py-0.5 rounded-md text-[10px] font-semibold transition-all ${
                      tileFormat === 'tms'
                        ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-300 shadow-xs'
                        : 'text-slate-500'
                    }`}
                  >
                    TMS (เร็วสุด)
                  </button>
                  <button
                    type="button"
                    onClick={() => setTileFormat('wmts')}
                    className={`px-2 py-0.5 rounded-md text-[10px] font-semibold transition-all ${
                      tileFormat === 'wmts'
                        ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-300 shadow-xs'
                        : 'text-slate-500'
                    }`}
                  >
                    WMTS
                  </button>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] text-slate-500">ความโปร่งใสเลเยอร์</span>
                  <span className="text-[10px] font-semibold text-slate-700 dark:text-slate-300">
                    {Math.round(layerOpacity * 100)}%
                  </span>
                </div>
                <Slider
                  value={[layerOpacity * 100]}
                  min={20}
                  max={100}
                  step={5}
                  onValueChange={(val) => setLayerOpacity(val[0] / 100)}
                  className="h-4"
                />
              </div>
            </div>
          </CardContent>
        )}

        {/* Legend Box */}
        {showLegend && (
          <div className="p-3 bg-slate-50/95 dark:bg-slate-800/95 border-t border-slate-200 dark:border-slate-700 text-xs space-y-2 animate-in slide-in-from-top-2 duration-200">
            <div className="font-bold text-[11px] text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-blue-500" />
              <span>คำอธิบายสัญลักษณ์ (Legend)</span>
            </div>

            {selectedType === 'flood' && (
              <div className="space-y-1 text-[10px] text-slate-600 dark:text-slate-300">
                <div className="flex items-center gap-2">
                  <span className="w-3.5 h-3 rounded bg-[#0284c7] inline-block border border-blue-700" />
                  <span>พื้นที่น้ำท่วมขัง (ดาวเทียม Sentinel-1)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3.5 h-3 rounded bg-purple-600/70 inline-block border border-purple-800" />
                  <span>น้ำท่วมซ้ำซาก (ความถี่ 1-10 ปี)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3.5 h-3 rounded bg-emerald-500 inline-block border border-emerald-700" />
                  <span>สิ่งกีดขวางทางน้ำ (ผักตบชวา)</span>
                </div>
              </div>
            )}

            {selectedType === 'wildfire' && (
              <div className="space-y-1 text-[10px] text-slate-600 dark:text-slate-300">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-red-600 inline-block border border-white" />
                  <span>จุดความร้อนรุนแรง (FRP &gt; 50 MW)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-orange-500 inline-block border border-white" />
                  <span>จุดความร้อนปานกลาง (FRP 10-50 MW)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-yellow-500 inline-block border border-white" />
                  <span>จุดความร้อนเฝ้าระวัง (FRP &lt; 10 MW)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3.5 h-3 rounded bg-amber-900/60 inline-block border border-amber-950" />
                  <span>ร่องรอยเผาไหม้ (Burn Scar รายสัปดาห์)</span>
                </div>
              </div>
            )}

            {selectedType === 'drought' && (
              <div className="space-y-1 text-[10px] text-slate-600 dark:text-slate-300">
                <div className="flex items-center gap-2">
                  <span className="w-3.5 h-3 rounded bg-red-500 inline-block" />
                  <span>แล้งวิกฤต / ความชื้นต่ำมาก (&lt; 20%)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3.5 h-3 rounded bg-amber-500 inline-block" />
                  <span>แล้งปานกลาง / ดินเริ่มแห้ง</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3.5 h-3 rounded bg-emerald-500 inline-block" />
                  <span>พืชพรรณชุ่มชื้น / ดินปกติ</span>
                </div>
              </div>
            )}
          </div>
        )}
      </Card>
    </div>
  );
};

export default React.memo(MapLayerController);
