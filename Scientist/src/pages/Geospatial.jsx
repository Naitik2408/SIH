import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap, Polygon } from 'react-leaflet';
import L from 'leaflet';
import {
    Layers,
    MapPin,
    Clock,
    Activity,
    Navigation,
    Square,
    X,
    Eye,
    EyeOff,
    BarChart3,
    Info,
    Settings,
    Filter,
    Download,
    Play,
    Pause,
    RotateCcw,
    Maximize2,
    HelpCircle,
    TrendingUp,
    Users,
    Car,
    Bus,
    Train,
    MapIcon,
    Satellite,
    Globe,
    Share2,
    ZoomIn,
    ZoomOut,
    Calendar,
    BarChart2,
    PieChart,
    AlertTriangle,
    CheckCircle,
    Target,
    Crosshair,
    Route,
    RefreshCw,
    FileText
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useGeospatialData, usePrefetchData, useDataContext } from '../contexts/DataContext';
import { GeospatialSkeleton, ErrorState, LoadingState } from '../components/LoadingSkeleton';
import dataCacheService from '../services/dataCacheService';

// Fix for default markers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});



// Enhanced heatmap implementation with realistic user data
const HeatmapLayer = ({ data, timeFilter, visible }) => {
    const filteredData = data.filter(point => point.time >= timeFilter[0] && point.time <= timeFilter[1]);

    if (!visible) return null;

    // Color scheme based on trip intensity and type
    const getPointColor = (point) => {
        const colorMap = {
            'residential': '#FF6B6B',
            'commercial': '#4ECDC4',
            'shopping': '#45B7D1',
            'entertainment': '#96CEB4',
            'business': '#FFEAA7',
            'family': '#DDA0DD',
            'medical': '#FFB347'
        };
        return colorMap[point.type] || '#FF6B6B';
    };

    const getIntensitySize = (intensity) => {
        return Math.max(15, Math.min(50, intensity * 2));
    };

    const getOpacity = (intensity) => {
        return Math.max(0.4, Math.min(0.9, intensity / 30));
    };

    return (
        <>
            {filteredData.map((point) => (
                <Marker
                    key={point.id}
                    position={[point.lat, point.lng]}
                    icon={L.divIcon({
                        className: 'heatmap-point',
                        html: `<div style="
                            width: ${getIntensitySize(point.intensity)}px;
                            height: ${getIntensitySize(point.intensity)}px;
                            background: ${getPointColor(point)};
                            opacity: ${getOpacity(point.intensity)};
                            border-radius: 50%;
                            border: 2px solid rgba(255, 255, 255, 0.8);
                            box-shadow: 0 2px 8px rgba(0,0,0,0.3);
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            color: white;
                            font-weight: bold;
                            font-size: 10px;
                        ">${point.trips}</div>`,
                        iconSize: [getIntensitySize(point.intensity), getIntensitySize(point.intensity)],
                        iconAnchor: [getIntensitySize(point.intensity) / 2, getIntensitySize(point.intensity) / 2]
                    })}
                >
                    <Popup>
                        <div className="text-sm max-w-xs">
                            <h3 className="font-semibold text-lg mb-2 text-blue-600">
                                📍 {point.area}
                            </h3>
                            <div className="space-y-1">
                                <p><span className="font-medium">Type:</span> <Badge variant="outline">{point.type}</Badge></p>
                                <p><span className="font-medium">Daily Trips:</span> <span className="text-green-600 font-bold">{point.trips}</span></p>
                                <p><span className="font-medium">Peak Hour:</span> {point.time}:00</p>
                                <p><span className="font-medium">Activity Level:</span> <span className="text-orange-600">{point.intensity.toFixed(1)}</span></p>
                                <p><span className="font-medium">Users:</span> {point.users || 1}</p>
                                <p><span className="font-medium">Primary Transport:</span> <Badge>{point.transport_mode}</Badge></p>
                                {point.occupation && (
                                    <p><span className="font-medium">Common Occupation:</span> {point.occupation}</p>
                                )}
                            </div>
                        </div>
                    </Popup>
                </Marker>
            ))}
        </>
    );
};

const ODArrowsLayer = ({ data, timeFilter, visible }) => {
    const filteredData = data.filter(arrow => arrow.time >= timeFilter[0] && arrow.time <= timeFilter[1]);

    if (!visible) return null;

    // Color scheme based on transport mode
    const getModeColor = (mode) => {
        const colorMap = {
            'metro': '#0EA5E9',
            'bus': '#10B981',
            'car': '#F59E0B',
            'auto': '#EF4444',
            'bike': '#8B5CF6',
            'walk': '#6B7280'
        };
        return colorMap[mode] || '#3B82F6';
    };

    // Weight based on trip frequency
    const getLineWeight = (trips) => {
        return Math.max(2, Math.min(8, trips / 2));
    };

    // Opacity based on trip frequency
    const getOpacity = (trips) => {
        return Math.max(0.4, Math.min(0.9, trips / 20));
    };

    return (
        <>
            {filteredData.map((arrow) => (
                <Polyline
                    key={arrow.id}
                    positions={[arrow.origin, arrow.destination]}
                    pathOptions={{
                        color: getModeColor(arrow.mode),
                        weight: getLineWeight(arrow.trips),
                        opacity: getOpacity(arrow.trips),
                        dashArray: arrow.purpose === 'entertainment' ? '10, 5' :
                            arrow.purpose === 'shopping' ? '5, 5' : null
                    }}
                >
                    <Popup>
                        <div className="text-sm max-w-xs">
                            <h3 className="font-semibold text-lg mb-2 text-blue-600">
                                🚀 Trip Flow Analysis
                            </h3>
                            <div className="space-y-2">
                                <div className="grid grid-cols-2 gap-2">
                                    <div>
                                        <p className="font-medium text-gray-600">From:</p>
                                        <p className="text-sm">{arrow.origin_area}</p>
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-600">To:</p>
                                        <p className="text-sm">{arrow.dest_area}</p>
                                    </div>
                                </div>
                                <hr className="my-2" />
                                <div className="space-y-1">
                                    <p><span className="font-medium">Weekly Trips:</span> <span className="text-green-600 font-bold">{arrow.trips}</span></p>
                                    <p><span className="font-medium">Peak Time:</span> {arrow.time}:00</p>
                                    <p><span className="font-medium">Avg Duration:</span> {arrow.duration} min</p>
                                    <p><span className="font-medium">Transport:</span> <Badge style={{ backgroundColor: getModeColor(arrow.mode) }}>{arrow.mode}</Badge></p>
                                    <p><span className="font-medium">Purpose:</span> <Badge variant="outline">{arrow.purpose}</Badge></p>
                                    <p><span className="font-medium">Users:</span> {arrow.users || 1}</p>
                                    {arrow.user_occupation && (
                                        <p><span className="font-medium">Common Job:</span> {arrow.user_occupation}</p>
                                    )}
                                    {arrow.income_bracket && (
                                        <p><span className="font-medium">Income Level:</span> <Badge variant="secondary">{arrow.income_bracket}</Badge></p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </Popup>
                </Polyline>
            ))}
        </>
    );
};



const Geospatial = () => {
    // Use React Query for data fetching with caching
    const {
        data: geospatialData,
        isLoading,
        isError,
        error,
        refetch,
        isFetching
    } = useGeospatialData();

    const { prefetch } = usePrefetchData();
    const { cacheManager } = useDataContext();

    const [layers, setLayers] = useState({
        heatmap: true,
        odArrows: false,
        hexbin: false
    });
    const [timeFilter, setTimeFilter] = useState([0, 24]);
    const [mapStyle, setMapStyle] = useState('default'); // 'default' or 'satellite'
    const [showControlPanel, setShowControlPanel] = useState(false); // New state for control panel

    // Prefetch other page data when geospatial loads
    useEffect(() => {
        if (!isLoading && geospatialData && prefetch) {
            // Prefetch dashboard and demographics data for faster navigation
            setTimeout(() => {
                if (prefetch.prefetchDashboardData) {
                    prefetch.prefetchDashboardData();
                }
                if (prefetch.prefetchTemporalData) {
                    prefetch.prefetchTemporalData();
                }
            }, 1000);
        }
    }, [isLoading, geospatialData, prefetch]);

    // Handle loading state
    if (isLoading) {
        return <GeospatialSkeleton />;
    }

    // Handle error state
    if (isError) {
        return (
            <ErrorState
                title="Failed to Load Geospatial Data"
                message={error?.message || "Unable to fetch geospatial data. Please check your connection."}
                onRetry={refetch}
            />
        );
    }

    // Extract data with defaults and add debugging
    console.log('🗺️ DEBUG Geospatial Component: geospatialData received:', geospatialData);

    const heatmapData = geospatialData?.heatmapData || [];
    const odData = geospatialData?.odData || [];
    const demographicData = geospatialData?.demographicData || {
        totalUsers: 0,
        totalTrips: 0,
        ageGroups: { young: 0, middle: 0, senior: 0 },
        incomeDistribution: { low: 0, middle: 0, high: 0 },
        transportPreferences: {},
        topRoutes: []
    };

    console.log('🗺️ DEBUG Geospatial Component: heatmapData length:', heatmapData.length);
    console.log('🗺️ DEBUG Geospatial Component: odData length:', odData.length);
    console.log('🗺️ DEBUG Geospatial Component: demographicData:', demographicData);

    // Calculate real-time statistics
    const filteredHeatmapData = heatmapData.filter(point =>
        point.time >= timeFilter[0] && point.time <= timeFilter[1]
    );
    const filteredODData = odData.filter(flow =>
        flow.time >= timeFilter[0] && flow.time <= timeFilter[1]
    );

    const activeTrips = filteredODData.reduce((sum, flow) => sum + flow.trips, 0);
    const hotZones = filteredHeatmapData.filter(point => point.intensity > 15).length;

    // Add debugging for activeTrips calculation
    if (odData.length > 0) {
        console.log('🔢 DEBUG Geospatial Stats: OD data length:', odData.length);
        console.log('🔢 DEBUG Geospatial Stats: Filtered OD data length:', filteredODData.length);
        console.log('🔢 DEBUG Geospatial Stats: Time filter:', timeFilter);
        console.log('🔢 DEBUG Geospatial Stats: Sample OD flow:', filteredODData[0]);
        console.log('🔢 DEBUG Geospatial Stats: Active trips calculated:', activeTrips);
        console.log('🔢 DEBUG Geospatial Stats: Demographics total trips:', demographicData.totalTrips);
    }
    const peakTime = filteredHeatmapData.length > 0 ?
        filteredHeatmapData.reduce((max, point) =>
            point.intensity > max.intensity ? point : max
        ).time : 9;

    const toggleLayer = (layerName) => {
        setLayers(prev => ({
            ...prev,
            [layerName]: !prev[layerName]
        }));
    };

    const handleTimeChange = (values) => {
        setTimeFilter(values);
    };

    return (
        <div className="min-h-[calc(100vh-140px)] w-full relative overflow-hidden bg-gray-50">
            {isFetching && (
                <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-50">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                        <p className="mt-4 text-gray-600">Loading Kerala journey data...</p>
                    </div>
                </div>
            )}

            {/* Floating Control Button */}
            <div className="absolute top-4 right-4 z-30">
                <Button
                    onClick={() => setShowControlPanel(!showControlPanel)}
                    className="bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 shadow-lg"
                    size="sm"
                >
                    <Settings className="w-4 h-4 mr-2" />
                    Controls
                </Button>
            </div>

            {/* Control Panel Popup */}
            {showControlPanel && (
                <div className="absolute top-16 right-4 z-40 bg-white rounded-lg shadow-xl border border-gray-200 p-4 w-80 max-h-[60vh] overflow-y-auto">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold text-gray-800 flex items-center">
                            <Settings className="w-4 h-4 mr-2 text-blue-600" />
                            Map Controls
                        </h3>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowControlPanel(false)}
                        >
                            <X className="w-4 h-4" />
                        </Button>
                    </div>

                    {/* Layer Controls */}
                    <div className="mb-6">
                        <h4 className="text-sm font-medium text-gray-700 mb-3">Layers</h4>
                        <div className="space-y-2">
                            <div
                                onClick={() => toggleLayer('heatmap')}
                                className={`w-full flex items-center px-3 py-2 rounded-lg border cursor-pointer transition-all duration-200 ${layers.heatmap
                                    ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white border-blue-600 shadow-lg'
                                    : 'bg-white text-gray-700 border-gray-300 hover:bg-blue-50 hover:border-blue-300'
                                    }`}
                            >
                                <Activity className="w-4 h-4 mr-2" />
                                Heatmap
                            </div>
                            <div
                                onClick={() => toggleLayer('odArrows')}
                                className={`w-full flex items-center px-3 py-2 rounded-lg border cursor-pointer transition-all duration-200 ${layers.odArrows
                                    ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white border-blue-600 shadow-lg'
                                    : 'bg-white text-gray-700 border-gray-300 hover:bg-blue-50 hover:border-blue-300'
                                    }`}
                            >
                                <Route className="w-4 h-4 mr-2" />
                                OD Flows
                            </div>
                            <div
                                onClick={() => setMapStyle(mapStyle === 'satellite' ? 'default' : 'satellite')}
                                className={`w-full flex items-center px-3 py-2 rounded-lg border cursor-pointer transition-all duration-200 ${mapStyle === 'satellite'
                                    ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white border-blue-600 shadow-lg'
                                    : 'bg-white text-gray-700 border-gray-300 hover:bg-blue-50 hover:border-blue-300'
                                    }`}
                            >
                                <Satellite className="w-4 h-4 mr-2" />
                                {mapStyle === 'satellite' ? 'Street View' : 'Satellite View'}
                            </div>
                        </div>
                    </div>

                    {/* Time Filter */}
                    <div className="mb-6">
                        <h4 className="text-sm font-medium text-gray-700 mb-3">Time Filter</h4>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between text-sm text-gray-600">
                                <span>Start: {timeFilter[0]}:00</span>
                                <span>End: {timeFilter[1]}:00</span>
                            </div>
                            <input
                                type="range"
                                min="0"
                                max="23"
                                value={timeFilter[0]}
                                onChange={(e) => setTimeFilter([parseInt(e.target.value), timeFilter[1]])}
                                className="w-full"
                            />
                            <input
                                type="range"
                                min="0"
                                max="23"
                                value={timeFilter[1]}
                                onChange={(e) => setTimeFilter([timeFilter[0], parseInt(e.target.value)])}
                                className="w-full"
                            />
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setTimeFilter([0, 24])}
                                className="w-full"
                            >
                                Reset to All Day
                            </Button>
                        </div>
                    </div>

                    {/* Quick Stats */}
                    <div className="mb-4">
                        <h4 className="text-sm font-medium text-gray-700 mb-3">Quick Stats</h4>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                            <div className="text-center p-2 bg-blue-50 rounded">
                                <div className="font-bold text-blue-600">{activeTrips.toLocaleString()}</div>
                                <div className="text-gray-600 text-xs">Active Trips</div>
                            </div>
                            <div className="text-center p-2 bg-green-50 rounded">
                                <div className="font-bold text-green-600">{hotZones}</div>
                                <div className="text-gray-600 text-xs">Hot Zones</div>
                            </div>
                            <div className="text-center p-2 bg-orange-50 rounded">
                                <div className="font-bold text-orange-600">{peakTime}:00</div>
                                <div className="text-gray-600 text-xs">Peak Hour</div>
                            </div>
                            <div className="text-center p-2 bg-purple-50 rounded">
                                <div className="font-bold text-purple-600">{demographicData.totalUsers}</div>
                                <div className="text-gray-600 text-xs">Total Users</div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Full Screen Map Container */}
            <div className="absolute inset-0 z-0">
                <MapContainer
                    center={[10.8505, 76.2711]} // Kerala coordinates (Kochi)
                    zoom={9}
                    className="h-full w-full"
                    zoomControl={false}
                >
                    {mapStyle === 'satellite' ? (
                        <TileLayer
                            attribution='&copy; <a href="https://www.esri.com/">Esri</a>'
                            url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                        />
                    ) : (
                        <TileLayer
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />
                    )}

                    {layers.heatmap && (
                        <HeatmapLayer
                            data={heatmapData}
                            timeFilter={timeFilter}
                            visible={layers.heatmap}
                        />
                    )}

                    {layers.odArrows && (
                        <ODArrowsLayer
                            data={odData}
                            timeFilter={timeFilter}
                            visible={layers.odArrows}
                        />
                    )}
                </MapContainer>
            </div>

            {/* Data Summary Panel */}
            <div className="absolute bottom-4 left-4 z-20 bg-white rounded-lg shadow-lg p-4 max-w-sm">
                <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
                    <BarChart3 className="w-4 h-4 mr-2 text-blue-600" />
                    Data Summary
                </h3>

                <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3 text-sm">
                        <div className="text-center p-2 bg-blue-50 rounded">
                            <div className="font-bold text-blue-600">{demographicData.totalUsers}</div>
                            <div className="text-gray-600">Users</div>
                        </div>
                        <div className="text-center p-2 bg-green-50 rounded">
                            <div className="font-bold text-green-600">{activeTrips}</div>
                            <div className="text-gray-600">Trips</div>
                        </div>
                    </div>

                    <div className="text-xs">
                        <div className="font-medium text-gray-600 mb-1">Top Routes:</div>
                        {demographicData.topRoutes.slice(0, 3).map(([route, count], index) => (
                            <div key={index} className="flex justify-between">
                                <span className="truncate">{route.split(' → ')[0]}</span>
                                <span className="text-gray-500">{count}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Geospatial;