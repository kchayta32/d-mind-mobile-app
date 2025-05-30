
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, Loader2 } from 'lucide-react';
import { sanitizeText, ClientRateLimit } from '@/utils/security';

interface SecureChatInputProps {
  onSendMessage: (message: string) => Promise<void>;
  isLoading: boolean;
  disabled?: boolean;
}

const chatRateLimit = new ClientRateLimit();

const SecureChatInput: React.FC<SecureChatInputProps> = ({
  onSendMessage,
  isLoading,
  disabled = false
}) => {
  const [message, setMessage] = useState('');
  const [isRateLimited, setIsRateLimited] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!message.trim() || isLoading || disabled) return;

    // Check rate limiting (10 messages per minute)
    if (!chatRateLimit.isAllowed('chat', 10, 60000)) {
      setIsRateLimited(true);
      setTimeout(() => setIsRateLimited(false), 5000);
      return;
    }

    // Sanitize and validate message
    const sanitizedMessage = sanitizeText(message, 500);
    if (!sanitizedMessage) return;

    try {
      await onSendMessage(sanitizedMessage);
      setMessage('');
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 p-4 border-t">
      <Textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyPress={handleKeyPress}
        placeholder={
          isRateLimited 
            ? "กรุณารอสักครู่ก่อนส่งข้อความใหม่..."
            : "พิมพ์ข้อความของคุณ..."
        }
        disabled={isLoading || disabled || isRateLimited}
        maxLength={500}
        rows={2}
        className="flex-1 resize-none"
      />
      <Button 
        type="submit" 
        disabled={!message.trim() || isLoading || disabled || isRateLimited}
        size="sm"
        className="self-end"
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Send className="h-4 w-4" />
        )}
      </Button>
    </form>
  );
};

export default SecureChatInput;
