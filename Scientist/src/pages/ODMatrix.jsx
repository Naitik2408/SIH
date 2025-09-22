import React, { useState, useMemo } from 'react';
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

// Generate dummy zone coordinates (Delhi areas)
const zones = [
    { id: 'CP', name: 'Connaught Place', coords: [28.6315, 77.2167] },
    { id: 'GGN', name: 'Gurgaon', coords: [28.4595, 77.0266] },
    { id: 'DWK', name: 'Dwarka', coords: [28.5921, 77.0460] },
    { id: 'NOI', name: 'Noida', coords: [28.5355, 77.3910] },
    { id: 'VAS', name: 'Vasant Kunj', coords: [28.5244, 77.1588] },
    { id: 'RKP', name: 'Rajouri Garden', coords: [28.6470, 77.1204] },
    { id: 'LJN', name: 'Lajpat Nagar', coords: [28.5677, 77.2438] },
    { id: 'KLK', name: 'Karol Bagh', coords: [28.6519, 77.1908] }
];

// Generate dummy OD matrix data
const generateODMatrix = () => {
    const matrix = {};
    zones.forEach(origin => {
        matrix[origin.id] = {};
        zones.forEach(destination => {
            if (origin.id === destination.id) {
                matrix[origin.id][destination.id] = 0;
            } else {
                matrix[origin.id][destination.id] = Math.floor(Math.random() * 500) + 50;
            }
        });
    });
    return matrix;
};

// Generate dummy corridor data
const generateCorridorData = (origin, destination) => {
    const dailyTrips = Array.from({ length: 7 }, (_, i) => ({
        day: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i],
        trips: Math.floor(Math.random() * 200) + 100
    }));

    const modeData = [
        { mode: 'Car', trips: Math.floor(Math.random() * 150) + 50 },
        { mode: 'Bus', trips: Math.floor(Math.random() * 100) + 30 },
        { mode: 'Metro', trips: Math.floor(Math.random() * 80) + 20 },
        { mode: 'Walk', trips: Math.floor(Math.random() * 40) + 10 }
    ];

    const peakHours = Array.from({ length: 24 }, (_, i) => ({
        hour: i,
        trips: i >= 7 && i <= 9 || i >= 17 && i <= 19
            ? Math.floor(Math.random() * 50) + 30
            : Math.floor(Math.random() * 20) + 5
    }));

    return { dailyTrips, modeData, peakHours };
};

// Get top corridors
const getTopCorridors = (matrix) => {
    const corridors = [];
    Object.keys(matrix).forEach(origin => {
        Object.keys(matrix[origin]).forEach(destination => {
            if (matrix[origin][destination] > 0) {
                corridors.push({
                    origin,
                    destination,
                    trips: matrix[origin][destination],
                    originName: zones.find(z => z.id === origin)?.name,
                    destinationName: zones.find(z => z.id === destination)?.name
                });
            }
        });
    });
    return corridors.sort((a, b) => b.trips - a.trips).slice(0, 10);
};

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

    const odMatrix = useMemo(() => generateODMatrix(), []);
    const topCorridors = useMemo(() => getTopCorridors(odMatrix), [odMatrix]);

    // Calculate total trips for percentage view
    const totalTrips = useMemo(() => {
        let total = 0;
        Object.keys(odMatrix).forEach(origin => {
            Object.keys(odMatrix[origin]).forEach(destination => {
                total += odMatrix[origin][destination];
            });
        });
        return total;
    }, [odMatrix]);

    const corridorData = selectedCorridor
        ? generateCorridorData(selectedCorridor.origin, selectedCorridor.destination)
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
            <div className="bg-white rounded-2xl shadow-lg border-0 p-6 md:p-8 bg-gradient-to-r from-blue-50 via-white to-purple-50">
                <div className="flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0">
                    <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-3">
                            <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl shadow-lg">
                                <Navigation className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 bg-clip-text text-transparent">
                                    Origin-Destination Matrix
                                </h1>
                                <p className="text-slate-600 text-lg">Travel pattern analysis between zones</p>
                            </div>
                        </div>
                        
                        {/* Info Panel */}
                        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                            <div className="flex items-start space-x-3">
                                <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                                <div className="text-sm text-blue-800">
                                    <p className="font-semibold mb-1">How to use this matrix:</p>
                                    <ul className="space-y-1 text-blue-700">
                                        <li>• Click any cell to analyze that corridor in detail</li>
                                        <li>• Darker colors indicate higher trip volumes</li>
                                        <li>• Hover over cells to see trip counts and zone names</li>
                                        <li>• View top corridors below the matrix</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
                        <Button
                            variant={matrixView === 'absolute' ? 'default' : 'outline'}
                            onClick={() => setMatrixView('absolute')}
                            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                        >
                            <BarChart3 className="w-4 h-4 mr-2" />
                            Absolute
                        </Button>
                        <Button
                            variant={matrixView === 'percentage' ? 'default' : 'outline'}
                            onClick={() => setMatrixView('percentage')}
                            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                        >
                            <Target className="w-4 h-4 mr-2" />
                            Percentage
                        </Button>
                    </div>
                </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                {/* Left Column - Enhanced OD Matrix */}
                <Card className="xl:col-span-2 shadow-xl border-0 bg-gradient-to-br from-white via-slate-50 to-white">
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
                                ? 'Daily trip volumes between origin and destination zones'
                                : 'Percentage distribution of total daily trips'
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
                                                const trips = odMatrix[originZone.id][destZone.id];
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
                                <h4 className="font-semibold text-slate-700">Trip Volume Legend</h4>
                                <div className="text-sm text-slate-600">Total: {totalTrips.toLocaleString()} trips/day</div>
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

                {/* Right Column - Map and Quick Stats */}
                <div className="space-y-6">
                    {/* Quick Stats Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Card className="shadow-lg border-0 bg-gradient-to-br from-blue-50 to-blue-100">
                            <CardContent className="p-4">
                                <div className="flex items-center space-x-3">
                                    <div className="p-2 bg-blue-500 rounded-lg">
                                        <Route className="w-5 h-5 text-white" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-blue-700 font-medium">Total Corridors</p>
                                        <p className="text-2xl font-bold text-blue-800">{topCorridors.length}</p>
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
                    </div>

                    {/* Enhanced Map */}
                    <Card className="shadow-xl border-0 bg-gradient-to-br from-white via-green-50 to-white">
                        <CardHeader className="pb-4">
                            <CardTitle className="flex items-center text-lg font-bold text-slate-800">
                                <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg mr-3">
                                    <MapPin className="w-5 h-5 text-white" />
                                </div>
                                Corridor Visualization
                            </CardTitle>
                            <CardDescription className="text-slate-600">
                                {selectedCorridor 
                                    ? `Showing: ${getOriginZone(selectedCorridor.origin)?.name} → ${getDestinationZone(selectedCorridor.destination)?.name}`
                                    : 'Select a corridor from the matrix to visualize the route'
                                }
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="h-80 rounded-xl overflow-hidden border border-slate-200 bg-slate-50">
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

                                    {/* Enhanced Selected Corridor Line */}
                                    {selectedCorridor && (
                                        <Polyline
                                            positions={[
                                                getOriginZone(selectedCorridor.origin)?.coords,
                                                getDestinationZone(selectedCorridor.destination)?.coords
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
                    </Card>                </div>
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
                                Detailed Corridor Analysis
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
                                    {getOriginZone(selectedCorridor.origin)?.name}
                                </Badge>
                                <ArrowRight className="w-4 h-4 text-slate-400" />
                                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                    {getDestinationZone(selectedCorridor.destination)?.name}
                                </Badge>
                            </div>
                            <Badge className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
                                {selectedCorridor.trips} trips/day
                            </Badge>
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Daily Trips Chart */}
                            <div className="lg:col-span-2">
                                <h3 className="font-semibold text-slate-800 mb-4 flex items-center">
                                    <TrendingUp className="w-5 h-5 mr-2 text-blue-600" />
                                    Weekly Trip Pattern
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
                                    Transportation Mode
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
                                className={`cursor-pointer transition-all duration-300 hover:shadow-lg transform hover:-translate-y-1 ${
                                    selectedCorridor?.origin === corridor.origin && selectedCorridor?.destination === corridor.destination
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
