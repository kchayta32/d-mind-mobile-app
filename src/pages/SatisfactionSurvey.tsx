
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Star, BarChart3, Monitor, Users } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import AppLogo from '@/components/AppLogo';
import SurveyForm from '@/components/survey/SurveyForm';
import SurveyResults from '@/components/survey/SurveyResults';
import DemoAppSurveyForm from '@/components/survey/DemoAppSurveyForm';
import BoothSurveyForm from '@/components/survey/BoothSurveyForm';

type SurveyType = 'demo-app' | 'booth' | null;

const SatisfactionSurvey: React.FC = () => {
  const { toast } = useToast();
  const [selectedSurveyType, setSelectedSurveyType] = useState<SurveyType>(null);

  const handleSubmitSurvey = (surveyData: any) => {
    console.log('Survey submitted:', surveyData);
    toast({
      title: "ขอบคุณสำหรับการประเมิน! 🙏",
      description: "ความคิดเห็นของคุณจะช่วยให้เราปรับปรุงแอพให้ดีขึ้น",
      duration: 5000,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4 shadow-lg">
        <div className="container max-w-4xl mx-auto flex items-center">
          <Button 
            variant="ghost" 
            size="icon"
            className="text-white mr-3 hover:bg-blue-400/30 rounded-full"
            onClick={() => window.history.back()}
          >
            <ArrowLeft className="h-6 w-6" />
          </Button>
          <div className="flex items-center">
            <AppLogo size="md" className="mr-4" />
            <div>
              <h1 className="text-xl font-bold">แบบประเมินความพึงพอใจ</h1>
              <p className="text-sm opacity-90">D-MIND Demo Application</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container max-w-4xl mx-auto p-4">
        {!selectedSurveyType ? (
          /* Survey Type Selection */
          <div className="space-y-6">
            <Card className="border-blue-200 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100 text-center">
                <CardTitle className="text-blue-700">
                  เลือกประเภทแบบประเมิน
                </CardTitle>
                <p className="text-sm text-gray-600 mt-2">
                  กรุณาเลือกแบบประเมินที่ต้องการกรอก
                </p>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid gap-4 md:grid-cols-2">
                  {/* Demo App Survey Card */}
                  <Card 
                    className="border-2 border-blue-200 hover:border-blue-400 hover:shadow-lg transition-all cursor-pointer"
                    onClick={() => setSelectedSurveyType('demo-app')}
                  >
                    <CardContent className="p-6 text-center space-y-4">
                      <div className="flex justify-center">
                        <div className="p-4 bg-blue-100 rounded-full">
                          <Monitor className="h-12 w-12 text-blue-600" />
                        </div>
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg mb-2">
                          ความพึงพอใจในการใช้งาน Demo แอพ <br> D-MIND
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          ประเมินประสบการณ์การใช้งานเว็บแอปพลิเคชัน D-MIND
                        </p>
                      </div>
                      <Button className="w-full" variant="default">
                        เลือกแบบฟอร์มนี้
                      </Button>
                    </CardContent>
                  </Card>

                  {/* Booth Survey Card */}
                  <Card 
                    className="border-2 border-green-200 hover:border-green-400 hover:shadow-lg transition-all cursor-pointer"
                    onClick={() => setSelectedSurveyType('booth')}
                  >
                    <CardContent className="p-6 text-center space-y-4">
                      <div className="flex justify-center">
                        <div className="p-4 bg-green-100 rounded-full">
                          <Users className="h-12 w-12 text-green-600" />
                        </div>
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg mb-2">
                          ความพึงพอใจการเยี่ยมชมบูธ "D-MIND"
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          ประเมินประสบการณ์การเยี่ยมชมบูธแสดงผลงาน D-MIND
                        </p>
                      </div>
                      <Button className="w-full" variant="default">
                        เลือกแบบฟอร์มนี้
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>

            {/* Info Card */}
            <Card className="border-gray-200 shadow-sm">
              <CardContent className="p-4">
                <div className="text-center text-sm text-gray-600">
                  <p className="mb-2">💡 <strong>หมายเหตุ:</strong></p>
                  <p>การประเมินนี้จะช่วยให้เราปรับปรุงและพัฒนาให้ตอบสนองความต้องการของผู้ใช้ได้ดียิ่งขึ้น</p>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          /* Selected Survey Form */
          <div className="space-y-6">
            <Button 
              variant="outline" 
              onClick={() => setSelectedSurveyType(null)}
              className="mb-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              เลือกแบบฟอร์มอื่น
            </Button>

            {selectedSurveyType === 'demo-app' ? (
              <>
                <Card className="border-blue-200 shadow-lg">
                  <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100 text-center">
                    <CardTitle className="text-blue-700 flex items-center justify-center gap-2">
                      <Monitor className="h-6 w-6" />
                      แบบฟอร์มประเมินความพึงพอใจการใช้งาน Demo เว็บแอป "D-MIND"
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <DemoAppSurveyForm onSubmit={() => setSelectedSurveyType(null)} />
                  </CardContent>
                </Card>
              </>
            ) : (
              <>
                <Card className="border-green-200 shadow-lg">
                  <CardHeader className="bg-gradient-to-r from-green-50 to-green-100 text-center">
                    <CardTitle className="text-green-700 flex items-center justify-center gap-2">
                      <Users className="h-6 w-6" />
                      แบบฟอร์มสำรวจความพึงพอใจการเยี่ยมชมบูธ "D-MIND"
                    </CardTitle>
                    <p className="text-sm text-gray-600 mt-2">
                      D-MIND – Disaster Monitoring and Intelligent Notification Device
                    </p>
                  </CardHeader>
                  <CardContent className="p-6">
                    <BoothSurveyForm onSubmit={() => setSelectedSurveyType(null)} />
                  </CardContent>
                </Card>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SatisfactionSurvey;
