
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Carousel, 
  CarouselContent, 
  CarouselItem, 
  CarouselNext, 
  CarouselPrevious 
} from '@/components/ui/carousel';
import { Badge } from '@/components/ui/badge';
import { 
  MapPin, 
  CloudRain, 
  Waves, 
  Flame, 
  Wind
} from 'lucide-react';
import { DisasterType } from './DisasterMap';

interface DisasterTypeOption {
  id: DisasterType;
  name: string;
  icon: React.ReactNode;
  color: string;
  description: string;
}

interface DisasterTypeSelectorProps {
  selectedType: DisasterType;
  onTypeChange: (type: DisasterType) => void;
}

const disasterTypes: DisasterTypeOption[] = [
  {
    id: 'earthquake',
    name: 'แผ่นดินไหว',
    icon: <MapPin className="h-5 w-5" />,
    color: 'bg-orange-100 text-orange-800 border-orange-200',
    description: 'ข้อมูลการสั่นสะเทือนจาก USGS'
  },
  {
    id: 'heavyrain',
    name: 'ฝนตกหนัก',
    icon: <CloudRain className="h-5 w-5" />,
    color: 'bg-blue-100 text-blue-800 border-blue-200',
    description: 'การเตือนฝนตกหนัก'
  },
  {
    id: 'flood',
    name: 'น้ำท่วม',
    icon: <Waves className="h-5 w-5" />,
    color: 'bg-cyan-100 text-cyan-800 border-cyan-200',
    description: 'พื้นที่เสี่ยงน้ำท่วม'
  },
  {
    id: 'wildfire',
    name: 'ไฟป่า',
    icon: <Flame className="h-5 w-5" />,
    color: 'bg-red-100 text-red-800 border-red-200',
    description: 'Coming Soon'
  },
  {
    id: 'storm',
    name: 'พายุ',
    icon: <Wind className="h-5 w-5" />,
    color: 'bg-gray-100 text-gray-800 border-gray-200',
    description: 'Coming Soon'
  }
];

const DisasterTypeSelector: React.FC<DisasterTypeSelectorProps> = ({
  selectedType,
  onTypeChange
}) => {
  return (
    <div className="px-4 py-3 border-b bg-gray-50">
      <h3 className="text-sm font-medium mb-3 text-gray-700">เลือกประเภทภัยพิบัติ</h3>
      <Carousel className="w-full max-w-xs mx-auto">
        <CarouselContent>
          {disasterTypes.map((type) => (
            <CarouselItem key={type.id} className="basis-1/2">
              <Card 
                className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                  selectedType === type.id 
                    ? 'ring-2 ring-blue-500 bg-blue-50' 
                    : 'hover:bg-gray-50'
                }`}
                onClick={() => onTypeChange(type.id)}
              >
                <CardContent className="p-3 text-center">
                  <div className="flex flex-col items-center space-y-2">
                    <Badge className={type.color}>
                      {type.icon}
                    </Badge>
                    <div>
                      <p className="text-xs font-medium">{type.name}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {type.description}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
    </div>
  );
};

export default DisasterTypeSelector;
