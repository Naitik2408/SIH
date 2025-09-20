import React, { useState } from 'react';
import {
    PieChart,
    Pie,
    BarChart,
    Bar,
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend,
    Cell
} from 'recharts';
import {
    Car,
    Bus,
    Train,
    Bike,
    Users,
    ShoppingBag,
    Briefcase,
    GraduationCap,
    Heart,
    Coffee,
    TrendingUp,
    Clock,
    MapPin,
    BarChart3
} from 'lucide-react';

// Dummy data for transportation modes
const modeShareData = [
    { mode: 'Bus', trips: 2450, percentage: 35, color: '#3B82F6', icon: Bus },
    { mode: 'Metro', trips: 1820, percentage: 26, color: '#10B981', icon: Train },
    { mode: 'Car', trips: 1400, percentage: 20, color: '#F59E0B', icon: Car },
    { mode: 'Auto', trips: 700, percentage: 10, color: '#8B5CF6', icon: Car },
    { mode: 'Bike', trips: 420, percentage: 6, color: '#EF4444', icon: Bike },
    { mode: 'Walk', trips: 210, percentage: 3, color: '#6B7280', icon: Users }
];

// Mode usage trend over time (weekly)
const modeTrendData = [
    { day: 'Mon', Bus: 380, Metro: 290, Car: 220, Auto: 110, Bike: 65, Walk: 35 },
    { day: 'Tue', Bus: 390, Metro: 295, Car: 215, Auto: 115, Bike: 68, Walk: 32 },
    { day: 'Wed', Bus: 385, Metro: 300, Car: 225, Auto: 105, Bike: 70, Walk: 30 },
    { day: 'Thu', Bus: 395, Metro: 285, Car: 230, Auto: 120, Bike: 65, Walk: 28 },
    { day: 'Fri', Bus: 410, Metro: 310, Car: 240, Auto: 125, Bike: 75, Walk: 40 },
    { day: 'Sat', Bus: 280, Metro: 200, Car: 180, Auto: 80, Bike: 45, Walk: 25 },
    { day: 'Sun', Bus: 210, Metro: 140, Car: 90, Auto: 45, Bike: 32, Walk: 20 }
];

// Trip purpose data
const tripPurposeData = [
    { purpose: 'Work', trips: 2800, percentage: 40, avgDistance: '12.5 km', avgDuration: '35 min', color: '#3B82F6', icon: Briefcase },
    { purpose: 'Shopping', trips: 1400, percentage: 20, avgDistance: '8.2 km', avgDuration: '25 min', color: '#10B981', icon: ShoppingBag },
    { purpose: 'Education', trips: 1050, percentage: 15, avgDistance: '6.8 km', avgDuration: '22 min', color: '#F59E0B', icon: GraduationCap },
    { purpose: 'Leisure', trips: 980, percentage: 14, avgDistance: '15.3 km', avgDuration: '42 min', color: '#8B5CF6', icon: Coffee },
    { purpose: 'Health', trips: 490, percentage: 7, avgDistance: '5.4 km', avgDuration: '18 min', color: '#EF4444', icon: Heart },
    { purpose: 'Other', trips: 280, percentage: 4, avgDistance: '9.1 km', avgDuration: '28 min', color: '#6B7280', icon: MapPin }
];

// Custom tooltip for charts
const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
                {label && <p className="font-medium text-gray-800 mb-1">{label}</p>}
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

const ModePurpose = () => {
    const [activeTab, setActiveTab] = useState('mode');

    const totalTrips = modeShareData.reduce((sum, item) => sum + item.trips, 0);
    const totalPurposeTrips = tripPurposeData.reduce((sum, item) => sum + item.trips, 0);

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900">Mode & Purpose Analysis</h1>
                <p className="text-gray-600 mt-2">Transportation mode distribution and trip purpose analytics</p>
            </div>

            {/* Tab Navigation */}
            <div className="bg-white rounded-2xl shadow-md border">
                <div className="flex border-b border-gray-200">
                    <button
                        onClick={() => setActiveTab('mode')}
                        className={`px-6 py-4 font-medium text-sm transition-colors ${activeTab === 'mode'
                                ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                            }`}
                    >
                        <div className="flex items-center space-x-2">
                            <Bus className="w-4 h-4" />
                            <span>Mode Share Analysis</span>
                        </div>
                    </button>
                    <button
                        onClick={() => setActiveTab('purpose')}
                        className={`px-6 py-4 font-medium text-sm transition-colors ${activeTab === 'purpose'
                                ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                            }`}
                    >
                        <div className="flex items-center space-x-2">
                            <Briefcase className="w-4 h-4" />
                            <span>Trip Purpose Analysis</span>
                        </div>
                    </button>
                </div>

                {/* Tab Content */}
                <div className="p-6">
                    {activeTab === 'mode' ? (
                        <div className="space-y-6">
                            {/* Mode Share Charts */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {/* Pie Chart */}
                                <div className="bg-gray-50 rounded-xl p-6">
                                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                                        <BarChart3 className="w-5 h-5 mr-2 text-blue-600" />
                                        Mode Share Distribution
                                    </h3>
                                    <div className="h-80">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <PieChart>
                                                <Pie
                                                    data={modeShareData}
                                                    cx="50%"
                                                    cy="50%"
                                                    labelLine={false}
                                                    label={renderCustomLabel}
                                                    outerRadius={100}
                                                    fill="#8884d8"
                                                    dataKey="trips"
                                                >
                                                    {modeShareData.map((entry, index) => (
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
                                </div>

                                {/* Mode Trend Line Chart */}
                                <div className="bg-gray-50 rounded-xl p-6">
                                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                                        <TrendingUp className="w-5 h-5 mr-2 text-green-600" />
                                        Weekly Mode Usage Trend
                                    </h3>
                                    <div className="h-80">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <LineChart data={modeTrendData}>
                                                <CartesianGrid strokeDasharray="3 3" />
                                                <XAxis dataKey="day" />
                                                <YAxis />
                                                <Tooltip content={<CustomTooltip />} />
                                                <Legend />
                                                <Line type="monotone" dataKey="Bus" stroke="#3B82F6" strokeWidth={2} />
                                                <Line type="monotone" dataKey="Metro" stroke="#10B981" strokeWidth={2} />
                                                <Line type="monotone" dataKey="Car" stroke="#F59E0B" strokeWidth={2} />
                                                <Line type="monotone" dataKey="Auto" stroke="#8B5CF6" strokeWidth={2} />
                                                <Line type="monotone" dataKey="Bike" stroke="#EF4444" strokeWidth={2} />
                                                <Line type="monotone" dataKey="Walk" stroke="#6B7280" strokeWidth={2} />
                                            </LineChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>
                            </div>

                            {/* Mode Statistics Table */}
                            <div className="bg-gray-50 rounded-xl p-6">
                                <h3 className="text-lg font-semibold text-gray-800 mb-4">Mode Statistics</h3>
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="border-b border-gray-200">
                                                <th className="text-left py-3 px-4 font-medium text-gray-700">Mode</th>
                                                <th className="text-center py-3 px-4 font-medium text-gray-700">Daily Trips</th>
                                                <th className="text-center py-3 px-4 font-medium text-gray-700">Percentage</th>
                                                <th className="text-center py-3 px-4 font-medium text-gray-700">Weekly Avg</th>
                                                <th className="text-center py-3 px-4 font-medium text-gray-700">Growth</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {modeShareData.map((mode, index) => {
                                                const Icon = mode.icon;
                                                const weeklyAvg = Math.round(mode.trips * 7 / 7);
                                                const growth = Math.random() > 0.5 ? '+' : '-';
                                                const growthValue = (Math.random() * 10).toFixed(1);

                                                return (
                                                    <tr key={mode.mode} className="border-b border-gray-100 hover:bg-white transition-colors">
                                                        <td className="py-3 px-4">
                                                            <div className="flex items-center space-x-3">
                                                                <div
                                                                    className="w-3 h-3 rounded-full"
                                                                    style={{ backgroundColor: mode.color }}
                                                                ></div>
                                                                <Icon className="w-4 h-4 text-gray-600" />
                                                                <span className="font-medium text-gray-800">{mode.mode}</span>
                                                            </div>
                                                        </td>
                                                        <td className="text-center py-3 px-4 font-semibold text-gray-800">
                                                            {mode.trips.toLocaleString()}
                                                        </td>
                                                        <td className="text-center py-3 px-4">
                                                            <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                                                                {mode.percentage}%
                                                            </span>
                                                        </td>
                                                        <td className="text-center py-3 px-4 text-gray-600">
                                                            {weeklyAvg.toLocaleString()}
                                                        </td>
                                                        <td className="text-center py-3 px-4">
                                                            <span className={`px-2 py-1 rounded-full text-sm font-medium ${growth === '+'
                                                                    ? 'bg-green-100 text-green-700'
                                                                    : 'bg-red-100 text-red-700'
                                                                }`}>
                                                                {growth}{growthValue}%
                                                            </span>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {/* Trip Purpose Charts */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {/* Bar Chart */}
                                <div className="bg-gray-50 rounded-xl p-6">
                                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                                        <BarChart3 className="w-5 h-5 mr-2 text-purple-600" />
                                        Trips by Purpose
                                    </h3>
                                    <div className="h-80">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart data={tripPurposeData} layout="horizontal">
                                                <CartesianGrid strokeDasharray="3 3" />
                                                <XAxis type="number" />
                                                <YAxis dataKey="purpose" type="category" width={80} />
                                                <Tooltip content={<CustomTooltip />} />
                                                <Bar dataKey="trips" radius={[0, 4, 4, 0]}>
                                                    {tripPurposeData.map((entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                                    ))}
                                                </Bar>
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>

                                {/* Donut Chart */}
                                <div className="bg-gray-50 rounded-xl p-6">
                                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                                        <Users className="w-5 h-5 mr-2 text-orange-600" />
                                        Purpose Share Distribution
                                    </h3>
                                    <div className="h-80">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <PieChart>
                                                <Pie
                                                    data={tripPurposeData}
                                                    cx="50%"
                                                    cy="50%"
                                                    labelLine={false}
                                                    label={renderCustomLabel}
                                                    outerRadius={100}
                                                    innerRadius={40}
                                                    fill="#8884d8"
                                                    dataKey="trips"
                                                >
                                                    {tripPurposeData.map((entry, index) => (
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
                                </div>
                            </div>

                            {/* Purpose Statistics Table */}
                            <div className="bg-gray-50 rounded-xl p-6">
                                <h3 className="text-lg font-semibold text-gray-800 mb-4">Trip Purpose Statistics</h3>
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="border-b border-gray-200">
                                                <th className="text-left py-3 px-4 font-medium text-gray-700">Purpose</th>
                                                <th className="text-center py-3 px-4 font-medium text-gray-700">Daily Trips</th>
                                                <th className="text-center py-3 px-4 font-medium text-gray-700">Percentage</th>
                                                <th className="text-center py-3 px-4 font-medium text-gray-700">Avg Distance</th>
                                                <th className="text-right py-3 px-4 font-medium text-gray-700">Avg Duration</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {tripPurposeData.map((purpose, index) => {
                                                const Icon = purpose.icon;

                                                return (
                                                    <tr key={purpose.purpose} className="border-b border-gray-100 hover:bg-white transition-colors">
                                                        <td className="py-3 px-4">
                                                            <div className="flex items-center space-x-3">
                                                                <div
                                                                    className="w-3 h-3 rounded-full"
                                                                    style={{ backgroundColor: purpose.color }}
                                                                ></div>
                                                                <Icon className="w-4 h-4 text-gray-600" />
                                                                <span className="font-medium text-gray-800">{purpose.purpose}</span>
                                                            </div>
                                                        </td>
                                                        <td className="text-center py-3 px-4 font-semibold text-gray-800">
                                                            {purpose.trips.toLocaleString()}
                                                        </td>
                                                        <td className="text-center py-3 px-4">
                                                            <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
                                                                {purpose.percentage}%
                                                            </span>
                                                        </td>
                                                        <td className="text-center py-3 px-4">
                                                            <div className="flex items-center justify-center space-x-1">
                                                                <MapPin className="w-3 h-3 text-gray-400" />
                                                                <span className="text-gray-600">{purpose.avgDistance}</span>
                                                            </div>
                                                        </td>
                                                        <td className="text-right py-3 px-4">
                                                            <div className="flex items-center justify-end space-x-1">
                                                                <Clock className="w-3 h-3 text-gray-400" />
                                                                <span className="text-gray-600">{purpose.avgDuration}</span>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white rounded-xl shadow-md border p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Total Daily Trips</p>
                            <p className="text-2xl font-bold text-gray-900">
                                {activeTab === 'mode' ? totalTrips.toLocaleString() : totalPurposeTrips.toLocaleString()}
                            </p>
                        </div>
                        <div className="p-2 bg-blue-100 rounded-lg">
                            <Users className="w-6 h-6 text-blue-600" />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-md border p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Most Popular {activeTab === 'mode' ? 'Mode' : 'Purpose'}</p>
                            <p className="text-lg font-bold text-gray-900">
                                {activeTab === 'mode' ? 'Bus (35%)' : 'Work (40%)'}
                            </p>
                        </div>
                        <div className="p-2 bg-green-100 rounded-lg">
                            {activeTab === 'mode' ?
                                <Bus className="w-6 h-6 text-green-600" /> :
                                <Briefcase className="w-6 h-6 text-green-600" />
                            }
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-md border p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Average Distance</p>
                            <p className="text-2xl font-bold text-gray-900">
                                {activeTab === 'mode' ? '9.8 km' : '10.2 km'}
                            </p>
                        </div>
                        <div className="p-2 bg-orange-100 rounded-lg">
                            <MapPin className="w-6 h-6 text-orange-600" />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-md border p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Average Duration</p>
                            <p className="text-2xl font-bold text-gray-900">
                                {activeTab === 'mode' ? '28 min' : '30 min'}
                            </p>
                        </div>
                        <div className="p-2 bg-purple-100 rounded-lg">
                            <Clock className="w-6 h-6 text-purple-600" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ModePurpose;
