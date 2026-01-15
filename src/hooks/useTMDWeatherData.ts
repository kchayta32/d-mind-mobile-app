import { useQuery } from '@tanstack/react-query';
import { useGeolocation } from './useGeolocation';

// IMPORTANT: Use /hourly/at endpoint for coordinates, /hourly/region for regions
const TMD_API_BASE = 'https://data.tmd.go.th/nwpapi/v1/forecast/location/hourly/at';
const TMD_REGION_API_BASE = 'https://data.tmd.go.th/nwpapi/v1/forecast/location/hourly/region';
const TMD_TOKEN = import.meta.env.VITE_TMD_API_TOKEN || '';

// Thai regions for the selector
export const THAI_REGIONS = [
    { value: 'current', label: 'ตำแหน่งปัจจุบัน', description: 'ใช้ GPS' },
    { value: 'กรุงเทพมหานคร', label: 'กรุงเทพมหานคร', description: 'กทม. และปริมณฑล' },
    { value: 'ภาคกลาง', label: 'ภาคกลาง', description: 'นครปฐม, อยุธยา, สระบุรี...' },
    { value: 'ภาคเหนือ', label: 'ภาคเหนือ', description: 'เชียงใหม่, เชียงราย, ลำปาง...' },
    { value: 'ภาคตะวันออกเฉียงเหนือ', label: 'ภาคตะวันออกเฉียงเหนือ', description: 'อีสาน - ขอนแก่น, อุดร, โคราช...' },
    { value: 'ภาคตะวันออก', label: 'ภาคตะวันออก', description: 'ชลบุรี, ระยอง, จันทบุรี...' },
    { value: 'ภาคตะวันตก', label: 'ภาคตะวันตก', description: 'กาญจนบุรี, ราชบุรี...' },
    { value: 'ภาคใต้ฝั่งตะวันออก', label: 'ภาคใต้ฝั่งตะวันออก', description: 'สุราษฎร์, นครศรีฯ, สงขลา...' },
    { value: 'ภาคใต้ฝั่งตะวันตก', label: 'ภาคใต้ฝั่งตะวันตก', description: 'ภูเก็ต, กระบี่, พังงา...' },
];

export interface HourlyForecast {
    time: string;
    data: {
        tc: number;           // Temperature (°C)
        rh: number;           // Relative humidity (%)
        slp: number;          // Sea level pressure (hpa)
        rain: number;         // Rain volume (mm)
        ws10m: number;        // Wind speed at 10m (m/s)
        wd10m: number;        // Wind direction at 10m (degrees)
        cloudlow: number;     // Cloud fraction low (%)
        cloudmed: number;     // Cloud fraction medium (%)
        cloudhigh: number;    // Cloud fraction high (%)
        cond: number;         // Weather condition code (1-12)
    };
}

export interface TMDWeatherResponse {
    WeatherForecasts: Array<{
        forecasts: Array<{
            time: string;
            data: {
                tc: number;
                rh: number;
                slp: number;
                rain: number;
                ws10m: number;
                wd10m: number;
                cloudlow: number;
                cloudmed: number;
                cloudhigh: number;
                cond: number;
            };
        }>;
        location: {
            province: string;
            amphoe: string;
            tambon: string;
            lat: string;
            lon: string;
        };
    }>;
}

// Weather condition mapping (Thai)
export const weatherConditions: Record<number, { label: string; icon: string; color: string }> = {
    1: { label: 'ท้องฟ้าแจ่มใส', icon: '☀️', color: 'text-yellow-500' },
    2: { label: 'มีเมฆบางส่วน', icon: '⛅', color: 'text-blue-400' },
    3: { label: 'เมฆเป็นส่วนมาก', icon: '🌥️', color: 'text-gray-400' },
    4: { label: 'มีเมฆมาก', icon: '☁️', color: 'text-gray-500' },
    5: { label: 'ฝนตกเล็กน้อย', icon: '🌧️', color: 'text-blue-300' },
    6: { label: 'ฝนปานกลาง', icon: '🌧️', color: 'text-blue-500' },
    7: { label: 'ฝนหนัก', icon: '🌧️', color: 'text-blue-700' },
    8: { label: 'ฝนฟ้าคะนอง', icon: '⛈️', color: 'text-purple-600' },
    9: { label: 'อากาศหนาวจัด', icon: '❄️', color: 'text-cyan-400' },
    10: { label: 'อากาศหนาว', icon: '🥶', color: 'text-cyan-500' },
    11: { label: 'อากาศเย็น', icon: '🌬️', color: 'text-cyan-300' },
    12: { label: 'อากาศร้อนจัด', icon: '🔥', color: 'text-red-600' },
};

// Wind direction to Thai text
export const getWindDirection = (degrees: number): string => {
    const directions = ['เหนือ', 'ตะวันออกเฉียงเหนือ', 'ตะวันออก', 'ตะวันออกเฉียงใต้', 'ใต้', 'ตะวันตกเฉียงใต้', 'ตะวันตก', 'ตะวันตกเฉียงเหนือ'];
    const index = Math.round(degrees / 45) % 8;
    return directions[index];
};

// Format time from ISO string
export const formatTime = (isoString: string): string => {
    const date = new Date(isoString);
    return date.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' });
};

export const formatDate = (isoString: string): string => {
    const date = new Date(isoString);
    return date.toLocaleDateString('th-TH', { weekday: 'short', day: 'numeric', month: 'short' });
};

export const useTMDWeatherData = (lat?: number, lng?: number) => {
    const { coordinates } = useGeolocation();

    // Use provided coordinates or fallback to current location
    const latitude = lat ?? coordinates?.lat ?? 13.7563; // Bangkok default
    const longitude = lng ?? coordinates?.lng ?? 100.5018;

    return useQuery({
        queryKey: ['tmd-weather', latitude, longitude],
        queryFn: async (): Promise<{
            forecasts: HourlyForecast[];
            location: { province: string; amphoe: string; tambon: string };
        }> => {
            // Get current date and build URL with date parameter
            const dateStr = new Date().toISOString().split('T')[0];
            const url = `${TMD_API_BASE}?lat=${latitude}&lon=${longitude}&date=${dateStr}&fields=tc,rh,slp,rain,ws10m,wd10m,cloudlow,cloudmed,cloudhigh,cond&duration=24`;

            console.log('TMD API URL:', url);
            console.log('TMD Token exists:', !!TMD_TOKEN);

            const response = await fetch(url, {
                headers: {
                    'accept': 'application/json',
                    'authorization': `Bearer ${TMD_TOKEN}`
                }
            });

            console.log('TMD API Response Status:', response.status);

            if (!response.ok) {
                const errorText = await response.text();
                console.error('TMD API Error:', errorText);

                if (response.status === 401) {
                    throw new Error('API Token ไม่ถูกต้องหรือหมดอายุ');
                }
                if (response.status === 429) {
                    throw new Error('เรียกใช้ API เกินจำนวนครั้งที่กำหนด');
                }
                throw new Error(`เกิดข้อผิดพลาด: ${response.status}`);
            }

            const data = await response.json();
            console.log('TMD API Response Data:', JSON.stringify(data, null, 2));

            // Handle different response structures
            let forecasts: any[] = [];
            let locationInfo = { province: 'กรุงเทพ', amphoe: '', tambon: '' };

            // Check WeatherForecasts structure
            if (data.WeatherForecasts && Array.isArray(data.WeatherForecasts) && data.WeatherForecasts.length > 0) {
                const firstForecast = data.WeatherForecasts[0];
                if (firstForecast.forecasts) {
                    forecasts = firstForecast.forecasts;
                }
                if (firstForecast.location) {
                    locationInfo = {
                        province: firstForecast.location.province || 'ไม่ทราบ',
                        amphoe: firstForecast.location.amphoe || '',
                        tambon: firstForecast.location.tambon || ''
                    };
                }
            }
            // Alternative: direct forecasts array
            else if (data.forecasts && Array.isArray(data.forecasts)) {
                forecasts = data.forecasts;
            }
            // Alternative: hourly_data structure
            else if (data.hourly_data) {
                console.log('Found hourly_data structure');
            }

            if (forecasts.length === 0) {
                console.warn('No forecasts found in response');
                throw new Error('ไม่พบข้อมูลพยากรณ์อากาศสำหรับพิกัดนี้');
            }

            return {
                forecasts: forecasts.map((f: any) => ({
                    time: f.time,
                    data: {
                        tc: f.data?.tc ?? f.tc ?? 0,
                        rh: f.data?.rh ?? f.rh ?? 0,
                        slp: f.data?.slp ?? f.slp ?? 0,
                        rain: f.data?.rain ?? f.rain ?? 0,
                        ws10m: f.data?.ws10m ?? f.ws10m ?? 0,
                        wd10m: f.data?.wd10m ?? f.wd10m ?? 0,
                        cloudlow: f.data?.cloudlow ?? f.cloudlow ?? 0,
                        cloudmed: f.data?.cloudmed ?? f.cloudmed ?? 0,
                        cloudhigh: f.data?.cloudhigh ?? f.cloudhigh ?? 0,
                        cond: f.data?.cond ?? f.cond ?? 1,
                    }
                })),
                location: locationInfo
            };
        },
        enabled: !!TMD_TOKEN && latitude !== undefined && longitude !== undefined,
        staleTime: 30 * 60 * 1000, // 30 minutes
        refetchInterval: 60 * 60 * 1000, // 1 hour
        retry: 2,
    });
};

// New hook for region-based weather data
export const useTMDWeatherByRegion = (region: string) => {
    return useQuery({
        queryKey: ['tmd-weather-region', region],
        queryFn: async (): Promise<{
            forecasts: HourlyForecast[];
            location: { province: string; amphoe: string; tambon: string };
        }> => {
            if (!region) {
                throw new Error('กรุณาเลือกภูมิภาค');
            }

            const url = `${TMD_REGION_API_BASE}?region=${encodeURIComponent(region)}&fields=tc,rh,slp,rain,ws10m,wd10m,cloudlow,cloudmed,cloudhigh,cond&duration=24`;

            console.log('TMD Region API URL:', url);

            const response = await fetch(url, {
                headers: {
                    'accept': 'application/json',
                    'authorization': `Bearer ${TMD_TOKEN}`
                }
            });

            if (!response.ok) {
                if (response.status === 401) {
                    throw new Error('API Token ไม่ถูกต้องหรือหมดอายุ');
                }
                if (response.status === 429) {
                    throw new Error('เรียกใช้ API เกินจำนวนครั้งที่กำหนด');
                }
                throw new Error(`เกิดข้อผิดพลาด: ${response.status}`);
            }

            const data = await response.json();

            let forecasts: any[] = [];
            let locationInfo = { province: region, amphoe: '', tambon: '' };

            if (data.WeatherForecasts && Array.isArray(data.WeatherForecasts) && data.WeatherForecasts.length > 0) {
                const firstForecast = data.WeatherForecasts[0];
                if (firstForecast.forecasts && Array.isArray(firstForecast.forecasts)) {
                    forecasts = firstForecast.forecasts;
                }
                if (firstForecast.location) {
                    locationInfo = {
                        province: firstForecast.location.province || region,
                        amphoe: firstForecast.location.amphoe || '',
                        tambon: firstForecast.location.tambon || ''
                    };
                }
            }

            if (forecasts.length === 0) {
                throw new Error('ไม่พบข้อมูลพยากรณ์อากาศสำหรับภูมิภาคนี้');
            }

            return {
                forecasts: forecasts.map((f: any) => ({
                    time: f.time,
                    data: {
                        tc: f.data?.tc ?? 0,
                        rh: f.data?.rh ?? 0,
                        slp: f.data?.slp ?? 0,
                        rain: f.data?.rain ?? 0,
                        ws10m: f.data?.ws10m ?? 0,
                        wd10m: f.data?.wd10m ?? 0,
                        cloudlow: f.data?.cloudlow ?? 0,
                        cloudmed: f.data?.cloudmed ?? 0,
                        cloudhigh: f.data?.cloudhigh ?? 0,
                        cond: f.data?.cond ?? 1,
                    }
                })),
                location: locationInfo
            };
        },
        enabled: !!TMD_TOKEN && !!region,
        staleTime: 30 * 60 * 1000,
        refetchInterval: 60 * 60 * 1000,
        retry: 2,
    });
};

export default useTMDWeatherData;
