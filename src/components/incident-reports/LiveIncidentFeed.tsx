
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
    Activity,
    Clock,
    MapPin,
    Image as ImageIcon,
    CheckCircle,
    AlertTriangle,
    RefreshCw,
    Eye,
    Loader2
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { th } from 'date-fns/locale';

interface IncidentReport {
    id: string;
    type: string;
    title: string;
    description: string;
    location: string;
    coordinates: { lat: number; lng: number } | null;
    severity_level: number;
    status: string;
    is_verified: boolean;
    image_urls: string[] | null;
    created_at: string;
    contact_info?: string;
}

const INCIDENT_TYPE_ICONS: Record<string, string> = {
    earthquake: '🏢',
    flood: '🌊',
    wildfire: '🔥',
    landslide: '⛰️',
    storm: '🌪️',
    accident: '🚗',
    other: '⚠️'
};

const INCIDENT_TYPE_LABELS: Record<string, string> = {
    earthquake: 'แผ่นดินไหว',
    flood: 'น้ำท่วม',
    wildfire: 'ไฟป่า',
    landslide: 'ดินถลม',
    storm: 'พายุ',
    accident: 'อุบัติเหตุ',
    other: 'อื่นๆ'
};

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
    pending: { label: 'รอตรวจสอบ', color: 'bg-yellow-100 text-yellow-800' },
    in_progress: { label: 'กำลังดำเนินการ', color: 'bg-blue-100 text-blue-800' },
    resolved: { label: 'แก้ไขแล้ว', color: 'bg-green-100 text-green-800' },
    rejected: { label: 'ปฏิเสธ', color: 'bg-red-100 text-red-800' }
};

const SEVERITY_COLORS: Record<number, string> = {
    1: 'bg-green-500',
    2: 'bg-yellow-500',
    3: 'bg-orange-500',
    4: 'bg-red-500',
    5: 'bg-red-700'
};

const LiveIncidentFeed: React.FC = () => {
    const [incidents, setIncidents] = useState<IncidentReport[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedIncident, setSelectedIncident] = useState<IncidentReport | null>(null);
    const [isLive, setIsLive] = useState(true);

    // Fetch initial incidents
    useEffect(() => {
        const fetchIncidents = async () => {
            setIsLoading(true);
            try {
                const { data, error } = await supabase
                    .from('incident_reports')
                    .select('*')
                    .order('created_at', { ascending: false })
                    .limit(50);

                if (error) throw error;
                setIncidents(data as IncidentReport[]);
            } catch (error) {
                console.error('Error fetching incidents:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchIncidents();
    }, []);

    // Subscribe to realtime updates
    useEffect(() => {
        if (!isLive) return;

        const channel = supabase
            .channel('incident_reports_changes')
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'incident_reports'
                },
                (payload) => {
                    const newIncident = payload.new as IncidentReport;
                    setIncidents(prev => [newIncident, ...prev]);
                }
            )
            .on(
                'postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'incident_reports'
                },
                (payload) => {
                    const updatedIncident = payload.new as IncidentReport;
                    setIncidents(prev =>
                        prev.map(incident =>
                            incident.id === updatedIncident.id ? updatedIncident : incident
                        )
                    );
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [isLive]);

    const handleRefresh = async () => {
        setIsLoading(true);
        try {
            const { data, error } = await supabase
                .from('incident_reports')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(50);

            if (error) throw error;
            setIncidents(data as IncidentReport[]);
        } catch (error) {
            console.error('Error refreshing incidents:', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Card className="w-full">
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2 text-lg">
                        <Activity className="h-5 w-5 text-blue-600" />
                        รายงานเหตุการณ์แบบ Live
                    </CardTitle>
                    <div className="flex items-center gap-2">
                        <Badge
                            variant="outline"
                            className={isLive ? 'bg-green-50 text-green-700 border-green-200' : 'bg-gray-50'}
                        >
                            <div className={`w-2 h-2 rounded-full mr-1.5 ${isLive ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />
                            {isLive ? 'Live' : 'หยุด'}
                        </Badge>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => setIsLive(!isLive)}
                        >
                            {isLive ? '⏸️' : '▶️'}
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={handleRefresh}
                            disabled={isLoading}
                        >
                            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                        </Button>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="p-0">
                {isLoading && incidents.length === 0 ? (
                    <div className="flex items-center justify-center p-8">
                        <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                        <span className="ml-2 text-gray-500">กำลังโหลดรายงาน...</span>
                    </div>
                ) : incidents.length === 0 ? (
                    <div className="text-center p-8 text-gray-500">
                        <AlertTriangle className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                        <p>ยังไม่มีรายงานเหตุการณ์</p>
                    </div>
                ) : (
                    <ScrollArea className="h-[500px]">
                        <div className="divide-y divide-gray-100">
                            {incidents.map((incident) => (
                                <div
                                    key={incident.id}
                                    className={`p-4 hover:bg-gray-50 transition-colors cursor-pointer ${selectedIncident?.id === incident.id ? 'bg-blue-50' : ''
                                        }`}
                                    onClick={() => setSelectedIncident(
                                        selectedIncident?.id === incident.id ? null : incident
                                    )}
                                >
                                    {/* Header Row */}
                                    <div className="flex items-start justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                            <span className="text-lg">
                                                {INCIDENT_TYPE_ICONS[incident.type] || '⚠️'}
                                            </span>
                                            <div>
                                                <span className="font-medium text-gray-900">
                                                    {incident.title}
                                                </span>
                                                <Badge
                                                    variant="outline"
                                                    className="ml-2 text-xs"
                                                >
                                                    {INCIDENT_TYPE_LABELS[incident.type] || incident.type}
                                                </Badge>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className={`w-3 h-3 rounded-full ${SEVERITY_COLORS[incident.severity_level] || 'bg-gray-400'}`} />
                                            <Badge className={STATUS_CONFIG[incident.status]?.color || 'bg-gray-100'}>
                                                {STATUS_CONFIG[incident.status]?.label || incident.status}
                                            </Badge>
                                        </div>
                                    </div>

                                    {/* Description */}
                                    <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                                        {incident.description}
                                    </p>

                                    {/* Meta Row */}
                                    <div className="flex items-center gap-4 text-xs text-gray-500">
                                        <div className="flex items-center gap-1">
                                            <Clock className="h-3 w-3" />
                                            {formatDistanceToNow(new Date(incident.created_at), {
                                                addSuffix: true,
                                                locale: th
                                            })}
                                        </div>
                                        {incident.location && (
                                            <div className="flex items-center gap-1">
                                                <MapPin className="h-3 w-3" />
                                                <span className="truncate max-w-[150px]">{incident.location}</span>
                                            </div>
                                        )}
                                        {incident.image_urls && incident.image_urls.length > 0 && (
                                            <div className="flex items-center gap-1">
                                                <ImageIcon className="h-3 w-3" />
                                                {incident.image_urls.length} รูป
                                            </div>
                                        )}
                                        {incident.is_verified && (
                                            <div className="flex items-center gap-1 text-green-600">
                                                <CheckCircle className="h-3 w-3" />
                                                ยืนยันแล้ว
                                            </div>
                                        )}
                                    </div>

                                    {/* Expanded Details */}
                                    {selectedIncident?.id === incident.id && (
                                        <div className="mt-4 pt-4 border-t border-gray-100">
                                            {/* Images */}
                                            {incident.image_urls && incident.image_urls.length > 0 && (
                                                <div className="mb-4">
                                                    <p className="text-xs font-medium text-gray-500 mb-2">รูปภาพประกอบ</p>
                                                    <div className="flex gap-2 overflow-x-auto">
                                                        {incident.image_urls.map((url, index) => (
                                                            <img
                                                                key={index}
                                                                src={url}
                                                                alt={`รูปที่ ${index + 1}`}
                                                                className="h-20 w-20 object-cover rounded-lg border"
                                                            />
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Coordinates */}
                                            {incident.coordinates && (
                                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                                    <MapPin className="h-4 w-4" />
                                                    <span>
                                                        พิกัด: {incident.coordinates.lat.toFixed(6)}, {incident.coordinates.lng.toFixed(6)}
                                                    </span>
                                                    <a
                                                        href={`https://www.google.com/maps?q=${incident.coordinates.lat},${incident.coordinates.lng}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-blue-600 hover:underline"
                                                        onClick={(e) => e.stopPropagation()}
                                                    >
                                                        ดูบนแผนที่
                                                    </a>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </ScrollArea>
                )}
            </CardContent>
        </Card>
    );
};

export default LiveIncidentFeed;
