
import React from 'react';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { User, Bot } from 'lucide-react';
import { sanitizeHtml } from '@/utils/security';

interface Message {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
}

interface SecureChatMessagesProps {
  messages: Message[];
}

const SecureChatMessages: React.FC<SecureChatMessagesProps> = ({ messages }) => {
  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {messages.length === 0 ? (
        <div className="text-center text-gray-500 mt-8">
          <Bot className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <p>เริ่มการสนทนากับผู้ช่วย AI</p>
          <p className="text-sm mt-2">สามารถถามเกี่ยวกับการรับมือภัยพิบัติได้</p>
        </div>
      ) : (
        messages.map((message) => (
          <div
            key={message.id}
            className={`flex gap-3 ${message.isUser ? 'flex-row-reverse' : 'flex-row'}`}
          >
            <Avatar className="h-8 w-8">
              <AvatarFallback>
                {message.isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
              </AvatarFallback>
            </Avatar>
            
            <Card 
              className={`max-w-[80%] p-3 ${
                message.isUser 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-white border-gray-200'
              }`}
            >
              <div 
                className="whitespace-pre-wrap text-sm"
                dangerouslySetInnerHTML={{ 
                  __html: sanitizeHtml(message.content) 
                }}
              />
              <div className={`text-xs mt-1 ${
                message.isUser ? 'text-blue-100' : 'text-gray-500'
              }`}>
                {message.timestamp.toLocaleTimeString('th-TH', {
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </div>
            </Card>
          </div>
        ))
      )}
    </div>
  );
};

export default SecureChatMessages;
