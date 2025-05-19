
import React from 'react';
import { useNavigate } from 'react-router-dom';
import DisasterAlert from '@/components/DisasterAlert';
import NavBar from '@/components/NavBar';
import DisasterResources from '@/components/DisasterResources';
import AIChat from '@/components/AIChat';
import DisasterMap from '@/components/DisasterMap';
import { useToast } from '@/components/ui/use-toast';

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

  return (
    <div className="min-h-screen bg-guardian-light-bg">
      {/* Header */}
      <header className="bg-guardian-purple text-white p-4">
        <h1 className="text-xl font-bold">AI Emergency Guardian</h1>
      </header>

      {/* Main Content */}
      <main className="container max-w-md mx-auto p-4">
        <DisasterAlert isActive={false} />
        
        <NavBar 
          onAssistantClick={handleAssistantClick}
          onManualClick={handleManualClick}
          onContactsClick={handleContactsClick}
        />
        
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
