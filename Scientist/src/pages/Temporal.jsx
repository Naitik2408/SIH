import React, { useState, useEffect } from 'react';
import {
    LineChart,
    Line,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend,
    AreaChart,
    Area,
    Cell
} from 'recharts';
import {
    Clock,
    Calendar,
    TrendingUp,
    Filter,
    Sun,
    Moon,
    Activity,
    Timer,
    BarChart3,
    Grid3X3,
    ArrowUpIcon,
    ArrowDownIcon
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useTemporalData, usePrefetchData, useDataContext } from '../contexts/DataContext';
import { TemporalSkeleton, ErrorState, LoadingState } from '../components/LoadingSkeleton';

// Enhanced custom heatmap cell component
const HeatmapCell = ({ data, maxIntensity }) => {
    // Handle undefined or missing data
    if (!data || data.intensity === undefined) {
        return (
            <div className="w-9 h-7 flex items-center justify-center text-xs bg-gray-100 text-gray-400 rounded-md">
                0
            </div>
        );
    }

    const getIntensityColor = (intensity) => {
        const ratio = intensity / maxIntensity;
        if (ratio < 0.2) return 'bg-gradient-to-br from-purple-100 to-purple-200';
        if (ratio < 0.4) return 'bg-gradient-to-br from-purple-200 to-purple-300';
        if (ratio < 0.6) return 'bg-gradient-to-br from-purple-300 to-purple-400';
        if (ratio < 0.8) return 'bg-gradient-to-br from-purple-400 to-purple-500';
        return 'bg-gradient-to-br from-purple-500 to-purple-600';
    };

    const getTextColor = (intensity) => {
        const ratio = intensity / maxIntensity;
        return ratio > 0.6 ? 'text-white font-bold' : 'text-gray-700 font-semibold';
    };

    return (
        <div
            className={`w-9 h-7 flex items-center justify-center text-xs ${getIntensityColor(data.intensity)} ${getTextColor(data.intensity)} cursor-pointer hover:scale-110 transition-all duration-300 rounded-md shadow-sm hover:shadow-md border border-white/20`}
            title={`${data.day} ${data.hour}:00 - ${data.trips || 0} trips (${data.intensity}% intensity)`}
        >
            {data.intensity}
        </div>
    );
};

// Enhanced custom tooltip component
const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <Card className="border border-gray-200 shadow-xl backdrop-blur-sm bg-white/95">
                <CardContent className="p-3">
                    <p className="font-semibold text-gray-800 mb-2">{label}</p>
                    {payload.map((entry, index) => (
                        <div key={index} className="flex items-center space-x-2">
                            <div
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: entry.color }}
                            ></div>
                            <span className="text-sm text-gray-600">{entry.name}:</span>
                            <span className="text-sm font-semibold text-gray-800">
                                {entry.value}
                                {entry.name === 'trips' || entry.name === 'weekday' || entry.name === 'weekend' ? ' trips' : ''}
                                {entry.name === 'avgDuration' ? ' min' : ''}
                            </span>
                        </div>
                    ))}
                </CardContent>
            </Card>
        );
    }
    return null;
};

// Enhanced KPI Card Component
const EnhancedKPICard = ({ title, value, subtitle, icon: Icon, gradient, badge, change }) => (
    <Card className="relative overflow-hidden group hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-white via-purple-50/30 to-white">
        <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-5 group-hover:opacity-10 transition-opacity duration-300`}></div>
        <CardContent className="p-6 relative z-10">
            <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-xl bg-gradient-to-br ${gradient} shadow-lg group-hover:scale-105 transition-transform`}>
                    <Icon className="w-6 h-6 text-white" />
                </div>
                {badge && (
                    <Badge variant="secondary" className="bg-gradient-to-r from-purple-100 to-purple-200 text-purple-800 hover:from-purple-200 hover:to-purple-300">
                        {badge}
                    </Badge>
                )}
                {change !== undefined && (
                    <Badge variant={change >= 0 ? "default" : "destructive"} className="text-xs font-semibold bg-gradient-to-r from-purple-100 to-purple-200 text-purple-800 hover:from-purple-200 hover:to-purple-300">
                        {change >= 0 ? <ArrowUpIcon className="w-3 h-3 mr-1" /> : <ArrowDownIcon className="w-3 h-3 mr-1" />}
                        {Math.abs(change)}%
                    </Badge>
                )}
            </div>
            <div className="space-y-2">
                <p className="text-3xl font-bold text-gray-900 tracking-tight">{value}</p>
                <p className="text-sm font-medium text-gray-700">{title}</p>
                {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
            </div>
        </CardContent>
    </Card>
);

const Temporal = () => {
    const [timePeriod, setTimePeriod] = useState('7days');

    // Use React Query for data fetching with caching
    const {
        data: temporalData,
        isLoading,
        isError,
        error,
        refetch,
        isFetching
    } = useTemporalData();

    const { prefetch } = usePrefetchData();
    const { cacheManager } = useDataContext();

    // Prefetch other page data when temporal loads
    useEffect(() => {
        if (!isLoading && temporalData) {
            // Prefetch other pages for faster navigation
            setTimeout(() => {
                prefetch.prefetchDashboardData();
                prefetch.prefetchGeospatialData();
                prefetch.prefetchDemographicsData();
                prefetch.prefetchODMatrixData();
            }, 1000);
        }
    }, [isLoading, temporalData, prefetch]);

    // Handle loading state
    if (isLoading) {
        return <TemporalSkeleton />;
    }

    // Handle error state
    if (isError) {
        return (
            <ErrorState
                title="Failed to Load Temporal Data"
                message={error?.message || "Unable to fetch temporal data. Please check your connection."}
                onRetry={refetch}
            />
        );
    }

    // Extract data with defaults
    const heatmapData = temporalData?.heatmapData || [];
    const peakHoursData = temporalData?.peakHoursData || [];
    const weekdayWeekendData = temporalData?.weekdayWeekendData || [];
    const temporalMetrics = temporalData?.temporalMetrics || {
        totalTrips: 0,
        peakHour: '08:00',
        peakHourTrips: 0,
        avgDuration: 0,
        rushHourImpact: 0,
        lastUpdated: new Date().toISOString()
    };

    const maxIntensity = Math.max(...heatmapData.map(d => d.intensity), 1); // Ensure minimum 1
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const hours = Array.from({ length: 24 }, (_, i) => i);

    // Use metrics from API data
    const { totalTrips, peakHour, avgDuration, rushHourImpact } = temporalMetrics;

    // Find peak hour data for display
    const peakHourData = peakHoursData.find(h => h.hour === peakHour) || { trips: 0 };

    return (
        <div className="p-6 space-y-8 bg-gradient-to-br from-purple-50/30 via-white to-blue-50/30 min-h-screen">

            {/* Enhanced Header */}
            <div className="mb-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 via-purple-700 to-blue-600 bg-clip-text text-transparent">
                            Temporal Analysis
                        </h1>
                        <p className="text-gray-600 mt-2 text-lg">Time-based patterns and trends in transportation data</p>
                    </div>
                    <div className="flex items-center space-x-4">
                        {/* Enhanced Time Period Filter */}
                        <div className="flex items-center space-x-3 bg-gradient-to-r from-purple-50 to-blue-50 px-6 py-3 rounded-xl border border-purple-200 shadow-lg">
                            <Filter className="w-5 h-5 text-purple-600" />
                            <select
                                value={timePeriod}
                                onChange={(e) => setTimePeriod(e.target.value)}
                                className="bg-transparent text-sm font-semibold text-gray-800 focus:outline-none cursor-pointer"
                            >
                                <option value="7days">Last 7 days</option>
                                <option value="30days">Last 30 days</option>
                                <option value="custom">Custom Range</option>
                            </select>
                        </div>
                        <div className="flex space-x-3">
                            <Button variant="outline" className="border-purple-200 text-purple-700 hover:bg-purple-50">
                                Export Data
                            </Button>
                            <Button className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800">
                                Live View
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Enhanced Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <EnhancedKPICard
                    title="Total Daily Trips"
                    value={totalTrips.toLocaleString()}
                    subtitle="from Kerala data"
                    icon={Activity}
                    gradient="from-purple-500 to-purple-600"
                    change={12.5}
                />
                <EnhancedKPICard
                    title="Peak Hour"
                    value={peakHour}
                    subtitle={`${peakHourData.trips} trips`}
                    icon={TrendingUp}
                    gradient="from-blue-500 to-blue-600"
                    badge="Peak"
                />
                <EnhancedKPICard
                    title="Avg Trip Duration"
                    value={`${avgDuration} min`}
                    subtitle="per trip"
                    icon={Timer}
                    gradient="from-indigo-500 to-indigo-600"
                    change={-3.2}
                />
                <EnhancedKPICard
                    title="Rush Hour Impact"
                    value={`+${rushHourImpact}%`}
                    subtitle="vs off-peak hours"
                    icon={Clock}
                    gradient="from-pink-500 to-pink-600"
                    change={15.4}
                />
            </div>

            {/* Enhanced Row 1: Heatmap + Peak Hours Chart */}
            <div className="grid grid-cols-1 gap-8">
                {/* Enhanced Hourly-Weekly Heatmap */}
                <Card className="shadow-xl border-0 bg-gradient-to-br from-white via-purple-50/20 to-white">
                    <CardHeader className="pb-4">
                        <CardTitle className="flex items-center text-xl font-bold text-gray-800">
                            <Grid3X3 className="w-6 h-6 mr-3 text-purple-600" />
                            Trip Intensity Heatmap
                        </CardTitle>
                        <CardDescription className="text-gray-600">
                            Hourly trip patterns across the week with intensity visualization
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {heatmapData.length === 0 ? (
                            <div className="flex items-center justify-center h-64">
                                <div className="text-center">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
                                    <p className="text-gray-600">Loading heatmap data...</p>
                                </div>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <div className="min-w-fit">
                                    {/* Enhanced Hour labels */}
                                    <div className="flex mb-3">
                                        <div className="w-14"></div>
                                        {hours.map(hour => (
                                            <div key={hour} className="w-9 text-center text-xs text-gray-600 font-semibold">
                                                {hour % 4 === 0 ? `${hour}h` : ''}
                                            </div>
                                        ))}
                                    </div>

                                    {/* Enhanced Heatmap grid */}
                                    {days.map((day, dayIndex) => (
                                        <div key={day} className="flex items-center mb-2">
                                            <div className="w-14 text-sm font-bold text-gray-700 pr-3">{day}</div>
                                            {hours.map(hour => {
                                                const cellData = heatmapData.find(d => d.day === day && d.hour === hour);
                                                return (
                                                    <div key={`${day}-${hour}`} className="mr-1">
                                                        <HeatmapCell data={cellData} maxIntensity={maxIntensity} />
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    ))}

                                    {/* Enhanced Legend */}
                                    <div className="flex items-center justify-center mt-6 space-x-6 text-sm">
                                        <span className="text-gray-600 font-medium">Low Intensity</span>
                                        <div className="flex space-x-2">
                                            <div className="w-5 h-5 bg-gradient-to-br from-purple-100 to-purple-200 rounded-md shadow-sm"></div>
                                            <div className="w-5 h-5 bg-gradient-to-br from-purple-200 to-purple-300 rounded-md shadow-sm"></div>
                                            <div className="w-5 h-5 bg-gradient-to-br from-purple-300 to-purple-400 rounded-md shadow-sm"></div>
                                            <div className="w-5 h-5 bg-gradient-to-br from-purple-400 to-purple-500 rounded-md shadow-sm"></div>
                                            <div className="w-5 h-5 bg-gradient-to-br from-purple-500 to-purple-600 rounded-md shadow-sm"></div>
                                        </div>
                                        <span className="text-gray-600 font-medium">High Intensity</span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Enhanced Peak Hours Area Chart */}
                <Card className="shadow-xl border-0 bg-gradient-to-br from-white via-green-50/20 to-white">
                    <CardHeader className="pb-4">
                        <CardTitle className="flex items-center text-xl font-bold text-gray-800">
                            <TrendingUp className="w-6 h-6 mr-3 text-green-600" />
                            Daily Peak Hours Pattern
                        </CardTitle>
                        <CardDescription className="text-gray-600">
                            Hourly trip distribution with peak identification
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {peakHoursData.length === 0 ? (
                            <div className="flex items-center justify-center h-64">
                                <div className="text-center">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
                                    <p className="text-gray-600">Loading peak hours data...</p>
                                </div>
                            </div>
                        ) : (
                            <ResponsiveContainer width="100%" height={350}>
                                <AreaChart data={peakHoursData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#e0f2fe" />
                                    <XAxis
                                        dataKey="hour"
                                        interval={3}
                                        tick={{ fill: '#6b7280', fontSize: 12 }}
                                        axisLine={{ stroke: '#d1d5db' }}
                                    />
                                    <YAxis
                                        tick={{ fill: '#6b7280', fontSize: 12 }}
                                        axisLine={{ stroke: '#d1d5db' }}
                                    />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Area
                                        type="monotone"
                                        dataKey="trips"
                                        stroke="#10b981"
                                        fill="#10b98140"
                                        strokeWidth={3}
                                        dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
                                        activeDot={{ r: 6, fill: '#10b981', strokeWidth: 2 }}
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Enhanced Row 2: Weekday vs Weekend + Trip Duration */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                {/* Enhanced Weekday vs Weekend Comparison */}
                <Card className="shadow-xl border-0 bg-gradient-to-br from-white via-blue-50/20 to-white">
                    <CardHeader className="pb-4">
                        <CardTitle className="flex items-center text-xl font-bold text-gray-800">
                            <Calendar className="w-6 h-6 mr-3 text-blue-600" />
                            Weekday vs Weekend Patterns
                        </CardTitle>
                        <CardDescription className="text-gray-600">
                            Comparative analysis of travel patterns between weekdays and weekends
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {weekdayWeekendData.length === 0 ? (
                            <div className="flex items-center justify-center h-64">
                                <div className="text-center">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                                    <p className="text-gray-600">Loading weekday/weekend data...</p>
                                </div>
                            </div>
                        ) : (
                            <ResponsiveContainer width="100%" height={350}>
                                <BarChart data={weekdayWeekendData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#e0e7ff" />
                                    <XAxis
                                        dataKey="hour"
                                        interval={3}
                                        tick={{ fill: '#6b7280', fontSize: 12 }}
                                        axisLine={{ stroke: '#d1d5db' }}
                                    />
                                    <YAxis
                                        tick={{ fill: '#6b7280', fontSize: 12 }}
                                        axisLine={{ stroke: '#d1d5db' }}
                                    />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Legend />
                                    <Bar
                                        dataKey="weekday"
                                        fill="#a28ef9"
                                        name="Weekday"
                                        radius={[4, 4, 0, 0]}
                                        stroke="#8b7cf6"
                                        strokeWidth={1}
                                    />
                                    <Bar
                                        dataKey="weekend"
                                        fill="#7c3aed"
                                        name="Weekend"
                                        radius={[4, 4, 0, 0]}
                                        stroke="#6d28d9"
                                        strokeWidth={1}
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        )}
                    </CardContent>
                </Card>

                {/* Enhanced Average Trip Duration per Time Slot */}
                <Card className="shadow-xl border-0 bg-gradient-to-br from-white via-orange-50/20 to-white">
                    <CardHeader className="pb-4">
                        <CardTitle className="flex items-center text-xl font-bold text-gray-800">
                            <Timer className="w-6 h-6 mr-3 text-orange-600" />
                            Average Trip Duration
                        </CardTitle>
                        <CardDescription className="text-gray-600">
                            Time-based analysis of average trip duration throughout the day
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {peakHoursData.length === 0 ? (
                            <div className="flex items-center justify-center h-64">
                                <div className="text-center">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto mb-4"></div>
                                    <p className="text-gray-600">Loading duration data...</p>
                                </div>
                            </div>
                        ) : (
                            <ResponsiveContainer width="100%" height={350}>
                                <AreaChart data={peakHoursData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#e0e7ff" />
                                    <XAxis
                                        dataKey="hour"
                                        interval={3}
                                        tick={{ fill: '#6b7280', fontSize: 12 }}
                                        axisLine={{ stroke: '#d1d5db' }}
                                    />
                                    <YAxis
                                        tick={{ fill: '#6b7280', fontSize: 12 }}
                                        axisLine={{ stroke: '#d1d5db' }}
                                    />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Area
                                        type="monotone"
                                        dataKey="avgDuration"
                                        stroke="#f97316"
                                        fill="#f9731640"
                                        strokeWidth={3}
                                        name="avgDuration"
                                        dot={{ fill: '#f97316', strokeWidth: 2, r: 4 }}
                                        activeDot={{ r: 6, fill: '#f97316', strokeWidth: 2 }}
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Enhanced Insights Panel */}
            <Card className="shadow-xl border-0 bg-gradient-to-br from-white via-indigo-50/20 to-white">
                <CardHeader className="pb-4">
                    <CardTitle className="flex items-center text-xl font-bold text-gray-800">
                        <BarChart3 className="w-6 h-6 mr-3 text-indigo-600" />
                        Key Temporal Insights
                    </CardTitle>
                    <CardDescription className="text-gray-600">
                        AI-driven insights and patterns from temporal transportation data
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <Card className="border border-purple-200 hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-purple-50 to-purple-100/50">
                            <CardContent className="p-6">
                                <div className="flex items-center mb-4">
                                    <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 shadow-lg">
                                        <Sun className="w-6 h-6 text-white" />
                                    </div>
                                    <div className="ml-4">
                                        <h3 className="font-bold text-purple-800 text-lg">Morning Rush</h3>
                                        <Badge variant="secondary" className="bg-purple-200 text-purple-800 text-xs">
                                            Peak Period
                                        </Badge>
                                    </div>
                                </div>
                                <p className="text-sm text-purple-700 leading-relaxed">
                                    Peak traffic occurs between 8-9 AM with an average of{' '}
                                    <span className="font-bold text-purple-900">
                                        {peakHoursData.length > 9 ? Math.max(...peakHoursData.slice(8, 10).map(h => h.trips)) : peakHourData.trips}
                                    </span>{' '}
                                    trips per hour, representing the highest daily activity.
                                </p>
                            </CardContent>
                        </Card>

                        <Card className="border border-green-200 hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-green-50 to-green-100/50">
                            <CardContent className="p-6">
                                <div className="flex items-center mb-4">
                                    <div className="p-3 rounded-xl bg-gradient-to-br from-green-500 to-green-600 shadow-lg">
                                        <Moon className="w-6 h-6 text-white" />
                                    </div>
                                    <div className="ml-4">
                                        <h3 className="font-bold text-green-800 text-lg">Evening Peak</h3>
                                        <Badge variant="secondary" className="bg-green-200 text-green-800 text-xs">
                                            Extended Duration
                                        </Badge>
                                    </div>
                                </div>
                                <p className="text-sm text-green-700 leading-relaxed">
                                    Evening rush from 5-7 PM shows sustained high activity with longer trip durations,
                                    indicating complex commuting patterns and traffic congestion.
                                </p>
                            </CardContent>
                        </Card>

                        <Card className="border border-orange-200 hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-orange-50 to-orange-100/50">
                            <CardContent className="p-6">
                                <div className="flex items-center mb-4">
                                    <div className="p-3 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 shadow-lg">
                                        <Calendar className="w-6 h-6 text-white" />
                                    </div>
                                    <div className="ml-4">
                                        <h3 className="font-bold text-orange-800 text-lg">Weekend Pattern</h3>
                                        <Badge variant="secondary" className="bg-orange-200 text-orange-800 text-xs">
                                            Leisure Focus
                                        </Badge>
                                    </div>
                                </div>
                                <p className="text-sm text-orange-700 leading-relaxed">
                                    Weekend traffic peaks later (10 AM-2 PM) with more leisure-oriented travel patterns,
                                    showing a shift from commuter to recreational transportation needs.
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default Temporal;
