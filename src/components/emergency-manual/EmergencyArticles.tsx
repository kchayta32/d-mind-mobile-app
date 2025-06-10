import React, { useState, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { ArticleTimeline } from './ArticleTimeline';

const EmergencyArticles: React.FC = () => {
  const navigate = useNavigate();
  const [dateRange, setDateRange] = useState<{ start: Date; end: Date } | null>(null);

  const articles = [
    {
      id: 'air-quality-index',
      title: 'Air Quality Index',
      subtitle: 'จาก airtw.moenv.gov.tw',
      description: 'ดัชนีคุณภาพอากาศและตัวบ่งชี้มลพิษทางอากาศ',
      image: '/lovable-uploads/70e87fa1-9284-4474-bda5-04c19250a4d5.png',
      created_at: '2024-04-15'
    },
    {
      id: 'uv-aerosol-index',
      title: 'UV Aerosol Index',
      subtitle: 'จาก earthdata.nasa.gov',
      description: 'ดัชนี UV Aerosol สำหรับติดตามอนุภาคในชั้นบรรยากาศ',
      image: '/lovable-uploads/7799a9ff-3b81-4e41-9c7b-b6054d5e7b62.png',
      created_at: '2024-05-20'
    },
    {
      id: 'air-pollution-control-program',
      title: 'Air Pollution Control Program',
      subtitle: 'จาก air.moenv.gov.tw',
      description: 'โครงการควบคุมมลพิษอากาศและมาตรการจัดการคุณภาพอากาศ',
      image: '/lovable-uploads/9b24d25c-901c-4aaf-98dd-78419a5984cd.png',
      created_at: '2024-07-10'
    },
    {
      id: 'weather-forecast-july-2025',
      title: 'พยากรณ์อากาศ กรกฎาคม 2568',
      subtitle: 'จาก กรมอุตุนิยมวิทยา',
      description: 'การพยากรณ์อากาศและสภาพภูมิอากาศในเดือนกรกฎาคม 2568',
      image: '/lovable-uploads/9ee04c09-ef87-44e4-b06d-424087a59578.png',
      created_at: '2024-09-05'
    },
    {
      id: 'natural-disasters',
      title: 'ภัยธรรมชาติในประเทศไทย',
      subtitle: 'จาก กรมป้องกันและบรรเทาสาธารณภัย',
      description: 'ข้อมูลเกี่ยวกับภัยธรรมชาติที่เกิดขึ้นในประเทศไทย',
      image: '/lovable-uploads/aa72c068-2cf3-4b36-be9e-a7eb6351cb9d.png',
      created_at: '2024-11-12'
    },
    {
      id: 'earthquake-3countries',
      title: 'แผ่นดินไหวในภูมิภาคเอเชียตะวันออกเฉียงใต้',
      subtitle: 'จาก USGS และ TMD',
      description: 'ข้อมูลแผ่นดินไหวในไทย เมียนมาร์ และลาว',
      image: '/lovable-uploads/b5550bd4-d83d-4e1e-ac09-025117b87c86.png',
      created_at: '2024-12-25'
    },
    {
      id: 'disaster-20years',
      title: 'ภัยพิบัติ 20 ปีที่ผ่านมา',
      subtitle: 'จาก องค์การบรรเทาทุกข์แห่งชาติ',
      description: 'สถิติและแนวโน้มของภัยพิบัติในช่วง 20 ปีที่ผ่านมา',
      image: '/lovable-uploads/bc9cca0f-39cd-462c-a13b-c60172f3fd2e.png',
      created_at: '2025-01-01'
    },
    {
      id: 'pm25-vs-pm10',
      title: 'PM2.5 vs PM10: ความแตกต่างและผลกระทบ',
      subtitle: 'จาก กรมควบคุมมลพิษ',
      description: 'เปรียบเทียบคุณสมบัติและผลกระทบของ PM2.5 และ PM10',
      image: '/lovable-uploads/70e87fa1-9284-4474-bda5-04c19250a4d5.png',
      created_at: '2025-02-10'
    },
    {
      id: 'earthquake-response-guide',
      title: '20 ปี ไทยสูญเสียจาก \'ภัยพิบัติ\' แค่ไหน ในวันที่โลกกำลังเผชิญกับความรุนแรงจาก \'โลกรวน\'',
      subtitle: 'จาก thairath.co.th',
      description: 'วิธีรับมือแผ่นดินไหว ควรทำอย่างไร มีข้อห้ามอะไรบ้าง',
      image: 'https://static.thairath.co.th/media/dFQROr7oWzulq5Fa5K33t0GHlpONycxjrqHvHm6kPoArPPyVyaiSbN7K5XZ3mw0omYY.jpg',
      created_at: '2025-06-10'
    }
  ];

  const filteredArticles = useMemo(() => {
    if (!dateRange) return articles;
    
    return articles.filter(article => {
      const articleDate = new Date(article.created_at);
      return articleDate >= dateRange.start && articleDate <= dateRange.end;
    });
  }, [dateRange]);

  const handleArticleClick = (articleId: string) => {
    navigate(`/article/${articleId}`);
  };

  const handleDateRangeChange = (startDate: Date, endDate: Date) => {
    setDateRange({ start: startDate, end: endDate });
  };

  return (
    <div className="space-y-4">
      <ArticleTimeline 
        onDateRangeChange={handleDateRangeChange}
        articles={articles}
      />
      
      {filteredArticles.map((article) => (
        <Card 
          key={article.id} 
          className="cursor-pointer hover:shadow-md transition-shadow border-blue-200"
          onClick={() => handleArticleClick(article.id)}
        >
          <CardContent className="p-4">
            <div className="flex gap-4">
              <img 
                src={article.image} 
                alt={article.title}
                className="w-16 h-16 object-cover rounded-lg flex-shrink-0"
              />
              <div className="flex-1">
                <h3 className="text-lg font-bold text-blue-700 mb-1">{article.title}</h3>
                <p className="text-sm text-gray-500 mb-2">{article.subtitle}</p>
                <p className="text-gray-700 text-sm">{article.description}</p>
                <p className="text-xs text-blue-600 mt-2">
                  โพสต์: {new Date(article.created_at).toLocaleDateString('th-TH', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
      
      {filteredArticles.length === 0 && (
        <Card className="border-blue-200">
          <CardContent className="p-8 text-center">
            <p className="text-gray-500">ไม่พบบทความในช่วงวันที่ที่เลือก</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default EmergencyArticles;
