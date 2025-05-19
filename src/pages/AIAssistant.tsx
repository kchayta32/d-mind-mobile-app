
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';

type Message = {
  id: string;
  content: string;
  sender: 'user' | 'assistant';
};

const AIAssistant = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: "I'm your personal AI assistant. I can help you with information, answer questions, generate content, and more. What would you like to know?",
      sender: 'assistant'
    }
  ]);

  const handleGoBack = () => {
    navigate('/');
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (message.trim()) {
      // Add user message
      const userMessage: Message = {
        id: Date.now().toString(),
        content: message,
        sender: 'user'
      };
      
      setMessages(prev => [...prev, userMessage]);
      setMessage('');
      
      // Simulate AI response after a short delay
      setTimeout(() => {
        const aiMessage: Message = {
          id: (Date.now() + 1).toString(),
          content: `Here's a response to "${message}"`,
          sender: 'assistant'
        };
        
        setMessages(prev => [...prev, aiMessage]);
        
        toast({
          title: "New message",
          description: "AI Assistant has responded to your message",
        });
      }, 1000);
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
          <h1 className="text-xl font-bold">AI Assistant</h1>
          <p className="text-sm opacity-80">How can I help you today?</p>
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
              {msg.sender === 'assistant' && <div className="font-semibold mb-1">AI Assistant</div>}
              {msg.sender === 'user' && <div className="font-semibold mb-1 text-right">You</div>}
              <p className="text-sm">{msg.content}</p>
            </div>
            
            {msg.sender === 'user' && (
              <div className="bg-gray-400 text-white rounded-full w-8 h-8 flex items-center justify-center ml-2">
                <span className="text-lg">U</span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Input Area */}
      <div className="p-4 border-t">
        <form onSubmit={handleSendMessage} className="flex gap-2">
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type your message..."
            className="flex-1"
          />
          <Button type="submit" className="bg-guardian-purple hover:bg-guardian-purple/90 rounded-full w-10 h-10 p-0 flex items-center justify-center">
            <Send size={18} />
          </Button>
        </form>
      </div>
    </div>
  );
};

export default AIAssistant;
