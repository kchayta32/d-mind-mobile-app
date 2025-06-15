
import { useQuery } from '@tanstack/react-query';
import { fetchWeatherApi } from 'openmeteo';

export interface OpenMeteoWeatherData {
  current: {
    time: Date;
    temperature2m: number;
    relativeHumidity2m: number;
    apparentTemperature: number;
    isDay: number;
    snowfall: number;
    showers: number;
    precipitation: number;
    rain: number;
    weatherCode: number;
    cloudCover: number;
    pressureMsl: number;
    surfacePressure: number;
    windGusts10m: number;
    windDirection10m: number;
    windSpeed10m: number;
  };
  hourly: {
    time: Date[];
    temperature2m: Float32Array;
    relativeHumidity2m: Float32Array;
    dewPoint2m: Float32Array;
    apparentTemperature: Float32Array;
    precipitation: Float32Array;
    rain: Float32Array;
    showers: Float32Array;
    windSpeed10m: Float32Array;
    windDirection10m: Float32Array;
    windGusts10m: Float32Array;
    soilMoisture0To1cm: Float32Array;
    soilMoisture1To3cm: Float32Array;
    soilMoisture3To9cm: Float32Array;
    precipitationProbability: Float32Array;
    cloudCover: Float32Array;
    surfacePressure: Float32Array;
    pressureMsl: Float32Array;
    weatherCode: Float32Array;
  };
  daily: {
    time: Date[];
    temperature2mMax: Float32Array;
    temperature2mMin: Float32Array;
    weatherCode: Float32Array;
    rainSum: Float32Array;
    showersSum: Float32Array;
    precipitationSum: Float32Array;
    precipitationHours: Float32Array;
    precipitationProbabilityMax: Float32Array;
    windDirection10mDominant: Float32Array;
    windGusts10mMax: Float32Array;
    windSpeed10mMax: Float32Array;
  };
  location: {
    latitude: number;
    longitude: number;
    timezone: string;
    timezoneAbbreviation: string;
  };
}

export interface OpenMeteoRainDataPoint {
  locationName: string;
  lat: number;
  lon: number;
  weatherData: OpenMeteoWeatherData;
}

// อัปเดตตำแหน่งและชื่อจังหวัดให้ตรงกับตำแหน่งจริงในประเทศไทย
const THAILAND_WEATHER_POINTS = [
  { lat: 13.7563, lon: 100.5018, name: 'กรุงเทพมหานคร' },
  { lat: 18.7883, lon: 98.9853, name: 'เชียงใหม่' },
  { lat: 17.3514, lon: 104.8381, name: 'อุดรธานี' },
  { lat: 16.4419, lon: 102.8360, name: 'ขอนแก่น' },
  { lat: 15.2520, lon: 104.8569, name: 'หนองคาย' },
  { lat: 12.6091, lon: 101.0828, name: 'ชลบุรี' },
  { lat: 9.1326, lon: 99.3292, name: 'สุราษฎร์ธานี' },
  { lat: 7.8804, lon: 98.3923, name: 'ภูเก็ต' },
  { lat: 6.9955, lon: 100.4664, name: 'สงขลา' },
  { lat: 14.3532, lon: 100.5706, name: 'นครปฐม' },
  { lat: 19.9071, lon: 99.8831, name: 'เชียงราย' },
  { lat: 15.7907, lon: 100.2925, name: 'เพชรบูรณ์' },
  { lat: 14.0227, lon: 99.5283, name: 'กาญจนบุรี' },
  { lat: 8.4304, lon: 99.9581, name: 'นครศรีธรรมราช' },
  { lat: 11.8564, lon: 99.9605, name: 'ระนอง' }
];

async function fetchOpenMeteoWeatherData(): Promise<OpenMeteoRainDataPoint[]> {
  const params = {
    latitude: THAILAND_WEATHER_POINTS.map(p => p.lat),
    longitude: THAILAND_WEATHER_POINTS.map(p => p.lon),
    daily: [
      "temperature_2m_max", "temperature_2m_min", "weather_code", 
      "rain_sum", "showers_sum", "precipitation_sum", "precipitation_hours", 
      "precipitation_probability_max", "wind_direction_10m_dominant", 
      "wind_gusts_10m_max", "wind_speed_10m_max"
    ],
    hourly: [
      "temperature_2m", "relative_humidity_2m", "dew_point_2m", 
      "apparent_temperature", "precipitation", "rain", "showers", 
      "wind_speed_10m", "wind_direction_10m", "wind_gusts_10m",
      "soil_moisture_0_to_1cm", "soil_moisture_1_to_3cm", "soil_moisture_3_to_9cm",
      "precipitation_probability", "cloud_cover", "surface_pressure", 
      "pressure_msl", "weather_code"
    ],
    current: [
      "temperature_2m", "relative_humidity_2m", "apparent_temperature", 
      "is_day", "snowfall", "showers", "precipitation", "rain", 
      "weather_code", "cloud_cover", "pressure_msl", "surface_pressure", 
      "wind_gusts_10m", "wind_direction_10m", "wind_speed_10m"
    ],
    timezone: "Asia/Bangkok"
  };

  const url = "https://api.open-meteo.com/v1/forecast";
  const responses = await fetchWeatherApi(url, params);

  return responses.map((response, index) => {
    const utcOffsetSeconds = response.utcOffsetSeconds();
    const current = response.current()!;
    const hourly = response.hourly()!;
    const daily = response.daily()!;

    const weatherData: OpenMeteoWeatherData = {
      current: {
        time: new Date((Number(current.time()) + utcOffsetSeconds) * 1000),
        temperature2m: current.variables(0)!.value(),
        relativeHumidity2m: current.variables(1)!.value(),
        apparentTemperature: current.variables(2)!.value(),
        isDay: current.variables(3)!.value(),
        snowfall: current.variables(4)!.value(),
        showers: current.variables(5)!.value(),
        precipitation: current.variables(6)!.value(),
        rain: current.variables(7)!.value(),
        weatherCode: current.variables(8)!.value(),
        cloudCover: current.variables(9)!.value(),
        pressureMsl: current.variables(10)!.value(),
        surfacePressure: current.variables(11)!.value(),
        windGusts10m: current.variables(12)!.value(),
        windDirection10m: current.variables(13)!.value(),
        windSpeed10m: current.variables(14)!.value(),
      },
      hourly: {
        time: [...Array((Number(hourly.timeEnd()) - Number(hourly.time())) / hourly.interval())].map(
          (_, i) => new Date((Number(hourly.time()) + i * hourly.interval() + utcOffsetSeconds) * 1000)
        ),
        temperature2m: hourly.variables(0)!.valuesArray()!,
        relativeHumidity2m: hourly.variables(1)!.valuesArray()!,
        dewPoint2m: hourly.variables(2)!.valuesArray()!,
        apparentTemperature: hourly.variables(3)!.valuesArray()!,
        precipitation: hourly.variables(4)!.valuesArray()!,
        rain: hourly.variables(5)!.valuesArray()!,
        showers: hourly.variables(6)!.valuesArray()!,
        windSpeed10m: hourly.variables(7)!.valuesArray()!,
        windDirection10m: hourly.variables(8)!.valuesArray()!,
        windGusts10m: hourly.variables(9)!.valuesArray()!,
        soilMoisture0To1cm: hourly.variables(10)!.valuesArray()!,
        soilMoisture1To3cm: hourly.variables(11)!.valuesArray()!,
        soilMoisture3To9cm: hourly.variables(12)!.valuesArray()!,
        precipitationProbability: hourly.variables(13)!.valuesArray()!,
        cloudCover: hourly.variables(14)!.valuesArray()!,
        surfacePressure: hourly.variables(15)!.valuesArray()!,
        pressureMsl: hourly.variables(16)!.valuesArray()!,
        weatherCode: hourly.variables(17)!.valuesArray()!,
      },
      daily: {
        time: [...Array((Number(daily.timeEnd()) - Number(daily.time())) / daily.interval())].map(
          (_, i) => new Date((Number(daily.time()) + i * daily.interval() + utcOffsetSeconds) * 1000)
        ),
        temperature2mMax: daily.variables(0)!.valuesArray()!,
        temperature2mMin: daily.variables(1)!.valuesArray()!,
        weatherCode: daily.variables(2)!.valuesArray()!,
        rainSum: daily.variables(3)!.valuesArray()!,
        showersSum: daily.variables(4)!.valuesArray()!,
        precipitationSum: daily.variables(5)!.valuesArray()!,
        precipitationHours: daily.variables(6)!.valuesArray()!,
        precipitationProbabilityMax: daily.variables(7)!.valuesArray()!,
        windDirection10mDominant: daily.variables(8)!.valuesArray()!,
        windGusts10mMax: daily.variables(9)!.valuesArray()!,
        windSpeed10mMax: daily.variables(10)!.valuesArray()!,
      },
      location: {
        latitude: response.latitude(),
        longitude: response.longitude(),
        timezone: response.timezone(),
        timezoneAbbreviation: response.timezoneAbbreviation(),
      }
    };

    return {
      locationName: THAILAND_WEATHER_POINTS[index].name,
      lat: THAILAND_WEATHER_POINTS[index].lat,
      lon: THAILAND_WEATHER_POINTS[index].lon,
      weatherData
    };
  });
}

export const useOpenMeteoRainData = () => {
  return useQuery({
    queryKey: ['open-meteo-rain-data'],
    queryFn: fetchOpenMeteoWeatherData,
    refetchInterval: 1800000, // 30 minutes
    staleTime: 900000, // 15 minutes
  });
};
