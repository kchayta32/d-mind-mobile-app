import { useQuery } from '@tanstack/react-query';
import { useGeolocation } from './useGeolocation';
import { 
    THAI_REGIONS, 
    REGION_COORDINATES, 
    fetchOpenMeteoFallback,
    weatherConditions 
} from './useTMDWeatherData';

// Re-export variables/types needed by components
export { THAI_REGIONS, weatherConditions };

// Dynamic backend URL builder
const getBackendWeatherUrl = () => {
    const baseUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8080';
    return `${baseUrl}/weather`;
};

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

    const latitude = lat ?? coordinates?.lat ?? 13.7563;
    const longitude = lng ?? coordinates?.lng ?? 100.5018;

    return useQuery({
        queryKey: ['tmd-daily-weather', latitude, longitude],
        queryFn: async (): Promise<{
            forecasts: DailyForecast[];
            location: { province: string; amphoe: string; tambon: string };
        }> => {
            const url = `${getBackendWeatherUrl()}?lat=${latitude}&lon=${longitude}&daily=true&duration=7`;

            console.log('Calling backend daily proxy URL:', url);

            try {
                const response = await fetch(url, {
                    headers: { 'accept': 'application/json' }
                });

                if (!response.ok) {
                    console.warn(`Backend daily proxy failed with status: ${response.status}. Falling back to Open-Meteo.`);
                    return await fetchOpenMeteoFallback(latitude, longitude, true);
                }

                const json = await response.json();
                const data = json.data || json;

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
                } else if (data.forecasts && Array.isArray(data.forecasts)) {
                    forecasts = data.forecasts;
                }

                if (forecasts.length === 0) {
                    console.warn('No daily forecasts found in backend response. Falling back to Open-Meteo.');
                    return await fetchOpenMeteoFallback(latitude, longitude, true);
                }

                return {
                    forecasts: forecasts.map((f: any) => ({
                        time: f.time,
                        data: {
                            tc_max: f.data?.tc_max ?? f.tc_max ?? 0,
                            tc_min: f.data?.tc_min ?? f.tc_min ?? 0,
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
                console.warn('Backend proxy error for daily weather. Falling back to Open-Meteo:', err);
                return await fetchOpenMeteoFallback(latitude, longitude, true);
            }
        },
        enabled: latitude !== undefined && longitude !== undefined,
        staleTime: 60 * 60 * 1000,
        refetchInterval: 6 * 60 * 60 * 1000,
        retry: 1,
    });
};

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

            const url = `${getBackendWeatherUrl()}?region=${encodeURIComponent(region)}&daily=true&duration=7`;
            console.log('Calling backend daily region proxy URL:', url);

            try {
                const response = await fetch(url, {
                    headers: { 'accept': 'application/json' }
                });

                if (!response.ok) {
                    console.warn(`Backend proxy failed with status: ${response.status}. Falling back to Open-Meteo region.`);
                    const coords = REGION_COORDINATES[region] || REGION_COORDINATES['กรุงเทพมหานคร'];
                    const res = await fetchOpenMeteoFallback(coords.lat, coords.lng, true);
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
                    console.warn('No daily forecasts found in region. Falling back to Open-Meteo.');
                    const coords = REGION_COORDINATES[region] || REGION_COORDINATES['กรุงเทพมหานคร'];
                    const res = await fetchOpenMeteoFallback(coords.lat, coords.lng, true);
                    return {
                        ...res,
                        location: { province: region, amphoe: '', tambon: '' }
                    };
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
            } catch (err) {
                console.warn('Backend daily proxy error for region. Falling back to Open-Meteo region:', err);
                const coords = REGION_COORDINATES[region] || REGION_COORDINATES['กรุงเทพมหานคร'];
                const res = await fetchOpenMeteoFallback(coords.lat, coords.lng, true);
                return {
                    ...res,
                    location: { province: region, amphoe: '', tambon: '' }
                };
            }
        },
        enabled: !!region,
        staleTime: 60 * 60 * 1000,
        refetchInterval: 6 * 60 * 60 * 1000,
        retry: 1,
    });
};

export default useTMDDailyWeatherData;
