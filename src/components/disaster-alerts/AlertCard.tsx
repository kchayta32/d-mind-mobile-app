
import React from 'react';
import { DisasterAlert } from './types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Calendar, MapPin, Flame } from 'lucide-react';
import { format } from 'date-fns';
import { th } from 'date-fns/locale';

interface AlertCardProps {
  alert: DisasterAlert;
}

// Type and severity icon/color mapping
const typeConfig: Record<string, { icon: React.ReactNode, color: string, label: string }> = {
  'storm': { 
    icon: <AlertTriangle className="h-5 w-5" />, 
    color: "bg-blue-100 text-blue-800", 
    label: "พายุ" 
  },
  'flood': { 
    icon: <AlertTriangle className="h-5 w-5" />, 
    color: "bg-cyan-100 text-cyan-800", 
    label: "น้ำท่วม" 
  },
  'strongwind': { 
    icon: <AlertTriangle className="h-5 w-5" />, 
    color: "bg-gray-100 text-gray-800", 
    label: "ลมแรง" 
  },
  'heavyrain': { 
    icon: <AlertTriangle className="h-5 w-5" />, 
    color: "bg-indigo-100 text-indigo-800", 
    label: "ฝนตกหนัก" 
  },
  'wildfire': { 
    icon: <Flame className="h-5 w-5" />, 
    color: "bg-red-100 text-red-800", 
    label: "ไฟป่า" 
  }
};

const severityColors: Record<string, string> = {
  'low': "bg-green-100 text-green-800",
  'medium': "bg-yellow-100 text-yellow-800",
  'high': "bg-orange-100 text-orange-800",
  'severe': "bg-red-100 text-red-800"
};

const severityLabels: Record<string, string> = {
  'low': "ต่ำ",
  'medium': "ปานกลาง",
  'high': "สูง",
  'severe': "รุนแรง"
};

const AlertCard: React.FC<AlertCardProps> = ({ alert }) => {
  const typeInfo = typeConfig[alert.type] || { 
    icon: <AlertTriangle className="h-5 w-5" />, 
    color: "bg-gray-100 text-gray-800",
    label: alert.type 
  };
  
  const severityColor = severityColors[alert.severity] || "bg-gray-100 text-gray-800";
  const severityLabel = severityLabels[alert.severity] || alert.severity;
  
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'PPP p', { locale: th });
    } catch (e) {
      return dateString;
    }
  };

  return (
    <Card className={`mb-4 border-l-4 ${alert.is_active ? 'border-l-red-500' : 'border-l-gray-300'}`}>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-2">
            <Badge className={typeInfo.color}>
              {typeInfo.icon}
              <span className="ml-1">{typeInfo.label}</span>
            </Badge>
            <Badge className={severityColor}>
              {severityLabel}
            </Badge>
          </div>
          {!alert.is_active && (
            <Badge variant="outline" className="text-gray-500">สิ้นสุด</Badge>
          )}
        </div>
        <CardTitle className="text-lg mt-2">{alert.location}</CardTitle>
        <CardDescription className="flex items-center gap-1">
          <Calendar className="h-3.5 w-3.5" />
          <span>{formatDate(alert.start_time)}</span>
          {alert.end_time && (
            <span> - {formatDate(alert.end_time)}</span>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {alert.description && (
          <p className="text-sm mb-2">{alert.description}</p>
        )}
        {alert.coordinates && (
          <div className="flex items-center text-xs text-muted-foreground">
            <MapPin className="h-3.5 w-3.5 mr-1" />
            <span>พิกัด: {alert.coordinates[0]}, {alert.coordinates[1]}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AlertCard;
