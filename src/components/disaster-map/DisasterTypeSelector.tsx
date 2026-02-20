
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import {
  Activity,
  CloudRain,
  Flame,
  Wind,
  Sun,
  Waves,
  MapPin,
  CloudDrizzle,
  Mountain
} from 'lucide-react';
import { DisasterType } from './types';

interface DisasterTypeSelectorProps {
  selectedType: DisasterType;
  onTypeChange: (type: DisasterType) => void;
}

const disasterTypes: Array<{
  type: DisasterType;
  label: string;
  icon: React.ReactNode;
  color: string;
  available: boolean;
}> = [
    {
      type: 'earthquake',
      label: 'แผ่นดินไหว',
      icon: <Activity className="w-4 h-4" />,
      color: 'bg-orange-500 hover:bg-orange-600',
      available: true
    },
    {
      type: 'heavyrain',
      label: 'ฝนตกหนัก',
      icon: <CloudRain className="w-4 h-4" />,
      color: 'bg-blue-500 hover:bg-blue-600',
      available: false
    },

    {
      type: 'wildfire',
      label: 'ไฟป่า',
      icon: <Flame className="w-4 h-4" />,
      color: 'bg-red-500 hover:bg-red-600',
      available: true
    },
    {
      type: 'airpollution',
      label: 'มลพิษอากาศ',
      icon: <Wind className="w-4 h-4" />,
      color: 'bg-gray-500 hover:bg-gray-600',
      available: true
    },
    {
      type: 'drought',
      label: 'ภัยแล้ง',
      icon: <Sun className="w-4 h-4" />,
      color: 'bg-yellow-500 hover:bg-yellow-600',
      available: true
    },
    {
      type: 'flood',
      label: 'น้ำท่วม',
      icon: <Waves className="w-4 h-4" />,
      color: 'bg-cyan-500 hover:bg-cyan-600',
      available: true
    },
    {
      type: 'storm',
      label: 'พายุ',
      icon: <MapPin className="w-4 h-4" />,
      color: 'bg-purple-500 hover:bg-purple-600',
      available: false
    },
    {
      type: 'sinkhole',
      label: 'แผ่นดินยุบ/ดินทรุด',
      icon: <Mountain className="w-4 h-4" />,
      color: 'bg-amber-600 hover:bg-amber-700',
      available: true
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

      <Carousel
        opts={{
          align: "start",
          slidesToScroll: 1,
        }}
        className="w-full"
      >
        <CarouselContent className="-ml-2 md:-ml-4">
          {disasterTypes.map(({ type, label, icon, color, available }) => (
            <CarouselItem key={type} className="pl-2 md:pl-4 basis-auto">
              <div className="relative">
                <Button
                  onClick={() => available && onTypeChange(type)}
                  variant={selectedType === type ? 'default' : 'outline'}
                  disabled={!available}
                  className={`
                    flex flex-col items-center justify-center h-20 w-24 text-xs font-medium
                    ${selectedType === type && available ? `${color} text-white` : 'hover:bg-gray-50'}
                    ${!available ? 'opacity-50 cursor-not-allowed' : ''}
                  `}
                >
                  <div className="mb-1">
                    {icon}
                  </div>
                  <span className="text-center leading-tight">{label}</span>
                </Button>

                {!available && (
                  <Badge
                    variant="secondary"
                    className="absolute -top-2 -right-2 text-xs bg-yellow-100 text-yellow-800 border-yellow-300"
                  >
                    เร็วๆนี้
                  </Badge>
                )}
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="left-2" />
        <CarouselNext className="right-2" />
      </Carousel>
    </div>
  );
};

export default DisasterTypeSelector;
