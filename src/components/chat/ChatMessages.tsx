
import React, { useRef, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { ChatMessage } from '@/types/chat';
import { sanitizeAndParseMarkdown } from '@/utils/markdownUtils';

interface ChatMessagesProps {
  messages: ChatMessage[];
  isLoading: boolean;
}

const ChatMessages: React.FC<ChatMessagesProps> = ({ messages, isLoading }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
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
            <div 
              className="text-sm whitespace-pre-wrap leading-relaxed"
              dangerouslySetInnerHTML={{
                __html: sanitizeAndParseMarkdown(msg.content)
              }}
            />
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
  );
};

export default ChatMessages;
