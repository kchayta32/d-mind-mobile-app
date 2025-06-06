
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';

const EmergencyArticles: React.FC = () => {
  const navigate = useNavigate();

  const articles = [
    {
      id: 'air-quality-index',
      title: 'Air Quality Index',
      subtitle: 'จาก airtw.moenv.gov.tw',
      description: 'ดัชนีคุณภาพอากาศและตัวบ่งชี้มลพิษทางอากาศ'
    },
    {
      id: 'uv-aerosol-index',
      title: 'UV Aerosol Index',
      subtitle: 'จาก earthdata.nasa.gov',
      description: 'ดัชนี UV Aerosol สำหรับติดตามอนุภาคในชั้นบรรยากาศ'
    },
    {
      id: 'air-pollution-control-program',
      title: 'Air Pollution Control Program',
      subtitle: 'จาก air.moenv.gov.tw',
      description: 'โครงการควบคุมมลพิษอากาศและมาตรการจัดการคุณภาพอากาศ'
    },
    {
      id: 'weather-forecast-july-2025',
      title: 'พยากรณ์อากาศ กรกฎาคม 2568',
      subtitle: 'จาก กรมอุตุนิยมวิทยา',
      description: 'การพยากรณ์อากาศและสภาพภูมิอากาศในเดือนกรกฎาคม 2568'
    },
    {
      id: 'natural-disasters',
      title: 'ภัยธรรมชาติในประเทศไทย',
      subtitle: 'จาก กรมป้องกันและบรรเทาสาธารณภัย',
      description: 'ข้อมูลเกี่ยวกับภัยธรรมชาติที่เกิดขึ้นในประเทศไทย'
    },
    {
      id: 'earthquake-3countries',
      title: 'แผ่นดินไหวในภูมิภาคเอเชียตะวันออกเฉียงใต้',
      subtitle: 'จาก USGS และ TMD',
      description: 'ข้อมูลแผ่นดินไหวในไทย เมียนมาร์ และลาว'
    },
    {
      id: 'disaster-20years',
      title: 'ภัยพิบัติ 20 ปีที่ผ่านมา',
      subtitle: 'จาก องค์การบรรเทาทุกข์แห่งชาติ',
      description: 'สถิติและแนวโน้มของภัยพิบัติในช่วง 20 ปีที่ผ่านมา'
    },
    {
      id: 'pm25-vs-pm10',
      title: 'PM2.5 vs PM10: ความแตกต่างและผลกระทบ',
      subtitle: 'จาก กรมควบคุมมลพิษ',
      description: 'เปรียบเทียบคุณสมบัติและผลกระทบของ PM2.5 และ PM10'
    }
  ];

  const handleArticleClick = (articleId: string) => {
    navigate(`/article/${articleId}`);
  };

  return (
    <div className="space-y-4">
      {articles.map((article) => (
        <Card 
          key={article.id} 
          className="cursor-pointer hover:shadow-md transition-shadow border-blue-200"
          onClick={() => handleArticleClick(article.id)}
        >
          <CardContent className="p-4">
            <h3 className="text-lg font-bold text-blue-700 mb-1">{article.title}</h3>
            <p className="text-sm text-gray-500 mb-2">{article.subtitle}</p>
            <p className="text-gray-700 text-sm">{article.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default EmergencyArticles;
