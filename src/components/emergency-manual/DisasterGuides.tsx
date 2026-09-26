import React, { useState } from 'react';
import { 
  Droplets, Flame, Mountain, Sun, MountainSnow, 
  AlertTriangle, CheckCircle2, XCircle, ShieldAlert, 
  Info, ChevronDown, ChevronUp, Radio, HeartPulse, Sparkles
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export interface DisasterGuideItem {
  id: string;
  name: string;
  enName: string;
  iconName: string;
  colorTheme: {
    bg: string;
    border: string;
    text: string;
    glow: string;
    badge: string;
  };
  level: string;
  levelColor: string;
  summary: string;
  warningSigns?: string[];
  before: string[];
  during: string[];
  after: string[];
  dos: string[];
  donts: string[];
  quickHotline: { name: string; number: string };
}

export const DISASTER_GUIDES: DisasterGuideItem[] = [
  {
    id: 'flood',
    name: 'น้ำท่วมฉับพลันและน้ำป่าไหลหลาก',
    enName: 'Flash Flood & Inundation',
    iconName: 'Droplets',
    colorTheme: {
      bg: 'from-blue-500/10 via-cyan-500/5 to-transparent',
      border: 'border-blue-500/30 hover:border-blue-500/60',
      text: 'text-blue-500 dark:text-blue-400',
      glow: 'shadow-blue-500/10',
      badge: 'bg-blue-100 text-blue-800 dark:bg-blue-950/80 dark:text-blue-300 border-blue-200 dark:border-blue-800'
    },
    level: 'วิกฤตฉับพลันสูง',
    levelColor: 'bg-red-500 text-white',
    summary: 'ภัยจากมวลน้ำปริมาณมหาศาลที่ไหลหลากอย่างรวดเร็ว กวาดสิ่งกีดขวางและจมบ้านเรือนในเวลาไม่กี่นาที',
    warningSigns: [
      'ฝนตกหนักต่อเนื่องบนภูเขาหรือต้นน้ำนานเกิน 3-4 ชั่วโมง',
      'ระดับน้ำในลำธารหรือคลองเพิ่มสูงขึ้นอย่างรวดเร็วผิดปกติ',
      'สีของน้ำเปลี่ยนเป็นสีขุ่น แดง โคลน และมีเศษกิ่งไม้ลอยมาจำนวนมาก',
      'มีเสียงดังกึกก้องคล้ายเครื่องจักรขนาดใหญ่ดังมาจากทิศต้นน้ำ'
    ],
    before: [
      'ตรวจสอบระดับความสูงของบ้านเทียบกับประวัติน้ำท่วมในอดีต (ดูเลเยอร์น้ำท่วมซ้ำซากใน D-MIND)',
      'ยกเบรกเกอร์ ปลั๊กไฟ และเครื่องใช้ไฟฟ้าขึ้นชั้น 2 หรือที่สูงพ้นระดับน้ำท่วมสูงสุด',
      'ย้ายยานพาหนะ สัตว์เลี้ยง และเอกสารสำคัญไปไว้ในจุดปลอดภัยหรือศูนย์พักพิงล่วงหน้า',
      'จัดเตรียมกระเป๋าฉุกเฉิน 72 ชม. และสำรองน้ำดื่มสะอาดอย่างน้อย 3 ลิตร/คน/วัน'
    ],
    during: [
      'กฎเหล็กแห่งชีวิต: ห้ามเดิน ว่ายน้ำ หรือขับรถยนต์ลุยกระแสน้ำไหลหลากเด็ดขาด (น้ำเชี่ยวเพียง 15 ซม. สามารถพัดคนล้มได้ และ 30 ซม. สามารถพัดรถยนต์ลอยได้)',
      'อพยพขึ้นสู่ชั้นบนหรือที่ดอนทันที หากระดับน้ำสูงขึ้นจนมิดหลังคา ให้ออกมาอยู่บนหลังคาแล้วส่งสัญญาณขอความช่วยเหลือ (ห้ามติดอยู่ในห้องใต้หลังคาที่ไม่มีทางออก)',
      'ตัดสะพานไฟหลัก (Main Circuit Breaker) และปิดวาล์วแก๊สหุงต้มทันทีหากน้ำเริ่มเข้าตัวบ้าน',
      'ระวังสัตว์มีพิษ เช่น งู ตะขาบ แมงป่อง ที่หนีน้ำขึ้นมาหลบซ่อนตามขอบหน้าต่างหรือที่สูง'
    ],
    after: [
      'อย่าเพิ่งรีบเดินเข้าบ้านที่เพิ่งน้ำลดจนกว่าจะตรวจสอบว่าโครงสร้าง เสา และคานไม่ทรุดเอียง',
      'ห้ามเปิดสวิตช์เครื่องใช้ไฟฟ้าใดๆ จนกว่าจะให้ช่างไฟตรวจสอบความชื้นและการลัดวงจร',
      'ต้มน้ำดื่มให้เดือดจัดทุกครั้ง เพราะระบบน้ำประปาและบ่อน้ำอาจปนเปื้อนเชื้อโรคฉี่หนู (Leptospirosis)',
      'ถ่ายภาพและบันทึกวิดีโอร่องรอยความเสียหายทุกจุดเพื่อใช้เป็นหลักฐานยื่นรับเงินเยียวยา ปภ.'
    ],
    dos: [
      'สวมรองเท้าบูทยางหนาเพื่อป้องกันเศษแก้ว ตะปู และไฟรั่ว',
      'ติดตามประกาศเตือนภัยจาก ปภ. (สายด่วน 1784) และแอพ D-MIND อย่างต่อเนื่อง'
    ],
    donts: [
      'อย่าสัมผัสเสาไฟ ป้ายโฆษณาโลหะ หรือสายไฟที่จมอยู่ในน้ำเด็ดขาด',
      'อย่าให้เด็กหรือผู้สูงอายุลงเล่นน้ำท่วมขัง เพราะเสี่ยงเชื้อโรคและกระแสน้ำดูดลงท่อ'
    ],
    quickHotline: { name: 'สายด่วน ปภ.', number: '1784' }
  },
  {
    id: 'wildfire',
    name: 'ไฟป่า หมอกควัน และมลพิษ PM2.5',
    enName: 'Wildfire & Hazardous Smog',
    iconName: 'Flame',
    colorTheme: {
      bg: 'from-orange-500/10 via-red-500/5 to-transparent',
      border: 'border-orange-500/30 hover:border-orange-500/60',
      text: 'text-orange-500 dark:text-orange-400',
      glow: 'shadow-orange-500/10',
      badge: 'bg-orange-100 text-orange-800 dark:bg-orange-950/80 dark:text-orange-300 border-orange-200 dark:border-orange-800'
    },
    level: 'อันตรายต่อสุขภาพและชีวิต',
    levelColor: 'bg-orange-600 text-white',
    summary: 'ไฟลุกลามในพื้นที่ป่าและเกษตร ปลดปล่อยพลังงานความร้อนสูงและฝุ่นละอองขนาดเล็ก PM2.5 ที่ทำลายระบบหายใจ',
    warningSigns: [
      'ค่า FRP (Fire Radiative Power) จากดาวเทียม VIIRS ในละแวกใกล้เคียงพุ่งสูงเกิน 50 MW',
      'กลิ่นควันไหม้รุนแรง ทัศนวิสัยลดลงต่ำกว่า 1 กิโลเมตร ท้องฟ้ากลายเป็นสีส้มสลัว',
      'เศษขี้เถ้าและสะเก็ดไฟปลิวตกลงมาในบริเวณบ้านตามทิศทางลม',
      'ค่าดัชนีฝุ่น PM2.5 ในแอพ D-MIND พุ่งเข้าสู่แถบสีแดงหรือม่วง (> 75-150 µg/m³)'
    ],
    before: [
      'ทำแนวกันไฟ (Firebreak) กว้างอย่างน้อย 10-15 เมตรรอบแนวรั้วบ้าน กำจัดใบไม้กิ่งไม้แห้ง',
      'เตรียมห้องปลอดฝุ่น (Clean Room) ภายในบ้าน โดยปิดรอยต่อหน้าต่างด้วยเทปและใช้เครื่องฟอกอากาศ HEPA',
      'สำรองหน้ากากป้องกันฝุ่นและควันพิษมาตรฐาน N95 อย่างน้อย 5-10 ชิ้นต่อคนในครอบครัว',
      'ตรวจสอบระบบสปริงเกลอร์รดน้ำหลังคาบ้าน และเตรียมสายยางฉีดน้ำแรงดันสูง'
    ],
    during: [
      'สวมหน้ากาก N95 ทันทีที่อยู่กลางแจ้ง (หน้ากากผ้าธรรมดาไม่สามารถกรองอนุภาค PM2.5 และก๊าซพิษได้)',
      'หากแนวไฟประชิดตัว ให้อพยพไปในทิศทาง "เหนือลม (Upwind)" หรือแนวตั้งฉากกับทิศลมทันที',
      'ห้ามหนีไฟขึ้นไปบนยอดเขาหรือหุบเขาอับลมเด็ดขาด เพราะไฟป่าจะลุกลามขึ้นสู่ที่สูงเร็วกว่าทางราบหลายเท่า',
      'หากถูกล้อมด้วยควันไฟ ให้หมอบราบใกล้พื้นดิน ใช้ผ้าชุบน้ำปิดปาก-จมูก เพราะออกซิเจนบริสุทธิ์จะอยู่ติดพื้น'
    ],
    after: [
      'ฉีดน้ำรดตอไม้และกองขี้เถ้าที่ยังคุกรุ่นรอบบ้านเพื่อป้องกันการปะทุซ้ำจากแรงลม',
      'ทำความสะอาดรางน้ำฝนและหลังคา เพื่อไม่ให้ขี้เถ้าพิษปนเปื้อนลงในถังเก็บน้ำกินน้ำใช้',
      'สังเกตอาการผิดปกติ เช่น หายใจมีเสียงหวีด ไอเป็นเลือด แน่นหน้าอกเฉียบพลัน ให้รีบพบแพทย์ทันที'
    ],
    dos: [
      'เปิดเครื่องฟอกอากาศในห้องปิดสนิท และใช้ผ้าชุบน้ำเช็ดถูพื้นดักจับฝุ่นละออง',
      'แจ้งพิกัดจุดความร้อนทันทีผ่านสายด่วนพิทักษ์ป่า 1362 หรือดับเพลิง 199'
    ],
    donts: [
      'อย่าออกกำลังกายหรือทำงานหนักกลางแจ้งในช่วงที่ค่า PM2.5 เกินเกณฑ์มาตรฐาน',
      'อย่าจุดไฟเผาเศษขยะ หญ้าแห้ง หรือตอซังข้าวโดยเด็ดขาดในช่วงประกาศห้ามเผาเด็ดขาด'
    ],
    quickHotline: { name: 'สายด่วนพิทักษ์ป่า', number: '1362' }
  },
  {
    id: 'earthquake',
    name: 'แผ่นดินไหวและการสั่นสะเทือน',
    enName: 'Earthquake & Structural Tremor',
    iconName: 'Mountain',
    colorTheme: {
      bg: 'from-amber-500/10 via-yellow-500/5 to-transparent',
      border: 'border-amber-500/30 hover:border-amber-500/60',
      text: 'text-amber-500 dark:text-amber-400',
      glow: 'shadow-amber-500/10',
      badge: 'bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 border-amber-200 dark:border-amber-800'
    },
    level: 'ไม่สามารถเตือนล่วงหน้าได้',
    levelColor: 'bg-purple-600 text-white',
    summary: 'การปลดปล่อยพลังงานใต้พิภพกะทันหัน ส่งคลื่นสั่นสะเทือนทำให้อาคารแตกร้าว เสาหัก และสิ่งของตกหล่น',
    warningSigns: [
      'สัตว์เลี้ยงแสดงพฤติกรรมกระวนกระวายผิดปกติก่อนเกิดไม่กี่วินาทีหรือนาที',
      'ได้ยินเสียงครืนๆ ใต้ดินคล้ายฟ้าร้องหรือรถไฟใต้ดินวิ่งผ่าน',
      'โคมไฟระย้า แก้วน้ำ หรือพัดลมเพดานเริ่มแกว่งไปมาอย่างรุนแรง'
    ],
    before: [
      'ยึดตู้หนังสือ ชั้นวางของ และตู้เย็นเข้ากับผนังบ้านด้วยขายึดเหล็ก L-Bracket',
      'อย่าวางสิ่งของหนัก กรอบรูป หรือกระถางต้นไม้ไว้บนหัวเตียงนอน',
      'ซ้อมท่า "หมอบ กำบัง ยึดแน่น" (Drop, Cover, Hold On) ร่วมกับคนในครอบครัวเป็นประจำ',
      'เรียนรู้วิธีการปิดวาล์วแก๊สหุงต้มและคัตเอาต์ไฟฟ้าหลักอย่างรวดเร็ว'
    ],
    during: [
      'ปฏิบัติการทันที: "หมอบ (Drop)" ลงกับพื้น, "กำบัง (Cover)" ใต้โต๊ะไม้หรือเฟอร์นิเจอร์แข็งแรง, "ยึดแน่น (Hold On)" จับขาโต๊ะไว้จนการสั่นไหวหยุดสนิท',
      'หากไม่มีโต๊ะ ให้หมอบชิดผนังด้านในห้อง ใช้แขนและหมอนบังศีรษะและลำคอให้มิดชิด',
      'หากอยู่ในอาคารสูง ห้ามวิ่งหนีลงบันไดขณะกำลังสั่นไหว และ "ห้ามใช้ลิฟต์เด็ดขาด"',
      'หากอยู่กลางแจ้ง วิ่งเข้าหาที่โล่งแจ้งทันที ห่างจากเสาไฟฟ้า ป้ายโฆษณา และผนังกระจกอาคาร',
      'หากกำลังขับรถยนต์ ให้ชะลอจอดข้างทางในที่ปลอดภัย หลีกเลี่ยงสะพาน ทางยกระดับ และใต้สะพานลอย'
    ],
    after: [
      'ตรวจเช็กการรั่วไหลของแก๊ส (หากได้กลิ่น ห้ามเปิดไฟหรือจุดไฟเด็ดขาด ให้เปิดหน้าต่างระบาย)',
      'สวมรองเท้าหุ้มส้นพื้นหนาก่อนเดินสำรวจ เพื่อป้องกันเศษแก้วและกระเบื้องบาดเท้า',
      'เตรียมพร้อมรับมือ "อาฟเตอร์ช็อก (Aftershocks)" ซึ่งอาจรุนแรงพอที่จะทำให้อาคารที่เสียหายพังทลายลงมาได้',
      'เปิดฟังข่าวสารผ่านวิทยุหรือแอพ D-MIND ไม่ส่งต่อข่าวลือที่ยังไม่ได้รับการยืนยัน'
    ],
    dos: [
      'อยู่ใต้ที่กำบังจนกว่าการสั่นสะเทือนระลอกแรกจะสงบลงอย่างน้อย 1-2 นาที',
      'ตรวจสอบและปฐมพยาบาลคนรอบข้างที่ได้รับบาดเจ็บเบื้องต้น'
    ],
    donts: [
      'อย่าวิ่งแตกตื่นออกนอกประตูอาคารขณะแผ่นดินไหว เพราะสิ่งของตกหล่นมักตกใส่บริเวณหน้าประตู',
      'อย่าจุดไม้ขีดไฟ ไฟแช็ค หรือใช้อุปกรณ์ที่ก่อประกายไฟจนกว่าจะแน่ใจว่าไม่มีแก๊สรั่ว'
    ],
    quickHotline: { name: 'ศูนย์แพทย์ฉุกเฉิน', number: '1669' }
  },
  {
    id: 'drought',
    name: 'ภัยแล้งและคลื่นความร้อน',
    enName: 'Drought & Extreme Heatwave',
    iconName: 'Sun',
    colorTheme: {
      bg: 'from-yellow-500/10 via-amber-500/5 to-transparent',
      border: 'border-yellow-500/30 hover:border-yellow-500/60',
      text: 'text-yellow-600 dark:text-yellow-400',
      glow: 'shadow-yellow-500/10',
      badge: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-950/80 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800'
    },
    level: 'ส่งผลกระทบต่อเนื่องระยะยาว',
    levelColor: 'bg-yellow-600 text-white',
    summary: 'ฝนทิ้งช่วงเป็นเวลานาน ความชื้นในดินและพืชพรรณลดลงต่ำ แหล่งน้ำแห้งขอด และเสี่ยงโรคลมแดด (Heatstroke)',
    warningSigns: [
      'ดัชนี DRIPlus บนแผนที่ D-MIND แสดงค่าความเสี่ยงระดับสีส้มหรือแดงจัดในพื้นที่',
      'ค่าความชื้นพืชพรรณ NDWI ติดลบ (< 0.0) และระดับความชื้นดิน SMAP ต่ำกว่า 0.10 m³/m³',
      'บ่อน้ำบาดาล ลำคลอง และอ่างเก็บน้ำมีระดับน้ำลดลงอย่างต่อเนื่องวันละหลายเซนติเมตร'
    ],
    before: [
      'สำรองน้ำกินน้ำใช้ในภาชนะปิดสนิทที่สะอาด มีฝาปิดมิดชิดเพื่อป้องกันยุงลายวางไข่',
      'ตรวจสอบรอยรั่วซึมของท่อประปา ก๊อกน้ำ และสุขภัณฑ์ในบ้านเพื่อลดการสูญเสียน้ำโดยเปล่าประโยชน์',
      'ภาคเกษตร: ปรับเปลี่ยนมาปลูกพืชใช้น้ำน้อย และเตรียมวางระบบน้ำหยดล่วงหน้า',
      'เตรียมสารละลายเกลือแร่ (ORS) และยาประจำตัวสำหรับผู้ป่วยกลุ่มเปราะบาง'
    ],
    during: [
      'ดื่มน้ำสะอาดบ่อยๆ อย่างน้อยวันละ 2.5 - 3 ลิตร แม้จะไม่รู้สึกกระหายน้ำก็ตาม',
      'หลีกเลี่ยงการอยู่กลางแดดจัดหรือออกกำลังกายหนักช่วงเวลา 11.00 - 15.00 น. เพื่อป้องกันฮีทสโตรก',
      'นำน้ำที่ผ่านการใช้งานแล้วที่ไม่มีสารเคมีอันตราย (Greywater) เช่น น้ำซักผ้ารอบสุดท้าย มารดน้ำต้นไม้หรือล้างพื้น',
      'สวมเสื้อผ้าโปร่งสบาย ระบายอากาศได้ดี สีอ่อน และกางร่มหรือสวมหมวกปีกกว้างเมื่อออกแดด'
    ],
    after: [
      'ร่วมมือกับองค์กรปกครองส่วนท้องถิ่นในการขุดลอกสระเก็บน้ำชุมชนและแก้มลิงเพื่อรอรับฤดูฝนใหม่',
      'ฟื้นฟูปรับปรุงคุณภาพดินด้วยปุ๋ยอินทรีย์และเศษฟางคลุมหน้าดินเพื่อเพิ่มความสามารถในการกักเก็บความชื้น',
      'ประเมินความเสียหายของผลผลิตทางการเกษตรเพื่อยื่นขอเงินช่วยเหลือภัยพิบัติด้านการเกษตร'
    ],
    dos: [
      'รดน้ำต้นไม้เฉพาะช่วงเช้าตรู่หรือช่วงพลบค่ำ เพื่อลดการระเหยของน้ำจากแสงแดด',
      'หากพบผู้มีอาการตัวร้อนจัด ผิวแห้ง หน้ามืด หมดสติ (ฮีทสโตรก) ให้รีบนำเข้าที่ร่ม เช็ดตัวด้วยน้ำธรรมดา และโทร 1669'
    ],
    donts: [
      'อย่าเปิดน้ำประปาไหลทิ้งขณะแปรงฟัน สระผม หรือล้างจาน',
      'อย่าดื่มเครื่องดื่มแอลกอฮอล์ กาแฟเข้มข้น หรือน้ำหวานจัดกลางแดด เพราะจะเร่งให้ร่างกายสูญเสียน้ำเร็วขึ้น'
    ],
    quickHotline: { name: 'สายด่วนกรมชลประทาน', number: '1460' }
  },
  {
    id: 'landslide',
    name: 'ดินถล่มและโคลนถล่ม',
    enName: 'Landslide & Debris Flow',
    iconName: 'MountainSnow',
    colorTheme: {
      bg: 'from-emerald-500/10 via-teal-500/5 to-transparent',
      border: 'border-emerald-500/30 hover:border-emerald-500/60',
      text: 'text-emerald-500 dark:text-emerald-400',
      glow: 'shadow-emerald-500/10',
      badge: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
    },
    level: 'ทำลายล้างฉับพลันสูง',
    levelColor: 'bg-red-600 text-white',
    summary: 'การพังทลายของมวลดิน หิน และโคลนตามไหล่เขาเนื่องจากดินอุ้มน้ำฝนไว้จนอิ่มตัว เคลื่อนที่ด้วยความเร็วสูงกวาดทุกสิ่ง',
    warningSigns: [
      'น้ำในลำห้วยบนภูเขาเปลี่ยนสีเป็นสีดินโคลนขุ่นแดงจัดอย่างกะทันหัน',
      'ระดับน้ำในลำธารลดลงอย่างรวดเร็วผิดปกติ ทั้งที่ฝนยังตกหนัก (แสดงว่ามีท่อนไม้และดินไปติดขัดอุดกั้นทางน้ำบนต้นน้ำ)',
      'ได้ยินเสียงดังกึกก้องกัมปนาท หรือเสียงต้นไม้ใหญ่หักโค่นลั่นมาจากเทือกเขา',
      'พบรอยแตก รอยแยก หรือรอยทรุดตัวบนพื้นดิน ลานบ้าน หรือผนังอาคารที่ขยายตัวกว้างขึ้นเรื่อยๆ',
      'ต้นไม้ เสาไฟ หรือรั้วบ้านบนแนวลาดชันเริ่มเอียงตัวไปในทิศทางเดียวกัน'
    ],
    before: [
      'สำรวจที่ตั้งบ้านเรือน หากอยู่บริเวณเชิงเขา ปากห้วย หรือทางน้ำไหลผ่าน ต้องเตรียมพร้อมอพยพตลอด 24 ชม.',
      'ติดตามปริมาณน้ำฝนสะสม หากฝนตกหนักเกิน 100 มิลลิเมตรในรอบ 24 ชั่วโมง ให้เตรียมอพยพทันที',
      'สังเกตสัญญาณเตือนภัยธรรมชาติและตั้งเวรยามเฝ้าระวังระดับน้ำในลำห้วยของชุมชน',
      'กำหนดจุดนัดพบและเส้นทางอพยพที่ปลอดภัยบนที่สูงที่ไม่ใช่แนวทางน้ำหลาก'
    ],
    during: [
      'อพยพทันทีโดยไม่ต้องห่วงทรัพย์สิน: เมื่อสังเกตเห็นสัญญาณเตือนภัยดินถล่ม ให้ออกจากพื้นที่ทันที',
      'วิ่งหนีใน "แนวตั้งฉาก (Perpendicular)" กับทิศทางการไหลของดินโคลน ห้ามวิ่งหนีตามแนวยาวของร่องเขาหรือทางน้ำหลากเด็ดขาด',
      'หลีกเลี่ยงการข้ามสะพาน ลำธาร หรือทางระบายน้ำที่อยู่ตรงแนวทางน้ำไหล',
      'หากติดอยู่ในอาคารและหนีออกมาไม่ทัน: ให้มุดเข้าใต้โต๊ะแข็งแรง ขดตัวเป็นก้อนกลม (Fetal position) ใช้แขนสองข้างกอดปกป้องศีรษะและท้ายทอยให้แน่นหนาที่สุด'
    ],
    after: [
      'อย่าเพิ่งรีบกลับเข้าบ้านเรือนในจุดเกิดเหตุ เพราะมักจะเกิดเหตุดินสไลด์ระลอกที่ 2 และ 3 ตามมาได้ง่ายมาก',
      'ระวังอันตรายจากสายไฟฟ้าขาด เสาไฟเอียง และท่อแก๊สชำรุดใต้ดิน',
      'แจ้งเจ้าหน้าที่กู้ภัยหากสงสัยว่ามีผู้สูญหายติดค้างอยู่ใต้ซากปรักหักพัง พร้อมระบุพิกัดที่พบเห็นครั้งสุดท้าย',
      'ร่วมมือกับเจ้าหน้าที่กรมทรัพยากรธรณีในการประเมินความมั่นคงของลาดเขา'
    ],
    dos: [
      'อพยพไปยังศูนย์พักพิงที่จัดตั้งไว้บนที่ดอนและห่างไกลจากแนวภูเขาอย่างน้อย 200-300 เมตร',
      'ช่วยเหลือเด็ก คนชรา และผู้พิการให้อพยพออกมาก่อนเป็นลำดับแรก'
    ],
    donts: [
      'อย่าขับรถยนต์ผ่านเส้นทางภูเขาที่มีดินสไลด์ปิดทับเส้นทางบางส่วน เพราะถนนอาจทรุดพังถล่มลงเหว',
      'อย่ากลับเข้าไปเอาของมีค่าในบ้านจนกว่าเจ้าหน้าที่ผู้เชี่ยวชาญจะอนุญาต'
    ],
    quickHotline: { name: 'กรมทางหลวงชนบท', number: '1146' }
  }
];

interface DisasterGuidesProps {
  searchQuery?: string;
}

export const DisasterGuides: React.FC<DisasterGuidesProps> = ({ searchQuery = '' }) => {
  const [expandedId, setExpandedId] = useState<string>('flood');
  const [activeSubTab, setActiveSubTab] = useState<'during' | 'before' | 'after' | 'warning'>('during');

  // Filter guides if search query provided
  const filteredGuides = DISASTER_GUIDES.filter((guide) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      guide.name.toLowerCase().includes(query) ||
      guide.enName.toLowerCase().includes(query) ||
      guide.summary.toLowerCase().includes(query) ||
      guide.during.some((item) => item.toLowerCase().includes(query)) ||
      guide.before.some((item) => item.toLowerCase().includes(query)) ||
      guide.after.some((item) => item.toLowerCase().includes(query)) ||
      (guide.warningSigns && guide.warningSigns.some((item) => item.toLowerCase().includes(query)))
    );
  });

  const getDisasterIcon = (iconName: string, className: string = 'w-5 h-5') => {
    switch (iconName) {
      case 'Droplets':
        return <Droplets className={className} />;
      case 'Flame':
        return <Flame className={className} />;
      case 'Mountain':
        return <Mountain className={className} />;
      case 'Sun':
        return <Sun className={className} />;
      case 'MountainSnow':
        return <MountainSnow className={className} />;
      default:
        return <AlertTriangle className={className} />;
    }
  };

  return (
    <div className="space-y-4">
      {/* Category selector pills */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none snap-x">
        {DISASTER_GUIDES.map((guide) => {
          const isSelected = expandedId === guide.id;
          return (
            <button
              key={guide.id}
              onClick={() => {
                setExpandedId(guide.id);
              }}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-2xl text-xs font-semibold whitespace-nowrap transition-all duration-300 border snap-start ${
                isSelected
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-transparent shadow-md shadow-indigo-500/20 scale-[1.02]'
                  : 'bg-white/80 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-700/80 text-slate-700 dark:text-slate-300 border-slate-200/80 dark:border-slate-700/80 backdrop-blur-sm'
              }`}
            >
              <span>{getDisasterIcon(guide.iconName, 'w-4 h-4')}</span>
              <span>{guide.name.split('และ')[0]}</span>
            </button>
          );
        })}
      </div>

      {filteredGuides.length === 0 ? (
        <div className="text-center py-12 px-4 rounded-3xl bg-white/60 dark:bg-slate-800/60 border border-dashed border-slate-300 dark:border-slate-700">
          <AlertTriangle className="w-10 h-10 text-amber-500 mx-auto mb-2 opacity-80" />
          <h3 className="font-bold text-slate-800 dark:text-slate-200 text-base">ไม่พบข้อมูลคู่มือที่ค้นหา</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">ลองค้นหาด้วยคำอื่น เช่น น้ำท่วม, ไฟป่า, แผ่นดินไหว, อาฟเตอร์ช็อก หรือ N95</p>
        </div>
      ) : (
        filteredGuides.map((guide) => {
          const isExpanded = expandedId === guide.id;

          return (
            <div
              key={guide.id}
              className={`rounded-3xl border transition-all duration-300 overflow-hidden bg-white/80 dark:bg-slate-800/90 backdrop-blur-md shadow-sm hover:shadow-md ${
                isExpanded ? `${guide.colorTheme.border} ring-1 ring-blue-500/20` : 'border-slate-200/80 dark:border-slate-700/80'
              }`}
            >
              {/* Header Card */}
              <div
                onClick={() => setExpandedId(isExpanded ? '' : guide.id)}
                className={`p-4 sm:p-5 cursor-pointer select-none transition-colors bg-gradient-to-r ${guide.colorTheme.bg}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3.5">
                    <div
                      className={`p-3 rounded-2xl bg-white dark:bg-slate-800 shadow-sm border border-slate-100 dark:border-slate-700/80 ${guide.colorTheme.text} flex-shrink-0 mt-0.5`}
                    >
                      {getDisasterIcon(guide.iconName, 'w-6 h-6')}
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <h2 className="font-bold text-base sm:text-lg text-slate-900 dark:text-white leading-tight">
                          {guide.name}
                        </h2>
                        <Badge variant="outline" className={`text-[10px] font-medium py-0 px-2 rounded-full ${guide.colorTheme.badge}`}>
                          {guide.enName}
                        </Badge>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">
                        {guide.summary}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full hidden sm:inline-block ${guide.levelColor}`}>
                      {guide.level}
                    </span>
                    <button
                      className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-700/60 text-slate-500 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                      aria-label={isExpanded ? 'ยุบข้อมูล' : 'ขยายข้อมูล'}
                    >
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Collapsible Content */}
              {isExpanded && (
                <div className="p-4 sm:p-5 pt-1 space-y-4 border-t border-slate-100 dark:border-slate-700/50">
                  {/* Action Phase Switcher */}
                  <div className="grid grid-cols-4 gap-1.5 p-1 bg-slate-100/80 dark:bg-slate-900/60 rounded-2xl">
                    <button
                      onClick={() => setActiveSubTab('during')}
                      className={`py-2 px-2 rounded-xl text-xs font-semibold transition-all ${
                        activeSubTab === 'during'
                          ? 'bg-red-500 text-white shadow-sm'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      🚨 ขณะเกิดเหตุ
                    </button>
                    <button
                      onClick={() => setActiveSubTab('before')}
                      className={`py-2 px-2 rounded-xl text-xs font-semibold transition-all ${
                        activeSubTab === 'before'
                          ? 'bg-blue-600 text-white shadow-sm'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      🛡️ ก่อนเกิดภัย
                    </button>
                    <button
                      onClick={() => setActiveSubTab('after')}
                      className={`py-2 px-2 rounded-xl text-xs font-semibold transition-all ${
                        activeSubTab === 'after'
                          ? 'bg-emerald-600 text-white shadow-sm'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      🌱 หลังเหตุการณ์
                    </button>
                    <button
                      onClick={() => setActiveSubTab('warning')}
                      className={`py-2 px-2 rounded-xl text-xs font-semibold transition-all ${
                        activeSubTab === 'warning'
                          ? 'bg-amber-500 text-white shadow-sm'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      ⚠️ สัญญาณเตือน
                    </button>
                  </div>

                  {/* Active Phase Details */}
                  <div className="space-y-3">
                    {activeSubTab === 'during' && (
                      <div className="bg-red-50/70 dark:bg-red-950/20 border border-red-200/60 dark:border-red-900/40 rounded-2xl p-4">
                        <div className="flex items-center gap-2 mb-3">
                          <ShieldAlert className="w-4 h-4 text-red-600 dark:text-red-400" />
                          <h3 className="font-bold text-sm text-red-900 dark:text-red-300">
                            การเอาตัวรอดทันทีขณะเผชิญภัย (Immediate Action)
                          </h3>
                        </div>
                        <ul className="space-y-2.5">
                          {guide.during.map((item, idx) => (
                            <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-800 dark:text-slate-200 leading-relaxed">
                              <span className="bg-red-500 text-white w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5">
                                {idx + 1}
                              </span>
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {activeSubTab === 'before' && (
                      <div className="bg-blue-50/70 dark:bg-blue-950/20 border border-blue-200/60 dark:border-blue-900/40 rounded-2xl p-4">
                        <div className="flex items-center gap-2 mb-3">
                          <Info className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                          <h3 className="font-bold text-sm text-blue-900 dark:text-blue-300">
                            การเตรียมพร้อมล่วงหน้า (Preparedness & Prevention)
                          </h3>
                        </div>
                        <ul className="space-y-2.5">
                          {guide.before.map((item, idx) => (
                            <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-800 dark:text-slate-200 leading-relaxed">
                              <CheckCircle2 className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {activeSubTab === 'after' && (
                      <div className="bg-emerald-50/70 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-900/40 rounded-2xl p-4">
                        <div className="flex items-center gap-2 mb-3">
                          <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                          <h3 className="font-bold text-sm text-emerald-900 dark:text-emerald-300">
                            การฟื้นฟูและความปลอดภัยหลังเหตุการณ์ (Recovery & Safety)
                          </h3>
                        </div>
                        <ul className="space-y-2.5">
                          {guide.after.map((item, idx) => (
                            <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-800 dark:text-slate-200 leading-relaxed">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 flex-shrink-0 mt-1.5" />
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {activeSubTab === 'warning' && (
                      <div className="bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/40 rounded-2xl p-4">
                        <div className="flex items-center gap-2 mb-3">
                          <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                          <h3 className="font-bold text-sm text-amber-900 dark:text-amber-300">
                            สัญญาณเตือนภัยธรรมชาติที่ต้องสังเกต (Early Warning Signs)
                          </h3>
                        </div>
                        <ul className="space-y-2.5">
                          {(guide.warningSigns || []).map((item, idx) => (
                            <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-800 dark:text-slate-200 leading-relaxed">
                              <span className="bg-amber-500 text-white w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5">
                                !
                              </span>
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  {/* Do's and Don'ts Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <div className="p-3.5 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/50 dark:border-emerald-800/40">
                      <div className="flex items-center gap-1.5 mb-2 text-emerald-700 dark:text-emerald-400 font-bold text-xs">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>สิ่งที่ควรทำ (DOs)</span>
                      </div>
                      <ul className="space-y-1.5">
                        {guide.dos.map((item, idx) => (
                          <li key={idx} className="text-xs text-slate-700 dark:text-slate-300 leading-normal flex items-start gap-2">
                            <span className="text-emerald-500 font-bold">•</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200/50 dark:border-rose-800/40">
                      <div className="flex items-center gap-1.5 mb-2 text-rose-700 dark:text-rose-400 font-bold text-xs">
                        <XCircle className="w-4 h-4" />
                        <span>สิ่งที่ไม่ควรทำเด็ดขาด (DON'Ts)</span>
                      </div>
                      <ul className="space-y-1.5">
                        {guide.donts.map((item, idx) => (
                          <li key={idx} className="text-xs text-slate-700 dark:text-slate-300 leading-normal flex items-start gap-2">
                            <span className="text-rose-500 font-bold">•</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Quick Hotline Dialer Bar */}
                  <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-900 text-white dark:bg-slate-950 border border-slate-800">
                    <div className="flex items-center gap-2">
                      <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
                      <span className="text-xs text-slate-300">
                        แจ้งเหตุภัยนี้เร่งด่วน: <strong className="text-white">{guide.quickHotline.name}</strong>
                      </span>
                    </div>
                    <a
                      href={`tel:${guide.quickHotline.number}`}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white text-xs font-bold rounded-xl shadow-md shadow-red-500/20 transition-transform active:scale-95"
                    >
                      <HeartPulse className="w-3.5 h-3.5" />
                      <span>โทร {guide.quickHotline.number}</span>
                    </a>
                  </div>
                </div>
              )}
            </div>
          );
        })
      )}
    </div>
  );
};
