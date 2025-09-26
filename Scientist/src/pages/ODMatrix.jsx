import React, { useState, useMemo, useEffect } from 'react';
import { MapContainer, TileLayer, Polyline, Marker, Popup } from 'react-leaflet';
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
    PieChart,
    Pie,
    Cell
} from 'recharts';
import {
    MapPin,
    TrendingUp,
    Clock,
    Car,
    Users,
    ArrowRight,
    Navigation,
    Info,
    Maximize2,
    BarChart3,
    Activity,
    Route,
    Target
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import L from 'leaflet';
import {
    generateRealCorridorData
} from '../utils/odMatrixAnalytics';
import { useODMatrixData, usePrefetchData, useDataContext } from '../contexts/DataContext';
import { ODMatrixSkeleton, ErrorState, LoadingState } from '../components/LoadingSkeleton';

// Fix for default markers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const ODMatrix = () => {
    const [selectedCorridor, setSelectedCorridor] = useState(null);
    const [hoveredCell, setHoveredCell] = useState(null);
    const [showInfo, setShowInfo] = useState(false);
    const [matrixView, setMatrixView] = useState('absolute'); // 'absolute' or 'percentage'

    // Use React Query for data fetching with caching
    const {
        data: odMatrixData,
        isLoading,
        isError,
        error,
        refetch,
        isFetching
    } = useODMatrixData();

    const { prefetch } = usePrefetchData();
    const { cacheManager } = useDataContext();

    // Extract data with defaults (must be done before any conditional returns to maintain hook order)
    const odMatrix = odMatrixData?.matrix || {};
    const zones = odMatrixData?.zones || [];
    const topCorridors = odMatrixData?.topCorridors || [];

    // Calculate total trips for percentage view (useMemo must be called before conditional returns)
    const totalTrips = useMemo(() => {
        let total = 0;
        if (odMatrix && typeof odMatrix === 'object') {
            Object.keys(odMatrix).forEach(origin => {
                if (odMatrix[origin] && typeof odMatrix[origin] === 'object') {
                    Object.keys(odMatrix[origin]).forEach(destination => {
                        total += odMatrix[origin][destination] || 0;
                    });
                }
            });
        }
        return total;
    }, [odMatrix]);

    // Prefetch other page data when ODMatrix loads
    useEffect(() => {
        if (!isLoading && odMatrixData) {
            // Prefetch other pages for faster navigation
            setTimeout(() => {
                prefetch.prefetchDashboardData();
                prefetch.prefetchGeospatialData();
                prefetch.prefetchDemographicsData();
                prefetch.prefetchTemporalData();
            }, 1000);
        }
    }, [isLoading, odMatrixData, prefetch]);

    // Handle loading state
    if (isLoading) {
        return <ODMatrixSkeleton />;
    }

    // Handle error state
    if (isError) {
        return (
            <ErrorState
                title="Failed to Load OD Matrix Data"
                message={error?.message || "Unable to fetch OD Matrix data. Please check your connection."}
                onRetry={refetch}
            />
        );
    }

    const corridorData = selectedCorridor
        ? generateRealCorridorData(selectedCorridor.origin, selectedCorridor.destination)
        : null;

    const handleCellClick = (origin, destination, trips) => {
        if (trips > 0) {
            setSelectedCorridor({ origin, destination, trips });
        }
    };

    const getOriginZone = (id) => zones.find(z => z.id === id);
    const getDestinationZone = (id) => zones.find(z => z.id === id);

    const getCellColor = (trips) => {
        if (trips === 0) return 'bg-gray-100 text-gray-400';
        if (trips < 100) return 'bg-blue-100 text-blue-800 hover:bg-blue-200';
        if (trips < 200) return 'bg-blue-200 text-blue-900 hover:bg-blue-300';
        if (trips < 300) return 'bg-blue-300 text-white hover:bg-blue-400';
        if (trips < 400) return 'bg-blue-400 text-white hover:bg-blue-500';
        return 'bg-blue-500 text-white hover:bg-blue-600';
    };

    return (
        <div className="p-4 md:p-6 space-y-6 bg-gradient-to-br from-slate-50 via-white to-blue-50 min-h-screen">


            {/* Enhanced Header with Info */}
            <div className="relative bg-white rounded-3xl shadow-2xl border-0 overflow-hidden">
                {/* Background Pattern */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 opacity-80"></div>
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(59,130,246,0.05),transparent)] bg-[radial-gradient(circle_at_70%_80%,rgba(147,51,234,0.05),transparent)]"></div>

                <div className="relative p-6 md:p-8">
                    {/* Top Section with Title and Stats */}
                    <div className="flex flex-col lg:flex-row lg:items-start justify-between space-y-6 lg:space-y-0 lg:space-x-8 mb-6">
                        <div className="flex-1">
                            <div className="flex items-start space-x-4 mb-4">
                                <div className="p-4 bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-600 rounded-2xl shadow-lg transform rotate-3 hover:rotate-0 transition-transform duration-300">
                                    <Navigation className="w-8 h-8 text-white" />
                                </div>
                                <div className="flex-1">
                                    <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-700 bg-clip-text text-transparent leading-tight">
                                        Origin-Destination Matrix
                                    </h1>
                                    <p className="text-slate-600 text-lg mt-2 font-medium">
                                        Comprehensive travel flow analysis from <span className="text-blue-600 font-bold">{zones.length}</span> zones
                                    </p>
                                    <div className="flex items-center space-x-4 mt-3">
                                        <Badge className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-3 py-1">
                                            Real Data
                                        </Badge>
                                        <Badge variant="outline" className="border-slate-300 text-slate-600">
                                            {totalTrips.toLocaleString()} Daily Trips
                                        </Badge>
                                        <Badge variant="outline" className="border-slate-300 text-slate-600">
                                            Live Analytics
                                        </Badge>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Quick Stats Cards */}
                        <div className="flex flex-col sm:flex-row lg:flex-col gap-4">
                            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-4 border border-white/50 shadow-lg min-w-48">
                                <div className="flex items-center space-x-3">
                                    <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl">
                                        <Route className="w-5 h-5 text-white" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-slate-600 font-medium">Active Zones</p>
                                        <p className="text-2xl font-bold text-slate-800">{zones.length}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-4 border border-white/50 shadow-lg min-w-48">
                                <div className="flex items-center space-x-3">
                                    <div className="p-2 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl">
                                        <TrendingUp className="w-5 h-5 text-white" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-slate-600 font-medium">Peak Flow</p>
                                        <p className="text-2xl font-bold text-slate-800">{topCorridors[0]?.trips || 0}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Controls Section */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0 mb-6">
                        <div className="flex items-center space-x-4">
                            <div className="flex space-x-2">
                                <button
                                    onClick={() => setMatrixView('absolute')}
                                    className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center space-x-2 ${matrixView === 'absolute'
                                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg transform scale-105'
                                        : 'bg-white/60 backdrop-blur-sm text-slate-700 border border-slate-200 hover:bg-white/80 hover:shadow-md'
                                        }`}
                                >
                                    <BarChart3 className="w-4 h-4" />
                                    <span>Absolute Values</span>
                                </button>
                                <button
                                    onClick={() => setMatrixView('percentage')}
                                    className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center space-x-2 ${matrixView === 'percentage'
                                        ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg transform scale-105'
                                        : 'bg-white/60 backdrop-blur-sm text-slate-700 border border-slate-200 hover:bg-white/80 hover:shadow-md'
                                        }`}
                                >
                                    <Target className="w-4 h-4" />
                                    <span>Percentage</span>
                                </button>
                            </div>
                        </div>

                        <div className="flex items-center space-x-3">
                            <div className="text-sm text-slate-600">
                                Viewing: <span className="font-semibold text-slate-800">{matrixView === 'absolute' ? 'Trip Counts' : 'Percentage Share'}</span>
                            </div>
                        </div>
                    </div>

                    {/* Enhanced Info Panel */}
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/50 rounded-2xl p-6 backdrop-blur-sm">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <div className="flex items-start space-x-4">
                                <div className="p-2 bg-blue-500 rounded-lg flex-shrink-0">
                                    <Info className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-blue-900 mb-2">Interactive Analysis</h3>
                                    <ul className="space-y-1 text-sm text-blue-800">
                                        <li>• Click any matrix cell to analyze corridor details</li>
                                        <li>• Hover for instant trip volume and zone information</li>
                                        <li>• Color intensity indicates traffic volume levels</li>
                                    </ul>
                                </div>
                            </div>
                            <div className="flex items-start space-x-4">
                                <div className="p-2 bg-purple-500 rounded-lg flex-shrink-0">
                                    <Activity className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-purple-900 mb-2">Real-Time Data</h3>
                                    <ul className="space-y-1 text-sm text-purple-800">
                                        <li>• Based on actual user journey patterns</li>
                                        <li>• Updated with live transportation flows</li>
                                        <li>• Includes temporal and modal split analysis</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content - Stacked Layout */}
            <div className="space-y-6">
                {/* Top Section - Enhanced OD Matrix */}
                <Card className="shadow-xl border-0 bg-gradient-to-br from-white via-slate-50 to-white">
                    <CardHeader className="pb-4">
                        <div className="flex items-center justify-between">
                            <CardTitle className="flex items-center text-xl font-bold text-slate-800">
                                <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg mr-3">
                                    <Navigation className="w-5 h-5 text-white" />
                                </div>
                                OD Flow Matrix
                            </CardTitle>
                            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                                {matrixView === 'absolute' ? 'Trips/Day' : '% of Total'}
                            </Badge>
                        </div>
                        <CardDescription className="text-slate-600">
                            {matrixView === 'absolute'
                                ? 'Real daily trip volumes between zones from user data'
                                : 'Percentage distribution of total daily trips from user data'
                            }
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto bg-white rounded-xl border border-slate-200">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="bg-gradient-to-r from-slate-50 to-blue-50">
                                        <th className="p-3 text-left font-semibold text-slate-700 border-r border-slate-200">
                                            Origin ↓ / Destination →
                                        </th>
                                        {zones.map(zone => (
                                            <th key={zone.id} className="p-3 text-center font-semibold text-slate-700 min-w-20 border-r border-slate-200">
                                                <div className="space-y-1">
                                                    <div className="font-bold text-blue-600">{zone.id}</div>
                                                    <div className="text-xs text-slate-500 font-normal truncate">
                                                        {zone.name.split(' ')[0]}
                                                    </div>
                                                </div>
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {zones.map((originZone, rowIndex) => (
                                        <tr key={originZone.id} className={`border-t border-slate-200 ${rowIndex % 2 === 0 ? 'bg-slate-25' : 'bg-white'}`}>
                                            <td className="p-3 font-semibold text-slate-700 bg-gradient-to-r from-slate-50 to-blue-50 border-r border-slate-200">
                                                <div className="space-y-1">
                                                    <div className="font-bold text-blue-600">{originZone.id}</div>
                                                    <div className="text-xs text-slate-500 font-normal">
                                                        {originZone.name.split(' ')[0]}
                                                    </div>
                                                </div>
                                            </td>
                                            {zones.map(destZone => {
                                                const trips = (odMatrix[originZone.id] && odMatrix[originZone.id][destZone.id]) || 0;
                                                const percentage = totalTrips > 0 ? ((trips / totalTrips) * 100).toFixed(1) : 0;
                                                const displayValue = matrixView === 'absolute' ? trips : `${percentage}%`;
                                                const isSelected = selectedCorridor?.origin === originZone.id && selectedCorridor?.destination === destZone.id;
                                                const isHovered = hoveredCell?.origin === originZone.id && hoveredCell?.destination === destZone.id;

                                                return (
                                                    <td
                                                        key={destZone.id}
                                                        className={`p-3 text-center cursor-pointer transition-all duration-300 border-r border-slate-200 relative group ${getCellColor(trips)
                                                            } ${isSelected ? 'ring-2 ring-blue-500 ring-inset' : ''} ${isHovered ? 'scale-105 shadow-lg z-10' : ''
                                                            } ${trips > 0 ? 'hover:shadow-xl hover:scale-105' : ''}`}
                                                        onClick={() => handleCellClick(originZone.id, destZone.id, trips)}
                                                        onMouseEnter={() => setHoveredCell({ origin: originZone.id, destination: destZone.id })}
                                                        onMouseLeave={() => setHoveredCell(null)}
                                                    >
                                                        <div className="font-semibold">
                                                            {trips > 0 ? displayValue : '-'}
                                                        </div>
                                                        {trips > 0 && (
                                                            <div className="absolute inset-0 bg-blue-600 opacity-0 group-hover:opacity-10 transition-opacity duration-200 rounded"></div>
                                                        )}

                                                        {/* Enhanced Tooltip */}
                                                        {isHovered && trips > 0 && (
                                                            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 z-50">
                                                                <div className="bg-slate-800 text-white text-xs rounded-lg p-3 shadow-xl border border-slate-600 min-w-48">
                                                                    <div className="font-semibold text-blue-300 mb-1">Corridor Details</div>
                                                                    <div className="space-y-1">
                                                                        <div><span className="text-slate-300">From:</span> {originZone.name}</div>
                                                                        <div><span className="text-slate-300">To:</span> {destZone.name}</div>
                                                                        <div className="pt-1 border-t border-slate-600">
                                                                            <span className="text-slate-300">Volume:</span> <span className="font-bold text-blue-300">{trips} trips/day</span>
                                                                        </div>
                                                                        <div><span className="text-slate-300">Share:</span> {percentage}% of total</div>
                                                                    </div>
                                                                    <div className="text-xs text-slate-400 mt-2">Click to analyze in detail</div>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </td>
                                                );
                                            })}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Enhanced Legend */}
                        <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-200">
                            <div className="flex items-center justify-between mb-3">
                                <h4 className="font-semibold text-slate-700">Real Trip Volume Legend</h4>
                                <div className="text-sm text-slate-600">Total: {totalTrips.toLocaleString()} real trips/day</div>
                            </div>
                            <div className="flex flex-wrap items-center justify-center gap-4 text-xs">
                                <div className="flex items-center space-x-2">
                                    <div className="w-5 h-5 bg-gray-100 rounded border"></div>
                                    <span className="text-slate-600">No trips</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <div className="w-5 h-5 bg-blue-100 rounded border"></div>
                                    <span className="text-slate-600">1-99 trips</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <div className="w-5 h-5 bg-blue-200 rounded border"></div>
                                    <span className="text-slate-600">100-199</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <div className="w-5 h-5 bg-blue-300 rounded border"></div>
                                    <span className="text-slate-600">200-299</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <div className="w-5 h-5 bg-blue-400 text-white rounded border flex items-center justify-center">
                                        <span className="text-xs">✓</span>
                                    </div>
                                    <span className="text-slate-600">300-399</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <div className="w-5 h-5 bg-blue-500 text-white rounded border flex items-center justify-center">
                                        <span className="text-xs">✓</span>
                                    </div>
                                    <span className="text-slate-600">400+ trips</span>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Bottom Section - Corridor Visualization and Stats */}
                <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
                    {/* Left Column - Quick Stats Cards */}
                    <div className="xl:col-span-1 space-y-4">
                        <Card className="shadow-lg border-0 bg-gradient-to-br from-blue-50 to-blue-100">
                            <CardContent className="p-4">
                                <div className="flex items-center space-x-3">
                                    <div className="p-2 bg-blue-500 rounded-lg">
                                        <Route className="w-5 h-5 text-white" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-blue-700 font-medium">Active Zones</p>
                                        <p className="text-2xl font-bold text-blue-800">{zones.length}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="shadow-lg border-0 bg-gradient-to-br from-purple-50 to-purple-100">
                            <CardContent className="p-4">
                                <div className="flex items-center space-x-3">
                                    <div className="p-2 bg-purple-500 rounded-lg">
                                        <Activity className="w-5 h-5 text-white" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-purple-700 font-medium">Peak Corridor</p>
                                        <p className="text-2xl font-bold text-purple-800">{topCorridors[0]?.trips || 0}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="shadow-lg border-0 bg-gradient-to-br from-emerald-50 to-emerald-100">
                            <CardContent className="p-4">
                                <div className="flex items-center space-x-3">
                                    <div className="p-2 bg-emerald-500 rounded-lg">
                                        <Users className="w-5 h-5 text-white" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-emerald-700 font-medium">Total Trips</p>
                                        <p className="text-2xl font-bold text-emerald-800">{totalTrips.toLocaleString()}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right Column - Enhanced Map */}
                    <Card className="xl:col-span-3 shadow-xl border-0 bg-gradient-to-br from-white via-green-50 to-white">
                        <CardHeader className="pb-4">
                            <CardTitle className="flex items-center text-lg font-bold text-slate-800">
                                <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg mr-3">
                                    <MapPin className="w-5 h-5 text-white" />
                                </div>
                                Real Corridor Visualization
                            </CardTitle>
                            <CardDescription className="text-slate-600">
                                {selectedCorridor
                                    ? `Real route: ${zones.find(z => z.id === selectedCorridor.origin)?.name} → ${zones.find(z => z.id === selectedCorridor.destination)?.name}`
                                    : 'Select a corridor from the matrix to visualize the route'
                                }
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="h-96 rounded-xl overflow-hidden border border-slate-200 bg-slate-50">
                                <MapContainer
                                    center={[28.6139, 77.2090]}
                                    zoom={10}
                                    style={{ height: '100%', width: '100%' }}
                                >
                                    <TileLayer
                                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                        attribution='&copy; OpenStreetMap contributors'
                                    />

                                    {/* Zone Markers with enhanced styling */}
                                    {zones.map(zone => (
                                        <Marker key={zone.id} position={zone.coords}>
                                            <Popup>
                                                <div className="text-center p-2">
                                                    <h3 className="font-bold text-slate-800 mb-1">{zone.name}</h3>
                                                    <Badge variant="outline" className="text-xs">{zone.id}</Badge>
                                                    <div className="text-xs text-slate-600 mt-2">
                                                        Lat: {zone.coords[0].toFixed(4)}, Lng: {zone.coords[1].toFixed(4)}
                                                    </div>
                                                </div>
                                            </Popup>
                                        </Marker>
                                    ))}

                                    {selectedCorridor && (
                                        <Polyline
                                            positions={[
                                                zones.find(z => z.id === selectedCorridor.origin)?.coords,
                                                zones.find(z => z.id === selectedCorridor.destination)?.coords
                                            ]}
                                            pathOptions={{
                                                color: '#3B82F6',
                                                weight: 6,
                                                opacity: 0.8,
                                                dashArray: '10, 5'
                                            }}
                                        />
                                    )}
                                </MapContainer>
                            </div>

                            {!selectedCorridor && (
                                <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                                    <div className="flex items-center space-x-2 text-amber-800">
                                        <Info className="w-4 h-4" />
                                        <span className="text-sm font-medium">Click any cell in the matrix to see the corridor route</span>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Corridor Details Section */}
            {selectedCorridor && corridorData && (
                <Card className="shadow-xl border-0 bg-gradient-to-br from-white via-purple-50 to-white">
                    <CardHeader className="pb-4">
                        <div className="flex items-center justify-between">
                            <CardTitle className="flex items-center text-xl font-bold text-slate-800">
                                <div className="p-2 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg mr-3">
                                    <ArrowRight className="w-5 h-5 text-white" />
                                </div>
                                Real Corridor Analysis
                            </CardTitle>
                            <Button
                                variant="outline"
                                onClick={() => setSelectedCorridor(null)}
                                className="border-slate-300 hover:bg-slate-50"
                            >
                                Clear Selection
                            </Button>
                        </div>
                        <CardDescription className="text-slate-600 flex items-center space-x-4">
                            <div className="flex items-center space-x-2">
                                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                                    {zones.find(z => z.id === selectedCorridor.origin)?.name}
                                </Badge>
                                <ArrowRight className="w-4 h-4 text-slate-400" />
                                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                    {zones.find(z => z.id === selectedCorridor.destination)?.name}
                                </Badge>
                            </div>
                            <Badge className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
                                {selectedCorridor.trips} real trips/day
                            </Badge>
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Daily Trips Chart */}
                            <div className="lg:col-span-2">
                                <h3 className="font-semibold text-slate-800 mb-4 flex items-center">
                                    <TrendingUp className="w-5 h-5 mr-2 text-blue-600" />
                                    Real Weekly Trip Pattern
                                </h3>
                                <div className="h-64 bg-white rounded-lg border border-slate-200 p-4">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart data={corridorData.dailyTrips}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                            <XAxis
                                                dataKey="day"
                                                tick={{ fill: '#64748b', fontSize: 12 }}
                                                axisLine={{ stroke: '#cbd5e1' }}
                                            />
                                            <YAxis
                                                tick={{ fill: '#64748b', fontSize: 12 }}
                                                axisLine={{ stroke: '#cbd5e1' }}
                                            />
                                            <Tooltip
                                                contentStyle={{
                                                    backgroundColor: '#1e293b',
                                                    border: 'none',
                                                    borderRadius: '8px',
                                                    color: '#fff'
                                                }}
                                            />
                                            <Line
                                                type="monotone"
                                                dataKey="trips"
                                                stroke="#3b82f6"
                                                strokeWidth={3}
                                                dot={{ fill: '#3b82f6', strokeWidth: 2, r: 6 }}
                                                activeDot={{ r: 8, fill: '#1d4ed8' }}
                                            />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            {/* Mode Split Pie Chart */}
                            <div>
                                <h3 className="font-semibold text-slate-800 mb-4 flex items-center">
                                    <Car className="w-5 h-5 mr-2 text-green-600" />
                                    Real Transport Modes
                                </h3>
                                <div className="h-64 bg-white rounded-lg border border-slate-200 p-4">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={corridorData.modeData}
                                                cx="50%"
                                                cy="50%"
                                                labelLine={false}
                                                label={({ mode, percent }) => `${mode} ${(percent * 100).toFixed(0)}%`}
                                                outerRadius={80}
                                                fill="#8884d8"
                                                dataKey="trips"
                                            >
                                                {corridorData.modeData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={['#3b82f6', '#10b981', '#f59e0b', '#ef4444'][index % 4]} />
                                                ))}
                                            </Pie>
                                            <Tooltip />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>

                        {/* Peak Hours Analysis */}
                        <div className="mt-6">
                            <h3 className="font-semibold text-slate-800 mb-4 flex items-center">
                                <Clock className="w-5 h-5 mr-2 text-amber-600" />
                                Hourly Traffic Distribution
                            </h3>
                            <div className="h-48 bg-white rounded-lg border border-slate-200 p-4">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={corridorData.peakHours}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                        <XAxis
                                            dataKey="hour"
                                            tick={{ fill: '#64748b', fontSize: 12 }}
                                            axisLine={{ stroke: '#cbd5e1' }}
                                        />
                                        <YAxis
                                            tick={{ fill: '#64748b', fontSize: 12 }}
                                            axisLine={{ stroke: '#cbd5e1' }}
                                        />
                                        <Tooltip
                                            contentStyle={{
                                                backgroundColor: '#1e293b',
                                                border: 'none',
                                                borderRadius: '8px',
                                                color: '#fff'
                                            }}
                                        />
                                        <Bar
                                            dataKey="trips"
                                            fill="#f59e0b"
                                            radius={[4, 4, 0, 0]}
                                        />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Enhanced Top Corridors */}
            <Card className="shadow-xl border-0 bg-gradient-to-br from-white via-orange-50 to-white">
                <CardHeader className="pb-4">
                    <CardTitle className="flex items-center text-xl font-bold text-slate-800">
                        <div className="p-2 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg mr-3">
                            <Users className="w-5 h-5 text-white" />
                        </div>
                        Top Traffic Corridors
                    </CardTitle>
                    <CardDescription className="text-slate-600">
                        Highest volume origin-destination pairs ranked by daily trips
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                        {topCorridors.map((corridor, index) => (
                            <Card
                                key={`${corridor.origin}-${corridor.destination}`}
                                className={`cursor-pointer transition-all duration-300 hover:shadow-lg transform hover:-translate-y-1 ${selectedCorridor?.origin === corridor.origin && selectedCorridor?.destination === corridor.destination
                                    ? 'ring-2 ring-blue-500 bg-blue-50 border-blue-200'
                                    : 'border-slate-200 hover:border-blue-300 hover:bg-blue-50'
                                    }`}
                                onClick={() => setSelectedCorridor(corridor)}
                            >
                                <CardContent className="p-4">
                                    <div className="flex items-center justify-between mb-3">
                                        <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
                                            #{index + 1}
                                        </Badge>
                                        <div className="text-right">
                                            <div className="text-2xl font-bold text-blue-600">{corridor.trips}</div>
                                            <div className="text-xs text-slate-500">trips/day</div>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs text-slate-500">From</span>
                                            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 text-xs">
                                                {corridor.origin}
                                            </Badge>
                                        </div>
                                        <div className="text-sm font-medium text-slate-700 truncate">
                                            {corridor.originName}
                                        </div>
                                        <div className="flex items-center justify-center py-1">
                                            <ArrowRight className="w-4 h-4 text-slate-400" />
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs text-slate-500">To</span>
                                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 text-xs">
                                                {corridor.destination}
                                            </Badge>
                                        </div>
                                        <div className="text-sm font-medium text-slate-700 truncate">
                                            {corridor.destinationName}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default ODMatrix;
