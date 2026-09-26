import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { 
  ArrowLeft, Info, Map, Bot, Phone, BookOpen, 
  Bell, MessageSquare, Lightbulb, HelpCircle, Satellite, 
  Flame, Droplets, Sun, Waves, Layers, Compass, 
  ChevronRight, ChevronLeft, CheckCircle2, Sparkles, 
  ExternalLink, Eye, ShieldCheck, Activity, Search,
  Radio, FileText, ArrowRight, Check
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const AppGuide: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'satellite' | 'walkthrough' | 'overview' | 'features' | 'tips'>('satellite');
  const [selectedLayer, setSelectedLayer] = useState<'viirs' | 'flood' | 'ndwi_smap' | 'dri'>('viirs');
  const [walkthroughStep, setWalkthroughStep] = useState<number>(0);
  const [faqSearch, setFaqSearch] = useState<string>('');

  // 4 Main GISTDA Layers data
  const gistdaLayers = [
    {
      id: 'viirs' as const,
      name: 'VIIRS Hotspots & ค่า FRP',
      subtitle: 'จุดความร้อนและพลังงานการเผาไหม้',
      icon: <Flame className="w-5 h-5 text-orange-500" />,
      badge: 'ดาวเทียม Suomi NPP / NOAA-20',
      badgeColor: 'bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-300',
      desc: 'ระบบตรวจจับจุดความร้อนจากเซ็นเซอร์ VIIRS ความละเอียดจุดภาพ 375 เมตร ตรวจจับทั้งเวลากลางวันและกลางคืนได้อย่างแม่นยำสูง',
      colorScale: [
        { label: '< 10 MW', color: 'bg-yellow-400', desc: 'ไฟความรุนแรงต่ำ เช่น ไฟลามทุ่ง/เผาเศษวัชพืชแปลงเล็ก' },
        { label: '10 - 50 MW', color: 'bg-orange-500', desc: 'ไฟความรุนแรงปานกลาง ลุกลามเป็นแนวยาว' },
        { label: '50 - 150 MW', color: 'bg-red-500', desc: 'ไฟความรุนแรงสูง ไฟป่าโหมหนัก ควันหนาแน่น' },
        { label: '> 150 MW', color: 'bg-purple-600', desc: 'ไฟรุนแรงระดับวิกฤตสูงสุด เปลวไฟรุนแรง อุณหภูมิสูงมาก' }
      ],
      details: [
        {
          title: 'ค่า FRP (Fire Radiative Power) คืออะไร?',
          content: 'FRP มีหน่วยเป็น เมกะวัตต์ (MW) คืออัตราการแผ่พลังงานความร้อนที่ปล่อยออกมาจากการเผาไหม้ในขณะที่ดาวเทียมโคจรผ่าน ยิ่งค่า FRP สูง บ่งชี้ว่าไฟกำลังลุกไหม้อย่างรุนแรง ปลดปล่อยก๊าซคาร์บอนไดออกไซด์และอนุภาคฝุ่น PM2.5 ในปริมาณมหาศาล'
        },
        {
          title: 'ระดับความเชื่อมั่น (Confidence Level)',
          content: 'ระบบ VIIRS แบ่งระดับความน่าเชื่อถือเป็น 3 ระดับ: ต่ำ (Low < 30%), ปานกลาง (Nominal 30-80%), และสูง (High > 80%) ช่วยคัดกรองสัญญาณรบกวนจากแสงสะท้อนของหลังคาโลหะหรือเมฆ'
        },
        {
          title: 'การวิเคราะห์พื้นที่เผาไหม้ซ้ำซาก (Burn Scar)',
          content: 'ในแอพ D-MIND สามารถเปิดเลเยอร์ "พื้นที่เผาไหม้ซ้ำซาก" เพื่อซ้อนทับสถิติการเกิดไฟป่าย้อนหลัง ช่วยให้เจ้าหน้าที่ป่าไม้และชุมชนจัดกำลังลาดตระเวนเชิงรุกก่อนเกิดเหตุ'
        }
      ],
      practicalTip: 'หากพบจุดความร้อนที่มีค่า FRP เกิน 50 MW ในระยะ 5 กิโลเมตรจากที่พักอาศัย ให้เตรียมสวมหน้ากาก N95 ปิดบ้านให้สนิท และติดตามทิศทางลมเพื่อเตรียมพร้อมอพยพทันที'
    },
    {
      id: 'flood' as const,
      name: 'พื้นที่น้ำท่วม & น้ำท่วมซ้ำซาก',
      subtitle: 'ภาพถ่ายเรดาร์ตรวจวัดน้ำท่วมขัง',
      icon: <Droplets className="w-5 h-5 text-blue-500" />,
      badge: 'ดาวเทียม Sentinel-1 (SAR) / GISTDA',
      badgeColor: 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300',
      desc: 'ใช้คลื่นไมโครเวฟเรดาร์ (Synthetic Aperture Radar) ยิงทะลุผ่านเมฆฝนและควันไฟได้ตลอด 24 ชั่วโมง เพื่อตรวจจับขอบเขตผิวน้ำท่วมขังจริงบนพื้นดิน',
      colorScale: [
        { label: 'สีน้ำเงินเข้ม', color: 'bg-blue-600', desc: 'แหล่งน้ำถาวรเดิม (แม่น้ำ ทะเลสาบ อ่างเก็บน้ำ)' },
        { label: 'สีฟ้าสว่าง', color: 'bg-cyan-400', desc: 'พื้นที่น้ำท่วมขังฉับพลันล่าสุด (Flood Extent)' },
        { label: 'สีม่วง/ชมพู', color: 'bg-fuchsia-500', desc: 'พื้นที่น้ำท่วมซ้ำซากในรอบ 1-10 ปี (High Frequency)' }
      ],
      details: [
        {
          title: 'หลักการของเรดาร์ SAR ตรวจน้ำท่วม',
          content: 'ผิวน้ำที่ราบเรียบจะสะท้อนคลื่นเรดาร์ออกไปในทิศทางตรงข้ามกับดาวเทียม (Specular Reflection) ทำให้สัญญาณสะท้อนกลับมีค่าน้อยมาก ปรากฏเป็นโทนสีเข้ม เมื่อนำมาเปรียบเทียบกับภาพถ่ายก่อนน้ำท่วม จะสามารถสกัดพื้นที่น้ำท่วมได้อย่างแม่นยำระดับตารางเมตร'
        },
        {
          title: 'พื้นที่น้ำท่วมซ้ำซาก (Flood Frequency Map)',
          content: 'รวบรวมข้อมูลสถิติน้ำท่วมย้อนหลังของ GISTDA ช่วยระบุว่าพื้นที่ใดมีโอกาสท่วมซ้ำกี่ครั้งในรอบทศวรรษ เหมาะสำหรับการประเมินความเสี่ยงที่ตั้งบ้านเรือนและการจัดตั้งศูนย์อพยพ'
        },
        {
          title: 'การเชื่อมต่อ GloFAS (Open-Meteo)',
          content: 'D-MIND นำข้อมูลการคาดการณ์ปริมาณน้ำท่าและการไหลของแม่น้ำสายหลัก (River Discharge) มาร่วมแสดงผล ช่วยคาดการณ์การเอ่อล้นตลิ่งล่วงหน้า 3-7 วัน'
        }
      ],
      practicalTip: 'หากบ้านของคุณอยู่ในเขตสีม่วง (พื้นที่ท่วมซ้ำซาก) และมีน้ำหลากสีฟ้าขยายตัวประชิด ให้ยกของขึ้นที่สูงทันทีก่อนที่ระดับน้ำจะปิดเส้นทางสัญจร'
    },
    {
      id: 'ndwi_smap' as const,
      name: 'ความชื้นพืช NDWI & ดิน SMAP',
      subtitle: 'ดัชนีตรวจวัดน้ำในพืชและความชื้นใต้ผิวดิน',
      icon: <Waves className="w-5 h-5 text-teal-500" />,
      badge: 'Sentinel-2 / Terra / NASA SMAP',
      badgeColor: 'bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300',
      desc: 'ประเมินสภาวะการขาดน้ำของระบบนิเวศ พืชพรรณ และความชื้นสะสมในชั้นดิน เพื่อเตือนภัยแล้งและวิเคราะห์ความเสี่ยงดินถล่ม',
      colorScale: [
        { label: 'NDWI > 0.3', color: 'bg-emerald-500', desc: 'พืชพรรณชุ่มชื้นสูงมาก ปริมาณน้ำอุดมสมบูรณ์ เสี่ยงไฟต่ำ' },
        { label: 'NDWI 0.0 - 0.3', color: 'bg-lime-500', desc: 'ความชื้นปานกลาง สภาพพืชพรรณปกติ' },
        { label: 'NDWI < 0.0', color: 'bg-amber-500', desc: 'พืชขาดน้ำอย่างรุนแรง ใบแห้งกรอบ เชื้อเพลิงไวไฟสูง' },
        { label: 'SMAP อิ่มตัว', color: 'bg-blue-500', desc: 'ดินอุ้มน้ำเต็มที่ หากฝนตกซ้ำจะเกิดน้ำหลากและดินถล่มทันที' }
      ],
      details: [
        {
          title: 'NDWI (Normalized Difference Water Index)',
          content: 'คำนวณจากแถบคลื่น Near-Infrared (NIR) และ Short-Wave Infrared (SWIR) ซึ่งดูดกลืนน้ำในเซลล์พืชได้ดี หากค่า NDWI ลดลงอย่างรวดเร็ว แสดงว่าป่าหรือแปลงเกษตรกำลังเข้าสู่ภาวะแล้งวิกฤต'
        },
        {
          title: 'SMAP (Soil Moisture Active Passive)',
          content: 'ดาวเทียมตรวจวัดความชื้นในดินลึก 0-5 ซม. (Surface) และระดับรากพืช (Root Zone) หน่วยวัดเป็น m³/m³ ใช้ประเมินทั้งภัยแล้งทางการเกษตร และการอิ่มตัวของดินบริเวณเชิงเขาที่เสี่ยงต่อดินสไลด์'
        }
      ],
      practicalTip: 'เกษตรกรสามารถใช้ค่า NDWI วางแผนรอบการให้น้ำได้อย่างแม่นยำ ส่วนผู้ที่อยู่ใกล้แนวเขา หากค่า SMAP สูงเกิน 0.35 m³/m³ ร่วมกับมีฝนตกหนัก ให้เตรียมพร้อมรับเหตุดินโคลนถล่ม'
    },
    {
      id: 'dri' as const,
      name: 'ดัชนีภัยแล้ง DRIPlus (GISTDA)',
      subtitle: 'ดัชนีชี้วัดความเสี่ยงภัยแล้งแบบบูรณาการ',
      icon: <Sun className="w-5 h-5 text-amber-500" />,
      badge: 'GISTDA Drought Risk Index Plus',
      badgeColor: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300',
      desc: 'ดัชนีชี้วัดภัยแล้งระดับชาติที่สังเคราะห์ข้อมูลจาก 4 ปัจจัย: ฝนทิ้งช่วง (SPI), ความสมบูรณ์พืชพรรณ (VCI), ความชื้นดิน (SMI) และความต้องการใช้น้ำ',
      colorScale: [
        { label: 'สีแดงเข้ม', color: 'bg-red-700', desc: 'ภัยแล้งรุนแรงมากที่สุด (Extreme Drought) แหล่งน้ำแห้งขอด' },
        { label: 'สีส้ม', color: 'bg-orange-500', desc: 'ภัยแล้งรุนแรง (Severe Drought) พืชผลเสียหายวงกว้าง' },
        { label: 'สีเหลือง', color: 'bg-yellow-400', desc: 'ภัยแล้งปานกลาง (Moderate Drought) เริ่มขาดแคลนน้ำ' },
        { label: 'สีเขียว', color: 'bg-emerald-500', desc: 'สภาวะปกติ (Normal) แหล่งน้ำเพียงพอ' }
      ],
      details: [
        {
          title: 'บูรณาการ 4 มิติเพื่อความแม่นยำสูงสุด',
          content: 'DRIPlus ของ GISTDA ไม่ได้ดูแค่ฝนที่ไม่ตก แต่รวมถึงการเหี่ยวเฉาของพืชพรรณจริงจากภาพถ่ายดาวเทียม และความจุของอ่างเก็บน้ำในลุ่มน้ำนั้นๆ'
        },
        {
          title: 'ประโยชน์สำหรับประชาชนและเกษตรกร',
          content: 'ช่วยวางแผนการเพาะปลูก หลีกเลี่ยงการปลูกพืชใช้น้ำมากในช่วงที่พื้นที่แสดงสัญลักษณ์สีส้มหรือแดง และช่วยให้หน่วยงานภาครัฐจัดสรรรถบรรทุกน้ำดื่มได้ตรงจุด'
        }
      ],
      practicalTip: 'หากพื้นที่ของคุณเปลี่ยนเป็นสีส้มในแผนที่ DRIPlus ให้เริ่มมาตรการสำรองน้ำอุปโภคบริโภคทันที และซ่อมแซมจุดรั่วไหลของท่อประปาในบ้าน'
    }
  ];

  // Walkthrough steps
  const walkthroughSteps = [
    {
      title: '1. เริ่มต้นสำรวจแดชบอร์ดภัยพิบัติเรียลไทม์',
      subtitle: 'เกาะติดสถานการณ์รอบตัวคุณในหน้าแรก',
      desc: 'เมื่อเปิดแอพ D-MIND คุณจะพบกับแถบสรุปสถานการณ์ฉุกเฉินระดับประเทศ การแจ้งเตือนตามตำแหน่ง GPS ปัจจุบัน และดัชนีคุณภาพอากาศ (PM2.5) แบบสดๆ พร้อมระดับความรุนแรงตามรหัสสีสากล',
      badge: 'หน้าแรก / Index',
      link: '/',
      linkText: 'ไปที่หน้าแดชบอร์ด',
      icon: <Activity className="w-6 h-6 text-blue-500" />,
      features: [
        'แถบสถานะภัยพิบัติแบบเรียลไทม์ (Live Disaster Ticker)',
        'การ์ดสภาพอากาศและการเตือนภัยล่วงหน้า 24 ชม.',
        'ปุ่มทางลัดโทรสายด่วนฉุกเฉินและขอความช่วยเหลือ'
      ]
    },
    {
      title: '2. ใช้งานแผนที่ดาวเทียม GISTDA & เปิดเลเยอร์วิเคราะห์',
      subtitle: 'ดูจุดความร้อน น้ำท่วม และความแห้งแล้งบนแผนที่จริง',
      desc: 'เข้าสู่หน้า "แผนที่ภัยพิบัติ" เพื่อดูพิกัดจุดความร้อน VIIRS ขอบเขตน้ำท่วมขัง และเซ็นเซอร์วัดฝน คุณสามารถเปิด-ปิดเลเยอร์ และปรับช่วงเวลาของข้อมูลได้อิสระ',
      badge: 'แผนที่ / DisasterMap',
      link: '/disaster-map',
      linkText: 'เปิดแผนที่ดาวเทียม',
      icon: <Map className="w-6 h-6 text-indigo-500" />,
      features: [
        'คลิกที่ไอคอนจุดความร้อนเพื่อดูค่า FRP และพิกัดละติจูด/ลองจิจูด',
        'สลับเปิดเลเยอร์น้ำท่วมซ้ำซาก เพื่อประเมินพื้นที่ปลอดภัย',
        'วัดระยะห่างระหว่างตำแหน่งของคุณกับแนวไฟป่าหรือกระแสน้ำ'
      ]
    },
    {
      title: '3. ปรึกษา Dr.Mind AI ผู้ช่วยฉุกเฉินอัจฉริยะ',
      subtitle: 'ถามคำถามด้านการเอาชีวิตรอดและปฐมพยาบาลได้ 24 ชม.',
      desc: 'มีข้อสงสัยหรือติดอยู่ในเหตุการณ์คับขัน? พิมพ์หรือพูดคุยกับ Dr.Mind AI ซึ่งได้รับการเทรนข้อมูลจากคู่มือรับมือภัยพิบัติสากลและแนวทางเวชศาสตร์ฉุกเฉิน',
      badge: 'AI Assistant / Dr.Mind',
      link: '/assistant',
      linkText: 'สนทนากับ Dr.Mind AI',
      icon: <Bot className="w-6 h-6 text-purple-500" />,
      features: [
        'คำแนะนำเฉพาะสถานการณ์ เช่น "น้ำเริ่มเข้าบ้านชั้นล่างควรทำอย่างไร"',
        'การประเมินอาการบาดเจ็บและวิธีปฐมพยาบาลเบื้องต้น',
        'ค้นหาสถานที่หลบภัยที่ใกล้ที่สุด'
      ]
    },
    {
      title: '4. เช็กกระเป๋าฉุกเฉิน 72 ชม. & สายด่วนแห่งชาติ',
      subtitle: 'เตรียมตัวให้พร้อมก่อนภัยมาถึงด้วยเช็กลิสต์อินเทอร์แอคทีฟ',
      desc: 'เข้าสู่หน้า "คู่มือฉุกเฉิน" เพื่อตรวจสอบกระเป๋า Go-Bag 72 ชม. ติ๊กบันทึกสิ่งของลงเครื่อง และเข้าถึงเบอร์โทรฉุกเฉิน 1784, 199, 1669 ที่โทรออกได้ในคลิกเดียว',
      badge: 'คู่มือ / Manual',
      link: '/manual',
      linkText: 'ไปที่กระเป๋าฉุกเฉินและสายด่วน',
      icon: <BookOpen className="w-6 h-6 text-emerald-500" />,
      features: [
        'แถบวัดเปอร์เซ็นต์ความพร้อมของกระเป๋าฉุกเฉิน (บันทึกอัตโนมัติ)',
        'ปุ่มโทรสายด่วน 1784 ปภ. และ 1669 กู้ชีพในคลิกเดียว',
        'แนวทางเอาตัวรอด 5 ภัยพิบัติหลักพร้อมหลักการ DOs & DON\'Ts'
      ]
    },
    {
      title: '5. แจ้งเหตุ ประเมินความเสียหาย และติดตามข่าวกรอง',
      subtitle: 'เป็นหูเป็นตาให้ชุมชนและประสานขอรับความช่วยเหลือ',
      desc: 'สามารถถ่ายรูปรายงานเหตุน้ำท่วม ดินสไลด์ หรือไฟป่าส่งตรงเข้าสู่ระบบ พร้อมพิกัด GPS เพื่อให้เจ้าหน้าที่และประชาชนในพื้นที่รับทราบสถานการณ์ร่วมกัน',
      badge: 'รายงาน / IncidentReports',
      link: '/incident-reports',
      linkText: 'รายงานสถานการณ์ภัย',
      icon: <Bell className="w-6 h-6 text-rose-500" />,
      features: [
        'รายงานผู้ประสบภัย (Victim Reports) เพื่อขอการกู้ชีพเร่งด่วน',
        'ประเมินความเสียหายเบื้องต้น (Damage Assessment) เพื่อสิทธิเยียวยา',
        'ตั้งค่าแจ้งเตือนเฉพาะพื้นที่ตามจังหวัดที่คุณพักอาศัย'
      ]
    }
  ];

  // Core Features
  const coreFeatures = [
    { 
      icon: <Map className="w-6 h-6" />, 
      title: 'แผนที่ดาวเทียมบูรณาการ', 
      desc: 'แสดงตำแหน่งจุดความร้อน VIIRS, ขอบเขตน้ำท่วม Sentinel-1, ความชื้นดิน SMAP และแผ่นดินไหวแบบเรียลไทม์', 
      color: 'bg-gradient-to-br from-blue-500 to-indigo-600',
      tag: 'GISTDA & TMD',
      path: '/disaster-map'
    },
    { 
      icon: <Bot className="w-6 h-6" />, 
      title: 'Dr.Mind AI ผู้ช่วยฉุกเฉิน', 
      desc: 'ระบบ AI ให้คำแนะนำทางการแพทย์ การเอาชีวิตรอดจากภัยพิบัติ และการปฐมพยาบาลตลอด 24 ชั่วโมง', 
      color: 'bg-gradient-to-br from-purple-500 to-pink-600',
      tag: 'AI 24/7',
      path: '/assistant'
    },
    { 
      icon: <BookOpen className="w-6 h-6" />, 
      title: 'คู่มือ 5 ภัย & กระเป๋า 72 ชม.', 
      desc: 'คู่มือปฏิบัติการฉุกเฉินสากล พร้อมเช็กลิสต์จัดกระเป๋า Go-Bag ที่บันทึกสถานะลงเครื่องได้ทันที', 
      color: 'bg-gradient-to-br from-emerald-500 to-teal-600',
      tag: 'Interactive',
      path: '/manual'
    },
    { 
      icon: <Phone className="w-6 h-6" />, 
      title: 'สายด่วนกู้ชีพแห่งชาติ', 
      desc: 'รวบรวมเบอร์โทร 1784, 199, 1669, 1362, 1146 โทรออกได้ในคลิกเดียว พร้อมระบบคัดลอกหมายเลข', 
      color: 'bg-gradient-to-br from-red-500 to-rose-600',
      tag: '1-Click Dial',
      path: '/contacts'
    },
    { 
      icon: <Bell className="w-6 h-6" />, 
      title: 'ระบบเตือนภัยฉุกเฉิน', 
      desc: 'แจ้งเตือนฝนตกหนัก น้ำป่า ดินถล่ม และค่าฝุ่นละออง PM2.5 เกินมาตรฐานตามพิกัดของผู้ใช้งาน', 
      color: 'bg-gradient-to-br from-orange-500 to-amber-600',
      tag: 'Real-time Push',
      path: '/alerts'
    },
    { 
      icon: <MessageSquare className="w-6 h-6" />, 
      title: 'รายงานเหตุและขอความช่วยเหลือ', 
      desc: 'ปักหมุดรายงานภัยพิบัติ แนบรูปถ่าย และส่งคำขอความช่วยเหลือสำหรับผู้ติดค้างในพื้นที่วิกฤต', 
      color: 'bg-gradient-to-br from-cyan-500 to-blue-600',
      tag: 'Community',
      path: '/victim-reports'
    }
  ];

  // Tips & FAQs
  const tips = [
    { 
      title: 'การดูความเร็วของไฟป่าจาก FRP', 
      desc: 'หากจุดความร้อนมีค่า FRP เกิน 100 MW ไฟจะลุกลามเร็วกว่าปกติถึง 3 เท่า โดยเฉพาะเมื่อมีลมกระโชกแรง ให้หลีกเลี่ยงการเข้าใกล้ทุกกรณี',
      icon: '🔥',
      color: 'border-orange-500 bg-orange-50/50 dark:bg-orange-950/20'
    },
    { 
      title: 'ความลึกของน้ำกับความปลอดภัย', 
      desc: 'น้ำหลากเชี่ยวเพียง 15 เซนติเมตร (ระดับข้อเท้า) สามารถพัดให้ผู้ใหญ่ล้มได้ และระดับน้ำ 30 เซนติเมตร สามารถพัดพารถยนต์ส่วนบุคคลลอยตามน้ำได้',
      icon: '🌊',
      color: 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/20'
    },
    { 
      title: 'กฎเหล็กเมื่อแผ่นดินไหวในอาคาร', 
      desc: 'อย่าวิ่งหนีออกนอกอาคารขณะกำลังสั่นไหว ให้ "หมอบ กำบัง ยึดแน่น" ใต้โต๊ะแข็งแรง และห้ามใช้ลิฟต์เด็ดขาดแม้หยุดสั่นแล้ว',
      icon: '🏢',
      color: 'border-amber-500 bg-amber-50/50 dark:bg-amber-950/20'
    },
    { 
      title: 'สัญญาณโทรศัพท์ขัดข้องช่วงภัยพิบัติ', 
      desc: 'หากโทรออกไม่ได้เนื่องจากคู่สายหนาแน่น ให้ใช้วิธีส่งข้อความ SMS สั้นๆ ระบุพิกัดและจำนวนคน เพราะใช้แบนด์วิดท์ต่ำกว่าและส่งผ่านได้ง่ายกว่า',
      icon: '📱',
      color: 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20'
    }
  ];

  const faqs = [
    { 
      q: 'ข้อมูลดาวเทียมใน D-MIND อัปเดตบ่อยแค่ไหน?', 
      a: 'จุดความร้อน VIIRS อัปเดตวันละ 2-4 รอบตามรอบการโคจรของดาวเทียม Suomi NPP และ NOAA-20 ส่วนข้อมูลน้ำท่วมและสภาพอากาศอัปเดตทุก 1-3 ชั่วโมง' 
    },
    { 
      q: 'ค่า FRP ต่างจากอุณหภูมิผิวหน้าอย่างไร?', 
      a: 'FRP (Fire Radiative Power) วัดอัตราการปลดปล่อยพลังงานความร้อนจริงในหน่วยเมกะวัตต์ (MW) ซึ่งบอกความรุนแรงและอัตราการเผาไหม้ได้แม่นยำกว่าอุณหภูมิปกติที่อาจถูกบดบังด้วยควันหรือความร้อนสะสม' 
    },
    { 
      q: 'สามารถใช้งานแอพได้หรือไม่หากไม่มีสัญญาณอินเทอร์เน็ต?', 
      a: 'หน้าคู่มือเอาตัวรอด 5 ภัย, เช็กลิสต์กระเป๋า 72 ชม. และเบอร์โทรฉุกเฉิน ได้รับการออกแบบให้ทำงานแบบออฟไลน์ได้ (Offline-ready) ส่วนข้อมูลดาวเทียมจะแสดงค่าที่แคชไว้ล่าสุด' 
    },
    { 
      q: 'ข้อมูลดาวเทียมมาจากหน่วยงานใด?', 
      a: 'D-MIND บูรณาการข้อมูลจากสำนักงานพัฒนาเทคโนโลยีอวกาศและภูมิสารสนเทศ (GISTDA), กรมอุตุนิยมวิทยา (TMD), กรมป้องกันและบรรเทาสาธารณภัย (ปภ.) และ NASA FIRMS' 
    }
  ];

  const filteredFaqs = faqs.filter(f => 
    !faqSearch.trim() || 
    f.q.toLowerCase().includes(faqSearch.toLowerCase()) || 
    f.a.toLowerCase().includes(faqSearch.toLowerCase())
  );

  const selectedLayerData = gistdaLayers.find(l => l.id === selectedLayer) || gistdaLayers[0];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/40 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800 pb-28">
      {/* Modern Glassmorphic Header */}
      <header className="relative bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white pt-5 pb-8 px-4 sm:px-6 rounded-b-[2.5rem] shadow-xl overflow-hidden">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-56 h-56 rounded-full bg-white/10 blur-2xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-10 w-40 h-40 rounded-full bg-cyan-400/20 blur-xl pointer-events-none" />

        <div className="relative z-10 max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2.5">
              <Button
                variant="ghost"
                size="icon"
                className="text-white/90 hover:bg-white/20 rounded-2xl h-10 w-10 backdrop-blur-sm"
                onClick={() => navigate('/')}
                aria-label="ย้อนกลับ"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div className="flex items-center gap-3">
                <div className="bg-white/20 p-2.5 rounded-2xl backdrop-blur-md shadow-inner border border-white/20">
                  <Satellite className="h-5 w-5 text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white drop-shadow-sm">
                      คู่มือการใช้งานระบบ D-MIND
                    </h1>
                    <Badge className="bg-emerald-500/90 text-white text-[10px] font-bold border-none px-2 py-0.5">
                      v2.0
                    </Badge>
                  </div>
                  <p className="text-white/80 text-xs font-medium">
                    เรียนรู้การอ่านแผนที่ดาวเทียม GISTDA และวิธีใช้งานครบทุกฟังก์ชัน
                  </p>
                </div>
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setActiveTab('walkthrough');
                setWalkthroughStep(0);
              }}
              className="hidden sm:inline-flex bg-white/15 hover:bg-white/25 text-white border-white/30 rounded-2xl text-xs gap-1.5 backdrop-blur-sm"
            >
              <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
              <span>เริ่มทัวร์แนะนำ</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Tab Pills */}
      <div className="px-4 sm:px-6 -mt-4 max-w-4xl mx-auto">
        <div className="bg-white/90 dark:bg-slate-800/90 rounded-2xl shadow-xl p-1.5 flex gap-1 border border-slate-200/80 dark:border-slate-700/80 backdrop-blur-md overflow-x-auto scrollbar-none">
          {[
            { id: 'satellite' as const, label: 'แผนที่ดาวเทียม GISTDA', icon: <Satellite className="w-4 h-4 text-purple-500" /> },
            { id: 'walkthrough' as const, label: 'Walkthrough ทีละขั้น', icon: <Compass className="w-4 h-4 text-indigo-500" /> },
            { id: 'overview' as const, label: 'ภาพรวม', icon: <Info className="w-4 h-4 text-blue-500" /> },
            { id: 'features' as const, label: 'ฟีเจอร์หลัก', icon: <Layers className="w-4 h-4 text-emerald-500" /> },
            { id: 'tips' as const, label: 'เคล็ดลับ & FAQ', icon: <Lightbulb className="w-4 h-4 text-amber-500" /> }
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 min-w-[100px] py-2 px-2.5 rounded-xl text-xs font-bold transition-all duration-300 flex items-center justify-center gap-1.5 whitespace-nowrap ${
                  isActive
                    ? 'bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white shadow-md shadow-purple-500/25 scale-[1.01]'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/60'
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Content Container */}
      <main className="px-4 sm:px-6 pt-5 max-w-4xl mx-auto">
        {/* ================= TAB 1: SATELLITE MAP GUIDE ================= */}
        {activeTab === 'satellite' && (
          <div className="space-y-5">
            {/* Header intro card */}
            <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-indigo-500/10 via-purple-500/5 to-transparent border border-indigo-500/20 backdrop-blur-md">
              <div className="flex items-start gap-3">
                <div className="p-3 rounded-2xl bg-indigo-600 text-white shadow-md shadow-indigo-500/20 flex-shrink-0">
                  <Satellite className="w-6 h-6 animate-pulse" />
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                      คู่มืออ่านและแปลความหมายแผนที่ดาวเทียม GISTDA
                    </h2>
                    <Badge className="bg-purple-600 text-white text-[10px]">ข้อมูลอวกาศเพื่อการเตือนภัย</Badge>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    D-MIND นำชั้นข้อมูลดาวเทียมสำรวจโลก (Earth Observation Satellites) ของ GISTDA, NASA และ ESA มาประมวลผล เพื่อให้ประชาชนสามารถเข้าใจระดับความรุนแรงของภัยพิบัติและเตรียมพร้อมได้อย่างแม่นยำ
                  </p>
                </div>
              </div>
            </div>

            {/* Layer Selector Tabs */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {gistdaLayers.map((layer) => {
                const isSelected = selectedLayer === layer.id;
                return (
                  <button
                    key={layer.id}
                    onClick={() => setSelectedLayer(layer.id)}
                    className={`p-3 rounded-2xl border text-left transition-all duration-300 flex flex-col justify-between ${
                      isSelected
                        ? 'bg-white dark:bg-slate-800 border-indigo-500 ring-2 ring-indigo-500/30 shadow-md scale-[1.02]'
                        : 'bg-white/70 dark:bg-slate-800/70 border-slate-200/80 dark:border-slate-700/80 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-700/80">
                        {layer.icon}
                      </div>
                      {isSelected && (
                        <span className="w-2 h-2 rounded-full bg-indigo-600 animate-ping" />
                      )}
                    </div>
                    <div>
                      <h4 className="font-bold text-xs text-slate-900 dark:text-white leading-tight">
                        {layer.name}
                      </h4>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">
                        {layer.subtitle}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Selected Layer In-Depth Card */}
            <div className="p-5 sm:p-6 rounded-3xl bg-white/90 dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/80 shadow-sm backdrop-blur-md space-y-5">
              {/* Layer Title Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-700/60">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-800">
                    {selectedLayerData.icon}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                        {selectedLayerData.name}
                      </h3>
                      <Badge variant="outline" className={`text-[10px] ${selectedLayerData.badgeColor}`}>
                        {selectedLayerData.badge}
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      {selectedLayerData.desc}
                    </p>
                  </div>
                </div>

                <Button
                  size="sm"
                  onClick={() => navigate('/disaster-map')}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs rounded-xl shadow-md shadow-indigo-500/20 gap-1.5 self-start sm:self-auto"
                >
                  <Map className="w-3.5 h-3.5" />
                  <span>ดูเลเยอร์นี้บนแผนที่</span>
                </Button>
              </div>

              {/* Color Ramp / Interpretation Scale */}
              <div>
                <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-indigo-500" />
                  <span>แถบสีและการแปลความหมายข้อมูล (Color Ramp & Values)</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {selectedLayerData.colorScale.map((scale, i) => (
                    <div
                      key={i}
                      className="p-3 rounded-2xl bg-slate-50/80 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 flex items-start gap-3"
                    >
                      <span className={`w-3.5 h-3.5 rounded-full ${scale.color} flex-shrink-0 mt-0.5 shadow-sm`} />
                      <div>
                        <span className="font-bold text-xs text-slate-900 dark:text-white block">
                          {scale.label}
                        </span>
                        <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5 leading-relaxed">
                          {scale.desc}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Technical Details Accordion / Cards */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-indigo-500" />
                  <span>สาระสำคัญและหลักการทางวิทยาศาสตร์</span>
                </h4>
                <div className="space-y-2.5">
                  {selectedLayerData.details.map((detail, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-2xl bg-slate-50/60 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800/80"
                    >
                      <h5 className="font-bold text-xs text-indigo-600 dark:text-indigo-400 mb-1 flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-indigo-500 flex-shrink-0" />
                        <span>{detail.title}</span>
                      </h5>
                      <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed pl-5">
                        {detail.content}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Practical Life-Saving Tip Box */}
              <div className="p-4 rounded-2xl bg-amber-50/80 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-900/40 flex items-start gap-3">
                <Lightbulb className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                <div className="text-xs text-slate-700 dark:text-slate-300">
                  <strong className="text-amber-900 dark:text-amber-300 font-bold block mb-1">
                    ข้อแนะนำเชิงปฏิบัติเมื่อพบค่านี้ในพื้นที่ของคุณ:
                  </strong>
                  <p className="leading-relaxed text-slate-600 dark:text-slate-300">
                    {selectedLayerData.practicalTip}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 2: STEP-BY-STEP WALKTHROUGH ================= */}
        {activeTab === 'walkthrough' && (
          <div className="space-y-4">
            {/* Walkthrough Header & Stepper */}
            <div className="p-4 rounded-3xl bg-white/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 shadow-sm backdrop-blur-md">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="font-bold text-base text-slate-900 dark:text-white">
                    คู่มือพาชมระบบทีละขั้นตอน (Walkthrough Tour)
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    ขั้นตอนที่ {walkthroughStep + 1} จากทั้งหมด {walkthroughSteps.length} ขั้นตอน
                  </p>
                </div>
                <Badge className="bg-indigo-600 text-white text-xs px-2.5 py-0.5">
                  Step {walkthroughStep + 1} / {walkthroughSteps.length}
                </Badge>
              </div>

              {/* Progress bar & Step dots */}
              <div className="space-y-2">
                <div className="h-2 w-full bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 transition-all duration-300 rounded-full"
                    style={{ width: `${((walkthroughStep + 1) / walkthroughSteps.length) * 100}%` }}
                  />
                </div>
                <div className="flex justify-between items-center px-1">
                  {walkthroughSteps.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setWalkthroughStep(idx)}
                      className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                        walkthroughStep === idx
                          ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/30 scale-110'
                          : idx < walkthroughStep
                          ? 'bg-emerald-500 text-white'
                          : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      {idx < walkthroughStep ? <Check className="w-3.5 h-3.5" /> : idx + 1}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Current Step Active Card */}
            {(() => {
              const currentStep = walkthroughSteps[walkthroughStep];
              return (
                <div className="p-5 sm:p-6 rounded-3xl bg-white/90 dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/80 shadow-md backdrop-blur-md space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="p-3.5 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-800/60 shadow-sm flex-shrink-0">
                      {currentStep.icon}
                    </div>
                    <div>
                      <Badge variant="outline" className="text-[10px] text-indigo-600 dark:text-indigo-400 mb-1 border-indigo-200">
                        {currentStep.badge}
                      </Badge>
                      <h3 className="text-lg font-black text-slate-900 dark:text-white leading-tight">
                        {currentStep.title}
                      </h3>
                      <p className="text-xs text-indigo-600 dark:text-indigo-400 font-medium mt-0.5">
                        {currentStep.subtitle}
                      </p>
                    </div>
                  </div>

                  <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-900/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
                    {currentStep.desc}
                  </p>

                  {/* Bullet Highlights */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-yellow-500" />
                      <span>จุดเด่นและสิ่งที่ทำได้ในขั้นตอนนี้:</span>
                    </h4>
                    <ul className="space-y-2">
                      {currentStep.features.map((feat, i) => (
                        <li key={i} className="flex items-start gap-2.5 text-xs text-slate-600 dark:text-slate-300">
                          <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Direct Link to Route */}
                  <div className="p-3.5 rounded-2xl bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-200/60 dark:border-indigo-800/50 flex items-center justify-between">
                    <span className="text-xs font-semibold text-indigo-900 dark:text-indigo-300">
                      ต้องการทดลองใช้งานจริงในหน้านี้?
                    </span>
                    <Button
                      size="sm"
                      onClick={() => navigate(currentStep.link)}
                      className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white text-xs rounded-xl shadow-md gap-1.5"
                    >
                      <span>{currentStep.linkText}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Button>
                  </div>

                  {/* Step Navigation Controls */}
                  <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-700/60">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={walkthroughStep === 0}
                      onClick={() => setWalkthroughStep(prev => Math.max(0, prev - 1))}
                      className="rounded-xl text-xs gap-1"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      <span>ขั้นตอนก่อนหน้า</span>
                    </Button>

                    <div className="text-[11px] text-slate-400">
                      {walkthroughStep + 1} / {walkthroughSteps.length}
                    </div>

                    {walkthroughStep < walkthroughSteps.length - 1 ? (
                      <Button
                        size="sm"
                        onClick={() => setWalkthroughStep(prev => prev + 1)}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs gap-1"
                      >
                        <span>ถัดไป</span>
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        onClick={() => {
                          setWalkthroughStep(0);
                          setActiveTab('satellite');
                        }}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs gap-1"
                      >
                        <Check className="w-4 h-4" />
                        <span>สิ้นสุดการแนะนำ</span>
                      </Button>
                    )}
                  </div>
                </div>
              );
            })()}
          </div>
        )}

        {/* ================= TAB 3: OVERVIEW ================= */}
        {activeTab === 'overview' && (
          <div className="space-y-4">
            {/* Welcome Banner */}
            <div className="bg-white/80 dark:bg-slate-800/80 rounded-3xl shadow-sm border border-slate-200/80 dark:border-slate-700/80 p-5 backdrop-blur-md">
              <div className="flex items-center gap-3 mb-3">
                <div className="bg-indigo-100 dark:bg-indigo-900/40 p-2.5 rounded-2xl text-indigo-600 dark:text-indigo-400">
                  <Info className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="font-bold text-base sm:text-lg text-slate-900 dark:text-white">
                    ยินดีต้อนรับสู่ D-MIND Disaster Intelligence
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    ระบบแจ้งเตือนภัยพิบัติอัจฉริยะและการแพทย์ฉุกเฉินระดับชาติ
                  </p>
                </div>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
                D-MIND คือแพลตฟอร์มบูรณาการข้อมูลภัยธรรมชาติแบบเรียลไทม์ โดยผสานเทคโนโลยีการตรวจวัดจากอวกาศ (Satellite Remote Sensing) ของ GISTDA, ข้อมูลอุตุนิยมวิทยา TMD, และระบบช่วยเหลือฉุกเฉิน ปภ. เพื่อให้ประชาชนรู้ทันภัยและเอาชีวิตรอดได้อย่างปลอดภัย
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2">
                <div className="p-3 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/40 text-center">
                  <span className="text-lg font-black text-indigo-600 dark:text-indigo-400 block">375m</span>
                  <span className="text-[10px] text-slate-600 dark:text-slate-400">ความละเอียดดาวเทียม</span>
                </div>
                <div className="p-3 rounded-2xl bg-purple-50/70 dark:bg-purple-950/30 border border-purple-100 dark:border-purple-900/40 text-center">
                  <span className="text-lg font-black text-purple-600 dark:text-purple-400 block">5 ภัย</span>
                  <span className="text-[10px] text-slate-600 dark:text-slate-400">คู่มือเอาตัวรอดสากล</span>
                </div>
                <div className="p-3 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40 text-center">
                  <span className="text-lg font-black text-emerald-600 dark:text-emerald-400 block">72 ชม.</span>
                  <span className="text-[10px] text-slate-600 dark:text-slate-400">เช็กลิสต์กระเป๋า Go-Bag</span>
                </div>
                <div className="p-3 rounded-2xl bg-rose-50/70 dark:bg-rose-950/30 border border-rose-100 dark:border-rose-900/40 text-center">
                  <span className="text-lg font-black text-rose-600 dark:text-rose-400 block">24 ชม.</span>
                  <span className="text-[10px] text-slate-600 dark:text-slate-400">โทรสายด่วนฟรีในคลิกเดียว</span>
                </div>
              </div>
            </div>

            {/* Official Data Sources Card */}
            <div className="bg-white/80 dark:bg-slate-800/80 rounded-3xl shadow-sm border border-slate-200/80 dark:border-slate-700/80 p-5 backdrop-blur-md">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <span>แหล่งข้อมูลอ้างอิงระดับทางการ (Official Partners)</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800">
                  <strong className="text-slate-900 dark:text-white block">GISTDA (สทอภ.)</strong>
                  <p className="text-slate-500 dark:text-slate-400 mt-0.5">ภาพถ่ายดาวเทียม VIIRS Hotspots, ขอบเขตน้ำท่วม Sentinel-1, ความชื้นพืช NDWI และดัชนี DRIPlus</p>
                </div>
                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800">
                  <strong className="text-slate-900 dark:text-white block">กรมอุตุนิยมวิทยา (TMD)</strong>
                  <p className="text-slate-500 dark:text-slate-400 mt-0.5">พยากรณ์อากาศ เรดาร์กลุ่มฝน ปริมาณฝนสะสม และการเตือนพายุหมุนเขตร้อน</p>
                </div>
                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800">
                  <strong className="text-slate-900 dark:text-white block">กรมป้องกันและบรรเทาสาธารณภัย (ปภ. 1784)</strong>
                  <p className="text-slate-500 dark:text-slate-400 mt-0.5">ประกาศพื้นที่ประสบภัยพิบัติ ศูนย์อพยพ และการประสานงานกู้ภัยระดับชาติ</p>
                </div>
                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800">
                  <strong className="text-slate-900 dark:text-white block">สถาบันการแพทย์ฉุกเฉินแห่งชาติ (สพฉ. 1669)</strong>
                  <p className="text-slate-500 dark:text-slate-400 mt-0.5">เกณฑ์การประเมินผู้ป่วยฉุกเฉินวิกฤต (Triage) และระบบเรียกรถพยาบาล</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 4: FEATURES ================= */}
        {activeTab === 'features' && (
          <div className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {coreFeatures.map((f, i) => (
                <div
                  key={i}
                  onClick={() => navigate(f.path)}
                  className="p-4 rounded-3xl bg-white/80 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 shadow-sm hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
                >
                  <div className="flex items-start gap-3.5 mb-3">
                    <div className={`${f.color} p-3 rounded-2xl text-white shadow-md flex-shrink-0 group-hover:scale-105 transition-transform`}>
                      {f.icon}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                          {f.title}
                        </h3>
                        <Badge variant="outline" className="text-[9px] py-0 px-1.5 border-slate-300">
                          {f.tag}
                        </Badge>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                        {f.desc}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-end text-xs font-semibold text-indigo-600 dark:text-indigo-400 gap-1 group-hover:translate-x-0.5 transition-transform">
                    <span>เปิดใช้งานฟังก์ชันนี้</span>
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ================= TAB 5: TIPS & FAQ ================= */}
        {activeTab === 'tips' && (
          <div className="space-y-4">
            {/* Practical Survival Tips */}
            <div className="space-y-2.5">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Lightbulb className="w-4 h-4 text-yellow-500" />
                <span>เคล็ดลับการเอาชีวิตรอดที่ควรรู้</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {tips.map((tip, i) => (
                  <div
                    key={i}
                    className={`p-3.5 rounded-2xl border-l-4 ${tip.color} rounded-r-2xl border-slate-200/80 dark:border-slate-700/80`}
                  >
                    <h4 className="font-bold text-xs text-slate-900 dark:text-white mb-1">
                      {tip.icon} {tip.title}
                    </h4>
                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                      {tip.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* FAQs with Instant Search */}
            <div className="bg-white/80 dark:bg-slate-800/80 rounded-3xl shadow-sm border border-slate-200/80 dark:border-slate-700/80 p-5 backdrop-blur-md space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                  <HelpCircle className="w-4 h-4 text-indigo-500" />
                  <span>คำถามที่พบบ่อย (FAQs)</span>
                </h3>
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={faqSearch}
                    onChange={(e) => setFaqSearch(e.target.value)}
                    placeholder="ค้นหาคำถาม..."
                    className="pl-8 pr-3 py-1.5 bg-slate-100 dark:bg-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 w-full sm:w-48"
                  />
                </div>
              </div>

              <div className="space-y-3 pt-1">
                {filteredFaqs.length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-4">ไม่พบคำถามที่ตรงกับคำค้นหา</p>
                ) : (
                  filteredFaqs.map((faq, i) => (
                    <div
                      key={i}
                      className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800"
                    >
                      <h4 className="font-bold text-xs text-slate-900 dark:text-white mb-1.5 flex items-start gap-2">
                        <span className="text-indigo-600 font-extrabold">Q:</span>
                        <span>{faq.q}</span>
                      </h4>
                      <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed pl-5 flex items-start gap-2">
                        <span className="text-emerald-600 font-bold">A:</span>
                        <span>{faq.a}</span>
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default AppGuide;
