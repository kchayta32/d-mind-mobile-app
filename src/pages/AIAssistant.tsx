
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Send, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { ChatMessage } from '@/types/chat';

const AIAssistant = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      content: "ฉันเป็นผู้ช่วย AI ด้านภัยพิบัติ สามารถช่วยคุณเกี่ยวกับความปลอดภัยและการรับมือกับเหตุฉุกเฉินได้ คุณมีคำถามอะไรไหมคะ?",
      sender: 'assistant',
      timestamp: new Date()
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const handleGoBack = () => {
    navigate('/');
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!message.trim()) return;

    // เพิ่มข้อความของผู้ใช้ในแชท
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      content: message,
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
      
      toast({
        title: "ข้อความใหม่",
        description: "ผู้ช่วย AI ได้ตอบกลับข้อความของคุณแล้ว",
      });
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
    <div className="flex flex-col h-screen">
      {/* Header */}
      <header className="bg-guardian-purple text-white p-4 flex items-center">
        <Button 
          variant="ghost" 
          size="icon"
          className="text-white mr-2 hover:bg-guardian-dark-purple"
          onClick={handleGoBack}
        >
          <ArrowLeft size={24} />
        </Button>
        <div>
          <h1 className="text-xl font-bold">ผู้ช่วย AI</h1>
          <p className="text-sm opacity-80">สอบถามข้อมูลเกี่ยวกับความปลอดภัยและภัยพิบัติ</p>
        </div>
      </header>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 bg-guardian-light-bg">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`mb-4 flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {msg.sender === 'assistant' && (
              <div className="bg-guardian-purple text-white rounded-full w-8 h-8 flex items-center justify-center mr-2">
                <span className="text-lg">AI</span>
              </div>
            )}
            
            <div 
              className={`px-4 py-3 rounded-2xl max-w-[80%] ${
                msg.sender === 'user' 
                  ? 'bg-purple-100 ml-auto rounded-br-none' 
                  : 'bg-white rounded-bl-none'
              }`}
            >
              {msg.sender === 'assistant' && <div className="font-semibold mb-1">ผู้ช่วย AI</div>}
              {msg.sender === 'user' && <div className="font-semibold mb-1 text-right">คุณ</div>}
              <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
            </div>
            
            {msg.sender === 'user' && (
              <div className="bg-gray-400 text-white rounded-full w-8 h-8 flex items-center justify-center ml-2">
                <span className="text-lg">U</span>
              </div>
            )}
          </div>
        ))}
        
        {isLoading && (
          <div className="flex justify-start mb-4">
            <div className="bg-guardian-purple text-white rounded-full w-8 h-8 flex items-center justify-center mr-2">
              <span className="text-lg">AI</span>
            </div>
            <div className="px-4 py-3 rounded-2xl bg-white rounded-bl-none max-w-[80%]">
              <div className="font-semibold mb-1">ผู้ช่วย AI</div>
              <div className="flex items-center">
                <Loader2 size={16} className="animate-spin mr-2" />
                <span className="text-sm">กำลังพิมพ์...</span>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 border-t">
        <form onSubmit={handleSendMessage} className="flex gap-2">
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="ถามคำถามเกี่ยวกับภัยพิบัติหรือความช่วยเหลือฉุกเฉิน..."
            className="flex-1"
            disabled={isLoading}
          />
          <Button 
            type="submit" 
            className="bg-guardian-purple hover:bg-guardian-purple/90 rounded-full w-10 h-10 p-0 flex items-center justify-center"
            disabled={isLoading}
          >
            {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default AIAssistant;
