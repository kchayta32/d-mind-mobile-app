
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, Phone } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

const EmergencyContacts: React.FC = () => {
  const { toast } = useToast();
  
  const handleCallClick = (name: string) => {
    toast({
      title: `Calling ${name}`,
      description: "In a complete app, this would initiate a phone call.",
    });
  };
  
  return (
    <div className="container max-w-md mx-auto p-4">
      <div className="flex items-center mb-6">
        <Button variant="ghost" onClick={() => window.history.back()} className="mr-2 p-2">
          <ArrowLeft size={20} />
        </Button>
        <h1 className="text-xl font-bold">Emergency Contacts</h1>
      </div>

      <div className="space-y-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="font-medium">Emergency Services</h2>
                <p className="text-sm text-muted-foreground">Fire, Police, Medical</p>
              </div>
              <Button 
                className="bg-guardian-purple hover:bg-guardian-purple/90 rounded-full h-10 w-10 p-0"
                onClick={() => handleCallClick("Emergency Services")}
              >
                <Phone size={18} />
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="font-medium">Local Hospital</h2>
                <p className="text-sm text-muted-foreground">Medical Center</p>
              </div>
              <Button 
                className="bg-guardian-purple hover:bg-guardian-purple/90 rounded-full h-10 w-10 p-0"
                onClick={() => handleCallClick("Local Hospital")}
              >
                <Phone size={18} />
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="font-medium">Disaster Response Team</h2>
                <p className="text-sm text-muted-foreground">Emergency Management</p>
              </div>
              <Button 
                className="bg-guardian-purple hover:bg-guardian-purple/90 rounded-full h-10 w-10 p-0"
                onClick={() => handleCallClick("Disaster Response Team")}
              >
                <Phone size={18} />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EmergencyContacts;
