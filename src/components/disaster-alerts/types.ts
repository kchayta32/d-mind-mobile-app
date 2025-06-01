
export interface DisasterAlert {
  id: string;
  type: 'storm' | 'flood' | 'strongwind' | 'heavyrain' | 'wildfire' | 'earthquake' | string;
  severity: 'low' | 'medium' | 'high' | 'severe' | string;
  location: string;
  description?: string;
  coordinates?: [number, number]; // [longitude, latitude]
  start_time: string; // ISO date string
  end_time?: string; // ISO date string
  is_active: boolean;
  created_at: string;
  updated_at: string;
  magnitude?: number; // For earthquakes
  rain_intensity?: number; // For heavy rain (percentage)
  flood_level?: number; // For floods (meters)
  region?: 'thailand' | 'neighbors' | 'global'; // Added region classification
}

export interface AlertsFilterState {
  types: string[];
  severity: string[];
  activeOnly: boolean;
  earthquakeMagnitude?: number[];
  rainIntensity?: number[];
  floodLevel?: number[];
  region?: 'thailand' | 'neighbors' | 'all'; // Added region filter
}
