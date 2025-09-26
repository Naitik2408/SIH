import { useEffect } from 'react';
import { usePrefetchData } from '../contexts/DataContext';
import dataCacheService from '../services/dataCacheService';

// Smart prefetching hook for navigation
export const useSmartPrefetch = () => {
    const prefetch = usePrefetchData();

    // Prefetch data based on user behavior
    const prefetchOnHover = (pageType) => {
        switch (pageType) {
            case 'dashboard':
                prefetch.prefetchDashboardData();
                break;
            case 'geospatial':
                prefetch.prefetchGeospatialData();
                break;
            case 'demographics':
                prefetch.prefetchDemographicsData();
                break;
            case 'temporal':
                prefetch.prefetchTemporalData();
                break;
            case 'odmatrix':
                prefetch.prefetchODMatrixData();
                break;
            default:
                break;
        }
    };

    // Prefetch data based on current route
    const prefetchRelatedData = (currentRoute) => {
        switch (currentRoute) {
            case '/dashboard':
                // When on dashboard, prefetch geospatial and temporal data
                setTimeout(() => {
                    prefetch.prefetchGeospatialData();
                    prefetch.prefetchTemporalData();
                }, 2000);
                break;
            case '/geospatial':
                // When on geospatial, prefetch dashboard and demographics
                setTimeout(() => {
                    prefetch.prefetchDashboardData();
                    prefetch.prefetchDemographicsData();
                }, 2000);
                break;
            case '/demographics':
                // When on demographics, prefetch temporal and OD matrix
                setTimeout(() => {
                    prefetch.prefetchTemporalData();
                    prefetch.prefetchODMatrixData();
                }, 2000);
                break;
            default:
                break;
        }
    };

    // Smart prefetch based on time of day
    const prefetchByTimeOfDay = () => {
        const hour = new Date().getHours();

        // Morning hours (6-12): prefetch dashboard and geospatial
        if (hour >= 6 && hour < 12) {
            prefetch.prefetchDashboardData();
            prefetch.prefetchGeospatialData();
        }
        // Afternoon hours (12-18): prefetch demographics and temporal
        else if (hour >= 12 && hour < 18) {
            prefetch.prefetchDemographicsData();
            prefetch.prefetchTemporalData();
        }
        // Evening hours (18-24): prefetch all for next day
        else if (hour >= 18) {
            setTimeout(() => prefetch.prefetchAllData(), 1000);
        }
    };

    // Intelligent cache warming
    const warmCache = () => {
        const criticalData = ['dashboard-data', 'geospatial-data'];

        criticalData.forEach(key => {
            const cached = dataCacheService.get(key);
            if (!cached || cached.age > 5 * 60 * 1000) { // 5 minutes
                switch (key) {
                    case 'dashboard-data':
                        prefetch.prefetchDashboardData();
                        break;
                    case 'geospatial-data':
                        prefetch.prefetchGeospatialData();
                        break;
                }
            }
        });
    };

    return {
        prefetchOnHover,
        prefetchRelatedData,
        prefetchByTimeOfDay,
        warmCache,
    };
};

// Performance monitoring hook
export const usePerformanceMonitor = () => {
    useEffect(() => {
        // Monitor cache performance
        const logCacheStats = () => {
            const stats = dataCacheService.getStats();
            console.log('📊 Cache Performance:', {
                totalEntries: stats.totalEntries,
                activeEntries: stats.activeEntries,
                hitRate: stats.activeEntries / (stats.totalEntries || 1),
                totalSize: `${(stats.totalSize / 1024).toFixed(2)} KB`,
                avgSize: `${(stats.averageSize / 1024).toFixed(2)} KB`
            });
        };

        // Log performance every 5 minutes
        const interval = setInterval(logCacheStats, 5 * 60 * 1000);

        // Initial log
        setTimeout(logCacheStats, 2000);

        return () => clearInterval(interval);
    }, []);

    // Network performance monitoring
    useEffect(() => {
        if ('connection' in navigator) {
            const connection = navigator.connection;
            console.log('🌐 Network Info:', {
                effectiveType: connection.effectiveType,
                downlink: connection.downlink,
                rtt: connection.rtt,
                saveData: connection.saveData
            });

            // Adjust caching strategy based on connection
            if (connection.saveData || connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g') {
                console.log('📱 Slow connection detected, optimizing cache strategy');
                // Reduce cache sizes and increase TTL
            }
        }
    }, []);
};

// Background sync hook
export const useBackgroundSync = () => {
    const prefetch = usePrefetchData();

    useEffect(() => {
        // Background refresh every 10 minutes for critical data
        const backgroundRefresh = setInterval(() => {
            const criticalDataLoaders = {
                'dashboard-data': prefetch.prefetchDashboardData,
                'geospatial-data': prefetch.prefetchGeospatialData,
            };

            dataCacheService.smartRefresh(criticalDataLoaders, 8 * 60 * 1000); // 8 minutes staleness threshold
        }, 10 * 60 * 1000); // Every 10 minutes

        return () => clearInterval(backgroundRefresh);
    }, [prefetch]);

    // Sync on page visibility change
    useEffect(() => {
        const handleVisibilityChange = () => {
            if (!document.hidden) {
                // Page became visible, refresh stale data
                console.log('🔄 Page became visible, refreshing stale data');

                const dataLoaders = {
                    'dashboard-data': prefetch.prefetchDashboardData,
                    'geospatial-data': prefetch.prefetchGeospatialData,
                    'demographics-data': prefetch.prefetchDemographicsData,
                };

                dataCacheService.smartRefresh(dataLoaders, 5 * 60 * 1000); // 5 minutes staleness
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
    }, [prefetch]);

    // Preload on idle
    useEffect(() => {
        const preloadOnIdle = () => {
            if ('requestIdleCallback' in window) {
                requestIdleCallback(() => {
                    prefetch.prefetchAllData();
                });
            } else {
                // Fallback for browsers without requestIdleCallback
                setTimeout(() => {
                    prefetch.prefetchAllData();
                }, 3000);
            }
        };

        // Preload after initial page load
        const timer = setTimeout(preloadOnIdle, 2000);
        return () => clearTimeout(timer);
    }, [prefetch]);
};

export default {
    useSmartPrefetch,
    usePerformanceMonitor,
    useBackgroundSync,
};