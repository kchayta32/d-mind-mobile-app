import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useNavigate } from 'react-router-dom';

const EmergencyArticles: React.FC = () => {
  const navigate = useNavigate();

  // Static articles data
  const staticArticles = [
    {
      id: 'air-quality-index',
      title: 'Air Quality Index',
      category: 'มลพิษอากาศ',
      summary: 'ดัชนีคุณภาพอากาศและผลกระทบต่อสุขภาพ รวมถึงคำแนะนำในการปฏิบัติตัวตามระดับ AQI ต่างๆ',
      source: 'จาก airtw.moenv.gov.tw'
    },
    {
      id: 'weather-forecast-july-2025',
      title: 'คาดหมายอากาศรายเดือน ก.ค. 2568',
      category: 'การพยากรณ์อากาศ',
      summary: 'คาดหมายสภาพอากาศในเดือนกรกฎาคม 2568 โดยกรมอุตุนิยมวิทยา ครอบคลุมการคาดหมายอากาศทั่วไป รายภาค และแบบอินโฟกราฟิก',
      source: 'จาก กรมอุตุนิยมวิทยา'
    },
    {
      id: 'natural-disasters',
      title: 'ภัยพิบัติทางธรรมชาติ ภัยจากธรรมชาติที่สร้างความสูญเสียเกินกว่าที่จะจินตนาการได้',
      category: 'ภัยพิบัติธรรมชาติ',
      summary: 'ภัยพิบัติทางธรรมชาติ ภัยที่ไม่สามารถคาดการณ์ได้ ทำความรู้จักว่าภัยพิบัติธรรมชาติสามารถทำให้เกิดการพลัดถิ่นและลี้ภัยของผู้คนนับล้านได้อย่างไร?',
      source: 'จาก bunhcr.org'
    },
    {
      id: 'earthquake-3countries',
      title: 'แผ่นดินไหวเกิดใหม่ 3 ประเทศ เมียนมา ลาว ไทย แรงสุด สะเทือนเชียงราย',
      category: 'แผ่นดินไหว',
      summary: 'จับตาแผ่นดินไหวเกิดใหม่ 3 ประเทศ "เมียนมา-ลาว-ไทย" แรงสุดวันนี้ รู้สึกแรงสั่นสะเทือนที่เชียงราย โดยแผ่นดินไหวเมียนมา มีขนาดสูงสุดถึง 3.9 - ลาวเจอเขย่า 2 ครั้งซ้อน',
      source: 'จาก bangkokbiznews.com'
    },
    {
      id: 'disaster-20years',
      title: '20 ปี ไทยสูญเสียจาก \'ภัยพิบัติ\' แค่ไหน ในวันที่โลกกำลังเผชิญกับความรุนแรงจาก \'โลกรวน\'',
      category: 'สถิติภัยพิบัติ',
      summary: 'ตลอด 20 ปีที่ผ่านมาไทยต้องเผชิญกับความสูญเสียจาก \'ภัยพิบัติ\' ต่าง ๆ อย่างต่อเนื่องจนมีผู้เสียชีวิตกว่า 10,000 คน และสร้างความเสียหายทางเศรษฐกิจสูงถึง 2.2 ล้านล้านบาท',
      source: 'จาก heactive.thaipbs.or.th'
    },
    {
      id: 'pm25-vs-pm10',
      title: 'PM2.5 vs. PM10 ต่างกันอย่างไร',
      category: 'มลพิษอากาศ',
      summary: 'PM2.5 และ PM10 เป็นมลพิษทางอากาศที่องค์การอนามัยโลก (WHO) ประเมินว่าส่งผลกระทบต่อผู้คนมากกว่ามลพิษอื่นๆ ทำความเข้าใจความแตกต่างและผลกระทบต่อสุขภาพ',
      source: 'จาก smartairfilters.com'
    }
  ];

  const handleArticleClick = (articleId: string | number | undefined) => {
    if (articleId === 'air-quality-index' || articleId === 'disaster-20years' || articleId === 'earthquake-3countries' || articleId === 'natural-disasters' || articleId === 'pm25-vs-pm10' || articleId === 'weather-forecast-july-2025') {
      navigate(`/article/${articleId}`);
    }
  };

  return (
    <div className="space-y-4">
      {/* Static articles */}
      {staticArticles.map((article) => (
        <Card key={article.id} className="overflow-hidden cursor-pointer hover:shadow-md transition-shadow" onClick={() => handleArticleClick(article.id)}>
          <CardContent className="p-4">
            <h2 className="text-lg font-bold mb-2 hover:text-blue-600 transition-colors">
              {article.title}
            </h2>
            <p className="text-xs text-gray-500 mb-2">{article.source}</p>
            
            <div className="inline-block bg-guardian-purple/10 text-guardian-purple px-2 py-0.5 rounded text-xs mb-2">
              {article.category}
            </div>
            
            <p className="text-sm text-gray-700 mb-2">{article.summary}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default EmergencyArticles;
