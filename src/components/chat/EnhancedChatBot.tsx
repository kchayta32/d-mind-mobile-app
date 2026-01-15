import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { ChatMessage } from '@/types/chat';
import { Loader2, Send, Mic, MicOff, Volume2 } from 'lucide-react';
import { sanitizeAndParseMarkdown } from '@/utils/markdownUtils';

interface EnhancedChatBotProps {
  className?: string;
}

const EnhancedChatBot: React.FC<EnhancedChatBotProps> = ({ className }) => {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      content: 'สวัสดีครับ! ผม Dr.Mind ผู้เชี่ยวชาญด้านภัยธรรมชาติและแพทย์ฉุกเฉิน 👨‍⚕️ วันนี้ผมมาช่วยให้คำแนะนำเรื่องความปลอดภัยและการรับมือกับเหตุฉุกเฉินครับ คุณมีคำถามอะไรให้ผมช่วยไหมครับ? 😊',
      sender: 'assistant',
      timestamp: new Date()
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isVoiceMode, setIsVoiceMode] = useState(false);
  const { toast } = useToast();
  const messageEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  const frequentQuestions = [
    "เมื่อเกิดแผ่นดินไหวควรทำอย่างไร?",
    "วิธีปฐมพยาบาลเบื้องต้นอย่างไร?",
    "การเตรียมตัวรับมือน้ำท่วม",
    "อาการหัวใจหยุดเต้นทำอย่างไร?",
    "วิธีดับไฟเบื้องต้น",
    "การจัดการเมื่อมีคนหมดสติ",
    "การรับมือกับพายุไต้ฝุ่น",
    "อาหารที่ควรสำรองไว้",
    "การปฐมพยาบาลบาดแผล",
    "อุปกรณ์ฉุกเฉินที่ควรมี",
    "การรับมือกับมลพิษทางอากาศ",
    "วิธีป้องกันควันไฟป่า",
    "การอพยพเมื่อเกิดไฟป่า",
    "การตรวจสอบคุณภาพอากาศ",
    "อาการจากฝุ่น PM2.5",
    "การใช้หน้ากากป้องกันมลพิษ"
  ];

  // Speech recognition setup
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
          title: "ข้อผิดพลาด",
          description: "ไม่สามารถรับฟังเสียงได้ กรุณาลองอีกครั้ง",
          variant: "destructive"
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
  }, [messages]);

  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'th-TH';
      utterance.rate = 0.9;
      utterance.pitch = 1;
      speechSynthesis.speak(utterance);
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
        recognitionRef.current.start();
        setIsListening(true);
      } else {
        toast({
          title: "ไม่รองรับ",
          description: "เบราว์เซอร์ของคุณไม่รองรับการรับฟังเสียง",
          variant: "destructive"
        });
      }
    }
  };

  const handleSendMessage = async (e: React.FormEvent, questionText?: string) => {
    e.preventDefault();

    const messageText = questionText || message;
    if (!messageText.trim()) return;

    // เพิ่มข้อความของผู้ใช้ในแชท
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      content: messageText,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setMessage('');
    setIsLoading(true);

    try {
      // สร้างประวัติการแชทในรูปแบบที่ OpenAI ต้องการ
      const chatHistory = messages.slice(1).map(msg => ({
        role: msg.sender,
        content: msg.content
      }));

      // เรียกใช้ Edge Function พร้อมระบุให้ใช้ข้อมูลจาก documents table
      const { data, error } = await supabase.functions.invoke('ai-chat', {
        body: {
          message: messageText,
          chatHistory,
          useDocuments: true, // ใช้ข้อมูลจาก documents table
          systemPrompt: `คุณคือ Dr.Mind ผู้เชี่ยวชาญด้านภัยธรรมชาติและแพทย์ฉุกเฉิน คุณมีบุคลิกเป็นมิตร อารมณ์ดี และพูดจาอย่างผู้เชี่ยวชาญที่มีประสบการณ์ มักใช้คำลงท้ายด้วย "ครับ" และใส่อีโมจิที่เหมาะสมเป็นครั้งคราว คุณให้คำแนะนำที่ชัดเจน แม่นยำ และปฏิบัติได้จริง โดยอิงจากหลักการทางวิทยาศาสตร์และประสบการณ์จริง 

สำคัญ: ให้ใช้ข้อมูลจากฐานข้อมูล documents ที่มีอยู่เป็นหลักในการตอบคำถาม เพื่อให้คำตอบที่ถูกต้องและเป็นปัจจุบันที่สุด`
        }
      });

      if (error) throw new Error(error.message);

      // เพิ่มข้อความการตอบกลับจาก AI
      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: data.response,
        sender: 'assistant',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMessage]);

      // เล่นเสียงถ้าเปิดโหมดเสียง
      if (isVoiceMode) {
        speakText(data.response);
      }

    } catch (error) {
      console.error('Error calling AI:', error);

      toast({
        title: "ขออภัย",
        description: "เกิดข้อผิดพลาดในการเรียกใช้ AI กรุณาลองอีกครั้ง",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className={`w-full flex flex-col overflow-hidden ${className}`}>
      {/* Enhanced Header with Gradient */}
      <CardHeader className="py-3 px-4 bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 flex-none relative overflow-hidden">
        {/* Decorative circles */}
        <div className="absolute -right-6 -top-6 w-24 h-24 bg-white/10 rounded-full blur-xl"></div>
        <div className="absolute -left-4 -bottom-4 w-16 h-16 bg-white/5 rounded-full blur-lg"></div>

        <div className="flex items-center justify-between relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg border border-white/30">
              <span className="text-xl">👨‍⚕️</span>
            </div>
            <div>
              <CardTitle className="text-base font-semibold text-white drop-shadow-sm">Dr.Mind - ผู้เชี่ยวชาญฉุกเฉิน</CardTitle>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                <p className="text-xs text-white/80">ภัยธรรมชาติ & แพทย์ฉุกเฉิน</p>
              </div>
            </div>
          </div>
          <Button
            variant={isVoiceMode ? "default" : "outline"}
            size="sm"
            onClick={() => setIsVoiceMode(!isVoiceMode)}
            className={`text-[10px] h-8 px-3 rounded-full transition-all duration-200 ${isVoiceMode
              ? 'bg-white text-blue-600 hover:bg-blue-50 shadow-md'
              : 'bg-white/20 text-white border-white/30 hover:bg-white/30 backdrop-blur-sm'
              }`}
          >
            <Volume2 className="w-3.5 h-3.5 mr-1.5" />
            เสียง
          </Button>
        </div>
      </CardHeader>

      {/* Frequent Questions - Horizontal Scroll */}
      <div className="px-3 py-2.5 bg-gradient-to-b from-blue-50/80 to-white border-b border-blue-100/50 flex-none">
        <p className="text-[11px] font-medium text-gray-600 mb-2 flex items-center gap-1.5">
          <span className="text-amber-500">💡</span> คำถามที่พบบ่อย
        </p>
        {/* Horizontal scrollable container */}
        <div
          className="overflow-x-auto scrollbar-hide pb-1"
          style={{
            WebkitOverflowScrolling: 'touch',
            scrollbarWidth: 'none',
            msOverflowStyle: 'none'
          }}
        >
          <div className="flex gap-2 w-max">
            {frequentQuestions.map((question, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                className="whitespace-nowrap flex-shrink-0 bg-white hover:bg-blue-50 active:bg-blue-100 border-blue-200 hover:border-blue-300 text-blue-700 rounded-full px-3 py-1.5 text-[11px] h-7 shadow-sm hover:shadow transition-all duration-150"
                onClick={() => handleQuestionSelect(question)}
              >
                {question}
              </Button>
            ))}
          </div>
        </div>
      </div>

      <CardContent className="p-0 flex flex-col flex-1 min-h-0">
        {/* Messages */}
        <ScrollArea className="flex-1 p-4 bg-gradient-to-b from-slate-50/50 to-white">
          <div className="space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in-0 slide-in-from-bottom-2 duration-300`}
              >
                <div
                  className={`px-4 py-3 rounded-2xl max-w-[85%] shadow-sm ${msg.sender === 'user'
                    ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-br-sm'
                    : 'bg-white text-gray-800 rounded-bl-sm border border-gray-100 shadow-md'
                    }`}
                >
                  {msg.sender === 'assistant' && (
                    <div className="flex items-center mb-2 pb-1.5 border-b border-gray-100">
                      <span className="text-sm mr-1.5">👨‍⚕️</span>
                      <span className="font-semibold text-blue-600 text-xs">Dr.Mind</span>
                    </div>
                  )}
                  <div
                    className="text-sm whitespace-pre-wrap leading-relaxed"
                    dangerouslySetInnerHTML={{
                      __html: sanitizeAndParseMarkdown(msg.content)
                    }}
                  />
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start animate-in fade-in-0 slide-in-from-bottom-2 duration-300">
                <div className="px-4 py-3 rounded-2xl bg-white border border-gray-100 rounded-bl-sm shadow-md">
                  <div className="flex items-center mb-2 pb-1.5 border-b border-gray-100">
                    <span className="text-sm mr-1.5">👨‍⚕️</span>
                    <span className="font-semibold text-blue-600 text-xs">Dr.Mind</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Loader2 size={14} className="animate-spin text-blue-500" />
                    <span className="text-sm text-gray-500">กำลังพิมพ์...</span>
                    <div className="flex gap-0.5">
                      <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                      <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                      <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messageEndRef} />
          </div>
        </ScrollArea>

        {/* Input */}
        <div className="p-3 border-t border-gray-100 bg-white/80 backdrop-blur-sm flex-none pb-safe">
          <form onSubmit={handleSendMessage} className="flex gap-2">
            <Input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="ถามคำถามเกี่ยวกับภัยพิบัติ..."
              className="flex-1 h-10 text-sm rounded-full px-4 bg-gray-50 border-gray-200 focus:bg-white focus:border-blue-300 focus:ring-2 focus:ring-blue-100 transition-all duration-200"
              disabled={isLoading}
            />
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={toggleVoiceListening}
              disabled={isLoading}
              className={`h-10 w-10 rounded-full transition-all duration-200 ${isListening
                  ? 'bg-red-50 border-red-300 text-red-600 animate-pulse'
                  : 'hover:bg-gray-100 border-gray-200'
                }`}
            >
              {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4 text-gray-600" />}
            </Button>
            <Button
              type="submit"
              className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 shadow-md hover:shadow-lg transition-all duration-200 active:scale-95"
              size="icon"
              disabled={isLoading || !message.trim()}
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </Button>
          </form>
        </div>
      </CardContent>
    </Card >
  );
};

export default EnhancedChatBot;
