
import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { ChatMessage } from '@/types/chat';
import { Loader2, Send } from 'lucide-react';

const AIChat: React.FC = () => {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      content: 'สวัสดีค่ะ ฉันเป็นผู้ช่วย AI สำหรับเหตุฉุกเฉิน คุณสามารถถามคำถามเกี่ยวกับการเตรียมพร้อมรับมือภัยพิบัติได้',
      sender: 'assistant',
      timestamp: new Date()
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const messageEndRef = useRef<HTMLDivElement>(null);

  // ฟังก์ชันเลื่อนไปยังข้อความล่าสุด
  const scrollToBottom = () => {
    messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!message.trim()) return;

    // เพิ่มข้อความของผู้ใช้ลงในแชท
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      content: message,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    setMessage('');

    try {
      // สร้างประวัติการแชทในรูปแบบที่ OpenAI ต้องการ
      const chatHistory = messages.slice(1).map(msg => ({
        role: msg.sender,
        content: msg.content
      }));

      // เรียกใช้ Edge Function
      const { data, error } = await supabase.functions.invoke('ai-chat', {
        body: {
          message,
          chatHistory
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
    <Card className="w-full h-[500px] shadow-sm flex flex-col">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium">สนทนากับ AI ผู้ช่วยฉุกเฉิน</CardTitle>
      </CardHeader>
      <CardContent className="pb-2 flex-1 overflow-y-auto">
        <div className="space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`px-4 py-2 rounded-lg max-w-[80%] ${
                  msg.sender === 'user'
                    ? 'bg-guardian-light-blue text-guardian-dark-blue rounded-br-none'
                    : 'bg-guardian-blue text-white rounded-bl-none'
                }`}
              >
                {msg.content}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="px-4 py-2 rounded-lg bg-guardian-blue text-white rounded-bl-none flex items-center">
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                กำลังพิมพ์...
              </div>
            </div>
          )}
          <div ref={messageEndRef} />
        </div>
      </CardContent>
      <CardFooter>
        <form onSubmit={handleSubmit} className="w-full flex gap-2">
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="ถามคำถามเกี่ยวกับภัยพิบัติหรือความช่วยเหลือฉุกเฉิน..."
            className="flex-1"
            disabled={isLoading}
          />
          <Button 
            type="submit" 
            className="bg-guardian-blue hover:bg-guardian-dark-blue"
            disabled={isLoading}
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </Button>
        </form>
      </CardFooter>
    </Card>
  );
};

export default AIChat;
