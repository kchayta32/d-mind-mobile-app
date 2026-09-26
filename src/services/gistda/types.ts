/**
 * GISTDA API Type Definitions
 * Covers all endpoints: Flood, Wildfire (VIIRS), Burn Scars, Burn Frequency, Water Hyacinth, Drought, and Map Tiles.
 */

// ==========================================
// Base GeoJSON Structures
// ==========================================

export interface GISTDALink {
  href: string;
  rel: string;
  title?: string;
  type?: string;
}

export interface GISTDAFeature<TProps = any, TGeom = any> {
  id: string;
  type: 'Feature';
  geometry: TGeom;
  properties: TProps;
}

export interface GISTDAFeatureCollection<TProps = any, TGeom = any> {
  type: 'FeatureCollection';
  features: GISTDAFeature<TProps, TGeom>[];
  numberMatched?: number;
  numberReturned?: number;
  timeStamp?: string;
  links?: GISTDALink[];
}

// ==========================================
// 1. น้ำท่วม (Flood) Types
// ==========================================

export type FloodTimeframe = '1day' | '3days' | '7days' | '30days';

export interface FloodFeatureProperties {
  _id: string;
  _createdAt?: string;
  _createdBy?: string;
  _updatedAt?: string;
  _updatedBy?: string;
  _area?: number;
  f_area: number;
  pv_tn: string; // จังหวัด ภาษาไทย
  pv_en?: string; // จังหวัด ภาษาอังกฤษ
  pv_idn?: number;
  ap_tn: string; // อำเภอ ภาษาไทย
  ap_en?: string; // อำเภอ ภาษาอังกฤษ
  ap_idn?: number;
  tb_tn: string; // ตำบล ภาษาไทย
  tb_en?: string; // ตำบล ภาษาอังกฤษ
  tb_idn?: number;
  population?: number;
  population_2?: number;
  building?: number;
  length_road?: number;
  hospital?: number;
  school?: number;
  file_name?: string;
  rice_area?: number;
  cassava_area?: number;
  maize_area?: number;
  sugarcane_area?: number;
  h3_address?: string;
  h3_area?: number;
  mongo_id?: string;
  re_royin?: string;
  re_royin_2?: string;
  [key: string]: any;
}

export type FloodGeometry = {
  type: 'MultiPolygon' | 'Polygon';
  coordinates: number[][][][] | number[][][];
};

export type FloodFeature = GISTDAFeature<FloodFeatureProperties, FloodGeometry>;
export type FloodResponse = GISTDAFeatureCollection<FloodFeatureProperties, FloodGeometry>;

// Recurrent Flood (น้ำท่วมซ้ำซาก)
export interface RecurrentFloodProperties {
  _id: string;
  _collectionId?: string;
  _createdAt?: string;
  _createdBy?: string;
  _updatedAt?: string;
  _updatedBy?: string;
  freq: number;
  area_rai?: number;
  shape_area?: number;
  shape_length?: number;
  pv_tn: string;
  pv_en?: string;
  pv_code?: string;
  pv_idn?: number;
  ap_tn: string;
  ap_en?: string;
  ap_code?: string;
  ap_idn?: number;
  tb_tn: string;
  tb_en?: string;
  tb_code?: string;
  tb_idn?: number;
  re_royin?: string;
  re_nesdb?: string;
  com_tn?: string;
  objectid?: number;
  LabelTH?: string;
  LabelEN?: string;
  y_2011?: number;
  y_2012?: number;
  y_2013?: number;
  y_2014?: number;
  y_2015?: number;
  y_2016?: number;
  y_2017?: number;
  y_2018?: number;
  y_2019?: number;
  y_2020?: number;
  y_2021?: number;
  y_2022?: number;
  y_2023?: number;
  y_2024?: number;
  [key: string]: any;
}

export type RecurrentFloodGeometry = {
  type: 'MultiPolygon' | 'Polygon';
  coordinates: number[][][][] | number[][][];
};

export type RecurrentFloodFeature = GISTDAFeature<RecurrentFloodProperties, RecurrentFloodGeometry>;
export type RecurrentFloodResponse = GISTDAFeatureCollection<RecurrentFloodProperties, RecurrentFloodGeometry>;

// Water Hyacinth (สิ่งกีดขวางทางน้ำ / ผักตบชวา)
export interface WaterHyacinthProperties {
  _id: string;
  _createdAt?: string;
  _createdBy?: string;
  _updatedAt?: string;
  _updatedBy?: string;
  name?: string;
  namt?: string;
  lat?: number;
  long?: number;
  linkgmap?: string;
  agency?: string;
  agencyid?: string;
  ptype?: string;
  pv_tn: string;
  pv_en?: string;
  pv_code?: string;
  pv_idn?: number;
  ap_tn: string;
  ap_en?: string;
  ap_idn?: number;
  tb_tn: string;
  tb_en?: string;
  tb_code?: string;
  tb_idn?: number;
  wh?: string | number;
  wh_id?: string | number;
  mbasin_t?: string;
  mbasin_e?: string;
  sb_name_t?: string;
  sb_code?: string;
  shape_area?: number;
  shape_leng?: number;
  sheet25k?: string;
  source_name?: string;
  re_royin?: string;
  re_nesdb?: string;
  [key: string]: any;
}

export type WaterHyacinthGeometry = {
  type: 'Point' | 'Polygon' | 'MultiPolygon';
  coordinates: [number, number] | number[][][] | number[][][][];
};

export type WaterHyacinthFeature = GISTDAFeature<WaterHyacinthProperties, WaterHyacinthGeometry>;
export type WaterHyacinthResponse = GISTDAFeatureCollection<WaterHyacinthProperties, WaterHyacinthGeometry>;

// ==========================================
// 2. ไฟป่า (Wildfire / VIIRS) Types
// ==========================================

export type VIIRSTimeframe = '1day' | '3days' | '7days' | '30days';

export interface VIIRSHotspotProperties {
  _id: string;
  _createdAt?: string;
  _createdBy?: string;
  _updatedAt?: string;
  _updatedBy?: string;
  hotspotid?: string | number;
  acq_date?: string;
  acq_time?: string;
  th_date?: string;
  th_time?: string;
  timestamp?: string;
  latitude?: number;
  longitude?: number;
  confidence?: number | string;
  instrument?: string;
  satellite?: string;
  frp?: number;
  bright_ti4?: number;
  bright_ti5?: number;
  f_alarm?: number;
  changwat?: string;
  amphoe?: string;
  tambol?: string;
  amphoe_t?: string;
  tambon_t?: string;
  province_t?: string;
  pv_tn?: string;
  ap_tn?: string;
  tb_tn?: string;
  pv_en?: string;
  ap_en?: string;
  tb_en?: string;
  pv_code?: string;
  ap_code?: string;
  tb_code?: string;
  pv_idn?: number;
  ap_idn?: number;
  tb_idn?: number;
  ct_tn?: string;
  ct_en?: string;
  village?: string;
  lu_name?: string;
  lu_hp?: string;
  lu_hp_name?: string;
  lu_code?: string | number;
  scan?: number;
  track?: number;
  version?: string;
  utm_zone?: string;
  utm_e?: number;
  utm_n?: number;
  v_angle?: number;
  v_direct?: number;
  v_dist?: number;
  linkgmap?: string;
  file_name?: string;
  name_1?: string;
  moo_1?: string;
  re_royin?: string;
  re_nesdb?: string;
  // Computed / UI fields
  area_rai?: number;
  risk_level?: 'low' | 'medium' | 'high' | 'very_high';
  [key: string]: any;
}

export type VIIRSGeometry = {
  type: 'Point';
  coordinates: [number, number]; // [lng, lat]
};

export type VIIRSFeature = GISTDAFeature<VIIRSHotspotProperties, VIIRSGeometry>;
export type VIIRSResponse = GISTDAFeatureCollection<VIIRSHotspotProperties, VIIRSGeometry>;

// Burn Frequency (พื้นที่เผาไหม้ซ้ำซาก)
export interface BurnFreqProperties {
  _id: string;
  _collectionId?: string;
  _createdAt?: string;
  _createdBy?: string;
  _updatedAt?: string;
  _updatedBy?: string;
  freq: number;
  area_rai?: number;
  shape_area?: number;
  shape_leng?: number;
  shape_le_1?: number;
  pv_tn: string;
  pv_en?: string;
  pv_idn?: number;
  ap_tn: string;
  ap_idn?: number;
  tb_tn: string;
  tb_idn?: number;
  re_royin?: string;
  re_nesdb?: string;
  y2017?: number;
  y2023?: number;
  y2024?: number;
  y2025?: number;
  [key: string]: any;
}

export type BurnFreqGeometry = {
  type: 'MultiPolygon' | 'Polygon';
  coordinates: number[][][][] | number[][][];
};

export type BurnFreqFeature = GISTDAFeature<BurnFreqProperties, BurnFreqGeometry>;
export type BurnFreqResponse = GISTDAFeatureCollection<BurnFreqProperties, BurnFreqGeometry>;

// Burn Scar (ร่องรอยเผาไหม้ รายสัปดาห์)
export interface BurnScarProperties {
  _id: string;
  _createdAt?: string;
  _createdBy?: string;
  _updatedAt?: string;
  _updatedBy?: string;
  date?: string;
  name?: string;
  area?: number;
  area_map?: number;
  area_rai?: number;
  burn?: number;
  clusterfin?: number;
  lu_code?: string | number;
  lu_name?: string;
  pv_tn: string;
  pv_en?: string;
  pv_idn?: number;
  ap_tn: string;
  ap_idn?: number;
  tb_tn: string;
  tb_idn?: number;
  rp_code?: string | number;
  rp_name?: string;
  shape_area?: number;
  shape_leng?: number;
  orig_fid?: number;
  re_royin?: string;
  re_nesdb?: string;
  [key: string]: any;
}

export type BurnScarGeometry = {
  type: 'MultiPolygon' | 'Polygon';
  coordinates: number[][][][] | number[][][];
};

export type BurnScarFeature = GISTDAFeature<BurnScarProperties, BurnScarGeometry>;
export type BurnScarResponse = GISTDAFeatureCollection<BurnScarProperties, BurnScarGeometry>;

// ==========================================
// Compatibility & Analytics Hotspot Structure
// ==========================================

export interface GISTDAHotspot {
  LATITUDE: number;
  LONGITUDE: number;
  BRIGHTNESS: number;
  SCAN: number;
  TRACK: number;
  ACQ_DATE: string;
  ACQ_TIME: string;
  SATELLITE: string;
  CONFIDENCE: number;
  VERSION: string;
  BRIGHT_T31: number;
  FRP: number;
  DAYNIGHT: string;
  TYPE: number;
  province?: string;
  country?: string;
  geometry?: {
    coordinates: [number, number];
    type: string;
  };
  properties?: VIIRSHotspotProperties;
  id?: string;
  type?: string;
}

export interface GISTDAData {
  features?: GISTDAHotspot[];
  numberMatched?: number;
  numberReturned?: number;
  timeStamp?: string;
}

export interface GISTDAStats {
  totalHotspots: number;
  modisCount: number;
  viirsCount: number;
  highConfidenceCount: number;
  averageConfidence: number;
  last24Hours: number;
  last7Days: number;
}

export interface WildfireStats {
  totalHotspots: number;
  last24Hours: number;
  highConfidence: number;
  averageConfidence: number;
  topProvinces: Array<{ name: string; count: number }>;
  regionalData: Array<{ region: string; count: number; averageConfidence: number }>;
  timeDistribution: Array<{ time: string; count: number }>;
  thailand: {
    totalHotspots: number;
    byProvince: Array<{ name: string; count: number }>;
    averageConfidence: number;
    totalRiskArea: number;
    byRiskLevel: Array<{ level: string; count: number; area: number }>;
  };
  international: {
    totalHotspots: number;
    byCountry: Array<{ name: string; count: number }>;
    averageConfidence: number;
  };
}

// ==========================================
// 3. Map Layers & Tile Helper Types
// ==========================================

export type MapTileFormat = 'png' | 'jpeg';

export type FloodWMSLayer = 'flood-freq' | 'flood/1day' | 'flood/3days' | 'flood/7days' | 'flood/30days';
export type FloodWMTSLayer = 'flood/1day' | 'flood/3days' | 'flood/7days';

export type WildfireWMSLayer = 'viirs/1day' | 'viirs/3days' | 'viirs/7days' | 'viirs/30days' | 'burn-freq' | 'burn-scar';
export type WildfireWMTSLayer = 'viirs/1day' | 'viirs/3days' | 'viirs/7days' | 'viirs/30days' | 'burn-freq' | 'burn-scar';
export type WildfireTMSLayer = 'viirs/1day' | 'viirs/3days' | 'viirs/7days' | 'viirs/30days' | 'burn-freq' | 'burn-scar';

export type DroughtWMSLayer = 'dri/7days' | 'ndwi/7days' | 'smap/7days';
export type DroughtWMTSLayer = 'dri/7days' | 'ndwi/7days' | 'smap/7days';
export type DroughtTMSLayer = 'dri/7days' | 'ndwi/7days' | 'smap/7days';

export interface WMSParams {
  layers?: string;
  styles?: string;
  format?: string;
  transparent?: boolean;
  version?: string;
  crs?: string;
  srs?: string;
  width?: number;
  height?: number;
  bbox?: string;
  [key: string]: any;
}

export interface MapLibreRasterSource {
  type: 'raster';
  tiles: string[];
  tileSize?: number;
  minzoom?: number;
  maxzoom?: number;
  scheme?: 'xyz' | 'tms';
}

export interface LeafletTileLayerOptions {
  tms?: boolean;
  minZoom?: number;
  maxZoom?: number;
  opacity?: number;
  attribution?: string;
  [key: string]: any;
}

// ==========================================
// Query Parameters
// ==========================================

export interface PaginationParams {
  limit?: number;
  offset?: number;
  [key: string]: any;
}

export interface VIIRSQueryParams extends PaginationParams {
  ct_tn?: string; // ประเทศ ภาษาไทย เช่น 'ราชอาณาจักรไทย'
  pv_tn?: string; // จังหวัด ภาษาไทย
  confidence?: 'low' | 'nominal' | 'high' | number;
}
