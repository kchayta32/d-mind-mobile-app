/**
 * Map Style Configuration for MapLibre GL
 * 
 * Currently using OSM Raster tiles (no API key required).
 * To use vector tiles with better performance and styling:
 * 
 * 1. Get a free API key from MapTiler (https://www.maptiler.com/)
 * 2. Set VITE_MAPTILER_API_KEY in your .env file
 * 3. The map will automatically use vector tiles if the key is present
 */

const MAPTILER_API_KEY = import.meta.env.VITE_MAPTILER_API_KEY;

// OSM Raster Style (default, no API key required)
export const osmRasterStyle = {
    version: 8 as const,
    sources: {
        'osm': {
            type: 'raster' as const,
            tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
            tileSize: 256,
            attribution: '© OpenStreetMap Contributors'
        }
    },
    layers: [
        {
            id: 'osm',
            type: 'raster' as const,
            source: 'osm',
            paint: {}
        }
    ]
};

// CartoDB Light Style (good for data visualization)
export const cartoLightStyle = {
    version: 8 as const,
    sources: {
        'carto': {
            type: 'raster' as const,
            tiles: ['https://basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png'],
            tileSize: 256,
            attribution: '© CARTO'
        }
    },
    layers: [
        {
            id: 'carto-light',
            type: 'raster' as const,
            source: 'carto',
            paint: {}
        }
    ]
};

// CartoDB Dark Style (for dark mode)
export const cartoDarkStyle = {
    version: 8 as const,
    sources: {
        'carto-dark': {
            type: 'raster' as const,
            tiles: ['https://basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png'],
            tileSize: 256,
            attribution: '© CARTO'
        }
    },
    layers: [
        {
            id: 'carto-dark',
            type: 'raster' as const,
            source: 'carto-dark',
            paint: {}
        }
    ]
};

// MapTiler Vector Style (requires API key, best performance)
export const getMaptilerStyle = (style: 'streets' | 'satellite' | 'outdoor' = 'streets') => {
    if (!MAPTILER_API_KEY) {
        console.warn('MapTiler API key not found, falling back to OSM raster');
        return osmRasterStyle;
    }
    return `https://api.maptiler.com/maps/${style}/style.json?key=${MAPTILER_API_KEY}`;
};

// Get the appropriate map style based on environment
export const getMapStyle = (preferDark = false) => {
    // If MapTiler key is available, use vector tiles
    if (MAPTILER_API_KEY) {
        return getMaptilerStyle('streets');
    }

    // Otherwise use CartoDB (cleaner than OSM for data visualization)
    return preferDark ? cartoDarkStyle : cartoLightStyle;
};

// Default export for simple usage
export default getMapStyle;
