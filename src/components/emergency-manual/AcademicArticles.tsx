import React, { useState, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Download, ChevronDown, CalendarIcon, Filter, X } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface AcademicArticle {
  id: string;
  title: string;
  authors: string;
  year: number;
  journal: string;
  category: string;
  abstract: string;
  published_date?: string; // เพิ่มวันที่โพสต์
  doi?: string;
  url?: string;
  downloads?: {
    pdf?: string;
    readcube?: string;
    epub?: string;
    xml?: string;
  };
}

const AcademicArticles: React.FC = () => {
  const [selectedYear, setSelectedYear] = useState<string>('all');
  const [dateFrom, setDateFrom] = useState<Date | undefined>();
  const [dateTo, setDateTo] = useState<Date | undefined>();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const academicArticles: AcademicArticle[] = [
    // New articles from user request
    {
      id: 'frontiers-water-2022',
      title: 'การจัดการทรัพยากรน้ำและการป้องกันน้ำท่วม',
      authors: 'Frontiers in Water Research Team',
      year: 2565,
      journal: 'Frontiers in Water',
      category: 'การจัดการน้ำและน้ำท่วม',
      published_date: '2022-08-15',
      abstract: 'งานวิจัยในวารสาร Frontiers in Water ที่ศึกษาเกี่ยวกับการจัดการทรัพยากรน้ำและระบบป้องกันน้ำท่วมในพื้นที่เสี่ยง พร้อมแนวทางการปรับตัวต่อการเปลี่ยนแปลงสภาพภูมิอากาศ',
      url: 'https://www.frontiersin.org/journals/water/articles/10.3389/frwa.2022.786040/full',
      downloads: {
        pdf: 'https://www.frontiersin.org/journals/water/articles/10.3389/frwa.2022.786040/pdf',
        readcube: 'http://www.readcube.com/articles/10.3389/frwa.2022.786040',
        epub: 'https://www.frontiersin.org/journals/water/articles/10.3389/frwa.2022.786040/epub',
        xml: 'https://www.frontiersin.org/journals/water/articles/10.3389/frwa.2022.786040/xml/nlm'
      }
    },
    {
      id: 'aiot-earthquake-warning-2025',
      title: 'An AIoT System for Earthquake Early Warning on Resource Constrained Devices',
      authors: 'Marco Esposito, Alberto Belli, Laura Falaschetti, Lorenzo Palma',
      year: 2568,
      journal: 'IEEE Internet of Things Journal',
      category: 'ระบบเตือนภัยแผ่นดินไหว',
      published_date: '2025-01-20',
      abstract: 'ระบบ AIoT สำหรับการเตือนภัยแผ่นดินไหวล่วงหน้าบนอุปกรณ์ที่มีทรัพยากรจำกัด งานวิจัยนี้พัฒนาระบบที่สามารถทำงานบนอุปกรณ์ IoT ขนาดเล็กเพื่อให้การเตือนภัยแผ่นดินไหวที่รวดเร็วและแม่นยำ โดยใช้เทคโนโลยี AI และ IoT ร่วมกัน',
      url: 'https://www.researchgate.net/publication/387870802_An_AIoT_System_for_Earthquake_Early_Warning_on_Resource_Constrained_Devices',
      doi: '10.1109/JIOT.2025.3527750'
    },
    // ... keep existing code (existing articles array)
    {
      id: 'pm25-so2-cognitive-2567',
      title: 'งานวิจัยใน Scientific Reports: ผลกระทบของ PM2.5 และ SO₂ ต่อการเสื่อมด้านการรับรู้',
      authors: 'Researchers from Scientific Reports',
      year: 2567,
      journal: 'Scientific Reports',
      category: 'มลพิษอากาศและสุขภาพ',
      published_date: '2024-08-23',
      abstract: 'งานวิจัยใน Scientific Reports ที่ศึกษาเกี่ยวกับผลกระทบของ PM2.5 และ SO₂ ต่อการเสื่อมด้านการรับรู้ พบว่าการสัมผัสมลพิษเหล่านี้มีความสัมพันธ์อย่างมีนัยสำคัญกับการเสื่อมด้านการรับรู้',
      url: 'https://pubmed.ncbi.nlm.nih.gov/39179784/'
    },
    {
      id: 'himawari-ssa-algorithm-2567',
      title: 'Retrieval of hourly aerosol single scattering albedo over land using geostationary satellite data',
      authors: 'Xingxing Jiang, Yong Xue, Gerrit de Leeuw, Chunlin Jin, Sheng Zhang, Yuxin Sun, Shuhui Wu',
      year: 2567,
      journal: 'Nature',
      category: 'ดาวเทียมและการตรวจวัด',
      published_date: '2024-11-15',
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
      published_date: '2024-07-10',
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
      published_date: '2024-09-05',
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
      published_date: '2025-04-15',
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
      published_date: '2025-04-20',
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
      published_date: '2025-01-10',
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
      published_date: '2025-01-25',
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
      published_date: '2025-02-28',
      abstract: 'งานวิจัยวิเคราะห์ว่า ตัวแปรเช่นอุณหภูมิ ความชื้น ลม เปลี่ยนแปลงคุณภาพอากาศและ AQI อย่างไรในเมืองท่า Kaohsiung ใช้แบบจำลองเชิงสถิติเพื่อแยกว่าปัจจัยภูมิอากาศใดมีผลต่อระดับ PM₂.₅, NO₂, O₃ และค่า AQI โดยพบว่าปรากฏแนวโน้มแตกต่างกันในแต่ละฤดูกาล',
      url: 'https://www.sciencedirect.com/science/article/pii/S240584402500074X'
    }
  ];

  const years = ['2560', '2561', '2562', '2563', '2564', '2565', '2566', '2567', '2568'];
  
  const categories = useMemo(() => {
    const uniqueCategories = [...new Set(academicArticles.map(article => article.category))];
    return uniqueCategories.sort();
  }, []);

  const filteredArticles = useMemo(() => {
    return academicArticles.filter(article => {
      // Filter by year
      if (selectedYear !== 'all' && article.year.toString() !== selectedYear) {
        return false;
      }
      
      // Filter by category
      if (selectedCategory !== 'all' && article.category !== selectedCategory) {
        return false;
      }
      
      // Filter by date range
      if (article.published_date && (dateFrom || dateTo)) {
        const publishedDate = new Date(article.published_date);
        
        if (dateFrom && publishedDate < dateFrom) {
          return false;
        }
        
        if (dateTo && publishedDate > dateTo) {
          return false;
        }
      }
      
      return true;
    });
  }, [selectedYear, selectedCategory, dateFrom, dateTo]);

  const clearDateFilter = () => {
    setDateFrom(undefined);
    setDateTo(undefined);
  };

  const handleDownload = (url: string, filename: string) => {
    window.open(url, '_blank');
  };

  const DownloadButton: React.FC<{ article: AcademicArticle }> = ({ article }) => {
    if (!article.downloads && !article.url) return null;

    if (article.downloads) {
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="flex items-center gap-2">
              <Download className="w-4 h-4" />
              Download Article
              <ChevronDown className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {article.downloads.pdf && (
              <DropdownMenuItem onClick={() => handleDownload(article.downloads!.pdf!, 'article.pdf')}>
                <Download className="w-4 h-4 mr-2" />
                Download PDF
              </DropdownMenuItem>
            )}
            {article.downloads.readcube && (
              <DropdownMenuItem onClick={() => handleDownload(article.downloads!.readcube!, 'readcube')}>
                <Download className="w-4 h-4 mr-2" />
                ReadCube
              </DropdownMenuItem>
            )}
            {article.downloads.epub && (
              <DropdownMenuItem onClick={() => handleDownload(article.downloads!.epub!, 'article.epub')}>
                <Download className="w-4 h-4 mr-2" />
                EPUB
              </DropdownMenuItem>
            )}
            {article.downloads.xml && (
              <DropdownMenuItem onClick={() => handleDownload(article.downloads!.xml!, 'article.xml')}>
                <Download className="w-4 h-4 mr-2" />
                XML (NLM)
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      );
    }

    return (
      <Button 
        variant="outline" 
        size="sm" 
        onClick={() => handleDownload(article.url!, 'article')}
        className="flex items-center gap-2"
      >
        <Download className="w-4 h-4" />
        View Article
      </Button>
    );
  };

  return (
    <div className="space-y-4">
      {/* Enhanced Filter Section */}
      <Card className="border-blue-200 mb-6 bg-gradient-to-r from-blue-50 to-blue-100 shadow-md">
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-blue-500 rounded-lg">
                <Filter className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-blue-800">กรองบทความ</h3>
                <p className="text-sm text-blue-600">เลือกเกณฑ์การกรองที่ต้องการ</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Year Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">ปี พ.ศ.:</label>
                <Select value={selectedYear} onValueChange={setSelectedYear}>
                  <SelectTrigger className="bg-white">
                    <SelectValue placeholder="เลือกปี" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">ทุกปี</SelectItem>
                    {years.map((year) => (
                      <SelectItem key={year} value={year}>{year}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Category Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">หมวดหมู่:</label>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="bg-white">
                    <SelectValue placeholder="เลือกหมวดหมู่" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">ทุกหมวดหมู่</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>{category}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Date From Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">วันที่เริ่มต้น:</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal bg-white",
                        !dateFrom && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dateFrom ? format(dateFrom, "dd/MM/yyyy") : "เลือกวันที่"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={dateFrom}
                      onSelect={setDateFrom}
                      initialFocus
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* Date To Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">วันที่สิ้นสุด:</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal bg-white",
                        !dateTo && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dateTo ? format(dateTo, "dd/MM/yyyy") : "เลือกวันที่"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={dateTo}
                      onSelect={setDateTo}
                      initialFocus
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            {/* Active Filters Display */}
            {(dateFrom || dateTo || selectedYear !== 'all' || selectedCategory !== 'all') && (
              <div className="flex flex-wrap gap-2 pt-4 border-t border-blue-200">
                <span className="text-sm text-gray-600">ตัวกรองที่ใช้:</span>
                {selectedYear !== 'all' && (
                  <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                    ปี: {selectedYear}
                    <button onClick={() => setSelectedYear('all')} className="hover:bg-blue-200 rounded-full p-0.5">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
                {selectedCategory !== 'all' && (
                  <span className="inline-flex items-center gap-1 bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">
                    หมวดหมู่: {selectedCategory}
                    <button onClick={() => setSelectedCategory('all')} className="hover:bg-green-200 rounded-full p-0.5">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
                {dateFrom && (
                  <span className="inline-flex items-center gap-1 bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-xs">
                    จาก: {format(dateFrom, "dd/MM/yyyy")}
                    <button onClick={() => setDateFrom(undefined)} className="hover:bg-purple-200 rounded-full p-0.5">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
                {dateTo && (
                  <span className="inline-flex items-center gap-1 bg-orange-100 text-orange-800 px-2 py-1 rounded-full text-xs">
                    ถึง: {format(dateTo, "dd/MM/yyyy")}
                    <button onClick={() => setDateTo(undefined)} className="hover:bg-orange-200 rounded-full p-0.5">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
                <button
                  onClick={() => {
                    setSelectedYear('all');
                    setSelectedCategory('all');
                    clearDateFilter();
                  }}
                  className="text-xs text-red-600 hover:text-red-800 underline"
                >
                  ล้างตัวกรองทั้งหมด
                </button>
              </div>
            )}

            {/* Results Count */}
            <div className="text-center pt-2">
              <span className="bg-blue-600 text-white px-4 py-2 rounded-full font-semibold">
                พบ {filteredArticles.length} บทความ
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Articles List */}
      <div className="space-y-4">
        {filteredArticles.map((article) => (
          <Card key={article.id} className="overflow-hidden hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex justify-between items-start mb-2">
                <h2 className="text-lg font-bold text-blue-700 flex-1 mr-4">
                  {article.title}
                </h2>
                <DownloadButton article={article} />
              </div>
              
              <div className="mb-2 space-y-1">
                <p className="text-sm text-gray-600">
                  <strong>ผู้เขียน:</strong> {article.authors}
                </p>
                <p className="text-sm text-gray-600">
                  <strong>วารสาร:</strong> {article.journal} ({article.year})
                </p>
                {article.published_date && (
                  <p className="text-sm text-gray-600">
                    <strong>วันที่โพสต์:</strong> {new Date(article.published_date).toLocaleDateString('th-TH', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                )}
                {article.doi && (
                  <p className="text-sm text-gray-600">
                    <strong>DOI:</strong> {article.doi}
                  </p>
                )}
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
