
import React, { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Carousel, 
  CarouselContent, 
  CarouselItem, 
  CarouselNext, 
  CarouselPrevious 
} from '@/components/ui/carousel';
import { Badge } from '@/components/ui/badge';
import DisasterMap from '@/components/DisasterMap';
import { 
  MapPin, 
  CloudRain, 
  Waves, 
  Flame, 
  Wind
} from 'lucide-react';

type DisasterType = 'earthquake' | 'heavyrain' | 'flood' | 'wildfire' | 'storm';

interface DisasterTypeOption {
  id: DisasterType;
  name: string;
  icon: React.ReactNode;
  color: string;
  description: string;
  comingSoon?: boolean;
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
    description: 'Coming Soon',
    comingSoon: true
  },
  {
    id: 'wildfire',
    name: 'ไฟป่า',
    icon: <Flame className="h-5 w-5" />,
    color: 'bg-red-100 text-red-800 border-red-200',
    description: 'Coming Soon',
    comingSoon: true
  },
  {
    id: 'storm',
    name: 'พายุ',
    icon: <Wind className="h-5 w-5" />,
    color: 'bg-gray-100 text-gray-800 border-gray-200',
    description: 'Coming Soon',
    comingSoon: true
  }
];

const DisasterMaps = () => {
  const navigate = useNavigate();
  const [selectedType, setSelectedType] = useState<DisasterType>('earthquake');

  const handleBackClick = () => {
    navigate('/');
  };

  const handleTypeChange = (type: DisasterType) => {
    const selectedOption = disasterTypes.find(t => t.id === type);
    if (selectedOption?.comingSoon) {
      return; // Don't change if it's coming soon
    }
    setSelectedType(type);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-md shadow-lg border-b border-white/30 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleBackClick}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              กลับ
            </Button>
            <div className="flex items-center">
              <div className="h-1 w-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full mr-3"></div>
              <h1 className="text-2xl font-semibold text-gray-800">แผนที่ภัยพิบัติ</h1>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <div className="h-2 w-2 bg-emerald-500 rounded-full animate-pulse"></div>
            <span className="text-sm text-gray-600 font-medium">ออนไลน์</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-6">
        {/* Disaster Type Selector */}
        <div className="mb-6">
          <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-xl border border-white/30 p-6">
            <h2 className="text-lg font-semibold mb-4 text-gray-800">เลือกประเภทภัยพิบัติ</h2>
            <Carousel className="w-full max-w-4xl mx-auto">
              <CarouselContent>
                {disasterTypes.map((type) => (
                  <CarouselItem key={type.id} className="basis-1/2 md:basis-1/3 lg:basis-1/5">
                    <Card 
                      className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                        selectedType === type.id 
                          ? 'ring-2 ring-blue-500 bg-blue-50' 
                          : 'hover:bg-gray-50'
                      } ${
                        type.comingSoon ? 'opacity-60 cursor-not-allowed' : ''
                      }`}
                      onClick={() => handleTypeChange(type.id)}
                    >
                      <CardContent className="p-4 text-center">
                        <div className="flex flex-col items-center space-y-3">
                          <Badge className={type.color}>
                            {type.icon}
                          </Badge>
                          <div>
                            <p className="text-sm font-medium">{type.name}</p>
                            <p className="text-xs text-gray-500 mt-1">
                              {type.description}
                            </p>
                            {type.comingSoon && (
                              <Badge variant="secondary" className="mt-2 text-xs">
                                🚧 เร็วๆ นี้
                              </Badge>
                            )}
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
        </div>

        {/* Map Container */}
        <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-xl border border-white/30 overflow-hidden">
          <div className="h-[calc(100vh-280px)] min-h-[600px]">
            {/* Show coming soon overlay for disabled maps */}
            {disasterTypes.find(t => t.id === selectedType)?.comingSoon ? (
              <div className="h-full flex items-center justify-center bg-gray-50">
                <div className="text-center p-8">
                  <div className="text-6xl mb-4">🚧</div>
                  <h3 className="text-2xl font-bold text-gray-700 mb-2">เร็วๆ นี้</h3>
                  <p className="text-gray-500">
                    แผนที่{disasterTypes.find(t => t.id === selectedType)?.name}
                    จะเปิดให้บริการเร็วๆ นี้
                  </p>
                </div>
              </div>
            ) : (
              <DisasterMap />
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default DisasterMaps;
