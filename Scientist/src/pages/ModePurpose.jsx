import React, { useState, useEffect } from 'react';
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
    Cell,
    AreaChart,
    Area
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
    BarChart3,
    Activity,
    ArrowUpIcon,
    ArrowDownIcon,
    Footprints
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { getChartData, analyzeUserData } from '../utils/dashboardAnalytics';

// Helper function to generate daily data based on mode share
const generateDayData = (modeData, multiplier) => {
    const dayData = {};
    modeData.forEach(mode => {
        dayData[mode.mode] = Math.round(mode.trips * multiplier * 0.15); // Scale down for daily view
    });
    return dayData;
};

// Enhanced custom tooltip component
const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <Card className="border border-gray-200 shadow-xl backdrop-blur-sm bg-white/95">
                <CardContent className="p-3">
                    {label && <p className="font-semibold text-gray-800 mb-2">{label}</p>}
                    {payload.map((entry, index) => (
                        <div key={index} className="flex items-center space-x-2">
                            <div
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: entry.color }}
                            ></div>
                            <span className="text-sm text-gray-600">{entry.name}:</span>
                            <span className="text-sm font-semibold text-gray-800">{entry.value}</span>
                            {entry.payload?.percentage && (
                                <span className="text-xs text-purple-600 font-medium">({entry.payload.percentage}%)</span>
                            )}
                        </div>
                    ))}
                </CardContent>
            </Card>
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

// Enhanced KPI Card Component
const EnhancedKPICard = ({ title, value, subtitle, icon: Icon, gradient, badge }) => (
    <Card className="relative overflow-hidden group hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-white via-purple-50/30 to-white">
        <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-5 group-hover:opacity-10 transition-opacity duration-300`}></div>
        <CardContent className="p-6 relative z-10">
            <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-xl bg-gradient-to-br ${gradient} shadow-lg group-hover:scale-105 transition-transform`}>
                    <Icon className="w-6 h-6 text-white" />
                </div>
                {badge && (
                    <Badge variant="secondary" className="bg-gradient-to-r from-purple-100 to-purple-200 text-purple-800 hover:from-purple-200 hover:to-purple-300">
                        {badge}
                    </Badge>
                )}
            </div>
            <div className="space-y-2">
                <p className="text-3xl font-bold text-gray-900 tracking-tight">{value}</p>
                <p className="text-sm font-medium text-gray-700">{title}</p>
                {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
            </div>
        </CardContent>
    </Card>
);

const ModePurpose = () => {
    const [activeTab, setActiveTab] = useState('mode');
    const [loading, setLoading] = useState(true);
    const [chartData, setChartData] = useState({
        transportData: [],
        purposeData: [],
        analytics: {
            totalUsers: 0,
            totalTrips: 0,
            avgDuration: 0
        }
    });

    // Load data on component mount
    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            try {
                const data = await getChartData();
                // Transform data to expected structure
                setChartData({
                    transportData: data.transportData || [],
                    purposeData: data.purposeData || [],
                    analytics: {
                        totalUsers: data.totalUsers || 0,
                        totalTrips: data.totalJourneys || 0,
                        avgDuration: 30 // Default value, can be enhanced later
                    }
                });
            } catch (error) {
                console.error('Error loading ModePurpose data:', error);
                // Set empty defaults to prevent crashes
                setChartData({
                    transportData: [],
                    purposeData: [],
                    analytics: { totalUsers: 0, totalTrips: 0, avgDuration: 0 }
                });
            } finally {
                setLoading(false);
            }
        };
        
        loadData();
    }, []);
    
    // Get data from state
    const { transportData: modeShareData, purposeData: tripPurposeData, analytics } = chartData;
    
    // Create enhanced mode share data with icons and additional info
    const enhancedModeShareData = (modeShareData || []).map(mode => {
        const iconMap = {
            'Bus': Bus,
            'Metro': Train,
            'Car': Car,
            'Auto': Car,
            'Bike': Bike,
            'Walk': Footprints,
            'Cycle': Bike
        };
        
        return {
            mode: mode.name,
            trips: mode.value,
            percentage: Math.round((mode.value / (analytics?.totalTrips || 1)) * 100),
            color: mode.color,
            icon: iconMap[mode.name] || Car
        };
    });
    
    // Create enhanced trip purpose data with icons and metrics
    const enhancedTripPurposeData = (tripPurposeData || []).map(purpose => {
        const iconMap = {
            'Work': Briefcase,
            'Shopping': ShoppingBag,
            'Education': GraduationCap,
            'Home': Coffee,
            'Family': Heart,
            'Healthcare': Heart,
            'Entertainment': Coffee,
            'Other': MapPin
        };
        
        // Calculate average distance and duration (simulated based on purpose)
        const avgDistanceMap = {
            'Work': '12.5 km',
            'Shopping': '8.2 km', 
            'Education': '6.8 km',
            'Home': '12.5 km',
            'Family': '15.3 km',
            'Healthcare': '5.4 km',
            'Entertainment': '18.2 km',
            'Other': '9.1 km'
        };
        
        const avgDurationMap = {
            'Work': '35 min',
            'Shopping': '25 min',
            'Education': '22 min', 
            'Home': '35 min',
            'Family': '42 min',
            'Healthcare': '18 min',
            'Entertainment': '48 min',
            'Other': '28 min'
        };
        
        return {
            purpose: purpose.name,
            trips: purpose.trips,
            percentage: Math.round((purpose.trips / (analytics?.totalTrips || 1)) * 100),
            avgDistance: avgDistanceMap[purpose.name] || '10.0 km',
            avgDuration: avgDurationMap[purpose.name] || '30 min',
            color: purpose.fill,
            icon: iconMap[purpose.name] || MapPin
        };
    });
    
    // Generate mode trend data based on real data (simulated weekly patterns)
    const modeTrendData = [
        { day: 'Mon', ...generateDayData(enhancedModeShareData, 0.85) },
        { day: 'Tue', ...generateDayData(enhancedModeShareData, 0.88) },
        { day: 'Wed', ...generateDayData(enhancedModeShareData, 0.90) },
        { day: 'Thu', ...generateDayData(enhancedModeShareData, 0.87) },
        { day: 'Fri', ...generateDayData(enhancedModeShareData, 0.95) },
        { day: 'Sat', ...generateDayData(enhancedModeShareData, 0.45) },
        { day: 'Sun', ...generateDayData(enhancedModeShareData, 0.30) }
    ];

    const totalTrips = enhancedModeShareData.reduce((sum, item) => sum + item.trips, 0);
    const totalPurposeTrips = enhancedTripPurposeData.reduce((sum, item) => sum + item.trips, 0);

    return (
        <div className="p-6 space-y-8 bg-gradient-to-br from-purple-50/30 via-white to-blue-50/30 min-h-screen">
            
            {/* Enhanced Header */}
            <div className="mb-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 via-purple-700 to-blue-600 bg-clip-text text-transparent">
                            Mode & Purpose Analysis
                        </h1>
                        <p className="text-gray-600 mt-2 text-lg">Transportation mode distribution and trip purpose analytics</p>
                    </div>
                    <div className="flex space-x-3">
                        <Button variant="outline" className="border-purple-200 text-purple-700 hover:bg-purple-50">
                            Export Data
                        </Button>
                        <Button className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800">
                            Live View
                        </Button>
                    </div>
                </div>
            </div>

            {/* Enhanced Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <EnhancedKPICard
                    title="Total Daily Trips"
                    value={activeTab === 'mode' ? totalTrips.toLocaleString() : totalPurposeTrips.toLocaleString()}
                    subtitle="across all modes"
                    icon={Users}
                    gradient="from-purple-500 to-purple-600"
                    badge="Today"
                />
                <EnhancedKPICard
                    title={`Most Popular ${activeTab === 'mode' ? 'Mode' : 'Purpose'}`}
                    value={activeTab === 'mode' ? 
                        enhancedModeShareData.length > 0 ? enhancedModeShareData[0].mode : 'Metro' : 
                        enhancedTripPurposeData.length > 0 ? enhancedTripPurposeData[0].purpose : 'Work'
                    }
                    subtitle={activeTab === 'mode' ? 
                        enhancedModeShareData.length > 0 ? `${enhancedModeShareData[0].percentage}% of all trips` : '35% of all trips' :
                        enhancedTripPurposeData.length > 0 ? `${enhancedTripPurposeData[0].percentage}% of all trips` : '40% of all trips'
                    }
                    icon={activeTab === 'mode' ? Bus : Briefcase}
                    gradient="from-blue-500 to-blue-600"
                    badge={activeTab === 'mode' ? 
                        enhancedModeShareData.length > 0 ? `${enhancedModeShareData[0].percentage}%` : '35%' :
                        enhancedTripPurposeData.length > 0 ? `${enhancedTripPurposeData[0].percentage}%` : '40%'
                    }
                />
                <EnhancedKPICard
                    title="Average Distance"
                    value={`${analytics?.avgDistance || 15} km`}
                    subtitle="per trip"
                    icon={MapPin}
                    gradient="from-indigo-500 to-indigo-600"
                />
                <EnhancedKPICard
                    title="Average Duration"
                    value={`${analytics?.avgDuration || 30} min`}
                    subtitle="per trip"
                    icon={Clock}
                    gradient="from-violet-500 to-violet-600"
                />
            </div>

            {/* Enhanced Tab Navigation */}
            <Card className="shadow-xl border-0 bg-gradient-to-br from-white via-purple-50/20 to-white">
                <div className="flex border-b border-gray-200">
                    <div
                        onClick={() => setActiveTab('mode')}
                        className={`px-8 py-6 font-semibold text-sm transition-all duration-300 ${
                            activeTab === 'mode'
                                ? 'text-purple-600 border-b-2 border-purple-600 bg-gradient-to-r from-purple-50 to-purple-100'
                                : 'text-gray-600 hover:text-purple-600 hover:bg-purple-50'
                        }`}
                    >
                        <div className="flex items-center space-x-3">
                            <Bus className="w-5 h-5" />
                            <span>Mode Share Analysis</span>
                        </div>
                    </div>
                    <div
                        onClick={() => setActiveTab('purpose')}
                        className={`px-8 py-6 font-semibold text-sm transition-all duration-300 ${
                            activeTab === 'purpose'
                                ? 'text-purple-600 border-b-2 border-purple-600 bg-gradient-to-r from-purple-50 to-purple-100'
                                : 'text-gray-600 hover:text-purple-600 hover:bg-purple-50'
                        }`}
                    >
                        <div className="flex items-center space-x-3">
                            <Briefcase className="w-5 h-5" />
                            <span>Trip Purpose Analysis</span>
                        </div>
                    </div>
                </div>

                {/* Tab Content */}
                <CardContent className="p-8">
                    {activeTab === 'mode' ? (
                        <div className="space-y-8">
                            {/* Enhanced Mode Share Charts */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                {/* Enhanced Pie Chart */}
                                <Card className="shadow-xl border-0 bg-gradient-to-br from-white via-purple-50/20 to-white">
                                    <CardHeader className="pb-4">
                                        <CardTitle className="flex items-center text-xl font-bold text-gray-800">
                                            <BarChart3 className="w-6 h-6 mr-3 text-purple-600" />
                                            Mode Share Distribution
                                        </CardTitle>
                                        <CardDescription className="text-gray-600">
                                            Transportation mode usage breakdown
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <ResponsiveContainer width="100%" height={350}>
                                            <PieChart>
                                                <Pie
                                                    data={enhancedModeShareData}
                                                    cx="50%"
                                                    cy="50%"
                                                    labelLine={false}
                                                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                                    outerRadius={100}
                                                    innerRadius={40}
                                                    fill="#8884d8"
                                                    dataKey="trips"
                                                    stroke="#fff"
                                                    strokeWidth={2}
                                                >
                                                    {enhancedModeShareData.map((entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                                    ))}
                                                </Pie>
                                                <Tooltip content={<CustomTooltip />} />
                                                <Legend 
                                                    wrapperStyle={{ paddingTop: '20px' }}
                                                    formatter={(value, entry) => (
                                                        <span className="text-gray-700 font-medium">{value}</span>
                                                    )}
                                                />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    </CardContent>
                                </Card>

                                {/* Enhanced Mode Trend Area Chart */}
                                <Card className="shadow-xl border-0 bg-gradient-to-br from-white via-blue-50/20 to-white">
                                    <CardHeader className="pb-4">
                                        <CardTitle className="flex items-center text-xl font-bold text-gray-800">
                                            <TrendingUp className="w-6 h-6 mr-3 text-blue-600" />
                                            Weekly Mode Usage Trend
                                        </CardTitle>
                                        <CardDescription className="text-gray-600">
                                            Daily variation in transportation mode usage
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <ResponsiveContainer width="100%" height={350}>
                                            <AreaChart data={modeTrendData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                                <CartesianGrid strokeDasharray="3 3" stroke="#e0e7ff" />
                                                <XAxis 
                                                    dataKey="day" 
                                                    tick={{ fill: '#6b7280', fontSize: 12 }}
                                                    axisLine={{ stroke: '#d1d5db' }}
                                                />
                                                <YAxis 
                                                    tick={{ fill: '#6b7280', fontSize: 12 }}
                                                    axisLine={{ stroke: '#d1d5db' }}
                                                />
                                                <Tooltip content={<CustomTooltip />} />
                                                <Area type="monotone" dataKey="Walk" stackId="1" stroke="#ddd6fe" fill="#ddd6fe40" strokeWidth={2} />
                                                <Area type="monotone" dataKey="Bike" stackId="1" stroke="#e879f9" fill="#e879f940" strokeWidth={2} />
                                                <Area type="monotone" dataKey="Auto" stackId="1" stroke="#c084fc" fill="#c084fc40" strokeWidth={2} />
                                                <Area type="monotone" dataKey="Car" stackId="1" stroke="#7c3aed" fill="#7c3aed40" strokeWidth={2} />
                                                <Area type="monotone" dataKey="Metro" stackId="1" stroke="#8b7cf6" fill="#8b7cf640" strokeWidth={2} />
                                                <Area type="monotone" dataKey="Bus" stackId="1" stroke="#a28ef9" fill="#a28ef940" strokeWidth={2} />
                                                <Legend />
                                            </AreaChart>
                                        </ResponsiveContainer>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Enhanced Mode Statistics Table */}
                            <Card className="shadow-xl border-0 bg-gradient-to-br from-white via-green-50/20 to-white">
                                <CardHeader className="pb-4">
                                    <CardTitle className="flex items-center text-xl font-bold text-gray-800">
                                        <Activity className="w-6 h-6 mr-3 text-green-600" />
                                        Mode Statistics
                                    </CardTitle>
                                    <CardDescription className="text-gray-600">
                                        Detailed breakdown of transportation mode performance
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="overflow-x-auto">
                                        <table className="w-full">
                                            <thead>
                                                <tr className="border-b border-gray-200">
                                                    <th className="text-left py-4 px-4 font-semibold text-gray-700">Mode</th>
                                                    <th className="text-center py-4 px-4 font-semibold text-gray-700">Daily Trips</th>
                                                    <th className="text-center py-4 px-4 font-semibold text-gray-700">Share</th>
                                                    <th className="text-center py-4 px-4 font-semibold text-gray-700">Weekly Avg</th>
                                                    <th className="text-center py-4 px-4 font-semibold text-gray-700">Growth</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {enhancedModeShareData.map((mode, index) => {
                                                    const Icon = mode.icon;
                                                    const weeklyAvg = Math.round(mode.trips * 7 / 7);
                                                    const growth = Math.random() > 0.5 ? '+' : '-';
                                                    const growthValue = (Math.random() * 10).toFixed(1);

                                                    return (
                                                        <tr key={mode.mode} className="border-b border-gray-100 hover:bg-purple-50/50 transition-colors">
                                                            <td className="py-4 px-4">
                                                                <div className="flex items-center space-x-3">
                                                                    <div
                                                                        className="w-4 h-4 rounded-full shadow-sm"
                                                                        style={{ backgroundColor: mode.color }}
                                                                    ></div>
                                                                    <Icon className="w-5 h-5 text-gray-600" />
                                                                    <span className="font-semibold text-gray-800">{mode.mode}</span>
                                                                </div>
                                                            </td>
                                                            <td className="text-center py-4 px-4 font-bold text-gray-800">
                                                                {mode.trips.toLocaleString()}
                                                            </td>
                                                            <td className="text-center py-4 px-4">
                                                                <Badge variant="secondary" className="bg-gradient-to-r from-purple-100 to-purple-200 text-purple-800">
                                                                    {mode.percentage}%
                                                                </Badge>
                                                            </td>
                                                            <td className="text-center py-4 px-4 text-gray-600 font-medium">
                                                                {weeklyAvg.toLocaleString()}
                                                            </td>
                                                            <td className="text-center py-4 px-4">
                                                                <Badge variant={growth === '+' ? "default" : "destructive"} className={`${growth === '+'
                                                                        ? 'bg-green-100 text-green-700 hover:bg-green-200'
                                                                        : 'bg-red-100 text-red-700 hover:bg-red-200'
                                                                    }`}>
                                                                    {growth === '+' ? <ArrowUpIcon className="w-3 h-3 mr-1" /> : <ArrowDownIcon className="w-3 h-3 mr-1" />}
                                                                    {growthValue}%
                                                                </Badge>
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    ) : (
                        <div className="space-y-8">
                            {/* Enhanced Trip Purpose Charts */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                {/* Enhanced Bar Chart */}
                                <Card className="shadow-xl border-0 bg-gradient-to-br from-white via-orange-50/20 to-white">
                                    <CardHeader className="pb-4">
                                        <CardTitle className="flex items-center text-xl font-bold text-gray-800">
                                            <BarChart3 className="w-6 h-6 mr-3 text-orange-600" />
                                            Trips by Purpose
                                        </CardTitle>
                                        <CardDescription className="text-gray-600">
                                            Distribution of trip purposes throughout the day
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <ResponsiveContainer width="100%" height={350}>
                                            <BarChart data={enhancedTripPurposeData} layout="horizontal" margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                                <CartesianGrid strokeDasharray="3 3" stroke="#e0e7ff" />
                                                <XAxis 
                                                    type="number" 
                                                    tick={{ fill: '#6b7280', fontSize: 12 }}
                                                    axisLine={{ stroke: '#d1d5db' }}
                                                />
                                                <YAxis 
                                                    dataKey="purpose" 
                                                    type="category" 
                                                    width={80} 
                                                    tick={{ fill: '#6b7280', fontSize: 12 }}
                                                    axisLine={{ stroke: '#d1d5db' }}
                                                />
                                                <Tooltip content={<CustomTooltip />} />
                                                <Bar 
                                                    dataKey="trips" 
                                                    radius={[0, 6, 6, 0]}
                                                    stroke="#8b7cf6"
                                                    strokeWidth={1}
                                                >
                                                    {enhancedTripPurposeData.map((entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                                    ))}
                                                </Bar>
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </CardContent>
                                </Card>

                                {/* Enhanced Donut Chart */}
                                <Card className="shadow-xl border-0 bg-gradient-to-br from-white via-pink-50/20 to-white">
                                    <CardHeader className="pb-4">
                                        <CardTitle className="flex items-center text-xl font-bold text-gray-800">
                                            <Users className="w-6 h-6 mr-3 text-pink-600" />
                                            Purpose Share Distribution
                                        </CardTitle>
                                        <CardDescription className="text-gray-600">
                                            Percentage breakdown of travel purposes
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <ResponsiveContainer width="100%" height={350}>
                                            <PieChart>
                                                <Pie
                                                    data={enhancedTripPurposeData}
                                                    cx="50%"
                                                    cy="50%"
                                                    labelLine={false}
                                                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                                    outerRadius={100}
                                                    innerRadius={40}
                                                    fill="#8884d8"
                                                    dataKey="trips"
                                                    stroke="#fff"
                                                    strokeWidth={2}
                                                >
                                                    {enhancedTripPurposeData.map((entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                                    ))}
                                                </Pie>
                                                <Tooltip content={<CustomTooltip />} />
                                                <Legend 
                                                    wrapperStyle={{ paddingTop: '20px' }}
                                                    formatter={(value, entry) => (
                                                        <span className="text-gray-700 font-medium">{value}</span>
                                                    )}
                                                />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Enhanced Purpose Statistics Table */}
                            <Card className="shadow-xl border-0 bg-gradient-to-br from-white via-indigo-50/20 to-white">
                                <CardHeader className="pb-4">
                                    <CardTitle className="flex items-center text-xl font-bold text-gray-800">
                                        <MapPin className="w-6 h-6 mr-3 text-indigo-600" />
                                        Trip Purpose Statistics
                                    </CardTitle>
                                    <CardDescription className="text-gray-600">
                                        Detailed analysis of trip purposes with distance and duration metrics
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="overflow-x-auto">
                                        <table className="w-full">
                                            <thead>
                                                <tr className="border-b border-gray-200">
                                                    <th className="text-left py-4 px-4 font-semibold text-gray-700">Purpose</th>
                                                    <th className="text-center py-4 px-4 font-semibold text-gray-700">Daily Trips</th>
                                                    <th className="text-center py-4 px-4 font-semibold text-gray-700">Share</th>
                                                    <th className="text-center py-4 px-4 font-semibold text-gray-700">Avg Distance</th>
                                                    <th className="text-right py-4 px-4 font-semibold text-gray-700">Avg Duration</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {enhancedTripPurposeData.map((purpose, index) => {
                                                    const Icon = purpose.icon;

                                                    return (
                                                        <tr key={purpose.purpose} className="border-b border-gray-100 hover:bg-purple-50/50 transition-colors">
                                                            <td className="py-4 px-4">
                                                                <div className="flex items-center space-x-3">
                                                                    <div
                                                                        className="w-4 h-4 rounded-full shadow-sm"
                                                                        style={{ backgroundColor: purpose.color }}
                                                                    ></div>
                                                                    <Icon className="w-5 h-5 text-gray-600" />
                                                                    <span className="font-semibold text-gray-800">{purpose.purpose}</span>
                                                                </div>
                                                            </td>
                                                            <td className="text-center py-4 px-4 font-bold text-gray-800">
                                                                {purpose.trips.toLocaleString()}
                                                            </td>
                                                            <td className="text-center py-4 px-4">
                                                                <Badge variant="secondary" className="bg-gradient-to-r from-purple-100 to-purple-200 text-purple-800">
                                                                    {purpose.percentage}%
                                                                </Badge>
                                                            </td>
                                                            <td className="text-center py-4 px-4">
                                                                <div className="flex items-center justify-center space-x-2">
                                                                    <MapPin className="w-4 h-4 text-purple-500" />
                                                                    <span className="text-gray-700 font-medium">{purpose.avgDistance}</span>
                                                                </div>
                                                            </td>
                                                            <td className="text-right py-4 px-4">
                                                                <div className="flex items-center justify-end space-x-2">
                                                                    <Clock className="w-4 h-4 text-purple-500" />
                                                                    <span className="text-gray-700 font-medium">{purpose.avgDuration}</span>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default ModePurpose;
