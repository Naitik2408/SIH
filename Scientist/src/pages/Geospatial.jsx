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
import { fetchJourneyData } from '../services/apiService';

// Fix for default markers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Generate realistic heatmap data from journey data
const generateHeatmapData = async () => {
    try {
        const response = await fetchJourneyData();
        const journeys = response.data || [];
        
        console.log('🗺️ DEBUG Geospatial Heatmap: Total journeys fetched:', journeys.length);
        console.log('🗺️ DEBUG Geospatial Heatmap: Sample journey structure:', journeys[0]);
        
        const heatmapPoints = [];
        let id = 0;
        let processedPoints = 0;
        let skippedPoints = 0;

        journeys.forEach((journey, index) => {
            // Add start location (FIX: Use lat/lng instead of latitude/longitude)
            const startLoc = journey.tripData?.startLocation;
            
            if (index < 3) {
                console.log(`🗺️ DEBUG Geospatial Journey ${index + 1} start:`, {
                    startLoc,
                    hasLat: !!startLoc?.lat,
                    hasLng: !!startLoc?.lng,
                    lat: startLoc?.lat,
                    lng: startLoc?.lng,
                    address: startLoc?.address
                });
            }
            
            if (startLoc && startLoc.lat && startLoc.lng) {
                heatmapPoints.push({
                    id: id++,
                    lat: startLoc.lat,
                    lng: startLoc.lng,
                    intensity: Math.random() * 5 + 1, // Random intensity for visualization
                    time: journey.tripData?.timestamp ? new Date(journey.tripData.timestamp).getHours() : 8,
                    trips: 1,
                    type: 'origin',
                    area: startLoc.address || 'Unknown',
                    occupation: journey.occupation || 'Unknown',
                    transport_mode: journey.tripData?.transportMode || 'Unknown'
                });
                processedPoints++;
            } else {
                skippedPoints++;
            }

            // Add end location (FIX: Use lat/lng instead of latitude/longitude)
            const endLoc = journey.tripData?.endLocation;
            
            if (index < 3) {
                console.log(`🗺️ DEBUG Geospatial Journey ${index + 1} end:`, {
                    endLoc,
                    hasLat: !!endLoc?.lat,
                    hasLng: !!endLoc?.lng,
                    lat: endLoc?.lat,
                    lng: endLoc?.lng,
                    address: endLoc?.address
                });
            }
            
            if (endLoc && endLoc.lat && endLoc.lng) {
                heatmapPoints.push({
                    id: id++,
                    lat: endLoc.lat,
                    lng: endLoc.lng,
                    intensity: Math.random() * 5 + 1,
                    time: journey.tripData?.timestamp ? new Date(journey.tripData.timestamp).getHours() + 1 : 18,
                    trips: 1,
                    type: 'destination',
                    area: endLoc.address || 'Unknown',
                    occupation: journey.occupation || 'Unknown',
                    transport_mode: journey.tripData?.transportMode || 'Unknown'
                });
                processedPoints++;
            } else {
                skippedPoints++;
            }
        });

        console.log('🗺️ DEBUG Geospatial Heatmap: Points processed:', processedPoints);
        console.log('🗺️ DEBUG Geospatial Heatmap: Points skipped:', skippedPoints);
        console.log('🗺️ DEBUG Geospatial Heatmap: Total heatmap points before aggregation:', heatmapPoints.length);

        // Aggregate points by location to avoid duplicates and create density
        const aggregatedPoints = {};
        heatmapPoints.forEach(point => {
            const key = `${point.lat.toFixed(4)}_${point.lng.toFixed(4)}`;
            if (aggregatedPoints[key]) {
                aggregatedPoints[key].intensity += point.intensity;
                aggregatedPoints[key].trips += point.trips;
                aggregatedPoints[key].users = (aggregatedPoints[key].users || 1) + 1;
            } else {
                aggregatedPoints[key] = { ...point, users: 1 };
            }
        });

        return Object.values(aggregatedPoints);
        
    } catch (error) {
        console.error('Error generating heatmap data:', error);
        return [];
    }
};

// Generate OD flow data from journey data  
const generateODData = async () => {
    try {
        const response = await fetchJourneyData();
        const journeys = response.data || [];
        
        console.log('📊 DEBUG Geospatial OD: Total journeys for OD data:', journeys.length);
        
        const odFlows = [];
        let id = 0;
        let validODPairs = 0;
        let invalidODPairs = 0;

        journeys.forEach((journey, index) => {
            const startLoc = journey.tripData?.startLocation;
            const endLoc = journey.tripData?.endLocation;
            
            if (index < 3) {
                console.log(`📊 DEBUG Geospatial OD Journey ${index + 1}:`, {
                    startLoc: {
                        lat: startLoc?.lat,
                        lng: startLoc?.lng,
                        latitude: startLoc?.latitude,
                        longitude: startLoc?.longitude,
                        address: startLoc?.address
                    },
                    endLoc: {
                        lat: endLoc?.lat,
                        lng: endLoc?.lng,
                        latitude: endLoc?.latitude,
                        longitude: endLoc?.longitude,
                        address: endLoc?.address
                    }
                });
            }
            
            // FIX: Use lat/lng instead of latitude/longitude
            if (startLoc && endLoc && startLoc.lat && startLoc.lng && 
                endLoc.lat && endLoc.lng) {
                odFlows.push({
                    id: id++,
                    origin: [startLoc.lat, startLoc.lng],
                    destination: [endLoc.lat, endLoc.lng],
                    trips: 1,
                    time: journey.tripData?.timestamp ? new Date(journey.tripData.timestamp).getHours() : 9,
                    duration: journey.tripData?.duration || 30,
                    mode: journey.tripData?.transportMode || 'Unknown',
                    purpose: journey.tripData?.journeyPurpose || 'Other',
                    user_age: journey.age || 25,
                    user_occupation: journey.occupation || 'Unknown',
                    income_bracket: journey.income || 'Middle Class',
                    origin_area: startLoc.address || 'Unknown',
                    dest_area: endLoc.address || 'Unknown'
                });
                validODPairs++;
            } else {
                invalidODPairs++;
            }
        });

        console.log('📊 DEBUG Geospatial OD: Valid OD pairs:', validODPairs);
        console.log('📊 DEBUG Geospatial OD: Invalid OD pairs:', invalidODPairs);
        console.log('📊 DEBUG Geospatial OD: Total OD flows before aggregation:', odFlows.length);

        // Aggregate similar OD pairs
        const aggregatedOD = {};
        odFlows.forEach(flow => {
            const key = `${flow.origin[0].toFixed(4)}_${flow.origin[1].toFixed(4)}_${flow.destination[0].toFixed(4)}_${flow.destination[1].toFixed(4)}_${flow.time}`;
            if (aggregatedOD[key]) {
                aggregatedOD[key].trips += flow.trips;
                aggregatedOD[key].users = (aggregatedOD[key].users || 1) + 1;
            } else {
                aggregatedOD[key] = { ...flow, users: 1 };
            }
        });

        const result = Object.values(aggregatedOD).filter(flow => flow.trips > 0);
        console.log('📊 DEBUG Geospatial OD: Final aggregated OD flows:', result.length);
        
        return result;
        
    } catch (error) {
        console.error('Error generating OD data:', error);
        return [];
    }
};

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
                        iconAnchor: [getIntensitySize(point.intensity)/2, getIntensitySize(point.intensity)/2]
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
                                    <p><span className="font-medium">Transport:</span> <Badge style={{backgroundColor: getModeColor(arrow.mode)}}>{arrow.mode}</Badge></p>
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

// Data processing and analytics functions
const getDemographicInsights = async () => {
    try {
        const response = await fetchJourneyData();
        const journeys = response.data || [];
        
        console.log('📈 DEBUG Geospatial Demographics: Total journeys fetched:', journeys.length);
        console.log('📈 DEBUG Geospatial Demographics: Sample journey for user ID check:', {
            userId: journeys[0]?.userId,
            _id: journeys[0]?._id,
            email: journeys[0]?.email
        });
        
        const totalUsers = new Set(journeys.map(j => j.userId)).size;
        const totalTrips = journeys.length;
        
        console.log('📈 DEBUG Geospatial Demographics: Total unique users:', totalUsers);
        console.log('📈 DEBUG Geospatial Demographics: Total trips:', totalTrips);
        
        // Age distribution
        const ageGroups = { young: 0, middle: 0, senior: 0 };
        journeys.forEach(journey => {
            const age = journey.age || 25;
            if (age < 30) ageGroups.young++;
            else if (age < 50) ageGroups.middle++;
            else ageGroups.senior++;
        });
        
        // Income distribution
        const incomeDistribution = { low: 0, middle: 0, high: 0 };
        journeys.forEach(journey => {
            const income = journey.income || 'middle';
            incomeDistribution[income.toLowerCase()] = (incomeDistribution[income.toLowerCase()] || 0) + 1;
        });
        
        // Transport preference distribution
        const transportPreferences = {};
        journeys.forEach(journey => {
            const mode = journey.tripData?.transportMode || 'Unknown';
            transportPreferences[mode] = (transportPreferences[mode] || 0) + 1;
        });
        
        // Most common routes
        const routeFrequency = {};
        journeys.forEach(journey => {
            const startAddr = journey.tripData?.startLocation?.address;
            const endAddr = journey.tripData?.endLocation?.address;
            if (startAddr && endAddr) {
                const route = `${startAddr} → ${endAddr}`;
                routeFrequency[route] = (routeFrequency[route] || 0) + 1;
            }
        });
        
        const topRoutes = Object.entries(routeFrequency)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 5);
        
        const result = {
            totalUsers,
            totalTrips,
            ageGroups,
            incomeDistribution,
            transportPreferences,
            topRoutes
        };
        
        console.log('📈 DEBUG Geospatial Demographics: Final result:', result);
        
        return result;
    } catch (error) {
        console.error('Error getting demographic insights:', error);
        return {
            totalUsers: 0,
            totalTrips: 0,
            ageGroups: { young: 0, middle: 0, senior: 0 },
            incomeDistribution: { low: 0, middle: 0, high: 0 },
            transportPreferences: {},
            topRoutes: []
        };
    }
};

const Geospatial = () => {
    const [layers, setLayers] = useState({
        heatmap: true,
        odArrows: false,
        hexbin: false
    });
    const [timeFilter, setTimeFilter] = useState([0, 24]);
    const [mapStyle, setMapStyle] = useState('default'); // 'default' or 'satellite'
    
    // State for async data
    const [heatmapData, setHeatmapData] = useState([]);
    const [odData, setOdData] = useState([]);
    const [demographicData, setDemographicData] = useState({
        totalUsers: 0,
        totalTrips: 0,
        ageGroups: { young: 0, middle: 0, senior: 0 },
        incomeDistribution: { low: 0, middle: 0, high: 0 },
        transportPreferences: {},
        topRoutes: []
    });
    const [loading, setLoading] = useState(true);

    // Load data on component mount
    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            try {
                const [heatmap, od, demographics] = await Promise.all([
                    generateHeatmapData(),
                    generateODData(),
                    getDemographicInsights()
                ]);
                
                setHeatmapData(heatmap);
                setOdData(od);
                setDemographicData(demographics);
            } catch (error) {
                console.error('Error loading geospatial data:', error);
            } finally {
                setLoading(false);
            }
        };
        
        loadData();
    }, []);

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
        <div className="h-screen relative overflow-hidden bg-gray-50">
            {loading && (
                <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-50">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                        <p className="mt-4 text-gray-600">Loading Kerala journey data...</p>
                    </div>
                </div>
            )}
            
            {/* Header */}
            <div className="absolute top-0 left-0 right-0 z-10 bg-white shadow-sm border-b">
                <div className="px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                                    <Globe className="w-6 h-6 mr-2 text-blue-600" />
                                    Geospatial Analysis
                                </h1>
                                <p className="text-gray-600 text-sm mt-1">
                                    Interactive mapping and spatial analysis of transportation patterns
                                </p>
                            </div>
                            
                            {/* Quick Stats */}
                            <div className="hidden lg:flex items-center space-x-6 ml-8">
                                <div className="text-center">
                                    <div className="text-lg font-bold text-blue-600">{activeTrips.toLocaleString()}</div>
                                    <div className="text-xs text-gray-500">Active Trips</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-lg font-bold text-green-600">{hotZones}</div>
                                    <div className="text-xs text-gray-500">Hot Zones</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-lg font-bold text-orange-600">{peakTime}:00</div>
                                    <div className="text-xs text-gray-500">Peak Hour</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-lg font-bold text-purple-600">{demographicData.totalUsers}</div>
                                    <div className="text-xs text-gray-500">Total Users</div>
                                </div>
                            </div>
                        </div>

                        {/* Controls */}
                        <div className="flex items-center space-x-3">
                            <Button 
                                variant={layers.heatmap ? "default" : "outline"}
                                size="sm"
                                onClick={() => toggleLayer('heatmap')}
                            >
                                <Activity className="w-4 h-4 mr-1" />
                                Heatmap
                            </Button>
                            <Button 
                                variant={layers.odArrows ? "default" : "outline"}
                                size="sm"
                                onClick={() => toggleLayer('odArrows')}
                            >
                                <Route className="w-4 h-4 mr-1" />
                                OD Flows
                            </Button>
                            <Button 
                                variant={mapStyle === 'satellite' ? "default" : "outline"}
                                size="sm"
                                onClick={() => setMapStyle(mapStyle === 'satellite' ? 'default' : 'satellite')}
                            >
                                <Satellite className="w-4 h-4 mr-1" />
                                {mapStyle === 'satellite' ? 'Street' : 'Satellite'}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Time Filter */}
            <div className="absolute top-24 left-0 right-0 z-10 bg-white shadow-sm border-b">
                <div className="px-6 py-3">
                    <div className="flex items-center space-x-4">
                        <span className="text-sm font-medium text-gray-600">Time Filter:</span>
                        <div className="flex items-center space-x-2">
                            <input
                                type="range"
                                min="0"
                                max="23"
                                value={timeFilter[0]}
                                onChange={(e) => setTimeFilter([parseInt(e.target.value), timeFilter[1]])}
                                className="w-32"
                            />
                            <span className="text-sm text-gray-600">
                                {timeFilter[0]}:00 - {timeFilter[1]}:00
                            </span>
                            <input
                                type="range"
                                min="0"
                                max="23"
                                value={timeFilter[1]}
                                onChange={(e) => setTimeFilter([timeFilter[0], parseInt(e.target.value)])}
                                className="w-32"
                            />
                        </div>
                        <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => setTimeFilter([0, 24])}
                        >
                            All Day
                        </Button>
                    </div>
                </div>
            </div>

            {/* Map Container */}
            <div className="absolute top-32 left-0 right-0 bottom-0 z-0">
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