import React from 'react';

// Generic Skeleton Component
export const Skeleton = ({
    className = '',
    width = '100%',
    height = '1rem',
    variant = 'rectangular'
}) => {
    const baseClasses = 'animate-pulse bg-gray-200 rounded';

    const variantClasses = {
        rectangular: 'rounded',
        circular: 'rounded-full',
        text: 'rounded h-4'
    };

    return (
        <div
            className={`${baseClasses} ${variantClasses[variant]} ${className}`}
            style={{ width, height }}
        />
    );
};

// Dashboard specific skeletons
export const DashboardSkeleton = () => {
    return (
        <div className="p-6 space-y-6">
            {/* Header Skeleton */}
            <div className="space-y-2">
                <Skeleton width="300px" height="2rem" />
                <Skeleton width="500px" height="1rem" />
            </div>

            {/* KPI Cards Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="p-6 border rounded-lg space-y-4">
                        <div className="flex items-center justify-between">
                            <Skeleton width="40px" height="40px" variant="circular" />
                            <Skeleton width="60px" height="20px" />
                        </div>
                        <div className="space-y-2">
                            <Skeleton width="80px" height="2rem" />
                            <Skeleton width="120px" height="1rem" />
                        </div>
                    </div>
                ))}
            </div>

            {/* Charts Skeleton */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="p-6 border rounded-lg space-y-4">
                        <div className="flex items-center justify-between">
                            <Skeleton width="200px" height="1.5rem" />
                            <Skeleton width="100px" height="30px" />
                        </div>
                        <Skeleton width="100%" height="300px" />
                    </div>
                ))}
            </div>

            {/* Performance Metrics Skeleton */}
            <div className="p-6 border rounded-lg space-y-4">
                <Skeleton width="250px" height="1.5rem" />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[...Array(6)].map((_, i) => (
                        <div key={i} className="space-y-2">
                            <Skeleton width="100px" height="1rem" />
                            <Skeleton width="80px" height="1.5rem" />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

// Geospatial specific skeletons
export const GeospatialSkeleton = () => {
    return (
        <div className="p-6 space-y-6">
            {/* Header Skeleton */}
            <div className="space-y-2">
                <Skeleton width="400px" height="2rem" />
                <Skeleton width="600px" height="1rem" />
            </div>

            {/* Controls Skeleton */}
            <div className="flex flex-wrap gap-4 p-4 border rounded-lg">
                <Skeleton width="150px" height="40px" />
                <Skeleton width="150px" height="40px" />
                <Skeleton width="200px" height="40px" />
                <Skeleton width="100px" height="40px" />
            </div>

            {/* Map and Analytics Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Map Skeleton */}
                <div className="lg:col-span-2">
                    <div className="p-4 border rounded-lg">
                        <Skeleton width="100%" height="500px" />
                    </div>
                </div>

                {/* Analytics Panel Skeleton */}
                <div className="space-y-4">
                    <div className="p-4 border rounded-lg space-y-3">
                        <Skeleton width="150px" height="1.5rem" />
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="space-y-1">
                                <Skeleton width="120px" height="1rem" />
                                <Skeleton width="80px" height="1.5rem" />
                            </div>
                        ))}
                    </div>

                    <div className="p-4 border rounded-lg space-y-3">
                        <Skeleton width="180px" height="1.5rem" />
                        <Skeleton width="100%" height="200px" />
                    </div>
                </div>
            </div>

            {/* Insights Section Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="p-4 border rounded-lg space-y-3">
                        <Skeleton width="200px" height="1.25rem" />
                        <Skeleton width="100%" height="1rem" />
                        <Skeleton width="80%" height="1rem" />
                        <div className="flex justify-between items-center pt-2">
                            <Skeleton width="60px" height="1rem" />
                            <Skeleton width="40px" height="20px" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

// Chart Skeleton Component
export const ChartSkeleton = ({ height = '300px' }) => {
    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <Skeleton width="200px" height="1.5rem" />
                <Skeleton width="100px" height="30px" />
            </div>
            <Skeleton width="100%" height={height} />
            <div className="flex justify-center space-x-4">
                {[...Array(3)].map((_, i) => (
                    <div key={i} className="flex items-center space-x-2">
                        <Skeleton width="12px" height="12px" variant="circular" />
                        <Skeleton width="60px" height="1rem" />
                    </div>
                ))}
            </div>
        </div>
    );
};

// Table Skeleton Component
export const TableSkeleton = ({ rows = 5, columns = 4 }) => {
    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex space-x-4 pb-2 border-b">
                {[...Array(columns)].map((_, i) => (
                    <Skeleton key={i} width="120px" height="1rem" />
                ))}
            </div>

            {/* Rows */}
            {[...Array(rows)].map((_, rowIndex) => (
                <div key={rowIndex} className="flex space-x-4">
                    {[...Array(columns)].map((_, colIndex) => (
                        <Skeleton key={colIndex} width="120px" height="1rem" />
                    ))}
                </div>
            ))}
        </div>
    );
};

// Card Skeleton Component
export const CardSkeleton = () => {
    return (
        <div className="p-6 border rounded-lg space-y-4">
            <div className="flex items-center justify-between">
                <Skeleton width="40px" height="40px" variant="circular" />
                <Skeleton width="60px" height="20px" />
            </div>
            <div className="space-y-2">
                <Skeleton width="100px" height="2rem" />
                <Skeleton width="150px" height="1rem" />
                <Skeleton width="80px" height="0.75rem" />
            </div>
        </div>
    );
};

// List Skeleton Component
export const ListSkeleton = ({ items = 5 }) => {
    return (
        <div className="space-y-3">
            {[...Array(items)].map((_, i) => (
                <div key={i} className="flex items-center space-x-4 p-3 border rounded">
                    <Skeleton width="40px" height="40px" variant="circular" />
                    <div className="flex-1 space-y-1">
                        <Skeleton width="60%" height="1rem" />
                        <Skeleton width="40%" height="0.75rem" />
                    </div>
                    <Skeleton width="80px" height="30px" />
                </div>
            ))}
        </div>
    );
};

// Loading States with Messages
export const LoadingState = ({
    message = "Loading data...",
    submessage = "",
    showSpinner = true
}) => {
    return (
        <div className="flex flex-col items-center justify-center p-8 space-y-4">
            {showSpinner && (
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            )}
            <div className="text-center space-y-2">
                <p className="text-lg font-medium text-gray-700">{message}</p>
                {submessage && (
                    <p className="text-sm text-gray-500">{submessage}</p>
                )}
            </div>
        </div>
    );
};

// Error State Component
export const ErrorState = ({
    title = "Something went wrong",
    message = "Failed to load data. Please try again.",
    onRetry = null
}) => {
    return (
        <div className="flex flex-col items-center justify-center p-8 space-y-4">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            </div>
            <div className="text-center space-y-2">
                <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
                <p className="text-sm text-gray-600">{message}</p>
            </div>
            {onRetry && (
                <button
                    onClick={onRetry}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                    Try Again
                </button>
            )}
        </div>
    );
};

// Temporal specific skeleton
export const TemporalSkeleton = () => {
    return (
        <div className="p-6 space-y-6 bg-gradient-to-br from-blue-50/30 via-white to-teal-50/30 min-h-screen">
            {/* Header Skeleton */}
            <div className="mb-8">
                <div className="flex items-center justify-between">
                    <div className="space-y-2">
                        <Skeleton width="280px" height="2.5rem" />
                        <Skeleton width="400px" height="1rem" />
                    </div>
                    <div className="flex space-x-2">
                        <Skeleton width="80px" height="40px" />
                        <Skeleton width="80px" height="40px" />
                        <Skeleton width="80px" height="40px" />
                    </div>
                </div>
            </div>

            {/* Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="p-6 border rounded-lg bg-white shadow-sm space-y-4">
                        <div className="flex items-center justify-between">
                            <Skeleton width="40px" height="40px" variant="circular" />
                            <Skeleton width="60px" height="20px" />
                        </div>
                        <div className="space-y-2">
                            <Skeleton width="80px" height="2rem" />
                            <Skeleton width="120px" height="1rem" />
                        </div>
                    </div>
                ))}
            </div>

            {/* Temporal Heatmap */}
            <div className="p-6 border rounded-lg bg-white shadow-sm mb-8">
                <div className="mb-6">
                    <Skeleton width="250px" height="1.5rem" />
                    <Skeleton width="350px" height="1rem" />
                </div>

                {/* Heatmap Grid */}
                <div className="space-y-2">
                    {/* Day labels */}
                    <div className="flex space-x-2">
                        <div className="w-12"></div>
                        {[...Array(24)].map((_, i) => (
                            <Skeleton key={i} width="36px" height="20px" />
                        ))}
                    </div>

                    {/* Heatmap rows */}
                    {[...Array(7)].map((_, rowIndex) => (
                        <div key={rowIndex} className="flex space-x-2">
                            <Skeleton width="48px" height="28px" />
                            {[...Array(24)].map((_, colIndex) => (
                                <Skeleton key={colIndex} width="36px" height="28px" />
                            ))}
                        </div>
                    ))}
                </div>
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Peak Hours Chart */}
                <div className="p-6 border rounded-lg bg-white shadow-sm">
                    <div className="mb-4">
                        <Skeleton width="180px" height="1.5rem" />
                        <Skeleton width="250px" height="1rem" />
                    </div>
                    <Skeleton width="100%" height="300px" />
                </div>

                {/* Weekday vs Weekend Chart */}
                <div className="p-6 border rounded-lg bg-white shadow-sm">
                    <div className="mb-4">
                        <Skeleton width="200px" height="1.5rem" />
                        <Skeleton width="280px" height="1rem" />
                    </div>
                    <Skeleton width="100%" height="300px" />
                </div>
            </div>

            {/* Additional Analytics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[...Array(3)].map((_, i) => (
                    <div key={i} className="p-6 border rounded-lg bg-white shadow-sm space-y-4">
                        <Skeleton width="140px" height="1.25rem" />
                        <Skeleton width="100%" height="120px" />
                        <div className="space-y-2">
                            <Skeleton width="80%" height="1rem" />
                            <Skeleton width="60%" height="1rem" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

// OD Matrix specific skeleton
export const ODMatrixSkeleton = () => {
    return (
        <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
            {/* Header Skeleton */}
            <div className="mb-8">
                <div className="flex items-center justify-between">
                    <div className="space-y-2">
                        <Skeleton width="300px" height="2.5rem" />
                        <Skeleton width="450px" height="1rem" />
                    </div>
                    <div className="flex space-x-2">
                        <Skeleton width="100px" height="40px" />
                        <Skeleton width="120px" height="40px" />
                    </div>
                </div>
            </div>

            {/* Matrix and Insights Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Matrix Table Skeleton */}
                <div className="lg:col-span-2 p-6 border rounded-lg bg-white shadow-sm">
                    <div className="mb-4">
                        <Skeleton width="200px" height="1.5rem" />
                        <Skeleton width="350px" height="1rem" />
                    </div>

                    {/* Matrix Grid */}
                    <div className="space-y-2">
                        {/* Header row */}
                        <div className="flex space-x-2">
                            <Skeleton width="60px" height="40px" />
                            {[...Array(6)].map((_, i) => (
                                <Skeleton key={i} width="60px" height="40px" />
                            ))}
                        </div>

                        {/* Data rows */}
                        {[...Array(6)].map((_, rowIndex) => (
                            <div key={rowIndex} className="flex space-x-2">
                                <Skeleton width="60px" height="40px" />
                                {[...Array(6)].map((_, colIndex) => (
                                    <Skeleton key={colIndex} width="60px" height="40px" />
                                ))}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Insights Panel Skeleton */}
                <div className="space-y-6">
                    {/* Top Corridors */}
                    <div className="p-4 border rounded-lg bg-white shadow-sm">
                        <div className="mb-4">
                            <Skeleton width="150px" height="1.5rem" />
                            <Skeleton width="200px" height="1rem" />
                        </div>
                        <div className="space-y-3">
                            {[...Array(5)].map((_, i) => (
                                <div key={i} className="p-3 border rounded space-y-2">
                                    <Skeleton width="80%" height="1rem" />
                                    <Skeleton width="60px" height="20px" />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Statistics */}
                    <div className="p-4 border rounded-lg bg-white shadow-sm">
                        <Skeleton width="120px" height="1.5rem" />
                        <div className="mt-4 space-y-3">
                            {[...Array(4)].map((_, i) => (
                                <div key={i} className="flex justify-between">
                                    <Skeleton width="100px" height="1rem" />
                                    <Skeleton width="50px" height="1rem" />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Corridor Details Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-6 border rounded-lg bg-white shadow-sm">
                    <div className="mb-4">
                        <Skeleton width="180px" height="1.5rem" />
                        <Skeleton width="250px" height="1rem" />
                    </div>
                    <Skeleton width="100%" height="250px" />
                </div>

                <div className="p-6 border rounded-lg bg-white shadow-sm">
                    <div className="mb-4">
                        <Skeleton width="200px" height="1.5rem" />
                        <Skeleton width="300px" height="1rem" />
                    </div>
                    <Skeleton width="100%" height="250px" />
                </div>
            </div>

            {/* Map Skeleton */}
            <div className="p-6 border rounded-lg bg-white shadow-sm">
                <div className="mb-4">
                    <Skeleton width="250px" height="1.5rem" />
                    <Skeleton width="400px" height="1rem" />
                </div>
                <Skeleton width="100%" height="400px" />
            </div>
        </div>
    );
};

// Demographics specific skeleton
export const DemographicsSkeleton = () => {
    return (
        <div className="p-6 space-y-6 bg-gradient-to-br from-purple-50/30 via-white to-blue-50/30 min-h-screen">
            {/* Header Skeleton */}
            <div className="mb-8">
                <div className="flex items-center justify-between">
                    <div className="space-y-2">
                        <Skeleton width="350px" height="2.5rem" />
                        <Skeleton width="500px" height="1rem" />
                    </div>
                    <Skeleton width="100px" height="40px" />
                </div>
            </div>

            {/* KPI Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="p-6 border rounded-lg bg-white shadow-sm space-y-4">
                        <div className="flex items-center justify-between">
                            <Skeleton width="40px" height="40px" variant="circular" />
                            <Skeleton width="60px" height="20px" />
                        </div>
                        <div className="space-y-2">
                            <Skeleton width="80px" height="2rem" />
                            <Skeleton width="120px" height="1rem" />
                        </div>
                    </div>
                ))}
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                {/* Age Distribution Chart */}
                <div className="p-6 border rounded-lg bg-white shadow-sm">
                    <div className="mb-4">
                        <Skeleton width="200px" height="1.5rem" />
                        <Skeleton width="300px" height="1rem" />
                    </div>
                    <Skeleton width="100%" height="300px" />
                </div>

                {/* Income Distribution Chart */}
                <div className="p-6 border rounded-lg bg-white shadow-sm">
                    <div className="mb-4">
                        <Skeleton width="180px" height="1.5rem" />
                        <Skeleton width="250px" height="1rem" />
                    </div>
                    <Skeleton width="100%" height="300px" />
                </div>

                {/* Gender Distribution Chart */}
                <div className="p-6 border rounded-lg bg-white shadow-sm">
                    <div className="mb-4">
                        <Skeleton width="160px" height="1.5rem" />
                        <Skeleton width="200px" height="1rem" />
                    </div>
                    <Skeleton width="100%" height="300px" />
                </div>

                {/* Map Skeleton */}
                <div className="p-6 border rounded-lg bg-white shadow-sm">
                    <div className="mb-4">
                        <Skeleton width="220px" height="1.5rem" />
                        <Skeleton width="300px" height="1rem" />
                    </div>
                    <Skeleton width="100%" height="300px" />
                </div>
            </div>

            {/* Additional Analytics Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[...Array(3)].map((_, i) => (
                    <div key={i} className="p-6 border rounded-lg bg-white shadow-sm space-y-4">
                        <Skeleton width="150px" height="1.25rem" />
                        <Skeleton width="100%" height="150px" />
                        <div className="space-y-2">
                            <Skeleton width="80%" height="1rem" />
                            <Skeleton width="60%" height="1rem" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default {
    Skeleton,
    DashboardSkeleton,
    GeospatialSkeleton,
    DemographicsSkeleton,
    ODMatrixSkeleton,
    TemporalSkeleton,
    ChartSkeleton,
    TableSkeleton,
    CardSkeleton,
    ListSkeleton,
    LoadingState,
    ErrorState
};