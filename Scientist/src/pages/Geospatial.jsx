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
import usersData from '../data/usersData.json';

// Fix for default markers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Generate realistic heatmap data from user data
const generateHeatmapData = () => {
    const heatmapPoints = [];
    let id = 0;

    usersData.users.forEach(user => {
        // Add home location as a hotspot
        heatmapPoints.push({
            id: id++,
            lat: user.home_location.lat,
            lng: user.home_location.lng,
            intensity: user.weekly_pattern.monday + user.weekly_pattern.tuesday + 
                      user.weekly_pattern.wednesday + user.weekly_pattern.thursday + 
                      user.weekly_pattern.friday,
            time: 8, // Morning peak
            trips: user.weekly_pattern.monday + user.weekly_pattern.tuesday + 
                   user.weekly_pattern.wednesday + user.weekly_pattern.thursday + 
                   user.weekly_pattern.friday,
            type: 'residential',
            area: user.home_location.area,
            occupation: user.occupation,
            transport_mode: user.transport_preference[0]
        });

        // Add work location as a hotspot
        heatmapPoints.push({
            id: id++,
            lat: user.work_location.lat,
            lng: user.work_location.lng,
            intensity: user.weekly_pattern.monday + user.weekly_pattern.tuesday + 
                      user.weekly_pattern.wednesday + user.weekly_pattern.thursday + 
                      user.weekly_pattern.friday,
            time: 9, // Work start time
            trips: user.weekly_pattern.monday + user.weekly_pattern.tuesday + 
                   user.weekly_pattern.wednesday + user.weekly_pattern.thursday + 
                   user.weekly_pattern.friday,
            type: 'commercial',
            area: user.work_location.area,
            occupation: user.occupation,
            transport_mode: user.transport_preference[0]
        });

        // Add common destinations
        user.common_destinations.forEach(dest => {
            heatmapPoints.push({
                id: id++,
                lat: dest.lat,
                lng: dest.lng,
                intensity: dest.frequency * 5,
                time: dest.purpose === 'shopping' ? 14 : 
                      dest.purpose === 'entertainment' ? 20 : 
                      dest.purpose === 'business' ? 11 : 16,
                trips: dest.frequency,
                type: dest.purpose,
                area: dest.area,
                occupation: user.occupation,
                transport_mode: user.transport_preference[0]
            });
        });
    });

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
};

const generateODData = () => {
    const odFlows = [];
    let id = 0;

    usersData.users.forEach(user => {
        // Add daily commute trips
        user.daily_trips.forEach(trip => {
            odFlows.push({
                id: id++,
                origin: trip.origin,
                destination: trip.destination,
                trips: user.weekly_pattern.monday + user.weekly_pattern.tuesday + 
                       user.weekly_pattern.wednesday + user.weekly_pattern.thursday + 
                       user.weekly_pattern.friday,
                time: trip.time,
                duration: trip.duration,
                mode: trip.mode,
                purpose: trip.purpose,
                user_age: user.age,
                user_occupation: user.occupation,
                income_bracket: user.income_bracket,
                origin_area: user.home_location.area,
                dest_area: user.work_location.area
            });
        });

        // Add trips to common destinations
        user.common_destinations.forEach(dest => {
            odFlows.push({
                id: id++,
                origin: [user.home_location.lat, user.home_location.lng],
                destination: [dest.lat, dest.lng],
                trips: dest.frequency,
                time: dest.purpose === 'shopping' ? 14 : 
                      dest.purpose === 'entertainment' ? 20 : 16,
                duration: 30,
                mode: user.transport_preference[0],
                purpose: dest.purpose,
                user_age: user.age,
                user_occupation: user.occupation,
                income_bracket: user.income_bracket,
                origin_area: user.home_location.area,
                dest_area: dest.area
            });
        });
    });

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

    return Object.values(aggregatedOD).filter(flow => flow.trips > 2);
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
const getDemographicInsights = () => {
    const totalUsers = usersData.users.length;
    
    // Age distribution
    const ageGroups = { young: 0, middle: 0, senior: 0 };
    usersData.users.forEach(user => {
        if (user.age < 30) ageGroups.young++;
        else if (user.age < 50) ageGroups.middle++;
        else ageGroups.senior++;
    });
    
    // Income distribution
    const incomeDistribution = { low: 0, middle: 0, high: 0 };
    usersData.users.forEach(user => {
        incomeDistribution[user.income_bracket]++;
    });
    
    // Transport preference distribution
    const transportPreferences = {};
    usersData.users.forEach(user => {
        user.transport_preference.forEach(mode => {
            transportPreferences[mode] = (transportPreferences[mode] || 0) + 1;
        });
    });
    
    // Most common routes
    const routeFrequency = {};
    usersData.users.forEach(user => {
        const route = `${user.home_location.area} → ${user.work_location.area}`;
        routeFrequency[route] = (routeFrequency[route] || 0) + 1;
    });
    
    const topRoutes = Object.entries(routeFrequency)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5);
    
    return {
        totalUsers,
        ageGroups,
        incomeDistribution,
        transportPreferences,
        topRoutes
    };
};

const Geospatial = () => {
    const [layers, setLayers] = useState({
        heatmap: true,
        odArrows: false,
        hexbin: false
    });
    const [timeFilter, setTimeFilter] = useState([0, 24]);
    const [mapStyle, setMapStyle] = useState('default'); // 'default' or 'satellite'

    const heatmapData = generateHeatmapData();
    const odData = generateODData();
    const demographicData = getDemographicInsights();

    // Calculate real-time statistics
    const filteredHeatmapData = heatmapData.filter(point => 
        point.time >= timeFilter[0] && point.time <= timeFilter[1]
    );
    const filteredODData = odData.filter(flow => 
        flow.time >= timeFilter[0] && flow.time <= timeFilter[1]
    );
    
    const activeTrips = filteredODData.reduce((sum, flow) => sum + flow.trips, 0);
    const hotZones = filteredHeatmapData.filter(point => point.intensity > 15).length;
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
                    center={[28.6139, 77.2090]}
                    zoom={11}
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