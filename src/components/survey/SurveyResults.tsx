
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { FeatureChart } from './charts/FeatureChart';
import { UsabilityChart } from './charts/UsabilityChart';
import { SatisfactionRadarChart } from './charts/SatisfactionRadarChart';
import { SurveyFilters } from './SurveyFilters';

interface SurveyStats {
  totalResponses: number;
  averageOverallRating: number;
  averageAIRating: number;
  averageUIRating: number;
  averageAlertRating: number;
  averageMapRating: number;
  averageEmergencyRating: number;
  satisfactionPercentage: number;
  recommendationPercentage: number;
}

const SurveyResults: React.FC = () => {
  const [stats, setStats] = useState<SurveyStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [allSurveys, setAllSurveys] = useState<any[]>([]);
  const [dateFilter, setDateFilter] = useState<{ start: Date | null; end: Date | null }>({ 
    start: null, 
    end: null 
  });

  useEffect(() => {
    const fetchSurveyData = async () => {
      try {
        const { data, error } = await supabase
          .from('satisfaction_surveys')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching survey data:', error);
          return;
        }

        if (data) {
          setAllSurveys(data);
          calculateStats(data);
        }
      } catch (error) {
        console.error('Error processing survey data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSurveyData();
  }, []);

  // Recalculate stats when date filter changes
  useEffect(() => {
    if (allSurveys.length > 0) {
      let filteredData = allSurveys;

      if (dateFilter.start && dateFilter.end) {
        filteredData = allSurveys.filter(survey => {
          const surveyDate = new Date(survey.created_at);
          return surveyDate >= dateFilter.start! && surveyDate <= dateFilter.end!;
        });
      }

      calculateStats(filteredData);
    }
  }, [dateFilter, allSurveys]);

  const calculateStats = (data: any[]) => {
    if (data.length === 0) {
      setStats({
        totalResponses: 0,
        averageOverallRating: 0,
        averageAIRating: 0,
        averageUIRating: 0,
        averageAlertRating: 0,
        averageMapRating: 0,
        averageEmergencyRating: 0,
        satisfactionPercentage: 0,
        recommendationPercentage: 0
      });
      return;
    }

    const totalResponses = data.length;
    const averageOverallRating = data.reduce((sum, item) => sum + (item.overall_rating || 0), 0) / totalResponses;
    const averageAIRating = data.filter(item => item.ai_assistant_rating).reduce((sum, item) => sum + (item.ai_assistant_rating || 0), 0) / data.filter(item => item.ai_assistant_rating).length || 0;
    const averageUIRating = data.filter(item => item.user_interface_rating).reduce((sum, item) => sum + (item.user_interface_rating || 0), 0) / data.filter(item => item.user_interface_rating).length || 0;
    const averageAlertRating = data.filter(item => item.alert_system_rating).reduce((sum, item) => sum + (item.alert_system_rating || 0), 0) / data.filter(item => item.alert_system_rating).length || 0;
    const averageMapRating = data.filter(item => item.map_visualization_rating).reduce((sum, item) => sum + (item.map_visualization_rating || 0), 0) / data.filter(item => item.map_visualization_rating).length || 0;
    const averageEmergencyRating = data.filter(item => item.emergency_info_rating).reduce((sum, item) => sum + (item.emergency_info_rating || 0), 0) / data.filter(item => item.emergency_info_rating).length || 0;
    
    const satisfiedCount = data.filter(item => (item.overall_rating || 0) >= 4).length;
    const satisfactionPercentage = Math.round((satisfiedCount / totalResponses) * 100);
    
    const recommendCount = data.filter(item => (item.would_recommend || 0) >= 4).length;
    const recommendationPercentage = Math.round((recommendCount / totalResponses) * 100);

    setStats({
      totalResponses,
      averageOverallRating: Math.round(averageOverallRating * 10) / 10,
      averageAIRating: Math.round(averageAIRating * 10) / 10,
      averageUIRating: Math.round(averageUIRating * 10) / 10,
      averageAlertRating: Math.round(averageAlertRating * 10) / 10,
      averageMapRating: Math.round(averageMapRating * 10) / 10,
      averageEmergencyRating: Math.round(averageEmergencyRating * 10) / 10,
      satisfactionPercentage,
      recommendationPercentage
    });
  };

  const handleDateRangeChange = (startDate: Date | null, endDate: Date | null) => {
    setDateFilter({ start: startDate, end: endDate });
  };

  const surveyDates = allSurveys.map(survey => survey.created_at).filter(date => date);

  // Prepare data for charts
  const featureScores = stats ? [
    { feature: 'แผนที่ภัยพิบัติ', score: stats.averageMapRating },
    { feature: 'แจ้งเตือนภัย', score: stats.averageAlertRating },
    { feature: 'คู่มือฉุกเฉิน', score: stats.averageEmergencyRating },
    { feature: 'ผู้ช่วย AI', score: stats.averageAIRating },
    { feature: 'ส่วนติดต่อผู้ใช้', score: stats.averageUIRating },
  ].filter(item => item.score > 0) : [];

  const radarData = stats ? [
    { category: 'แผนที่ภัยพิบัติ', score: stats.averageMapRating, fullMark: 5 },
    { category: 'แจ้งเตือนภัย', score: stats.averageAlertRating, fullMark: 5 },
    { category: 'คู่มือฉุกเฉิน', score: stats.averageEmergencyRating, fullMark: 5 },
    { category: 'ผู้ช่วย AI', score: stats.averageAIRating, fullMark: 5 },
    { category: 'ส่วนติดต่อผู้ใช้', score: stats.averageUIRating, fullMark: 5 },
  ].filter(item => item.score > 0) : [];

  const usabilityData = [
    { name: 'ใช้งานง่ายมาก', value: 35 },
    { name: 'ใช้งานง่าย', value: 28 },
    { name: 'ปานกลาง', value: 20 },
    { name: 'ใช้งานยาก', value: 12 },
    { name: 'ใช้งานยากมาก', value: 5 },
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-center h-40">
              <div className="text-gray-500">กำลังโหลดข้อมูล...</div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      {/* Main Content */}
      <div className="flex-1 space-y-6">
        {/* Pentagon Radar Chart */}
        <Card>
        <CardHeader>
          <CardTitle className="text-center">ผลการประเมินความพึงพอใจแบบห้าเหลี่ยม</CardTitle>
        </CardHeader>
        <CardContent>
          {radarData.length > 0 ? (
            <SatisfactionRadarChart data={radarData} />
          ) : (
            <div className="text-center text-gray-500 py-8">
              ยังไม่มีข้อมูลการประเมิน
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>ผลการประเมินความพึงพอใจ</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-medium mb-4">คะแนนประเมินฟีเจอร์ต่างๆ</h3>
              {featureScores.length > 0 ? (
                <FeatureChart data={featureScores} />
              ) : (
                <div className="text-center text-gray-500 py-8">
                  ยังไม่มีข้อมูลการประเมิน
                </div>
              )}
            </div>
            <div>
              <h3 className="text-lg font-medium mb-4">ความง่ายในการใช้งาน</h3>
              <UsabilityChart data={usabilityData} />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>สถิติการตอบแบบสอบถาม</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{stats?.totalResponses || 0}</div>
              <div className="text-sm text-gray-600">ผู้ตอบแบบสอบถาม</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{stats?.averageOverallRating || 0}</div>
              <div className="text-sm text-gray-600">คะแนนเฉลี่ย</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{stats?.satisfactionPercentage || 0}%</div>
              <div className="text-sm text-gray-600">ความพึงพอใจ</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{stats?.recommendationPercentage || 0}%</div>
              <div className="text-sm text-gray-600">แนะนำต่อ</div>
            </div>
          </div>
        </CardContent>
      </Card>
      </div>

      {/* Filters Sidebar */}
      <div className="lg:w-80">
        <SurveyFilters 
          onDateRangeChange={handleDateRangeChange}
          surveyDates={surveyDates}
        />
      </div>
    </div>
  );
};

export default SurveyResults;
