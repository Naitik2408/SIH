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
    Legend
} from 'recharts';
import {
    MapPin,
    TrendingUp,
    Clock,
    Car,
    Users,
    ArrowRight,
    Navigation
} from 'lucide-react';
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

    const odMatrix = useMemo(() => generateODMatrix(), []);
    const topCorridors = useMemo(() => getTopCorridors(odMatrix), [odMatrix]);

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
        if (trips === 0) return 'bg-gray-100';
        if (trips < 100) return 'bg-blue-100';
        if (trips < 200) return 'bg-blue-200';
        if (trips < 300) return 'bg-blue-300';
        if (trips < 400) return 'bg-blue-400 text-white';
        return 'bg-blue-500 text-white';
    };

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900">Origin-Destination Matrix</h1>
                <p className="text-gray-600 mt-2">Analysis of travel patterns between different locations</p>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                {/* Left Column - OD Matrix */}
                <div className="bg-white rounded-2xl shadow-md border p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-semibold text-gray-800 flex items-center">
                            <Navigation className="w-5 h-5 mr-2 text-blue-600" />
                            OD Matrix
                        </h2>
                        <div className="text-sm text-gray-600">
                            Trips per day
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr>
                                    <th className="p-2 text-left font-medium text-gray-700">Origin \ Destination</th>
                                    {zones.map(zone => (
                                        <th key={zone.id} className="p-2 text-center font-medium text-gray-700 min-w-16">
                                            {zone.id}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {zones.map(originZone => (
                                    <tr key={originZone.id} className="border-t">
                                        <td className="p-2 font-medium text-gray-700 bg-gray-50">
                                            {originZone.id}
                                        </td>
                                        {zones.map(destZone => {
                                            const trips = odMatrix[originZone.id][destZone.id];
                                            const isSelected = selectedCorridor?.origin === originZone.id && selectedCorridor?.destination === destZone.id;
                                            const isHovered = hoveredCell?.origin === originZone.id && hoveredCell?.destination === destZone.id;

                                            return (
                                                <td
                                                    key={destZone.id}
                                                    className={`p-2 text-center cursor-pointer transition-all duration-200 ${getCellColor(trips)
                                                        } ${isSelected ? 'ring-2 ring-blue-500' : ''} ${isHovered ? 'scale-105 shadow-md' : ''
                                                        } ${trips > 0 ? 'hover:shadow-lg' : ''}`}
                                                    onClick={() => handleCellClick(originZone.id, destZone.id, trips)}
                                                    onMouseEnter={() => setHoveredCell({ origin: originZone.id, destination: destZone.id })}
                                                    onMouseLeave={() => setHoveredCell(null)}
                                                    title={trips > 0 ? `${originZone.name} → ${destZone.name}: ${trips} trips` : 'No trips'}
                                                >
                                                    {trips > 0 ? trips : '-'}
                                                </td>
                                            );
                                        })}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Legend */}
                    <div className="mt-4 flex items-center justify-center space-x-4 text-xs">
                        <div className="flex items-center space-x-2">
                            <div className="w-4 h-4 bg-blue-100 rounded"></div>
                            <span>&lt; 100</span>
                        </div>
                        <div className="flex items-center space-x-2">
                            <div className="w-4 h-4 bg-blue-200 rounded"></div>
                            <span>100-200</span>
                        </div>
                        <div className="flex items-center space-x-2">
                            <div className="w-4 h-4 bg-blue-300 rounded"></div>
                            <span>200-300</span>
                        </div>
                        <div className="flex items-center space-x-2">
                            <div className="w-4 h-4 bg-blue-400 rounded"></div>
                            <span>300-400</span>
                        </div>
                        <div className="flex items-center space-x-2">
                            <div className="w-4 h-4 bg-blue-500 rounded"></div>
                            <span>400+</span>
                        </div>
                    </div>
                </div>

                {/* Right Column - Map and Analysis */}
                <div className="space-y-6">
                    {/* Map */}
                    <div className="bg-white rounded-2xl shadow-md border p-6">
                        <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                            <MapPin className="w-5 h-5 mr-2 text-green-600" />
                            Corridor Map
                        </h2>
                        <div className="h-80 rounded-lg overflow-hidden">
                            <MapContainer
                                center={[28.6139, 77.2090]}
                                zoom={10}
                                style={{ height: '100%', width: '100%' }}
                            >
                                <TileLayer
                                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                    attribution='&copy; OpenStreetMap contributors'
                                />

                                {/* Zone Markers */}
                                {zones.map(zone => (
                                    <Marker key={zone.id} position={zone.coords}>
                                        <Popup>
                                            <div className="text-center">
                                                <h3 className="font-semibold">{zone.name}</h3>
                                                <p className="text-sm text-gray-600">Zone: {zone.id}</p>
                                            </div>
                                        </Popup>
                                    </Marker>
                                ))}

                                {/* Selected Corridor Line */}
                                {selectedCorridor && (
                                    <Polyline
                                        positions={[
                                            getOriginZone(selectedCorridor.origin)?.coords,
                                            getDestinationZone(selectedCorridor.destination)?.coords
                                        ]}
                                        pathOptions={{
                                            color: '#3B82F6',
                                            weight: 4,
                                            opacity: 0.8
                                        }}
                                    />
                                )}
                            </MapContainer>
                        </div>
                    </div>

                    {/* Corridor Details */}
                    {selectedCorridor && corridorData && (
                        <div className="bg-white rounded-2xl shadow-md border p-6">
                            <div className="mb-4">
                                <h2 className="text-xl font-semibold text-gray-800 flex items-center">
                                    <ArrowRight className="w-5 h-5 mr-2 text-purple-600" />
                                    Corridor Analysis
                                </h2>
                                <p className="text-gray-600 text-sm mt-1">
                                    {getOriginZone(selectedCorridor.origin)?.name} → {getDestinationZone(selectedCorridor.destination)?.name}
                                    <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">
                                        {selectedCorridor.trips} trips/day
                                    </span>
                                </p>
                            </div>

                            {/* Daily Trips Chart */}
                            <div className="mb-6">
                                <h3 className="font-medium text-gray-800 mb-3 flex items-center">
                                    <TrendingUp className="w-4 h-4 mr-2" />
                                    Daily Trip Volume
                                </h3>
                                <div className="h-48">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart data={corridorData.dailyTrips}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="day" />
                                            <YAxis />
                                            <Tooltip />
                                            <Line
                                                type="monotone"
                                                dataKey="trips"
                                                stroke="#3B82F6"
                                                strokeWidth={2}
                                                dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
                                            />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            {/* Mode Split and Peak Hours */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {/* Mode Split */}
                                <div>
                                    <h3 className="font-medium text-gray-800 mb-3 flex items-center">
                                        <Car className="w-4 h-4 mr-2" />
                                        Mode Split
                                    </h3>
                                    <div className="h-32">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart data={corridorData.modeData} layout="horizontal">
                                                <CartesianGrid strokeDasharray="3 3" />
                                                <XAxis type="number" />
                                                <YAxis dataKey="mode" type="category" width={60} />
                                                <Tooltip />
                                                <Bar dataKey="trips" fill="#10B981" radius={[0, 4, 4, 0]} />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>

                                {/* Peak Hours Preview */}
                                <div>
                                    <h3 className="font-medium text-gray-800 mb-3 flex items-center">
                                        <Clock className="w-4 h-4 mr-2" />
                                        Peak Hours
                                    </h3>
                                    <div className="h-32">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart data={corridorData.peakHours.filter(h => h.hour % 3 === 0)}>
                                                <CartesianGrid strokeDasharray="3 3" />
                                                <XAxis dataKey="hour" />
                                                <YAxis />
                                                <Tooltip />
                                                <Bar dataKey="trips" fill="#F59E0B" radius={[4, 4, 0, 0]} />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Top Corridors */}
            <div className="bg-white rounded-2xl shadow-md border p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                    <Users className="w-5 h-5 mr-2 text-orange-600" />
                    Top Corridors by Volume
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                    {topCorridors.map((corridor, index) => (
                        <div
                            key={`${corridor.origin}-${corridor.destination}`}
                            className={`p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${selectedCorridor?.origin === corridor.origin && selectedCorridor?.destination === corridor.destination
                                    ? 'border-blue-500 bg-blue-50'
                                    : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                                }`}
                            onClick={() => setSelectedCorridor(corridor)}
                        >
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-xs font-medium text-gray-500">#{index + 1}</span>
                                <span className="text-lg font-bold text-blue-600">{corridor.trips}</span>
                            </div>
                            <div className="text-sm">
                                <div className="font-medium text-gray-800">{corridor.originName}</div>
                                <div className="flex items-center text-gray-600 my-1">
                                    <ArrowRight className="w-3 h-3 mx-1" />
                                </div>
                                <div className="font-medium text-gray-800">{corridor.destinationName}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ODMatrix;
