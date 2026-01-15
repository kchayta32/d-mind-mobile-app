import React, { useState, useRef, Suspense } from 'react';
import Map, { NavigationControl, MapRef } from 'react-map-gl';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { RiskZoneLayer } from '@/components/disaster-map/RiskZoneLayer';
import { useRiskZoneData, RISK_TYPE_LABELS } from '@/hooks/useRiskZoneData';
import { UserLocationMarker } from '@/components/disaster-map/UserLocationMarker';
import { LocationControls } from '@/components/disaster-map/LocationControls';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { getMapStyle } from '@/components/disaster-map/maplibre/mapStyles';
import { ChevronUp, ChevronDown, AlertTriangle, MapPin, Flame, Droplets, Mountain, Wind, Activity } from 'lucide-react';

const RISK_TYPE_ICONS: Record<string, React.ReactNode> = {
    flood: <Droplets className="h-4 w-4" />,
    earthquake: <Activity className="h-4 w-4" />,
    wildfire: <Flame className="h-4 w-4" />,
    landslide: <Mountain className="h-4 w-4" />,
    storm: <Wind className="h-4 w-4" />
};

interface RiskZoneMapContentProps {
    onSwitchToDisasterMap?: () => void;
}

export const RiskZoneMapContent: React.FC<RiskZoneMapContentProps> = () => {
    const [showUserLocation, setShowUserLocation] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const startY = useRef(0);
    const currentTranslate = useRef(0);
    const drawerRef = useRef<HTMLDivElement>(null);
    const mapRef = useRef<MapRef>(null);

    const {
        filteredRiskZones,
        selectedRiskTypes,
        setSelectedRiskTypes,
        minRiskLevel,
        setMinRiskLevel,
    } = useRiskZoneData();

    const initialViewState = {
        longitude: 100.5018,
        latitude: 13.7563,
        zoom: 6,
        pitch: 0,
        bearing: 0
    };

    const handleRiskTypeToggle = (type: string) => {
        if (selectedRiskTypes.includes(type)) {
            setSelectedRiskTypes(selectedRiskTypes.filter(t => t !== type));
        } else {
            setSelectedRiskTypes([...selectedRiskTypes, type]);
        }
    };

    const riskTypes = ['flood', 'earthquake', 'wildfire', 'landslide', 'storm'];

    // Touch handlers for dragging
    const handleTouchStart = (e: React.TouchEvent) => {
        startY.current = e.touches[0].clientY;
        setIsDragging(true);
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        if (!isDragging) return;
        const diff = startY.current - e.touches[0].clientY;
        currentTranslate.current = diff;
    };

    const handleTouchEnd = () => {
        setIsDragging(false);
        if (currentTranslate.current > 50) {
            setIsExpanded(true);
        } else if (currentTranslate.current < -50) {
            setIsExpanded(false);
        }
        currentTranslate.current = 0;
    };

    const toggleExpand = () => setIsExpanded(!isExpanded);

    return (
        <div className="relative h-full w-full overflow-hidden">
            {/* Map Section - Full Screen */}
            <div className="absolute inset-0 z-0">
                <Map
                    ref={mapRef}
                    mapLib={maplibregl}
                    initialViewState={initialViewState}
                    style={{ height: '100%', width: '100%' }}
                    mapStyle={getMapStyle() as any}
                    minZoom={4}
                    maxZoom={18}
                    maxPitch={85}
                >
                    <NavigationControl position="top-right" visualizePitch={true} showCompass={true} />
                    <UserLocationMarker showLocation={showUserLocation} />
                    <RiskZoneLayer riskZones={filteredRiskZones} visible={true} />
                </Map>

                {/* Location Controls */}
                <div className="absolute top-20 right-4 z-[1000]">
                    <LocationControls
                        showUserLocation={showUserLocation}
                        onToggleLocation={setShowUserLocation}
                    />
                </div>

                {/* Compact Legend - Top Left */}
                <div className="absolute top-4 left-4 z-[1000] bg-white/95 backdrop-blur-sm rounded-xl shadow-lg px-3 py-2">
                    <div className="flex items-center gap-3 text-[10px]">
                        <div className="flex items-center gap-1">
                            <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
                            <span>สูงมาก</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <div className="w-2.5 h-2.5 rounded-full bg-orange-500" />
                            <span>สูง</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <div className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
                            <span>ปานกลาง</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
                            <span>ต่ำ</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Drawer */}
            <div
                ref={drawerRef}
                className={`absolute left-0 right-0 z-[1001] transition-all duration-300 ease-out ${isExpanded ? 'bottom-0' : 'bottom-0'
                    }`}
                style={{
                    transform: isExpanded ? 'translateY(0)' : 'translateY(calc(100% - 100px))',
                }}
            >
                {/* Drawer Handle */}
                <div
                    className="bg-white/95 backdrop-blur-md rounded-t-2xl shadow-[0_-4px_20px_rgba(0,0,0,0.15)] cursor-grab active:cursor-grabbing"
                    onTouchStart={handleTouchStart}
                    onTouchMove={handleTouchMove}
                    onTouchEnd={handleTouchEnd}
                    onClick={toggleExpand}
                >
                    {/* Handle Bar */}
                    <div className="flex justify-center pt-3 pb-2">
                        <div className="w-10 h-1 bg-gray-300 rounded-full" />
                    </div>

                    {/* Preview Stats - Always Visible */}
                    <div className="px-4 pb-3">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                {/* Stats */}
                                <div className="flex items-center gap-1.5">
                                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                                        <span className="text-sm font-bold text-blue-600">{filteredRiskZones.length}</span>
                                    </div>
                                    <span className="text-xs text-gray-600">พื้นที่เสี่ยง</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                                        <span className="text-sm font-bold text-orange-600">
                                            {filteredRiskZones.filter(z => z.riskLevel >= 4).length}
                                        </span>
                                    </div>
                                    <span className="text-xs text-gray-600">ความเสี่ยงสูง</span>
                                </div>
                            </div>

                            {/* Expand Button */}
                            <button className="flex items-center gap-1 text-blue-600 text-xs font-medium">
                                {isExpanded ? (
                                    <>
                                        <span>ซ่อน</span>
                                        <ChevronDown className="w-4 h-4" />
                                    </>
                                ) : (
                                    <>
                                        <span>ดูรายละเอียด</span>
                                        <ChevronUp className="w-4 h-4" />
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Expandable Content */}
                <div className={`bg-white overflow-hidden transition-all duration-300 ${isExpanded ? 'max-h-[60vh] opacity-100' : 'max-h-0 opacity-0'
                    }`}>
                    <div className="px-4 py-4 space-y-4 max-h-[60vh] overflow-y-auto pb-8">
                        {/* Full Statistics */}
                        <div className="grid grid-cols-3 gap-2 text-center">
                            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-3">
                                <div className="text-xl font-bold text-blue-600">{filteredRiskZones.length}</div>
                                <div className="text-[10px] text-gray-600">พื้นที่เสี่ยง</div>
                            </div>
                            <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-3">
                                <div className="text-xl font-bold text-orange-600">
                                    {filteredRiskZones.filter(z => z.riskLevel >= 4).length}
                                </div>
                                <div className="text-[10px] text-gray-600">ความเสี่ยงสูง</div>
                            </div>
                            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-3">
                                <div className="text-xl font-bold text-purple-600">
                                    {filteredRiskZones.reduce((acc, z) => acc + z.historicalIncidents, 0)}
                                </div>
                                <div className="text-[10px] text-gray-600">เหตุการณ์ในอดีต</div>
                            </div>
                        </div>

                        {/* Filter Section */}
                        <div className="bg-gray-50 rounded-xl p-4 space-y-4">
                            <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                                <AlertTriangle className="h-4 w-4 text-orange-500" />
                                ตัวกรองข้อมูล
                            </div>

                            {/* Risk Type Pills */}
                            <div>
                                <div className="text-xs text-gray-500 mb-2">ประเภทภัยพิบัติ</div>
                                <div className="flex flex-wrap gap-2">
                                    {riskTypes.map(type => (
                                        <button
                                            key={type}
                                            onClick={() => handleRiskTypeToggle(type)}
                                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs transition-all ${selectedRiskTypes.length === 0 || selectedRiskTypes.includes(type)
                                                ? 'bg-blue-500 text-white shadow-sm'
                                                : 'bg-white text-gray-500 border border-gray-200'
                                                }`}
                                        >
                                            {RISK_TYPE_ICONS[type]}
                                            {RISK_TYPE_LABELS[type]}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Risk Level Slider */}
                            <div>
                                <div className="text-xs text-gray-500 mb-2">
                                    ระดับความเสี่ยงขั้นต่ำ: <span className="font-bold text-gray-700">{minRiskLevel}</span>
                                </div>
                                <Slider
                                    value={[minRiskLevel]}
                                    onValueChange={(value) => setMinRiskLevel(value[0])}
                                    min={1}
                                    max={5}
                                    step={1}
                                    className="w-full"
                                />
                                <div className="flex justify-between text-[10px] text-gray-400 mt-1">
                                    <span>1 (ต่ำ)</span>
                                    <span>5 (สูง)</span>
                                </div>
                            </div>
                        </div>

                        {/* Risk Zone List */}
                        {filteredRiskZones.length > 0 && (
                            <div className="space-y-2">
                                <div className="text-xs text-gray-500 font-medium">พื้นที่เสี่ยงที่แสดง</div>
                                <div className="space-y-2">
                                    {filteredRiskZones.map(zone => (
                                        <div
                                            key={zone.id}
                                            className="flex items-center justify-between bg-white border border-gray-100 rounded-xl p-3 shadow-sm"
                                        >
                                            <div className="flex items-center gap-2">
                                                <MapPin className="h-4 w-4 text-gray-400" />
                                                <div>
                                                    <div className="text-sm font-medium text-gray-800 truncate max-w-[180px]">
                                                        {zone.name}
                                                    </div>
                                                    <div className="text-[10px] text-gray-400">{zone.province}</div>
                                                </div>
                                            </div>
                                            <Badge
                                                className={`text-[10px] ${zone.riskLevel >= 4
                                                    ? 'bg-red-500 text-white'
                                                    : zone.riskLevel >= 3
                                                        ? 'bg-yellow-500 text-white'
                                                        : 'bg-green-500 text-white'
                                                    }`}
                                            >
                                                ระดับ {zone.riskLevel}
                                            </Badge>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RiskZoneMapContent;
