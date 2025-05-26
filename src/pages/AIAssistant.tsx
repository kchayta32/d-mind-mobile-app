
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
    <div className="flex flex-col h-screen bg-gradient-to-br from-blue-400 via-blue-500 to-blue-600">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 flex items-center shadow-lg">
        <Button 
          variant="ghost" 
          size="icon"
          className="text-white mr-3 hover:bg-blue-500/30 rounded-full"
          onClick={handleGoBack}
        >
          <ArrowLeft size={24} />
        </Button>
        <div className="flex items-center">
          <img 
            src="/lovable-uploads/b5550bd4-d83d-4e1e-ac09-025117b87c86.png" 
            alt="D-MIND Logo" 
            className="h-8 w-8 mr-3"
          />
          <div>
            <h1 className="text-xl font-bold">ผู้ช่วย AI D-MIND</h1>
            <p className="text-sm opacity-90">สอบถามข้อมูลเกี่ยวกับความปลอดภัยและภัยพิบัติ</p>
          </div>
        </div>
      </header>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 bg-gradient-to-b from-blue-50 to-white">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`mb-4 flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {msg.sender === 'assistant' && (
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-full w-10 h-10 flex items-center justify-center mr-3 shadow-md">
                <img 
                  src="/lovable-uploads/b5550bd4-d83d-4e1e-ac09-025117b87c86.png" 
                  alt="AI" 
                  className="w-6 h-6"
                />
              </div>
            )}
            
            <div 
              className={`px-5 py-4 rounded-2xl max-w-[80%] shadow-md ${
                msg.sender === 'user' 
                  ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white ml-auto rounded-br-md' 
                  : 'bg-white text-gray-800 rounded-bl-md border border-blue-100'
              }`}
            >
              {msg.sender === 'assistant' && <div className="font-semibold mb-2 text-blue-600">ผู้ช่วย AI D-MIND</div>}
              {msg.sender === 'user' && <div className="font-semibold mb-2 text-right text-blue-100">คุณ</div>}
              <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.content}</p>
            </div>
            
            {msg.sender === 'user' && (
              <div className="bg-gradient-to-br from-gray-400 to-gray-500 text-white rounded-full w-10 h-10 flex items-center justify-center ml-3 shadow-md">
                <span className="text-lg font-semibold">U</span>
              </div>
            )}
          </div>
        ))}
        
        {isLoading && (
          <div className="flex justify-start mb-4">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-full w-10 h-10 flex items-center justify-center mr-3 shadow-md">
              <img 
                src="/lovable-uploads/b5550bd4-d83d-4e1e-ac09-025117b87c86.png" 
                alt="AI" 
                className="w-6 h-6"
              />
            </div>
            <div className="px-5 py-4 rounded-2xl bg-white rounded-bl-md max-w-[80%] shadow-md border border-blue-100">
              <div className="font-semibold mb-2 text-blue-600">ผู้ช่วย AI D-MIND</div>
              <div className="flex items-center">
                <Loader2 size={16} className="animate-spin mr-2 text-blue-500" />
                <span className="text-sm text-gray-600">กำลังพิมพ์...</span>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white border-t border-blue-200 shadow-lg">
        <form onSubmit={handleSendMessage} className="flex gap-3">
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="ถามคำถามเกี่ยวกับภัยพิบัติหรือความช่วยเหลือฉุกเฉิน..."
            className="flex-1 border-blue-200 focus:border-blue-400 focus:ring-blue-400 rounded-full px-4 py-3"
            disabled={isLoading}
          />
          <Button 
            type="submit" 
            className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 rounded-full w-12 h-12 p-0 flex items-center justify-center shadow-md"
            disabled={isLoading}
          >
            {isLoading ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default AIAssistant;
