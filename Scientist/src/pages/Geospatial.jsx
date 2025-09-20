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
    BarChart3
} from 'lucide-react';

// Fix for default markers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Sample dummy data
const generateHeatmapData = () => {
    const data = [];
    const centerLat = 28.6139; // Delhi coordinates
    const centerLng = 77.2090;

    for (let i = 0; i < 100; i++) {
        data.push({
            id: i,
            lat: centerLat + (Math.random() - 0.5) * 0.2,
            lng: centerLng + (Math.random() - 0.5) * 0.2,
            intensity: Math.random() * 100,
            time: Math.floor(Math.random() * 24),
            trips: Math.floor(Math.random() * 50) + 1,
            type: ['pickup', 'dropoff', 'transit'][Math.floor(Math.random() * 3)]
        });
    }
    return data;
};

const generateODData = () => {
    return [
        {
            id: 1,
            origin: [28.6139, 77.2090],
            destination: [28.6289, 77.2194],
            trips: 45,
            time: 9
        },
        {
            id: 2,
            origin: [28.6089, 77.1990],
            destination: [28.6339, 77.2290],
            trips: 32,
            time: 17
        },
        {
            id: 3,
            origin: [28.6189, 77.2190],
            destination: [28.6039, 77.1890],
            trips: 28,
            time: 8
        }
    ];
};

// Simple heatmap implementation using CircleMarkers
const HeatmapLayer = ({ data, timeFilter, visible }) => {
    const filteredData = data.filter(point => point.time >= timeFilter[0] && point.time <= timeFilter[1]);

    if (!visible) return null;

    return (
        <>
            {filteredData.map((point) => (
                <Marker
                    key={point.id}
                    position={[point.lat, point.lng]}
                    icon={L.divIcon({
                        className: 'heatmap-point',
                        html: `<div style="
                            width: ${Math.max(10, point.intensity / 5)}px;
                            height: ${Math.max(10, point.intensity / 5)}px;
                            background: rgba(255, 0, 0, ${Math.min(0.8, point.intensity / 100)});
                            border-radius: 50%;
                            border: 2px solid rgba(255, 255, 255, 0.8);
                        "></div>`,
                        iconSize: [20, 20],
                        iconAnchor: [10, 10]
                    })}
                >
                    <Popup>
                        <div className="text-sm">
                            <h3 className="font-semibold">Hotspot Details</h3>
                            <p>Trips: {point.trips}</p>
                            <p>Peak Hour: {point.time}:00</p>
                            <p>Type: {point.type}</p>
                            <p>Intensity: {point.intensity.toFixed(1)}</p>
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

    return (
        <>
            {filteredData.map((arrow) => (
                <Polyline
                    key={arrow.id}
                    positions={[arrow.origin, arrow.destination]}
                    pathOptions={{
                        color: '#3B82F6',
                        weight: Math.max(2, arrow.trips / 10),
                        opacity: 0.7
                    }}
                >
                    <Popup>
                        <div className="text-sm">
                            <h3 className="font-semibold">OD Flow</h3>
                            <p>Trips: {arrow.trips}</p>
                            <p>Peak Hour: {arrow.time}:00</p>
                        </div>
                    </Popup>
                </Polyline>
            ))}
        </>
    );
};

const HexbinLayer = ({ data, timeFilter, visible }) => {
    if (!visible) return null;

    // Simple hexbin simulation using grouped circles
    const hexData = [];
    const hexSize = 0.02;

    for (let lat = 28.55; lat < 28.67; lat += hexSize) {
        for (let lng = 77.15; lng < 77.27; lng += hexSize) {
            const pointsInHex = data.filter(point =>
                Math.abs(point.lat - lat) < hexSize / 2 &&
                Math.abs(point.lng - lng) < hexSize / 2 &&
                point.time >= timeFilter[0] &&
                point.time <= timeFilter[1]
            );

            if (pointsInHex.length > 0) {
                hexData.push({
                    lat,
                    lng,
                    count: pointsInHex.length,
                    avgIntensity: pointsInHex.reduce((sum, p) => sum + p.intensity, 0) / pointsInHex.length
                });
            }
        }
    }

    return (
        <>
            {hexData.map((hex, index) => (
                <Marker
                    key={index}
                    position={[hex.lat, hex.lng]}
                    icon={L.divIcon({
                        className: 'hexbin-point',
                        html: `<div style="
                            width: ${Math.max(15, hex.count * 3)}px;
                            height: ${Math.max(15, hex.count * 3)}px;
                            background: rgba(0, 255, 0, ${Math.min(0.7, hex.count / 10)});
                            clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%);
                            border: 1px solid rgba(255, 255, 255, 0.8);
                        "></div>`,
                        iconSize: [30, 30],
                        iconAnchor: [15, 15]
                    })}
                >
                    <Popup>
                        <div className="text-sm">
                            <h3 className="font-semibold">Hex Area</h3>
                            <p>Points: {hex.count}</p>
                            <p>Avg Intensity: {hex.avgIntensity.toFixed(1)}</p>
                        </div>
                    </Popup>
                </Marker>
            ))}
        </>
    );
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

    const heatmapData = generateHeatmapData();
    const odData = generateODData();

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
    };

    const finishDrawing = () => {
        setDrawingMode(false);
        if (selectedArea.length > 2) {
            // Calculate area stats for demo
            const stats = {
                area: (Math.random() * 10).toFixed(2) + ' km²',
                trips: Math.floor(Math.random() * 500) + 100,
                avgSpeed: (Math.random() * 30 + 20).toFixed(1) + ' km/h'
            };
            setAreaStats(stats);
            setShowAreaPanel(true);
        }
    };

    return (
        <div className="h-screen relative overflow-hidden">
            {/* Header */}
            <div className="absolute top-0 left-0 right-0 z-10 bg-white shadow-sm border-b p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Geospatial Analysis</h1>
                        <p className="text-gray-600 text-sm">Interactive mapping of transportation patterns</p>
                    </div>
                    <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-600">
                            Time: {timeFilter[0]}:00 - {timeFilter[1]}:00
                        </span>
                    </div>
                </div>
            </div>

            {/* Map Container */}
            <div className="absolute top-20 left-0 right-0 bottom-16 z-0">
                <MapContainer
                    center={[28.6139, 77.2090]}
                    zoom={12}
                    style={{ height: '100%', width: '100%' }}
                    eventHandlers={{
                        click: handleMapClick
                    }}
                >
                    <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    />

                    {/* Selection Polygon */}
                    {selectedArea.length > 0 && (
                        <Polygon
                            positions={selectedArea}
                            pathOptions={{
                                color: '#3B82F6',
                                fillColor: '#3B82F6',
                                fillOpacity: 0.1,
                                weight: 2
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
            </div>

            {/* Layer Controls */}
            <div className="absolute top-28 left-4 z-20 bg-white rounded-lg shadow-lg p-2 w-48">
                <h3 className="font-semibold text-gray-800 mb-2 flex items-center">
                    <Layers className="w-4 h-4 mr-2" />
                    Layers
                </h3>
                <div className="space-y-2">
                    <label className="flex items-center">
                        <input
                            type="checkbox"
                            checked={layers.heatmap}
                            onChange={() => toggleLayer('heatmap')}
                            className="mr-2"
                        />
                        <Activity className="w-4 h-4 mr-2 text-red-500" />
                        <span className="text-sm">Heatmap</span>
                    </label>
                    <label className="flex items-center">
                        <input
                            type="checkbox"
                            checked={layers.odArrows}
                            onChange={() => toggleLayer('odArrows')}
                            className="mr-2"
                        />
                        <Navigation className="w-4 h-4 mr-2 text-blue-500" />
                        <span className="text-sm">OD Arrows</span>
                    </label>
                    <label className="flex items-center">
                        <input
                            type="checkbox"
                            checked={layers.hexbin}
                            onChange={() => toggleLayer('hexbin')}
                            className="mr-2"
                        />
                        <Square className="w-4 h-4 mr-2 text-green-500" />
                        <span className="text-sm">Hexbin</span>
                    </label>
                </div>

                <hr className="my-3" />

                <h4 className="font-semibold text-gray-800 mb-2 text-sm">Selection Tools</h4>
                <div className="space-y-2">
                    <button
                        onClick={() => setDrawingMode(!drawingMode)}
                        className={`flex items-center w-full p-2 rounded text-sm ${drawingMode
                                ? 'bg-blue-100 text-blue-700'
                                : 'hover:bg-gray-100'
                            }`}
                    >
                        <MapPin className="w-4 h-4 mr-2" />
                        {drawingMode ? 'Drawing...' : 'Draw Polygon'}
                    </button>

                    {selectedArea.length > 0 && (
                        <div className="space-y-1">
                            <button
                                onClick={finishDrawing}
                                className="flex items-center w-full p-2 rounded text-sm bg-green-100 text-green-700 hover:bg-green-200"
                            >
                                <BarChart3 className="w-4 h-4 mr-2" />
                                Analyze Area
                            </button>
                            <button
                                onClick={clearSelection}
                                className="flex items-center w-full p-2 rounded text-sm bg-red-100 text-red-700 hover:bg-red-200"
                            >
                                <X className="w-4 h-4 mr-2" />
                                Clear Selection
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Time Slider */}
            <div className="absolute bottom-0 left-0 right-0 z-10 bg-white shadow-lg border-t p-4">
                <div className="flex items-center space-x-4">
                    <Clock className="w-5 h-5 text-gray-600" />
                    <span className="text-sm font-medium text-gray-700 w-16">Time:</span>
                    <div className="flex-1 px-4">
                        <input
                            type="range"
                            min="0"
                            max="24"
                            value={timeFilter[0]}
                            onChange={(e) => handleTimeChange([parseInt(e.target.value), timeFilter[1]])}
                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                        />
                        <div className="flex justify-between text-xs text-gray-500 mt-1">
                            <span>0:00</span>
                            <span>6:00</span>
                            <span>12:00</span>
                            <span>18:00</span>
                            <span>24:00</span>
                        </div>
                    </div>
                    <span className="text-sm text-gray-600 w-20">
                        {timeFilter[0]}:00 - {timeFilter[1]}:00
                    </span>
                </div>
            </div>

            {/* Right Sidebar */}
            {sidebarOpen && (
                <div className="absolute top-20 right-4 bottom-16 z-20 w-80 bg-white rounded-lg shadow-lg p-4 overflow-y-auto">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold text-gray-800">Hotspot Analysis</h2>
                        <button
                            onClick={() => setSidebarOpen(false)}
                            className="p-1 hover:bg-gray-100 rounded"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>

                    <div className="space-y-4">
                        <div className="bg-gray-50 p-3 rounded-lg">
                            <h3 className="font-medium text-gray-800 mb-2">Trip Statistics</h3>
                            <div className="grid grid-cols-2 gap-2 text-sm">
                                <div>
                                    <span className="text-gray-600">Total Trips:</span>
                                    <span className="font-medium ml-1">1,247</span>
                                </div>
                                <div>
                                    <span className="text-gray-600">Peak Hour:</span>
                                    <span className="font-medium ml-1">8:00 AM</span>
                                </div>
                                <div>
                                    <span className="text-gray-600">Avg Duration:</span>
                                    <span className="font-medium ml-1">23 min</span>
                                </div>
                                <div>
                                    <span className="text-gray-600">Hot Zones:</span>
                                    <span className="font-medium ml-1">12</span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gray-50 p-3 rounded-lg">
                            <h3 className="font-medium text-gray-800 mb-2">Mode Distribution</h3>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span>Car</span>
                                    <span className="font-medium">45%</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Bus</span>
                                    <span className="font-medium">25%</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Metro</span>
                                    <span className="font-medium">20%</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Walk</span>
                                    <span className="font-medium">10%</span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gray-50 p-3 rounded-lg">
                            <h3 className="font-medium text-gray-800 mb-2">Popular Routes</h3>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span>CP → Gurgaon</span>
                                    <span className="font-medium">234 trips</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Dwarka → CP</span>
                                    <span className="font-medium">189 trips</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Noida → Delhi</span>
                                    <span className="font-medium">156 trips</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Area Analysis Panel */}
            {showAreaPanel && areaStats && (
                <div className="absolute top-20 right-4 z-20 w-80 bg-white rounded-lg shadow-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold text-gray-800">Selected Area Analysis</h2>
                        <button
                            onClick={() => setShowAreaPanel(false)}
                            className="p-1 hover:bg-gray-100 rounded"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>

                    <div className="space-y-4">
                        <div className="bg-blue-50 p-3 rounded-lg">
                            <h3 className="font-medium text-blue-800 mb-2">Area Statistics</h3>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-blue-600">Area Size:</span>
                                    <span className="font-medium text-blue-800">{areaStats.area}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-blue-600">Total Trips:</span>
                                    <span className="font-medium text-blue-800">{areaStats.trips}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-blue-600">Avg Speed:</span>
                                    <span className="font-medium text-blue-800">{areaStats.avgSpeed}</span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gray-50 p-3 rounded-lg">
                            <h3 className="font-medium text-gray-800 mb-2">Time Distribution</h3>
                            <div className="space-y-1 text-sm">
                                <div className="flex justify-between">
                                    <span>Peak Hours (8-10 AM):</span>
                                    <span className="font-medium">35%</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Evening (5-7 PM):</span>
                                    <span className="font-medium">28%</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Off-peak:</span>
                                    <span className="font-medium">37%</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Floating Action Button */}
            <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="absolute top-28 right-4 z-30 bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 transition-colors"
            >
                <BarChart3 className="w-5 h-5" />
            </button>
        </div>
    );
};

export default Geospatial;
