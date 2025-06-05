
import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { ChatMessage } from '@/types/chat';
import { Loader2, Send, Mic, MicOff, Volume2 } from 'lucide-react';

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
    <Card className={`w-full shadow-lg ${className}`}>
      <CardHeader className="pb-2 bg-gradient-to-r from-blue-50 to-purple-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <span className="text-white text-lg">👨‍⚕️</span>
            </div>
            <div>
              <CardTitle className="text-lg font-medium text-gray-800">Dr.Mind - ผู้เชี่ยวชาญฉุกเฉิน</CardTitle>
              <p className="text-sm text-gray-600">ภัยธรรมชาติ & แพทย์ฉุกเฉิน</p>
            </div>
          </div>
          <div className="flex space-x-2">
            <Button
              variant={isVoiceMode ? "default" : "outline"}
              size="sm"
              onClick={() => setIsVoiceMode(!isVoiceMode)}
              className="text-xs"
            >
              <Volume2 className="w-4 h-4 mr-1" />
              เสียง
            </Button>
          </div>
        </div>
      </CardHeader>

      {/* Frequent Questions - Scrollable */}
      <div className="px-4 py-3 bg-gray-50 border-b">
        <p className="text-sm font-medium text-gray-700 mb-2">💡 คำถามที่พบบ่อย</p>
        <ScrollArea className="w-full">
          <div className="flex space-x-3 pb-2">
            {frequentQuestions.map((question, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                className="whitespace-nowrap bg-white hover:bg-blue-50 border-blue-200 text-blue-700 rounded-full px-4 py-2 text-xs"
                onClick={() => handleQuestionSelect(question)}
              >
                {question}
              </Button>
            ))}
          </div>
        </ScrollArea>
      </div>

      <CardContent className="p-0 flex flex-col h-96">
        {/* Messages */}
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`px-4 py-3 rounded-2xl max-w-[80%] ${
                    msg.sender === 'user'
                      ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-br-md'
                      : 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800 rounded-bl-md border'
                  }`}
                >
                  {msg.sender === 'assistant' && (
                    <div className="flex items-center mb-2">
                      <span className="text-lg mr-2">👨‍⚕️</span>
                      <span className="font-semibold text-blue-600">Dr.Mind</span>
                    </div>
                  )}
                  <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="px-4 py-3 rounded-2xl bg-gray-100 border rounded-bl-md">
                  <div className="flex items-center">
                    <span className="text-lg mr-2">👨‍⚕️</span>
                    <span className="font-semibold text-blue-600 mr-2">Dr.Mind</span>
                  </div>
                  <div className="flex items-center mt-2">
                    <Loader2 size={16} className="animate-spin mr-2 text-blue-500" />
                    <span className="text-sm text-gray-600">กำลังพิมพ์...</span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messageEndRef} />
          </div>
        </ScrollArea>

        {/* Input */}
        <div className="p-4 border-t bg-white">
          <form onSubmit={handleSendMessage} className="flex gap-2">
            <Input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="ถามคำถามเกี่ยวกับภัยพิบัติหรือการปฐมพยาบาล..."
              className="flex-1"
              disabled={isLoading}
            />
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={toggleVoiceListening}
              disabled={isLoading}
              className={isListening ? 'bg-red-100 border-red-300' : ''}
            >
              {isListening ? <MicOff className="w-4 h-4 text-red-600" /> : <Mic className="w-4 h-4" />}
            </Button>
            <Button 
              type="submit" 
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
              disabled={isLoading}
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </Button>
          </form>
        </div>
      </CardContent>
    </Card>
  );
};

export default EnhancedChatBot;
