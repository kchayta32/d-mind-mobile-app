
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Star, Send, BarChart3 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import AppLogo from '@/components/AppLogo';
import SurveyForm from '@/components/survey/SurveyForm';
import SurveyResults from '@/components/survey/SurveyResults';

const SatisfactionSurvey: React.FC = () => {
  const { toast } = useToast();

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
        <Tabs defaultValue="survey" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="survey" className="flex items-center gap-2">
              <Star className="h-4 w-4" />
              ประเมินความพึงพอใจ
            </TabsTrigger>
            <TabsTrigger value="results" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              ผลการประเมิน
            </TabsTrigger>
          </TabsList>

          {/* Survey Form Tab */}
          <TabsContent value="survey">
            <Card className="border-blue-200 shadow-lg mb-6">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100 text-center">
                <CardTitle className="text-blue-700 flex items-center justify-center gap-2">
                  <Star className="h-6 w-6 text-yellow-500" />
                  ประเมินความพึงพอใจ
                </CardTitle>
                <p className="text-sm text-gray-600 mt-2">
                  โปรดให้คะแนนและแสดงความคิดเห็นเกี่ยวกับการใช้งาน Demo แอพ D-MIND
                </p>
              </CardHeader>
              <CardContent className="p-6">
                <SurveyForm onSubmit={handleSubmitSurvey} />
              </CardContent>
            </Card>

            {/* Info Card */}
            <Card className="border-gray-200 shadow-sm">
              <CardContent className="p-4">
                <div className="text-center text-sm text-gray-600">
                  <p className="mb-2">💡 <strong>หมายเหตุ:</strong></p>
                  <p>การประเมินนี้จะช่วยให้เราปรับปรุงและพัฒนาแอพพลิเคชั่นให้ตอบสนองความต้องการของผู้ใช้ได้ดียิ่งขึ้น</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Survey Results Tab */}
          <TabsContent value="results">
            <Card className="border-blue-200 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-green-50 to-green-100 text-center">
                <CardTitle className="text-green-700 flex items-center justify-center gap-2">
                  <BarChart3 className="h-6 w-6 text-green-600" />
                  ผลการประเมินความพึงพอใจ
                </CardTitle>
                <p className="text-sm text-gray-600 mt-2">
                  สถิติและแนวโน้มการประเมินจากผู้ใช้งาน Demo แอพ D-MIND
                </p>
              </CardHeader>
              <CardContent className="p-6">
                <SurveyResults />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default SatisfactionSurvey;
