
type RequestPriority = 'high' | 'normal' | 'low';

interface QueuedRequest {
    id: string;
    url: string;
    options: RequestInit;
    priority: RequestPriority;
    retryCount: number;
    maxRetries: number;
    resolve: (value: Response) => void;
    reject: (reason: Error) => void;
    timestamp: number;
}

interface CacheEntry {
    data: any;
    timestamp: number;
    ttl: number;
}

interface ApiClientConfig {
    baseUrl?: string;
    maxConcurrent?: number;
    defaultRetries?: number;
    defaultTimeout?: number;
    cacheEnabled?: boolean;
    defaultCacheTtl?: number;
}

const DEFAULT_CONFIG: Required<ApiClientConfig> = {
    baseUrl: '',
    maxConcurrent: 5,
    defaultRetries: 3,
    defaultTimeout: 30000,
    cacheEnabled: true,
    defaultCacheTtl: 5 * 60 * 1000 // 5 minutes
};

class ApiClient {
    private config: Required<ApiClientConfig>;
    private queue: QueuedRequest[] = [];
    private activeRequests = 0;
    private cache = new Map<string, CacheEntry>();
    private paused = false;

    constructor(config: ApiClientConfig = {}) {
        this.config = { ...DEFAULT_CONFIG, ...config };

        // Start queue processor
        this.processQueue();

        // Monitor network status
        if (typeof window !== 'undefined') {
            window.addEventListener('online', () => this.resume());
            window.addEventListener('offline', () => this.pause());
        }
    }

    // Add request to queue
    private enqueue(
        url: string,
        options: RequestInit = {},
        priority: RequestPriority = 'normal',
        maxRetries?: number
    ): Promise<Response> {
        return new Promise((resolve, reject) => {
            const request: QueuedRequest = {
                id: `req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                url: this.config.baseUrl ? `${this.config.baseUrl}${url}` : url,
                options,
                priority,
                retryCount: 0,
                maxRetries: maxRetries ?? this.config.defaultRetries,
                resolve,
                reject,
                timestamp: Date.now()
            };

            // Insert based on priority
            if (priority === 'high') {
                // High priority goes to front
                const insertIndex = this.queue.findIndex(r => r.priority !== 'high');
                if (insertIndex === -1) {
                    this.queue.push(request);
                } else {
                    this.queue.splice(insertIndex, 0, request);
                }
            } else if (priority === 'low') {
                // Low priority goes to back
                this.queue.push(request);
            } else {
                // Normal priority goes after high
                const insertIndex = this.queue.findIndex(r => r.priority === 'low');
                if (insertIndex === -1) {
                    this.queue.push(request);
                } else {
                    this.queue.splice(insertIndex, 0, request);
                }
            }
        });
    }

    // Process request queue
    private async processQueue() {
        while (true) {
            if (this.paused || this.queue.length === 0 || this.activeRequests >= this.config.maxConcurrent) {
                await this.sleep(100);
                continue;
            }

            const request = this.queue.shift();
            if (!request) continue;

            this.activeRequests++;
            this.executeRequest(request)
                .finally(() => {
                    this.activeRequests--;
                });
        }
    }

    // Execute a single request with retry logic
    private async executeRequest(request: QueuedRequest) {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), this.config.defaultTimeout);

        try {
            const response = await fetch(request.url, {
                ...request.options,
                signal: controller.signal
            });

            clearTimeout(timeout);

            if (response.ok) {
                request.resolve(response);
            } else if (response.status === 429) {
                // Rate limited - retry with exponential backoff
                await this.handleRateLimit(request, response);
            } else if (response.status >= 500 && request.retryCount < request.maxRetries) {
                // Server error - retry
                await this.retryRequest(request);
            } else {
                request.reject(new Error(`HTTP ${response.status}: ${response.statusText}`));
            }
        } catch (error) {
            clearTimeout(timeout);

            if ((error as Error).name === 'AbortError') {
                // Timeout - retry if possible
                if (request.retryCount < request.maxRetries) {
                    await this.retryRequest(request);
                } else {
                    request.reject(new Error('Request timeout'));
                }
            } else if (!navigator.onLine) {
                // Network error - re-queue
                this.queue.unshift(request);
                this.pause();
            } else if (request.retryCount < request.maxRetries) {
                await this.retryRequest(request);
            } else {
                request.reject(error as Error);
            }
        }
    }

    // Handle rate limiting
    private async handleRateLimit(request: QueuedRequest, response: Response) {
        const retryAfter = response.headers.get('Retry-After');
        const waitTime = retryAfter
            ? parseInt(retryAfter) * 1000
            : this.calculateBackoff(request.retryCount);

        console.warn(`Rate limited, waiting ${waitTime}ms before retry`);

        await this.sleep(waitTime);
        request.retryCount++;
        this.queue.unshift(request);
    }

    // Retry request with exponential backoff
    private async retryRequest(request: QueuedRequest) {
        const backoff = this.calculateBackoff(request.retryCount);
        console.log(`Retrying request (attempt ${request.retryCount + 1}), waiting ${backoff}ms`);

        await this.sleep(backoff);
        request.retryCount++;
        this.queue.unshift(request);
    }

    // Calculate exponential backoff
    private calculateBackoff(retryCount: number): number {
        // Exponential backoff with jitter: 1s, 2s, 4s, 8s...
        const base = Math.pow(2, retryCount) * 1000;
        const jitter = Math.random() * 1000;
        return Math.min(base + jitter, 30000); // Max 30 seconds
    }

    // Sleep helper
    private sleep(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // Pause queue processing
    pause() {
        this.paused = true;
        console.log('API client paused (offline)');
    }

    // Resume queue processing
    resume() {
        this.paused = false;
        console.log('API client resumed (online)');
    }

    // Get from cache
    private getFromCache(key: string): any | null {
        if (!this.config.cacheEnabled) return null;

        const entry = this.cache.get(key);
        if (!entry) return null;

        if (Date.now() - entry.timestamp > entry.ttl) {
            this.cache.delete(key);
            return null;
        }

        return entry.data;
    }

    // Set cache
    private setCache(key: string, data: any, ttl?: number) {
        if (!this.config.cacheEnabled) return;

        this.cache.set(key, {
            data,
            timestamp: Date.now(),
            ttl: ttl ?? this.config.defaultCacheTtl
        });
    }

    // Clear cache
    clearCache() {
        this.cache.clear();
    }

    // GET request with caching
    async get<T>(
        url: string,
        options: {
            priority?: RequestPriority;
            cache?: boolean;
            cacheTtl?: number;
            headers?: Record<string, string>;
        } = {}
    ): Promise<T> {
        const cacheKey = url;

        // Check cache first
        if (options.cache !== false) {
            const cached = this.getFromCache(cacheKey);
            if (cached !== null) {
                return cached as T;
            }
        }

        const response = await this.enqueue(
            url,
            {
                method: 'GET',
                headers: options.headers
            },
            options.priority
        );

        const data = await response.json();

        // Cache the response
        if (options.cache !== false) {
            this.setCache(cacheKey, data, options.cacheTtl);
        }

        return data as T;
    }

    // POST request
    async post<T>(
        url: string,
        body: any,
        options: {
            priority?: RequestPriority;
            headers?: Record<string, string>;
        } = {}
    ): Promise<T> {
        const response = await this.enqueue(
            url,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers
                },
                body: JSON.stringify(body)
            },
            options.priority
        );

        return response.json();
    }

    // Get queue status
    getStatus() {
        return {
            queueLength: this.queue.length,
            activeRequests: this.activeRequests,
            isPaused: this.paused,
            cacheSize: this.cache.size
        };
    }
}

// Create singleton instance
export const apiClient = new ApiClient();

export default ApiClient;
