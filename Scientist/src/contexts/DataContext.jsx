import React, { createContext, useContext, useCallback } from 'react';
import { QueryClient, QueryClientProvider, useQuery, useQueryClient } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { generateDashboardData } from '../utils/dashboardAnalytics';
import { generateGeospatialData } from '../utils/geospatialMigration';
import { generateDemographicsData } from '../utils/demographicsAnalytics';
import { generateTemporalData } from '../utils/temporalAnalytics';
import { generateODMatrixData } from '../utils/odMatrixAnalytics';

// Create Query Client with optimized configuration
const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 5 * 60 * 1000, // 5 minutes - data is considered fresh for 5 minutes
            gcTime: 10 * 60 * 1000, // 10 minutes - cache time (formerly cacheTime)
            retry: 3,
            retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
            refetchOnWindowFocus: false,
            refetchOnReconnect: true,
            refetchIntervalInBackground: false,
        },
        mutations: {
            retry: 1,
        },
    },
});

// Data Context
const DataContext = createContext({});

// Cache Keys - centralized for consistency
export const CACHE_KEYS = {
    DASHBOARD_DATA: 'dashboard-data',
    GEOSPATIAL_DATA: 'geospatial-data',
    DEMOGRAPHICS_DATA: 'demographics-data',
    TEMPORAL_DATA: 'temporal-data',
    OD_MATRIX_DATA: 'od-matrix-data',
    USER_JOURNEYS: 'user-journeys',
    PERFORMANCE_METRICS: 'performance-metrics',
};

// Custom hook for dashboard data
export const useDashboardData = () => {
    return useQuery({
        queryKey: [CACHE_KEYS.DASHBOARD_DATA],
        queryFn: async () => {
            const data = await generateDashboardData();
            return data;
        },
        staleTime: 3 * 60 * 1000, // 3 minutes for dashboard (more frequent updates)
        select: (data) => ({
            ...data,
            lastFetched: new Date().toISOString(),
        }),
    });
};

// Custom hook for geospatial data
export const useGeospatialData = () => {
    return useQuery({
        queryKey: [CACHE_KEYS.GEOSPATIAL_DATA],
        queryFn: async () => {
            const data = await generateGeospatialData();
            return data;
        },
        staleTime: 10 * 60 * 1000, // 10 minutes for geospatial (less frequent changes)
    });
};

// Custom hook for demographics data
export const useDemographicsData = () => {
    return useQuery({
        queryKey: [CACHE_KEYS.DEMOGRAPHICS_DATA],
        queryFn: async () => {
            const data = await generateDemographicsData();
            return data;
        },
        staleTime: 15 * 60 * 1000, // 15 minutes for demographics
    });
};

// Custom hook for temporal data
export const useTemporalData = () => {
    return useQuery({
        queryKey: [CACHE_KEYS.TEMPORAL_DATA],
        queryFn: async () => {
            const data = await generateTemporalData();
            return data;
        },
        staleTime: 8 * 60 * 1000, // 8 minutes for temporal data
    });
};

// Custom hook for OD Matrix data
export const useODMatrixData = () => {
    return useQuery({
        queryKey: [CACHE_KEYS.OD_MATRIX_DATA],
        queryFn: async () => {
            const data = await generateODMatrixData();
            return data;
        },
        staleTime: 12 * 60 * 1000, // 12 minutes for OD matrix
    });
};

// Prefetch functions for data preloading
export const usePrefetchData = () => {
    const queryClient = useQueryClient();

    const prefetchDashboardData = useCallback(() => {
        queryClient.prefetchQuery({
            queryKey: [CACHE_KEYS.DASHBOARD_DATA],
            queryFn: generateDashboardData,
            staleTime: 3 * 60 * 1000,
        });
    }, [queryClient]);

    const prefetchGeospatialData = useCallback(() => {
        queryClient.prefetchQuery({
            queryKey: [CACHE_KEYS.GEOSPATIAL_DATA],
            queryFn: generateGeospatialData,
            staleTime: 10 * 60 * 1000,
        });
    }, [queryClient]);

    const prefetchDemographicsData = useCallback(() => {
        queryClient.prefetchQuery({
            queryKey: [CACHE_KEYS.DEMOGRAPHICS_DATA],
            queryFn: generateDemographicsData,
            staleTime: 15 * 60 * 1000,
        });
    }, [queryClient]);

    const prefetchTemporalData = useCallback(() => {
        queryClient.prefetchQuery({
            queryKey: [CACHE_KEYS.TEMPORAL_DATA],
            queryFn: generateTemporalData,
            staleTime: 8 * 60 * 1000,
        });
    }, [queryClient]);

    const prefetchODMatrixData = useCallback(() => {
        queryClient.prefetchQuery({
            queryKey: [CACHE_KEYS.OD_MATRIX_DATA],
            queryFn: generateODMatrixData,
            staleTime: 12 * 60 * 1000,
        });
    }, [queryClient]);

    const prefetchAllData = useCallback(() => {
        prefetchDashboardData();
        prefetchGeospatialData();
        prefetchDemographicsData();
        prefetchTemporalData();
        prefetchODMatrixData();
    }, [
        prefetchDashboardData,
        prefetchGeospatialData,
        prefetchDemographicsData,
        prefetchTemporalData,
        prefetchODMatrixData,
    ]);

    return {
        prefetchDashboardData,
        prefetchGeospatialData,
        prefetchDemographicsData,
        prefetchTemporalData,
        prefetchODMatrixData,
        prefetchAllData,
    };
};

// Cache management utilities
export const useCacheManager = () => {
    const queryClient = useQueryClient();

    const invalidateData = useCallback(
        (cacheKey) => {
            queryClient.invalidateQueries({ queryKey: [cacheKey] });
        },
        [queryClient]
    );

    const invalidateAllData = useCallback(() => {
        Object.values(CACHE_KEYS).forEach((key) => {
            queryClient.invalidateQueries({ queryKey: [key] });
        });
    }, [queryClient]);

    const clearCache = useCallback(() => {
        queryClient.clear();
    }, [queryClient]);

    const getCacheData = useCallback(
        (cacheKey) => {
            return queryClient.getQueryData([cacheKey]);
        },
        [queryClient]
    );

    const setCacheData = useCallback(
        (cacheKey, data) => {
            queryClient.setQueryData([cacheKey], data);
        },
        [queryClient]
    );

    return {
        invalidateData,
        invalidateAllData,
        clearCache,
        getCacheData,
        setCacheData,
    };
};

// Data Provider Component
const DataProvider = ({ children }) => {
    const prefetch = usePrefetchData();
    const cacheManager = useCacheManager();

    const contextValue = {
        prefetch,
        cacheManager,
        queryClient,
    };

    return (
        <DataContext.Provider value={contextValue}>
            {children}
        </DataContext.Provider>
    );
};

// Hook to use data context
export const useDataContext = () => {
    const context = useContext(DataContext);
    if (!context) {
        throw new Error('useDataContext must be used within a DataProvider');
    }
    return context;
};

// Main Provider Component with Query Client
export const AppDataProvider = ({ children }) => {
    return (
        <QueryClientProvider client={queryClient}>
            <DataProvider>
                {children}
                <ReactQueryDevtools initialIsOpen={false} />
            </DataProvider>
        </QueryClientProvider>
    );
};

export default AppDataProvider;