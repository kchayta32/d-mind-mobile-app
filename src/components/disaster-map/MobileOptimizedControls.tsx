
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  ChevronUp, 
  ChevronDown, 
  Settings, 
  BarChart3, 
  Filter,
  MapPin 
} from 'lucide-react';
import { DisasterType } from './DisasterMap';

interface MobileOptimizedControlsProps {
  selectedType: DisasterType;
  children: React.ReactNode;
  className?: string;
}

export const MobileOptimizedControls: React.FC<MobileOptimizedControlsProps> = ({
  selectedType,
  children,
  className = ""
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<'filters' | 'stats'>('filters');

  const getDisasterIcon = (type: DisasterType) => {
    const icons = {
      earthquake: '🌍',
      heavyrain: '🌧️',  
      openmeteorain: '☔',
      wildfire: '🔥',
      airpollution: '💨',
      drought: '🌵',
      flood: '🌊',
      storm: '⛈️'
    };
    return icons[type] || '📍';
  };

  const getDisasterName = (type: DisasterType) => {
    const names = {
      earthquake: 'แผ่นดินไหว',
      heavyrain: 'ฝนตกหนัก',  
      openmeteorain: 'ข้อมูลฝน OpenMeteo',
      wildfire: 'ไฟป่า',
      airpollution: 'มลพิษอากาศ',
      drought: 'ภัยแล้ง',
      flood: 'น้ำท่วม',
      storm: 'พายุ'
    };
    return names[type] || 'ไม่ทราบ';
  };

  return (
    <div className={`fixed bottom-0 left-0 right-0 z-[1001] md:relative md:bottom-auto md:left-auto md:right-auto ${className}`}>
      {/* Mobile Bottom Panel */}
      <div className="md:hidden">
        <Card className="rounded-t-2xl rounded-b-none border-t border-x-0 border-b-0 shadow-2xl bg-white/95 backdrop-blur">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-100">
            <div className="flex items-center space-x-3">
              <span className="text-2xl">{getDisasterIcon(selectedType)}</span>
              <div>
                <h3 className="font-semibold text-gray-900 text-sm">
                  {getDisasterName(selectedType)}
                </h3>
                <p className="text-xs text-gray-500">
                  {isExpanded ? 'แตะเพื่อปิด' : 'แตะเพื่อเปิด'}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              {/* Tab Buttons */}
              {isExpanded && (
                <div className="flex bg-gray-100 rounded-lg p-1">
                  <button
                    onClick={() => setActiveTab('filters')}
                    className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                      activeTab === 'filters' 
                        ? 'bg-white text-blue-600 shadow-sm' 
                        : 'text-gray-600'
                    }`}
                  >
                    <Filter className="h-3 w-3 mr-1 inline" />
                    ตัวกรอง
                  </button>
                  <button
                    onClick={() => setActiveTab('stats')}
                    className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                      activeTab === 'stats' 
                        ? 'bg-white text-blue-600 shadow-sm' 
                        : 'text-gray-600'
                    }`}
                  >
                    <BarChart3 className="h-3 w-3 mr-1 inline" />
                    สถิติ
                  </button>
                </div>
              )}
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsExpanded(!isExpanded)}
                className="h-8 w-8 p-0"
              >
                {isExpanded ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronUp className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          {/* Content */}
          {isExpanded && (
            <CardContent className="p-4 max-h-[60vh] overflow-y-auto">
              <div className="space-y-4">
                {children}
              </div>
            </CardContent>
          )}
          
          {/* Drag Handle */}
          <div className="flex justify-center py-2">
            <div className="w-8 h-1 bg-gray-300 rounded-full"></div>
          </div>
        </Card>
      </div>

      {/* Desktop Layout */}
      <div className="hidden md:block">
        {children}
      </div>
    </div>
  );
};
