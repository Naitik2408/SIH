import React, { useState } from 'react';
import { MapContainer, TileLayer, Polyline, Popup } from 'react-leaflet';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend
} from 'recharts';
import {
    TrendingUp,
    BarChart3,
    MapPin,
    Settings,
    Users,
    Activity,
    Zap,
    AlertCircle,
    CheckCircle,
    ArrowUp,
    ArrowDown
} from 'lucide-react';
import L from 'leaflet';

// Fix for default markers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Scenario options
const scenarios = [
    {
        id: 'current',
        label: 'Current Baseline',
        description: 'Existing infrastructure and services',
        color: '#6B7280'
    },
    {
        id: 'metro_10',
        label: '+10% Metro Capacity',
        description: 'Increase metro frequency and capacity',
        color: '#3B82F6'
    },
    {
        id: 'bus_20',
        label: '+20% Bus Fleet',
        description: 'Add more buses on high-demand routes',
        color: '#10B981'
    },
    {
        id: 'integrated',
        label: 'Integrated Transport',
        description: 'Combined metro + bus + last-mile connectivity',
        color: '#8B5CF6'
    },
    {
        id: 'smart_pricing',
        label: 'Dynamic Pricing',
        description: 'Peak hour pricing with off-peak incentives',
        color: '#F59E0B'
    }
];

// Ridership projection data by scenario
const ridershipData = {
    current: [
        { month: 'Jan', actual: 85000, projected: 85000 },
        { month: 'Feb', actual: 88000, projected: 87000 },
        { month: 'Mar', actual: 92000, projected: 90000 },
        { month: 'Apr', actual: 89000, projected: 92000 },
        { month: 'May', actual: 95000, projected: 94000 },
        { month: 'Jun', actual: 98000, projected: 96000 },
        { month: 'Jul', actual: 101000, projected: 98000 },
        { month: 'Aug', actual: 105000, projected: 100000 },
        { month: 'Sep', actual: 108000, projected: 102000 },
        { month: 'Oct', actual: null, projected: 104000 },
        { month: 'Nov', actual: null, projected: 106000 },
        { month: 'Dec', actual: null, projected: 108000 }
    ],
    metro_10: [
        { month: 'Jan', actual: 85000, projected: 85000 },
        { month: 'Feb', actual: 88000, projected: 89000 },
        { month: 'Mar', actual: 92000, projected: 94000 },
        { month: 'Apr', actual: 89000, projected: 96000 },
        { month: 'May', actual: 95000, projected: 99000 },
        { month: 'Jun', actual: 98000, projected: 102000 },
        { month: 'Jul', actual: 101000, projected: 105000 },
        { month: 'Aug', actual: 105000, projected: 108000 },
        { month: 'Sep', actual: 108000, projected: 111000 },
        { month: 'Oct', actual: null, projected: 114000 },
        { month: 'Nov', actual: null, projected: 117000 },
        { month: 'Dec', actual: null, projected: 120000 }
    ],
    bus_20: [
        { month: 'Jan', actual: 85000, projected: 85000 },
        { month: 'Feb', actual: 88000, projected: 90000 },
        { month: 'Mar', actual: 92000, projected: 95000 },
        { month: 'Apr', actual: 89000, projected: 97000 },
        { month: 'May', actual: 95000, projected: 100000 },
        { month: 'Jun', actual: 98000, projected: 103000 },
        { month: 'Jul', actual: 101000, projected: 106000 },
        { month: 'Aug', actual: 105000, projected: 109000 },
        { month: 'Sep', actual: 108000, projected: 112000 },
        { month: 'Oct', actual: null, projected: 115000 },
        { month: 'Nov', actual: null, projected: 118000 },
        { month: 'Dec', actual: null, projected: 121000 }
    ],
    integrated: [
        { month: 'Jan', actual: 85000, projected: 85000 },
        { month: 'Feb', actual: 88000, projected: 92000 },
        { month: 'Mar', actual: 92000, projected: 98000 },
        { month: 'Apr', actual: 89000, projected: 102000 },
        { month: 'May', actual: 95000, projected: 106000 },
        { month: 'Jun', actual: 98000, projected: 110000 },
        { month: 'Jul', actual: 101000, projected: 114000 },
        { month: 'Aug', actual: 105000, projected: 118000 },
        { month: 'Sep', actual: 108000, projected: 122000 },
        { month: 'Oct', actual: null, projected: 126000 },
        { month: 'Nov', actual: null, projected: 130000 },
        { month: 'Dec', actual: null, projected: 134000 }
    ],
    smart_pricing: [
        { month: 'Jan', actual: 85000, projected: 85000 },
        { month: 'Feb', actual: 88000, projected: 86000 },
        { month: 'Mar', actual: 92000, projected: 88000 },
        { month: 'Apr', actual: 89000, projected: 90000 },
        { month: 'May', actual: 95000, projected: 92000 },
        { month: 'Jun', actual: 98000, projected: 94000 },
        { month: 'Jul', actual: 101000, projected: 96000 },
        { month: 'Aug', actual: 105000, projected: 98000 },
        { month: 'Sep', actual: 108000, projected: 100000 },
        { month: 'Oct', actual: null, projected: 102000 },
        { month: 'Nov', actual: null, projected: 104000 },
        { month: 'Dec', actual: null, projected: 106000 }
    ]
};

// Transport corridors with stress levels
const transportCorridors = [
    {
        id: 1,
        name: 'Ring Road Corridor',
        coordinates: [
            [28.6500, 77.2000],
            [28.6600, 77.2100],
            [28.6700, 77.2200],
            [28.6800, 77.2300]
        ],
        stress: {
            current: 'high',
            metro_10: 'high',
            bus_20: 'medium',
            integrated: 'low',
            smart_pricing: 'medium'
        },
        capacity: 15000,
        volume: {
            current: 14200,
            metro_10: 13800,
            bus_20: 12500,
            integrated: 10800,
            smart_pricing: 12000
        }
    },
    {
        id: 2,
        name: 'Metro Blue Line',
        coordinates: [
            [28.6139, 77.2090],
            [28.6200, 77.2150],
            [28.6300, 77.2250],
            [28.6400, 77.2350]
        ],
        stress: {
            current: 'medium',
            metro_10: 'low',
            bus_20: 'medium',
            integrated: 'low',
            smart_pricing: 'low'
        },
        capacity: 18000,
        volume: {
            current: 12500,
            metro_10: 11200,
            bus_20: 12800,
            integrated: 10500,
            smart_pricing: 11800
        }
    },
    {
        id: 3,
        name: 'Airport Express Highway',
        coordinates: [
            [28.5500, 77.1000],
            [28.5600, 77.1200],
            [28.5700, 77.1400],
            [28.5800, 77.1600]
        ],
        stress: {
            current: 'high',
            metro_10: 'medium',
            bus_20: 'high',
            integrated: 'medium',
            smart_pricing: 'low'
        },
        capacity: 12000,
        volume: {
            current: 11800,
            metro_10: 10500,
            bus_20: 11600,
            integrated: 9200,
            smart_pricing: 8500
        }
    },
    {
        id: 4,
        name: 'Central Delhi Route',
        coordinates: [
            [28.6300, 77.2200],
            [28.6350, 77.2100],
            [28.6400, 77.2000],
            [28.6450, 77.1900]
        ],
        stress: {
            current: 'medium',
            metro_10: 'low',
            bus_20: 'low',
            integrated: 'low',
            smart_pricing: 'medium'
        },
        capacity: 14000,
        volume: {
            current: 9800,
            metro_10: 8500,
            bus_20: 8200,
            integrated: 7500,
            smart_pricing: 8800
        }
    }
];

// Sensitivity analysis data
const sensitivityData = [
    {
        scenario: 'Current Baseline',
        ridership: 108000,
        ridershipChange: 0,
        congestionIndex: 0.85,
        congestionChange: 0,
        co2Reduction: 0,
        co2Change: 0,
        cost: '₹0',
        implementation: 'Immediate'
    },
    {
        scenario: '+10% Metro Capacity',
        ridership: 120000,
        ridershipChange: 11.1,
        congestionIndex: 0.78,
        congestionChange: -8.2,
        co2Reduction: 12.5,
        co2Change: 12.5,
        cost: '₹45 Cr',
        implementation: '8-12 months'
    },
    {
        scenario: '+20% Bus Fleet',
        ridership: 121000,
        ridershipChange: 12.0,
        congestionIndex: 0.73,
        congestionChange: -14.1,
        co2Reduction: 15.8,
        co2Change: 15.8,
        cost: '₹28 Cr',
        implementation: '4-6 months'
    },
    {
        scenario: 'Integrated Transport',
        ridership: 134000,
        ridershipChange: 24.1,
        congestionIndex: 0.62,
        congestionChange: -27.1,
        co2Reduction: 28.4,
        co2Change: 28.4,
        cost: '₹85 Cr',
        implementation: '18-24 months'
    },
    {
        scenario: 'Dynamic Pricing',
        ridership: 106000,
        ridershipChange: -1.9,
        congestionIndex: 0.71,
        congestionChange: -16.5,
        co2Reduction: 18.2,
        co2Change: 18.2,
        cost: '₹8 Cr',
        implementation: '2-3 months'
    }
];

// Get stress color
const getStressColor = (stress) => {
    switch (stress) {
        case 'high': return '#EF4444';
        case 'medium': return '#F59E0B';
        case 'low': return '#10B981';
        default: return '#6B7280';
    }
};

// Custom tooltip component
const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
                <p className="font-medium text-gray-800 mb-1">{label}</p>
                {payload.map((entry, index) => (
                    <p key={index} style={{ color: entry.color }} className="text-sm">
                        {entry.name}: {entry.value?.toLocaleString() || 'N/A'}
                    </p>
                ))}
            </div>
        );
    }
    return null;
};

const DemandModeling = () => {
    const [selectedScenario, setSelectedScenario] = useState('current');

    const currentData = ridershipData[selectedScenario];
    const currentScenario = scenarios.find(s => s.id === selectedScenario);
    const currentSensitivity = sensitivityData.find(s => s.scenario.toLowerCase().replace(/[^a-z0-9]/g, '_').includes(selectedScenario.replace('_', '')));

    // Calculate KPIs
    const currentDemand = currentData[8].actual; // September actual
    const projectedDemand = currentData[11].projected; // December projected
    const demandGrowth = ((projectedDemand - currentDemand) / currentDemand * 100).toFixed(1);
    const congestionReduction = currentSensitivity ? currentSensitivity.congestionChange : 0;

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900">Demand Modeling & Scenarios</h1>
                <p className="text-gray-600 mt-2">Predictive analysis and scenario planning for transportation demand</p>
            </div>

            {/* Top Row: Scenario Selector + KPI Cards */}
            <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
                {/* Scenario Selector */}
                <div className="bg-white rounded-2xl shadow-md border p-6">
                    <div className="flex items-center mb-4">
                        <Settings className="w-5 h-5 mr-2 text-purple-600" />
                        <h2 className="text-lg font-semibold text-gray-800">Scenario</h2>
                    </div>
                    <select
                        value={selectedScenario}
                        onChange={(e) => setSelectedScenario(e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                        {scenarios.map(scenario => (
                            <option key={scenario.id} value={scenario.id}>
                                {scenario.label}
                            </option>
                        ))}
                    </select>
                    <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-600">{currentScenario?.description}</p>
                    </div>
                </div>

                {/* KPI Cards */}
                <div className="bg-white rounded-2xl shadow-md border p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Current Demand</p>
                            <p className="text-2xl font-bold text-gray-900">{currentDemand?.toLocaleString()}</p>
                            <p className="text-xs text-gray-500">Daily riders</p>
                        </div>
                        <div className="p-3 rounded-lg bg-blue-100 text-blue-600">
                            <Users className="w-6 h-6" />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-2xl shadow-md border p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Projected Demand</p>
                            <p className="text-2xl font-bold text-gray-900">{projectedDemand?.toLocaleString()}</p>
                            <div className="flex items-center mt-1">
                                {parseFloat(demandGrowth) >= 0 ? (
                                    <ArrowUp className="w-3 h-3 text-green-500 mr-1" />
                                ) : (
                                    <ArrowDown className="w-3 h-3 text-red-500 mr-1" />
                                )}
                                <p className={`text-xs ${parseFloat(demandGrowth) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                    {demandGrowth}% growth
                                </p>
                            </div>
                        </div>
                        <div className="p-3 rounded-lg bg-green-100 text-green-600">
                            <TrendingUp className="w-6 h-6" />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-2xl shadow-md border p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Congestion Impact</p>
                            <p className="text-2xl font-bold text-gray-900">{Math.abs(congestionReduction).toFixed(1)}%</p>
                            <div className="flex items-center mt-1">
                                {congestionReduction <= 0 ? (
                                    <ArrowDown className="w-3 h-3 text-green-500 mr-1" />
                                ) : (
                                    <ArrowUp className="w-3 h-3 text-red-500 mr-1" />
                                )}
                                <p className={`text-xs ${congestionReduction <= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                    {congestionReduction <= 0 ? 'Reduction' : 'Increase'}
                                </p>
                            </div>
                        </div>
                        <div className="p-3 rounded-lg bg-yellow-100 text-yellow-600">
                            <Activity className="w-6 h-6" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Ridership Line Chart */}
            <div className="bg-white rounded-2xl shadow-md border p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                    <BarChart3 className="w-5 h-5 mr-2" style={{ color: currentScenario?.color }} />
                    Projected vs Actual Ridership - {currentScenario?.label}
                </h2>
                <div className="h-96">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={currentData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="month" />
                            <YAxis tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`} />
                            <Tooltip content={<CustomTooltip />} />
                            <Legend />
                            <Line
                                type="monotone"
                                dataKey="actual"
                                stroke="#3B82F6"
                                strokeWidth={3}
                                dot={{ r: 5, fill: '#3B82F6' }}
                                name="Actual Ridership"
                                connectNulls={false}
                            />
                            <Line
                                type="monotone"
                                dataKey="projected"
                                stroke={currentScenario?.color}
                                strokeWidth={3}
                                strokeDasharray="10 5"
                                dot={{ r: 5, fill: currentScenario?.color }}
                                name="Projected Ridership"
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>

                {/* Chart Insights */}
                <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div className="bg-blue-50 p-3 rounded-lg">
                        <p className="font-medium text-blue-800">Historical Trend</p>
                        <p className="text-blue-600">23% growth from Jan-Sep</p>
                    </div>
                    <div className="bg-green-50 p-3 rounded-lg">
                        <p className="font-medium text-green-800">Scenario Impact</p>
                        <p className="text-green-600">{demandGrowth}% projected change</p>
                    </div>
                    <div className="bg-purple-50 p-3 rounded-lg">
                        <p className="font-medium text-purple-800">Accuracy</p>
                        <p className="text-purple-600">±5% prediction range</p>
                    </div>
                </div>
            </div>

            {/* Bottom Row: Corridor Map + Sensitivity Table */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                {/* Corridor Stress Map */}
                <div className="bg-white rounded-2xl shadow-md border p-6">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                        <MapPin className="w-5 h-5 mr-2 text-red-600" />
                        Corridor Stress Analysis
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

                            {transportCorridors.map(corridor => {
                                const stress = corridor.stress[selectedScenario];
                                const volume = corridor.volume[selectedScenario];
                                const utilization = ((volume / corridor.capacity) * 100).toFixed(1);

                                return (
                                    <Polyline
                                        key={corridor.id}
                                        positions={corridor.coordinates}
                                        pathOptions={{
                                            color: getStressColor(stress),
                                            weight: stress === 'high' ? 6 : stress === 'medium' ? 4 : 3,
                                            opacity: 0.8
                                        }}
                                    >
                                        <Popup>
                                            <div className="text-sm">
                                                <h3 className="font-semibold text-gray-800">{corridor.name}</h3>
                                                <div className="mt-2 space-y-1">
                                                    <p><strong>Stress Level:</strong>
                                                        <span className={`ml-1 px-2 py-1 rounded text-xs text-white`}
                                                            style={{ backgroundColor: getStressColor(stress) }}>
                                                            {stress.toUpperCase()}
                                                        </span>
                                                    </p>
                                                    <p><strong>Volume:</strong> {volume.toLocaleString()}/day</p>
                                                    <p><strong>Capacity:</strong> {corridor.capacity.toLocaleString()}/day</p>
                                                    <p><strong>Utilization:</strong> {utilization}%</p>
                                                </div>
                                            </div>
                                        </Popup>
                                    </Polyline>
                                );
                            })}
                        </MapContainer>
                    </div>

                    {/* Map Legend */}
                    <div className="mt-4 flex items-center justify-center space-x-6 text-sm">
                        <div className="flex items-center space-x-2">
                            <div className="w-4 h-1 bg-red-500 rounded"></div>
                            <span>High Stress</span>
                        </div>
                        <div className="flex items-center space-x-2">
                            <div className="w-4 h-1 bg-yellow-500 rounded"></div>
                            <span>Medium Stress</span>
                        </div>
                        <div className="flex items-center space-x-2">
                            <div className="w-4 h-1 bg-green-500 rounded"></div>
                            <span>Low Stress</span>
                        </div>
                    </div>
                </div>

                {/* Sensitivity Analysis Table */}
                <div className="bg-white rounded-2xl shadow-md border p-6">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                        <Zap className="w-5 h-5 mr-2 text-orange-600" />
                        Sensitivity Analysis
                    </h2>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-gray-200">
                                    <th className="text-left py-3 font-medium text-gray-700">Scenario</th>
                                    <th className="text-center py-3 font-medium text-gray-700">Ridership</th>
                                    <th className="text-center py-3 font-medium text-gray-700">Congestion</th>
                                    <th className="text-center py-3 font-medium text-gray-700">CO₂ Reduction</th>
                                </tr>
                            </thead>
                            <tbody>
                                {sensitivityData.map((row, index) => (
                                    <tr
                                        key={index}
                                        className={`border-b border-gray-100 hover:bg-gray-50 ${row.scenario.toLowerCase().replace(/[^a-z0-9]/g, '_').includes(selectedScenario.replace('_', ''))
                                                ? 'bg-blue-50 border-blue-200'
                                                : ''
                                            }`}
                                    >
                                        <td className="py-3">
                                            <div>
                                                <p className="font-medium text-gray-800">{row.scenario}</p>
                                                <p className="text-xs text-gray-500">{row.cost} • {row.implementation}</p>
                                            </div>
                                        </td>
                                        <td className="text-center py-3">
                                            <div>
                                                <p className="font-medium text-gray-800">{row.ridership.toLocaleString()}</p>
                                                <div className="flex items-center justify-center mt-1">
                                                    {row.ridershipChange > 0 && <ArrowUp className="w-3 h-3 text-green-500 mr-1" />}
                                                    {row.ridershipChange < 0 && <ArrowDown className="w-3 h-3 text-red-500 mr-1" />}
                                                    <p className={`text-xs ${row.ridershipChange > 0 ? 'text-green-600' :
                                                            row.ridershipChange < 0 ? 'text-red-600' : 'text-gray-500'
                                                        }`}>
                                                        {row.ridershipChange !== 0 && (row.ridershipChange > 0 ? '+' : '')}{row.ridershipChange}%
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="text-center py-3">
                                            <div>
                                                <p className="font-medium text-gray-800">{row.congestionIndex}</p>
                                                <div className="flex items-center justify-center mt-1">
                                                    {row.congestionChange < 0 && <ArrowDown className="w-3 h-3 text-green-500 mr-1" />}
                                                    {row.congestionChange > 0 && <ArrowUp className="w-3 h-3 text-red-500 mr-1" />}
                                                    <p className={`text-xs ${row.congestionChange < 0 ? 'text-green-600' :
                                                            row.congestionChange > 0 ? 'text-red-600' : 'text-gray-500'
                                                        }`}>
                                                        {row.congestionChange !== 0 && (row.congestionChange > 0 ? '+' : '')}{row.congestionChange}%
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="text-center py-3">
                                            <div>
                                                <p className="font-medium text-gray-800">{row.co2Reduction}%</p>
                                                <div className="flex items-center justify-center mt-1">
                                                    {row.co2Change > 0 && <CheckCircle className="w-3 h-3 text-green-500" />}
                                                    {row.co2Change === 0 && <AlertCircle className="w-3 h-3 text-gray-400" />}
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Table Insights */}
                    <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div className="bg-green-50 p-3 rounded-lg">
                            <p className="font-medium text-green-800">Best ROI</p>
                            <p className="text-green-600">+20% Bus Fleet (₹28 Cr)</p>
                        </div>
                        <div className="bg-purple-50 p-3 rounded-lg">
                            <p className="font-medium text-purple-800">Maximum Impact</p>
                            <p className="text-purple-600">Integrated Transport (+24%)</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Summary Recommendations */}
            <div className="bg-white rounded-2xl shadow-md border p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                    <CheckCircle className="w-5 h-5 mr-2 text-green-600" />
                    Scenario Recommendations
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-lg">
                        <h3 className="font-semibold text-green-800 mb-2">Short Term (3-6 months)</h3>
                        <ul className="text-sm text-green-700 space-y-1">
                            <li>• Implement Dynamic Pricing</li>
                            <li>• Optimize existing bus routes</li>
                            <li>• Smart traffic management</li>
                        </ul>
                    </div>

                    <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-lg">
                        <h3 className="font-semibold text-blue-800 mb-2">Medium Term (6-12 months)</h3>
                        <ul className="text-sm text-blue-700 space-y-1">
                            <li>• Expand bus fleet by 20%</li>
                            <li>• Increase metro frequency</li>
                            <li>• First-last mile connectivity</li>
                        </ul>
                    </div>

                    <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-4 rounded-lg">
                        <h3 className="font-semibold text-purple-800 mb-2">Long Term (1-2 years)</h3>
                        <ul className="text-sm text-purple-700 space-y-1">
                            <li>• Integrated transport system</li>
                            <li>• New metro corridors</li>
                            <li>• Sustainable mobility hubs</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DemandModeling;
