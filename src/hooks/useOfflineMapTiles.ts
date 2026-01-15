
import { useState, useEffect, useCallback, useRef } from 'react';

// IndexedDB configuration
const DB_NAME = 'dmind-offline-maps';
const DB_VERSION = 1;
const TILES_STORE = 'map-tiles';
const METADATA_STORE = 'cache-metadata';

interface TileData {
    key: string;
    url: string;
    blob: Blob;
    timestamp: number;
    zoomLevel: number;
    x: number;
    y: number;
}

interface CacheMetadata {
    id: string;
    name: string;
    bounds: { north: number; south: number; east: number; west: number };
    minZoom: number;
    maxZoom: number;
    tileCount: number;
    sizeBytes: number;
    createdAt: number;
    lastAccessed: number;
}

interface DownloadProgress {
    total: number;
    completed: number;
    failed: number;
    inProgress: boolean;
}

// Helper to open IndexedDB
const openDatabase = (): Promise<IDBDatabase> => {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result);

        request.onupgradeneeded = (event) => {
            const db = (event.target as IDBOpenDBRequest).result;

            // Create tiles store
            if (!db.objectStoreNames.contains(TILES_STORE)) {
                const tilesStore = db.createObjectStore(TILES_STORE, { keyPath: 'key' });
                tilesStore.createIndex('timestamp', 'timestamp', { unique: false });
                tilesStore.createIndex('zoomLevel', 'zoomLevel', { unique: false });
            }

            // Create metadata store
            if (!db.objectStoreNames.contains(METADATA_STORE)) {
                db.createObjectStore(METADATA_STORE, { keyPath: 'id' });
            }
        };
    });
};

// Generate tile key from URL
const getTileKey = (url: string): string => {
    return url.replace(/https?:\/\/[^/]+/, '');
};

// Parse tile coordinates from URL
const parseTileCoords = (url: string): { x: number; y: number; z: number } | null => {
    // Match common tile URL patterns like /z/x/y or z/x/y.png
    const match = url.match(/\/(\d+)\/(\d+)\/(\d+)/);
    if (match) {
        return { z: parseInt(match[1]), x: parseInt(match[2]), y: parseInt(match[3]) };
    }
    return null;
};

export const useOfflineMapTiles = () => {
    const [isOnline, setIsOnline] = useState(navigator.onLine);
    const [cacheSize, setCacheSize] = useState(0);
    const [tileCount, setTileCount] = useState(0);
    const [downloadProgress, setDownloadProgress] = useState<DownloadProgress>({
        total: 0, completed: 0, failed: 0, inProgress: false
    });
    const [cachedRegions, setCachedRegions] = useState<CacheMetadata[]>([]);
    const dbRef = useRef<IDBDatabase | null>(null);

    // Monitor online/offline status
    useEffect(() => {
        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    // Initialize database
    useEffect(() => {
        const initDB = async () => {
            try {
                dbRef.current = await openDatabase();
                await updateCacheStats();
                await loadCachedRegions();
            } catch (e) {
                console.error('Failed to initialize offline map database:', e);
            }
        };
        initDB();
    }, []);

    // Update cache statistics
    const updateCacheStats = useCallback(async () => {
        if (!dbRef.current) return;

        try {
            const tx = dbRef.current.transaction([TILES_STORE], 'readonly');
            const store = tx.objectStore(TILES_STORE);
            const countRequest = store.count();

            countRequest.onsuccess = () => {
                setTileCount(countRequest.result);
            };

            // Estimate size (rough approximation)
            const getAllRequest = store.getAll();
            getAllRequest.onsuccess = () => {
                const tiles = getAllRequest.result as TileData[];
                const totalSize = tiles.reduce((acc, tile) => acc + (tile.blob?.size || 0), 0);
                setCacheSize(totalSize);
            };
        } catch (e) {
            console.error('Error updating cache stats:', e);
        }
    }, []);

    // Load cached regions metadata
    const loadCachedRegions = useCallback(async () => {
        if (!dbRef.current) return;

        try {
            const tx = dbRef.current.transaction([METADATA_STORE], 'readonly');
            const store = tx.objectStore(METADATA_STORE);
            const request = store.getAll();

            request.onsuccess = () => {
                setCachedRegions(request.result);
            };
        } catch (e) {
            console.error('Error loading cached regions:', e);
        }
    }, []);

    // Get a tile from cache
    const getCachedTile = useCallback(async (url: string): Promise<Blob | null> => {
        if (!dbRef.current) return null;

        const key = getTileKey(url);

        return new Promise((resolve) => {
            try {
                const tx = dbRef.current!.transaction([TILES_STORE], 'readonly');
                const store = tx.objectStore(TILES_STORE);
                const request = store.get(key);

                request.onsuccess = () => {
                    const result = request.result as TileData | undefined;
                    resolve(result?.blob || null);
                };

                request.onerror = () => resolve(null);
            } catch (e) {
                resolve(null);
            }
        });
    }, []);

    // Cache a tile
    const cacheTile = useCallback(async (url: string, blob: Blob): Promise<void> => {
        if (!dbRef.current) return;

        const key = getTileKey(url);
        const coords = parseTileCoords(url);

        const tileData: TileData = {
            key,
            url,
            blob,
            timestamp: Date.now(),
            zoomLevel: coords?.z || 0,
            x: coords?.x || 0,
            y: coords?.y || 0
        };

        return new Promise((resolve, reject) => {
            try {
                const tx = dbRef.current!.transaction([TILES_STORE], 'readwrite');
                const store = tx.objectStore(TILES_STORE);
                const request = store.put(tileData);

                request.onsuccess = () => {
                    updateCacheStats();
                    resolve();
                };
                request.onerror = () => reject(request.error);
            } catch (e) {
                reject(e);
            }
        });
    }, [updateCacheStats]);

    // Download tiles for a region
    const downloadRegion = useCallback(async (
        bounds: { north: number; south: number; east: number; west: number },
        minZoom: number,
        maxZoom: number,
        regionName: string,
        tileUrlTemplate: string = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png'
    ): Promise<void> => {
        if (!dbRef.current) return;

        // Calculate tile coordinates for the region
        const tiles: { x: number; y: number; z: number }[] = [];

        for (let z = minZoom; z <= maxZoom; z++) {
            const n = Math.pow(2, z);
            const xMin = Math.floor(((bounds.west + 180) / 360) * n);
            const xMax = Math.floor(((bounds.east + 180) / 360) * n);
            const yMin = Math.floor((1 - Math.log(Math.tan(bounds.north * Math.PI / 180) + 1 / Math.cos(bounds.north * Math.PI / 180)) / Math.PI) / 2 * n);
            const yMax = Math.floor((1 - Math.log(Math.tan(bounds.south * Math.PI / 180) + 1 / Math.cos(bounds.south * Math.PI / 180)) / Math.PI) / 2 * n);

            for (let x = xMin; x <= xMax; x++) {
                for (let y = yMin; y <= yMax; y++) {
                    tiles.push({ x, y, z });
                }
            }
        }

        // Limit number of tiles (prevent downloading too many)
        const maxTiles = 5000;
        if (tiles.length > maxTiles) {
            console.warn(`Region has ${tiles.length} tiles, limiting to ${maxTiles}`);
            tiles.length = maxTiles;
        }

        setDownloadProgress({
            total: tiles.length,
            completed: 0,
            failed: 0,
            inProgress: true
        });

        let completedCount = 0;
        let failedCount = 0;
        let totalSize = 0;

        // Download tiles in batches
        const batchSize = 10;
        for (let i = 0; i < tiles.length; i += batchSize) {
            const batch = tiles.slice(i, i + batchSize);

            await Promise.allSettled(
                batch.map(async (tile) => {
                    const url = tileUrlTemplate
                        .replace('{z}', tile.z.toString())
                        .replace('{x}', tile.x.toString())
                        .replace('{y}', tile.y.toString());

                    try {
                        const response = await fetch(url);
                        if (response.ok) {
                            const blob = await response.blob();
                            await cacheTile(url, blob);
                            totalSize += blob.size;
                            completedCount++;
                        } else {
                            failedCount++;
                        }
                    } catch {
                        failedCount++;
                    }

                    setDownloadProgress(prev => ({
                        ...prev,
                        completed: completedCount,
                        failed: failedCount
                    }));
                })
            );
        }

        // Save region metadata
        const metadata: CacheMetadata = {
            id: `region-${Date.now()}`,
            name: regionName,
            bounds,
            minZoom,
            maxZoom,
            tileCount: completedCount,
            sizeBytes: totalSize,
            createdAt: Date.now(),
            lastAccessed: Date.now()
        };

        try {
            const tx = dbRef.current.transaction([METADATA_STORE], 'readwrite');
            const store = tx.objectStore(METADATA_STORE);
            await new Promise<void>((resolve, reject) => {
                const request = store.put(metadata);
                request.onsuccess = () => resolve();
                request.onerror = () => reject(request.error);
            });
            await loadCachedRegions();
        } catch (e) {
            console.error('Error saving region metadata:', e);
        }

        setDownloadProgress(prev => ({ ...prev, inProgress: false }));
        await updateCacheStats();
    }, [cacheTile, loadCachedRegions, updateCacheStats]);

    // Delete a cached region
    const deleteRegion = useCallback(async (regionId: string): Promise<void> => {
        if (!dbRef.current) return;

        try {
            // Delete metadata
            const tx = dbRef.current.transaction([METADATA_STORE], 'readwrite');
            const store = tx.objectStore(METADATA_STORE);
            await new Promise<void>((resolve, reject) => {
                const request = store.delete(regionId);
                request.onsuccess = () => resolve();
                request.onerror = () => reject(request.error);
            });

            await loadCachedRegions();
            await updateCacheStats();
        } catch (e) {
            console.error('Error deleting region:', e);
        }
    }, [loadCachedRegions, updateCacheStats]);

    // Clear all cached tiles
    const clearCache = useCallback(async (): Promise<void> => {
        if (!dbRef.current) return;

        try {
            const tx = dbRef.current.transaction([TILES_STORE, METADATA_STORE], 'readwrite');
            tx.objectStore(TILES_STORE).clear();
            tx.objectStore(METADATA_STORE).clear();

            await new Promise<void>((resolve) => {
                tx.oncomplete = () => resolve();
            });

            setCacheSize(0);
            setTileCount(0);
            setCachedRegions([]);
        } catch (e) {
            console.error('Error clearing cache:', e);
        }
    }, []);

    // Format size for display
    const formatSize = useCallback((bytes: number): string => {
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    }, []);

    return {
        isOnline,
        cacheSize,
        cacheSizeFormatted: formatSize(cacheSize),
        tileCount,
        downloadProgress,
        cachedRegions,
        getCachedTile,
        cacheTile,
        downloadRegion,
        deleteRegion,
        clearCache
    };
};

export default useOfflineMapTiles;
