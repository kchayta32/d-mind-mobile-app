
import React, { useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';

const AIChat: React.FC = () => {
  const [message, setMessage] = useState('');
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      toast({
        title: "Message sent",
        description: `Your question: "${message}" has been sent to the AI assistant.`,
      });
      setMessage('');
    }
  };

  return (
    <Card className="w-full shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium">AI Emergency Chat</CardTitle>
      </CardHeader>
      <CardContent className="pb-2">
        <div className="h-24 mb-4 bg-muted/30 rounded-md flex items-center justify-center text-muted-foreground text-sm">
          Chat messages would appear here
        </div>
      </CardContent>
      <CardFooter>
        <form onSubmit={handleSubmit} className="w-full flex gap-2">
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Ask for emergency assistance..."
            className="flex-1"
          />
          <Button type="submit" className="bg-guardian-purple hover:bg-guardian-purple/90">
            Send
          </Button>
        </form>
      </CardFooter>
    </Card>
  );
};

export default AIChat;
