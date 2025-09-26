import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Polygon, Popup, Marker } from 'react-leaflet';
import {
    PieChart,
    Pie,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend,
    Cell,
    AreaChart,
    Area
} from 'recharts';
import {
    Users,
    GraduationCap,
    Briefcase,
    Home,
    UserCheck,
    MapPin,
    DollarSign,
    TrendingUp,
    AlertTriangle,
    Eye,
    Calendar,
    ArrowUpIcon,
    ArrowDownIcon,
    BarChart3,
    Activity
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import L from 'leaflet';
import { useDemographicsData, usePrefetchData, useDataContext } from '../contexts/DataContext';
import { DemographicsSkeleton, ErrorState, LoadingState } from '../components/LoadingSkeleton';

// Fix for default markers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom tooltip component
const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
                <p className="font-medium text-gray-800 mb-1">{label}</p>
                {payload.map((entry, index) => (
                    <p key={index} style={{ color: entry.color }} className="text-sm">
                        {entry.name}: {entry.value}
                        {entry.payload?.percentage && ` (${entry.payload.percentage}%)`}
                    </p>
                ))}
            </div>
        );
    }
    return null;
};

// Custom pie chart label
const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * Math.PI / 180);
    const y = cy + radius * Math.sin(-midAngle * Math.PI / 180);

    return (
        <text
            x={x}
            y={y}
            fill="white"
            textAnchor={x > cx ? 'start' : 'end'}
            dominantBaseline="central"
            className="text-sm font-medium"
        >
            {`${(percent * 100).toFixed(0)}%`}
        </text>
    );
};

const Demographics = () => {
    const [selectedZone, setSelectedZone] = useState(null);

    // Use React Query for data fetching with caching
    const {
        data: demographicsData,
        isLoading,
        isError,
        error,
        refetch,
        isFetching
    } = useDemographicsData();

    const prefetch = usePrefetchData();
    const { cacheManager } = useDataContext();

    // Prefetch other page data when demographics loads
    useEffect(() => {
        if (!isLoading && demographicsData) {
            // Prefetch other pages for faster navigation
            setTimeout(() => {
                prefetch.prefetchGeospatialData();
                prefetch.prefetchODMatrixData();
                prefetch.prefetchTemporalData();
            }, 1000);
        }
    }, [isLoading, demographicsData, prefetch]);

    // Handle loading state
    if (isLoading) {
        return <DemographicsSkeleton />;
    }

    // Handle error state
    if (isError) {
        return (
            <ErrorState
                title="Failed to Load Demographics Data"
                message={error?.message || "Unable to fetch demographics data. Please check your connection."}
                onRetry={refetch}
            />
        );
    }

    // Debug: Log the actual data structure
    console.log('🔍 DEBUG Demographics Data Structure:', demographicsData);
    console.log('🔍 DEBUG Demographics Keys:', demographicsData ? Object.keys(demographicsData) : 'No data');

    // Extract data with defaults - using correct property names from backend
    const demographicKPIs = demographicsData?.kpis || [];
    const ageGroupData = demographicsData?.ageGroups || [];
    const incomeLevelData = demographicsData?.incomeData || [];
    const genderData = demographicsData?.genderData || [];
    const equityZones = demographicsData?.equityZones || [];
    const transportStops = demographicsData?.transportStops || [];

    // Debug: Log extracted data arrays
    console.log('🔍 DEBUG Extracted Data:', {
        demographicKPIs: demographicKPIs?.length || 0,
        ageGroupData: ageGroupData?.length || 0,
        incomeLevelData: incomeLevelData?.length || 0,
        genderData: genderData?.length || 0,
        equityZones: equityZones?.length || 0,
        transportStops: transportStops?.length || 0
    });

    const totalTrips = ageGroupData.reduce((sum, item) => sum + item.trips, 0);

    return (
        <div className="p-6 space-y-6 bg-gradient-to-br from-purple-50/30 via-white to-blue-50/30 min-h-screen">

            {/* Enhanced Header */}
            <div className="mb-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 via-purple-700 to-blue-600 bg-clip-text text-transparent">
                            Demographics & Equity Analysis
                        </h1>
                        <p className="text-gray-600 mt-2 text-lg">Demographic patterns and transportation equity insights from Kerala data</p>
                    </div>
                    <div className="flex space-x-3">
                        <Button variant="outline" className="border-purple-200 text-purple-700 hover:bg-purple-50">
                            Export Data
                        </Button>
                        <Button className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800">
                            Generate Report
                        </Button>
                    </div>
                </div>
            </div>

            {/* KPI Cards Row */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {demographicKPIs.map((kpi, index) => {
                    const Icon = kpi.icon;
                    const isPositive = kpi.change > 0;
                    return (
                        <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
                            <div className={`h-1 bg-gradient-to-r ${kpi.gradient}`}></div>
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div className="space-y-1">
                                        <p className="text-sm font-medium text-gray-600">{kpi.label}</p>
                                        <p className="text-3xl font-bold text-gray-900">{kpi.percentage}%</p>
                                        <p className="text-xs text-gray-500">{kpi.count.toLocaleString()} users</p>
                                        <div className="flex items-center space-x-1">
                                            {isPositive ? (
                                                <ArrowUpIcon className="w-3 h-3 text-green-500" />
                                            ) : (
                                                <ArrowDownIcon className="w-3 h-3 text-red-500" />
                                            )}
                                            <span className={`text-xs font-medium ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                                                {Math.abs(kpi.change)}%
                                            </span>
                                        </div>
                                    </div>
                                    <div className={`p-3 rounded-xl bg-gradient-to-r ${kpi.gradient}`}>
                                        <Icon className="w-6 h-6 text-white" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                {/* Left Column - Age & Gender Charts */}
                <div className="space-y-6">
                    {/* Age Group Bar Chart */}
                    <Card className="border-0 shadow-lg">
                        <CardHeader className="pb-4">
                            <CardTitle className="flex items-center text-xl">
                                <Calendar className="w-5 h-5 mr-2 text-purple-600" />
                                Trips by Age Group
                            </CardTitle>
                            <CardDescription>
                                Distribution of daily trips across different age demographics
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="h-80">
                                {isLoading ? (
                                    <div className="flex items-center justify-center h-full">
                                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
                                    </div>
                                ) : (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={ageGroupData}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                                            <XAxis
                                                dataKey="ageGroup"
                                                tick={{ fontSize: 12, fill: '#64748b' }}
                                                axisLine={{ stroke: '#e2e8f0' }}
                                            />
                                            <YAxis
                                                tick={{ fontSize: 12, fill: '#64748b' }}
                                                axisLine={{ stroke: '#e2e8f0' }}
                                            />
                                            <Tooltip content={<CustomTooltip />} />
                                            <Bar dataKey="trips" radius={[6, 6, 0, 0]}>
                                                {ageGroupData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                                ))}
                                            </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                )}
                            </div>

                            {/* Age Group Summary */}
                            <div className="mt-6 grid grid-cols-2 gap-4">
                                {isLoading ? (
                                    <>
                                        <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 animate-pulse">
                                            <div className="h-4 bg-gray-300 rounded mb-2"></div>
                                            <div className="h-6 bg-gray-300 rounded"></div>
                                        </div>
                                        <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 animate-pulse">
                                            <div className="h-4 bg-gray-300 rounded mb-2"></div>
                                            <div className="h-6 bg-gray-300 rounded"></div>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-4 rounded-xl border border-purple-200">
                                            <div className="flex items-center space-x-2 mb-1">
                                                <Users className="w-4 h-4 text-purple-600" />
                                                <p className="font-semibold text-purple-800">Most Active Group</p>
                                            </div>
                                            <p className="text-purple-700 font-medium">
                                                {ageGroupData.length > 0 ?
                                                    `${ageGroupData.reduce((max, group) => group.trips > max.trips ? group : max, ageGroupData[0]).ageGroup} (${ageGroupData.reduce((max, group) => group.trips > max.trips ? group : max, ageGroupData[0]).percentage}%)`
                                                    : 'Loading...'
                                                }
                                            </p>
                                        </div>
                                        <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-xl border border-blue-200">
                                            <div className="flex items-center space-x-2 mb-1">
                                                <Activity className="w-4 h-4 text-blue-600" />
                                                <p className="font-semibold text-blue-800">Total Daily Trips</p>
                                            </div>
                                            <p className="text-blue-700 font-medium">
                                                {ageGroupData.length > 0 ?
                                                    ageGroupData.reduce((total, group) => total + group.trips, 0).toLocaleString()
                                                    : 'Loading...'
                                                }
                                            </p>
                                        </div>
                                    </>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Gender Distribution Donut Chart */}
                    <Card className="border-0 shadow-lg">
                        <CardHeader className="pb-4">
                            <CardTitle className="flex items-center text-xl">
                                <Users className="w-5 h-5 mr-2 text-purple-600" />
                                Gender Distribution
                            </CardTitle>
                            <CardDescription>
                                Trip patterns across gender demographics
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="h-80">
                                {isLoading ? (
                                    <div className="flex items-center justify-center h-full">
                                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
                                    </div>
                                ) : (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={genderData}
                                                cx="50%"
                                                cy="50%"
                                                labelLine={false}
                                                label={renderCustomLabel}
                                                outerRadius={100}
                                                innerRadius={40}
                                                fill="#8884d8"
                                                dataKey="trips"
                                            >
                                                {genderData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                                ))}
                                            </Pie>
                                            <Tooltip content={<CustomTooltip />} />
                                            <Legend
                                                verticalAlign="bottom"
                                                height={36}
                                                iconType="circle"
                                            />
                                        </PieChart>
                                    </ResponsiveContainer>
                                )}
                            </div>

                            {/* Gender Stats */}
                            <div className="mt-6 space-y-3">
                                {isLoading ? (
                                    <div className="text-center py-4">
                                        <div className="animate-pulse text-gray-500">Loading gender statistics...</div>
                                    </div>
                                ) : (
                                    genderData.map((item, index) => (
                                        <div key={index} className="flex items-center justify-between p-3 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-200">
                                            <div className="flex items-center space-x-3">
                                                <div
                                                    className="w-4 h-4 rounded-full ring-2 ring-white shadow-sm"
                                                    style={{ backgroundColor: item.color }}
                                                ></div>
                                                <span className="font-medium text-gray-700">{item.gender}</span>
                                            </div>
                                            <div className="text-right">
                                                <span className="font-semibold text-gray-800">{item.trips.toLocaleString()}</span>
                                                <Badge variant="secondary" className="ml-2">
                                                    {item.percentage}%
                                                </Badge>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column - Income & Equity Map */}
                <div className="space-y-6">
                    {/* Income Level Stacked Bar Chart */}
                    <Card className="border-0 shadow-lg">
                        <CardHeader className="pb-4">
                            <CardTitle className="flex items-center text-xl">
                                <DollarSign className="w-5 h-5 mr-2 text-purple-600" />
                                Trips by Income Level & Mode
                            </CardTitle>
                            <CardDescription>
                                Transportation mode preferences across income brackets
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="h-80">
                                {isLoading ? (
                                    <div className="flex items-center justify-center h-full">
                                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
                                    </div>
                                ) : (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={incomeLevelData}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                                            <XAxis
                                                dataKey="incomeRange"
                                                tick={{ fontSize: 12, fill: '#64748b' }}
                                                axisLine={{ stroke: '#e2e8f0' }}
                                            />
                                            <YAxis
                                                tick={{ fontSize: 12, fill: '#64748b' }}
                                                axisLine={{ stroke: '#e2e8f0' }}
                                            />
                                            <Tooltip content={<CustomTooltip />} />
                                            <Legend />
                                            <Bar dataKey="bus" stackId="a" fill="#a28ef9" name="Bus" radius={[0, 0, 0, 0]} />
                                            <Bar dataKey="metro" stackId="a" fill="#8b7cf6" name="Metro" radius={[0, 0, 0, 0]} />
                                            <Bar dataKey="auto" stackId="a" fill="#7c3aed" name="Auto" radius={[0, 0, 0, 0]} />
                                            <Bar dataKey="walk" stackId="a" fill="#c084fc" name="Walk" radius={[4, 4, 0, 0]} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                )}
                            </div>

                            {/* Income Insights */}
                            <div className="mt-6 grid grid-cols-2 gap-4">
                                {isLoading ? (
                                    <>
                                        <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 animate-pulse">
                                            <div className="h-4 bg-gray-300 rounded mb-2"></div>
                                            <div className="h-6 bg-gray-300 rounded"></div>
                                        </div>
                                        <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 animate-pulse">
                                            <div className="h-4 bg-gray-300 rounded mb-2"></div>
                                            <div className="h-6 bg-gray-300 rounded"></div>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 p-4 rounded-xl border border-yellow-200">
                                            <div className="flex items-center space-x-2 mb-1">
                                                <TrendingUp className="w-4 h-4 text-yellow-600" />
                                                <p className="font-semibold text-yellow-800">Low Income Transit</p>
                                            </div>
                                            <p className="text-yellow-700 font-medium">
                                                {incomeLevelData.length > 0 && incomeLevelData[0] ?
                                                    `Bus dependency: ${Math.round((incomeLevelData[0].bus / (incomeLevelData[0].bus + incomeLevelData[0].metro + incomeLevelData[0].auto + incomeLevelData[0].walk)) * 100)}%`
                                                    : 'Bus dependency: 0%'
                                                }
                                            </p>
                                        </div>
                                        <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-xl border border-green-200">
                                            <div className="flex items-center space-x-2 mb-1">
                                                <BarChart3 className="w-4 h-4 text-green-600" />
                                                <p className="font-semibold text-green-800">High Income Transit</p>
                                            </div>
                                            <p className="text-green-700 font-medium">
                                                {incomeLevelData.length > 2 && incomeLevelData[2] ?
                                                    `Metro preference: ${Math.round((incomeLevelData[2].metro / (incomeLevelData[2].bus + incomeLevelData[2].metro + incomeLevelData[2].auto + incomeLevelData[2].walk)) * 100)}%`
                                                    : 'Metro preference: 0%'
                                                }
                                            </p>
                                        </div>
                                    </>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Equity Map */}
                    <Card className="border-0 shadow-lg">
                        <CardHeader className="pb-4">
                            <CardTitle className="flex items-center text-xl">
                                <MapPin className="w-5 h-5 mr-2 text-purple-600" />
                                Transportation Equity Map
                            </CardTitle>
                            <CardDescription>
                                Interactive map showing transportation accessibility gaps
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="h-80 rounded-xl overflow-hidden border border-gray-200">
                                {isLoading ? (
                                    <div className="flex items-center justify-center h-full bg-gray-50">
                                        <div className="text-center">
                                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
                                            <p className="text-gray-600">Loading map data...</p>
                                        </div>
                                    </div>
                                ) : (
                                    <MapContainer
                                        center={[28.6139, 77.2090]}
                                        zoom={11}
                                        style={{ height: '100%', width: '100%' }}
                                    >
                                        <TileLayer
                                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                            attribution='&copy; OpenStreetMap contributors'
                                        />

                                        {/* Low-income zones */}
                                        {equityZones.map(zone => (
                                            <Polygon
                                                key={zone.id}
                                                positions={zone.coordinates}
                                                pathOptions={{
                                                    color: zone.color,
                                                    fillColor: zone.color,
                                                    fillOpacity: 0.3,
                                                    weight: 2
                                                }}
                                                eventHandlers={{
                                                    click: () => setSelectedZone(zone)
                                                }}
                                            >
                                                <Popup>
                                                    <div className="text-sm">
                                                        <h3 className="font-semibold text-gray-800">{zone.name}</h3>
                                                        <p><strong>Population:</strong> {zone.population.toLocaleString()}</p>
                                                        <p><strong>Avg Income:</strong> {zone.avgIncome}</p>
                                                        <p><strong>Transport Access:</strong> {zone.publicTransportAccess}</p>
                                                        <div className="mt-2">
                                                            <strong>Issues:</strong>
                                                            <ul className="text-xs mt-1">
                                                                {zone.issues.map((issue, idx) => (
                                                                    <li key={idx}>• {issue}</li>
                                                                ))}
                                                            </ul>
                                                        </div>
                                                    </div>
                                                </Popup>
                                            </Polygon>
                                        ))}

                                        {/* Transport stops */}
                                        {transportStops.map(stop => (
                                            <Marker key={stop.id} position={stop.coords}>
                                                <Popup>
                                                    <div className="text-sm">
                                                        <h3 className="font-semibold">{stop.name}</h3>
                                                        <p className="capitalize">Type: {stop.type}</p>
                                                    </div>
                                                </Popup>
                                            </Marker>
                                        ))}
                                    </MapContainer>
                                )}
                            </div>

                            {/* Map Legend */}
                            <div className="mt-6 grid grid-cols-3 gap-4 text-sm">
                                <div className="flex items-center space-x-2 p-2 bg-red-50 rounded-lg border border-red-200">
                                    <div className="w-4 h-4 bg-red-600 rounded opacity-60"></div>
                                    <span className="text-red-700 font-medium">Critical Equity Gap</span>
                                </div>
                                <div className="flex items-center space-x-2 p-2 bg-yellow-50 rounded-lg border border-yellow-200">
                                    <div className="w-4 h-4 bg-yellow-500 rounded opacity-60"></div>
                                    <span className="text-yellow-700 font-medium">Moderate Issues</span>
                                </div>
                                <div className="flex items-center space-x-2 p-2 bg-blue-50 rounded-lg border border-blue-200">
                                    <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                                    <span className="text-blue-700 font-medium">Transit Stops</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Equity Insights Panel */}
            {selectedZone && (
                <Card className="border-0 shadow-lg">
                    <CardHeader className="pb-4">
                        <div className="flex items-center justify-between">
                            <CardTitle className="flex items-center text-xl">
                                <AlertTriangle className="w-5 h-5 mr-2 text-red-600" />
                                Equity Analysis: {selectedZone.name}
                            </CardTitle>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setSelectedZone(null)}
                                className="text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                            >
                                ×
                            </Button>
                        </div>
                        <CardDescription>
                            Detailed analysis of transportation accessibility issues
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <Card className="border border-red-200 bg-gradient-to-br from-red-50 to-red-100">
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-lg text-red-800 flex items-center">
                                        <AlertTriangle className="w-4 h-4 mr-2" />
                                        Access Issues
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="pt-0">
                                    <ul className="space-y-2">
                                        {selectedZone.issues.map((issue, idx) => (
                                            <li key={idx} className="flex items-start space-x-2 text-sm text-red-700">
                                                <span className="w-1 h-1 bg-red-500 rounded-full mt-2 flex-shrink-0"></span>
                                                <span>{issue}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </CardContent>
                            </Card>

                            <Card className="border border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100">
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-lg text-blue-800 flex items-center">
                                        <Users className="w-4 h-4 mr-2" />
                                        Demographics
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="pt-0">
                                    <div className="space-y-3">
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm text-blue-700">Population:</span>
                                            <Badge variant="secondary" className="bg-blue-200 text-blue-800">
                                                {selectedZone.population.toLocaleString()}
                                            </Badge>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm text-blue-700">Avg Income:</span>
                                            <Badge variant="secondary" className="bg-blue-200 text-blue-800">
                                                {selectedZone.avgIncome}
                                            </Badge>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm text-blue-700">Transport Access:</span>
                                            <Badge variant="secondary" className="bg-blue-200 text-blue-800">
                                                {selectedZone.publicTransportAccess}
                                            </Badge>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="border border-green-200 bg-gradient-to-br from-green-50 to-green-100">
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-lg text-green-800 flex items-center">
                                        <TrendingUp className="w-4 h-4 mr-2" />
                                        Recommendations
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="pt-0">
                                    <ul className="space-y-2">
                                        <li className="flex items-start space-x-2 text-sm text-green-700">
                                            <span className="w-1 h-1 bg-green-500 rounded-full mt-2 flex-shrink-0"></span>
                                            <span>Increase bus frequency</span>
                                        </li>
                                        <li className="flex items-start space-x-2 text-sm text-green-700">
                                            <span className="w-1 h-1 bg-green-500 rounded-full mt-2 flex-shrink-0"></span>
                                            <span>Extend metro connectivity</span>
                                        </li>
                                        <li className="flex items-start space-x-2 text-sm text-green-700">
                                            <span className="w-1 h-1 bg-green-500 rounded-full mt-2 flex-shrink-0"></span>
                                            <span>Improve last-mile access</span>
                                        </li>
                                        <li className="flex items-start space-x-2 text-sm text-green-700">
                                            <span className="w-1 h-1 bg-green-500 rounded-full mt-2 flex-shrink-0"></span>
                                            <span>Subsidized transport options</span>
                                        </li>
                                    </ul>
                                </CardContent>
                            </Card>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Summary Statistics */}
            <Card className="border-0 shadow-lg">
                <CardHeader className="pb-4">
                    <CardTitle className="flex items-center text-xl">
                        <TrendingUp className="w-5 h-5 mr-2 text-purple-600" />
                        Key Demographics Insights
                    </CardTitle>
                    <CardDescription>
                        Summary of important demographic patterns and trends
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <Card className="border border-purple-200 bg-gradient-to-br from-purple-50 to-purple-100">
                            <CardContent className="p-4 text-center">
                                <div className="text-3xl font-bold text-purple-700 mb-1">57:43</div>
                                <div className="text-sm text-purple-600 font-medium">Male to Female Ratio</div>
                                <Badge variant="secondary" className="mt-2 bg-purple-200 text-purple-800">
                                    Gender Split
                                </Badge>
                            </CardContent>
                        </Card>

                        <Card className="border border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100">
                            <CardContent className="p-4 text-center">
                                <div className="text-3xl font-bold text-blue-700 mb-1">26-35</div>
                                <div className="text-sm text-blue-600 font-medium">Most Active Age Group</div>
                                <Badge variant="secondary" className="mt-2 bg-blue-200 text-blue-800">
                                    Peak Users
                                </Badge>
                            </CardContent>
                        </Card>

                        <Card className="border border-indigo-200 bg-gradient-to-br from-indigo-50 to-indigo-100">
                            <CardContent className="p-4 text-center">
                                <div className="text-3xl font-bold text-indigo-700 mb-1">₹25-50k</div>
                                <div className="text-sm text-indigo-600 font-medium">Dominant Income Bracket</div>
                                <Badge variant="secondary" className="mt-2 bg-indigo-200 text-indigo-800">
                                    Income Level
                                </Badge>
                            </CardContent>
                        </Card>

                        <Card className="border border-violet-200 bg-gradient-to-br from-violet-50 to-violet-100">
                            <CardContent className="p-4 text-center">
                                <div className="text-3xl font-bold text-violet-700 mb-1">3</div>
                                <div className="text-sm text-violet-600 font-medium">Critical Equity Zones</div>
                                <Badge variant="secondary" className="mt-2 bg-violet-200 text-violet-800">
                                    High Priority
                                </Badge>
                            </CardContent>
                        </Card>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default Demographics;
