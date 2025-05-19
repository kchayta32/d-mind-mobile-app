
export interface DisasterAlert {
  id: string;
  type: 'storm' | 'flood' | 'strongwind' | 'heavyrain' | 'wildfire' | string;
  severity: 'low' | 'medium' | 'high' | 'severe' | string;
  location: string;
  description?: string;
  coordinates?: [number, number]; // [longitude, latitude]
  start_time: string; // ISO date string
  end_time?: string; // ISO date string
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface AlertsFilterState {
  types: string[];
  severity: string[];
  activeOnly: boolean;
}
