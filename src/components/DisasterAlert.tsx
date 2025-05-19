
import React from 'react';
import { Bell } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface DisasterAlertProps {
  isActive: boolean;
  message?: string;
}

const DisasterAlert: React.FC<DisasterAlertProps> = ({ 
  isActive, 
  message = "No active alerts in your area" 
}) => {
  return (
    <Card className="w-full bg-guardian-dark-purple text-white shadow-md mb-4">
      <CardHeader className="flex flex-row items-center justify-between p-4 pb-2">
        <CardTitle className="text-lg font-medium">Disaster Alert</CardTitle>
        <Bell size={20} />
      </CardHeader>
      <CardContent className="p-4 pt-2">
        <p className={`${isActive ? "text-red-400 font-bold" : "text-gray-200"}`}>
          {message}
        </p>
      </CardContent>
    </Card>
  );
};

export default DisasterAlert;
