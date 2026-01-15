
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useShelterData, Shelter } from '@/hooks/useShelterData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
    ArrowLeft,
    MapPin,
    Phone,
    Users,
    Navigation,
    Home,
    Building,
    Cross,
    Loader2,
    RefreshCw,
    Search,
    ChevronRight,
    Droplets,
    Utensils,
    Wifi,
    Zap
} from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

const SHELTER_TYPE_CONFIG: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
    temporary: { label: 'ชั่วคราว', icon: <Home className="h-4 w-4" />, color: 'bg-blue-100 text-blue-700' },
    permanent: { label: 'ถาวร', icon: <Building className="h-4 w-4" />, color: 'bg-green-100 text-green-700' },
    evacuation: { label: 'อพยพ', icon: <MapPin className="h-4 w-4" />, color: 'bg-orange-100 text-orange-700' },
    medical: { label: 'การแพทย์', icon: <Cross className="h-4 w-4" />, color: 'bg-red-100 text-red-700' }
};

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
    open: { label: 'เปิดรับ', color: 'bg-green-500' },
    closed: { label: 'ปิด', color: 'bg-gray-500' },
    full: { label: 'เต็ม', color: 'bg-red-500' }
};

const FACILITY_ICONS: Record<string, React.ReactNode> = {
    'น้ำดื่ม': <Droplets className="h-3 w-3" />,
    'อาหาร': <Utensils className="h-3 w-3" />,
    'อินเทอร์เน็ต': <Wifi className="h-3 w-3" />,
    'ไฟฟ้า': <Zap className="h-3 w-3" />
};

interface ShelterCardProps {
    shelter: Shelter;
    onNavigate: (shelter: Shelter) => void;
}

const ShelterCard: React.FC<ShelterCardProps> = ({ shelter, onNavigate }) => {
    const typeConfig = SHELTER_TYPE_CONFIG[shelter.type] || SHELTER_TYPE_CONFIG.temporary;
    const statusConfig = STATUS_CONFIG[shelter.status] || STATUS_CONFIG.closed;
    const occupancyPercent = shelter.current_occupancy && shelter.capacity
        ? Math.round((shelter.current_occupancy / shelter.capacity) * 100)
        : null;

    return (
        <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-4">
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                            <Badge className={typeConfig.color}>
                                {typeConfig.icon}
                                <span className="ml-1">{typeConfig.label}</span>
                            </Badge>
                            <div className={`w-2 h-2 rounded-full ${statusConfig.color}`} />
                        </div>
                        <h3 className="font-semibold text-gray-900">{shelter.name}</h3>
                    </div>
                    {shelter.distance_km !== undefined && (
                        <div className="text-right">
                            <span className="text-lg font-bold text-blue-600">
                                {shelter.distance_km.toFixed(1)}
                            </span>
                            <span className="text-xs text-gray-500 block">กม.</span>
                        </div>
                    )}
                </div>

                {/* Address */}
                <p className="text-sm text-gray-600 mb-3">{shelter.address}</p>

                {/* Capacity */}
                <div className="flex items-center gap-4 mb-3">
                    <div className="flex items-center gap-1.5 text-sm">
                        <Users className="h-4 w-4 text-gray-400" />
                        <span>
                            {shelter.current_occupancy || 0}/{shelter.capacity} คน
                        </span>
                    </div>
                    {occupancyPercent !== null && (
                        <div className="flex-1 bg-gray-100 rounded-full h-2 overflow-hidden">
                            <div
                                className={`h-full transition-all ${occupancyPercent > 80 ? 'bg-red-500' :
                                        occupancyPercent > 50 ? 'bg-yellow-500' : 'bg-green-500'
                                    }`}
                                style={{ width: `${Math.min(occupancyPercent, 100)}%` }}
                            />
                        </div>
                    )}
                </div>

                {/* Facilities */}
                <div className="flex flex-wrap gap-1.5 mb-3">
                    {shelter.facilities.slice(0, 5).map((facility, index) => (
                        <Badge key={index} variant="outline" className="text-xs py-0.5">
                            {FACILITY_ICONS[facility] || null}
                            <span className={FACILITY_ICONS[facility] ? 'ml-1' : ''}>{facility}</span>
                        </Badge>
                    ))}
                    {shelter.facilities.length > 5 && (
                        <Badge variant="outline" className="text-xs py-0.5">
                            +{shelter.facilities.length - 5}
                        </Badge>
                    )}
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                    {shelter.contact_phone && (
                        <Button
                            variant="outline"
                            size="sm"
                            className="flex-1"
                            onClick={(e) => {
                                e.stopPropagation();
                                window.location.href = `tel:${shelter.contact_phone}`;
                            }}
                        >
                            <Phone className="h-3.5 w-3.5 mr-1.5" />
                            โทร
                        </Button>
                    )}
                    <Button
                        size="sm"
                        className="flex-1 bg-blue-600 hover:bg-blue-700"
                        onClick={() => onNavigate(shelter)}
                    >
                        <Navigation className="h-3.5 w-3.5 mr-1.5" />
                        นำทาง
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
};

const ShelterFinder: React.FC = () => {
    const navigate = useNavigate();
    const isMobile = useIsMobile();
    const {
        isLoading,
        selectedProvince,
        setSelectedProvince,
        selectedType,
        setSelectedType,
        getFilteredShelters,
        getProvinces,
        refreshLocation
    } = useShelterData();

    const [searchQuery, setSearchQuery] = React.useState('');
    const shelters = getFilteredShelters();

    const filteredShelters = searchQuery
        ? shelters.filter(s =>
            s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            s.address.toLowerCase().includes(searchQuery.toLowerCase())
        )
        : shelters;

    const handleNavigate = (shelter: Shelter) => {
        const { lat, lng } = shelter.coordinates;
        window.open(
            `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`,
            '_blank'
        );
    };

    if (isMobile) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-teal-50 pb-24">
                {/* Header */}
                <header className="bg-gradient-to-r from-teal-500 via-emerald-500 to-green-500 text-white pt-6 pb-8 px-5 rounded-b-3xl shadow-xl">
                    <div className="flex items-center gap-3 mb-4">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="text-white/90 hover:bg-white/20 rounded-xl"
                            onClick={() => navigate('/')}
                        >
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                        <div className="flex items-center gap-3">
                            <div className="bg-white/20 p-2 rounded-xl backdrop-blur-sm">
                                <MapPin className="h-5 w-5" />
                            </div>
                            <div>
                                <h1 className="text-xl font-bold">ศูนย์พักพิง</h1>
                                <p className="text-white/70 text-xs">ค้นหาศูนย์พักพิงใกล้บ้านคุณ</p>
                            </div>
                        </div>
                    </div>

                    {/* Search */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                            placeholder="ค้นหาศูนย์พักพิง..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 bg-white/90 border-0 rounded-xl text-gray-800"
                        />
                    </div>
                </header>

                {/* Filters */}
                <div className="px-4 py-3 flex gap-2 overflow-x-auto no-scrollbar">
                    <Select value={selectedProvince} onValueChange={setSelectedProvince}>
                        <SelectTrigger className="w-[140px] rounded-full bg-white text-sm h-9">
                            <SelectValue placeholder="จังหวัด" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">ทุกจังหวัด</SelectItem>
                            {getProvinces().map(province => (
                                <SelectItem key={province} value={province}>{province}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <Select value={selectedType} onValueChange={setSelectedType}>
                        <SelectTrigger className="w-[120px] rounded-full bg-white text-sm h-9">
                            <SelectValue placeholder="ประเภท" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">ทุกประเภท</SelectItem>
                            <SelectItem value="temporary">ชั่วคราว</SelectItem>
                            <SelectItem value="evacuation">อพยพ</SelectItem>
                            <SelectItem value="medical">การแพทย์</SelectItem>
                        </SelectContent>
                    </Select>

                    <Button
                        variant="outline"
                        size="sm"
                        className="rounded-full h-9 px-3"
                        onClick={refreshLocation}
                    >
                        <RefreshCw className="h-4 w-4" />
                    </Button>
                </div>

                {/* Results */}
                <div className="px-4">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-sm text-gray-500">
                            {isLoading ? 'กำลังโหลด...' : `${filteredShelters.length} ศูนย์พักพิง`}
                        </span>
                    </div>

                    {isLoading ? (
                        <div className="flex items-center justify-center py-12">
                            <Loader2 className="h-6 w-6 animate-spin text-teal-600" />
                        </div>
                    ) : filteredShelters.length === 0 ? (
                        <div className="text-center py-12">
                            <MapPin className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                            <p className="text-gray-500">ไม่พบศูนย์พักพิง</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {filteredShelters.map(shelter => (
                                <ShelterCard
                                    key={shelter.id}
                                    shelter={shelter}
                                    onNavigate={handleNavigate}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        );
    }

    // Desktop view
    return (
        <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-emerald-50 p-6">
            <div className="max-w-4xl mx-auto">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                        <Button variant="outline" onClick={() => navigate('/')}>
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            กลับ
                        </Button>
                        <h1 className="text-2xl font-bold text-gray-900">ค้นหาศูนย์พักพิง</h1>
                    </div>
                    <Button onClick={refreshLocation}>
                        <RefreshCw className="h-4 w-4 mr-2" />
                        รีเฟรชตำแหน่ง
                    </Button>
                </div>

                {/* Filters */}
                <div className="flex gap-4 mb-6">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                            placeholder="ค้นหาชื่อหรือที่อยู่..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                    <Select value={selectedProvince} onValueChange={setSelectedProvince}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="เลือกจังหวัด" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">ทุกจังหวัด</SelectItem>
                            {getProvinces().map(province => (
                                <SelectItem key={province} value={province}>{province}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Select value={selectedType} onValueChange={setSelectedType}>
                        <SelectTrigger className="w-[150px]">
                            <SelectValue placeholder="ประเภท" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">ทุกประเภท</SelectItem>
                            <SelectItem value="temporary">ชั่วคราว</SelectItem>
                            <SelectItem value="evacuation">อพยพ</SelectItem>
                            <SelectItem value="medical">การแพทย์</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Results */}
                {isLoading ? (
                    <div className="flex items-center justify-center py-12">
                        <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
                    </div>
                ) : (
                    <div className="grid md:grid-cols-2 gap-4">
                        {filteredShelters.map(shelter => (
                            <ShelterCard
                                key={shelter.id}
                                shelter={shelter}
                                onNavigate={handleNavigate}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ShelterFinder;
