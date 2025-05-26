
import React from 'react';
import { Button } from '@/components/ui/button';

interface QuestionGuideProps {
  onQuestionSelect: (question: string) => void;
  isVisible: boolean;
}

const QuestionGuide: React.FC<QuestionGuideProps> = ({ onQuestionSelect, isVisible }) => {
  const sampleQuestions = [
    "เมื่อเกิดแผ่นดินไหวควรทำอย่างไร?",
    "ของที่ควรเตรียมไว้สำหรับกรณีฉุกเฉิน",
    "วิธีดับไฟเบื้องต้นอย่างปลอดภัย",
    "แนวทางการปฐมพยาบาลเบื้องต้น",
    "การเตรียมตัวรับมือน้ำท่วม"
  ];

  if (!isVisible) return null;

  return (
    <div className="p-4 bg-gradient-to-br from-blue-50 to-white">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-blue-800 mb-2">💡 คำถามที่ถามบ่อย</h3>
        <p className="text-sm text-blue-600">คลิกเพื่อเริ่มสนทนา</p>
      </div>
      <div className="flex flex-wrap gap-3">
        {sampleQuestions.map((question, index) => (
          <Button
            key={index}
            variant="outline"
            className="bg-white border-blue-200 text-blue-700 hover:bg-blue-50 hover:border-blue-300 rounded-full px-4 py-2 text-sm shadow-sm transition-all duration-200 hover:shadow-md"
            onClick={() => onQuestionSelect(question)}
          >
            {question}
          </Button>
        ))}
      </div>
    </div>
  );
};

export default QuestionGuide;
