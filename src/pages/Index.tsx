
import React from 'react';
import { useNavigate } from 'react-router-dom';
import DisasterAlert from '@/components/DisasterAlert';
import NavBar from '@/components/NavBar';
import DisasterResources from '@/components/DisasterResources';
import AIChat from '@/components/AIChat';
import DisasterMap from '@/components/DisasterMap';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { MessageSquare } from 'lucide-react';

const Index = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleAssistantClick = () => {
    navigate('/assistant');
  };

  const handleManualClick = () => {
    navigate('/manual');
  };

  const handleContactsClick = () => {
    navigate('/contacts');
  };

  const handleAlertsClick = () => {
    navigate('/alerts');
  };
  
  const handleVictimReportsClick = () => {
    navigate('/victim-reports');
  };

  return (
    <div className="min-h-screen bg-guardian-light-bg">
      {/* Header */}
      <header className="bg-guardian-purple text-white p-4">
        <h1 className="text-xl font-bold">AI Emergency Guardian</h1>
      </header>

      {/* Main Content */}
      <main className="container max-w-md mx-auto p-4">
        <DisasterAlert isActive={true} />
        
        <NavBar 
          onAssistantClick={handleAssistantClick}
          onManualClick={handleManualClick}
          onContactsClick={handleContactsClick}
          onAlertsClick={handleAlertsClick}
        />
        
        {/* Victim Reports Button */}
        <div className="my-4">
          <Button 
            className="w-full bg-red-600 hover:bg-red-700 text-white"
            onClick={handleVictimReportsClick}
          >
            <MessageSquare className="mr-2 h-4 w-4" />
            รายงานสถานะผู้ประสบภัย
          </Button>
        </div>
        
        <DisasterMap />
        
        <DisasterResources />
        
        <div id="ai-chat">
          <AIChat />
        </div>
      </main>
    </div>
  );
};

export default Index;
