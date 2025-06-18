
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useSharedDisasterData } from '@/hooks/useSharedDisasterData';
import { Share2, MapPin, Calendar, Trash2, Globe, Lock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { th } from 'date-fns/locale';

const SharedDataList: React.FC = () => {
  const { sharedData, isLoading, deleteSharedData } = useSharedDisasterData();

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          {[1, 2, 3].map(i => (
            <div key={i} className="h-32 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  const getDisasterTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      earthquake: 'แผ่นดินไหว',
      flood: 'น้ำท่วม',
      wildfire: 'ไฟป่า',
      airpollution: 'มลพิษอากาศ',
      drought: 'ภัยแล้ง',
      storm: 'พายุ'
    };
    return labels[type] || type;
  };

  const getDisasterTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      earthquake: 'bg-yellow-100 text-yellow-800',
      flood: 'bg-blue-100 text-blue-800',
      wildfire: 'bg-red-100 text-red-800',
      airpollution: 'bg-gray-100 text-gray-800',
      drought: 'bg-orange-100 text-orange-800',
      storm: 'bg-purple-100 text-purple-800'
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center">
          <Share2 className="mr-2 h-6 w-6" />
          ข้อมูลภัยพิบัติที่แชร์
        </h1>
        <p className="text-gray-600">ดูข้อมูลภัยพิบัติที่ถูกแชร์โดยผู้ใช้อื่น</p>
      </div>

      {sharedData.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Share2 className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">ยังไม่มีข้อมูลที่แชร์</h3>
            <p className="text-gray-500 text-center">
              ยังไม่มีผู้ใช้แชร์ข้อมูลภัยพิบัติ<br />
              คุณสามารถเป็นคนแรกที่แชร์ข้อมูลได้
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {sharedData.map((data) => (
            <Card key={data.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Badge className={getDisasterTypeColor(data.disaster_type)}>
                        {getDisasterTypeLabel(data.disaster_type)}
                      </Badge>
                      {data.is_public ? (
                        <Badge variant="outline" className="flex items-center gap-1">
                          <Globe className="h-3 w-3" />
                          สาธารณะ
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="flex items-center gap-1">
                          <Lock className="h-3 w-3" />
                          ส่วนตัว
                        </Badge>
                      )}
                    </div>
                    <CardTitle className="text-lg">
                      ข้อมูล{getDisasterTypeLabel(data.disaster_type)}
                    </CardTitle>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => data.id && deleteSharedData(data.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    <span>
                      {data.location.address || 
                       `${data.location.lat.toFixed(4)}, ${data.location.lng.toFixed(4)}`}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span>
                      {data.created_at && formatDistanceToNow(new Date(data.created_at), {
                        addSuffix: true,
                        locale: th
                      })}
                    </span>
                  </div>
                </div>

                {data.data && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium mb-2">รายละเอียด:</h4>
                    <div className="text-sm text-gray-700">
                      {typeof data.data === 'string' ? (
                        <p>{data.data}</p>
                      ) : (
                        <pre className="whitespace-pre-wrap">
                          {JSON.stringify(data.data, null, 2)}
                        </pre>
                      )}
                    </div>
                  </div>
                )}

                {data.expires_at && (
                  <div className="text-sm text-orange-600">
                    ข้อมูลนี้จะหมดอายุเมื่อ: {new Date(data.expires_at).toLocaleDateString('th-TH')}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default SharedDataList;
