
import { useState, useMemo, useCallback } from 'react';

export interface RiskZone {
    id: string;
    name: string;
    province: string;
    district?: string;
    coordinates: { lat: number; lng: number };
    radius_km: number;
    riskTypes: ('flood' | 'earthquake' | 'wildfire' | 'landslide' | 'storm')[];
    riskLevel: 1 | 2 | 3 | 4 | 5;
    historicalIncidents: number;
    lastIncidentDate?: string;
    description: string;
}

// Mock risk zones for Thailand based on historical data
const MOCK_RISK_ZONES: RiskZone[] = [
    // Flood risk zones
    {
        id: 'risk-1',
        name: 'พื้นที่เสี่ยงน้ำท่วม ลุ่มน้ำเจ้าพระยา',
        province: 'พระนครศรีอยุธยา',
        coordinates: { lat: 14.3532, lng: 100.5687 },
        radius_km: 15,
        riskTypes: ['flood'],
        riskLevel: 5,
        historicalIncidents: 45,
        description: 'พื้นที่ลุ่มน้ำเจ้าพระยาตอนล่าง เสี่ยงน้ำท่วมสูงในช่วงฤดูมรสุม'
    },
    {
        id: 'risk-2',
        name: 'พื้นที่เสี่ยงน้ำท่วม กรุงเทพตะวันออก',
        province: 'กรุงเทพมหานคร',
        district: 'มีนบุรี',
        coordinates: { lat: 13.8087, lng: 100.7293 },
        radius_km: 10,
        riskTypes: ['flood'],
        riskLevel: 4,
        historicalIncidents: 28,
        description: 'พื้นที่ต่ำ เสี่ยงน้ำท่วมจากปริมาณฝนสะสมและระบบระบายน้ำไม่เพียงพอ'
    },
    // Earthquake risk zones
    {
        id: 'risk-3',
        name: 'พื้นที่เสี่ยงแผ่นดินไหว รอยเลื่อนแม่จัน',
        province: 'เชียงราย',
        coordinates: { lat: 20.0653, lng: 99.8953 },
        radius_km: 25,
        riskTypes: ['earthquake'],
        riskLevel: 4,
        historicalIncidents: 12,
        description: 'พื้นที่ใกล้รอยเลื่อนแม่จัน มีประวัติแผ่นดินไหวขนาดกลางบ่อยครั้ง'
    },
    {
        id: 'risk-4',
        name: 'พื้นที่เสี่ยงแผ่นดินไหว รอยเลื่อนเมย',
        province: 'ตาก',
        coordinates: { lat: 16.9015, lng: 98.4415 },
        radius_km: 20,
        riskTypes: ['earthquake'],
        riskLevel: 3,
        historicalIncidents: 8,
        description: 'พื้นที่รอยเลื่อนเมย ติดชายแดนพม่า'
    },
    // Wildfire risk zones
    {
        id: 'risk-5',
        name: 'พื้นที่เสี่ยงไฟป่า ดอยสุเทพ-ดอยปุย',
        province: 'เชียงใหม่',
        coordinates: { lat: 18.8048, lng: 98.9222 },
        radius_km: 15,
        riskTypes: ['wildfire'],
        riskLevel: 5,
        historicalIncidents: 67,
        description: 'พื้นที่ป่าเขา เสี่ยงไฟป่าสูงในช่วงฤดูแล้ง มีนาคม-เมษายน'
    },
    {
        id: 'risk-6',
        name: 'พื้นที่เสี่ยงไฟป่า อุทยานแห่งชาติแม่วงก์',
        province: 'นครสวรรค์',
        coordinates: { lat: 15.7167, lng: 99.4833 },
        radius_km: 20,
        riskTypes: ['wildfire'],
        riskLevel: 4,
        historicalIncidents: 34,
        description: 'พื้นที่ป่าอนุรักษ์ขนาดใหญ่'
    },
    // Landslide risk zones
    {
        id: 'risk-7',
        name: 'พื้นที่เสี่ยงดินถล่ม เพชรบูรณ์',
        province: 'เพชรบูรณ์',
        coordinates: { lat: 16.4193, lng: 101.1545 },
        radius_km: 12,
        riskTypes: ['landslide', 'flood'],
        riskLevel: 4,
        historicalIncidents: 15,
        description: 'พื้นที่ภูเขา ดินอ่อน เสี่ยงดินถล่มในช่วงฝนตกหนัก'
    },
    {
        id: 'risk-8',
        name: 'พื้นที่เสี่ยงดินถล่ม เขาพนมเบญจา',
        province: 'กระบี่',
        coordinates: { lat: 8.2256, lng: 99.1403 },
        radius_km: 10,
        riskTypes: ['landslide'],
        riskLevel: 3,
        historicalIncidents: 9,
        description: 'พื้นที่ภูเขาหินปูน ความลาดชันสูง'
    },
    // Storm risk zones
    {
        id: 'risk-9',
        name: 'พื้นที่เสี่ยงพายุ ชายฝั่งอ่าวไทย',
        province: 'สงขลา',
        coordinates: { lat: 7.1984, lng: 100.5955 },
        radius_km: 25,
        riskTypes: ['storm', 'flood'],
        riskLevel: 4,
        historicalIncidents: 22,
        description: 'พื้นที่ชายฝั่ง เสี่ยงพายุและคลื่นลมแรงในช่วงมรสุมตะวันออกเฉียงเหนือ'
    },
    {
        id: 'risk-10',
        name: 'พื้นที่เสี่ยงพายุ อันดามัน',
        province: 'ภูเก็ต',
        coordinates: { lat: 7.8804, lng: 98.3923 },
        radius_km: 20,
        riskTypes: ['storm'],
        riskLevel: 3,
        historicalIncidents: 14,
        description: 'พื้นที่ชายฝั่งทะเลอันดามัน เสี่ยงพายุในช่วงมรสุมตะวันตกเฉียงใต้'
    }
];

// Risk level colors for heat map
export const RISK_LEVEL_COLORS: Record<number, string> = {
    1: '#22c55e', // Green - Low
    2: '#84cc16', // Lime
    3: '#eab308', // Yellow - Medium
    4: '#f97316', // Orange - High
    5: '#ef4444'  // Red - Critical
};

export const RISK_LEVEL_OPACITY: Record<number, number> = {
    1: 0.3,
    2: 0.4,
    3: 0.5,
    4: 0.6,
    5: 0.7
};

export const RISK_TYPE_LABELS: Record<string, string> = {
    flood: 'น้ำท่วม',
    earthquake: 'แผ่นดินไหว',
    wildfire: 'ไฟป่า',
    landslide: 'ดินถล่ม',
    storm: 'พายุ'
};

export const useRiskZoneData = () => {
    const [selectedRiskTypes, setSelectedRiskTypes] = useState<string[]>([]);
    const [minRiskLevel, setMinRiskLevel] = useState<number>(1);
    const [showRiskZones, setShowRiskZones] = useState<boolean>(true);

    const riskZones = useMemo(() => {
        return MOCK_RISK_ZONES;
    }, []);

    // Filter risk zones
    const filteredRiskZones = useMemo(() => {
        let filtered = riskZones;

        if (selectedRiskTypes.length > 0) {
            filtered = filtered.filter(zone =>
                zone.riskTypes.some(type => selectedRiskTypes.includes(type))
            );
        }

        if (minRiskLevel > 1) {
            filtered = filtered.filter(zone => zone.riskLevel >= minRiskLevel);
        }

        return filtered;
    }, [riskZones, selectedRiskTypes, minRiskLevel]);

    // Get zones by province
    const getZonesByProvince = useCallback((province: string) => {
        return riskZones.filter(zone => zone.province === province);
    }, [riskZones]);

    // Get zones by risk type
    const getZonesByType = useCallback((type: string) => {
        return riskZones.filter(zone => zone.riskTypes.includes(type as any));
    }, [riskZones]);

    // Get risk zone by ID
    const getRiskZoneById = useCallback((id: string) => {
        return riskZones.find(zone => zone.id === id);
    }, [riskZones]);

    // Get unique provinces with risk zones
    const provinces = useMemo(() => {
        return [...new Set(riskZones.map(z => z.province))].sort();
    }, [riskZones]);

    // Get risk statistics
    const statistics = useMemo(() => {
        return {
            totalZones: riskZones.length,
            highRiskZones: riskZones.filter(z => z.riskLevel >= 4).length,
            totalIncidents: riskZones.reduce((acc, z) => acc + z.historicalIncidents, 0),
            zonesByType: {
                flood: riskZones.filter(z => z.riskTypes.includes('flood')).length,
                earthquake: riskZones.filter(z => z.riskTypes.includes('earthquake')).length,
                wildfire: riskZones.filter(z => z.riskTypes.includes('wildfire')).length,
                landslide: riskZones.filter(z => z.riskTypes.includes('landslide')).length,
                storm: riskZones.filter(z => z.riskTypes.includes('storm')).length
            }
        };
    }, [riskZones]);

    return {
        riskZones,
        filteredRiskZones,
        selectedRiskTypes,
        setSelectedRiskTypes,
        minRiskLevel,
        setMinRiskLevel,
        showRiskZones,
        setShowRiskZones,
        getZonesByProvince,
        getZonesByType,
        getRiskZoneById,
        provinces,
        statistics
    };
};

export default useRiskZoneData;
