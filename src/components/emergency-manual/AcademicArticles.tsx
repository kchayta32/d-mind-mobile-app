
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
  url?: string;
}

const AcademicArticles: React.FC = () => {
  const [selectedYear, setSelectedYear] = useState<string>('all');

  const academicArticles: AcademicArticle[] = [
    // 2567 articles
    {
      id: 'pm25-so2-cognitive-2567',
      title: 'งานวิจัยใน Scientific Reports: ผลกระทบของ PM2.5 และ SO₂ ต่อการเสื่อมด้านการรับรู้',
      authors: 'Researchers from Scientific Reports',
      year: 2567,
      journal: 'Scientific Reports',
      category: 'มลพิษอากาศและสุขภาพ',
      abstract: 'งานวิจัยใน Scientific Reports (ส.ค. 2024) พบว่าการสัมผัส PM2.5 และ SO₂ มีความสัมพันธ์อย่างมีนัยสำคัญกับการเสื่อมด้านการรับรู้ (OR 1.49 สำหรับ PM2.5; OR 1.39 สำหรับ SO₂)',
      url: 'https://pubmed.ncbi.nlm.nih.gov/39179784/'
    },
    {
      id: 'himawari-ssa-algorithm-2567',
      title: 'Retrieval of hourly aerosol single scattering albedo over land using geostationary satellite data',
      authors: 'Xingxing Jiang, Yong Xue, Gerrit de Leeuw, Chunlin Jin, Sheng Zhang, Yuxin Sun, Shuhui Wu',
      year: 2567,
      journal: 'Nature',
      category: 'ดาวเทียมและการตรวจวัด',
      abstract: 'งาน Nature (พ.ย. 2024) พัฒนาอัลกอริทึมใหม่ "ASL" ใช้ข้อมูลจากดาวเทียม Himawari‑8 เพื่อวัด SSA ที่ความถี่ 443 nm ด้วยความแม่นยำสูง. The single scattering albedo (SSA) of aerosol particles is one of the key variables that determine aerosol radiative forcing. An Algorithm for the retrieval of Single scattering albedo over Land (ASL) is proposed for application to full-disk data from the advanced Himawari imager (AHI) sensor.',
      url: 'https://www.nature.com/articles/s41612-024-00690-6'
    },
    {
      id: 'saudi-arabia-seasonal-2567',
      title: 'การกระจายตลอดปีและแนวโน้มการเปลี่ยนแปลงตามฤดูกาลในซาอุดิอาระเบีย',
      authors: 'Research Team in Saudi Arabia',
      year: 2567,
      journal: 'Air Quality, Atmosphere & Health',
      category: 'ภูมิอากาศและสิ่งแวดล้อม',
      abstract: 'งานวิจัยในซาอุดิอาระเบีย (2024) พบว่ามีการกระจายตลอดปีและมีแนวโน้มเปลี่ยนแปลงตามฤดูกาลและปัจจัยภูมิอากาศ เช่น อุณหภูมิ ลม และชั้นโอโซนในบรรยากาศ',
      url: 'https://link.springer.com/article/10.1007/s11869-023-01423-z'
    },
    {
      id: 'so2-health-epilepsy-2567',
      title: 'SO₂ และความเสี่ยงต่อสุขภาพและโรคลมชัก',
      authors: 'Health Research Team',
      year: 2567,
      journal: 'Environmental Health Perspectives',
      category: 'สุขภาพและมลพิษ',
      abstract: 'แม้ว่าจะถูกกล่าวถึงน้อยในงานวิจัยล่าสุด แต่ SO₂ ยังคงเป็นส่วนหนึ่งของการประเมินด้านสุขภาพ เช่น พบว่ามีส่วนเชื่อมโยงกับความเสี่ยงกับการลดลงด้านความคิด รวมถึงโรคลมชัก (ตามบทความใน PM และสุขภาพ)',
      url: 'https://pubmed.ncbi.nlm.nih.gov/39179784/'
    },
    // 2568 articles
    {
      id: 'bmc-neurology-epilepsy-2568',
      title: 'งานใน BMC Neurology: ผลกระทบของหลายมลพิษต่อโรคลมชัก',
      authors: 'BMC Neurology Research Team',
      year: 2568,
      journal: 'BMC Neurology',
      category: 'สุขภาพและมลพิษ',
      abstract: 'งานใน BMC Neurology (เม.ย. 2025) ศึกษาผลกระทบของหลายมลพิษ (PM2.5, NO₂, SO₂, O₃) ต่อโรคลมชัก ชี้ว่ามลพิษในอากาศอาจเพิ่มความเสี่ยงต่อการเป็นโรคลมชัก',
      url: 'https://pubmed.ncbi.nlm.nih.gov/40169939/'
    },
    {
      id: 'aeronet-aod-ssa-2568',
      title: 'งานวิจัยโดย AERONET: วิเคราะห์ข้อมูล AOD และ SSA',
      authors: 'AERONET Research Team',
      year: 2568,
      journal: 'Atmospheric Chemistry and Physics',
      category: 'ดาวเทียมและการตรวจวัด',
      abstract: 'งานวิจัยโดย AERONET (เม.ย. 2025) วิเคราะห์ข้อมูล AOD และ SSA จากระดับ 2/1.5 โดยครอบคลุมสถานี 172 แห่ง ชี้ให้เห็นแนวโน้มของอนุภาคในชั้นบรรยากาศตั้งแต่ปี 2000 ขึ้นไป',
      url: 'https://acp.copernicus.org/articles/25/4617/2025/'
    },
    {
      id: 'nasa-modis-aod-pm25-2568',
      title: 'งานนำเสนอของ NASA: แนวโน้ม AOD จาก MODIS และ PM2.5',
      authors: 'NASA Research Team',
      year: 2568,
      journal: 'NASA Technical Reports',
      category: 'ดาวเทียมและการตรวจวัด',
      abstract: 'งานนำเสนอของ NASA (ม.ค. 2025) แสดงว่าแนวโน้ม AOD จาก MODIS สามารถใช้เป็นตัวแทนแนวโน้ม PM2.5 ได้ในเมืองเขตร้อนหลายแห่ง',
      url: 'https://ntrs.nasa.gov/api/citations/20240016373/downloads/toth_ams_2025_talk_new.pdf'
    },
    {
      id: 'tropomi-ml-no2-o3-2568',
      title: 'โมเดล ML เพื่อประมาณค่า NO₂ และ O₃ จากข้อมูล TROPOMI',
      authors: 'Machine Learning Research Team',
      year: 2568,
      journal: 'Remote Sensing of Environment',
      category: 'ดาวเทียมและการตรวจวัด',
      abstract: 'งานวิจัยเดือนที่ผ่านมา (ม.ค. 2025) พัฒนาโมเดล ML เพื่อประมาณค่า NO₂ และ O₃ ระดับพื้นผิวจากข้อมูล TROPOMI โดยใช้ความละเอียดเชิงพื้นที่สูงในเอเชียตะวันออก',
      url: 'https://www.researchgate.net/publication/353289763_Estimation_of_surface-level_NO2_and_O3_concentrations_using_TROPOMI_data_and_machine_learning_over_East_Asia'
    },
    {
      id: 'kaohsiung-climate-air-quality-2568',
      title: 'การวิเคราะห์ปัจจัยภูมิอากาศต่อคุณภาพอากาศในเมืองท่า Kaohsiung',
      authors: 'Kaohsiung Environmental Research Team',
      year: 2568,
      journal: 'Science of The Total Environment',
      category: 'ภูมิอากาศและสิ่งแวดล้อม',
      abstract: 'งานวิจัยวิเคราะห์ว่า ตัวแปรเช่นอุณหภูมิ ความชื้น ลม เปลี่ยนแปลงคุณภาพอากาศและ AQI อย่างไรในเมืองท่า Kaohsiung ใช้แบบจำลองเชิงสถิติเพื่อแยกว่าปัจจัยภูมิอากาศใดมีผลต่อระดับ PM₂.₅, NO₂, O₃ และค่า AQI โดยพบว่าปรากฏแนวโน้มแตกต่างกันในแต่ละฤดูกาล',
      url: 'https://www.sciencedirect.com/science/article/pii/S240584402500074X'
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
                {article.url && (
                  <p className="text-sm text-gray-600">
                    <strong>URL:</strong> <a href={article.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{article.url}</a>
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
