
import React from 'react';
import { AlertsFilterState } from './types';
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Filter } from 'lucide-react';

interface AlertFiltersProps {
  filters: AlertsFilterState;
  updateFilters: (filters: Partial<AlertsFilterState>) => void;
  availableTypes: string[];
  availableSeverities: string[];
}

const typeTranslations: Record<string, string> = {
  'storm': 'พายุ',
  'flood': 'น้ำท่วม',
  'strongwind': 'ลมแรง',
  'heavyrain': 'ฝนตกหนัก',
  'wildfire': 'ไฟป่า'
};

const severityTranslations: Record<string, string> = {
  'low': 'ต่ำ',
  'medium': 'ปานกลาง',
  'high': 'สูง',
  'severe': 'รุนแรง'
};

const AlertFilters: React.FC<AlertFiltersProps> = ({
  filters,
  updateFilters,
  availableTypes,
  availableSeverities
}) => {
  const handleTypeChange = (type: string) => {
    const newTypes = filters.types.includes(type)
      ? filters.types.filter(t => t !== type)
      : [...filters.types, type];
    
    updateFilters({ types: newTypes });
  };

  const handleSeverityChange = (severity: string) => {
    const newSeverity = filters.severity.includes(severity)
      ? filters.severity.filter(s => s !== severity)
      : [...filters.severity, severity];
    
    updateFilters({ severity: newSeverity });
  };

  const handleActiveChange = (checked: boolean) => {
    updateFilters({ activeOnly: checked });
  };

  const getTypeLabel = (type: string) => {
    return typeTranslations[type] || type;
  };

  const getSeverityLabel = (severity: string) => {
    return severityTranslations[severity] || severity;
  };

  return (
    <Card className="mb-4">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <Filter className="h-5 w-5" />
          ตัวกรองการแจ้งเตือน
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-medium mb-2">ประเภทภัยพิบัติ:</h3>
            <div className="flex flex-wrap gap-2">
              {availableTypes.map(type => (
                <Badge 
                  key={type}
                  variant={filters.types.includes(type) ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => handleTypeChange(type)}
                >
                  {getTypeLabel(type)}
                </Badge>
              ))}
            </div>
          </div>
          
          <div>
            <h3 className="text-sm font-medium mb-2">ระดับความรุนแรง:</h3>
            <div className="flex flex-wrap gap-2">
              {availableSeverities.map(severity => (
                <Badge 
                  key={severity}
                  variant={filters.severity.includes(severity) ? "default" : "outline"} 
                  className="cursor-pointer"
                  onClick={() => handleSeverityChange(severity)}
                >
                  {getSeverityLabel(severity)}
                </Badge>
              ))}
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="active-only" 
              checked={filters.activeOnly}
              onCheckedChange={handleActiveChange}
            />
            <Label htmlFor="active-only">แสดงเฉพาะการแจ้งเตือนที่ยังใช้งานอยู่</Label>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AlertFilters;
