
import React from 'react';
import { Button } from '@/components/ui/button';
import { 
  Activity, 
  CloudRain, 
  Flame, 
  Wind, 
  Sun,
  Waves,
  MapPin,
  CloudDrizzle
} from 'lucide-react';
import { DisasterType } from './DisasterMap';

interface DisasterTypeSelectorProps {
  selectedType: DisasterType;
  onTypeChange: (type: DisasterType) => void;
}

const disasterTypes: Array<{
  type: DisasterType;
  label: string;
  icon: React.ReactNode;
  color: string;
}> = [
  {
    type: 'earthquake',
    label: 'แผ่นดินไหว',
    icon: <Activity className="w-4 h-4" />,
    color: 'bg-orange-500 hover:bg-orange-600'
  },
  {
    type: 'heavyrain',
    label: 'ฝนตกหนัก',
    icon: <CloudRain className="w-4 h-4" />,
    color: 'bg-blue-500 hover:bg-blue-600'
  },
  {
    type: 'openmeteorain',
    label: 'ข้อมูลฝน Open-Meteo',
    icon: <CloudDrizzle className="w-4 h-4" />,
    color: 'bg-indigo-500 hover:bg-indigo-600'
  },
  {
    type: 'wildfire',
    label: 'ไฟป่า',
    icon: <Flame className="w-4 h-4" />,
    color: 'bg-red-500 hover:bg-red-600'
  },
  {
    type: 'airpollution',
    label: 'มลพิษอากาศ',
    icon: <Wind className="w-4 h-4" />,
    color: 'bg-gray-500 hover:bg-gray-600'
  },
  {
    type: 'drought',
    label: 'ภัยแล้ง',
    icon: <Sun className="w-4 h-4" />,
    color: 'bg-yellow-500 hover:bg-yellow-600'
  },
  {
    type: 'flood',
    label: 'น้ำท่วม',
    icon: <Waves className="w-4 h-4" />,
    color: 'bg-cyan-500 hover:bg-cyan-600'
  },
  {
    type: 'storm',
    label: 'พายุ',
    icon: <MapPin className="w-4 h-4" />,
    color: 'bg-purple-500 hover:bg-purple-600'
  }
];

const DisasterTypeSelector: React.FC<DisasterTypeSelectorProps> = ({
  selectedType,
  onTypeChange
}) => {
  return (
    <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-4">
      <h2 className="text-lg font-semibold mb-3 text-gray-800">
        เลือกประเภทภัยพิบัติ
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-2">
        {disasterTypes.map(({ type, label, icon, color }) => (
          <Button
            key={type}
            onClick={() => onTypeChange(type)}
            variant={selectedType === type ? 'default' : 'outline'}
            className={`
              flex flex-col items-center justify-center h-20 text-xs font-medium
              ${selectedType === type ? `${color} text-white` : 'hover:bg-gray-50'}
            `}
          >
            <div className="mb-1">
              {icon}
            </div>
            <span className="text-center leading-tight">{label}</span>
          </Button>
        ))}
      </div>
    </div>
  );
};

export default DisasterTypeSelector;
