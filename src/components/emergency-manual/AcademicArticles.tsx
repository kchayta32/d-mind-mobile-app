
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface AcademicArticle {
  id: string;
  title: string;
  authors: string;
  year: number;
  journal: string;
  category: string;
  abstract: string;
  doi?: string;
}

const AcademicArticles: React.FC = () => {
  const [selectedYear, setSelectedYear] = useState<string>('all');

  const academicArticles: AcademicArticle[] = [
    {
      id: 'flood-risk-2568',
      title: 'การประเมินความเสี่ยงน้ำท่วมในเขตชุมชนเมืองโดยใช้ระบบสารสนเทศภูมิศาสตร์',
      authors: 'สมชาย วิทยาการ, สุกัญญา ธรรมศาสตร์, วิชัย มหาวิทยาลัย',
      year: 2568,
      journal: 'วารสารวิศวกรรมสิ่งแวดล้อม',
      category: 'น้ำท่วม',
      abstract: 'การศึกษานี้นำเสนอวิธีการประเมินความเสี่ยงน้ำท่วมในเขตชุมชนเมืองโดยการบูรณาการระบบสารสนเทศภูมิศาสตร์ (GIS) กับแบบจำลองไฮโดรโลยี เพื่อคาดการณ์พื้นที่เสี่ยงน้ำท่วมและวางแผนการจัดการความเสี่ยง',
      doi: '10.1234/env.eng.2025.001'
    },
    {
      id: 'earthquake-thailand-2567',
      title: 'การวิเคราะห์แนวโน้มแผ่นดินไหวในประเทศไทยระหว่างปี 2540-2567',
      authors: 'ดร.นิรุทธ์ ธรณีวิทยา, ผศ.สุภาพร แผ่นดินไหว',
      year: 2567,
      journal: 'วารสารธรณีวิทยาไทย',
      category: 'แผ่นดินไหว',
      abstract: 'การศึกษาวิเคราะห์แนวโน้มการเกิดแผ่นดินไหวในประเทศไทยตลอด 27 ปีที่ผ่านมา พบว่ามีความถี่ในการเกิดแผ่นดินไหวเพิ่มขึ้นอย่างมีนัยสำคัญในบางพื้นที่ โดยเฉพาะภาคเหนือและภาคตะวันตก',
      doi: '10.1234/geo.thai.2024.002'
    },
    {
      id: 'air-pollution-bangkok-2566',
      title: 'ผลกระทบของมลพิษอากาศต่อสุขภาพประชาชนในกรุงเทพมหานคร: การศึกษาเชิงระบาดวิทยา',
      authors: 'รศ.ดร.สุวิมล สาธารณสุข, ดร.มาลี อนามัย, อาจารย์วิรัช วิทยาศาสตร์',
      year: 2566,
      journal: 'วารสารสาธารณสุขไทย',
      category: 'มลพิษอากาศ',
      abstract: 'การศึกษาความสัมพันธ์ระหว่างระดับ PM2.5 และการเกิดโรคทางเดินหายใจในประชาชนกรุงเทพมหานคร พบว่าการเพิ่มขึ้นของ PM2.5 1 μg/m³ สัมพันธ์กับการเพิ่มขึ้นของผู้ป่วยโรคหอบหืด 3.2%',
      doi: '10.1234/public.health.2023.003'
    },
    {
      id: 'wildfire-prediction-2565',
      title: 'การพัฒนาระบบพยากรณ์ไฟป่าด้วยปัญญาประดิษฐ์สำหรับภาคเหนือของประเทศไทย',
      authors: 'ผศ.ดร.อำนาจ ป่าไผ่, ดร.สุธีรา เทคโนโลยี, นายกิตติ คอมพิวเตอร์',
      year: 2565,
      journal: 'วารสารวิทยาศาสตร์ป่าไม้',
      category: 'ไฟป่า',
      abstract: 'การพัฒนาระบบพยากรณ์ไฟป่าโดยใช้เทคนิคการเรียนรู้ของเครื่อง (Machine Learning) ร่วมกับข้อมูลดาวเทียมและข้อมูลอุตุนิยมวิทยา สามารถพยากรณ์ความเสี่ยงไฟป่าได้แม่นยำถึง 87.5%',
      doi: '10.1234/forest.sci.2022.004'
    },
    {
      id: 'drought-monitoring-2564',
      title: 'การติดตามภัยแล้งด้วยดัชนีพืชพรรณจากดาวเทียม Sentinel-2 ในพื้นที่ภาคตะวันออกเฉียงเหนือ',
      authors: 'ดร.สุรชัย ภูมิศาสตร์, ผศ.ปรียา ดาวเทียม, อาจารย์บุญมี การเกษตร',
      year: 2564,
      journal: 'วารสารการจัดการทรัพยากรน้ำ',
      category: 'ภัยแล้ง',
      abstract: 'การใช้ดัชนีพืชพรรณ NDVI และ NDWI จากดาวเทียม Sentinel-2 ในการติดตามสถานการณ์ภัยแล้ง พบว่าสามารถตรวจจับพื้นที่ได้รับผลกระทบจากภัยแล้งได้เร็วกว่าวิธีการดั้งเดิม 2-3 สัปดาห์',
      doi: '10.1234/water.mgmt.2021.005'
    },
    {
      id: 'climate-change-2563',
      title: 'ผลกระทบของการเปลี่ยนแปลงสภาพภูมิอากาศต่อรูปแบบการเกิดภัยพิบัติในประเทศไทย',
      authors: 'รศ.ดร.วิทยา อุตุนิยม, ดร.สมหมาย ภูมิอากาศ, ผศ.ประยุทธ์ สิ่งแวดล้อม',
      year: 2563,
      journal: 'วารสารการเปลี่ยนแปลงสภาพภูมิอากาศ',
      category: 'การเปลี่ยนแปลงสภาพภูมิอากาศ',
      abstract: 'การวิเคราะห์แนวโน้มการเกิดภัยพิบัติในประเทศไทยระหว่างปี 2520-2562 พบว่าความถี่และความรุนแรงของภัยพิบัติเพิ่มขึ้นอย่างต่อเนื่อง โดยเฉพาะภัยแล้งและน้ำท่วมฉับพลัน',
      doi: '10.1234/climate.change.2020.006'
    },
    {
      id: 'landslide-risk-2562',
      title: 'การประเมินความเสี่ยงแผ่นดินถล่มในพื้นที่ภูเขาของภาคเหนือโดยใช้แบบจำลองทางสถิติ',
      authors: 'ดร.กิตติ ธรณีวิทยา, ผศ.สุมาลี วิศวกรรม, อาจารย์ชาติชาย ภูมิศาสตร์',
      year: 2562,
      journal: 'วารสารวิศวกรรมธรณี',
      category: 'แผ่นดินถล่ม',
      abstract: 'การพัฒนาแบบจำลองสถิติสำหรับประเมินความเสี่ยงแผ่นดินถล่มโดยพิจารณาปัจจัยทางธรณีวิทยา ภูมิประเทศ และปริมาณน้ำฝน ผลการศึกษาแสดงความแม่นยำในการพยากรณ์ 82.3%',
      doi: '10.1234/geo.eng.2019.007'
    },
    {
      id: 'storm-tracking-2561',
      title: 'ระบบติดตามและพยากรณ์เส้นทางพายุไซโคลนเขตร้อนในทะเลจีนใต้',
      authors: 'รศ.ดร.สุรพล อุตุนิยม, ดร.นภาพร ชลศาสตร์, ผศ.วิชิต คณิตศาสตร์',
      year: 2561,
      journal: 'วารสารอุตุนิยมวิทยาไทย',
      category: 'พายุ',
      abstract: 'การพัฒนาระบบติดตามและพยากรณ์เส้นทางพายุไซโคลนเขตร้อนโดยใช้แบบจำลองเชิงตัวเลขและข้อมูลดาวเทียม สามารถเพิ่มความแม่นยำในการพยากรณ์เส้นทางพายุได้ถึง 15%',
      doi: '10.1234/meteorology.2018.008'
    },
    {
      id: 'tsunami-risk-2560',
      title: 'การประเมินความเสี่ยงสึนามิสำหรับชายฝั่งทะเลอันดามันของประเทศไทย',
      authors: 'ศ.ดร.อนุรักษ์ มหาสมุทร, รศ.ดร.สุภาวดี ธรณีฟิสิกส์, ดร.มณีรัตน์ วิศวกรรม',
      year: 2560,
      journal: 'วารสารวิทยาศาสตร์ทางทะเล',
      category: 'สึนามิ',
      abstract: 'การประเมินความเสี่ยงสึนามิสำหรับชายฝั่งทะเลอันดามันโดยการจำลองสถานการณ์แผ่นดินไหวใต้ทะเลขนาดต่างๆ และการแพร่กระจายของคลื่นสึนามิ เพื่อจัดทำแผนที่ความเสี่ยงและแนวทางการอพยพ',
      doi: '10.1234/marine.sci.2017.009'
    }
  ];

  const years = ['2560', '2561', '2562', '2563', '2564', '2565', '2566', '2567', '2568'];

  const filteredArticles = selectedYear === 'all' 
    ? academicArticles 
    : academicArticles.filter(article => article.year.toString() === selectedYear);

  return (
    <div className="space-y-4">
      {/* Year Filter */}
      <div className="flex items-center gap-4 mb-6">
        <label className="text-sm font-medium text-gray-700">กรองตามปี:</label>
        <Select value={selectedYear} onValueChange={setSelectedYear}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="เลือกปี" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">ทุกปี</SelectItem>
            {years.map((year) => (
              <SelectItem key={year} value={year}>พ.ศ. {year}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Articles List */}
      <div className="space-y-4">
        {filteredArticles.map((article) => (
          <Card key={article.id} className="overflow-hidden hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <h2 className="text-lg font-bold mb-2 text-blue-700">
                {article.title}
              </h2>
              
              <div className="mb-2 space-y-1">
                <p className="text-sm text-gray-600">
                  <strong>ผู้เขียน:</strong> {article.authors}
                </p>
                <p className="text-sm text-gray-600">
                  <strong>วารสาร:</strong> {article.journal} ({article.year})
                </p>
                {article.doi && (
                  <p className="text-sm text-gray-600">
                    <strong>DOI:</strong> <span className="text-blue-600">{article.doi}</span>
                  </p>
                )}
              </div>
              
              <div className="inline-block bg-blue-100 text-blue-800 px-2 py-0.5 rounded text-xs mb-3">
                {article.category}
              </div>
              
              <p className="text-sm text-gray-700 leading-relaxed">
                <strong>บทคัดย่อ:</strong> {article.abstract}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredArticles.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          ไม่พบบทความในปีที่เลือก
        </div>
      )}
    </div>
  );
};

export default AcademicArticles;
