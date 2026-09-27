import React, { useState } from 'react';
import { Satellite, ChevronDown, ChevronUp, Layers, CheckCircle2 } from 'lucide-react';

export const SentinelFloodLegend: React.FC = () => {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200/90 dark:border-slate-800 rounded-xl shadow-xl p-2.5 text-xs text-slate-700 dark:text-slate-200 transition-all max-w-[270px]">
      <div 
        className="flex items-center justify-between cursor-pointer font-bold text-sky-800 dark:text-sky-300 gap-2 select-none"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-1.5">
          <Satellite className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
          <span className="text-[11px]">สัญลักษณ์ดาวเทียม Sentinel & Ground Truth</span>
        </div>
        {isOpen ? <ChevronDown className="w-3.5 h-3.5 opacity-60" /> : <ChevronUp className="w-3.5 h-3.5 opacity-60" />}
      </div>

      {isOpen && (
        <div className="mt-2 space-y-1.5 text-[10px] pt-1.5 border-t border-slate-100 dark:border-slate-800 leading-tight">
          <div className="flex items-center gap-2">
            <span className="w-3.5 h-3.5 rounded bg-sky-500/70 border border-sky-600 shrink-0" />
            <span>พื้นที่น้ำท่วมสด (GISTDA / Sentinel Composite)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3.5 h-3.5 rounded bg-blue-700/80 border border-blue-900 shrink-0" />
            <span>Sentinel-1 C-SAR (เรดาร์ทะลุเมฆผิวน้ำ)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3.5 h-3.5 rounded bg-emerald-600/70 border border-emerald-800 shrink-0" />
            <span>Sentinel-2 Optical (ภาพสีธรรมชาติ 10m)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3.5 h-3.5 rounded bg-amber-500/60 border border-amber-600 shrink-0" />
            <span>พื้นที่น้ำท่วมซ้ำซาก (สถิติดาวเทียมย้อนหลัง)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3.5 h-3.5 rounded-full bg-red-500 border border-white shrink-0 animate-pulse" />
            <span>จุดยืนยันน้ำท่วมจริงโดยประชาชน (Citizen Ground Truth)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3.5 h-3.5 rounded-full bg-blue-600 border border-white shrink-0" />
            <span>สถานีแม่น้ำตรวจวัดอัตราไหล (GloFAS / Open-Meteo)</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default SentinelFloodLegend;
