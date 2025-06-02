
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Star, Send, Smartphone, Map, Bot, BookOpen, Shield } from 'lucide-react';

interface SurveyData {
  overallRating: number;
  features: {
    mapVisualization: number;
    aiAssistant: number;
    emergencyInfo: number;
    userInterface: number;
    alertSystem: number;
  };
  mostUsefulFeature: string;
  suggestions: string;
  wouldRecommend: number;
}

interface SurveyFormProps {
  onSubmit: (data: SurveyData) => void;
}

const SurveyForm: React.FC<SurveyFormProps> = ({ onSubmit }) => {
  const [surveyData, setSurveyData] = useState<SurveyData>({
    overallRating: 0,
    features: {
      mapVisualization: 0,
      aiAssistant: 0,
      emergencyInfo: 0,
      userInterface: 0,
      alertSystem: 0,
    },
    mostUsefulFeature: '',
    suggestions: '',
    wouldRecommend: 0,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const StarRating = ({ rating, onRating, label }: { rating: number; onRating: (rating: number) => void; label: string }) => (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
      <div className="flex space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onRating(star)}
            className={`p-1 rounded transition-colors ${
              star <= rating ? 'text-yellow-400' : 'text-gray-300 hover:text-yellow-200'
            }`}
          >
            <Star className="h-6 w-6 fill-current" />
          </button>
        ))}
      </div>
    </div>
  );

  const handleFeatureRating = (feature: keyof SurveyData['features'], rating: number) => {
    setSurveyData(prev => ({
      ...prev,
      features: {
        ...prev.features,
        [feature]: rating
      }
    }));
  };

  const handleSubmit = async () => {
    if (surveyData.overallRating === 0) {
      alert('กรุณาให้คะแนนความพึงพอใจโดยรวม');
      return;
    }

    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      onSubmit(surveyData);
      setIsSubmitting(false);
      
      // Reset form
      setSurveyData({
        overallRating: 0,
        features: {
          mapVisualization: 0,
          aiAssistant: 0,
          emergencyInfo: 0,
          userInterface: 0,
          alertSystem: 0,
        },
        mostUsefulFeature: '',
        suggestions: '',
        wouldRecommend: 0,
      });
    }, 1000);
  };

  const featureLabels = [
    { key: 'mapVisualization' as const, label: 'แผนที่แสดงภัยพิบัติ', icon: Map },
    { key: 'aiAssistant' as const, label: 'ผู้ช่วย AI (Dr.Mind)', icon: Bot },
    { key: 'emergencyInfo' as const, label: 'ข้อมูลฉุกเฉิน', icon: BookOpen },
    { key: 'userInterface' as const, label: 'การใช้งานแอพ', icon: Smartphone },
    { key: 'alertSystem' as const, label: 'ระบบแจ้งเตือน', icon: Shield },
  ];

  return (
    <div className="space-y-6">
      {/* Overall Rating */}
      <Card className="border-blue-200">
        <CardContent className="p-4">
          <StarRating
            rating={surveyData.overallRating}
            onRating={(rating) => setSurveyData(prev => ({ ...prev, overallRating: rating }))}
            label="ความพึงพอใจโดยรวมในการใช้งาน Demo แอพ D-MIND"
          />
        </CardContent>
      </Card>

      {/* Feature Ratings */}
      <Card className="border-blue-200">
        <CardContent className="p-4">
          <h3 className="font-semibold text-gray-800 mb-4">ประเมินคุณภาพของฟีเจอร์ต่างๆ</h3>
          {featureLabels.map(({ key, label, icon: IconComponent }) => (
            <div key={key} className="mb-4 p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <IconComponent className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-gray-700">{label}</span>
              </div>
              <div className="flex space-x-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => handleFeatureRating(key, star)}
                    className={`p-1 rounded transition-colors ${
                      star <= surveyData.features[key] ? 'text-yellow-400' : 'text-gray-300 hover:text-yellow-200'
                    }`}
                  >
                    <Star className="h-5 w-5 fill-current" />
                  </button>
                ))}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Most Useful Feature */}
      <Card className="border-blue-200">
        <CardContent className="p-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            ฟีเจอร์ใดที่คุณคิดว่าเป็นประโยชน์มากที่สุด?
          </label>
          <Textarea
            value={surveyData.mostUsefulFeature}
            onChange={(e) => setSurveyData(prev => ({ ...prev, mostUsefulFeature: e.target.value }))}
            placeholder="เช่น แผนที่แสดงภัยพิบัติแบบเรียลไทม์, AI Assistant, ระบบแจ้งเตือน..."
            className="min-h-[80px]"
          />
        </CardContent>
      </Card>

      {/* Suggestions */}
      <Card className="border-blue-200">
        <CardContent className="p-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            ข้อเสนอแนะสำหรับการปรับปรุงแอพ
          </label>
          <Textarea
            value={surveyData.suggestions}
            onChange={(e) => setSurveyData(prev => ({ ...prev, suggestions: e.target.value }))}
            placeholder="แชร์ความคิดเห็นของคุณเพื่อให้เราพัฒนาแอพให้ดีขึ้น..."
            className="min-h-[100px]"
          />
        </CardContent>
      </Card>

      {/* Recommendation */}
      <Card className="border-blue-200">
        <CardContent className="p-4">
          <StarRating
            rating={surveyData.wouldRecommend}
            onRating={(rating) => setSurveyData(prev => ({ ...prev, wouldRecommend: rating }))}
            label="คุณจะแนะนำแอพนี้ให้กับผู้อื่นมากน้อยเพียงใด?"
          />
        </CardContent>
      </Card>

      {/* Submit Button */}
      <Button 
        onClick={handleSubmit}
        disabled={isSubmitting}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 text-lg font-semibold"
      >
        {isSubmitting ? (
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
            กำลังส่ง...
          </div>
        ) : (
          <>
            <Send className="mr-2 h-5 w-5" />
            ส่งแบบประเมิน
          </>
        )}
      </Button>
    </div>
  );
};

export default SurveyForm;
