
import React, { useState } from 'react';
import { useOfflineMapTiles } from '@/hooks/useOfflineMapTiles';
import { useGeolocation } from '@/hooks/useGeolocation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
    Download,
    Trash2,
    MapPin,
    HardDrive,
    Wifi,
    WifiOff,
    CheckCircle,
    AlertCircle,
    Map as MapIcon
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { th } from 'date-fns/locale';

// Predefined regions for Thailand
const PREDEFINED_REGIONS = [
    {
        id: 'bangkok',
        name: 'กรุงเทพมหานคร',
        bounds: { north: 13.95, south: 13.55, east: 100.75, west: 100.35 }
    },
    {
        id: 'chiang-mai',
        name: 'เชียงใหม่',
        bounds: { north: 19.0, south: 18.6, east: 99.1, west: 98.8 }
    },
    {
        id: 'phuket',
        name: 'ภูเก็ต',
        bounds: { north: 8.2, south: 7.75, east: 98.45, west: 98.25 }
    },
    {
        id: 'khon-kaen',
        name: 'ขอนแก่น',
        bounds: { north: 16.55, south: 16.35, east: 102.9, west: 102.7 }
    },
    {
        id: 'nakhon-ratchasima',
        name: 'นครราชสีมา',
        bounds: { north: 15.1, south: 14.85, east: 102.2, west: 101.95 }
    }
];

const OfflineMapManager: React.FC = () => {
    const { coordinates } = useGeolocation();
    const {
        isOnline,
        cacheSizeFormatted,
        tileCount,
        downloadProgress,
        cachedRegions,
        downloadRegion,
        deleteRegion,
        clearCache
    } = useOfflineMapTiles();

    const [selectedRegionId, setSelectedRegionId] = useState<string | null>(null);
    const [customRadius, setCustomRadius] = useState<number>(10);
    const [zoomRange, setZoomRange] = useState<[number, number]>([10, 15]);

    const handleDownloadRegion = async (
        bounds: { north: number; south: number; east: number; west: number },
        name: string
    ) => {
        await downloadRegion(bounds, zoomRange[0], zoomRange[1], name);
    };

    const handleDownloadCurrentLocation = async () => {
        if (!coordinates) return;

        // Calculate bounds based on radius (rough approximation)
        const kmPerDegree = 111;
        const latDelta = customRadius / kmPerDegree;
        const lngDelta = customRadius / (kmPerDegree * Math.cos(coordinates.lat * Math.PI / 180));

        const bounds = {
            north: coordinates.lat + latDelta,
            south: coordinates.lat - latDelta,
            east: coordinates.lng + lngDelta,
            west: coordinates.lng - lngDelta
        };

        await downloadRegion(bounds, zoomRange[0], zoomRange[1], 'ตำแหน่งปัจจุบัน');
    };

    const estimateTileCount = (radius: number, minZoom: number, maxZoom: number): number => {
        let total = 0;
        const areaKm2 = Math.PI * radius * radius;

        for (let z = minZoom; z <= maxZoom; z++) {
            // Approximate tiles per km² at each zoom level
            const tilesPerKm2 = Math.pow(4, z - 10) * 0.01;
            total += Math.ceil(areaKm2 * tilesPerKm2);
        }

        return Math.min(total, 5000);
    };

    return (
        <Card className="border-0 shadow-none bg-transparent">
            <CardHeader className="px-0 pt-0">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <MapIcon className="h-5 w-5 text-blue-500" />
                        <CardTitle className="text-lg">แผนที่ออฟไลน์</CardTitle>
                    </div>
                    <Badge variant={isOnline ? 'default' : 'destructive'}>
                        {isOnline ? (
                            <><Wifi className="h-3 w-3 mr-1" /> ออนไลน์</>
                        ) : (
                            <><WifiOff className="h-3 w-3 mr-1" /> ออฟไลน์</>
                        )}
                    </Badge>
                </div>
                <CardDescription className="text-sm">
                    ดาวน์โหลดแผนที่เพื่อใช้งานเมื่อไม่มีอินเทอร์เน็ต
                </CardDescription>
            </CardHeader>

            <CardContent className="space-y-5 px-0 pb-0">
                {/* Storage Info */}
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-xl">
                    <div className="flex items-center gap-2">
                        <HardDrive className="h-4 w-4 text-blue-600" />
                        <span className="text-sm text-blue-800">พื้นที่ใช้งาน</span>
                    </div>
                    <div className="text-right">
                        <span className="font-semibold text-blue-800">{cacheSizeFormatted}</span>
                        <span className="text-xs text-blue-600 ml-1">({tileCount} tiles)</span>
                    </div>
                </div>

                {/* Download Progress */}
                {downloadProgress.inProgress && (
                    <div className="space-y-2 p-3 bg-amber-50 rounded-xl">
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-amber-800">กำลังดาวน์โหลด...</span>
                            <span className="text-amber-700">
                                {downloadProgress.completed}/{downloadProgress.total}
                            </span>
                        </div>
                        <Progress
                            value={(downloadProgress.completed / downloadProgress.total) * 100}
                            className="h-2"
                        />
                        {downloadProgress.failed > 0 && (
                            <span className="text-xs text-red-600">
                                ล้มเหลว: {downloadProgress.failed} tiles
                            </span>
                        )}
                    </div>
                )}

                {/* Download Current Location */}
                {coordinates && (
                    <div className="space-y-3 p-4 bg-green-50 rounded-xl border border-green-100">
                        <div className="flex items-center gap-2 text-green-800">
                            <MapPin className="h-4 w-4" />
                            <span className="font-medium">ดาวน์โหลดพื้นที่รอบตำแหน่งปัจจุบัน</span>
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <Label>รัศมี: {customRadius} กม.</Label>
                                <span className="text-gray-500">
                                    ~{estimateTileCount(customRadius, zoomRange[0], zoomRange[1])} tiles
                                </span>
                            </div>
                            <Slider
                                value={[customRadius]}
                                onValueChange={([value]) => setCustomRadius(value)}
                                min={1}
                                max={50}
                                step={1}
                            />
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <Label>ระดับซูม: {zoomRange[0]} - {zoomRange[1]}</Label>
                            </div>
                            <Slider
                                value={zoomRange}
                                onValueChange={(value) => setZoomRange(value as [number, number])}
                                min={8}
                                max={18}
                                step={1}
                            />
                        </div>

                        <Button
                            className="w-full bg-green-600 hover:bg-green-700"
                            onClick={handleDownloadCurrentLocation}
                            disabled={downloadProgress.inProgress}
                        >
                            <Download className="h-4 w-4 mr-2" />
                            ดาวน์โหลดพื้นที่นี้
                        </Button>
                    </div>
                )}

                {/* Predefined Regions */}
                <div className="space-y-3">
                    <Label className="text-sm font-medium">พื้นที่แนะนำ</Label>
                    <div className="grid grid-cols-2 gap-2">
                        {PREDEFINED_REGIONS.map((region) => {
                            const isCached = cachedRegions.some(r => r.name === region.name);
                            return (
                                <Button
                                    key={region.id}
                                    variant={isCached ? 'secondary' : 'outline'}
                                    size="sm"
                                    className="justify-start h-auto py-2"
                                    onClick={() => handleDownloadRegion(region.bounds, region.name)}
                                    disabled={downloadProgress.inProgress}
                                >
                                    {isCached ? (
                                        <CheckCircle className="h-3 w-3 mr-1.5 text-green-600" />
                                    ) : (
                                        <Download className="h-3 w-3 mr-1.5" />
                                    )}
                                    <span className="text-xs">{region.name}</span>
                                </Button>
                            );
                        })}
                    </div>
                </div>

                {/* Cached Regions List */}
                {cachedRegions.length > 0 && (
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <Label className="text-sm font-medium">พื้นที่ที่ดาวน์โหลดแล้ว</Label>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="text-red-600 h-7 text-xs"
                                onClick={clearCache}
                            >
                                <Trash2 className="h-3 w-3 mr-1" />
                                ล้างทั้งหมด
                            </Button>
                        </div>
                        <ScrollArea className="h-[200px]">
                            <div className="space-y-2">
                                {cachedRegions.map((region) => (
                                    <div
                                        key={region.id}
                                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                                    >
                                        <div>
                                            <div className="font-medium text-sm">{region.name}</div>
                                            <div className="text-xs text-gray-500">
                                                {region.tileCount} tiles •
                                                {formatDistanceToNow(new Date(region.createdAt), {
                                                    addSuffix: true,
                                                    locale: th
                                                })}
                                            </div>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 text-red-500 hover:text-red-700"
                                            onClick={() => deleteRegion(region.id)}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        </ScrollArea>
                    </div>
                )}

                {/* Offline Info */}
                {!isOnline && (
                    <Alert className="bg-amber-50 border-amber-200">
                        <AlertCircle className="h-4 w-4 text-amber-600" />
                        <AlertDescription className="text-amber-800 text-sm">
                            คุณกำลังใช้งานแบบออฟไลน์ แผนที่จะแสดงเฉพาะพื้นที่ที่ดาวน์โหลดไว้แล้วเท่านั้น
                        </AlertDescription>
                    </Alert>
                )}
            </CardContent>
        </Card>
    );
};

export default OfflineMapManager;
