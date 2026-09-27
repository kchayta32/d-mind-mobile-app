import { useState, useEffect, useCallback } from 'react';
import { CrowdsourcedFloodReport } from '../types';
import { FloodFeature } from './useGISTDAFloodData';
import { supabase } from '@/integrations/supabase/client';

const STORAGE_KEY = 'dmind_crowdsourced_flood_reports';

// Initial realistic crowdsourced ground-truth data in Thailand flood-prone basins
const INITIAL_GROUND_TRUTH_REPORTS: CrowdsourcedFloodReport[] = [
  {
    id: 'ct-flood-01',
    lat: 14.3312,
    lng: 100.4125,
    locationName: 'ต.หัวเวียง อ.เสนา จ.พระนครศรีอยุธยา',
    waterLevel: 'waist',
    waterLevelCm: 85,
    waterFlow: 'flowing',
    situation: 'แม่น้ำน้อยล้นตลิ่งท่วมใต้ถุนบ้านและถนนสายในหมู่บ้านสูงระดับเอว รถเล็กไม่สามารถผ่านได้',
    imageUrl: 'https://images.unsplash.com/photo-1547683905-f686c993aae5?auto=format&fit=crop&w=600&q=80',
    reporterName: 'กิตติศักดิ์ ชุมชนริมน้ำ',
    createdAt: new Date(Date.now() - 25 * 60 * 1000).toISOString(), // 25 mins ago
    verifiedBySatellite: true,
    satelliteDistanceMeters: 120
  },
  {
    id: 'ct-flood-02',
    lat: 17.0215,
    lng: 99.8241,
    locationName: 'ต.ปากแคว อ.เมือง จ.สุโขทัย',
    waterLevel: 'knee',
    waterLevelCm: 45,
    waterFlow: 'flowing',
    situation: 'คันกั้นน้ำแม่น้ำยมรั่ว น้ำทะลักเข้าท่วมผิวจราจรและพื้นที่เกษตรกรรม เจ้าหน้าที่กำลังนำบิ๊กแบ็กอุดรอยรั่ว',
    imageUrl: 'https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?auto=format&fit=crop&w=600&q=80',
    reporterName: 'ทีมอาสากู้ภัยสุโขทัย',
    createdAt: new Date(Date.now() - 48 * 60 * 1000).toISOString(), // 48 mins ago
    verifiedBySatellite: true,
    satelliteDistanceMeters: 250
  },
  {
    id: 'ct-flood-03',
    lat: 15.1950,
    lng: 104.8610,
    locationName: 'ชุมชนท่ากอไผ่ ต.วารินชำราบ จ.อุบลราชธานี',
    waterLevel: 'critical',
    waterLevelCm: 120,
    waterFlow: 'torrential',
    situation: 'แม่น้ำมูลหนุนสูง ระดับน้ำท่วมชั้นล่างเกือบมิดหลังคา ชาวบ้านอพยพขึ้นศูนย์พักพิงชั่วคราวแล้ว',
    imageUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=600&q=80',
    reporterName: 'สมศรี มั่นคง',
    createdAt: new Date(Date.now() - 110 * 60 * 1000).toISOString(), // 1.8 hrs ago
    verifiedBySatellite: true,
    satelliteDistanceMeters: 80
  },
  {
    id: 'ct-flood-04',
    lat: 19.9100,
    lng: 99.8300,
    locationName: 'ต.เวียง อ.เมือง จ.เชียงราย',
    waterLevel: 'knee',
    waterLevelCm: 50,
    waterFlow: 'flowing',
    situation: 'น้ำสายหลากเข้าท่วมตลาดสายลมจอย ดินโคลนทับถม สูงประมาณหัวเข่า ต้องการจิตอาสาช่วยตักดิน',
    imageUrl: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=600&q=80',
    reporterName: 'ชาวบ้านแม่สายร่วมใจ',
    createdAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(), // 15 mins ago
    verifiedBySatellite: false,
    satelliteDistanceMeters: 450
  }
];

export const useCrowdsourcedFloodReports = (satelliteFeatures: FloodFeature[] = []) => {
  const [reports, setReports] = useState<CrowdsourcedFloodReport[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Failed to load crowdsource reports from localStorage:', e);
    }
    return INITIAL_GROUND_TRUTH_REPORTS;
  });

  // Calculate distance in meters between two lat/lng points (Haversine formula)
  const calculateDistanceMeters = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371e3; // Earth radius in meters
    const phi1 = (lat1 * Math.PI) / 180;
    const phi2 = (lat2 * Math.PI) / 180;
    const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
    const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
      Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  // Cross-reference ground truth report with Sentinel satellite polygons/points
  const crossReferenceWithSatellite = useCallback(
    (reportLat: number, reportLng: number): { verified: boolean; distance: number } => {
      if (!satelliteFeatures || satelliteFeatures.length === 0) {
        return { verified: false, distance: 99999 };
      }

      let minDistance = Infinity;

      for (const feat of satelliteFeatures) {
        if (!feat.geometry) continue;

        if (feat.geometry.type === 'Point' && Array.isArray(feat.geometry.coordinates)) {
          const [lng, lat] = feat.geometry.coordinates;
          const dist = calculateDistanceMeters(reportLat, reportLng, lat, lng);
          if (dist < minDistance) minDistance = dist;
        } else if (
          (feat.geometry.type === 'Polygon' || feat.geometry.type === 'MultiPolygon') &&
          Array.isArray(feat.geometry.coordinates)
        ) {
          // Check vertices or approximate bounding center
          const coords = feat.geometry.type === 'Polygon' 
            ? feat.geometry.coordinates[0] 
            : feat.geometry.coordinates[0]?.[0];
          
          if (Array.isArray(coords)) {
            for (const pt of coords) {
              if (Array.isArray(pt) && pt.length >= 2) {
                const dist = calculateDistanceMeters(reportLat, reportLng, pt[1], pt[0]);
                if (dist < minDistance) minDistance = dist;
              }
            }
          }
        }
      }

      // If report is within 5,000 meters (~5km) of Sentinel detected water body, it is Ground Truth confirmed!
      const isVerified = minDistance <= 5000;
      return { verified: isVerified, distance: Math.round(minDistance) };
    },
    [satelliteFeatures]
  );

  // Sync with Supabase incident_reports if available
  useEffect(() => {
    let isMounted = true;
    const fetchSupabaseReports = async () => {
      try {
        const { data, error } = await supabase
          .from('incident_reports')
          .select('*')
          .eq('type', 'flood')
          .order('created_at', { ascending: false })
          .limit(50);

        if (!error && data && data.length > 0 && isMounted) {
          const mapped: CrowdsourcedFloodReport[] = data.map((item: any) => {
            const lat = item.coordinates?.lat || 13.7563;
            const lng = item.coordinates?.lng || 100.5018;
            const { verified, distance } = crossReferenceWithSatellite(lat, lng);

            let waterLevel: CrowdsourcedFloodReport['waterLevel'] = 'knee';
            if (item.severity_level >= 4) waterLevel = 'critical';
            else if (item.severity_level === 3) waterLevel = 'waist';
            else if (item.severity_level === 2) waterLevel = 'knee';
            else if (item.severity_level === 1) waterLevel = 'ankle';

            return {
              id: item.id || `sb-${Date.now()}`,
              lat,
              lng,
              locationName: item.location || 'รายงานภาคประชาชน',
              waterLevel,
              waterLevelCm: item.severity_level * 25,
              waterFlow: 'flowing',
              situation: item.description || item.title || 'รายงานน้ำท่วม',
              imageUrl: item.image_urls?.[0] || undefined,
              reporterName: item.contact_info || 'พลเมืองดี',
              createdAt: item.created_at || new Date().toISOString(),
              verifiedBySatellite: verified,
              satelliteDistanceMeters: distance
            };
          });

          setReports(prev => {
            const existingIds = new Set(prev.map(r => r.id));
            const newFromSb = mapped.filter(r => !existingIds.has(r.id));
            const merged = [...newFromSb, ...prev];
            try {
              localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
            } catch (e) {
              console.warn('Failed to update localStorage with Supabase reports:', e);
            }
            return merged;
          });
        }
      } catch (err) {
        console.warn('Supabase crowdsource fetch fallback:', err);
      }
    };

    fetchSupabaseReports();
    return () => {
      isMounted = false;
    };
  }, [crossReferenceWithSatellite]);

  // Submit new report
  const addReport = useCallback(
    async (newReport: Omit<CrowdsourcedFloodReport, 'id' | 'createdAt' | 'verifiedBySatellite' | 'satelliteDistanceMeters'>) => {
      const { verified, distance } = crossReferenceWithSatellite(newReport.lat, newReport.lng);
      
      const fullReport: CrowdsourcedFloodReport = {
        ...newReport,
        id: `ct-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        createdAt: new Date().toISOString(),
        verifiedBySatellite: verified,
        satelliteDistanceMeters: distance
      };

      setReports(prev => {
        const updated = [fullReport, ...prev];
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        } catch (e) {
          console.warn('Failed to save to localStorage:', e);
        }
        return updated;
      });

      // Try inserting into Supabase in background
      try {
        let severity = 2;
        if (newReport.waterLevel === 'critical') severity = 5;
        else if (newReport.waterLevel === 'chest') severity = 4;
        else if (newReport.waterLevel === 'waist') severity = 3;
        else if (newReport.waterLevel === 'knee') severity = 2;
        else if (newReport.waterLevel === 'ankle') severity = 1;

        await (supabase.from('incident_reports') as any).insert({
          type: 'flood',
          title: `รายงานน้ำท่วมสด (${newReport.locationName})`,
          description: newReport.situation,
          location: newReport.locationName,
          coordinates: { lat: newReport.lat, lng: newReport.lng },
          severity_level: severity,
          contact_info: newReport.reporterName ? `${newReport.reporterName} (${newReport.reporterPhone || 'ไม่ระบุเบอร์'})` : 'ประชาชนในพื้นที่',
          image_urls: newReport.imageUrl ? [newReport.imageUrl] : [],
          status: 'verified',
          is_verified: verified
        });
      } catch (err) {
        console.warn('Supabase insert background error (stored locally):', err);
      }

      return fullReport;
    },
    [crossReferenceWithSatellite]
  );

  return {
    reports,
    addReport,
    crossReferenceWithSatellite
  };
};
