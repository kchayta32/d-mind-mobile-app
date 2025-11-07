import { useState, useEffect } from 'react';

export interface SinkholeData {
  id: string;
  latitude: number;
  longitude: number;
  title: string;
  location: string;
  date: string;
  severity: 'high' | 'medium' | 'low';
  description: string;
  mainImage: string;
  additionalImages: string[];
  estimatedSize: string;
  cause: string;
  status: string;
}

export interface SinkholeStats {
  totalIncidents: number;
  highSeverity: number;
  averageSize: string;
  lastIncident: string;
  affectedAreas: number;
}

export const useSinkholeData = () => {
  const [sinkholes, setSinkholes] = useState<SinkholeData[]>([]);
  const [stats, setStats] = useState<SinkholeStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSinkholeData = async () => {
      try {
        setIsLoading(true);
        
        // ข้อมูลจำลองจากเหตุการณ์จริงในดุสิต กทม. ญี่ปุ่น และแม่ฮ่องสอน
        const mockData: SinkholeData[] = [
          {
            id: 'sinkhole-mae-gopi-001',
            latitude: 18.1978,
            longitude: 98.4419,
            title: 'ดินถล่มบ้านแม่โกปี่',
            location: 'บ้านแม่โกปี่ ต.แม่ยวมน้อย อ.ขุนยวม จ.แม่ฮ่องสอน',
            date: '14 สิงหาคม 2567',
            severity: 'high',
            description: 'น้ำป่าไหลหลากดินโคลนถล่มเร่งช่วย 400 ชีวิตถูกตัดขาด เกิดเหตุน้ำป่าไหลหลากเข้าท่วมบ้านแม่โกปี่ มีรายงานหญิงอายุ 65 ปีเสียชีวิต 1 คน ถนนระยะ 17 กิโลเมตรถูกตัดขาด ชาวบ้านกว่า 400 คนต้องการอาหารน้ำดื่ม ไม่มีไฟฟ้าและสัญญาณโทรศัพท์ หน่วยเฉพาะกิจสิงหนาทเข้าช่วยเหลือ',
            mainImage: 'https://news.thaipbs.or.th/media/TSNBg3wSBdng7ijMhT0vcKuBqwYR05PK7tOJNt5fpQb.jpg',
            additionalImages: [
              'https://news.thaipbs.or.th/media/TSNBg3wSBdng7ijMhT0vcKuBqwYR05Qt9mrM9hfBchj.jpg',
              'https://news.thaipbs.or.th/media/TSNBg3wSBdng7ijMhT0vcKuBqwYR05aMLub0pY8eZtR.jpg',
              'https://news.thaipbs.or.th/media/TSNBg3wSBdng7ijMhT0vcKuBqwYR05XTJUZpWdGlbGO.jpg'
            ],
            estimatedSize: 'พื้นที่ได้รับผลกระทบ 17 กิโลเมตร',
            cause: 'น้ำป่าไหลหลากและดินโคลนถล่มจากฝนตกหนักต่อเนื่อง',
            status: 'ฉุกเฉิน - 400 คนถูกตัดขาด กำลังดำเนินการช่วยเหลือ'
          },
          {
            id: 'sinkhole-dusit-001',
            latitude: 13.7878,
            longitude: 100.5150,
            title: 'ถนนทรุดเขตดุสิต',
            location: 'ถนนสามเสน เขตดุสิต กรุงเทพมหานคร',
            date: '24 กันยายน 2568',
            severity: 'high',
            description: 'เกิดเหตุแผ่นดินยุบทำให้ถนนทรุดตัวลงเป็นหลุมขนาดใหญ่ คาดการณ์ว่าดินหายไปกว่าพันลูกบาศก์เมตร อาจเป็นผลจากการขุดเจาะใต้ดินหรือระบบท่อประปาเก่า',
            mainImage: '/lovable-uploads/sinkhole-dusit-01.webp',
            additionalImages: [
              '/lovable-uploads/sinkhole-dusit-02.webp',
              '/lovable-uploads/sinkhole-dusit-03.webp'
            ],
            estimatedSize: '10 x 15 เมตร ลึก 8 เมตร',
            cause: 'การขุดเจาะใต้ดินและระบบสาธารณูปโภคเก่า',
            status: 'อยู่ระหว่างการซ่อมแซม'
          },
          {
            id: 'sinkhole-japan-001',
            latitude: 35.8229,
            longitude: 139.8386,
            title: 'หลุมยุบในเมืองยาชิโอะ ประเทศญี่ปุ่น',
            location: 'เมืองยาชิโอะ จังหวัดไซตามะ ประเทศญี่ปุ่น',
            date: '28 มกราคม 2568',
            severity: 'high',
            description: 'เกิดหลุมยุบกลางถนนที่มีการจราจรพลุกพล่าน มีความกว้างราว 10 เมตร และลึกประมาณ 5-6 เมตร ทำให้รถบรรทุกตกลงไปและคนขับติดอยู่ในรถ เจ้าหน้าที่ดับเพลิงต้องใช้เครนขนาดใหญ่ในการช่วยเหลือ',
            mainImage: '/lovable-uploads/sinkhole-japan-01.webp',
            additionalImages: [],
            estimatedSize: '10 เมตร กว้าง, 5-6 เมตร ลึก',
            cause: 'ท่อระบายน้ำใต้ดินผุพังและแตก ประกอบกับพื้นที่เคยเป็นแหล่งน้ำชุ่มน้ำ',
            status: 'อยู่ระหว่างการช่วยเหลือและซ่อมแซม'
          }
        ];

        const mockStats: SinkholeStats = {
          totalIncidents: mockData.length,
          highSeverity: mockData.filter(s => s.severity === 'high').length,
          averageSize: '10 x 8 เมตร',
          lastIncident: mockData[0]?.date || 'ไม่มีข้อมูล',
          affectedAreas: mockData.length
        };

        // จำลองการ delay API
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        setSinkholes(mockData);
        setStats(mockStats);
        setError(null);
      } catch (err) {
        setError('ไม่สามารถโหลดข้อมูลแผ่นดินยุบได้');
        console.error('Error fetching sinkhole data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSinkholeData();
  }, []);

  const refetch = async () => {
    setIsLoading(true);
    // ในโปรเจ็คจริงจะเรียก API ใหม่
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  };

  return {
    sinkholes,
    stats,
    isLoading,
    error,
    refetch
  };
};