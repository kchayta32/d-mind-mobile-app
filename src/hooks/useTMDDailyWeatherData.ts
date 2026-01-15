import { useQuery } from '@tanstack/react-query';
import { useGeolocation } from './useGeolocation';
import { THAI_REGIONS } from './useTMDWeatherData';

// Daily forecast API endpoints
const TMD_DAILY_API_BASE = 'https://data.tmd.go.th/nwpapi/v1/forecast/location/daily/at';
const TMD_DAILY_REGION_API_BASE = 'https://data.tmd.go.th/nwpapi/v1/forecast/location/daily/region';
const TMD_TOKEN = import.meta.env.VITE_TMD_API_TOKEN || '';

// Re-export THAI_REGIONS for use in the daily weather page
export { THAI_REGIONS };

export interface DailyForecast {
    time: string;
    data: {
        tc_max: number;      // Max temperature (°C)
        tc_min: number;      // Min temperature (°C)
        rh: number;          // Relative humidity (%)
        slp: number;         // Sea level pressure (hPa)
        rain: number;        // Rain volume (mm) - 24 hour total
        ws10m: number;       // Wind speed at 10m (m/s)
        wd10m: number;       // Wind direction at 10m (degrees)
        cloudlow: number;    // Cloud fraction low (%)
        cloudmed: number;    // Cloud fraction medium (%)
        cloudhigh: number;   // Cloud fraction high (%)
        cond: number;        // Weather condition code (1-12)
    };
}

export interface TMDDailyWeatherResponse {
    WeatherForecasts: Array<{
        forecasts: Array<{
            time: string;
            data: {
                tc_max: number;
                tc_min: number;
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

// Weather condition mapping (Thai) - same as hourly
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

// Format date for daily display
export const formatDailyDate = (isoString: string): string => {
    const date = new Date(isoString);
    return date.toLocaleDateString('th-TH', {
        weekday: 'long',
        day: 'numeric',
        month: 'long'
    });
};

export const formatShortDate = (isoString: string): string => {
    const date = new Date(isoString);
    return date.toLocaleDateString('th-TH', {
        weekday: 'short',
        day: 'numeric',
        month: 'short'
    });
};

export const useTMDDailyWeatherData = (lat?: number, lng?: number) => {
    const { coordinates } = useGeolocation();

    // Use provided coordinates or fallback to current location
    const latitude = lat ?? coordinates?.lat ?? 13.7563; // Bangkok default
    const longitude = lng ?? coordinates?.lng ?? 100.5018;

    return useQuery({
        queryKey: ['tmd-daily-weather', latitude, longitude],
        queryFn: async (): Promise<{
            forecasts: DailyForecast[];
            location: { province: string; amphoe: string; tambon: string };
        }> => {
            // Build URL - daily forecast for next 7 days
            const url = `${TMD_DAILY_API_BASE}?lat=${latitude}&lon=${longitude}&duration=7&fields=tc_max,tc_min,rh,slp,rain,ws10m,wd10m,cloudlow,cloudmed,cloudhigh,cond`;

            console.log('TMD Daily API URL:', url);

            const response = await fetch(url, {
                headers: {
                    'accept': 'application/json',
                    'authorization': `Bearer ${TMD_TOKEN}`
                }
            });

            console.log('TMD Daily API Response Status:', response.status);

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
            console.log('TMD Daily API Response Data:', JSON.stringify(data, null, 2));

            // Handle response structure
            let forecasts: any[] = [];
            let locationInfo = { province: 'กรุงเทพ', amphoe: '', tambon: '' };

            if (data.WeatherForecasts && Array.isArray(data.WeatherForecasts) && data.WeatherForecasts.length > 0) {
                const firstForecast = data.WeatherForecasts[0];
                if (firstForecast.forecasts && Array.isArray(firstForecast.forecasts)) {
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

            if (forecasts.length === 0) {
                throw new Error('ไม่พบข้อมูลพยากรณ์อากาศรายวัน');
            }

            return {
                forecasts: forecasts.map((f: any) => ({
                    time: f.time,
                    data: {
                        tc_max: f.data?.tc_max ?? 0,
                        tc_min: f.data?.tc_min ?? 0,
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
        enabled: !!TMD_TOKEN && latitude !== undefined && longitude !== undefined,
        staleTime: 60 * 60 * 1000, // 1 hour
        refetchInterval: 6 * 60 * 60 * 1000, // 6 hours
        retry: 2,
    });
};

// New hook for region-based daily weather data
export const useTMDDailyWeatherByRegion = (region: string) => {
    return useQuery({
        queryKey: ['tmd-daily-weather-region', region],
        queryFn: async (): Promise<{
            forecasts: DailyForecast[];
            location: { province: string; amphoe: string; tambon: string };
        }> => {
            if (!region) {
                throw new Error('กรุณาเลือกภูมิภาค');
            }

            const url = `${TMD_DAILY_REGION_API_BASE}?region=${encodeURIComponent(region)}&duration=7&fields=tc_max,tc_min,rh,slp,rain,ws10m,wd10m,cloudlow,cloudmed,cloudhigh,cond`;

            console.log('TMD Daily Region API URL:', url);

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
                throw new Error('ไม่พบข้อมูลพยากรณ์อากาศรายวันสำหรับภูมิภาคนี้');
            }

            return {
                forecasts: forecasts.map((f: any) => ({
                    time: f.time,
                    data: {
                        tc_max: f.data?.tc_max ?? 0,
                        tc_min: f.data?.tc_min ?? 0,
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
        staleTime: 60 * 60 * 1000,
        refetchInterval: 6 * 60 * 60 * 1000,
        retry: 2,
    });
};

export default useTMDDailyWeatherData;
