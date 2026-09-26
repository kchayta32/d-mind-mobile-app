import React, { useState, useEffect } from 'react';
import { 
  CheckSquare, Square, RotateCcw, CheckCheck, 
  Sparkles, AlertCircle, Backpack, Utensils, Stethoscope, 
  Wrench, FileText, Shirt, Info, ExternalLink
} from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

export interface GoBagItem {
  id: string;
  category: 'food' | 'medical' | 'tools' | 'docs' | 'sanitation';
  title: string;
  desc: string;
  essential: boolean;
}

export const GOBAG_ITEMS: GoBagItem[] = [
  // 1. อาหารและน้ำดื่ม
  {
    id: 'food_water',
    category: 'food',
    title: 'น้ำดื่มสะอาด 3 ลิตร/คน/วัน (รวมอย่างน้อย 9 ลิตร)',
    desc: 'สำหรับดื่มและดำรงชีพพื้นฐานใน 72 ชั่วโมงแรก เพื่อป้องกันภาวะขาดน้ำ',
    essential: true
  },
  {
    id: 'food_canned',
    category: 'food',
    title: 'อาหารพร้อมทานและอาหารกระป๋องแบบมีห่วงดึง',
    desc: 'อาหารที่ไม่ต้องใช้เตาหรือปรุงสุก เช่น ปลากระป๋อง ข้าวสุกพร้อมทาน แกงสำเร็จรูป',
    essential: true
  },
  {
    id: 'food_energy',
    category: 'food',
    title: 'อาหารให้พลังงานสูง (Energy Bars, ช็อกโกแลต, ถั่วอบ)',
    desc: 'น้ำหนักเบา เก็บได้นาน ให้แคลอรีรวดเร็วเมื่อต้องเดินเท้าหรือออกแรงอพยพ',
    essential: false
  },
  {
    id: 'food_water_purifier',
    category: 'food',
    title: 'เม็ดทำความสะอาดน้ำ หรือหลอดกรองน้ำพกพา',
    desc: 'ใช้บำบัดน้ำในธรรมชาติให้ปลอดภัยยามน้ำประปาปนเปื้อนหรือขาดแคลน',
    essential: false
  },

  // 2. ยาและปฐมพยาบาล
  {
    id: 'med_firstaid',
    category: 'medical',
    title: 'ชุดทำแผลและปฐมพยาบาลมาตรฐาน',
    desc: 'ผ้าพันแผล ผ้าก๊อซ พลาสเตอร์ปิดแผล สำลี น้ำเกลือล้างแผล และเบตาดีน',
    essential: true
  },
  {
    id: 'med_personal',
    category: 'medical',
    title: 'ยาประจำตัวและสำเนาใบสั่งยา (สำรองอย่างน้อย 7-14 วัน)',
    desc: 'โดยเฉพาะยาโรคเบาหวาน ความดัน โรคหัวใจ ยาพ่นหอบหืดที่ขาดไม่ได้',
    essential: true
  },
  {
    id: 'med_basic',
    category: 'medical',
    title: 'ยาสามัญประจำบ้าน (พาราเซตามอล, ยาแก้แพ้, ผงเกลือแร่ ORS)',
    desc: 'ยาแก้ท้องเสีย ยาแก้ปวดลดไข้ และผงเกลือแร่ทดแทนน้ำยามท้องร่วง',
    essential: true
  },
  {
    id: 'med_insect',
    category: 'medical',
    title: 'โลชั่น/สเปรย์กันยุง และคาลาไมน์บรรเทาผดผื่น',
    desc: 'ป้องกันยุงลายและแมลงพาหะนำโรคไข้เลือดออกช่วงน้ำท่วมขัง',
    essential: false
  },

  // 3. เครื่องมือกู้ภัยและสื่อสาร
  {
    id: 'tool_flashlight',
    category: 'tools',
    title: 'ไฟฉายแรงสูงกันน้ำ พร้อมถ่านสำรอง',
    desc: 'จำเป็นมากเมื่อไฟฟ้าดับตอนกลางคืน หรือต้องส่งสัญญาณไฟขอความช่วยเหลือ',
    essential: true
  },
  {
    id: 'tool_powerbank',
    category: 'tools',
    title: 'พาวเวอร์แบงก์ (Power Bank) ชาร์จเต็ม 100% พร้อมสายชาร์จ',
    desc: 'ความจุอย่างน้อย 10,000 - 20,000 mAh เพื่อรักษาการติดต่อสื่อสารทางโทรศัพท์',
    essential: true
  },
  {
    id: 'tool_whistle',
    category: 'tools',
    title: 'นกหวีดกู้ภัยความถี่สูง',
    desc: 'ส่งเสียงได้ไกลกว่าและประหยัดพลังงานกว่าการตะโกนเมื่อติดอยู่ใต้ซากอาคาร',
    essential: true
  },
  {
    id: 'tool_radio',
    category: 'tools',
    title: 'วิทยุพกพา AM/FM (แบบใช้ถ่านหรือหมุนมือ)',
    desc: 'รับฟังสัญญาณเตือนภัยของราชการเมื่อระบบอินเทอร์เน็ตและสัญญาณมือถือล่ม',
    essential: false
  },
  {
    id: 'tool_multitool',
    category: 'tools',
    title: 'มีดพับอเนกประสงค์ (Multi-tool)',
    desc: 'มีใบมีด คีม ไขควง ที่เปิดกระป๋อง และกรรไกรในชุดเดียว',
    essential: false
  },
  {
    id: 'tool_lighter',
    category: 'tools',
    title: 'ไฟแช็กกันลม หรือแท่งจุดไฟแมกนีเซียม',
    desc: 'ใช้จุดไฟเพื่อความอบอุ่น ส่งสัญญาณควัน หรือต้มน้ำฆ่าเชื้อ',
    essential: false
  },

  // 4. เอกสารและการเงิน
  {
    id: 'doc_id',
    category: 'docs',
    title: 'บัตรประชาชน ทะเบียนบ้าน และบัตรประกันสุขภาพ (ในซองกันน้ำ)',
    desc: 'ใส่ถุงซิปล็อกกันน้ำอย่างดี เพื่อใช้ยืนยันตัวตนรับสิทธิเยียวยาและการรักษา',
    essential: true
  },
  {
    id: 'doc_cash',
    category: 'docs',
    title: 'เงินสดฉบับย่อย (แบงก์ 20, 50, 100 และเหรียญ)',
    desc: 'ระบบสแกนจ่าย QR Code และตู้ ATM มักใช้งานไม่ได้เมื่อไฟดับและเน็ตล่ม',
    essential: true
  },
  {
    id: 'doc_contacts',
    category: 'docs',
    title: 'สมุดจดเบอร์โทรฉุกเฉินและเบอร์คนในครอบครัว',
    desc: 'เขียนลงกระดาษจริง สำหรับใช้ยามแบตเตอรี่โทรศัพท์หมด',
    essential: false
  },

  // 5. สุขอนามัยและเครื่องนุ่งห่ม
  {
    id: 'san_mask',
    category: 'sanitation',
    title: 'หน้ากาก N95 และหน้ากากอนามัยทางการแพทย์',
    desc: 'ป้องกันฝุ่น PM2.5 ขี้เถ้าควันไฟป่า และเชื้อโรคระบาดในศูนย์อพยพ',
    essential: true
  },
  {
    id: 'san_blanket',
    category: 'sanitation',
    title: 'ผ้าห่มฟอยล์กู้ชีพ (Emergency Space Blanket)',
    desc: 'น้ำหนักเบา เก็บความร้อนของร่างกายได้ถึง 90% ป้องกันภาวะอุณหภูมิกายต่ำ (Hypothermia)',
    essential: true
  },
  {
    id: 'san_raincoat',
    category: 'sanitation',
    title: 'เสื้อกันฝนแบบมีฮู้ด',
    desc: 'กันฝนและลมหนาว ช่วยให้ร่างกายแห้ง ลดความเสี่ยงต่อการเจ็บป่วย',
    essential: true
  },
  {
    id: 'san_wipes',
    category: 'sanitation',
    title: 'ทิชชู่เปียกผสมแอลกอฮอล์ และเจลแอลกอฮอล์ล้างมือ',
    desc: 'รักษาสุขอนามัยยามไม่มีน้ำล้างมือ ป้องกันโรคทางเดินอาหาร',
    essential: false
  },
  {
    id: 'san_bag',
    category: 'sanitation',
    title: 'ถุงขยะดำใบใหญ่ และถุงซิปล็อก',
    desc: 'ใช้ใส่สิ่งปฏิกูล กันเปียกให้สัมภาระ หรือดัดแปลงเป็นเสื้อกันฝนฉุกเฉิน',
    essential: false
  },
  {
    id: 'san_gloves',
    category: 'sanitation',
    title: 'ถุงมือผ้าหนา หรือถุงมือช่าง',
    desc: 'ป้องกันการบาดเจ็บจากเศษแก้ว คมกระเบื้อง ตะปู และเศษไม้หัก',
    essential: false
  }
];

const STORAGE_KEY = 'dmind_gobag_checked_items';

interface GoBagChecklistProps {
  searchQuery?: string;
}

export const GoBagChecklist: React.FC<GoBagChecklistProps> = ({ searchQuery = '' }) => {
  const [checkedIds, setCheckedIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [filterMode, setFilterMode] = useState<'all' | 'unchecked' | 'checked'>('all');

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(checkedIds));
    } catch (e) {
      console.error('Failed to save go-bag state:', e);
    }
  }, [checkedIds]);

  const toggleItem = (id: string) => {
    setCheckedIds((prev) => {
      const isChecked = prev.includes(id);
      const next = isChecked ? prev.filter((item) => item !== id) : [...prev, id];
      if (!isChecked) {
        toast.success('ทำเครื่องหมายจัดเตรียมแล้ว', { duration: 1500 });
      }
      return next;
    });
  };

  const handleCheckAll = () => {
    const allIds = GOBAG_ITEMS.map((item) => item.id);
    setCheckedIds(allIds);
    toast.success('เลือกสิ่งของครบทั้งหมดแล้ว!', { duration: 2000 });
  };

  const handleReset = () => {
    if (window.confirm('คุณต้องการรีเซ็ตรายการในกระเป๋าฉุกเฉินทั้งหมดใช่หรือไม่?')) {
      setCheckedIds([]);
      toast.info('รีเซ็ตรายการทั้งหมดเรียบร้อยแล้ว');
    }
  };

  // Calculations
  const totalCount = GOBAG_ITEMS.length;
  const checkedCount = checkedIds.length;
  const percentage = Math.round((checkedCount / totalCount) * 100);

  // Essential stats
  const essentialItems = GOBAG_ITEMS.filter((item) => item.essential);
  const essentialChecked = essentialItems.filter((item) => checkedIds.includes(item.id)).length;
  const essentialPercentage = Math.round((essentialChecked / essentialItems.length) * 100);

  // Readiness status badge and text
  const getReadinessInfo = () => {
    if (percentage === 100) {
      return {
        badge: 'พร้อมสูงสุด 100%',
        color: 'bg-emerald-500 text-white',
        desc: 'ยอดเยี่ยมมาก! คุณมีความพร้อมในการเอาชีวิตรอดระดับสูงสุด 72 ชั่วโมงเต็ม',
        border: 'border-emerald-500/40 bg-emerald-50/50 dark:bg-emerald-950/20'
      };
    }
    if (percentage >= 75) {
      return {
        badge: 'พร้อมระดับสูง',
        color: 'bg-blue-600 text-white',
        desc: 'เตรียมพร้อมได้ดีมาก สิ่งของหลักครบถ้วน ขาดอีกเพียงเล็กน้อย',
        border: 'border-blue-500/40 bg-blue-50/50 dark:bg-blue-950/20'
      };
    }
    if (percentage >= 40) {
      return {
        badge: 'พร้อมปานกลาง',
        color: 'bg-amber-500 text-white',
        desc: 'มีสิ่งของเบื้องต้นบางส่วน ควรเร่งเติมเต็มสิ่งจำเป็นให้ครบโดยเร็ว',
        border: 'border-amber-500/40 bg-amber-50/50 dark:bg-amber-950/20'
      };
    }
    return {
      badge: 'ยังไม่พร้อม (เสี่ยงสูง)',
      color: 'bg-rose-500 text-white',
      desc: 'กระเป๋าฉุกเฉินยังขาดสิ่งของสำคัญจำนวนมาก กรุณาจัดเตรียมตามเช็กลิสต์',
      border: 'border-rose-500/40 bg-rose-50/50 dark:bg-rose-950/20'
    };
  };

  const readiness = getReadinessInfo();

  // Filter items
  const filteredItems = GOBAG_ITEMS.filter((item) => {
    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchSearch = item.title.toLowerCase().includes(q) || item.desc.toLowerCase().includes(q);
      if (!matchSearch) return false;
    }

    // Category filter
    if (activeCategory !== 'all' && item.category !== activeCategory) {
      return false;
    }

    // Filter mode
    const isChecked = checkedIds.includes(item.id);
    if (filterMode === 'checked' && !isChecked) return false;
    if (filterMode === 'unchecked' && isChecked) return false;

    return true;
  });

  const categories = [
    { id: 'all', label: 'ทั้งหมด', icon: <Backpack className="w-3.5 h-3.5" /> },
    { id: 'food', label: 'อาหาร-น้ำ', icon: <Utensils className="w-3.5 h-3.5" /> },
    { id: 'medical', label: 'ยา-ปฐมพยาบาล', icon: <Stethoscope className="w-3.5 h-3.5" /> },
    { id: 'tools', label: 'เครื่องมือ-สื่อสาร', icon: <Wrench className="w-3.5 h-3.5" /> },
    { id: 'docs', label: 'เอกสาร-การเงิน', icon: <FileText className="w-3.5 h-3.5" /> },
    { id: 'sanitation', label: 'สุขอนามัย-เสื้อผ้า', icon: <Shirt className="w-3.5 h-3.5" /> }
  ];

  return (
    <div className="space-y-4">
      {/* 72h Readiness Progress Glass Card */}
      <div className={`p-4 sm:p-5 rounded-3xl border shadow-sm backdrop-blur-md transition-all ${readiness.border}`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-blue-600 text-white shadow-md shadow-blue-500/20">
              <Backpack className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base text-slate-900 dark:text-white">
                  ความพร้อมกระเป๋าฉุกเฉิน 72 ชม.
                </h3>
                <Badge className={`text-[10px] font-bold py-0.5 px-2 rounded-full ${readiness.color}`}>
                  {readiness.badge}
                </Badge>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                เตรียมแล้ว <strong className="text-blue-600 dark:text-blue-400 font-bold">{checkedCount}</strong> จาก {totalCount} รายการ ({percentage}%)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCheckAll}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 shadow-sm transition-all"
            >
              <CheckCheck className="w-3.5 h-3.5 text-blue-600" />
              <span>เลือกทั้งหมด</span>
            </button>
            <button
              onClick={handleReset}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 shadow-sm transition-all"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
              <span>รีเซ็ต</span>
            </button>
          </div>
        </div>

        {/* Dynamic Progress Bar */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs font-medium text-slate-600 dark:text-slate-300">
            <span>ความพร้อมรวม</span>
            <span className="font-bold text-slate-900 dark:text-white">{percentage}%</span>
          </div>
          <div className="h-3 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden p-0.5">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                percentage === 100
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                  : percentage >= 75
                  ? 'bg-gradient-to-r from-blue-500 to-indigo-500'
                  : percentage >= 40
                  ? 'bg-gradient-to-r from-amber-400 to-orange-500'
                  : 'bg-gradient-to-r from-rose-500 to-red-600'
              }`}
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>

        {/* Readiness Note */}
        <p className="text-xs text-slate-600 dark:text-slate-400 mt-2.5 flex items-start gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-blue-500 mt-0.5 flex-shrink-0" />
          <span>{readiness.desc}</span>
        </p>
      </div>

      {/* Why 72 Hours Info Accordion */}
      <div className="bg-slate-100/70 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80 rounded-2xl p-3.5 flex items-start gap-3">
        <Info className="w-5 h-5 text-indigo-500 flex-shrink-0 mt-0.5" />
        <div className="text-xs text-slate-700 dark:text-slate-300 space-y-1">
          <p className="font-bold text-slate-900 dark:text-white">
            ทำไมต้องเป็นกระเป๋าฉุกเฉิน "72 ชั่วโมง"?
          </p>
          <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
            มาตรฐานสากลด้านภัยพิบัติ (FEMA & UN-OCHA) ระบุว่า ในช่วง 72 ชั่วโมงแรกหลังเกิดภัยรุนแรง
            เส้นทางคมนาคม ไฟฟ้า และการสื่อสารมักถูกตัดขาด ทีมกู้ภัยอาจยังไม่สามารถเข้าถึงพื้นที่ได้
            กระเป๋าใบนี้จะช่วยให้คุณและครอบครัวสามารถเอาชีวิตรอดได้อย่างปลอดภัยจนกว่าความช่วยเหลือจะมาถึง
          </p>
        </div>
      </div>

      {/* Category Pills & Status Filter */}
      <div className="space-y-2">
        <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none snap-x">
          {categories.map((cat) => {
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all snap-start ${
                  isActive
                    ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm'
                    : 'bg-white/80 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 hover:bg-slate-100 border border-slate-200 dark:border-slate-700'
                }`}
              >
                <span>{cat.icon}</span>
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>

        {/* Status Mode Tabs */}
        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-500 dark:text-slate-400">มุมมอง:</span>
          {(['all', 'unchecked', 'checked'] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => setFilterMode(mode)}
              className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                filterMode === mode
                  ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300 font-bold'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {mode === 'all' && `ทั้งหมด (${totalCount})`}
              {mode === 'unchecked' && `ยังไม่ได้เตรียม (${totalCount - checkedCount})`}
              {mode === 'checked' && `เตรียมแล้ว (${checkedCount})`}
            </button>
          ))}
        </div>
      </div>

      {/* Checklist Items List */}
      <div className="space-y-2.5">
        {filteredItems.length === 0 ? (
          <div className="text-center py-8 rounded-2xl bg-white/60 dark:bg-slate-800/60 border border-dashed border-slate-300 dark:border-slate-700">
            <CheckCheck className="w-8 h-8 text-emerald-500 mx-auto mb-2 opacity-80" />
            <p className="font-semibold text-slate-800 dark:text-slate-200 text-sm">ไม่มีรายการในหมวดนี้</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">คุณได้เตรียมสิ่งของในหมวดหมู่นี้ครบถ้วนแล้ว</p>
          </div>
        ) : (
          filteredItems.map((item) => {
            const isChecked = checkedIds.includes(item.id);

            return (
              <div
                key={item.id}
                onClick={() => toggleItem(item.id)}
                className={`flex items-start gap-3.5 p-3.5 rounded-2xl border transition-all cursor-pointer select-none ${
                  isChecked
                    ? 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-300/60 dark:border-emerald-800/50 text-slate-800 dark:text-slate-200'
                    : 'bg-white/80 dark:bg-slate-800/90 border-slate-200/80 dark:border-slate-700/80 hover:border-blue-400/60 text-slate-900 dark:text-white shadow-sm'
                }`}
              >
                <button
                  type="button"
                  className={`mt-0.5 flex-shrink-0 transition-transform ${
                    isChecked ? 'text-emerald-600 dark:text-emerald-400 scale-110' : 'text-slate-400 dark:text-slate-500'
                  }`}
                  aria-label={isChecked ? 'ยกเลิกการเลือก' : 'ทำเครื่องหมายว่าเตรียมแล้ว'}
                >
                  {isChecked ? (
                    <CheckSquare className="w-5 h-5 fill-emerald-100 dark:fill-emerald-900/50" />
                  ) : (
                    <Square className="w-5 h-5" />
                  )}
                </button>

                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-1.5 mb-1">
                    <span
                      className={`text-sm font-semibold leading-tight ${
                        isChecked ? 'line-through text-slate-500 dark:text-slate-400' : 'text-slate-900 dark:text-white'
                      }`}
                    >
                      {item.title}
                    </span>
                    {item.essential && (
                      <Badge className="text-[9px] py-0 px-1.5 bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300 border-red-200">
                        จำเป็นสูงสุด
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
