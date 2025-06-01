
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import EmergencyArticles from '@/components/emergency-manual/EmergencyArticles';

const EmergencyManual: React.FC = () => {
  const [activeTab, setActiveTab] = useState('guidelines');

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4 shadow-lg">
        <div className="container max-w-md mx-auto flex items-center">
          <Button 
            variant="ghost" 
            size="icon"
            className="text-white mr-3 hover:bg-blue-400/30 rounded-full"
            onClick={() => window.history.back()}
          >
            <ArrowLeft className="h-6 w-6" />
          </Button>
          <div className="flex items-center">
            <img 
              src="/lovable-uploads/b5550bd4-d83d-4e1e-ac09-025117b87c86.png" 
              alt="D-MIND Logo" 
              className="h-8 w-8 mr-3"
            />
            <h1 className="text-xl font-bold">คู่มือและบทความ</h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container max-w-md mx-auto p-4">
        <Tabs defaultValue="guidelines" className="w-full" onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-2 w-full mb-4 bg-white border border-blue-200">
            <TabsTrigger 
              value="guidelines" 
              className="data-[state=active]:bg-blue-500 data-[state=active]:text-white"
            >
              แนวทางปฏิบัติ
            </TabsTrigger>
            <TabsTrigger 
              value="articles"
              className="data-[state=active]:bg-blue-500 data-[state=active]:text-white"
            >
              บทความเตือนภัย
            </TabsTrigger>
          </TabsList>

          <TabsContent value="guidelines" className="space-y-4">
            <Card className="border-blue-200 shadow-md">
              <CardContent className="p-4">
                <h2 className="text-lg font-bold mb-2 text-blue-700">ความปลอดภัยจากน้ำท่วม</h2>
                <ul className="list-disc pl-5 space-y-2 text-gray-700">
                  <li>เคลื่อนย้ายไปยังพื้นที่สูงทันทีเมื่อเกิดน้ำท่วม</li>
                  <li>อย่าเดิน ว่ายน้ำ หรือขับรถผ่านน้ำท่วม</li>
                  <li>หลีกเลี่ยงสะพานที่มีน้ำไหลเชี่ยว</li>
                  <li>อพยพเมื่อได้รับคำสั่ง</li>
                  <li>กลับบ้านเมื่อเจ้าหน้าที่ยืนยันว่าปลอดภัยแล้วเท่านั้น</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-blue-200 shadow-md">
              <CardContent className="p-4">
                <h2 className="text-lg font-bold mb-2 text-blue-700">การรับมือแผ่นดินไหว</h2>
                <ul className="list-disc pl-5 space-y-2 text-gray-700">
                  <li>ลง ก้ม กอด ระหว่างที่เกิดการสั่นสะเทือน</li>
                  <li>หากอยู่ในอาคาร ห่างจากหน้าต่างและผนังด้านนอก</li>
                  <li>หากอยู่กลางแจ้ง เคลื่อนย้ายไปยังพื้นที่เปิดห่างจากอาคาร</li>
                  <li>หลังจากหยุดสั่น ตรวจสอบการบาดเจ็บและความเสียหาย</li>
                  <li>เตรียมพร้อมสำหรับอาฟเตอร์ช็อก</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-blue-200 shadow-md">
              <CardContent className="p-4">
                <h2 className="text-lg font-bold mb-2 text-blue-700">ความปลอดภัยจากไฟไหม้</h2>
                <ul className="list-disc pl-5 space-y-2 text-gray-700">
                  <li>อพยพทันทีเมื่อได้กลิ่นควันหรือเห็นไฟไหม้</li>
                  <li>ใช้หลังมือตรวจสอบความร้อนก่อนเปิดประตู</li>
                  <li>อยู่ในท่าต่ำเพื่อหลีกเลี่ยงการสูดควัน</li>
                  <li>เมื่อออกมาแล้ว โทรขอความช่วยเหลือและอย่ากลับเข้าไป</li>
                  <li>หากติดอยู่ ใช้ผ้าเปียกอุดช่องว่างประตูและหน้าต่าง</li>
                </ul>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="articles">
            <EmergencyArticles />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default EmergencyManual;
