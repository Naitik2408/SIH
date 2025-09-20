import React, { useState } from 'react';
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
    Cell
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
    Calendar
} from 'lucide-react';
import L from 'leaflet';

// Fix for default markers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Demographic KPI data
const demographicKPIs = [
    { label: 'Students', percentage: 28, count: 12500, icon: GraduationCap, color: 'bg-blue-100 text-blue-600' },
    { label: 'Employees', percentage: 45, count: 20100, icon: Briefcase, color: 'bg-green-100 text-green-600' },
    { label: 'Homemakers', percentage: 18, count: 8050, icon: Home, color: 'bg-purple-100 text-purple-600' },
    { label: 'Seniors', percentage: 9, count: 4020, icon: UserCheck, color: 'bg-orange-100 text-orange-600' }
];

// Age group data
const ageGroupData = [
    { ageGroup: '18-25', trips: 3200, percentage: 28.5, color: '#3B82F6' },
    { ageGroup: '26-35', trips: 4100, percentage: 36.5, color: '#10B981' },
    { ageGroup: '36-45', trips: 2800, percentage: 24.9, color: '#F59E0B' },
    { ageGroup: '46-55', trips: 850, percentage: 7.6, color: '#8B5CF6' },
    { ageGroup: '56-65', trips: 280, percentage: 2.5, color: '#EF4444' }
];

// Income level data (stacked by mode)
const incomeLevelData = [
    {
        incomeRange: '< ₹25k',
        bus: 680,
        metro: 120,
        auto: 180,
        walk: 320,
        total: 1300,
        percentage: 23.2
    },
    {
        incomeRange: '₹25-50k',
        bus: 920,
        metro: 580,
        auto: 340,
        walk: 160,
        total: 2000,
        percentage: 35.7
    },
    {
        incomeRange: '₹50-75k',
        bus: 450,
        metro: 680,
        auto: 280,
        walk: 90,
        total: 1500,
        percentage: 26.8
    },
    {
        incomeRange: '> ₹75k',
        bus: 180,
        metro: 320,
        auto: 180,
        walk: 120,
        total: 800,
        percentage: 14.3
    }
];

// Gender distribution data
const genderData = [
    { gender: 'Male', trips: 3200, percentage: 57.1, color: '#3B82F6' },
    { gender: 'Female', trips: 2150, percentage: 38.4, color: '#EC4899' },
    { gender: 'Other', trips: 250, percentage: 4.5, color: '#10B981' }
];

// Low-income zones with limited transport (dummy polygons for Delhi)
const equityZones = [
    {
        id: 1,
        name: 'East Delhi Slums',
        coordinates: [
            [28.6500, 77.2800],
            [28.6600, 77.2900],
            [28.6550, 77.3000],
            [28.6450, 77.2950],
            [28.6500, 77.2800]
        ],
        avgIncome: '₹18,000',
        publicTransportAccess: 'Limited',
        issues: ['No metro connectivity', 'Infrequent bus services'],
        population: 45000,
        color: '#EF4444'
    },
    {
        id: 2,
        name: 'South Delhi Low-Income',
        coordinates: [
            [28.5200, 77.2100],
            [28.5300, 77.2200],
            [28.5250, 77.2300],
            [28.5150, 77.2250],
            [28.5200, 77.2100]
        ],
        avgIncome: '₹22,000',
        publicTransportAccess: 'Moderate',
        issues: ['Long walking distances to metro', 'Overcrowded buses'],
        population: 32000,
        color: '#F59E0B'
    },
    {
        id: 3,
        name: 'West Delhi Periphery',
        coordinates: [
            [28.6100, 77.0800],
            [28.6200, 77.0900],
            [28.6150, 77.1000],
            [28.6050, 77.0950],
            [28.6100, 77.0800]
        ],
        avgIncome: '₹16,500',
        publicTransportAccess: 'Poor',
        issues: ['No metro access', 'Limited bus routes', 'Auto dependency'],
        population: 28000,
        color: '#DC2626'
    }
];

// Public transport stops (dummy data)
const transportStops = [
    { id: 1, name: 'Central Metro Station', coords: [28.6139, 77.2090], type: 'metro' },
    { id: 2, name: 'Main Bus Terminal', coords: [28.6500, 77.2300], type: 'bus' },
    { id: 3, name: 'South Metro Hub', coords: [28.5400, 77.2500], type: 'metro' }
];

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

    const totalTrips = ageGroupData.reduce((sum, item) => sum + item.trips, 0);

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900">Demographics & Equity Analysis</h1>
                <p className="text-gray-600 mt-2">Demographic patterns and transportation equity insights</p>
            </div>

            {/* KPI Cards Row */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {demographicKPIs.map((kpi, index) => {
                    const Icon = kpi.icon;
                    return (
                        <div key={index} className="bg-white rounded-xl shadow-md border p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600">{kpi.label}</p>
                                    <p className="text-2xl font-bold text-gray-900">{kpi.percentage}%</p>
                                    <p className="text-xs text-gray-500">{kpi.count.toLocaleString()} users</p>
                                </div>
                                <div className={`p-3 rounded-lg ${kpi.color}`}>
                                    <Icon className="w-6 h-6" />
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                {/* Left Column - Age & Gender Charts */}
                <div className="space-y-6">
                    {/* Age Group Bar Chart */}
                    <div className="bg-white rounded-2xl shadow-md border p-6">
                        <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                            <Calendar className="w-5 h-5 mr-2 text-blue-600" />
                            Trips by Age Group
                        </h2>
                        <div className="h-80">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={ageGroupData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="ageGroup" />
                                    <YAxis />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Bar dataKey="trips" radius={[4, 4, 0, 0]}>
                                        {ageGroupData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>

                        {/* Age Group Summary */}
                        <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                            <div className="bg-blue-50 p-3 rounded-lg">
                                <p className="font-medium text-blue-800">Most Active Group</p>
                                <p className="text-blue-600">26-35 years (36.5%)</p>
                            </div>
                            <div className="bg-green-50 p-3 rounded-lg">
                                <p className="font-medium text-green-800">Total Daily Trips</p>
                                <p className="text-green-600">{totalTrips.toLocaleString()}</p>
                            </div>
                        </div>
                    </div>

                    {/* Gender Distribution Donut Chart */}
                    <div className="bg-white rounded-2xl shadow-md border p-6">
                        <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                            <Users className="w-5 h-5 mr-2 text-pink-600" />
                            Gender Distribution
                        </h2>
                        <div className="h-80">
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
                        </div>

                        {/* Gender Stats */}
                        <div className="mt-4 space-y-2">
                            {genderData.map((item, index) => (
                                <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                                    <div className="flex items-center space-x-2">
                                        <div
                                            className="w-3 h-3 rounded-full"
                                            style={{ backgroundColor: item.color }}
                                        ></div>
                                        <span className="font-medium text-gray-700">{item.gender}</span>
                                    </div>
                                    <div className="text-right">
                                        <span className="font-semibold text-gray-800">{item.trips.toLocaleString()}</span>
                                        <span className="text-sm text-gray-500 ml-2">({item.percentage}%)</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right Column - Income & Equity Map */}
                <div className="space-y-6">
                    {/* Income Level Stacked Bar Chart */}
                    <div className="bg-white rounded-2xl shadow-md border p-6">
                        <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                            <DollarSign className="w-5 h-5 mr-2 text-green-600" />
                            Trips by Income Level & Mode
                        </h2>
                        <div className="h-80">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={incomeLevelData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="incomeRange" />
                                    <YAxis />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Legend />
                                    <Bar dataKey="bus" stackId="a" fill="#3B82F6" name="Bus" />
                                    <Bar dataKey="metro" stackId="a" fill="#10B981" name="Metro" />
                                    <Bar dataKey="auto" stackId="a" fill="#F59E0B" name="Auto" />
                                    <Bar dataKey="walk" stackId="a" fill="#8B5CF6" name="Walk" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>

                        {/* Income Insights */}
                        <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                            <div className="bg-yellow-50 p-3 rounded-lg">
                                <p className="font-medium text-yellow-800">Low Income Transit</p>
                                <p className="text-yellow-600">Bus dependency: 52%</p>
                            </div>
                            <div className="bg-green-50 p-3 rounded-lg">
                                <p className="font-medium text-green-800">High Income Transit</p>
                                <p className="text-green-600">Metro preference: 40%</p>
                            </div>
                        </div>
                    </div>

                    {/* Equity Map */}
                    <div className="bg-white rounded-2xl shadow-md border p-6">
                        <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                            <MapPin className="w-5 h-5 mr-2 text-red-600" />
                            Transportation Equity Map
                        </h2>
                        <div className="h-80 rounded-lg overflow-hidden">
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
                        </div>

                        {/* Map Legend */}
                        <div className="mt-4 grid grid-cols-3 gap-2 text-xs">
                            <div className="flex items-center space-x-2">
                                <div className="w-4 h-4 bg-red-600 rounded opacity-30"></div>
                                <span>Critical Equity Gap</span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <div className="w-4 h-4 bg-yellow-500 rounded opacity-30"></div>
                                <span>Moderate Issues</span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                                <span>Transit Stops</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Equity Insights Panel */}
            {selectedZone && (
                <div className="bg-white rounded-2xl shadow-md border p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-semibold text-gray-800 flex items-center">
                            <AlertTriangle className="w-5 h-5 mr-2 text-red-600" />
                            Equity Analysis: {selectedZone.name}
                        </h2>
                        <button
                            onClick={() => setSelectedZone(null)}
                            className="text-gray-400 hover:text-gray-600"
                        >
                            ×
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-red-50 p-4 rounded-lg">
                            <h3 className="font-semibold text-red-800 mb-2">Access Issues</h3>
                            <ul className="text-sm text-red-700 space-y-1">
                                {selectedZone.issues.map((issue, idx) => (
                                    <li key={idx}>• {issue}</li>
                                ))}
                            </ul>
                        </div>

                        <div className="bg-blue-50 p-4 rounded-lg">
                            <h3 className="font-semibold text-blue-800 mb-2">Demographics</h3>
                            <div className="text-sm text-blue-700 space-y-1">
                                <p>Population: {selectedZone.population.toLocaleString()}</p>
                                <p>Avg Income: {selectedZone.avgIncome}</p>
                                <p>Transport Access: {selectedZone.publicTransportAccess}</p>
                            </div>
                        </div>

                        <div className="bg-green-50 p-4 rounded-lg">
                            <h3 className="font-semibold text-green-800 mb-2">Recommendations</h3>
                            <ul className="text-sm text-green-700 space-y-1">
                                <li>• Increase bus frequency</li>
                                <li>• Extend metro connectivity</li>
                                <li>• Improve last-mile access</li>
                                <li>• Subsidized transport options</li>
                            </ul>
                        </div>
                    </div>
                </div>
            )}

            {/* Summary Statistics */}
            <div className="bg-white rounded-2xl shadow-md border p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                    <TrendingUp className="w-5 h-5 mr-2 text-purple-600" />
                    Key Demographics Insights
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="text-center p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg">
                        <div className="text-2xl font-bold text-blue-700">57:43</div>
                        <div className="text-sm text-blue-600">Male to Female Ratio</div>
                    </div>
                    <div className="text-center p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-lg">
                        <div className="text-2xl font-bold text-green-700">26-35</div>
                        <div className="text-sm text-green-600">Most Active Age Group</div>
                    </div>
                    <div className="text-center p-4 bg-gradient-to-r from-yellow-50 to-yellow-100 rounded-lg">
                        <div className="text-2xl font-bold text-yellow-700">₹25-50k</div>
                        <div className="text-sm text-yellow-600">Dominant Income Bracket</div>
                    </div>
                    <div className="text-center p-4 bg-gradient-to-r from-red-50 to-red-100 rounded-lg">
                        <div className="text-2xl font-bold text-red-700">3</div>
                        <div className="text-sm text-red-600">Critical Equity Zones</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Demographics;
