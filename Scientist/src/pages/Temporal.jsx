import React, { useState, useMemo } from 'react';
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
    Clock,
    Calendar,
    TrendingUp,
    Filter,
    Sun,
    Moon,
    Activity,
    Timer,
    BarChart3,
    Grid3X3
} from 'lucide-react';

// Generate dummy heatmap data (24 hours x 7 days)
const generateHeatmapData = () => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const hours = Array.from({ length: 24 }, (_, i) => i);
    const data = [];

    days.forEach((day, dayIndex) => {
        hours.forEach(hour => {
            let intensity;
            // Simulate rush hours and weekend patterns
            if (dayIndex < 5) { // Weekdays
                if ((hour >= 7 && hour <= 9) || (hour >= 17 && hour <= 19)) {
                    intensity = Math.floor(Math.random() * 30) + 70; // Rush hours
                } else if (hour >= 10 && hour <= 16) {
                    intensity = Math.floor(Math.random() * 20) + 40; // Daytime
                } else if (hour >= 20 && hour <= 23) {
                    intensity = Math.floor(Math.random() * 15) + 25; // Evening
                } else {
                    intensity = Math.floor(Math.random() * 10) + 5; // Night/Early morning
                }
            } else { // Weekends
                if (hour >= 10 && hour <= 14) {
                    intensity = Math.floor(Math.random() * 25) + 50; // Weekend peak
                } else if (hour >= 15 && hour <= 20) {
                    intensity = Math.floor(Math.random() * 20) + 35; // Weekend evening
                } else if (hour >= 21 && hour <= 23) {
                    intensity = Math.floor(Math.random() * 15) + 30; // Weekend night
                } else {
                    intensity = Math.floor(Math.random() * 10) + 5; // Other times
                }
            }

            data.push({
                day,
                hour,
                dayIndex,
                intensity,
                trips: intensity * 10 + Math.floor(Math.random() * 100)
            });
        });
    });

    return data;
};

// Generate peak hours data
const generatePeakHoursData = () => {
    return Array.from({ length: 24 }, (_, hour) => {
        let trips;
        if ((hour >= 7 && hour <= 9) || (hour >= 17 && hour <= 19)) {
            trips = Math.floor(Math.random() * 300) + 700; // Rush hours
        } else if (hour >= 10 && hour <= 16) {
            trips = Math.floor(Math.random() * 200) + 400; // Daytime
        } else if (hour >= 20 && hour <= 23) {
            trips = Math.floor(Math.random() * 150) + 200; // Evening
        } else {
            trips = Math.floor(Math.random() * 100) + 50; // Night/Early morning
        }

        return {
            hour: `${hour.toString().padStart(2, '0')}:00`,
            hourNum: hour,
            trips,
            avgDuration: Math.floor(Math.random() * 20) + 15 // 15-35 minutes
        };
    });
};

// Generate weekday vs weekend data
const generateWeekdayWeekendData = () => {
    const hours = Array.from({ length: 24 }, (_, i) => i);
    return hours.map(hour => {
        let weekdayTrips, weekendTrips;

        if ((hour >= 7 && hour <= 9) || (hour >= 17 && hour <= 19)) {
            weekdayTrips = Math.floor(Math.random() * 300) + 600;
            weekendTrips = Math.floor(Math.random() * 150) + 200;
        } else if (hour >= 10 && hour <= 16) {
            weekdayTrips = Math.floor(Math.random() * 200) + 350;
            weekendTrips = Math.floor(Math.random() * 250) + 400;
        } else if (hour >= 20 && hour <= 23) {
            weekdayTrips = Math.floor(Math.random() * 100) + 150;
            weekendTrips = Math.floor(Math.random() * 200) + 300;
        } else {
            weekdayTrips = Math.floor(Math.random() * 80) + 40;
            weekendTrips = Math.floor(Math.random() * 60) + 30;
        }

        return {
            hour: `${hour.toString().padStart(2, '0')}:00`,
            weekday: weekdayTrips,
            weekend: weekendTrips
        };
    });
};

// Custom heatmap cell component
const HeatmapCell = ({ data, maxIntensity }) => {
    const getIntensityColor = (intensity) => {
        const ratio = intensity / maxIntensity;
        if (ratio < 0.2) return 'bg-blue-100';
        if (ratio < 0.4) return 'bg-blue-200';
        if (ratio < 0.6) return 'bg-blue-300';
        if (ratio < 0.8) return 'bg-blue-400';
        return 'bg-blue-500';
    };

    const getTextColor = (intensity) => {
        const ratio = intensity / maxIntensity;
        return ratio > 0.6 ? 'text-white' : 'text-gray-700';
    };

    return (
        <div
            className={`w-8 h-6 flex items-center justify-center text-xs font-medium rounded ${getIntensityColor(data.intensity)} ${getTextColor(data.intensity)} cursor-pointer hover:scale-110 transition-all duration-200`}
            title={`${data.day} ${data.hour}:00 - ${data.trips} trips (${data.intensity}% intensity)`}
        >
            {data.intensity}
        </div>
    );
};

// Custom tooltip component
const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
                <p className="font-medium text-gray-800 mb-1">{label}</p>
                {payload.map((entry, index) => (
                    <p key={index} style={{ color: entry.color }} className="text-sm">
                        {entry.name}: {entry.value}
                        {entry.name === 'trips' || entry.name === 'weekday' || entry.name === 'weekend' ? ' trips' : ''}
                        {entry.name === 'avgDuration' ? ' min' : ''}
                    </p>
                ))}
            </div>
        );
    }
    return null;
};

const Temporal = () => {
    const [timePeriod, setTimePeriod] = useState('7days');

    const heatmapData = useMemo(() => generateHeatmapData(), []);
    const peakHoursData = useMemo(() => generatePeakHoursData(), []);
    const weekdayWeekendData = useMemo(() => generateWeekdayWeekendData(), []);

    const maxIntensity = Math.max(...heatmapData.map(d => d.intensity));
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const hours = Array.from({ length: 24 }, (_, i) => i);

    // Get total trips for summary
    const totalTrips = peakHoursData.reduce((sum, item) => sum + item.trips, 0);
    const peakHour = peakHoursData.reduce((max, item) => item.trips > max.trips ? item : max);
    const avgDuration = Math.round(peakHoursData.reduce((sum, item) => sum + item.avgDuration, 0) / peakHoursData.length);

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex justify-between items-start mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Temporal Analysis</h1>
                    <p className="text-gray-600 mt-2">Time-based patterns and trends in transportation data</p>
                </div>

                {/* Time Period Filter */}
                <div className="flex items-center space-x-2">
                    <Filter className="w-5 h-5 text-gray-600" />
                    <select
                        value={timePeriod}
                        onChange={(e) => setTimePeriod(e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="7days">Last 7 days</option>
                        <option value="30days">Last 30 days</option>
                        <option value="custom">Custom Range</option>
                    </select>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-white rounded-xl shadow-md border p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Total Daily Trips</p>
                            <p className="text-2xl font-bold text-gray-900">{totalTrips.toLocaleString()}</p>
                        </div>
                        <div className="p-2 bg-blue-100 rounded-lg">
                            <Activity className="w-6 h-6 text-blue-600" />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-md border p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Peak Hour</p>
                            <p className="text-2xl font-bold text-gray-900">{peakHour.hour}</p>
                            <p className="text-xs text-gray-500">{peakHour.trips} trips</p>
                        </div>
                        <div className="p-2 bg-green-100 rounded-lg">
                            <TrendingUp className="w-6 h-6 text-green-600" />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-md border p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Avg Trip Duration</p>
                            <p className="text-2xl font-bold text-gray-900">{avgDuration} min</p>
                        </div>
                        <div className="p-2 bg-orange-100 rounded-lg">
                            <Timer className="w-6 h-6 text-orange-600" />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-md border p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Rush Hour Impact</p>
                            <p className="text-2xl font-bold text-gray-900">+285%</p>
                        </div>
                        <div className="p-2 bg-red-100 rounded-lg">
                            <Clock className="w-6 h-6 text-red-600" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Row 1: Heatmap + Peak Hours Chart */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                {/* Hourly-Weekly Heatmap */}
                <div className="bg-white rounded-2xl shadow-md border p-6">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                        <Grid3X3 className="w-5 h-5 mr-2 text-purple-600" />
                        Trip Intensity Heatmap
                    </h2>
                    <div className="overflow-x-auto">
                        <div className="min-w-fit">
                            {/* Hour labels */}
                            <div className="flex mb-2">
                                <div className="w-12"></div>
                                {hours.map(hour => (
                                    <div key={hour} className="w-8 text-center text-xs text-gray-600 font-medium">
                                        {hour % 4 === 0 ? `${hour}h` : ''}
                                    </div>
                                ))}
                            </div>

                            {/* Heatmap grid */}
                            {days.map((day, dayIndex) => (
                                <div key={day} className="flex items-center mb-1">
                                    <div className="w-12 text-xs font-medium text-gray-700 pr-2">{day}</div>
                                    {hours.map(hour => {
                                        const cellData = heatmapData.find(d => d.day === day && d.hour === hour);
                                        return (
                                            <div key={`${day}-${hour}`} className="mr-1">
                                                <HeatmapCell data={cellData} maxIntensity={maxIntensity} />
                                            </div>
                                        );
                                    })}
                                </div>
                            ))}

                            {/* Legend */}
                            <div className="flex items-center justify-center mt-4 space-x-4 text-xs">
                                <span className="text-gray-600">Low</span>
                                <div className="flex space-x-1">
                                    <div className="w-4 h-4 bg-blue-100 rounded"></div>
                                    <div className="w-4 h-4 bg-blue-200 rounded"></div>
                                    <div className="w-4 h-4 bg-blue-300 rounded"></div>
                                    <div className="w-4 h-4 bg-blue-400 rounded"></div>
                                    <div className="w-4 h-4 bg-blue-500 rounded"></div>
                                </div>
                                <span className="text-gray-600">High</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Peak Hours Line Chart */}
                <div className="bg-white rounded-2xl shadow-md border p-6">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                        <TrendingUp className="w-5 h-5 mr-2 text-green-600" />
                        Daily Peak Hours
                    </h2>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={peakHoursData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis
                                    dataKey="hour"
                                    interval={3}
                                    angle={-45}
                                    textAnchor="end"
                                    height={60}
                                />
                                <YAxis />
                                <Tooltip content={<CustomTooltip />} />
                                <Line
                                    type="monotone"
                                    dataKey="trips"
                                    stroke="#10B981"
                                    strokeWidth={3}
                                    dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }}
                                    activeDot={{ r: 6, fill: '#10B981' }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Row 2: Weekday vs Weekend + Trip Duration */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                {/* Weekday vs Weekend Comparison */}
                <div className="bg-white rounded-2xl shadow-md border p-6">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                        <Calendar className="w-5 h-5 mr-2 text-blue-600" />
                        Weekday vs Weekend Patterns
                    </h2>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={weekdayWeekendData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis
                                    dataKey="hour"
                                    interval={3}
                                    angle={-45}
                                    textAnchor="end"
                                    height={60}
                                />
                                <YAxis />
                                <Tooltip content={<CustomTooltip />} />
                                <Legend />
                                <Bar dataKey="weekday" fill="#3B82F6" name="Weekday" radius={[2, 2, 0, 0]} />
                                <Bar dataKey="weekend" fill="#F59E0B" name="Weekend" radius={[2, 2, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Average Trip Duration per Time Slot */}
                <div className="bg-white rounded-2xl shadow-md border p-6">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                        <Timer className="w-5 h-5 mr-2 text-orange-600" />
                        Average Trip Duration
                    </h2>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={peakHoursData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis
                                    dataKey="hour"
                                    interval={3}
                                    angle={-45}
                                    textAnchor="end"
                                    height={60}
                                />
                                <YAxis />
                                <Tooltip content={<CustomTooltip />} />
                                <Bar
                                    dataKey="avgDuration"
                                    fill="#F97316"
                                    name="avgDuration"
                                    radius={[4, 4, 0, 0]}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Insights Panel */}
            <div className="bg-white rounded-2xl shadow-md border p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                    <BarChart3 className="w-5 h-5 mr-2 text-purple-600" />
                    Key Temporal Insights
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="p-4 bg-blue-50 rounded-lg">
                        <div className="flex items-center mb-2">
                            <Sun className="w-5 h-5 text-blue-600 mr-2" />
                            <h3 className="font-semibold text-blue-800">Morning Rush</h3>
                        </div>
                        <p className="text-sm text-blue-700">
                            Peak traffic occurs between 8-9 AM with an average of {Math.max(...peakHoursData.slice(8, 10).map(h => h.trips))} trips per hour.
                        </p>
                    </div>

                    <div className="p-4 bg-green-50 rounded-lg">
                        <div className="flex items-center mb-2">
                            <Moon className="w-5 h-5 text-green-600 mr-2" />
                            <h3 className="font-semibold text-green-800">Evening Peak</h3>
                        </div>
                        <p className="text-sm text-green-700">
                            Evening rush from 5-7 PM shows sustained high activity with longer trip durations.
                        </p>
                    </div>

                    <div className="p-4 bg-orange-50 rounded-lg">
                        <div className="flex items-center mb-2">
                            <Calendar className="w-5 h-5 text-orange-600 mr-2" />
                            <h3 className="font-semibold text-orange-800">Weekend Pattern</h3>
                        </div>
                        <p className="text-sm text-orange-700">
                            Weekend traffic peaks later (10 AM-2 PM) with more leisure-oriented travel patterns.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Temporal;
