import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Star, BarChart3 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import SurveyForm from '@/components/survey/SurveyForm';
import SurveyResults from '@/components/survey/SurveyResults';

const SatisfactionSurvey: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('survey');

  const handleSubmitSurvey = (surveyData: any) => {
    toast({
      title: "ขอบคุณสำหรับการประเมิน! 🙏",
      description: "ความคิดเห็นของคุณจะช่วยให้เราปรับปรุงแอพให้ดีขึ้น",
      duration: 5000,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-yellow-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800 pb-24">
      {/* Modern Header */}
      <header className="bg-gradient-to-r from-yellow-500 via-amber-500 to-orange-500 text-white pt-6 pb-8 px-5 rounded-b-3xl shadow-xl">
        <div className="flex items-center gap-3 mb-2">
          <Button
            variant="ghost"
            size="icon"
            className="text-white/90 hover:bg-white/20 rounded-xl"
            onClick={() => navigate('/')}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2 rounded-xl backdrop-blur-sm">
              <Star className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold">แบบประเมินความพึงพอใจ</h1>
              <p className="text-white/70 text-xs">ให้คะแนนและแสดงความคิดเห็น</p>
            </div>
          </div>
        </div>
      </header>

      {/* Tab Pills */}
      <div className="px-4 -mt-4">
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-1.5 flex gap-1">
          <button
            onClick={() => setActiveTab('survey')}
            className={`flex-1 py-3 px-4 rounded-xl text-sm font-medium flex items-center justify-center gap-2 transition-all ${activeTab === 'survey'
                ? 'bg-gradient-to-r from-yellow-500 to-amber-500 text-white shadow-md'
                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700'
              }`}
          >
            <Star className="h-4 w-4" />
            ประเมิน
          </button>
          <button
            onClick={() => setActiveTab('results')}
            className={`flex-1 py-3 px-4 rounded-xl text-sm font-medium flex items-center justify-center gap-2 transition-all ${activeTab === 'results'
                ? 'bg-gradient-to-r from-yellow-500 to-amber-500 text-white shadow-md'
                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700'
              }`}
          >
            <BarChart3 className="h-4 w-4" />
            ผลประเมิน
          </button>
        </div>
      </div>

      {/* Content */}
      <main className="px-4 pt-5">
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 p-4">
          {activeTab === 'survey' ? (
            <SurveyForm onSubmit={handleSubmitSurvey} />
          ) : (
            <SurveyResults />
          )}
        </div>
      </main>
    </div>
  );
};

export default SatisfactionSurvey;

