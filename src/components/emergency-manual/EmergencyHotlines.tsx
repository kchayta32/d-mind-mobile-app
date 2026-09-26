import React, { useState } from 'react';
import { 
  Phone, PhoneCall, Copy, Check, Shield, Flame, 
  Heart, TreePine, Truck, Droplets, HelpCircle, 
  Siren, Radio, ExternalLink, AlertTriangle
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

export interface HotlineItem {
  number: string;
  name: string;
  dept: string;
  category: 'disaster' | 'medical' | 'fire' | 'transport' | 'water' | 'police';
  desc: string;
  hours: string;
  tollFree: boolean;
  priority: boolean;
  colorTheme: {
    bg: string;
    border: string;
    badge: string;
    iconBg: string;
    iconColor: string;
  };
}

export const HOTLINES: HotlineItem[] = [
  {
    number: '1784',
    name: 'กรมป้องกันและบรรเทาสาธารณภัย (ปภ.)',
    dept: 'กระทรวงมหาดไทย',
    category: 'disaster',
    desc: 'สายด่วนนิรภัย แจ้งเตือนภัยล่วงหน้า ประสานงานกู้ภัยสาธารณภัยทั่วประเทศ และติดตามสถานการณ์ภัยพิบัติ',
    hours: '24 ชั่วโมง',
    tollFree: true,
    priority: true,
    colorTheme: {
      bg: 'from-blue-500/10 via-indigo-500/5 to-transparent',
      border: 'border-blue-500/40 hover:border-blue-500/70',
      badge: 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 border-blue-200',
      iconBg: 'bg-blue-600 text-white',
      iconColor: 'text-blue-600'
    }
  },
  {
    number: '1669',
    name: 'สถาบันการแพทย์ฉุกเฉินแห่งชาติ (สพฉ.)',
    dept: 'ศูนย์นเรนทร',
    category: 'medical',
    desc: 'เรียกรถพยาบาลฉุกเฉิน ช่วยเหลือผู้บาดเจ็บสาหัส ผู้ป่วยวิกฤต หมดสติ หรือได้รับอุบัติเหตุรุนแรง',
    hours: '24 ชั่วโมง',
    tollFree: true,
    priority: true,
    colorTheme: {
      bg: 'from-pink-500/10 via-rose-500/5 to-transparent',
      border: 'border-pink-500/40 hover:border-pink-500/70',
      badge: 'bg-pink-100 text-pink-800 dark:bg-pink-950 dark:text-pink-300 border-pink-200',
      iconBg: 'bg-pink-600 text-white',
      iconColor: 'text-pink-600'
    }
  },
  {
    number: '199',
    name: 'ศูนย์วิทยุพระราม (ดับเพลิงและกู้ภัย)',
    dept: 'สำนักป้องกันและบรรเทาสาธารณภัย',
    category: 'fire',
    desc: 'แจ้งเหตุเพลิงไหม้ ไฟไหม้ป่า กู้ภัยสารเคมีรั่วไหล ช่วยเหลือผู้ติดค้าง และจับสัตว์มีพิษ',
    hours: '24 ชั่วโมง',
    tollFree: true,
    priority: true,
    colorTheme: {
      bg: 'from-red-500/10 via-orange-500/5 to-transparent',
      border: 'border-red-500/40 hover:border-red-500/70',
      badge: 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300 border-red-200',
      iconBg: 'bg-red-600 text-white',
      iconColor: 'text-red-600'
    }
  },
  {
    number: '1362',
    name: 'สายด่วนพิทักษ์ป่า',
    dept: 'กรมอุทยานแห่งชาติ สัตว์ป่า และพันธุ์พืช',
    category: 'fire',
    desc: 'แจ้งเหตุไฟป่า จุดความร้อน (Hotspots) ในเขตอุทยานฯ บุกรุกพื้นที่ป่า และสัตว์ป่าพลัดหลง',
    hours: '24 ชั่วโมง',
    tollFree: true,
    priority: true,
    colorTheme: {
      bg: 'from-emerald-500/10 via-teal-500/5 to-transparent',
      border: 'border-emerald-500/40 hover:border-emerald-500/70',
      badge: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-200',
      iconBg: 'bg-emerald-600 text-white',
      iconColor: 'text-emerald-600'
    }
  },
  {
    number: '1146',
    name: 'สายด่วนกรมทางหลวงชนบท',
    dept: 'กระทรวงคมนาคม',
    category: 'transport',
    desc: 'แจ้งเหตุน้ำท่วมทาง ดินสไลด์ทับถนน สะพานขาด และสอบถามเส้นทางเลี่ยงภัยพิบัติทั่วประเทศ',
    hours: '24 ชั่วโมง',
    tollFree: true,
    priority: true,
    colorTheme: {
      bg: 'from-amber-500/10 via-orange-500/5 to-transparent',
      border: 'border-amber-500/40 hover:border-amber-500/70',
      badge: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border-amber-200',
      iconBg: 'bg-amber-600 text-white',
      iconColor: 'text-amber-600'
    }
  },
  {
    number: '1193',
    name: 'ตำรวจทางหลวง',
    dept: 'กองบังคับการตำรวจทางหลวง',
    category: 'transport',
    desc: 'ขอความช่วยเหลือฉุกเฉินบนทางหลวง รถเสีย อุบัติเหตุ และตรวจสอบสภาพการจราจรช่วงภัยพิบัติ',
    hours: '24 ชั่วโมง',
    tollFree: true,
    priority: false,
    colorTheme: {
      bg: 'from-indigo-500/10 via-purple-500/5 to-transparent',
      border: 'border-indigo-500/30 hover:border-indigo-500/60',
      badge: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300 border-indigo-200',
      iconBg: 'bg-indigo-600 text-white',
      iconColor: 'text-indigo-600'
    }
  },
  {
    number: '1460',
    name: 'สายด่วนกรมชลประทาน',
    dept: 'กระทรวงเกษตรและสหกรณ์',
    category: 'water',
    desc: 'สอบถามข้อมูลสถานการณ์น้ำในเขื่อน คาดการณ์น้ำท่วม-น้ำแล้ง และการบริหารจัดการน้ำระบาย',
    hours: '24 ชั่วโมง',
    tollFree: true,
    priority: false,
    colorTheme: {
      bg: 'from-cyan-500/10 via-blue-500/5 to-transparent',
      border: 'border-cyan-500/30 hover:border-cyan-500/60',
      badge: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-950 dark:text-cyan-300 border-cyan-200',
      iconBg: 'bg-cyan-600 text-white',
      iconColor: 'text-cyan-600'
    }
  },
  {
    number: '191',
    name: 'เหตุด่วนเหตุร้าย (ตำรวจ)',
    dept: 'สำนักงานตำรวจแห่งชาติ',
    category: 'police',
    desc: 'แจ้งเหตุฉุกเฉินทางอาชญากรรม เหตุร้าย หรือขอความช่วยเหลือเร่งด่วนในทุกพื้นที่',
    hours: '24 ชั่วโมง',
    tollFree: true,
    priority: false,
    colorTheme: {
      bg: 'from-purple-500/10 via-slate-500/5 to-transparent',
      border: 'border-purple-500/30 hover:border-purple-500/60',
      badge: 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 border-purple-200',
      iconBg: 'bg-purple-600 text-white',
      iconColor: 'text-purple-600'
    }
  },
  {
    number: '1111',
    name: 'ศูนย์ดำรงธรรม (สำนักนายกรัฐมนตรี)',
    dept: 'สำนักงานปลัดสำนักนายกรัฐมนตรี',
    category: 'disaster',
    desc: 'รับเรื่องร้องเรียน ร้องทุกข์ และประสานความช่วยเหลือผู้ประสบภัยที่ยังไม่ได้รับการดูแล',
    hours: '24 ชั่วโมง',
    tollFree: true,
    priority: false,
    colorTheme: {
      bg: 'from-slate-500/10 via-slate-500/5 to-transparent',
      border: 'border-slate-500/30 hover:border-slate-500/60',
      badge: 'bg-slate-100 text-slate-800 dark:bg-slate-900 dark:text-slate-300 border-slate-200',
      iconBg: 'bg-slate-700 text-white',
      iconColor: 'text-slate-700'
    }
  }
];

interface EmergencyHotlinesProps {
  searchQuery?: string;
}

export const EmergencyHotlines: React.FC<EmergencyHotlinesProps> = ({ searchQuery = '' }) => {
  const [copiedNumber, setCopiedNumber] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const handleCopy = (num: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    navigator.clipboard.writeText(num);
    setCopiedNumber(num);
    toast.success(`คัดลอกเบอร์ ${num} เรียบร้อยแล้ว`, { duration: 2000 });
    setTimeout(() => {
      setCopiedNumber(null);
    }, 2500);
  };

  const filteredHotlines = HOTLINES.filter((h) => {
    if (selectedCategory !== 'all' && h.category !== selectedCategory) {
      return false;
    }
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      h.number.includes(q) ||
      h.name.toLowerCase().includes(q) ||
      h.dept.toLowerCase().includes(q) ||
      h.desc.toLowerCase().includes(q)
    );
  });

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'disaster':
        return <Shield className="w-5 h-5" />;
      case 'medical':
        return <Heart className="w-5 h-5" />;
      case 'fire':
        return <Flame className="w-5 h-5" />;
      case 'transport':
        return <Truck className="w-5 h-5" />;
      case 'water':
        return <Droplets className="w-5 h-5" />;
      default:
        return <Phone className="w-5 h-5" />;
    }
  };

  const categories = [
    { id: 'all', label: 'ทั้งหมด' },
    { id: 'disaster', label: 'ภัยพิบัติ & ปภ.' },
    { id: 'medical', label: 'การแพทย์ & กู้ชีพ' },
    { id: 'fire', label: 'ดับเพลิง & ไฟป่า' },
    { id: 'transport', label: 'คมนาคม & ทางหลวง' },
    { id: 'water', label: 'ชลประทาน & น้ำ' }
  ];

  return (
    <div className="space-y-4">
      {/* Category Tabs */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none snap-x">
        {categories.map((cat) => {
          const isActive = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all snap-start ${
                isActive
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20'
                  : 'bg-white/80 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 hover:bg-slate-100 border border-slate-200 dark:border-slate-700'
              }`}
            >
              {cat.label}
            </button>
          );
        })}
      </div>

      {/* 4-Step Emergency Reporting Protocol Box */}
      <div className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white rounded-3xl p-4 sm:p-5 shadow-lg border border-slate-800">
        <div className="flex items-center gap-2 mb-3">
          <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
          <h3 className="font-bold text-sm text-emerald-300">
            วิธีแจ้งเหตุฉุกเฉินให้เจ้าหน้าที่เข้าช่วยเหลือได้เร็วที่สุด
          </h3>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <div className="bg-white/10 backdrop-blur-sm p-2.5 rounded-xl border border-white/10">
            <span className="text-[10px] font-bold text-indigo-300 block mb-0.5">ขั้นตอนที่ 1</span>
            <p className="text-xs font-semibold text-white">บอกพิกัดจุดเกิดเหตุ</p>
            <p className="text-[10px] text-slate-300">ตำบล อำเภอ หรือจุดสังเกตเด่น</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm p-2.5 rounded-xl border border-white/10">
            <span className="text-[10px] font-bold text-indigo-300 block mb-0.5">ขั้นตอนที่ 2</span>
            <p className="text-xs font-semibold text-white">ระบุประเภทภัย</p>
            <p className="text-[10px] text-slate-300">ระดับน้ำ, เปลวไฟ, หรือตึกถล่ม</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm p-2.5 rounded-xl border border-white/10">
            <span className="text-[10px] font-bold text-indigo-300 block mb-0.5">ขั้นตอนที่ 3</span>
            <p className="text-xs font-semibold text-white">จำนวนผู้ประสบภัย</p>
            <p className="text-[10px] text-slate-300">มีเด็ก/ผู้สูงอายุ/ผู้ป่วยกี่ราย</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm p-2.5 rounded-xl border border-white/10">
            <span className="text-[10px] font-bold text-indigo-300 block mb-0.5">ขั้นตอนที่ 4</span>
            <p className="text-xs font-semibold text-white">อย่าเพิ่งวางสาย</p>
            <p className="text-[10px] text-slate-300">รอจนเจ้าหน้าที่สอบถามครบ</p>
          </div>
        </div>
      </div>

      {/* Hotlines Grid */}
      <div className="space-y-3">
        {filteredHotlines.length === 0 ? (
          <div className="text-center py-10 rounded-2xl bg-white/60 dark:bg-slate-800/60 border border-dashed border-slate-300 dark:border-slate-700">
            <AlertTriangle className="w-8 h-8 text-amber-500 mx-auto mb-2 opacity-80" />
            <p className="font-semibold text-slate-800 dark:text-slate-200 text-sm">ไม่พบหมายเลขที่ค้นหา</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">ลองค้นด้วยตัวเลข เช่น 1784 หรือชื่อหน่วยงาน เช่น ปภ., ดับเพลิง</p>
          </div>
        ) : (
          filteredHotlines.map((item) => (
            <div
              key={item.number}
              className={`p-4 rounded-3xl border bg-white/80 dark:bg-slate-800/90 backdrop-blur-md shadow-sm hover:shadow-md transition-all ${item.colorTheme.border} bg-gradient-to-r ${item.colorTheme.bg}`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-start gap-3.5">
                  <div className={`p-3 rounded-2xl ${item.colorTheme.iconBg} shadow-md flex-shrink-0 mt-0.5`}>
                    {getCategoryIcon(item.category)}
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-wide">
                        {item.number}
                      </span>
                      <h4 className="font-bold text-sm sm:text-base text-slate-800 dark:text-slate-200">
                        {item.name}
                      </h4>
                      {item.tollFree && (
                        <Badge variant="outline" className="text-[9px] py-0 px-1.5 border-emerald-300 text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40">
                          โทรฟรี
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-1">
                      {item.desc}
                    </p>
                    <div className="flex items-center gap-3 text-[11px] text-slate-500 dark:text-slate-400">
                      <span>หน่วยงาน: <strong>{item.dept}</strong></span>
                      <span>•</span>
                      <span className="text-emerald-600 dark:text-emerald-400 font-medium">เปิดทำการ: {item.hours}</span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2 self-end sm:self-center flex-shrink-0 pt-2 sm:pt-0">
                  <button
                    onClick={(e) => handleCopy(item.number, e)}
                    className="p-2.5 rounded-2xl bg-slate-100 dark:bg-slate-700/80 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                    title="คัดลอกเบอร์โทร"
                    aria-label={`คัดลอกเบอร์ ${item.number}`}
                  >
                    {copiedNumber === item.number ? (
                      <Check className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>

                  <a
                    href={`tel:${item.number}`}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-xs shadow-md shadow-emerald-500/20 active:scale-95 transition-transform"
                  >
                    <PhoneCall className="w-4 h-4 animate-bounce" />
                    <span>กดโทรออก</span>
                  </a>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
