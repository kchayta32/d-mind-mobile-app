
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface Shelter {
    id: string;
    name: string;
    address: string;
    province: string;
    district?: string;
    coordinates: { lat: number; lng: number };
    capacity: number;
    current_occupancy?: number;
    type: 'temporary' | 'permanent' | 'evacuation' | 'medical';
    facilities: string[];
    contact_phone?: string;
    status: 'open' | 'closed' | 'full';
    last_updated?: string;
    distance_km?: number;
}

// Mock shelter data for Thailand (since no real API available)
const MOCK_SHELTERS: Omit<Shelter, 'id' | 'distance_km'>[] = [
    {
        name: 'ศูนย์พักพิงชั่วคราว วัดปากน้ำภาษีเจริญ',
        address: '12 ถ.เพชรเกษม เขตภาษีเจริญ',
        province: 'กรุงเทพมหานคร',
        district: 'ภาษีเจริญ',
        coordinates: { lat: 13.7213, lng: 100.4367 },
        capacity: 500,
        current_occupancy: 120,
        type: 'temporary',
        facilities: ['น้ำดื่ม', 'ห้องน้ำ', 'อาหาร', 'เต็นท์'],
        contact_phone: '02-xxx-xxxx',
        status: 'open'
    },
    {
        name: 'ศูนย์อพยพ โรงเรียนวัดสังเวช',
        address: '456 ถ.สามเสน เขตพระนคร',
        province: 'กรุงเทพมหานคร',
        district: 'พระนคร',
        coordinates: { lat: 13.7679, lng: 100.4989 },
        capacity: 300,
        current_occupancy: 85,
        type: 'evacuation',
        facilities: ['น้ำดื่ม', 'ห้องน้ำ', 'อาหาร', 'การแพทย์'],
        contact_phone: '02-xxx-xxxx',
        status: 'open'
    },
    {
        name: 'ศูนย์พักพิง อบต.แม่ริม',
        address: 'หมู่ 4 ต.แม่ริม อ.แม่ริม',
        province: 'เชียงใหม่',
        coordinates: { lat: 18.9167, lng: 98.9583 },
        capacity: 200,
        current_occupancy: 45,
        type: 'temporary',
        facilities: ['น้ำดื่ม', 'ห้องน้ำ', 'เต็นท์'],
        status: 'open'
    },
    {
        name: 'ศูนย์อพยพ โรงพยาบาลพระนครศรีอยุธยา',
        address: 'ถ.อู่ทอง อ.พระนครศรีอยุธยา',
        province: 'พระนครศรีอยุธยา',
        coordinates: { lat: 14.3532, lng: 100.5687 },
        capacity: 150,
        type: 'medical',
        facilities: ['น้ำดื่ม', 'ห้องน้ำ', 'อาหาร', 'การแพทย์', 'ยา'],
        status: 'open'
    },
    {
        name: 'ศูนย์พักพิงชั่วคราว วัดชลประทานรังสฤษดิ์',
        address: 'ถ.ติวานนท์ อ.ปากเกร็ด',
        province: 'นนทบุรี',
        coordinates: { lat: 13.9060, lng: 100.5035 },
        capacity: 400,
        current_occupancy: 180,
        type: 'temporary',
        facilities: ['น้ำดื่ม', 'ห้องน้ำ', 'อาหาร', 'เต็นท์', 'ไฟฟ้า'],
        status: 'open'
    },
    {
        name: 'ศูนย์อพยพ มหาวิทยาลัยขอนแก่น',
        address: 'ถ.มิตรภาพ อ.เมืองขอนแก่น',
        province: 'ขอนแก่น',
        coordinates: { lat: 16.4722, lng: 102.8225 },
        capacity: 800,
        current_occupancy: 200,
        type: 'evacuation',
        facilities: ['น้ำดื่ม', 'ห้องน้ำ', 'อาหาร', 'การแพทย์', 'ไฟฟ้า', 'อินเทอร์เน็ต'],
        status: 'open'
    },
    {
        name: 'ศูนย์พักพิง โรงเรียนภูเก็ตวิทยาลัย',
        address: 'ถ.เทพกระษัตรี อ.เมืองภูเก็ต',
        province: 'ภูเก็ต',
        coordinates: { lat: 7.9070, lng: 98.3721 },
        capacity: 350,
        type: 'evacuation',
        facilities: ['น้ำดื่ม', 'ห้องน้ำ', 'อาหาร'],
        status: 'open'
    },
    {
        name: 'ศูนย์อพยพ สนามกีฬาเทศบาล นครราชสีมา',
        address: 'ถ.มิตรภาพ อ.เมืองนครราชสีมา',
        province: 'นครราชสีมา',
        coordinates: { lat: 14.9707, lng: 102.0986 },
        capacity: 1000,
        status: 'open',
        type: 'evacuation',
        facilities: ['น้ำดื่ม', 'ห้องน้ำ', 'อาหาร', 'การแพทย์', 'ไฟฟ้า']
    }
];

// Calculate distance between two coordinates (Haversine formula)
const calculateDistance = (
    lat1: number,
    lng1: number,
    lat2: number,
    lng2: number
): number => {
    const R = 6371; // Earth's radius in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLng = ((lng2 - lng1) * Math.PI) / 180;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
};

export const useShelterData = () => {
    const [shelters, setShelters] = useState<Shelter[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
    const [selectedProvince, setSelectedProvince] = useState<string>('');
    const [selectedType, setSelectedType] = useState<string>('');

    // Get user location
    const getUserLocation = useCallback(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setUserLocation({
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    });
                },
                (error) => {
                    console.error('Error getting location:', error);
                    // Default to Bangkok if location not available
                    setUserLocation({ lat: 13.7563, lng: 100.5018 });
                }
            );
        }
    }, []);

    // Load shelter data
    useEffect(() => {
        const loadShelters = async () => {
            setIsLoading(true);

            try {
                // Try to load from Supabase first (if table exists)
                const { data: dbShelters, error } = await supabase
                    .from('shelters')
                    .select('*')
                    .eq('status', 'open');

                if (!error && dbShelters && dbShelters.length > 0) {
                    setShelters(dbShelters as Shelter[]);
                } else {
                    // Use mock data if no database
                    const mockWithIds = MOCK_SHELTERS.map((shelter, index) => ({
                        ...shelter,
                        id: `shelter-${index + 1}`
                    }));
                    setShelters(mockWithIds);
                }
            } catch (e) {
                console.error('Error loading shelters:', e);
                // Fallback to mock data
                const mockWithIds = MOCK_SHELTERS.map((shelter, index) => ({
                    ...shelter,
                    id: `shelter-${index + 1}`
                }));
                setShelters(mockWithIds);
            } finally {
                setIsLoading(false);
            }
        };

        loadShelters();
        getUserLocation();
    }, [getUserLocation]);

    // Get shelters sorted by distance
    const getSheltersByDistance = useCallback((): Shelter[] => {
        if (!userLocation) return shelters;

        return shelters
            .map(shelter => ({
                ...shelter,
                distance_km: calculateDistance(
                    userLocation.lat,
                    userLocation.lng,
                    shelter.coordinates.lat,
                    shelter.coordinates.lng
                )
            }))
            .sort((a, b) => (a.distance_km || 0) - (b.distance_km || 0));
    }, [shelters, userLocation]);

    // Get filtered shelters
    const getFilteredShelters = useCallback((): Shelter[] => {
        let filtered = getSheltersByDistance();

        if (selectedProvince) {
            filtered = filtered.filter(s => s.province === selectedProvince);
        }

        if (selectedType) {
            filtered = filtered.filter(s => s.type === selectedType);
        }

        return filtered;
    }, [getSheltersByDistance, selectedProvince, selectedType]);

    // Get nearby shelters within radius
    const getNearbyShelters = useCallback((radiusKm: number = 50): Shelter[] => {
        return getSheltersByDistance().filter(
            shelter => shelter.distance_km !== undefined && shelter.distance_km <= radiusKm
        );
    }, [getSheltersByDistance]);

    // Get unique provinces
    const getProvinces = useCallback((): string[] => {
        return [...new Set(shelters.map(s => s.province))].sort();
    }, [shelters]);

    // Get shelter by ID
    const getShelterById = useCallback((id: string): Shelter | undefined => {
        return shelters.find(s => s.id === id);
    }, [shelters]);

    return {
        shelters,
        isLoading,
        userLocation,
        selectedProvince,
        setSelectedProvince,
        selectedType,
        setSelectedType,
        getSheltersByDistance,
        getFilteredShelters,
        getNearbyShelters,
        getProvinces,
        getShelterById,
        refreshLocation: getUserLocation
    };
};

export default useShelterData;
