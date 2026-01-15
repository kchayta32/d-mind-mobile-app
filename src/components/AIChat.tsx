
import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { ChatMessage } from '@/types/chat';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import {
  Loader2,
  Send,
  Bot,
  User,
  Sparkles,
  AlertTriangle,
  Droplets,
  Flame,
  Mountain,
  Wind,
  Phone,
  MapPin,
  RefreshCw,
  Trash2
} from 'lucide-react';

// Quick action buttons for common disaster questions
const QUICK_ACTIONS = [
  {
    icon: <AlertTriangle className="w-3 h-3" />,
    label: 'แผ่นดินไหว',
    prompt: 'วิธีรับมือแผ่นดินไหวที่ถูกต้องคืออะไร?',
    color: 'bg-orange-100 text-orange-700 hover:bg-orange-200'
  },
  {
    icon: <Droplets className="w-3 h-3" />,
    label: 'น้ำท่วม',
    prompt: 'จะต้องเตรียมตัวอย่างไรเมื่อเกิดน้ำท่วม?',
    color: 'bg-blue-100 text-blue-700 hover:bg-blue-200'
  },
  {
    icon: <Flame className="w-3 h-3" />,
    label: 'ไฟป่า',
    prompt: 'วิธีป้องกันตัวเองจากไฟป่าและหมอกควัน?',
    color: 'bg-red-100 text-red-700 hover:bg-red-200'
  },
  {
    icon: <Wind className="w-3 h-3" />,
    label: 'พายุ',
    prompt: 'ทำอย่างไรเมื่อมีพายุเข้า?',
    color: 'bg-purple-100 text-purple-700 hover:bg-purple-200'
  },
  {
    icon: <Mountain className="w-3 h-3" />,
    label: 'ดินถล่ม',
    prompt: 'สัญญาณเตือนก่อนเกิดดินถล่มมีอะไรบ้าง?',
    color: 'bg-amber-100 text-amber-700 hover:bg-amber-200'
  },
  {
    icon: <Phone className="w-3 h-3" />,
    label: 'เบอร์ฉุกเฉิน',
    prompt: 'เบอร์โทรศัพท์ฉุกเฉินที่สำคัญในประเทศไทยมีอะไรบ้าง?',
    color: 'bg-green-100 text-green-700 hover:bg-green-200'
  },
  {
    icon: <MapPin className="w-3 h-3" />,
    label: 'ศูนย์พักพิง',
    prompt: 'จะหาศูนย์พักพิงได้อย่างไรเมื่อเกิดภัยพิบัติ?',
    color: 'bg-teal-100 text-teal-700 hover:bg-teal-200'
  }
];

// Simple markdown-like rendering for responses
const renderMessageContent = (content: string) => {
  // Split by newlines and handle basic formatting
  const lines = content.split('\n');

  return lines.map((line, index) => {
    // Handle bullet points
    if (line.startsWith('- ') || line.startsWith('• ')) {
      return (
        <li key={index} className="ml-4 list-disc">
          {line.substring(2)}
        </li>
      );
    }
    // Handle numbered lists
    if (/^\d+\.\s/.test(line)) {
      return (
        <li key={index} className="ml-4 list-decimal">
          {line.replace(/^\d+\.\s/, '')}
        </li>
      );
    }
    // Handle headers (lines starting with **text**)
    if (line.startsWith('**') && line.endsWith('**')) {
      return (
        <p key={index} className="font-bold mt-2 mb-1">
          {line.slice(2, -2)}
        </p>
      );
    }
    // Handle bold text inline
    const boldParsed = line.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>');
    if (boldParsed !== line) {
      return (
        <p key={index} className="mb-1" dangerouslySetInnerHTML={{ __html: boldParsed }} />
      );
    }
    // Regular text
    if (line.trim()) {
      return <p key={index} className="mb-1">{line}</p>;
    }
    return <br key={index} />;
  });
};

const AIChat: React.FC = () => {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      content: 'สวัสดีค่ะ! 👋 ฉันเป็น **ผู้ช่วย AI ด้านภัยพิบัติ** ของ D-MIND\n\nคุณสามารถถามเกี่ยวกับ:\n- วิธีรับมือภัยพิบัติต่างๆ\n- การเตรียมความพร้อม\n- เบอร์โทรฉุกเฉิน\n- ศูนย์พักพิง\n\nหรือกดปุ่มด้านล่างเพื่อถามคำถามยอดนิยม 👇',
      sender: 'assistant',
      timestamp: new Date()
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [showQuickActions, setShowQuickActions] = useState(true);
  const { toast } = useToast();
  const messageEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async (content: string) => {
    if (!content.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      content: content,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    setMessage('');
    setShowQuickActions(false);

    try {
      const chatHistory = messages.slice(1).map(msg => ({
        role: msg.sender,
        content: msg.content
      }));

      const { data, error } = await supabase.functions.invoke('ai-chat', {
        body: {
          message: content,
          chatHistory
        }
      });

      if (error) throw new Error(error.message);

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

      // Add error message to chat
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        content: '❌ ขออภัย เกิดข้อผิดพลาดในการประมวลผล กรุณาลองอีกครั้ง',
        sender: 'assistant',
        timestamp: new Date()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await sendMessage(message);
  };

  const handleQuickAction = (prompt: string) => {
    sendMessage(prompt);
  };

  const handleClearChat = () => {
    setMessages([{
      id: '1',
      content: 'สวัสดีค่ะ! 👋 ฉันเป็น **ผู้ช่วย AI ด้านภัยพิบัติ** ของ D-MIND\n\nคุณสามารถถามเกี่ยวกับ:\n- วิธีรับมือภัยพิบัติต่างๆ\n- การเตรียมความพร้อม\n- เบอร์โทรฉุกเฉิน\n- ศูนย์พักพิง\n\nหรือกดปุ่มด้านล่างเพื่อถามคำถามยอดนิยม 👇',
      sender: 'assistant',
      timestamp: new Date()
    }]);
    setShowQuickActions(true);
  };

  return (
    <Card className="w-full h-[600px] shadow-xl flex flex-col bg-gradient-to-br from-slate-50 to-white border-0 rounded-2xl overflow-hidden">
      {/* Header */}
      <CardHeader className="pb-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2 rounded-xl backdrop-blur-sm">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <CardTitle className="text-lg font-semibold">AI ผู้ช่วยภัยพิบัติ</CardTitle>
              <p className="text-xs text-blue-100">ถามได้ทุกเรื่องเกี่ยวกับการรับมือภัยพิบัติ</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleClearChat}
              className="h-8 w-8 text-white/70 hover:text-white hover:bg-white/10"
            >
              <RefreshCw className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      {/* Messages */}
      <CardContent className="flex-1 p-0 overflow-hidden">
        <ScrollArea className="h-full px-4 py-4">
          <div className="space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-2 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.sender === 'assistant' && (
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                    <Bot className="w-4 h-4 text-blue-600" />
                  </div>
                )}
                <div
                  className={`max-w-[80%] px-4 py-3 rounded-2xl ${msg.sender === 'user'
                      ? 'bg-blue-600 text-white rounded-br-md'
                      : 'bg-white border border-gray-100 shadow-sm text-gray-800 rounded-bl-md'
                    }`}
                >
                  <div className="text-sm leading-relaxed">
                    {renderMessageContent(msg.content)}
                  </div>
                </div>
                {msg.sender === 'user' && (
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
                    <User className="w-4 h-4 text-white" />
                  </div>
                )}
              </div>
            ))}

            {isLoading && (
              <div className="flex gap-2 justify-start">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                  <Bot className="w-4 h-4 text-blue-600" />
                </div>
                <div className="bg-white border border-gray-100 shadow-sm px-4 py-3 rounded-2xl rounded-bl-md">
                  <div className="flex items-center gap-2 text-blue-600">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-sm">กำลังพิมพ์...</span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messageEndRef} />
          </div>
        </ScrollArea>
      </CardContent>

      {/* Quick Actions */}
      {showQuickActions && (
        <div className="px-4 py-2 border-t border-gray-100 bg-gray-50/50">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-3 h-3 text-amber-500" />
            <span className="text-xs text-gray-500 font-medium">คำถามยอดนิยม</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {QUICK_ACTIONS.map((action, index) => (
              <button
                key={index}
                onClick={() => handleQuickAction(action.prompt)}
                disabled={isLoading}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-medium transition-all ${action.color} disabled:opacity-50`}
              >
                {action.icon}
                {action.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <CardFooter className="p-3 bg-white border-t border-gray-100">
        <form onSubmit={handleSubmit} className="w-full flex gap-2">
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="พิมพ์คำถามของคุณ..."
            className="flex-1 border-gray-200 rounded-xl bg-gray-50 focus:bg-white transition-colors"
            disabled={isLoading}
          />
          <Button
            type="submit"
            size="icon"
            className="bg-blue-600 hover:bg-blue-700 rounded-xl w-10 h-10"
            disabled={isLoading || !message.trim()}
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </form>
      </CardFooter>
    </Card>
  );
};

export default AIChat;

