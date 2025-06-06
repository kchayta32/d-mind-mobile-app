
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';

export interface DroughtStats {
  nationalAverage: number;
  topProvinces: Array<{
    province: string;
    percentage: number;
    color: string;
  }>;
  provinceData: Array<{
    province: string;
    percentage: number;
    coordinates: [number, number];
    color: string;
  }>;
  lastUpdated: string;
}

export const useDroughtData = () => {
  const [stats, setStats] = useState<DroughtStats>({
    nationalAverage: 41.2,
    topProvinces: [
      { province: 'อำนาจเจริญ', percentage: 53.4, color: '#dc2626' },
      { province: 'สุรินทร์', percentage: 51, color: '#dc2626' },
      { province: 'ยโสธร', percentage: 51, color: '#dc2626' },
      { province: 'พิจิตร', percentage: 50.4, color: '#ea580c' },
      { province: 'อุบลราชธานี', percentage: 49.9, color: '#ea580c' }
    ],
    provinceData: [
      // ภาคตะวันออกเฉียงเหนือ
      { province: 'อำนาจเจริญ', percentage: 53.4, coordinates: [15.8647, 104.6259], color: '#dc2626' },
      { province: 'สุรินทร์', percentage: 51.0, coordinates: [14.8818, 103.4936], color: '#dc2626' },
      { province: 'ยโสธร', percentage: 51.0, coordinates: [15.7920, 104.1459], color: '#dc2626' },
      { province: 'อุบลราชธานี', percentage: 49.9, coordinates: [15.2288, 104.8706], color: '#ea580c' },
      { province: 'ศรีสะเกษ', percentage: 48.7, coordinates: [15.1186, 104.3220], color: '#ea580c' },
      { province: 'บุรีรัมย์', percentage: 47.5, coordinates: [14.9930, 103.1028], color: '#f59e0b' },
      { province: 'ร้อยเอ็ด', percentage: 46.8, coordinates: [16.0544, 103.6530], color: '#f59e0b' },
      { province: 'มหาสารคาม', percentage: 45.2, coordinates: [16.1845, 103.3016], color: '#f59e0b' },
      { province: 'กาฬสินธุ์', percentage: 44.8, coordinates: [16.4322, 103.5056], color: '#f59e0b' },
      { province: 'ขอนแก่น', percentage: 43.6, coordinates: [16.4419, 102.8359], color: '#eab308' },
      
      // ภาคเหนือ
      { province: 'พิจิตร', percentage: 50.4, coordinates: [16.4372, 100.3478], color: '#ea580c' },
      { province: 'อุตรดิตถ์', percentage: 47.1, coordinates: [17.6200, 100.0728], color: '#f59e0b' },
      { province: 'สุโขทัย', percentage: 45.9, coordinates: [17.0078, 99.8236], color: '#f59e0b' },
      { province: 'ตาก', percentage: 44.3, coordinates: [16.8864, 99.1272], color: '#eab308' },
      { province: 'เชียงใหม่', percentage: 42.1, coordinates: [18.7883, 98.9853], color: '#eab308' },
      { province: 'ลำปาง', percentage: 41.8, coordinates: [18.2928, 99.4937], color: '#eab308' },
      { province: 'เชียงราย', percentage: 40.5, coordinates: [19.9105, 99.8406], color: '#84cc16' },
      
      // ภาคกลาง
      { province: 'ลพบุรี', percentage: 42.3, coordinates: [14.7995, 100.6533], color: '#eab308' },
      { province: 'ชัยนาท', percentage: 41.1, coordinates: [15.1852, 100.1266], color: '#eab308' },
      { province: 'สิงห์บุรี', percentage: 39.8, coordinates: [14.8934, 100.3967], color: '#84cc16' },
      { province: 'อ่างทอง', percentage: 38.9, coordinates: [14.5896, 100.4552], color: '#84cc16' },
      { province: 'กรุงเทพมหานคร', percentage: 37.2, coordinates: [13.7563, 100.5018], color: '#22c55e' },
      { province: 'นครปฐม', percentage: 36.8, coordinates: [13.8199, 100.0406], color: '#22c55e' },
      
      // ภาคตะวันออก
      { province: 'สระแก้ว', percentage: 45.2, coordinates: [13.8239, 102.0645], color: '#f59e0b' },
      { province: 'บุรีรัมย์', percentage: 43.8, coordinates: [14.9930, 103.1028], color: '#eab308' },
      { province: 'ชลบุรี', percentage: 39.4, coordinates: [13.3611, 100.9847], color: '#84cc16' },
      { province: 'ระยอง', percentage: 38.1, coordinates: [12.6868, 101.2228], color: '#84cc16' },
      
      // ภาคใต้
      { province: 'ชุมพร', percentage: 38.7, coordinates: [10.4930, 99.1797], color: '#84cc16' },
      { province: 'สุราษฎร์ธานี', percentage: 37.9, coordinates: [9.1382, 99.3215], color: '#22c55e' },
      { province: 'ภูเก็ต', percentage: 35.2, coordinates: [7.8804, 98.3923], color: '#22c55e' },
      { province: 'สงขลา', percentage: 34.8, coordinates: [7.0060, 100.4959], color: '#10b981' },
      { province: 'ยะลา', percentage: 33.5, coordinates: [6.5410, 101.2809], color: '#10b981' },
      
      // ภาคตะวันตก
      { province: 'กาญจนบุรี', percentage: 43.1, coordinates: [14.0227, 99.5328], color: '#eab308' },
      { province: 'เพชรบุรี', percentage: 40.2, coordinates: [13.1110, 99.9398], color: '#84cc16' },
      { province: 'ประจวบคีรีขันธ์', percentage: 38.9, coordinates: [11.8117, 99.7973], color: '#84cc16' },
      { province: 'ราชบุรี', percentage: 37.4, coordinates: [13.5282, 99.8039], color: '#22c55e' }
    ],
    lastUpdated: new Date().toISOString()
  });

  // Simulate real-time data updates
  useEffect(() => {
    const interval = setInterval(() => {
      setStats(prevStats => ({
        ...prevStats,
        nationalAverage: 41.2 + (Math.random() - 0.5) * 2,
        lastUpdated: new Date().toISOString()
      }));
    }, 300000); // Update every 5 minutes

    return () => clearInterval(interval);
  }, []);

  return {
    stats,
    isLoading: false,
    error: null,
    refetch: () => Promise.resolve()
  };
};
