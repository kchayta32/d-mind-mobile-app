import { useQuery } from '@tanstack/react-query';
import { useGeolocation } from './useGeolocation';

// Dynamic backend URL builder
const getBackendWeatherUrl = () => {
    const baseUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8080';
    return `${baseUrl}/weather`;
};

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

// Region default coordinates for fallback
export const REGION_COORDINATES: Record<string, { lat: number; lng: number }> = {
    'กรุงเทพมหานคร': { lat: 13.7563, lng: 100.5018 },
    'ภาคกลาง': { lat: 14.5204, lng: 100.4431 },
    'ภาคเหนือ': { lat: 18.7883, lng: 98.9853 },
    'ภาคตะวันออกเฉียงเหนือ': { lat: 16.4322, lng: 102.8236 },
    'ภาคตะวันออก': { lat: 12.9236, lng: 101.5083 },
    'ภาคตะวันตก': { lat: 14.0208, lng: 99.5326 },
    'ภาคใต้ฝั่งตะวันออก': { lat: 9.1400, lng: 99.3335 },
    'ภาคใต้ฝั่งตะวันตก': { lat: 7.8804, lng: 98.3923 },
};

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

// Map Open-Meteo WMO code to TMD condition code (1-12)
export const mapWmoToTmdCond = (wmoCode: number): number => {
    if (wmoCode === 0) return 1;
    if (wmoCode === 1 || wmoCode === 2) return 2;
    if (wmoCode === 3) return 3;
    if (wmoCode === 45 || wmoCode === 48) return 4;
    if (wmoCode >= 51 && wmoCode <= 57) return 5;
    if (wmoCode === 61 || wmoCode === 80) return 5;
    if (wmoCode === 63 || wmoCode === 81) return 6;
    if (wmoCode === 65 || wmoCode === 82) return 7;
    if (wmoCode >= 95 && wmoCode <= 99) return 8;
    return 2;
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

// Fetch Open-Meteo fallback
export const fetchOpenMeteoFallback = async (latitude: number, longitude: number, isDaily: boolean = false) => {
    console.log('Using Open-Meteo fallback for coords:', latitude, longitude);
    try {
        if (isDaily) {
            const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&daily=temperature_2m_max,temperature_2m_min,relative_humidity_2m_max,rain_sum,wind_speed_10m_max,wind_direction_10m_dominant,weather_code&timezone=Asia%2FBangkok&forecast_days=7`;
            const res = await fetch(url);
            if (!res.ok) throw new Error('Open-Meteo API Failed');
            const openMeteoData = await res.json();
            
            const forecasts = openMeteoData.daily.time.map((timeStr: string, index: number) => ({
                time: new Date(timeStr).toISOString(),
                data: {
                    tc_max: openMeteoData.daily.temperature_2m_max[index] ?? 30,
                    tc_min: openMeteoData.daily.temperature_2m_min[index] ?? 24,
                    rh: openMeteoData.daily.relative_humidity_2m_max[index] || 70,
                    slp: 1010,
                    rain: openMeteoData.daily.rain_sum[index] || 0,
                    ws10m: (openMeteoData.daily.wind_speed_10m_max[index] || 0) / 3.6,
                    wd10m: openMeteoData.daily.wind_direction_10m_dominant[index] || 0,
                    cloudlow: 0,
                    cloudmed: 0,
                    cloudhigh: 0,
                    cond: mapWmoToTmdCond(openMeteoData.daily.weather_code[index]),
                }
            }));

            return {
                forecasts,
                location: { province: 'ระบุพิกัด (Open-Meteo)', amphoe: '', tambon: '' }
            };
        } else {
            const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&hourly=temperature_2m,relative_humidity_2m,rain,wind_speed_10m,wind_direction_10m,weather_code,surface_pressure,cloud_cover_low,cloud_cover_mid,cloud_cover_high&timezone=Asia%2FBangkok&forecast_days=2`;
            const res = await fetch(url);
            if (!res.ok) throw new Error('Open-Meteo API Failed');
            const openMeteoData = await res.json();
            
            const forecasts = openMeteoData.hourly.time.map((timeStr: string, index: number) => ({
                time: new Date(timeStr).toISOString(),
                data: {
                    tc: openMeteoData.hourly.temperature_2m[index] ?? 30,
                    rh: openMeteoData.hourly.relative_humidity_2m[index] ?? 70,
                    slp: openMeteoData.hourly.surface_pressure[index] || 1010,
                    rain: openMeteoData.hourly.rain[index] || 0,
                    ws10m: (openMeteoData.hourly.wind_speed_10m[index] || 0) / 3.6,
                    wd10m: openMeteoData.hourly.wind_direction_10m[index] || 0,
                    cloudlow: openMeteoData.hourly.cloud_cover_low?.[index] || 0,
                    cloudmed: openMeteoData.hourly.cloud_cover_mid?.[index] || 0,
                    cloudhigh: openMeteoData.hourly.cloud_cover_high?.[index] || 0,
                    cond: mapWmoToTmdCond(openMeteoData.hourly.weather_code[index]),
                }
            }));

            return {
                forecasts,
                location: { province: 'ระบุพิกัด (Open-Meteo)', amphoe: '', tambon: '' }
            };
        }
    } catch (err) {
        console.error('Failed to fetch from Open-Meteo:', err);
        throw new Error('ไม่สามารถดึงข้อมูลสภาพอากาศได้ ทั้งจากระบบหลักและระบบสำรอง');
    }
};

export const useTMDWeatherData = (lat?: number, lng?: number) => {
    const { coordinates } = useGeolocation();

    const latitude = lat ?? coordinates?.lat ?? 13.7563;
    const longitude = lng ?? coordinates?.lng ?? 100.5018;

    return useQuery({
        queryKey: ['tmd-weather', latitude, longitude],
        queryFn: async (): Promise<{
            forecasts: HourlyForecast[];
            location: { province: string; amphoe: string; tambon: string };
        }> => {
            const dateStr = new Date().toISOString().split('T')[0];
            const url = `${getBackendWeatherUrl()}?lat=${latitude}&lon=${longitude}&date=${dateStr}&duration=24`;

            console.log('Calling backend proxy URL:', url);

            try {
                const response = await fetch(url, {
                    headers: { 'accept': 'application/json' }
                });

                if (!response.ok) {
                    console.warn(`Backend proxy failed with status: ${response.status}. Falling back to Open-Meteo.`);
                    return await fetchOpenMeteoFallback(latitude, longitude);
                }

                const json = await response.json();
                console.log('Received response from backend weather proxy:', json);
                
                // Get the TMD data object inside Ktor JsonDataResponse wrapper
                const data = json.data || json;

                let forecasts: any[] = [];
                let locationInfo = { province: 'กรุงเทพ', amphoe: '', tambon: '' };

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
                } else if (data.forecasts && Array.isArray(data.forecasts)) {
                    forecasts = data.forecasts;
                }

                if (forecasts.length === 0) {
                    console.warn('No forecasts found in backend response. Falling back to Open-Meteo.');
                    return await fetchOpenMeteoFallback(latitude, longitude);
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
            } catch (err) {
                console.warn('Network or server error from backend. Falling back to Open-Meteo:', err);
                return await fetchOpenMeteoFallback(latitude, longitude);
            }
        },
        enabled: latitude !== undefined && longitude !== undefined,
        staleTime: 30 * 60 * 1000,
        refetchInterval: 60 * 60 * 1000,
        retry: 1,
    });
};

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

            const url = `${getBackendWeatherUrl()}?region=${encodeURIComponent(region)}&duration=24`;
            console.log('Calling backend region proxy URL:', url);

            try {
                const response = await fetch(url, {
                    headers: { 'accept': 'application/json' }
                });

                if (!response.ok) {
                    console.warn(`Backend proxy failed with status: ${response.status}. Falling back to Open-Meteo region.`);
                    const coords = REGION_COORDINATES[region] || REGION_COORDINATES['กรุงเทพมหานคร'];
                    const res = await fetchOpenMeteoFallback(coords.lat, coords.lng);
                    return {
                        ...res,
                        location: { province: region, amphoe: '', tambon: '' }
                    };
                }

                const json = await response.json();
                const data = json.data || json;

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
                    console.warn('No forecasts found. Falling back to Open-Meteo region.');
                    const coords = REGION_COORDINATES[region] || REGION_COORDINATES['กรุงเทพมหานคร'];
                    const res = await fetchOpenMeteoFallback(coords.lat, coords.lng);
                    return {
                        ...res,
                        location: { province: region, amphoe: '', tambon: '' }
                    };
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
            } catch (err) {
                console.warn('Backend proxy error. Falling back to Open-Meteo region:', err);
                const coords = REGION_COORDINATES[region] || REGION_COORDINATES['กรุงเทพมหานคร'];
                const res = await fetchOpenMeteoFallback(coords.lat, coords.lng);
                return {
                    ...res,
                    location: { province: region, amphoe: '', tambon: '' }
                };
            }
        },
        enabled: !!region,
        staleTime: 30 * 60 * 1000,
        refetchInterval: 60 * 60 * 1000,
        retry: 1,
    });
};

export default useTMDWeatherData;
