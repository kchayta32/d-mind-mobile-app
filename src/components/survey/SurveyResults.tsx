
import React from 'react';
import { FeatureChart } from './charts/FeatureChart';
import { UsabilityChart } from './charts/UsabilityChart';

const SurveyResults: React.FC = () => {
  // Mock data for feature evaluation
  const featureData = [
    { name: 'แผนที่ภัยพิบัติ', score: 4.2, votes: 85 },
    { name: 'ผู้ช่วย AI', score: 3.8, votes: 72 },
    { name: 'คู่มือฉุกเฉิน', score: 4.5, votes: 91 },
    { name: 'รายงานภัยพิบัติ', score: 3.9, votes: 67 },
    { name: 'การแจ้งเตือน', score: 4.1, votes: 78 },
    { name: 'เบอร์ฉุกเฉิน', score: 4.7, votes: 95 }
  ];

  // Mock data for usability evaluation
  const usabilityData = [
    { aspect: 'ใช้งานง่าย', score: 4.0, votes: 88 },
    { aspect: 'ตอบสนองเร็ว', score: 3.7, votes: 82 },
    { aspect: 'ข้อมูลถูกต้อง', score: 4.3, votes: 90 },
    { aspect: 'การออกแบบ', score: 4.1, votes: 75 },
    { aspect: 'ประโยชน์', score: 4.4, votes: 93 }
  ];

  return (
    <div className="p-6 space-y-8 bg-gray-50 min-h-screen">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          ผลการประเมินแอปพลิเคชัน
        </h1>
        <p className="text-gray-600">
          สรุปผลการประเมินความพึงพอใจจากผู้ใช้งาน
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <FeatureChart 
          data={featureData}
          title="คะแนนประเมินฟีเจอร์ต่างๆ"
        />
        
        <UsabilityChart 
          data={usabilityData}
          title="คะแนนประเมินการใช้งาน"
        />
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-xl font-semibold mb-4">สรุปผลการประเมิน</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">4.2</div>
            <div className="text-sm text-gray-600">คะแนนเฉลี่ยรวม</div>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">89%</div>
            <div className="text-sm text-gray-600">ความพึงพอใจ</div>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">156</div>
            <div className="text-sm text-gray-600">จำนวนผู้ตอบ</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SurveyResults;
