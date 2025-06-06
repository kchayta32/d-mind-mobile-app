
import { useState, useEffect } from 'react';

export interface DroughtProvinceData {
  name: string;
  riskLevel: number; // 0-100
  coordinates: { lat: number; lng: number };
  color: string;
  area: number; // affected area in hectares
  population: number; // affected population
}

export interface DroughtStats {
  totalAffectedArea: number;
  totalAffectedPopulation: number;
  averageRiskLevel: number;
  highRiskProvinces: number;
  provinces: DroughtProvinceData[];
  severityDistribution: {
    low: number;
    moderate: number;
    high: number;
    severe: number;
  };
}

const getRiskColor = (riskLevel: number): string => {
  if (riskLevel >= 80) return '#dc2626'; // severe - dark red
  if (riskLevel >= 60) return '#ea580c'; // high - orange-red
  if (riskLevel >= 40) return '#eab308'; // moderate - yellow
  if (riskLevel >= 20) return '#65a30d'; // low-moderate - light green
  return '#22c55e'; // very low - green
};

export const useDroughtData = () => {
  const [stats, setStats] = useState<DroughtStats>({
    totalAffectedArea: 0,
    totalAffectedPopulation: 0,
    averageRiskLevel: 0,
    highRiskProvinces: 0,
    provinces: [],
    severityDistribution: {
      low: 0,
      moderate: 0,
      high: 0,
      severe: 0
    }
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading and generate mock data
    setIsLoading(true);
    
    setTimeout(() => {
      // Mock drought data for Thai provinces
      const mockProvinces: DroughtProvinceData[] = [
        { name: 'กรุงเทพมหานคร', riskLevel: 25, coordinates: { lat: 13.7563, lng: 100.5018 }, color: getRiskColor(25), area: 1500, population: 50000 },
        { name: 'เชียงใหม่', riskLevel: 65, coordinates: { lat: 18.7883, lng: 98.9853 }, color: getRiskColor(65), area: 12000, population: 150000 },
        { name: 'เชียงราย', riskLevel: 70, coordinates: { lat: 19.9105, lng: 99.8406 }, color: getRiskColor(70), area: 8500, population: 90000 },
        { name: 'ขอนแก่น', riskLevel: 55, coordinates: { lat: 16.4419, lng: 102.8359 }, color: getRiskColor(55), area: 7800, population: 120000 },
        { name: 'อุดรธานี', riskLevel: 60, coordinates: { lat: 17.4138, lng: 102.7877 }, color: getRiskColor(60), area: 6900, population: 85000 },
        { name: 'นครราชสีมา', riskLevel: 45, coordinates: { lat: 14.9799, lng: 102.0977 }, color: getRiskColor(45), area: 9200, population: 110000 },
        { name: 'บุรีรัมย์', riskLevel: 75, coordinates: { lat: 14.9930, lng: 103.1029 }, color: getRiskColor(75), area: 8100, population: 95000 },
        { name: 'สุรินทร์', riskLevel: 80, coordinates: { lat: 14.8818, lng: 103.4937 }, color: getRiskColor(80), area: 7600, population: 88000 },
        { name: 'ศีสะเกษ', riskLevel: 85, coordinates: { lat: 15.1186, lng: 104.3220 }, color: getRiskColor(85), area: 6800, population: 75000 },
        { name: 'อุบลราชธานี', riskLevel: 72, coordinates: { lat: 15.2448, lng: 104.8471 }, color: getRiskColor(72), area: 8900, population: 102000 },
        { name: 'ลพบุรี', riskLevel: 58, coordinates: { lat: 14.7995, lng: 100.6533 }, color: getRiskColor(58), area: 5400, population: 70000 },
        { name: 'สระบุรี', riskLevel: 42, coordinates: { lat: 14.5289, lng: 100.9105 }, color: getRiskColor(42), area: 4200, population: 55000 },
        { name: 'สุพรรณบุรี', riskLevel: 38, coordinates: { lat: 14.4745, lng: 100.1376 }, color: getRiskColor(38), area: 3800, population: 48000 },
        { name: 'กาญจนบุรี', riskLevel: 35, coordinates: { lat: 14.0227, lng: 99.5329 }, color: getRiskColor(35), area: 4500, population: 52000 },
        { name: 'นครสวรรค์', riskLevel: 48, coordinates: { lat: 15.7047, lng: 100.1372 }, color: getRiskColor(48), area: 5800, population: 68000 },
        { name: 'พิษณุโลก', riskLevel: 52, coordinates: { lat: 16.8211, lng: 100.2659 }, color: getRiskColor(52), area: 6200, population: 78000 },
        { name: 'เพชรบูรณ์', riskLevel: 63, coordinates: { lat: 16.4193, lng: 101.1609 }, color: getRiskColor(63), area: 7100, population: 82000 },
        { name: 'ชัยภูมิ', riskLevel: 67, coordinates: { lat: 15.8070, lng: 102.0322 }, color: getRiskColor(67), area: 7800, population: 89000 },
        { name: 'มหาสารคาม', riskLevel: 61, coordinates: { lat: 16.1845, lng: 103.3038 }, color: getRiskColor(61), area: 6500, population: 76000 },
        { name: 'ร้อยเอ็ด', riskLevel: 69, coordinates: { lat: 16.0544, lng: 103.6528 }, color: getRiskColor(69), area: 7200, population: 84000 },
        { name: 'กาฬสินธุ์', riskLevel: 73, coordinates: { lat: 16.4322, lng: 103.5057 }, color: getRiskColor(73), area: 6900, population: 79000 },
        { name: 'สกลนคร', riskLevel: 59, coordinates: { lat: 17.1547, lng: 104.1359 }, color: getRiskColor(59), area: 6100, population: 71000 },
        { name: 'นครพนม', riskLevel: 54, coordinates: { lat: 17.4205, lng: 104.7784 }, color: getRiskColor(54), area: 5200, population: 62000 },
        { name: 'มุกดาหาร', riskLevel: 56, coordinates: { lat: 16.5426, lng: 104.7234 }, color: getRiskColor(56), area: 4800, population: 58000 },
        { name: 'ลำพูน', riskLevel: 41, coordinates: { lat: 18.5744, lng: 99.0216 }, color: getRiskColor(41), area: 3200, population: 42000 },
        { name: 'ลำปาง', riskLevel: 46, coordinates: { lat: 18.2816, lng: 99.4916 }, color: getRiskColor(46), area: 4100, population: 51000 },
        { name: 'แพร่', riskLevel: 53, coordinates: { lat: 18.1459, lng: 100.1399 }, color: getRiskColor(53), area: 4900, population: 56000 },
        { name: 'น่าน', riskLevel: 64, coordinates: { lat: 18.7756, lng: 100.7730 }, color: getRiskColor(64), area: 5600, population: 64000 },
        { name: 'พะเยา', riskLevel: 57, coordinates: { lat: 19.1921, lng: 99.8989 }, color: getRiskColor(57), area: 4700, population: 54000 },
        { name: 'เลย', riskLevel: 50, coordinates: { lat: 17.4860, lng: 101.7223 }, color: getRiskColor(50), area: 5100, population: 59000 },
        { name: 'หนองคาย', riskLevel: 62, coordinates: { lat: 17.8782, lng: 102.7412 }, color: getRiskColor(62), area: 5800, population: 67000 },
        { name: 'บึงกาฬ', riskLevel: 66, coordinates: { lat: 18.3609, lng: 103.6462 }, color: getRiskColor(66), area: 5300, population: 61000 },
        { name: 'หนองบัวลำภู', riskLevel: 71, coordinates: { lat: 17.2042, lng: 102.4280 }, color: getRiskColor(71), area: 4600, population: 53000 },
        { name: 'ตาก', riskLevel: 44, coordinates: { lat: 16.8684, lng: 99.1260 }, color: getRiskColor(44), area: 6800, population: 72000 },
        { name: 'สุโขทัย', riskLevel: 49, coordinates: { lat: 17.0077, lng: 99.8236 }, color: getRiskColor(49), area: 5900, population: 65000 },
        { name: 'กำแพงเพชร', riskLevel: 51, coordinates: { lat: 16.4827, lng: 99.5226 }, color: getRiskColor(51), area: 5500, population: 63000 },
        { name: 'ราชบุรี', riskLevel: 33, coordinates: { lat: 13.5282, lng: 99.8130 }, color: getRiskColor(33), area: 3400, population: 44000 },
        { name: 'เพชรบุรี', riskLevel: 36, coordinates: { lat: 13.1110, lng: 99.9398 }, color: getRiskColor(36), area: 3100, population: 41000 },
        { name: 'ประจวบคีรีขันธ์', riskLevel: 39, coordinates: { lat: 11.8127, lng: 99.7971 }, color: getRiskColor(39), area: 2800, population: 38000 },
        { name: 'ชุมพร', riskLevel: 29, coordinates: { lat: 10.4930, lng: 99.1797 }, color: getRiskColor(29), area: 2200, population: 32000 },
        { name: 'ระนอง', riskLevel: 22, coordinates: { lat: 9.9558, lng: 98.6351 }, color: getRiskColor(22), area: 1800, population: 25000 },
        { name: 'สุราษฎร์ธานี', riskLevel: 27, coordinates: { lat: 9.1382, lng: 99.3215 }, color: getRiskColor(27), area: 2600, population: 35000 },
        { name: 'นครศรีธรรมราช', riskLevel: 31, coordinates: { lat: 8.4304, lng: 99.9631 }, color: getRiskColor(31), area: 2900, population: 39000 },
        { name: 'กระบี่', riskLevel: 24, coordinates: { lat: 8.0863, lng: 98.9063 }, color: getRiskColor(24), area: 1900, population: 28000 },
        { name: 'พังงา', riskLevel: 21, coordinates: { lat: 8.4504, lng: 98.5857 }, color: getRiskColor(21), area: 1600, population: 24000 },
        { name: 'ภูเก็ต', riskLevel: 18, coordinates: { lat: 7.8804, lng: 98.3923 }, color: getRiskColor(18), area: 800, population: 15000 },
        { name: 'ตรัง', riskLevel: 26, coordinates: { lat: 7.5563, lng: 99.6114 }, color: getRiskColor(26), area: 2100, population: 31000 },
        { name: 'สตูล', riskLevel: 23, coordinates: { lat: 6.6238, lng: 99.7317 }, color: getRiskColor(23), area: 1700, population: 26000 },
        { name: 'สงขลา', riskLevel: 28, coordinates: { lat: 7.0067, lng: 100.4925 }, color: getRiskColor(28), area: 2400, population: 34000 },
        { name: 'ปัตตานี', riskLevel: 32, coordinates: { lat: 6.8693, lng: 101.2502 }, color: getRiskColor(32), area: 2200, population: 33000 },
        { name: 'ยะลา', riskLevel: 30, coordinates: { lat: 6.5410, lng: 101.2802 }, color: getRiskColor(30), area: 2000, population: 30000 },
        { name: 'นราธิวาส', riskLevel: 34, coordinates: { lat: 6.4254, lng: 101.8253 }, color: getRiskColor(34), area: 2300, population: 32000 },
        { name: 'ฉะเชิงเทรา', riskLevel: 37, coordinates: { lat: 13.6904, lng: 101.0779 }, color: getRiskColor(37), area: 3300, population: 43000 },
        { name: 'ปราจีนบุรี', riskLevel: 40, coordinates: { lat: 14.0507, lng: 101.3740 }, color: getRiskColor(40), area: 3600, population: 46000 },
        { name: 'นครนายก', riskLevel: 35, coordinates: { lat: 14.2069, lng: 101.2130 }, color: getRiskColor(35), area: 2800, population: 37000 },
        { name: 'สระแก้ว', riskLevel: 43, coordinates: { lat: 13.8248, lng: 102.0645 }, color: getRiskColor(43), area: 4200, population: 49000 },
        { name: 'ชลบุรี', riskLevel: 41, coordinates: { lat: 13.3611, lng: 100.9847 }, color: getRiskColor(41), area: 4800, population: 58000 },
        { name: 'ระยอง', riskLevel: 38, coordinates: { lat: 12.6868, lng: 101.2228 }, color: getRiskColor(38), area: 3900, population: 47000 },
        { name: 'จันทบุรี', riskLevel: 42, coordinates: { lat: 12.6103, lng: 102.1038 }, color: getRiskColor(42), area: 4100, population: 50000 },
        { name: 'ตราด', riskLevel: 39, coordinates: { lat: 12.2436, lng: 102.5156 }, color: getRiskColor(39), area: 3500, population: 45000 },
        { name: 'นนทบุรี', riskLevel: 26, coordinates: { lat: 13.8621, lng: 100.5144 }, color: getRiskColor(26), area: 1200, population: 22000 },
        { name: 'ปทุมธานี', riskLevel: 28, coordinates: { lat: 14.0208, lng: 100.5250 }, color: getRiskColor(28), area: 1400, population: 26000 },
        { name: 'พระนครศรีอยุธยา', riskLevel: 45, coordinates: { lat: 14.3692, lng: 100.5877 }, color: getRiskColor(45), area: 4600, population: 55000 },
        { name: 'อ่างทอง', riskLevel: 47, coordinates: { lat: 14.5896, lng: 100.4552 }, color: getRiskColor(47), area: 4300, population: 52000 },
        { name: 'ชัยนาท', riskLevel: 49, coordinates: { lat: 15.1852, lng: 100.1250 }, color: getRiskColor(49), area: 4700, population: 56000 },
        { name: 'สิงห์บุรี', riskLevel: 44, coordinates: { lat: 14.8936, lng: 100.3967 }, color: getRiskColor(44), area: 3800, population: 47000 },
        { name: 'อุทัยธานี', riskLevel: 54, coordinates: { lat: 15.3794, lng: 100.0244 }, color: getRiskColor(54), area: 5400, population: 61000 },
        { name: 'เพชรบูรณ์', riskLevel: 63, coordinates: { lat: 16.4193, lng: 101.1609 }, color: getRiskColor(63), area: 7100, population: 82000 },
        { name: 'ยโสธร', riskLevel: 74, coordinates: { lat: 15.7921, lng: 104.1456 }, color: getRiskColor(74), area: 6600, population: 77000 },
        { name: 'อำนาจเจริญ', rinkLevel: 76, coordinates: { lat: 15.8651, lng: 104.6226 }, color: getRiskColor(76), area: 5900, population: 69000 },
        { name: 'พัทลุง', riskLevel: 25, coordinates: { lat: 7.6161, lng: 100.0810 }, color: getRiskColor(25), area: 2000, population: 29000 }
      ];

      const totalAffectedArea = mockProvinces.reduce((sum, p) => sum + p.area, 0);
      const totalAffectedPopulation = mockProvinces.reduce((sum, p) => sum + p.population, 0);
      const averageRiskLevel = Math.round(mockProvinces.reduce((sum, p) => sum + p.riskLevel, 0) / mockProvinces.length);
      const highRiskProvinces = mockProvinces.filter(p => p.riskLevel >= 60).length;

      const severityDistribution = {
        low: mockProvinces.filter(p => p.riskLevel < 40).length,
        moderate: mockProvinces.filter(p => p.riskLevel >= 40 && p.riskLevel < 60).length,
        high: mockProvinces.filter(p => p.riskLevel >= 60 && p.riskLevel < 80).length,
        severe: mockProvinces.filter(p => p.riskLevel >= 80).length
      };

      setStats({
        totalAffectedArea,
        totalAffectedPopulation,
        averageRiskLevel,
        highRiskProvinces,
        provinces: mockProvinces,
        severityDistribution
      });

      setIsLoading(false);
    }, 1000);
  }, []);

  return { stats, isLoading };
};
