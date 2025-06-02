
import React, { useState } from 'react';
import { useMap } from 'react-leaflet';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LocateFixed, Search, MapPin } from 'lucide-react';
import { toast } from "@/components/ui/use-toast";

interface LocationControlsProps {
  onLocationFound?: (lat: number, lng: number) => void;
}

export const LocationControls: React.FC<LocationControlsProps> = ({ onLocationFound }) => {
  const map = useMap();
  const [searchQuery, setSearchQuery] = useState('');
  const [isLocating, setIsLocating] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast({
        title: "ไม่รองรับ GPS",
        description: "เบราว์เซอร์ของคุณไม่รองรับการระบุตำแหน่ง",
        variant: "destructive",
      });
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        map.flyTo([latitude, longitude], 14);
        onLocationFound?.(latitude, longitude);
        
        toast({
          title: "พบตำแหน่งแล้ว",
          description: `ละติจูด: ${latitude.toFixed(4)}, ลองจิจูด: ${longitude.toFixed(4)}`,
        });
        setIsLocating(false);
      },
      (error) => {
        console.error('Error getting location:', error);
        toast({
          title: "ไม่สามารถระบุตำแหน่งได้",
          description: "กรุณาอนุญาตการเข้าถึงตำแหน่งหรือลองใหม่อีกครั้ง",
          variant: "destructive",
        });
        setIsLocating(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
      }
    );
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      toast({
        title: "กรุณาใส่ข้อมูลค้นหา",
        description: "พิมพ์ชื่อสถานที่ที่ต้องการค้นหา",
        variant: "destructive",
      });
      return;
    }

    setIsSearching(true);
    
    try {
      // Use Nominatim API for geocoding
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&countrycodes=th&limit=1`
      );
      
      const data = await response.json();
      
      if (data && data.length > 0) {
        const result = data[0];
        const lat = parseFloat(result.lat);
        const lng = parseFloat(result.lon);
        
        map.flyTo([lat, lng], 14);
        onLocationFound?.(lat, lng);
        
        toast({
          title: "พบตำแหน่งแล้ว",
          description: result.display_name,
        });
      } else {
        toast({
          title: "ไม่พบตำแหน่ง",
          description: "ไม่สามารถค้นหาตำแหน่งที่ระบุได้",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Search error:', error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถค้นหาตำแหน่งได้ในขณะนี้",
        variant: "destructive",
      });
    }
    
    setIsSearching(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="absolute top-4 left-4 z-[1000] bg-white rounded-lg shadow-lg p-3 space-y-2 min-w-[280px]">
      {/* Search Input */}
      <div className="flex gap-2">
        <Input
          type="text"
          placeholder="ค้นหาตำแหน่ง..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyPress={handleKeyPress}
          className="flex-1"
          disabled={isSearching}
        />
        <Button
          variant="outline"
          size="sm"
          onClick={handleSearch}
          disabled={isSearching}
          className="px-3"
        >
          {isSearching ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500" />
          ) : (
            <Search className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Current Location Button */}
      <Button
        variant="outline"
        size="sm"
        onClick={handleGetCurrentLocation}
        disabled={isLocating}
        className="w-full flex items-center gap-2"
      >
        {isLocating ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500" />
            กำลังค้นหา...
          </>
        ) : (
          <>
            <LocateFixed className="h-4 w-4" />
            ตำแหน่งของฉัน
          </>
        )}
      </Button>
    </div>
  );
};
