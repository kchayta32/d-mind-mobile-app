
import React, { useState, useRef, useEffect } from 'react';
import { Search, MapPin, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';

interface SearchResult {
  name: string;
  lat: number;
  lon: number;
  country: string;
  state?: string;
}

interface LocationSearchProps {
  onLocationSelect: (lat: number, lon: number, name: string) => void;
  className?: string;
}

export const LocationSearch: React.FC<LocationSearchProps> = ({ 
  onLocationSelect, 
  className = "" 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Close search when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const searchLocation = async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }

    setIsLoading(true);
    try {
      // Using OpenStreetMap Nominatim API for geocoding
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=5&countrycodes=th&addressdetails=1`
      );
      
      if (!response.ok) throw new Error('Search failed');
      
      const data = await response.json();
      const searchResults: SearchResult[] = data.map((item: any) => ({
        name: item.display_name,
        lat: parseFloat(item.lat),
        lon: parseFloat(item.lon),
        country: item.address?.country || 'Thailand',
        state: item.address?.state
      }));
      
      setResults(searchResults);
    } catch (error) {
      console.error('Location search error:', error);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (value: string) => {
    setQuery(value);
    
    // Debounce search
    const timeoutId = setTimeout(() => {
      searchLocation(value);
    }, 300);

    return () => clearTimeout(timeoutId);
  };

  const handleResultSelect = (result: SearchResult) => {
    onLocationSelect(result.lat, result.lon, result.name);
    setQuery('');
    setResults([]);
    setIsOpen(false);
  };

  const toggleSearch = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      setQuery('');
      setResults([]);
    }
  };

  return (
    <div ref={searchRef} className={`relative ${className}`}>
      {!isOpen ? (
        <Button
          onClick={toggleSearch}
          variant="outline"
          size="sm"
          className="bg-white/90 backdrop-blur border-gray-200 hover:bg-white"
        >
          <Search className="w-4 h-4 mr-2" />
          ค้นหาตำแหน่ง
        </Button>
      ) : (
        <Card className="bg-white/95 backdrop-blur shadow-lg border-gray-200">
          <CardContent className="p-3">
            <div className="flex items-center space-x-2 mb-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  ref={inputRef}
                  type="text"
                  placeholder="ค้นหาจังหวัด อำเภอ หรือตำแหน่ง..."
                  value={query}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10 pr-4 py-2 text-sm"
                />
                {isLoading && (
                  <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 animate-spin" />
                )}
              </div>
              <Button
                onClick={toggleSearch}
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            {results.length > 0 && (
              <div className="space-y-1 max-h-60 overflow-y-auto">
                {results.map((result, index) => (
                  <button
                    key={index}
                    onClick={() => handleResultSelect(result)}
                    className="w-full text-left p-2 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <div className="flex items-start space-x-2">
                      <MapPin className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-gray-900 truncate">
                          {result.name.split(',')[0]}
                        </div>
                        <div className="text-xs text-gray-600 truncate">
                          {result.name}
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {query && !isLoading && results.length === 0 && (
              <div className="text-sm text-gray-500 text-center py-2">
                ไม่พบผลการค้นหา
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};
