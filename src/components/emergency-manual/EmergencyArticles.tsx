import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const EmergencyArticles: React.FC = () => {
  const navigate = useNavigate();

  const articles = [
    {
      id: 'earthquake-response-guide',
      title: '20 ปี ไทยสูญเสียจาก \'ภัยพิบัติ\' แค่ไหน ในวันที่โลกกำลังเผชิญกับความรุนแรงจาก \'โลกรวน\'',
      subtitle: 'จาก thairath.co.th',
      description: 'วิธีรับมือแผ่นดินไหว ควรทำอย่างไร มีข้อห้ามอะไรบ้าง - คู่มือปฏิบัติตัวเมื่อเกิดแผ่นดินไหวเบื้องต้น',
      image: 'https://static.thairath.co.th/media/dFQROr7oWzulq5Fa5K33t0GHlpONycxjrqHvHm6kPoArPPyVyaiSbN7K5XZ3mw0omYY.jpg',
      date: '10 มิถุนายน 2568'
    },
    {
      id: 'natural-disasters',
      title: 'ประเทศไทยเผชิญความเสี่ยงจากภัยพิบัติทางธรรมชาติอะไรบ้าง?',
      subtitle: 'D-MIND',
      description: 'เจาะลึกภัยพิบัติทางธรรมชาติที่ประเทศไทยต้องเผชิญ พร้อมแนวทางรับมือและป้องกัน',
      image: '/lovable-uploads/6f968999-a951-4cae-8a98-595ca5939451.png',
      date: '25 พฤษภาคม 2568'
    },
    {
      id: 'earthquake-3countries',
      title: 'แผ่นดินไหวเกิดใหม่ 3 ประเทศ เมียนมา ลาว ไทย แรงสุด สะเทือนเชียงราย',
      subtitle: 'จาก bangkokbiznews.com',
      description: 'จับตาแผ่นดินไหวเกิดใหม่ 3 ประเทศ เมียนมา-ลาว-ไทย รู้สึกแรงสั่นสะเทือนที่เชียงราย',
      image: '/lovable-uploads/9b24d25c-901c-4aaf-98dd-78419a5984cd.png',
      date: '30 พฤษภาคม 2568'
    },
    {
      id: 'disaster-20years',
      title: '20 ปี “สึนามิ” ความทรงจำที่ไม่เคยจางหาย',
      subtitle: 'Thai PBS',
      description: 'ย้อนรอยเหตุการณ์สึนามิถล่มไทยเมื่อ 20 ปีก่อน ความสูญเสียและความเปลี่ยนแปลง',
      image: '/lovable-uploads/f9c96949-a35f-499f-869c-a087ca98945c.png',
      date: '26 ธันวาคม 2567'
    },
    {
      id: 'pm25-vs-pm10',
      title: 'PM2.5 VS PM10 ต่างกันอย่างไร?',
      subtitle: 'D-MIND',
      description: 'PM2.5 กับ PM10 คืออะไร? มีความแตกต่างกันอย่างไร? และส่งผลกระทบต่อสุขภาพอย่างไร?',
      image: '/lovable-uploads/c7e3982d-6a45-4176-8561-509f59992441.png',
      date: '15 พฤษภาคม 2568'
    },
    {
      id: 'weather-forecast-july-2025',
      title: 'พยากรณ์อากาศ กรกฎาคม 2568',
      subtitle: 'กรมอุตุนิยมวิทยา',
      description: 'พยากรณ์อากาศตลอดเดือนกรกฎาคม 2568 เตรียมรับมือกับสภาพอากาศที่เปลี่ยนแปลง',
      image: '/lovable-uploads/649b9559-f395-4999-a559-59c481124c69.png',
      date: '1 กรกฎาคม 2568'
    },
    {
      id: 'air-quality-index',
      title: 'Air Quality Index คืออะไร?',
      subtitle: 'D-MIND',
      description: 'Air Quality Index (AQI) คืออะไร? มีความสำคัญอย่างไร? และส่งผลกระทบต่อสุขภาพอย่างไร?',
      image: '/lovable-uploads/4955996f-4a9a-4499-8941-9444a9f99c17.png',
      date: '10 พฤษภาคม 2568'
    },
    {
      id: 'uv-aerosol-index',
      title: 'UV Aerosol Index คืออะไร?',
      subtitle: 'D-MIND',
      description: 'UV Aerosol Index (UVAI) คืออะไร? มีความสำคัญอย่างไร? และส่งผลกระทบต่อสุขภาพอย่างไร?',
      image: '/lovable-uploads/c9943689-6967-48f1-89ca-1a0116140a4a.png',
      date: '5 พฤษภาคม 2568'
    },
    {
      id: 'air-pollution-control-program',
      title: 'โครงการควบคุมมลพิษทางอากาศ',
      subtitle: 'กระทรวงทรัพยากรธรรมชาติและสิ่งแวดล้อม',
      description: 'โครงการควบคุมมลพิษทางอากาศของประเทศไทย มีอะไรบ้าง? และมีเป้าหมายอย่างไร?',
      image: '/lovable-uploads/6f968999-a951-4cae-8a98-595ca5939451.png',
      date: '1 พฤษภาคม 2568'
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {articles.map((article) => (
        <Card key={article.id} className="bg-white shadow-md rounded-lg overflow-hidden">
          <img
            src={article.image}
            alt={article.title}
            className="w-full h-48 object-cover"
          />
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">{article.title}</h3>
            <p className="text-gray-600 text-sm mb-3">{article.subtitle}</p>
            <p className="text-gray-500 text-sm mb-4">{article.description}</p>
            <div className="flex items-center justify-between">
              <span className="text-gray-400 text-xs">วันที่ {article.date}</span>
              <Button size="sm" onClick={() => navigate(`/article/${article.id}`)}>
                อ่านเพิ่มเติม <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default EmergencyArticles;
