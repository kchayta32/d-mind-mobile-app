import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { ChatMessage } from '@/types/chat';
import {
  Loader2,
  Send,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Copy,
  Check,
  PhoneCall,
  Sparkles,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { sanitizeAndParseMarkdown } from '@/utils/markdownUtils';

interface EnhancedChatBotProps {
  className?: string;
}

interface DisasterCategory {
  id: string;
  name: string;
  icon: string;
  questions: string[];
}

const DISASTER_CATEGORIES: DisasterCategory[] = [
  {
    id: 'popular',
    name: 'ยอดนิยม',
    icon: '✨',
    questions: [
      'เมื่อเกิดแผ่นดินไหวควรปฏิบัติตนอย่างไร?',
      'วิธีปฐมพยาบาลเบื้องต้นเมื่อมีคนหมดสติ',
      'การเตรียมตัวรับมือน้ำท่วมฉับพลัน',
      'วิธีดับไฟเบื้องต้นและใช้ถังดับเพลิง',
      'อาการอันตรายจากฝุ่น PM2.5 และวิธีป้องกัน',
      'เบอร์โทรฉุกเฉินและการแจ้งเหตุ 1669'
    ]
  },
  {
    id: 'flood',
    name: 'น้ำท่วม',
    icon: '🌊',
    questions: [
      'เมื่อเกิดน้ำท่วมฉับพลันควรทำอย่างไร?',
      'ของจำเป็นในถุงยังชีพน้ำท่วมมีอะไรบ้าง?',
      'วิธีป้องกันโรคฉี่หนูและโรคที่มากับน้ำท่วม',
      'การตัดกระแสไฟฟ้าในบ้านก่อนน้ำท่วมถึง',
      'การปฏิบัติตัวหลังน้ำลดและการฟื้นฟูบ้าน'
    ]
  },
  {
    id: 'fire',
    name: 'ไฟป่า & อัคคีภัย',
    icon: '🔥',
    questions: [
      'วิธีเอาชีวิตรอดเมื่อติดในอาคารไฟไหม้',
      'วิธีป้องกันควันพิษและฝุ่นจากไฟป่า',
      'วิธีใช้ถังดับเพลิงเบื้องต้น (ดึง-ปลด-กด-ส่าย)',
      'การเตรียมตัวอพยพเมื่อไฟป่าลุกลาม',
      'วิธีปฐมพยาบาลแผลไฟไหม้และน้ำร้อนลวก'
    ]
  },
  {
    id: 'earthquake',
    name: 'แผ่นดินไหว',
    icon: '⚡',
    questions: [
      'หลัก หมอบ-กำบัง-ยึด เมื่อแผ่นดินไหว',
      'จุดปลอดภัยที่สุดในบ้านเมื่อเกิดแผ่นดินไหว',
      'สิ่งที่ห้ามทำเด็ดขาดขณะแผ่นดินไหว',
      'วิธีตรวจสอบความปลอดภัยของอาคารหลังแผ่นดินไหว',
      'การเตรียมตัวรับมืออาฟเตอร์ช็อก'
    ]
  },
  {
    id: 'pm25',
    name: 'ฝุ่น PM2.5',
    icon: '💨',
    questions: [
      'วิธีเลือกหน้ากากป้องกันฝุ่น PM2.5 ที่ได้มาตรฐาน',
      'อาการเตือนเมื่อได้รับฝุ่น PM2.5 เกินขนาด',
      'วิธีทำห้องปลอดฝุ่น (Clean Room) ในบ้าน',
      'ข้อควรปฏิบัติสำหรับกลุ่มเสี่ยง เด็ก ผู้สูงอายุ',
      'ค่า PM2.5 เท่าไหร่ถึงอันตรายต่อสุขภาพ'
    ]
  },
  {
    id: 'firstaid',
    name: 'ปฐมพยาบาล',
    icon: '🏥',
    questions: [
      'ขั้นตอนการทำ CPR และใช้เครื่อง AED',
      'วิธีห้ามเลือดบาดแผลฉุกเฉินอย่างถูกต้อง',
      'การช่วยคนสำลักอาหารติดคอ (Heimlich Maneuver)',
      'การปฐมพยาบาลคนเป็นลมแดดหรือฮีทสโตรก',
      'วิธีดูแลกระดูกหักหรือข้อเคลื่อนเบื้องต้น'
    ]
  },
  {
    id: 'hotline',
    name: 'สายด่วนฉุกเฉิน',
    icon: '📞',
    questions: [
      'รวมเบอร์โทรสายด่วนฉุกเฉิน 24 ชม. ที่จำเป็น',
      'ขั้นตอนการแจ้งเหตุ 1669 ให้ช่วยเหลือเร็วที่สุด',
      'ช่องทางขอความช่วยเหลือกรณีติดค้างในพื้นที่ภัยพิบัติ',
      'เบอร์แจ้งเหตุดับเพลิงและกู้ภัย (199)'
    ]
  }
];

const EMERGENCY_HOTLINES = [
  {
    number: '1669',
    name: 'การแพทย์ฉุกเฉิน',
    desc: 'กู้ชีพ / ผู้ป่วยวิกฤต',
    color: 'from-rose-500 to-red-600',
    border: 'border-red-200',
    bg: 'bg-red-50 hover:bg-red-100/80',
    text: 'text-red-700',
    badge: 'bg-red-600 text-white'
  },
  {
    number: '1784',
    name: 'สายด่วน ปภ.',
    desc: 'แจ้งเหตุและเตือนภัยพิบัติ',
    color: 'from-orange-500 to-amber-600',
    border: 'border-orange-200',
    bg: 'bg-orange-50 hover:bg-orange-100/80',
    text: 'text-orange-700',
    badge: 'bg-orange-600 text-white'
  },
  {
    number: '199',
    name: 'ดับเพลิงและกู้ภัย',
    desc: 'เพลิงไหม้ / สัตว์ร้ายเข้าบ้าน',
    color: 'from-amber-500 to-yellow-600',
    border: 'border-amber-200',
    bg: 'bg-amber-50 hover:bg-amber-100/80',
    text: 'text-amber-800',
    badge: 'bg-amber-600 text-white'
  },
  {
    number: '191',
    name: 'เหตุด่วนเหตุร้าย',
    desc: 'ตำรวจ / ภัยคุกคามชีวิต',
    color: 'from-blue-600 to-indigo-700',
    border: 'border-blue-200',
    bg: 'bg-blue-50 hover:bg-blue-100/80',
    text: 'text-blue-700',
    badge: 'bg-blue-600 text-white'
  }
];

const EnhancedChatBot: React.FC<EnhancedChatBotProps> = ({ className }) => {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      content:
        'สวัสดีครับ! ผม **Dr.Mind** ผู้เชี่ยวชาญด้านภัยธรรมชาติและการแพทย์ฉุกเฉิน 👨‍⚕️\n\nพร้อมให้คำแนะนำในการเอาชีวิตรอด ปฐมพยาบาลเบื้องต้น และเตรียมความพร้อมรับมือภัยพิบัติต่างๆ ตลอด 24 ชั่วโมงครับ\n\n💡 *คุณสามารถเลือกหมวดคำถามด้านบน หรือพิมพ์บอกเหตุการณ์ที่เกิดขึ้นได้ทันทีครับ*',
      sender: 'assistant',
      timestamp: new Date()
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isVoiceMode, setIsVoiceMode] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('popular');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [speakingId, setSpeakingId] = useState<string | null>(null);
  const [showCrisisBar, setShowCrisisBar] = useState<boolean>(true);

  const { toast } = useToast();
  const messageEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  // Speech recognition setup (STT)
  useEffect(() => {
    if (typeof window !== 'undefined' && 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'th-TH';

      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setMessage(transcript);
        setIsListening(false);
      };

      recognitionRef.current.onerror = () => {
        setIsListening(false);
        toast({
          title: 'ข้อผิดพลาด',
          description: 'ไม่สามารถรับฟังเสียงได้ กรุณาลองอีกครั้ง',
          variant: 'destructive'
        });
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }
  }, [toast]);

  const scrollToBottom = () => {
    messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Clean up TTS on unmount
  useEffect(() => {
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const speakText = (text: string, msgId?: string) => {
    if (!('speechSynthesis' in window)) {
      toast({
        title: 'ไม่รองรับ',
        description: 'เบราว์เซอร์ของคุณไม่รองรับการอ่านออกเสียง',
        variant: 'destructive'
      });
      return;
    }

    if (speakingId === msgId) {
      window.speechSynthesis.cancel();
      setSpeakingId(null);
      return;
    }

    window.speechSynthesis.cancel();
    // Strip markdown formatting symbols for clean speech synthesis
    const cleanText = text.replace(/[*_#`~[\]]/g, '').trim();
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = 'th-TH';
    utterance.rate = 0.95;
    utterance.pitch = 1.0;

    if (msgId) setSpeakingId(msgId);

    utterance.onend = () => {
      setSpeakingId(null);
    };

    utterance.onerror = () => {
      setSpeakingId(null);
    };

    window.speechSynthesis.speak(utterance);
  };

  const handleCopyMessage = async (id: string, text: string) => {
    try {
      // Strip markdown symbols for clean copied text
      const cleanText = text.replace(/[*_#`~]/g, '');
      await navigator.clipboard.writeText(cleanText);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
      toast({
        title: 'คัดลอกข้อความแล้ว',
        description: 'บันทึกข้อความลงในคลิปบอร์ดเรียบร้อย',
        duration: 1500
      });
    } catch {
      toast({
        title: 'คัดลอกไม่สำเร็จ',
        description: 'ไม่สามารถเข้าถึงคลิปบอร์ดได้',
        variant: 'destructive'
      });
    }
  };

  const handleQuestionSelect = (question: string) => {
    setMessage(question);
    setTimeout(() => {
      handleSendMessage(new Event('submit') as any, question);
    }, 100);
  };

  const toggleVoiceListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.start();
          setIsListening(true);
        } catch {
          setIsListening(false);
        }
      } else {
        toast({
          title: 'ไม่รองรับ',
          description: 'เบราว์เซอร์ของคุณไม่รองรับการรับฟังเสียงพูด (Speech Recognition)',
          variant: 'destructive'
        });
      }
    }
  };

  const handleSendMessage = async (e: React.FormEvent, questionText?: string) => {
    e.preventDefault();

    const messageText = questionText || message;
    if (!messageText.trim() || isLoading) return;

    // เพิ่มข้อความของผู้ใช้ในแชท
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      content: messageText.trim(),
      sender: 'user',
      timestamp: new Date()
    };

    setMessages((prev) => [...prev, userMessage]);
    setMessage('');
    setIsLoading(true);

    try {
      // สร้างประวัติการแชท
      const chatHistory = messages.slice(1).map((msg) => ({
        role: msg.sender,
        content: msg.content
      }));

      // เรียกใช้ Edge Function ai-chat
      const { data, error } = await supabase.functions.invoke('ai-chat', {
        body: {
          message: messageText.trim(),
          chatHistory,
          useDocuments: true,
          systemPrompt: `คุณคือ Dr.Mind ผู้เชี่ยวชาญด้านภัยธรรมชาติและการแพทย์ฉุกเฉิน คุณมีบุคลิกอบอุ่น สุภาพ มั่นใจ ให้คำแนะนำที่กระชับ ชัดเจน เรียงลำดับขั้นตอน 1, 2, 3 เพื่อให้ผู้ประสบภัยสามารถปฏิบัติตามได้ทันที 
หากมีอันตรายถึงชีวิต ให้เตือนให้ติดต่อสายด่วนฉุกเฉิน (เช่น 1669 หรือ 1784) เสมอ ลงท้ายด้วย "ครับ" และใช้อีโมจิอย่างเหมาะสม`
        }
      });

      if (error) throw new Error(error.message);

      const aiResponseText = data?.response || 'ขออภัยครับ ขณะนี้ระบบมีปัญหาชั่วคราว กรุณาติดต่อสายด่วน 1669 หากมีเหตุฉุกเฉินครับ';

      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: aiResponseText,
        sender: 'assistant',
        timestamp: new Date()
      };

      setMessages((prev) => [...prev, aiMessage]);

      // เล่นเสียงถ้าเปิดโหมดเสียงอัตโนมัติ
      if (isVoiceMode) {
        speakText(aiResponseText, aiMessage.id);
      }
    } catch (error) {
      console.error('Error calling AI:', error);

      const fallbackReply =
        'ขออภัยครับ ระบบไม่สามารถเชื่อมต่อกับฐานข้อมูล AI ได้ในขณะนี้ หากคุณตกอยู่ในสถานการณ์ฉุกเฉินเร่งด่วน โปรดโทรสายด่วน **1669** (การแพทย์ฉุกเฉิน) หรือ **1784** (กรมป้องกันและบรรเทาสาธารณภัย) ทันทีครับ';

      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          content: fallbackReply,
          sender: 'assistant',
          timestamp: new Date()
        }
      ]);

      toast({
        title: 'เกิดข้อผิดพลาดในการเชื่อมต่อ',
        description: 'ระบบตอบกลับด้วยคำแนะนำฉุกเฉินอัตโนมัติ',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const formatTimestamp = (date: Date) => {
    try {
      const d = new Date(date);
      return d.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  const currentQuestions =
    DISASTER_CATEGORIES.find((cat) => cat.id === selectedCategory)?.questions ||
    DISASTER_CATEGORIES[0].questions;

  return (
    <Card className={`w-full flex flex-col bg-slate-50/50 overflow-hidden ${className}`}>
      {/* 1. Branding & Voice Bar */}
      <div className="py-2.5 px-4 bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 text-white flex-none relative overflow-hidden shadow-sm">
        <div className="absolute -right-8 -top-8 w-28 h-28 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>
        <div className="absolute -left-6 -bottom-6 w-20 h-20 bg-indigo-400/20 rounded-full blur-xl pointer-events-none"></div>

        <div className="flex items-center justify-between relative z-10">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center shadow-inner border border-white/30">
                <span className="text-2xl select-none">👨‍⚕️</span>
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-400 border-2 border-blue-700 rounded-full">
                <span className="absolute inset-0 rounded-full bg-emerald-300 animate-ping opacity-75"></span>
              </span>
            </div>

            <div>
              <div className="flex items-center gap-1.5">
                <h2 className="text-sm font-bold text-white drop-shadow-xs">Dr.Mind AI</h2>
                <span className="bg-white/20 text-white text-[10px] font-medium px-2 py-0.2 rounded-full backdrop-blur-xs border border-white/20 flex items-center gap-0.5">
                  <Sparkles className="w-2.5 h-2.5 text-amber-300" /> แพทย์ & ภัยพิบัติ
                </span>
              </div>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span>
                <p className="text-[11px] text-blue-100/90 font-medium">
                  พร้อมให้คำปรึกษาตลอด 24 ชั่วโมง
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant={isVoiceMode ? 'default' : 'outline'}
              size="sm"
              onClick={() => {
                const newMode = !isVoiceMode;
                setIsVoiceMode(newMode);
                if (!newMode && 'speechSynthesis' in window) {
                  window.speechSynthesis.cancel();
                  setSpeakingId(null);
                }
              }}
              className={`text-[11px] h-8 px-3 rounded-full transition-all duration-200 font-medium ${
                isVoiceMode
                  ? 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-md border-transparent'
                  : 'bg-white/15 text-white border-white/30 hover:bg-white/25 backdrop-blur-xs'
              }`}
              title={isVoiceMode ? 'ปิดการอ่านเสียงอัตโนมัติ' : 'เปิดการอ่านเสียงตอบกลับอัตโนมัติ'}
            >
              {isVoiceMode ? (
                <>
                  <Volume2 className="w-3.5 h-3.5 mr-1 text-white animate-pulse" />
                  <span>เสียง: เปิด</span>
                </>
              ) : (
                <>
                  <VolumeX className="w-3.5 h-3.5 mr-1 text-blue-100" />
                  <span>เสียง: ปิด</span>
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* 2. Emergency Crisis Quick-Call Bar */}
      <div className="bg-gradient-to-r from-red-50 via-rose-50 to-orange-50 border-b border-red-200/70 px-3 py-2 flex-none">
        <div className="flex items-center justify-between mb-1.5">
          <div className="flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5 text-red-600 animate-pulse flex-shrink-0" />
            <span className="text-[11px] font-bold text-red-800 tracking-tight">
              สายด่วนฉุกเฉิน (กดโทรออกได้ทันที)
            </span>
          </div>
          <button
            onClick={() => setShowCrisisBar(!showCrisisBar)}
            className="text-[10px] text-red-600 hover:text-red-800 flex items-center gap-0.5 font-medium"
          >
            {showCrisisBar ? (
              <>
                ย่อ <ChevronUp className="w-3 h-3" />
              </>
            ) : (
              <>
                ขยาย <ChevronDown className="w-3 h-3" />
              </>
            )}
          </button>
        </div>

        {showCrisisBar && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 transition-all duration-200">
            {EMERGENCY_HOTLINES.map((item) => (
              <a
                key={item.number}
                href={`tel:${item.number}`}
                className={`flex items-center gap-2 p-1.5 rounded-xl border ${item.border} ${item.bg} transition-all duration-150 group shadow-2xs hover:shadow-xs active:scale-[0.98]`}
                title={`โทร ${item.number} ${item.name} (${item.desc})`}
              >
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center font-black text-xs ${item.badge} shadow-xs flex-shrink-0 group-hover:scale-105 transition-transform`}
                >
                  <PhoneCall className="w-3.5 h-3.5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1">
                    <span className="font-extrabold text-xs text-gray-900 tracking-tight">
                      {item.number}
                    </span>
                    <span className="text-[10px] font-bold text-red-600 truncate">{item.name}</span>
                  </div>
                  <p className="text-[9px] text-gray-500 truncate">{item.desc}</p>
                </div>
              </a>
            ))}
          </div>
        )}
      </div>

      {/* 3. Categorized Disaster Quick Prompts */}
      <div className="px-3 pt-2 pb-2 bg-white border-b border-slate-200/70 flex-none space-y-2">
        {/* Category Tabs */}
        <div
          className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-hide"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {DISASTER_CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`whitespace-nowrap flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold transition-all duration-150 flex-shrink-0 ${
                  isSelected
                    ? 'bg-blue-600 text-white shadow-xs scale-[1.02]'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                <span>{cat.icon}</span>
                <span>{cat.name}</span>
              </button>
            );
          })}
        </div>

        {/* Suggestion Pills for Active Category */}
        <div
          className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {currentQuestions.map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleQuestionSelect(q)}
              className="whitespace-nowrap flex-shrink-0 text-left bg-blue-50/70 hover:bg-blue-100/90 active:bg-blue-200/80 border border-blue-200/80 text-blue-800 rounded-full px-3 py-1 text-xs transition-all duration-150 shadow-2xs hover:shadow-xs hover:border-blue-300"
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      {/* 4. Message Stream Area */}
      <CardContent className="p-0 flex flex-col flex-1 min-h-0 bg-slate-50/40">
        <ScrollArea className="flex-1 p-3 sm:p-4">
          <div className="space-y-4 max-w-4xl mx-auto">
            {messages.map((msg) => {
              const isUser = msg.sender === 'user';
              const isSpeakingThis = speakingId === msg.id;
              const isCopiedThis = copiedId === msg.id;

              return (
                <div
                  key={msg.id}
                  className={`flex ${isUser ? 'justify-end' : 'justify-start'} animate-in fade-in-0 slide-in-from-bottom-2 duration-300`}
                >
                  <div
                    className={`max-w-[88%] sm:max-w-[80%] rounded-2xl shadow-sm transition-all ${
                      isUser
                        ? 'bg-gradient-to-br from-blue-600 via-blue-600 to-indigo-700 text-white rounded-br-xs px-4 py-3 shadow-blue-500/10'
                        : 'bg-white text-gray-800 rounded-bl-xs border border-slate-200/80 px-4 py-3.5 shadow-slate-200/50'
                    }`}
                  >
                    {/* Header in Assistant Message */}
                    {!isUser && (
                      <div className="flex items-center justify-between mb-2 pb-2 border-b border-slate-100">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-xs shadow-xs">
                            👨‍⚕️
                          </div>
                          <div>
                            <span className="font-bold text-blue-700 text-xs">Dr.Mind</span>
                            <span className="text-[10px] text-gray-400 ml-1.5 hidden sm:inline">
                              ผู้เชี่ยวชาญการแพทย์ & ภัยพิบัติ
                            </span>
                          </div>
                        </div>

                        {/* Top-right actions: TTS + Copy */}
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => speakText(msg.content, msg.id)}
                            className={`p-1 rounded-md transition-colors text-xs flex items-center gap-1 ${
                              isSpeakingThis
                                ? 'bg-emerald-100 text-emerald-700 font-medium'
                                : 'text-gray-400 hover:text-blue-600 hover:bg-blue-50'
                            }`}
                            title={isSpeakingThis ? 'หยุดอ่านเสียง' : 'อ่านออกเสียง'}
                          >
                            <Volume2
                              className={`w-3.5 h-3.5 ${isSpeakingThis ? 'animate-pulse text-emerald-600' : ''}`}
                            />
                            {isSpeakingThis && <span className="text-[10px]">กำลังอ่าน</span>}
                          </button>

                          <button
                            onClick={() => handleCopyMessage(msg.id, msg.content)}
                            className="p-1 rounded-md text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                            title="คัดลอกข้อความ"
                          >
                            {isCopiedThis ? (
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Message Content */}
                    <div
                      className={`text-sm leading-relaxed ${
                        isUser
                          ? 'whitespace-pre-wrap font-normal text-white'
                          : 'text-slate-800 prose prose-sm max-w-none prose-headings:font-bold prose-headings:text-slate-900 prose-p:my-1 prose-ul:my-1 prose-li:my-0.5'
                      }`}
                      dangerouslySetInnerHTML={{
                        __html: sanitizeAndParseMarkdown(msg.content)
                      }}
                    />

                    {/* Timestamp & Footer info */}
                    <div
                      className={`mt-1.5 flex items-center justify-end text-[10px] ${
                        isUser ? 'text-blue-100/80' : 'text-gray-400'
                      }`}
                    >
                      <span>{formatTimestamp(msg.timestamp)}</span>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* 5. Animated Typing / Generating Indicator */}
            {isLoading && (
              <div className="flex justify-start animate-in fade-in-0 slide-in-from-bottom-2 duration-300">
                <div className="px-4 py-3 rounded-2xl bg-white border border-blue-100 rounded-bl-xs shadow-md max-w-[85%]">
                  <div className="flex items-center gap-2 mb-2 pb-1.5 border-b border-slate-100">
                    <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center text-xs">
                      👨‍⚕️
                    </div>
                    <span className="font-bold text-blue-600 text-xs">Dr.Mind</span>
                    <span className="text-[10px] text-blue-400 font-medium animate-pulse">
                      กำลังประมวลผลคำแนะนำ...
                    </span>
                  </div>

                  <div className="flex items-center gap-2.5 py-1">
                    <Loader2 size={15} className="animate-spin text-blue-600 flex-shrink-0" />
                    <span className="text-xs text-gray-600">
                      กำลังค้นหาข้อมูลจากฐานข้อมูลเหตุฉุกเฉิน
                    </span>
                    <div className="flex gap-1 items-center ml-1">
                      <span
                        className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"
                        style={{ animationDelay: '0ms' }}
                      ></span>
                      <span
                        className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce"
                        style={{ animationDelay: '150ms' }}
                      ></span>
                      <span
                        className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"
                        style={{ animationDelay: '300ms' }}
                      ></span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messageEndRef} />
          </div>
        </ScrollArea>

        {/* 6. Input Control Bar */}
        <div className="p-3 border-t border-slate-200/80 bg-white/95 backdrop-blur-md flex-none pb-safe">
          <form onSubmit={handleSendMessage} className="max-w-4xl mx-auto flex items-center gap-2">
            <div className="relative flex-1">
              <Input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={
                  isListening
                    ? 'กำลังฟังเสียงของคุณ...'
                    : 'ถาม Dr.Mind เกี่ยวกับการรับมือภัยพิบัติหรือปฐมพยาบาล...'
                }
                className="w-full h-11 text-sm rounded-full pl-4 pr-10 bg-slate-50 border-slate-200 focus:bg-white focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all shadow-2xs"
                disabled={isLoading}
              />
              {message.trim() && (
                <button
                  type="button"
                  onClick={() => setMessage('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs font-bold w-4 h-4 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center"
                  title="ล้างข้อความ"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Mic Button with Pulse Animation */}
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={toggleVoiceListening}
              disabled={isLoading}
              className={`h-11 w-11 rounded-full flex-shrink-0 transition-all duration-200 shadow-2xs ${
                isListening
                  ? 'bg-rose-50 border-rose-400 text-rose-600 ring-2 ring-rose-200 animate-pulse'
                  : 'hover:bg-slate-100 border-slate-200 text-slate-600'
              }`}
              title={isListening ? 'กำลังบันทึกเสียง (กดเพื่อหยุด)' : 'พูดด้วยเสียง (Speech-to-Text)'}
            >
              {isListening ? (
                <MicOff className="w-4 h-4 text-rose-600 animate-bounce" />
              ) : (
                <Mic className="w-4 h-4" />
              )}
            </Button>

            {/* Send Button */}
            <Button
              type="submit"
              className="h-11 w-11 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md hover:shadow-lg transition-all duration-200 active:scale-95 flex-shrink-0 flex items-center justify-center disabled:opacity-50"
              size="icon"
              disabled={isLoading || !message.trim()}
              title="ส่งข้อความ"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4 ml-0.5" />
              )}
            </Button>
          </form>
        </div>
      </CardContent>
    </Card>
  );
};

export default EnhancedChatBot;
