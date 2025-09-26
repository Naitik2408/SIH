// Advanced Data Caching Service
// Provides additional caching layer with localStorage persistence and smart invalidation

class DataCacheService {
    constructor() {
        this.memoryCache = new Map();
        this.cacheMetadata = new Map();
        this.defaultTTL = 5 * 60 * 1000; // 5 minutes default TTL

        // Initialize from localStorage on startup
        this.loadFromLocalStorage();

        // Setup periodic cleanup
        this.setupCleanupInterval();
    }

    // Cache key generators
    static generateKey(type, params = {}) {
        const paramStr = Object.keys(params).length > 0
            ? JSON.stringify(params)
            : '';
        return `${type}_${paramStr}`;
    }

    // Set data in cache with TTL
    set(key, data, ttl = this.defaultTTL) {
        const now = Date.now();
        const expiry = now + ttl;

        const cacheEntry = {
            data,
            timestamp: now,
            expiry,
            accessCount: 0,
            lastAccessed: now
        };

        // Store in memory cache
        this.memoryCache.set(key, cacheEntry);
        this.cacheMetadata.set(key, {
            size: JSON.stringify(data).length,
            ttl,
            created: now
        });

        // Persist important data to localStorage
        if (this.shouldPersist(key)) {
            this.persistToLocalStorage(key, cacheEntry);
        }

        return true;
    }

    // Get data from cache
    get(key, options = {}) {
        const { allowExpired = false, updateAccess = true } = options;

        // Try memory cache first
        let cacheEntry = this.memoryCache.get(key);

        // If not in memory, try localStorage
        if (!cacheEntry) {
            cacheEntry = this.loadFromLocalStorageKey(key);
            if (cacheEntry) {
                this.memoryCache.set(key, cacheEntry);
            }
        }

        if (!cacheEntry) {
            return null;
        }

        const now = Date.now();

        // Check if expired
        if (!allowExpired && now > cacheEntry.expiry) {
            this.delete(key);
            return null;
        }

        // Update access statistics
        if (updateAccess) {
            cacheEntry.accessCount++;
            cacheEntry.lastAccessed = now;
        }

        return {
            data: cacheEntry.data,
            isExpired: now > cacheEntry.expiry,
            age: now - cacheEntry.timestamp,
            accessCount: cacheEntry.accessCount
        };
    }

    // Check if data exists and is valid
    has(key) {
        const entry = this.get(key, { updateAccess: false });
        return entry !== null && !entry.isExpired;
    }

    // Delete data from cache
    delete(key) {
        this.memoryCache.delete(key);
        this.cacheMetadata.delete(key);
        this.removeFromLocalStorage(key);
        return true;
    }

    // Clear all cache
    clear() {
        this.memoryCache.clear();
        this.cacheMetadata.clear();
        this.clearLocalStorage();
    }

    // Get cache statistics
    getStats() {
        const now = Date.now();
        let totalSize = 0;
        let activeEntries = 0;
        let expiredEntries = 0;

        for (const [key, entry] of this.memoryCache.entries()) {
            const metadata = this.cacheMetadata.get(key);
            if (metadata) {
                totalSize += metadata.size;
            }

            if (now <= entry.expiry) {
                activeEntries++;
            } else {
                expiredEntries++;
            }
        }

        return {
            totalEntries: this.memoryCache.size,
            activeEntries,
            expiredEntries,
            totalSize,
            averageSize: this.memoryCache.size > 0 ? totalSize / this.memoryCache.size : 0
        };
    }

    // Get all cache keys
    keys() {
        return Array.from(this.memoryCache.keys());
    }

    // Invalidate cache entries by pattern
    invalidatePattern(pattern) {
        const regex = new RegExp(pattern);
        const keysToDelete = [];

        for (const key of this.memoryCache.keys()) {
            if (regex.test(key)) {
                keysToDelete.push(key);
            }
        }

        keysToDelete.forEach(key => this.delete(key));
        return keysToDelete.length;
    }

    // Update TTL for existing entry
    updateTTL(key, newTTL) {
        const entry = this.memoryCache.get(key);
        if (entry) {
            const now = Date.now();
            entry.expiry = now + newTTL;

            const metadata = this.cacheMetadata.get(key);
            if (metadata) {
                metadata.ttl = newTTL;
            }

            if (this.shouldPersist(key)) {
                this.persistToLocalStorage(key, entry);
            }

            return true;
        }
        return false;
    }

    // Private methods for localStorage persistence
    shouldPersist(key) {
        // Persist dashboard and geospatial data for faster startup
        return key.includes('dashboard') ||
            key.includes('geospatial') ||
            key.includes('demographics');
    }

    persistToLocalStorage(key, entry) {
        try {
            const storageKey = `scientist_cache_${key}`;
            const storageData = {
                ...entry,
                _cached: true
            };
            localStorage.setItem(storageKey, JSON.stringify(storageData));
        } catch (error) {
            console.warn('Failed to persist to localStorage:', error);
        }
    }

    loadFromLocalStorageKey(key) {
        try {
            const storageKey = `scientist_cache_${key}`;
            const stored = localStorage.getItem(storageKey);
            if (stored) {
                const parsed = JSON.parse(stored);
                if (parsed._cached) {
                    delete parsed._cached;
                    return parsed;
                }
            }
        } catch (error) {
            console.warn('Failed to load from localStorage:', error);
        }
        return null;
    }

    loadFromLocalStorage() {
        try {
            const keys = Object.keys(localStorage);
            for (const storageKey of keys) {
                if (storageKey.startsWith('scientist_cache_')) {
                    const cacheKey = storageKey.replace('scientist_cache_', '');
                    const entry = this.loadFromLocalStorageKey(cacheKey);
                    if (entry && Date.now() <= entry.expiry) {
                        this.memoryCache.set(cacheKey, entry);
                        this.cacheMetadata.set(cacheKey, {
                            size: JSON.stringify(entry.data).length,
                            ttl: entry.expiry - entry.timestamp,
                            created: entry.timestamp
                        });
                    } else if (entry) {
                        // Remove expired entries
                        this.removeFromLocalStorage(cacheKey);
                    }
                }
            }
        } catch (error) {
            console.warn('Failed to load cache from localStorage:', error);
        }
    }

    removeFromLocalStorage(key) {
        try {
            const storageKey = `scientist_cache_${key}`;
            localStorage.removeItem(storageKey);
        } catch (error) {
            console.warn('Failed to remove from localStorage:', error);
        }
    }

    clearLocalStorage() {
        try {
            const keys = Object.keys(localStorage);
            for (const key of keys) {
                if (key.startsWith('scientist_cache_')) {
                    localStorage.removeItem(key);
                }
            }
        } catch (error) {
            console.warn('Failed to clear localStorage:', error);
        }
    }

    // Setup periodic cleanup of expired entries
    setupCleanupInterval() {
        // Clean up every 2 minutes
        setInterval(() => {
            this.cleanupExpired();
        }, 2 * 60 * 1000);
    }

    cleanupExpired() {
        const now = Date.now();
        const expiredKeys = [];

        for (const [key, entry] of this.memoryCache.entries()) {
            if (now > entry.expiry) {
                expiredKeys.push(key);
            }
        }

        expiredKeys.forEach(key => this.delete(key));

        if (expiredKeys.length > 0) {
            console.log(`Cleaned up ${expiredKeys.length} expired cache entries`);
        }
    }

    // Preload data with smart strategies
    async preloadData(dataLoaders) {
        const preloadPromises = [];

        for (const [key, loader] of Object.entries(dataLoaders)) {
            if (!this.has(key)) {
                const promise = loader().then(data => {
                    this.set(key, data);
                    return { key, success: true };
                }).catch(error => {
                    console.warn(`Failed to preload ${key}:`, error);
                    return { key, success: false, error };
                });

                preloadPromises.push(promise);
            }
        }

        return Promise.all(preloadPromises);
    }

    // Smart refresh - only refresh stale data
    async smartRefresh(dataLoaders, stalenessThreshold = 2 * 60 * 1000) {
        const now = Date.now();
        const refreshPromises = [];

        for (const [key, loader] of Object.entries(dataLoaders)) {
            const cached = this.get(key, { updateAccess: false });

            if (!cached || cached.age > stalenessThreshold) {
                const promise = loader().then(data => {
                    this.set(key, data);
                    return { key, refreshed: true };
                }).catch(error => {
                    console.warn(`Failed to refresh ${key}:`, error);
                    return { key, refreshed: false, error };
                });

                refreshPromises.push(promise);
            }
        }

        return Promise.all(refreshPromises);
    }
}

// Create singleton instance
const dataCacheService = new DataCacheService();

export default dataCacheService;

// Named exports for convenience
export {
    DataCacheService,
    dataCacheService
};