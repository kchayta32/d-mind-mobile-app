import React, { useState, useMemo } from 'react';
import { Source, Layer, FillLayer, LineLayer, Popup } from 'react-map-gl';
import { useMap } from 'react-map-gl';
import { RiskZone, RISK_LEVEL_COLORS, RISK_LEVEL_OPACITY, RISK_TYPE_LABELS } from '@/hooks/useRiskZoneData';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, MapPin, History } from 'lucide-react';

interface RiskZoneLayerProps {
    riskZones: RiskZone[];
    visible: boolean;
}

// Generate circle polygon from center point and radius
function createCirclePolygon(lng: number, lat: number, radiusKm: number, steps: number = 64): number[][] {
    const coords: number[][] = [];
    const distanceX = radiusKm / (111.32 * Math.cos((lat * Math.PI) / 180));
    const distanceY = radiusKm / 110.574;

    for (let i = 0; i < steps; i++) {
        const theta = (i / steps) * (2 * Math.PI);
        const x = distanceX * Math.cos(theta);
        const y = distanceY * Math.sin(theta);
        coords.push([lng + x, lat + y]);
    }
    coords.push(coords[0]); // Close the polygon
    return coords;
}

// Convert risk zones to GeoJSON FeatureCollection
function zonesToGeoJSON(zones: RiskZone[]): GeoJSON.FeatureCollection {
    return {
        type: 'FeatureCollection',
        features: zones.map(zone => ({
            type: 'Feature' as const,
            id: zone.id,
            properties: {
                id: zone.id,
                name: zone.name,
                province: zone.province,
                district: zone.district || '',
                riskLevel: zone.riskLevel,
                riskTypes: zone.riskTypes,
                historicalIncidents: zone.historicalIncidents,
                description: zone.description,
                radius_km: zone.radius_km,
                color: RISK_LEVEL_COLORS[zone.riskLevel],
                opacity: RISK_LEVEL_OPACITY[zone.riskLevel]
            },
            geometry: {
                type: 'Polygon' as const,
                coordinates: [createCirclePolygon(zone.coordinates.lng, zone.coordinates.lat, zone.radius_km)]
            }
        }))
    };
}

// Popup component for risk zone
const RiskZonePopup: React.FC<{ zone: RiskZone; onClose: () => void }> = ({ zone, onClose }) => {
    return (
        <Popup
            longitude={zone.coordinates.lng}
            latitude={zone.coordinates.lat}
            onClose={onClose}
            closeButton={true}
            closeOnClick={false}
            anchor="bottom"
        >
            <div className="min-w-[250px] p-2">
                {/* Header */}
                <div className="flex items-start gap-2 mb-2">
                    <AlertTriangle
                        className="h-5 w-5 flex-shrink-0 mt-0.5"
                        style={{ color: RISK_LEVEL_COLORS[zone.riskLevel] }}
                    />
                    <div>
                        <h3 className="font-bold text-gray-900 text-sm leading-tight">
                            {zone.name}
                        </h3>
                        <div className="flex items-center gap-1 text-xs text-gray-500 mt-0.5">
                            <MapPin className="h-3 w-3" />
                            {zone.province}
                            {zone.district && `, ${zone.district}`}
                        </div>
                    </div>
                </div>

                {/* Risk Level Badge */}
                <div className="flex items-center gap-2 mb-2">
                    <Badge
                        style={{
                            backgroundColor: RISK_LEVEL_COLORS[zone.riskLevel],
                            color: zone.riskLevel >= 4 ? 'white' : 'black'
                        }}
                    >
                        ระดับความเสี่ยง {zone.riskLevel}
                    </Badge>
                </div>

                {/* Risk Types */}
                <div className="flex flex-wrap gap-1 mb-2">
                    {zone.riskTypes.map(type => (
                        <Badge key={type} variant="outline" className="text-xs">
                            {RISK_TYPE_LABELS[type]}
                        </Badge>
                    ))}
                </div>

                {/* Description */}
                <p className="text-xs text-gray-600 mb-2">
                    {zone.description}
                </p>

                {/* Historical Incidents */}
                <div className="flex items-center gap-1 text-xs text-gray-500 pt-2 border-t">
                    <History className="h-3 w-3" />
                    <span>เหตุการณ์ในอดีต: {zone.historicalIncidents} ครั้ง</span>
                </div>

                {/* Zone Info */}
                <div className="text-xs text-gray-400 mt-1">
                    รัศมี: {zone.radius_km} กม.
                </div>
            </div>
        </Popup>
    );
};

export const RiskZoneLayer: React.FC<RiskZoneLayerProps> = ({
    riskZones,
    visible
}) => {
    const { current: map } = useMap();
    const [selectedZone, setSelectedZone] = useState<RiskZone | null>(null);

    const geojsonData = useMemo(() => zonesToGeoJSON(riskZones), [riskZones]);

    // Handle click on risk zone
    React.useEffect(() => {
        if (!map || !visible) return;

        const handleClick = (e: any) => {
            const features = e.features;
            if (features && features.length > 0) {
                const feature = features[0];
                const zone = riskZones.find(z => z.id === feature.properties.id);
                if (zone) {
                    setSelectedZone(zone);
                    map.flyTo({
                        center: [zone.coordinates.lng, zone.coordinates.lat],
                        zoom: 12,
                        duration: 1000
                    });
                }
            }
        };

        map.on('click', 'risk-zone-fill', handleClick);

        // Change cursor on hover
        map.on('mouseenter', 'risk-zone-fill', () => {
            map.getCanvas().style.cursor = 'pointer';
        });
        map.on('mouseleave', 'risk-zone-fill', () => {
            map.getCanvas().style.cursor = '';
        });

        return () => {
            map.off('click', 'risk-zone-fill', handleClick);
            map.off('mouseenter', 'risk-zone-fill', () => { });
            map.off('mouseleave', 'risk-zone-fill', () => { });
        };
    }, [map, visible, riskZones]);

    if (!visible) return null;

    return (
        <>
            <Source id="risk-zones" type="geojson" data={geojsonData}>
                {/* Fill layer */}
                <Layer
                    id="risk-zone-fill"
                    type="fill"
                    paint={{
                        'fill-color': ['get', 'color'],
                        'fill-opacity': ['get', 'opacity']
                    }}
                />
                {/* Outline layer */}
                <Layer
                    id="risk-zone-outline"
                    type="line"
                    paint={{
                        'line-color': ['get', 'color'],
                        'line-width': 2,
                        'line-opacity': 0.8
                    }}
                />
            </Source>

            {/* Popup for selected zone */}
            {selectedZone && (
                <RiskZonePopup
                    zone={selectedZone}
                    onClose={() => setSelectedZone(null)}
                />
            )}
        </>
    );
};

export default RiskZoneLayer;
