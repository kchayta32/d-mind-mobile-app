
export interface Earthquake {
  id: string;
  magnitude: number;
  location: string;
  time: number; // timestamp
  coordinates: [number, number]; // [latitude, longitude]
}
