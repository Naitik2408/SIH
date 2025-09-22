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

    return Object.values(aggregatedOD).filter(flow => flow.trips > 2); // Filter out low-frequency trips
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

const HexbinLayer = ({ data, timeFilter, visible }) => {
    if (!visible) return null;

    // Create hexagonal binning from user data
    const hexSize = 0.02; // Degrees
    const hexData = [];
    const hexMap = {};

    // Filter data by time
    const filteredData = data.filter(point => point.time >= timeFilter[0] && point.time <= timeFilter[1]);

    // Bin data into hexagons
    filteredData.forEach(point => {
        const hexLat = Math.floor(point.lat / hexSize) * hexSize + hexSize/2;
        const hexLng = Math.floor(point.lng / hexSize) * hexSize + hexSize/2;
        const key = `${hexLat.toFixed(4)}_${hexLng.toFixed(4)}`;

        if (!hexMap[key]) {
            hexMap[key] = {
                lat: hexLat,
                lng: hexLng,
                count: 0,
                totalIntensity: 0,
                transportModes: {},
                purposes: {},
                incomeDistribution: {},
                ageGroups: { young: 0, middle: 0, senior: 0 },
                users: []
            };
        }

        hexMap[key].count += 1;
        hexMap[key].totalIntensity += point.intensity || point.trips;
        
        // Track transport modes
        if (point.transport_mode) {
            hexMap[key].transportModes[point.transport_mode] = 
                (hexMap[key].transportModes[point.transport_mode] || 0) + 1;
        }
        
        // Track purposes
        if (point.type) {
            hexMap[key].purposes[point.type] = 
                (hexMap[key].purposes[point.type] || 0) + 1;
        }
    });

    // Convert to array and calculate statistics
    Object.keys(hexMap).forEach(key => {
        const hex = hexMap[key];
        hex.avgIntensity = hex.totalIntensity / hex.count;
        hex.dominantTransport = Object.keys(hex.transportModes).reduce((a, b) => 
            hex.transportModes[a] > hex.transportModes[b] ? a : b, Object.keys(hex.transportModes)[0]);
        hex.dominantPurpose = Object.keys(hex.purposes).reduce((a, b) => 
            hex.purposes[a] > hex.purposes[b] ? a : b, Object.keys(hex.purposes)[0]);
        
        if (hex.count >= 3) { // Only show hexagons with significant activity
            hexData.push(hex);
        }
    });

    // Color scheme based on dominant purpose
    const getHexColor = (purpose) => {
        const colorMap = {
            'residential': '#FF6B6B',
            'commercial': '#4ECDC4',
            'shopping': '#45B7D1',
            'entertainment': '#96CEB4',
            'business': '#FFEAA7',
            'family': '#DDA0DD',
            'medical': '#FFB347'
        };
        return colorMap[purpose] || '#20B2AA';
    };

    const getHexSize = (count) => {
        return Math.max(20, Math.min(50, count * 4));
    };

    const getOpacity = (avgIntensity) => {
        return Math.max(0.5, Math.min(0.9, avgIntensity / 20));
    };

    return (
        <>
            {hexData.map((hex, index) => (
                <Marker
                    key={index}
                    position={[hex.lat, hex.lng]}
                    icon={L.divIcon({
                        className: 'hexbin-point',
                        html: `<div style="
                            width: ${getHexSize(hex.count)}px;
                            height: ${getHexSize(hex.count)}px;
                            background: ${getHexColor(hex.dominantPurpose)};
                            opacity: ${getOpacity(hex.avgIntensity)};
                            clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%);
                            border: 2px solid rgba(255, 255, 255, 0.8);
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            color: white;
                            font-weight: bold;
                            font-size: 11px;
                            box-shadow: 0 2px 6px rgba(0,0,0,0.3);
                        ">${hex.count}</div>`,
                        iconSize: [getHexSize(hex.count), getHexSize(hex.count)],
                        iconAnchor: [getHexSize(hex.count)/2, getHexSize(hex.count)/2]
                    })}
                >
                    <Popup>
                        <div className="text-sm max-w-xs">
                            <h3 className="font-semibold text-lg mb-2 text-blue-600">
                                🏘️ Area Analysis
                            </h3>
                            <div className="space-y-2">
                                <p><span className="font-medium">Total Points:</span> <span className="text-green-600 font-bold">{hex.count}</span></p>
                                <p><span className="font-medium">Avg Activity:</span> <span className="text-orange-600">{hex.avgIntensity.toFixed(1)}</span></p>
                                <p><span className="font-medium">Primary Use:</span> <Badge style={{backgroundColor: getHexColor(hex.dominantPurpose)}}>{hex.dominantPurpose}</Badge></p>
                                {hex.dominantTransport && (
                                    <p><span className="font-medium">Main Transport:</span> <Badge variant="outline">{hex.dominantTransport}</Badge></p>
                                )}
                                
                                <div className="mt-3">
                                    <p className="font-medium text-gray-600 mb-1">Activity Breakdown:</p>
                                    <div className="text-xs space-y-1">
                                        {Object.entries(hex.purposes).map(([purpose, count]) => (
                                            <div key={purpose} className="flex justify-between">
                                                <span>{purpose}:</span>
                                                <span className="font-medium">{count}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                
                                {Object.keys(hex.transportModes).length > 1 && (
                                    <div className="mt-2">
                                        <p className="font-medium text-gray-600 mb-1">Transport Mix:</p>
                                        <div className="text-xs space-y-1">
                                            {Object.entries(hex.transportModes).map(([mode, count]) => (
                                                <div key={mode} className="flex justify-between">
                                                    <span>{mode}:</span>
                                                    <span className="font-medium">{count}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </Popup>
                </Marker>
            ))}
        </>
    );
};

// Data processing and analytics functions
const getAreaStatistics = (data, selectedArea) => {
    if (!selectedArea || selectedArea.length === 0) return null;
    
    // Simple polygon point-in-polygon check (for demo purposes)
    const pointsInArea = data.filter(point => {
        // Simplified bounding box check
        const lats = selectedArea.map(p => p[0]);
        const lngs = selectedArea.map(p => p[1]);
        const minLat = Math.min(...lats);
        const maxLat = Math.max(...lats);
        const minLng = Math.min(...lngs);
        const maxLng = Math.max(...lngs);
        
        return point.lat >= minLat && point.lat <= maxLat && 
               point.lng >= minLng && point.lng <= maxLng;
    });
    
    if (pointsInArea.length === 0) return null;
    
    const totalTrips = pointsInArea.reduce((sum, p) => sum + p.trips, 0);
    const avgIntensity = pointsInArea.reduce((sum, p) => sum + p.intensity, 0) / pointsInArea.length;
    
    // Transport mode distribution
    const transportModes = {};
    pointsInArea.forEach(point => {
        if (point.transport_mode) {
            transportModes[point.transport_mode] = (transportModes[point.transport_mode] || 0) + 1;
        }
    });
    
    // Purpose distribution
    const purposes = {};
    pointsInArea.forEach(point => {
        if (point.type) {
            purposes[point.type] = (purposes[point.type] || 0) + 1;
        }
    });
    
    // Time distribution
    const timeDistribution = {};
    pointsInArea.forEach(point => {
        const hour = point.time;
        timeDistribution[hour] = (timeDistribution[hour] || 0) + 1;
    });
    
    return {
        totalPoints: pointsInArea.length,
        totalTrips,
        avgIntensity: avgIntensity.toFixed(1),
        transportModes,
        purposes,
        timeDistribution,
        peakHour: Object.keys(timeDistribution).reduce((a, b) => 
            timeDistribution[a] > timeDistribution[b] ? a : b, Object.keys(timeDistribution)[0])
    };
};

const getDemographicInsights = (data) => {
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
    const [selectedHotspot, setSelectedHotspot] = useState(null);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [selectedArea, setSelectedArea] = useState([]);
    const [drawingMode, setDrawingMode] = useState(false);
    const [showAreaPanel, setShowAreaPanel] = useState(false);
    const [areaStats, setAreaStats] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [showHelp, setShowHelp] = useState(false);
    const [mapStyle, setMapStyle] = useState('default');
    const [currentTime, setCurrentTime] = useState(9);
    const [showSettings, setShowSettings] = useState(false);
    const [viewMode, setViewMode] = useState('overview'); // overview, analysis, comparison
    const [isFullscreen, setIsFullscreen] = useState(false);

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
        ).time : currentTime;

    // Animation for time progression
    useEffect(() => {
        if (isPlaying) {
            const interval = setInterval(() => {
                setCurrentTime(prev => (prev >= 23 ? 0 : prev + 1));
                setTimeFilter(prev => [prev[0], (prev[1] >= 23 ? 0 : prev[1] + 1)]);
            }, 1000);
            return () => clearInterval(interval);
        }
    }, [isPlaying]);

    const toggleLayer = (layerName) => {
        setLayers(prev => ({
            ...prev,
            [layerName]: !prev[layerName]
        }));
    };

    const handleTimeChange = (values) => {
        setTimeFilter(values);
    };

    // Simple polygon selection for demo
    const handleMapClick = (e) => {
        if (drawingMode) {
            const newPoint = [e.latlng.lat, e.latlng.lng];
            setSelectedArea(prev => [...prev, newPoint]);
        }
    };

    const clearSelection = () => {
        setSelectedArea([]);
        setAreaStats(null);
        setShowAreaPanel(false);
    };

    const finishDrawing = () => {
        setDrawingMode(false);
        if (selectedArea.length > 2) {
            // Calculate area stats for demo
            const stats = {
                area: (Math.random() * 10).toFixed(2) + ' km²',
                trips: Math.floor(Math.random() * 500) + 100,
                avgSpeed: (Math.random() * 30 + 20).toFixed(1) + ' km/h',
                density: Math.floor(Math.random() * 100) + 50,
                peakHour: Math.floor(Math.random() * 12) + 6,
                modes: {
                    car: Math.floor(Math.random() * 50) + 30,
                    bus: Math.floor(Math.random() * 30) + 20,
                    metro: Math.floor(Math.random() * 25) + 15,
                    walk: Math.floor(Math.random() * 15) + 5
                }
            };
            setAreaStats(stats);
            setShowAreaPanel(true);
        }
    };

    const resetView = () => {
        setTimeFilter([0, 24]);
        setCurrentTime(9);
        setIsPlaying(false);
        clearSelection();
        setViewMode('overview');
    };

    const exportData = () => {
        // Simulate data export
        const data = {
            timestamp: new Date().toISOString(),
            timeRange: timeFilter,
            activeLayer: Object.keys(layers).find(key => layers[key]),
            selectedArea: selectedArea,
            stats: areaStats
        };
        console.log('Exporting data:', data);
        // In real app, this would trigger file download
    };

    return (
        <div className={`h-screen relative overflow-hidden bg-gray-50 ${isFullscreen ? 'fixed inset-0 z-50' : ''}`}>
            {/* Enhanced Header */}
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
                                    Interactive mapping and spatial analysis of transportation patterns, movement flows, and geographic hotspots
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

                        {/* Header Controls */}
                        <div className="flex items-center space-x-3">
                            {/* View Mode Selector */}
                            <div className="flex bg-gray-100 rounded-lg p-1">
                                <button
                                    onClick={() => setViewMode('overview')}
                                    className={`px-3 py-1 text-sm rounded ${viewMode === 'overview' 
                                        ? 'bg-white text-blue-600 shadow-sm' 
                                        : 'text-gray-600 hover:text-gray-800'}`}
                                >
                                    Overview
                                </button>
                                <button
                                    onClick={() => setViewMode('analysis')}
                                    className={`px-3 py-1 text-sm rounded ${viewMode === 'analysis' 
                                        ? 'bg-white text-blue-600 shadow-sm' 
                                        : 'text-gray-600 hover:text-gray-800'}`}
                                >
                                    Analysis
                                </button>
                                <button
                                    onClick={() => setViewMode('comparison')}
                                    className={`px-3 py-1 text-sm rounded ${viewMode === 'comparison' 
                                        ? 'bg-white text-blue-600 shadow-sm' 
                                        : 'text-gray-600 hover:text-gray-800'}`}
                                >
                                    Compare
                                </button>
                            </div>

                            {/* Time Display */}
                            <div className="flex items-center space-x-2 bg-gray-100 px-3 py-2 rounded-lg">
                                <Clock className="w-4 h-4 text-gray-500" />
                                <span className="text-sm font-medium text-gray-700">
                                    {timeFilter[0]}:00 - {timeFilter[1]}:00
                                </span>
                                {isPlaying && (
                                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                )}
                            </div>

                            {/* Action Buttons */}
                            <div className="flex items-center space-x-2">
                                <button
                                    onClick={() => setShowHelp(true)}
                                    className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                    title="Help & Tutorial"
                                >
                                    <HelpCircle className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => setShowSettings(true)}
                                    className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                                    title="Settings"
                                >
                                    <Settings className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={exportData}
                                    className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                    title="Export Data"
                                >
                                    <Download className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => setIsFullscreen(!isFullscreen)}
                                    className="p-2 text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                                    title="Toggle Fullscreen"
                                >
                                    <Maximize2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Map Container */}
            <div className="absolute top-24 left-0 right-0 bottom-20 z-0">
                <MapContainer
                    center={[28.6139, 77.2090]}
                    zoom={12}
                    style={{ height: '100%', width: '100%' }}
                    eventHandlers={{
                        click: handleMapClick
                    }}
                >
                    <TileLayer
                        url={mapStyle === 'satellite' 
                            ? "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                            : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        }
                        attribution={mapStyle === 'satellite'
                            ? '&copy; <a href="https://www.esri.com/">Esri</a>'
                            : '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        }
                    />

                    {/* Selection Polygon */}
                    {selectedArea.length > 0 && (
                        <Polygon
                            positions={selectedArea}
                            pathOptions={{
                                color: '#3B82F6',
                                fillColor: '#3B82F6',
                                fillOpacity: 0.1,
                                weight: 2,
                                dashArray: '5, 10'
                            }}
                        />
                    )}

                    <HeatmapLayer
                        data={heatmapData}
                        timeFilter={timeFilter}
                        visible={layers.heatmap}
                    />
                    <ODArrowsLayer
                        data={odData}
                        timeFilter={timeFilter}
                        visible={layers.odArrows}
                    />
                    <HexbinLayer
                        data={heatmapData}
                        timeFilter={timeFilter}
                        visible={layers.hexbin}
                    />
                </MapContainer>

                {/* Map Overlays */}
                {viewMode === 'analysis' && (
                    <div className="absolute top-4 right-4 bg-white rounded-lg shadow-lg p-3 max-w-xs">
                        <h4 className="font-semibold text-gray-800 mb-2 text-sm">Analysis Mode</h4>
                        <p className="text-xs text-gray-600 mb-2">
                            Click and drag to select areas for detailed analysis
                        </p>
                        <div className="flex items-center text-xs text-gray-500">
                            <Target className="w-3 h-3 mr-1" />
                            Use drawing tools to analyze specific regions
                        </div>
                    </div>
                )}
            </div>

            {/* Enhanced Layer Controls */}
            <div className="absolute top-32 left-4 z-20 bg-white rounded-lg shadow-lg overflow-hidden">
                <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
                    <h3 className="font-semibold text-gray-800 flex items-center">
                        <Layers className="w-4 h-4 mr-2 text-blue-600" />
                        Map Layers
                    </h3>
                    <p className="text-xs text-gray-600 mt-1">Toggle visualization layers</p>
                </div>
                
                <div className="p-4 space-y-3">
                    {/* Layer Toggles */}
                    <div className="space-y-3">
                        <label className="flex items-center justify-between">
                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    checked={layers.heatmap}
                                    onChange={() => toggleLayer('heatmap')}
                                    className="mr-3 w-4 h-4 text-red-600 rounded focus:ring-red-500"
                                />
                                <Activity className="w-4 h-4 mr-2 text-red-500" />
                                <div>
                                    <span className="text-sm font-medium">Trip Density</span>
                                    <div className="text-xs text-gray-500">Heat map of activity</div>
                                </div>
                            </div>
                            {layers.heatmap && <div className="w-2 h-2 bg-red-500 rounded-full"></div>}
                        </label>

                        <label className="flex items-center justify-between">
                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    checked={layers.odArrows}
                                    onChange={() => toggleLayer('odArrows')}
                                    className="mr-3 w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                                />
                                <Route className="w-4 h-4 mr-2 text-blue-500" />
                                <div>
                                    <span className="text-sm font-medium">Flow Patterns</span>
                                    <div className="text-xs text-gray-500">Origin-destination flows</div>
                                </div>
                            </div>
                            {layers.odArrows && <div className="w-2 h-2 bg-blue-500 rounded-full"></div>}
                        </label>

                        <label className="flex items-center justify-between">
                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    checked={layers.hexbin}
                                    onChange={() => toggleLayer('hexbin')}
                                    className="mr-3 w-4 h-4 text-green-600 rounded focus:ring-green-500"
                                />
                                <Square className="w-4 h-4 mr-2 text-green-500" />
                                <div>
                                    <span className="text-sm font-medium">Spatial Bins</span>
                                    <div className="text-xs text-gray-500">Hexagonal aggregation</div>
                                </div>
                            </div>
                            {layers.hexbin && <div className="w-2 h-2 bg-green-500 rounded-full"></div>}
                        </label>
                    </div>

                    <hr className="my-3" />

                    {/* Map Style */}
                    <div>
                        <h4 className="font-semibold text-gray-800 mb-2 text-sm flex items-center">
                            <MapIcon className="w-4 h-4 mr-2" />
                            Base Map
                        </h4>
                        <div className="grid grid-cols-2 gap-2">
                            <button
                                onClick={() => setMapStyle('default')}
                                className={`p-2 text-xs rounded border ${mapStyle === 'default'
                                    ? 'bg-blue-100 border-blue-300 text-blue-700'
                                    : 'border-gray-200 hover:bg-gray-50'
                                }`}
                            >
                                <Globe className="w-3 h-3 mx-auto mb-1" />
                                Street
                            </button>
                            <button
                                onClick={() => setMapStyle('satellite')}
                                className={`p-2 text-xs rounded border ${mapStyle === 'satellite'
                                    ? 'bg-blue-100 border-blue-300 text-blue-700'
                                    : 'border-gray-200 hover:bg-gray-50'
                                }`}
                            >
                                <Satellite className="w-3 h-3 mx-auto mb-1" />
                                Satellite
                            </button>
                        </div>
                    </div>

                    <hr className="my-3" />

                    {/* Selection Tools */}
                    <div>
                        <h4 className="font-semibold text-gray-800 mb-2 text-sm flex items-center">
                            <Crosshair className="w-4 h-4 mr-2" />
                            Analysis Tools
                        </h4>
                        <div className="space-y-2">
                            <button
                                onClick={() => setDrawingMode(!drawingMode)}
                                className={`flex items-center w-full p-2 rounded text-sm transition-colors ${drawingMode
                                    ? 'bg-blue-100 text-blue-700 border border-blue-300'
                                    : 'hover:bg-gray-100 border border-gray-200'
                                }`}
                            >
                                <MapPin className="w-4 h-4 mr-2" />
                                {drawingMode ? 'Stop Drawing' : 'Draw Polygon'}
                                {drawingMode && <div className="ml-auto w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>}
                            </button>

                            {selectedArea.length > 0 && (
                                <div className="space-y-1">
                                    <button
                                        onClick={finishDrawing}
                                        className="flex items-center w-full p-2 rounded text-sm bg-green-100 text-green-700 hover:bg-green-200 border border-green-300 transition-colors"
                                    >
                                        <BarChart3 className="w-4 h-4 mr-2" />
                                        Analyze Area ({selectedArea.length} points)
                                    </button>
                                    <button
                                        onClick={clearSelection}
                                        className="flex items-center w-full p-2 rounded text-sm bg-red-100 text-red-700 hover:bg-red-200 border border-red-300 transition-colors"
                                    >
                                        <X className="w-4 h-4 mr-2" />
                                        Clear Selection
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Enhanced Time Control Panel */}
            <div className="absolute bottom-0 left-0 right-0 z-10 bg-white shadow-lg border-t">
                <div className="px-6 py-4">
                    <div className="flex items-center justify-between">
                        {/* Time Controls */}
                        <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-2">
                                <button
                                    onClick={() => setIsPlaying(!isPlaying)}
                                    className={`p-2 rounded-lg transition-colors ${isPlaying 
                                        ? 'bg-red-100 text-red-600 hover:bg-red-200' 
                                        : 'bg-green-100 text-green-600 hover:bg-green-200'
                                    }`}
                                >
                                    {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                                </button>
                                <button
                                    onClick={resetView}
                                    className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                >
                                    <RotateCcw className="w-4 h-4" />
                                </button>
                            </div>

                            <div className="flex items-center space-x-3">
                                <Clock className="w-5 h-5 text-gray-500" />
                                <span className="text-sm font-medium text-gray-700 w-20">
                                    Time Range:
                                </span>
                            </div>
                        </div>

                        {/* Time Slider */}
                        <div className="flex-1 px-6 max-w-2xl">
                            <div className="relative">
                                <input
                                    type="range"
                                    min="0"
                                    max="24"
                                    value={timeFilter[0]}
                                    onChange={(e) => handleTimeChange([parseInt(e.target.value), timeFilter[1]])}
                                    className="w-full h-2 bg-gradient-to-r from-blue-200 to-blue-400 rounded-lg appearance-none cursor-pointer slider"
                                />
                                <div className="flex justify-between text-xs text-gray-500 mt-2">
                                    <span>0:00</span>
                                    <span>6:00</span>
                                    <span>12:00</span>
                                    <span>18:00</span>
                                    <span>24:00</span>
                                </div>
                                {/* Current time indicator */}
                                {isPlaying && (
                                    <div 
                                        className="absolute top-0 w-1 h-2 bg-red-500 rounded-full"
                                        style={{ left: `${(currentTime / 24) * 100}%` }}
                                    ></div>
                                )}
                            </div>
                        </div>

                        {/* Quick Actions */}
                        <div className="flex items-center space-x-4">
                            <div className="text-right">
                                <div className="text-sm font-medium text-gray-700">
                                    {timeFilter[0]}:00 - {timeFilter[1]}:00
                                </div>
                                <div className="text-xs text-gray-500">
                                    {isPlaying ? 'Live Update' : 'Static View'}
                                </div>
                            </div>

                            {/* Quick Time Presets */}
                            <div className="flex space-x-1">
                                <button
                                    onClick={() => setTimeFilter([6, 10])}
                                    className="px-2 py-1 text-xs bg-orange-100 text-orange-700 rounded hover:bg-orange-200 transition-colors"
                                >
                                    Morning
                                </button>
                                <button
                                    onClick={() => setTimeFilter([17, 20])}
                                    className="px-2 py-1 text-xs bg-purple-100 text-purple-700 rounded hover:bg-purple-200 transition-colors"
                                >
                                    Evening
                                </button>
                                <button
                                    onClick={() => setTimeFilter([0, 24])}
                                    className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
                                >
                                    All Day
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Enhanced Right Sidebar */}
            {sidebarOpen && (
                <div className="absolute top-24 right-4 bottom-20 z-20 w-96 bg-white rounded-lg shadow-xl overflow-hidden">
                    <div className="h-full flex flex-col">
                        {/* Sidebar Header */}
                        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
                            <h2 className="text-lg font-semibold text-gray-800 flex items-center">
                                <BarChart3 className="w-5 h-5 mr-2 text-blue-600" />
                                Spatial Analytics
                            </h2>
                            <button
                                onClick={() => setSidebarOpen(false)}
                                className="p-1 hover:bg-white hover:bg-opacity-50 rounded transition-colors"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Sidebar Content */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4">
                            {/* Real-time Data Insights */}
                            <div className="space-y-3">
                                <h3 className="text-sm font-semibold text-gray-700 flex items-center">
                                    <Users className="w-4 h-4 mr-2 text-blue-600" />
                                    Live Data Insights
                                </h3>
                                
                                {/* Top Routes */}
                                <div className="bg-gray-50 p-3 rounded-lg">
                                    <h4 className="text-xs font-medium text-gray-600 mb-2">Popular Routes</h4>
                                    <div className="space-y-2">
                                        {demographicData.topRoutes.slice(0, 3).map(([route, count], index) => (
                                            <div key={index} className="flex items-center justify-between">
                                                <div className="text-xs text-gray-700 flex-1 truncate">{route}</div>
                                                <Badge variant="secondary" className="text-xs">{count}</Badge>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                
                                {/* Transport Mode Distribution */}
                                <div className="bg-gray-50 p-3 rounded-lg">
                                    <h4 className="text-xs font-medium text-gray-600 mb-2">Transport Preferences</h4>
                                    <div className="space-y-2">
                                        {Object.entries(demographicData.transportPreferences)
                                            .sort(([,a], [,b]) => b - a)
                                            .slice(0, 4)
                                            .map(([mode, count]) => (
                                            <div key={mode} className="flex items-center justify-between">
                                                <div className="flex items-center">
                                                    {mode === 'metro' && <Train className="w-3 h-3 mr-1 text-blue-500" />}
                                                    {mode === 'bus' && <Bus className="w-3 h-3 mr-1 text-green-500" />}
                                                    {mode === 'car' && <Car className="w-3 h-3 mr-1 text-red-500" />}
                                                    <span className="text-xs text-gray-700 capitalize">{mode}</span>
                                                </div>
                                                <Badge variant="outline" className="text-xs">{count}</Badge>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                
                                {/* Demographics Summary */}
                                <div className="bg-gray-50 p-3 rounded-lg">
                                    <h4 className="text-xs font-medium text-gray-600 mb-2">User Demographics</h4>
                                    <div className="grid grid-cols-3 gap-2 text-center">
                                        <div>
                                            <div className="text-sm font-bold text-blue-600">{demographicData.ageGroups.young}</div>
                                            <div className="text-xs text-gray-500">Young</div>
                                        </div>
                                        <div>
                                            <div className="text-sm font-bold text-green-600">{demographicData.ageGroups.middle}</div>
                                            <div className="text-xs text-gray-500">Middle</div>
                                        </div>
                                        <div>
                                            <div className="text-sm font-bold text-orange-600">{demographicData.ageGroups.senior}</div>
                                            <div className="text-xs text-gray-500">Senior</div>
                                        </div>
                                    </div>
                                </div>
                                
                                {/* Income Distribution */}
                                <div className="bg-gray-50 p-3 rounded-lg">
                                    <h4 className="text-xs font-medium text-gray-600 mb-2">Income Distribution</h4>
                                    <div className="space-y-1">
                                        <div className="flex justify-between items-center">
                                            <span className="text-xs text-gray-600">Low Income</span>
                                            <Badge variant="outline">{demographicData.incomeDistribution.low}</Badge>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-xs text-gray-600">Middle Income</span>
                                            <Badge variant="outline">{demographicData.incomeDistribution.middle}</Badge>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-xs text-gray-600">High Income</span>
                                            <Badge variant="outline">{demographicData.incomeDistribution.high}</Badge>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            {/* Key Metrics */}
                            <div className="grid grid-cols-2 gap-3">
                                <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
                                    <div className="flex items-center mb-1">
                                        <TrendingUp className="w-4 h-4 text-blue-600 mr-1" />
                                        <span className="text-xs text-blue-600 font-medium">Active Trips</span>
                                    </div>
                                    <div className="text-lg font-bold text-blue-800">{activeTrips.toLocaleString()}</div>
                                    <div className="text-xs text-blue-600">Currently filtered</div>
                                </div>
                                <div className="bg-green-50 p-3 rounded-lg border border-green-100">
                                    <div className="flex items-center mb-1">
                                        <AlertTriangle className="w-4 h-4 text-green-600 mr-1" />
                                        <span className="text-xs text-green-600 font-medium">Hot Zones</span>
                                    </div>
                                    <div className="text-lg font-bold text-green-800">{hotZones}</div>
                                    <div className="text-xs text-green-600">High activity areas</div>
                                </div>
                                <div className="bg-orange-50 p-3 rounded-lg border border-orange-100">
                                    <div className="flex items-center mb-1">
                                        <Clock className="w-4 h-4 text-orange-600 mr-1" />
                                        <span className="text-xs text-orange-600 font-medium">Peak Hour</span>
                                    </div>
                                    <div className="text-lg font-bold text-orange-800">{peakTime}:00</div>
                                    <div className="text-xs text-orange-600">Busiest time</div>
                                </div>
                                <div className="bg-purple-50 p-3 rounded-lg border border-purple-100">
                                    <div className="flex items-center mb-1">
                                        <Users className="w-4 h-4 text-purple-600 mr-1" />
                                        <span className="text-xs text-purple-600 font-medium">Total Users</span>
                                    </div>
                                    <div className="text-lg font-bold text-purple-800">{demographicData.totalUsers}</div>
                                    <div className="text-xs text-purple-600">In dataset</div>
                                </div>
                            </div>
                                    <div className="text-lg font-bold text-orange-800">8:30 AM</div>
                                    <div className="text-xs text-orange-600">Morning rush</div>
                                </div>
                                <div className="bg-purple-50 p-3 rounded-lg border border-purple-100">
                                    <div className="flex items-center mb-1">
                                        <Users className="w-4 h-4 text-purple-600 mr-1" />
                                        <span className="text-xs text-purple-600 font-medium">Avg Duration</span>
                                    </div>
                                    <div className="text-lg font-bold text-purple-800">23 min</div>
                                    <div className="text-xs text-purple-600">-2 min vs avg</div>
                                </div>
                            </div>

                            {/* Mode Distribution */}
                            <div className="bg-gray-50 p-4 rounded-lg border">
                                <h3 className="font-medium text-gray-800 mb-3 flex items-center">
                                    <PieChart className="w-4 h-4 mr-2 text-gray-600" />
                                    Transportation Mode Split
                                </h3>
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center">
                                            <Car className="w-4 h-4 mr-2 text-blue-500" />
                                            <span className="text-sm">Private Car</span>
                                        </div>
                                        <div className="flex items-center">
                                            <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                                                <div className="bg-blue-500 h-2 rounded-full" style={{width: '45%'}}></div>
                                            </div>
                                            <span className="text-sm font-medium">45%</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center">
                                            <Bus className="w-4 h-4 mr-2 text-green-500" />
                                            <span className="text-sm">Public Bus</span>
                                        </div>
                                        <div className="flex items-center">
                                            <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                                                <div className="bg-green-500 h-2 rounded-full" style={{width: '25%'}}></div>
                                            </div>
                                            <span className="text-sm font-medium">25%</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center">
                                            <Train className="w-4 h-4 mr-2 text-purple-500" />
                                            <span className="text-sm">Metro Rail</span>
                                        </div>
                                        <div className="flex items-center">
                                            <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                                                <div className="bg-purple-500 h-2 rounded-full" style={{width: '20%'}}></div>
                                            </div>
                                            <span className="text-sm font-medium">20%</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center">
                                            <Users className="w-4 h-4 mr-2 text-orange-500" />
                                            <span className="text-sm">Walking</span>
                                        </div>
                                        <div className="flex items-center">
                                            <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                                                <div className="bg-orange-500 h-2 rounded-full" style={{width: '10%'}}></div>
                                            </div>
                                            <span className="text-sm font-medium">10%</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Popular Corridors */}
                            <div className="bg-gray-50 p-4 rounded-lg border">
                                <h3 className="font-medium text-gray-800 mb-3 flex items-center">
                                    <Route className="w-4 h-4 mr-2 text-gray-600" />
                                    Top Travel Corridors
                                </h3>
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center p-2 bg-white rounded border">
                                        <div>
                                            <div className="text-sm font-medium">Connaught Place → Gurgaon</div>
                                            <div className="text-xs text-gray-500">Business District Route</div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-sm font-bold text-blue-600">234</div>
                                            <div className="text-xs text-gray-500">trips</div>
                                        </div>
                                    </div>
                                    <div className="flex justify-between items-center p-2 bg-white rounded border">
                                        <div>
                                            <div className="text-sm font-medium">Dwarka → Central Delhi</div>
                                            <div className="text-xs text-gray-500">Residential Commute</div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-sm font-bold text-green-600">189</div>
                                            <div className="text-xs text-gray-500">trips</div>
                                        </div>
                                    </div>
                                    <div className="flex justify-between items-center p-2 bg-white rounded border">
                                        <div>
                                            <div className="text-sm font-medium">Noida → Delhi CBD</div>
                                            <div className="text-xs text-gray-500">Cross-border Travel</div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-sm font-bold text-purple-600">156</div>
                                            <div className="text-xs text-gray-500">trips</div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Hotspot Insights */}
                            <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
                                <h3 className="font-medium text-amber-800 mb-2 flex items-center">
                                    <Target className="w-4 h-4 mr-2" />
                                    Spatial Insights
                                </h3>
                                <div className="space-y-2 text-sm text-amber-700">
                                    <div className="flex items-start">
                                        <CheckCircle className="w-4 h-4 mr-2 mt-0.5 text-green-600" />
                                        <span>Central business district shows highest density during work hours</span>
                                    </div>
                                    <div className="flex items-start">
                                        <AlertTriangle className="w-4 h-4 mr-2 mt-0.5 text-orange-600" />
                                        <span>Significant congestion detected on NH-8 corridor</span>
                                    </div>
                                    <div className="flex items-start">
                                        <Info className="w-4 h-4 mr-2 mt-0.5 text-blue-600" />
                                        <span>Metro stations act as major trip attractors and generators</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Enhanced Area Analysis Panel */}
            {showAreaPanel && areaStats && (
                <div className="absolute top-24 right-4 z-30 w-96 bg-white rounded-lg shadow-xl border">
                    <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 border-b">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-semibold text-gray-800 flex items-center">
                                <Target className="w-5 h-5 mr-2 text-green-600" />
                                Selected Area Analysis
                            </h2>
                            <button
                                onClick={() => setShowAreaPanel(false)}
                                className="p-1 hover:bg-white hover:bg-opacity-50 rounded transition-colors"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">Detailed spatial analysis of selected region</p>
                    </div>

                    <div className="p-4 space-y-4 max-h-96 overflow-y-auto">
                        {/* Area Overview */}
                        <div className="grid grid-cols-2 gap-3">
                            <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                                <div className="flex items-center mb-1">
                                    <Square className="w-4 h-4 text-blue-600 mr-1" />
                                    <span className="text-xs text-blue-600 font-medium">Area Size</span>
                                </div>
                                <div className="text-lg font-bold text-blue-800">{areaStats.area}</div>
                            </div>
                            <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                                <div className="flex items-center mb-1">
                                    <Navigation className="w-4 h-4 text-green-600 mr-1" />
                                    <span className="text-xs text-green-600 font-medium">Total Trips</span>
                                </div>
                                <div className="text-lg font-bold text-green-800">{areaStats.trips}</div>
                            </div>
                            <div className="bg-orange-50 p-3 rounded-lg border border-orange-200">
                                <div className="flex items-center mb-1">
                                    <TrendingUp className="w-4 h-4 text-orange-600 mr-1" />
                                    <span className="text-xs text-orange-600 font-medium">Avg Speed</span>
                                </div>
                                <div className="text-lg font-bold text-orange-800">{areaStats.avgSpeed}</div>
                            </div>
                            <div className="bg-purple-50 p-3 rounded-lg border border-purple-200">
                                <div className="flex items-center mb-1">
                                    <Activity className="w-4 h-4 text-purple-600 mr-1" />
                                    <span className="text-xs text-purple-600 font-medium">Density</span>
                                </div>
                                <div className="text-lg font-bold text-purple-800">{areaStats.density}/km²</div>
                            </div>
                        </div>

                        {/* Modal Split in Selected Area */}
                        <div className="bg-gray-50 p-4 rounded-lg border">
                            <h3 className="font-medium text-gray-800 mb-3 flex items-center">
                                <PieChart className="w-4 h-4 mr-2" />
                                Transportation Mode Distribution
                            </h3>
                            <div className="space-y-2">
                                {Object.entries(areaStats.modes).map(([mode, percentage]) => (
                                    <div key={mode} className="flex items-center justify-between">
                                        <div className="flex items-center">
                                            {mode === 'car' && <Car className="w-4 h-4 mr-2 text-blue-500" />}
                                            {mode === 'bus' && <Bus className="w-4 h-4 mr-2 text-green-500" />}
                                            {mode === 'metro' && <Train className="w-4 h-4 mr-2 text-purple-500" />}
                                            {mode === 'walk' && <Users className="w-4 h-4 mr-2 text-orange-500" />}
                                            <span className="text-sm capitalize">{mode}</span>
                                        </div>
                                        <div className="flex items-center">
                                            <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                                                <div 
                                                    className={`h-2 rounded-full ${
                                                        mode === 'car' ? 'bg-blue-500' :
                                                        mode === 'bus' ? 'bg-green-500' :
                                                        mode === 'metro' ? 'bg-purple-500' : 'bg-orange-500'
                                                    }`}
                                                    style={{width: `${percentage}%`}}
                                                ></div>
                                            </div>
                                            <span className="text-sm font-medium">{percentage}%</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Time Analysis */}
                        <div className="bg-gray-50 p-4 rounded-lg border">
                            <h3 className="font-medium text-gray-800 mb-3 flex items-center">
                                <Clock className="w-4 h-4 mr-2" />
                                Temporal Patterns
                            </h3>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-600">Peak Hour:</span>
                                    <span className="font-bold text-orange-600">{areaStats.peakHour}:00</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Morning Rush (6-10 AM):</span>
                                    <span className="font-medium">35%</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Evening Rush (5-8 PM):</span>
                                    <span className="font-medium">28%</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Off-peak Hours:</span>
                                    <span className="font-medium">37%</span>
                                </div>
                            </div>
                        </div>

                        {/* Insights */}
                        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                            <h3 className="font-medium text-blue-800 mb-2 flex items-center">
                                <Info className="w-4 h-4 mr-2" />
                                Key Insights
                            </h3>
                            <div className="space-y-2 text-sm text-blue-700">
                                <div className="flex items-start">
                                    <CheckCircle className="w-4 h-4 mr-2 mt-0.5 text-green-600" />
                                    <span>High activity area with significant trip generation</span>
                                </div>
                                <div className="flex items-start">
                                    <AlertTriangle className="w-4 h-4 mr-2 mt-0.5 text-orange-600" />
                                    <span>Peak hour congestion observed at {areaStats.peakHour}:00</span>
                                </div>
                                <div className="flex items-start">
                                    <TrendingUp className="w-4 h-4 mr-2 mt-0.5 text-purple-600" />
                                    <span>Modal diversity suggests good transport accessibility</span>
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex space-x-2">
                            <button
                                onClick={exportData}
                                className="flex-1 flex items-center justify-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                            >
                                <Download className="w-4 h-4 mr-2" />
                                Export Analysis
                            </button>
                            <button
                                onClick={() => {/* Add comparison logic */}}
                                className="flex-1 flex items-center justify-center px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm"
                            >
                                <BarChart2 className="w-4 h-4 mr-2" />
                                Compare
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Help Modal */}
            {showHelp && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
                        <div className="p-6 border-b bg-gradient-to-r from-blue-50 to-indigo-50">
                            <div className="flex items-center justify-between">
                                <h2 className="text-xl font-bold text-gray-800 flex items-center">
                                    <HelpCircle className="w-6 h-6 mr-2 text-blue-600" />
                                    Geospatial Analysis Guide
                                </h2>
                                <button
                                    onClick={() => setShowHelp(false)}
                                    className="p-2 hover:bg-white hover:bg-opacity-50 rounded-lg transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                        
                        <div className="p-6 space-y-6">
                            {/* What is Geospatial Analysis */}
                            <div>
                                <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                                    <Globe className="w-5 h-5 mr-2 text-blue-600" />
                                    What is Geospatial Analysis?
                                </h3>
                                <p className="text-gray-600 leading-relaxed">
                                    Geospatial analysis examines the geographic patterns, spatial relationships, and movement flows 
                                    in transportation data. Unlike the Dashboard which shows high-level metrics, this module focuses 
                                    on <strong>where</strong> transportation activities occur and <strong>how</strong> they relate to geography.
                                </p>
                            </div>

                            {/* Key Features */}
                            <div>
                                <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                                    <Layers className="w-5 h-5 mr-2 text-green-600" />
                                    Key Features
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="bg-red-50 p-3 rounded-lg border border-red-200">
                                        <div className="flex items-center mb-2">
                                            <Activity className="w-4 h-4 mr-2 text-red-600" />
                                            <span className="font-medium text-red-800">Trip Density Heatmap</span>
                                        </div>
                                        <p className="text-sm text-red-700">Shows concentration of transportation activity across geographic areas</p>
                                    </div>
                                    <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                                        <div className="flex items-center mb-2">
                                            <Route className="w-4 h-4 mr-2 text-blue-600" />
                                            <span className="font-medium text-blue-800">Flow Patterns</span>
                                        </div>
                                        <p className="text-sm text-blue-700">Visualizes origin-destination flows and movement corridors</p>
                                    </div>
                                    <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                                        <div className="flex items-center mb-2">
                                            <Square className="w-4 h-4 mr-2 text-green-600" />
                                            <span className="font-medium text-green-800">Spatial Aggregation</span>
                                        </div>
                                        <p className="text-sm text-green-700">Groups data into hexagonal bins for pattern analysis</p>
                                    </div>
                                    <div className="bg-purple-50 p-3 rounded-lg border border-purple-200">
                                        <div className="flex items-center mb-2">
                                            <Target className="w-4 h-4 mr-2 text-purple-600" />
                                            <span className="font-medium text-purple-800">Area Analysis</span>
                                        </div>
                                        <p className="text-sm text-purple-700">Select custom areas for detailed spatial analysis</p>
                                    </div>
                                </div>
                            </div>

                            {/* How to Use */}
                            <div>
                                <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                                    <Settings className="w-5 h-5 mr-2 text-orange-600" />
                                    How to Use
                                </h3>
                                <div className="space-y-3">
                                    <div className="flex items-start">
                                        <div className="bg-blue-100 text-blue-800 rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium mr-3 mt-0.5">1</div>
                                        <div>
                                            <span className="font-medium">Toggle Layers:</span>
                                            <span className="text-gray-600 ml-1">Use the layer panel to show/hide different visualizations</span>
                                        </div>
                                    </div>
                                    <div className="flex items-start">
                                        <div className="bg-blue-100 text-blue-800 rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium mr-3 mt-0.5">2</div>
                                        <div>
                                            <span className="font-medium">Time Filtering:</span>
                                            <span className="text-gray-600 ml-1">Use the time slider to focus on specific time periods</span>
                                        </div>
                                    </div>
                                    <div className="flex items-start">
                                        <div className="bg-blue-100 text-blue-800 rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium mr-3 mt-0.5">3</div>
                                        <div>
                                            <span className="font-medium">Area Selection:</span>
                                            <span className="text-gray-600 ml-1">Draw polygons to analyze specific geographic regions</span>
                                        </div>
                                    </div>
                                    <div className="flex items-start">
                                        <div className="bg-blue-100 text-blue-800 rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium mr-3 mt-0.5">4</div>
                                        <div>
                                            <span className="font-medium">Animation:</span>
                                            <span className="text-gray-600 ml-1">Use play button to see temporal patterns evolve over time</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Data Insights */}
                            <div>
                                <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                                    <BarChart3 className="w-5 h-5 mr-2 text-indigo-600" />
                                    Understanding the Data
                                </h3>
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <div className="space-y-2 text-sm">
                                        <div><strong>Hot Zones:</strong> Areas with high trip density indicating popular destinations or origins</div>
                                        <div><strong>Flow Corridors:</strong> Major routes connecting different areas, showing travel demand</div>
                                        <div><strong>Temporal Patterns:</strong> How spatial patterns change throughout the day</div>
                                        <div><strong>Modal Distribution:</strong> Transportation mode preferences in different areas</div>
                                    </div>
                                </div>
                            </div>

                            {/* Tips */}
                            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                                <h4 className="font-medium text-blue-800 mb-2 flex items-center">
                                    <Info className="w-4 h-4 mr-2" />
                                    Pro Tips
                                </h4>
                                <ul className="text-sm text-blue-700 space-y-1">
                                    <li>• Combine multiple layers to see relationships between different patterns</li>
                                    <li>• Use time animation to identify peak congestion periods and routes</li>
                                    <li>• Select areas around transport hubs to analyze catchment patterns</li>
                                    <li>• Export analysis results for reports and presentations</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Settings Modal */}
            {showSettings && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl shadow-2xl max-w-md w-full mx-4">
                        <div className="p-6 border-b">
                            <div className="flex items-center justify-between">
                                <h2 className="text-xl font-bold text-gray-800 flex items-center">
                                    <Settings className="w-6 h-6 mr-2 text-gray-600" />
                                    Display Settings
                                </h2>
                                <button
                                    onClick={() => setShowSettings(false)}
                                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                        
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Map Style</label>
                                <div className="grid grid-cols-2 gap-2">
                                    <button
                                        onClick={() => setMapStyle('default')}
                                        className={`p-3 rounded-lg border text-center ${mapStyle === 'default'
                                            ? 'bg-blue-100 border-blue-300 text-blue-700'
                                            : 'border-gray-200 hover:bg-gray-50'
                                        }`}
                                    >
                                        <Globe className="w-5 h-5 mx-auto mb-1" />
                                        <div className="text-sm">Street Map</div>
                                    </button>
                                    <button
                                        onClick={() => setMapStyle('satellite')}
                                        className={`p-3 rounded-lg border text-center ${mapStyle === 'satellite'
                                            ? 'bg-blue-100 border-blue-300 text-blue-700'
                                            : 'border-gray-200 hover:bg-gray-50'
                                        }`}
                                    >
                                        <Satellite className="w-5 h-5 mx-auto mb-1" />
                                        <div className="text-sm">Satellite</div>
                                    </button>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">View Mode</label>
                                <div className="space-y-2">
                                    {['overview', 'analysis', 'comparison'].map((mode) => (
                                        <label key={mode} className="flex items-center">
                                            <input
                                                type="radio"
                                                name="viewMode"
                                                value={mode}
                                                checked={viewMode === mode}
                                                onChange={(e) => setViewMode(e.target.value)}
                                                className="mr-3"
                                            />
                                            <span className="text-sm capitalize">{mode} View</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <div className="pt-4 border-t">
                                <button
                                    onClick={resetView}
                                    className="w-full flex items-center justify-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                                >
                                    <RefreshCw className="w-4 h-4 mr-2" />
                                    Reset to Default View
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Floating Action Button */}
            <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className={`absolute top-32 right-4 z-30 p-3 rounded-full shadow-lg transition-all ${sidebarOpen 
                    ? 'bg-gray-600 text-white hover:bg-gray-700' 
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
                title={sidebarOpen ? 'Close Analytics Panel' : 'Open Analytics Panel'}
            >
                {sidebarOpen ? <X className="w-5 h-5" /> : <BarChart3 className="w-5 h-5" />}
            </button>

            {/* Quick Stats Overlay (Mobile) */}
            <div className="lg:hidden absolute top-24 left-4 right-4 z-20 bg-white rounded-lg shadow-lg p-3">
                <div className="grid grid-cols-3 gap-3 text-center">
                    <div>
                        <div className="text-lg font-bold text-blue-600">1,247</div>
                        <div className="text-xs text-gray-500">Trips</div>
                    </div>
                    <div>
                        <div className="text-lg font-bold text-green-600">12</div>
                        <div className="text-xs text-gray-500">Hot Zones</div>
                    </div>
                    <div>
                        <div className="text-lg font-bold text-orange-600">8:30</div>
                        <div className="text-xs text-gray-500">Peak</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Geospatial;
