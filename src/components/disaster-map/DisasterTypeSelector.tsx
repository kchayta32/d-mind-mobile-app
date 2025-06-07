
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
  Wind,
  AlertTriangle,
  Sun
} from 'lucide-react';
import { DisasterType } from './DisasterMap';

interface DisasterTypeOption {
  id: DisasterType;
  name: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  description: string;
  status: 'active' | 'coming-soon';
}

interface DisasterTypeSelectorProps {
  selectedType: DisasterType;
  onTypeChange: (type: DisasterType) => void;
}

const disasterTypes: DisasterTypeOption[] = [
  {
    id: 'earthquake',
    name: 'แผ่นดินไหว',
    icon: <MapPin className="h-4 w-4" />,
    color: 'text-orange-700',
    bgColor: 'bg-orange-100 border-orange-300 hover:bg-orange-200',
    description: 'ข้อมูลการสั่นสะเทือนจาก USGS',
    status: 'active'
  },
  {
    id: 'heavyrain',
    name: 'ฝนตกหนัก',
    icon: <CloudRain className="h-4 w-4" />,
    color: 'text-blue-700',
    bgColor: 'bg-blue-100 border-blue-300 hover:bg-blue-200',
    description: 'เซ็นเซอร์ฝนและเรดาร์ฝน',
    status: 'active'
  },
  {
    id: 'wildfire',
    name: 'ไฟป่า',
    icon: <Flame className="h-4 w-4" />,
    color: 'text-red-700',
    bgColor: 'bg-red-100 border-red-300 hover:bg-red-200',
    description: 'จุดความร้อนจาก GISTDA',
    status: 'active'
  },
  {
    id: 'airpollution',
    name: 'มลพิษอากาศ',
    icon: <AlertTriangle className="h-4 w-4" />,
    color: 'text-purple-700',
    bgColor: 'bg-purple-100 border-purple-300 hover:bg-purple-200',
    description: 'คุณภาพอากาศและ PM2.5',
    status: 'active'
  },
  {
    id: 'drought',
    name: 'ภัยแล้ง',
    icon: <Sun className="h-4 w-4" />,
    color: 'text-yellow-700',
    bgColor: 'bg-yellow-100 border-yellow-300 hover:bg-yellow-200',
    description: 'ดัชนีความเสี่ยงภัยแล้ง',
    status: 'active'
  },
  {
    id: 'flood',
    name: 'น้ำท่วม',
    icon: <Waves className="h-4 w-4" />,
    color: 'text-cyan-700',
    bgColor: 'bg-cyan-100 border-cyan-300 hover:bg-cyan-200',
    description: 'พื้นที่เสี่ยงน้ำท่วม',
    status: 'active'
  },
  {
    id: 'storm',
    name: 'พายุ',
    icon: <Wind className="h-4 w-4" />,
    color: 'text-slate-700',
    bgColor: 'bg-slate-100 border-slate-300 hover:bg-slate-200',
    description: 'การติดตามพายุ',
    status: 'coming-soon'
  }
];

const DisasterTypeSelector: React.FC<DisasterTypeSelectorProps> = ({
  selectedType,
  onTypeChange
}) => {
  return (
    <div className="p-4">
      <div className="mb-3">
        <h3 className="text-base font-semibold text-gray-800 mb-1">เลือกประเภทภัยพิบัติ</h3>
        <p className="text-xs text-gray-600">สไลด์ซ้าย-ขวาเพื่อดูภัยพิบัติประเภทต่างๆ</p>
      </div>
      
      <Carousel className="w-full">
        <CarouselContent className="-ml-1">
          {disasterTypes.map((type) => (
            <CarouselItem key={type.id} className="pl-1 basis-1/2 sm:basis-1/3 md:basis-1/4 lg:basis-1/7">
              <Card 
                className={`cursor-pointer transition-all duration-300 hover:shadow-md relative h-24 ${
                  selectedType === type.id 
                    ? `ring-2 ring-blue-500 ${type.bgColor}` 
                    : `hover:shadow-md ${type.bgColor.replace('hover:', '')}`
                }`}
                onClick={() => type.status === 'active' && onTypeChange(type.id)}
              >
                <CardContent className="p-2 text-center h-full flex flex-col justify-center">
                  <div className="flex flex-col items-center space-y-1">
                    {/* Icon */}
                    <div className={`p-1.5 rounded-full ${type.bgColor} ${type.color}`}>
                      {type.icon}
                    </div>
                    
                    {/* Title */}
                    <div className="space-y-0.5">
                      <p className={`text-xs font-semibold ${type.color}`}>{type.name}</p>
                    </div>

                    {/* Status Badge */}
                    {type.status === 'coming-soon' && (
                      <Badge variant="secondary" className="text-xs bg-gray-200 text-gray-600 px-1 py-0">
                        Soon
                      </Badge>
                    )}

                    {/* Active Indicator */}
                    {selectedType === type.id && type.status === 'active' && (
                      <div className="absolute top-1 right-1">
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                      </div>
                    )}

                    {/* Disabled Overlay */}
                    {type.status === 'coming-soon' && (
                      <div className="absolute inset-0 bg-white bg-opacity-60 rounded-lg flex items-center justify-center">
                        <Badge variant="outline" className="bg-white text-xs">
                          เร็วๆ นี้
                        </Badge>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="hidden sm:flex -left-4" />
        <CarouselNext className="hidden sm:flex -right-4" />
      </Carousel>
    </div>
  );
};

export default DisasterTypeSelector;
