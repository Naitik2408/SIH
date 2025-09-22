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
    AlertTriangle,
    AlertCircle,
    CheckCircle,
    XCircle,
    Bell,
    TrendingUp,
    Database,
    Wifi,
    MapPin,
    Clock,
    Filter,
    Eye,
    EyeOff,
    ArrowUp,
    ArrowDown,
    Activity,
    Zap,
    Shield,
    Target,
    Calendar,
    Users,
    BarChart3
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

// Enhanced alert categories with gradients
const alertCategories = [
    { 
        id: 'data_quality', 
        label: 'Data Quality', 
        color: 'bg-blue-100 text-blue-600', 
        gradient: 'from-blue-500 to-blue-600',
        icon: Database 
    },
    { 
        id: 'anomalies', 
        label: 'Anomalies', 
        color: 'bg-yellow-100 text-yellow-600', 
        gradient: 'from-yellow-500 to-yellow-600',
        icon: TrendingUp 
    },
    { 
        id: 'system_alerts', 
        label: 'System Alerts', 
        color: 'bg-red-100 text-red-600', 
        gradient: 'from-red-500 to-red-600',
        icon: Shield 
    }
];

// Enhanced severity levels with better visibility
const severityLevels = [
    { 
        id: 'critical', 
        label: 'Critical', 
        color: 'bg-red-500 text-white', 
        gradient: 'from-red-500 to-red-600',
        textColor: 'text-red-600',
        bgColor: 'bg-red-100'
    },
    { 
        id: 'high', 
        label: 'High', 
        color: 'bg-orange-500 text-white', 
        gradient: 'from-orange-500 to-orange-600',
        textColor: 'text-orange-600',
        bgColor: 'bg-orange-100'
    },
    { 
        id: 'medium', 
        label: 'Medium', 
        color: 'bg-yellow-500 text-white', 
        gradient: 'from-yellow-500 to-yellow-600',
        textColor: 'text-yellow-600',
        bgColor: 'bg-yellow-100'
    },
    { 
        id: 'low', 
        label: 'Low', 
        color: 'bg-green-500 text-white', 
        gradient: 'from-green-500 to-green-600',
        textColor: 'text-green-600',
        bgColor: 'bg-green-100'
    }
];

// Enhanced status options with better styling
const statusOptions = [
    { 
        id: 'active', 
        label: 'Active', 
        color: 'bg-red-100 text-red-600', 
        gradient: 'from-red-500 to-red-600',
        icon: AlertCircle 
    },
    { 
        id: 'reviewing', 
        label: 'Under Review', 
        color: 'bg-yellow-100 text-yellow-600', 
        gradient: 'from-yellow-500 to-yellow-600',
        icon: Eye 
    },
    { 
        id: 'resolved', 
        label: 'Resolved', 
        color: 'bg-green-100 text-green-600', 
        gradient: 'from-green-500 to-green-600',
        icon: CheckCircle 
    },
    { 
        id: 'dismissed', 
        label: 'Dismissed', 
        color: 'bg-gray-100 text-gray-600', 
        gradient: 'from-gray-500 to-gray-600',
        icon: XCircle 
    }
];

// Sample alerts data
const alertsData = [
    {
        id: 1,
        date: '2025-09-21 14:30',
        category: 'anomalies',
        severity: 'high',
        title: 'Spike in bus trips in Zone A',
        description: 'Unusual 300% increase in bus ridership detected in Zone A during Monday afternoon',
        status: 'active',
        affectedRoutes: ['Route 45', 'Route 67'],
        details: {
            metric: 'Bus Ridership',
            baseline: 1200,
            current: 3600,
            increase: 200,
            timeframe: '2PM - 4PM Monday'
        }
    },
    {
        id: 2,
        date: '2025-09-21 11:15',
        category: 'data_quality',
        severity: 'medium',
        title: 'GPS accuracy degraded',
        description: 'GPS positioning errors increased by 15% for metro line tracking',
        status: 'reviewing',
        affectedRoutes: ['Blue Line', 'Yellow Line'],
        details: {
            metric: 'GPS Accuracy',
            baseline: '95%',
            current: '80%',
            decrease: 15,
            timeframe: 'Last 4 hours'
        }
    },
    {
        id: 3,
        date: '2025-09-21 09:45',
        category: 'system_alerts',
        severity: 'critical',
        title: 'API Response Time Critical',
        description: 'Real-time data API response times exceeding 5 seconds threshold',
        status: 'active',
        affectedRoutes: ['All Routes'],
        details: {
            metric: 'API Response Time',
            baseline: '1.2s',
            current: '6.8s',
            increase: 467,
            timeframe: 'Last 30 minutes'
        }
    },
    {
        id: 4,
        date: '2025-09-21 08:20',
        category: 'anomalies',
        severity: 'low',
        title: 'Unusual weekend metro usage',
        description: 'Metro ridership 25% higher than typical Sunday patterns',
        status: 'resolved',
        affectedRoutes: ['Green Line'],
        details: {
            metric: 'Metro Ridership',
            baseline: 8000,
            current: 10000,
            increase: 25,
            timeframe: 'Sunday 8AM-10AM'
        }
    },
    {
        id: 5,
        date: '2025-09-20 16:45',
        category: 'data_quality',
        severity: 'high',
        title: 'Missing trip data detected',
        description: '12% of trip records missing required destination information',
        status: 'reviewing',
        affectedRoutes: ['Multiple Routes'],
        details: {
            metric: 'Data Completeness',
            baseline: '98%',
            current: '88%',
            decrease: 12,
            timeframe: 'Last 24 hours'
        }
    },
    {
        id: 6,
        date: '2025-09-20 14:30',
        category: 'system_alerts',
        severity: 'medium',
        title: 'Database connection timeout',
        description: 'Multiple database connection timeouts detected in analytics module',
        status: 'dismissed',
        affectedRoutes: ['N/A'],
        details: {
            metric: 'DB Connection Success',
            baseline: '99.9%',
            current: '96.2%',
            decrease: 3.7,
            timeframe: 'Yesterday afternoon'
        }
    }
];

// Data quality metrics
const dataQualityMetrics = {
    overview: {
        totalRecords: 1500000,
        validRecords: 1365000,
        missingValues: 135000,
        outliers: 75000,
        duplicates: 15000
    },
    completeness: [
        { field: 'Valid Data', value: 91, color: '#10B981' },
        { field: 'Missing Values', value: 9, color: '#EF4444' }
    ],
    errorsByCategory: [
        { category: 'GPS Errors', count: 45000, percentage: 3.0, color: '#3B82F6' },
        { category: 'Missing Origin', count: 35000, percentage: 2.3, color: '#F59E0B' },
        { category: 'Missing Destination', count: 30000, percentage: 2.0, color: '#8B5CF6' },
        { category: 'Invalid Timestamps', count: 15000, percentage: 1.0, color: '#EF4444' },
        { category: 'Duplicate Records', count: 10000, percentage: 0.7, color: '#6B7280' }
    ],
    qualityTrend: [
        { date: 'Sep 15', quality: 88.5, errors: 172 },
        { date: 'Sep 16', quality: 90.2, errors: 147 },
        { date: 'Sep 17', quality: 89.8, errors: 153 },
        { date: 'Sep 18', quality: 91.5, errors: 128 },
        { date: 'Sep 19', quality: 90.8, errors: 138 },
        { date: 'Sep 20', quality: 92.1, errors: 118 },
        { date: 'Sep 21', quality: 91.0, errors: 135 }
    ]
};

// Enhanced custom tooltip component
const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <Card className="border border-gray-200 shadow-xl backdrop-blur-sm bg-white/95">
                <CardContent className="p-3">
                    <p className="font-semibold text-gray-800 mb-2">{label}</p>
                    {payload.map((entry, index) => (
                        <div key={index} className="flex items-center space-x-2">
                            <div
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: entry.color }}
                            ></div>
                            <span className="text-sm text-gray-600">{entry.name}:</span>
                            <span className="text-sm font-semibold text-gray-800">
                                {entry.value}
                                {entry.name.includes('quality') && '%'}
                                {entry.name.includes('errors') && ' errors'}
                            </span>
                        </div>
                    ))}
                </CardContent>
            </Card>
        );
    }
    return null;
};

const Alerts = () => {
    const [activeTab, setActiveTab] = useState('alerts');
    const [alerts, setAlerts] = useState(alertsData);
    const [selectedSeverity, setSelectedSeverity] = useState('all');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [selectedStatus, setSelectedStatus] = useState('all');
    const [sortField, setSortField] = useState('date');
    const [sortDirection, setSortDirection] = useState('desc');

    // Filter alerts based on selected filters
    const filteredAlerts = alerts.filter(alert => {
        if (selectedSeverity !== 'all' && alert.severity !== selectedSeverity) return false;
        if (selectedCategory !== 'all' && alert.category !== selectedCategory) return false;
        if (selectedStatus !== 'all' && alert.status !== selectedStatus) return false;
        return true;
    });

    // Sort alerts
    const sortedAlerts = [...filteredAlerts].sort((a, b) => {
        let aValue = a[sortField];
        let bValue = b[sortField];

        if (sortField === 'date') {
            aValue = new Date(aValue);
            bValue = new Date(bValue);
        }

        if (sortDirection === 'asc') {
            return aValue > bValue ? 1 : -1;
        } else {
            return aValue < bValue ? 1 : -1;
        }
    });

    // Handle sort
    const handleSort = (field) => {
        if (sortField === field) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortDirection('desc');
        }
    };

    // Handle status change
    const handleStatusChange = (alertId, newStatus) => {
        setAlerts(prevAlerts =>
            prevAlerts.map(alert =>
                alert.id === alertId ? { ...alert, status: newStatus } : alert
            )
        );
    };

    // Get severity info
    const getSeverityInfo = (severity) => {
        return severityLevels.find(s => s.id === severity);
    };

    // Get category info
    const getCategoryInfo = (category) => {
        return alertCategories.find(c => c.id === category);
    };

    // Get status info
    const getStatusInfo = (status) => {
        return statusOptions.find(s => s.id === status);
    };

    // Calculate alert summary stats
    const alertStats = {
        total: alerts.length,
        active: alerts.filter(a => a.status === 'active').length,
        critical: alerts.filter(a => a.severity === 'critical').length,
        resolved: alerts.filter(a => a.status === 'resolved').length
    };

    return (
        <div className="p-6 space-y-8 bg-gradient-to-br from-purple-50/30 via-white to-blue-50/30 min-h-screen">
            {/* Enhanced Header */}
            <div className="mb-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 via-purple-700 to-blue-600 bg-clip-text text-transparent">
                            Alerts & Data Quality
                        </h1>
                        <p className="text-gray-600 mt-2 text-lg">Monitor system alerts and data quality metrics in real-time</p>
                    </div>
                    <div className="flex space-x-3">
                        <Button variant="outline" className="border-purple-200 text-purple-700 hover:bg-purple-50">
                            <Bell className="w-4 h-4 mr-2" />
                            Configure Alerts
                        </Button>
                        <Button className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800">
                            <Activity className="w-4 h-4 mr-2" />
                            Live Monitor
                        </Button>
                    </div>
                </div>
            </div>

            {/* Enhanced Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <Card className="relative overflow-hidden group hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-white via-blue-50/30 to-white">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-blue-600 opacity-5 group-hover:opacity-10 transition-opacity duration-300"></div>
                    <CardContent className="p-6 relative z-10">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Total Alerts</p>
                                <p className="text-3xl font-bold text-gray-900 tracking-tight">{alertStats.total}</p>
                            </div>
                            <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg">
                                <Bell className="w-6 h-6 text-white" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="relative overflow-hidden group hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-white via-red-50/30 to-white">
                    <div className="absolute inset-0 bg-gradient-to-br from-red-500 to-red-600 opacity-5 group-hover:opacity-10 transition-opacity duration-300"></div>
                    <CardContent className="p-6 relative z-10">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Active Alerts</p>
                                <p className="text-3xl font-bold text-red-600 tracking-tight">{alertStats.active}</p>
                            </div>
                            <div className="p-3 rounded-xl bg-gradient-to-br from-red-500 to-red-600 shadow-lg">
                                <AlertCircle className="w-6 h-6 text-white" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="relative overflow-hidden group hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-white via-orange-50/30 to-white">
                    <div className="absolute inset-0 bg-gradient-to-br from-orange-500 to-orange-600 opacity-5 group-hover:opacity-10 transition-opacity duration-300"></div>
                    <CardContent className="p-6 relative z-10">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Critical Issues</p>
                                <p className="text-3xl font-bold text-orange-600 tracking-tight">{alertStats.critical}</p>
                            </div>
                            <div className="p-3 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 shadow-lg">
                                <AlertTriangle className="w-6 h-6 text-white" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="relative overflow-hidden group hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-white via-green-50/30 to-white">
                    <div className="absolute inset-0 bg-gradient-to-br from-green-500 to-green-600 opacity-5 group-hover:opacity-10 transition-opacity duration-300"></div>
                    <CardContent className="p-6 relative z-10">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Resolved Today</p>
                                <p className="text-3xl font-bold text-green-600 tracking-tight">{alertStats.resolved}</p>
                            </div>
                            <div className="p-3 rounded-xl bg-gradient-to-br from-green-500 to-green-600 shadow-lg">
                                <CheckCircle className="w-6 h-6 text-white" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Enhanced Tab Navigation */}
            <Card className="shadow-xl border-0 bg-gradient-to-br from-white via-purple-50/10 to-white">
                <CardHeader className="border-b border-gray-200 pb-4">
                    <nav className="flex space-x-8">
                        <Button
                            variant={activeTab === 'alerts' ? 'default' : 'ghost'}
                            onClick={() => setActiveTab('alerts')}
                            className={`h-auto py-4 px-6 ${
                                activeTab === 'alerts'
                                    ? 'bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white shadow-lg'
                                    : 'text-gray-500 hover:text-gray-700 hover:bg-purple-50'
                            }`}
                        >
                            <div className="flex items-center">
                                <AlertTriangle className="w-5 h-5 mr-2" />
                                <span className="font-medium">
                                    Alerts ({filteredAlerts.length})
                                </span>
                            </div>
                        </Button>
                        <Button
                            variant={activeTab === 'data_quality' ? 'default' : 'ghost'}
                            onClick={() => setActiveTab('data_quality')}
                            className={`h-auto py-4 px-6 ${
                                activeTab === 'data_quality'
                                    ? 'bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white shadow-lg'
                                    : 'text-gray-500 hover:text-gray-700 hover:bg-purple-50'
                            }`}
                        >
                            <div className="flex items-center">
                                <Database className="w-5 h-5 mr-2" />
                                <span className="font-medium">Data Quality</span>
                            </div>
                        </Button>
                    </nav>
                </CardHeader>
                
                <CardContent className="p-6">
                    {/* Alerts Tab */}
                    {activeTab === 'alerts' && (
                        <div className="space-y-6">
                            {/* Enhanced Filters */}
                            <Card className="border border-purple-200 bg-gradient-to-r from-purple-50/50 to-blue-50/50">
                                <CardContent className="p-4">
                                    <div className="flex flex-wrap gap-4 items-center">
                                        <div className="flex items-center space-x-2">
                                            <div className="p-2 rounded-lg bg-gradient-to-r from-purple-500 to-purple-600 text-white">
                                                <Filter className="w-4 h-4" />
                                            </div>
                                            <span className="text-sm font-semibold text-gray-700">Advanced Filters:</span>
                                        </div>

                                        <div className="flex items-center space-x-2">
                                            <label className="text-xs font-medium text-gray-600">Severity:</label>
                                            <select
                                                value={selectedSeverity}
                                                onChange={(e) => setSelectedSeverity(e.target.value)}
                                                className="px-3 py-2 border-2 border-purple-200 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white shadow-sm font-medium"
                                            >
                                                <option value="all">All Severities</option>
                                                {severityLevels.map(level => (
                                                    <option key={level.id} value={level.id}>{level.label}</option>
                                                ))}
                                            </select>
                                        </div>

                                        <div className="flex items-center space-x-2">
                                            <label className="text-xs font-medium text-gray-600">Category:</label>
                                            <select
                                                value={selectedCategory}
                                                onChange={(e) => setSelectedCategory(e.target.value)}
                                                className="px-3 py-2 border-2 border-purple-200 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white shadow-sm font-medium"
                                            >
                                                <option value="all">All Categories</option>
                                                {alertCategories.map(category => (
                                                    <option key={category.id} value={category.id}>{category.label}</option>
                                                ))}
                                            </select>
                                        </div>

                                        <div className="flex items-center space-x-2">
                                            <label className="text-xs font-medium text-gray-600">Status:</label>
                                            <select
                                                value={selectedStatus}
                                                onChange={(e) => setSelectedStatus(e.target.value)}
                                                className="px-3 py-2 border-2 border-purple-200 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white shadow-sm font-medium"
                                            >
                                                <option value="all">All Statuses</option>
                                                {statusOptions.map(status => (
                                                    <option key={status.id} value={status.id}>{status.label}</option>
                                                ))}
                                            </select>
                                        </div>

                                        <div className="flex space-x-2 ml-auto">
                                            <Badge variant="outline" className="bg-white border-purple-300 text-purple-700">
                                                {filteredAlerts.length} results
                                            </Badge>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Enhanced Alerts Table */}
                            <Card className="border-0 shadow-lg bg-white">
                                <CardContent className="p-0">
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-sm">
                                            <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                                                <tr className="border-b border-gray-200">
                                                    <th
                                                        className="text-left py-4 px-6 font-semibold text-gray-700 cursor-pointer hover:bg-purple-50 transition-colors"
                                                        onClick={() => handleSort('date')}
                                                    >
                                                        <div className="flex items-center">
                                                            <Clock className="w-4 h-4 mr-2 text-purple-600" />
                                                            Date & Time
                                                            {sortField === 'date' && (
                                                                sortDirection === 'asc' ? 
                                                                <ArrowUp className="w-4 h-4 ml-2 text-purple-600" /> : 
                                                                <ArrowDown className="w-4 h-4 ml-2 text-purple-600" />
                                                            )}
                                                        </div>
                                                    </th>
                                                    <th
                                                        className="text-left py-4 px-6 font-semibold text-gray-700 cursor-pointer hover:bg-purple-50 transition-colors"
                                                        onClick={() => handleSort('severity')}
                                                    >
                                                        <div className="flex items-center">
                                                            <AlertTriangle className="w-4 h-4 mr-2 text-orange-600" />
                                                            Severity
                                                            {sortField === 'severity' && (
                                                                sortDirection === 'asc' ? 
                                                                <ArrowUp className="w-4 h-4 ml-2 text-purple-600" /> : 
                                                                <ArrowDown className="w-4 h-4 ml-2 text-purple-600" />
                                                            )}
                                                        </div>
                                                    </th>
                                                    <th className="text-left py-4 px-6 font-semibold text-gray-700">
                                                        <div className="flex items-center">
                                                            <Shield className="w-4 h-4 mr-2 text-blue-600" />
                                                            Category
                                                        </div>
                                                    </th>
                                                    <th className="text-left py-4 px-6 font-semibold text-gray-700">
                                                        <div className="flex items-center">
                                                            <Activity className="w-4 h-4 mr-2 text-green-600" />
                                                            Description
                                                        </div>
                                                    </th>
                                                    <th className="text-left py-4 px-6 font-semibold text-gray-700">
                                                        <div className="flex items-center">
                                                            <Eye className="w-4 h-4 mr-2 text-indigo-600" />
                                                            Status
                                                        </div>
                                                    </th>
                                                    <th className="text-left py-4 px-6 font-semibold text-gray-700">
                                                        <div className="flex items-center">
                                                            <Zap className="w-4 h-4 mr-2 text-yellow-600" />
                                                            Actions
                                                        </div>
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {sortedAlerts.map((alert) => {
                                                    const severityInfo = getSeverityInfo(alert.severity);
                                                    const categoryInfo = getCategoryInfo(alert.category);
                                                    const statusInfo = getStatusInfo(alert.status);
                                                    const CategoryIcon = categoryInfo.icon;
                                                    const StatusIcon = statusInfo.icon;

                                                    return (
                                                        <tr key={alert.id} className="border-b border-gray-100 hover:bg-gradient-to-r hover:from-purple-50/30 hover:to-blue-50/30 transition-all duration-200">
                                                            <td className="py-4 px-6">
                                                                <div>
                                                                    <p className="font-semibold text-gray-800">
                                                                        {new Date(alert.date).toLocaleDateString()}
                                                                    </p>
                                                                    <p className="text-xs text-gray-500 flex items-center">
                                                                        <Clock className="w-3 h-3 mr-1" />
                                                                        {new Date(alert.date).toLocaleTimeString()}
                                                                    </p>
                                                                </div>
                                                            </td>
                                                            <td className="py-4 px-6">
                                                                <Badge className={`px-3 py-1 rounded-full text-xs font-semibold ${severityInfo.color} shadow-sm`}>
                                                                    {severityInfo.label}
                                                                </Badge>
                                                            </td>
                                                            <td className="py-4 px-6">
                                                                <div className="flex items-center">
                                                                    <div className={`p-2 rounded-lg bg-gradient-to-r ${categoryInfo.gradient} text-white mr-3 shadow-sm`}>
                                                                        <CategoryIcon className="w-4 h-4" />
                                                                    </div>
                                                                    <span className="text-gray-700 font-medium">{categoryInfo.label}</span>
                                                                </div>
                                                            </td>
                                                            <td className="py-4 px-6">
                                                                <div>
                                                                    <p className="font-semibold text-gray-800">{alert.title}</p>
                                                                    <p className="text-sm text-gray-600 mt-1">{alert.description}</p>
                                                                    {alert.affectedRoutes.length > 0 && (
                                                                        <div className="mt-2 flex flex-wrap gap-1">
                                                                            {alert.affectedRoutes.map((route, index) => (
                                                                                <Badge key={index} variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-300">
                                                                                    {route}
                                                                                </Badge>
                                                                            ))}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </td>
                                                            <td className="py-4 px-6">
                                                                <div className="flex items-center">
                                                                    <div className={`p-1 rounded-lg bg-gradient-to-r ${statusInfo.gradient} text-white mr-2 shadow-sm`}>
                                                                        <StatusIcon className="w-4 h-4" />
                                                                    </div>
                                                                    <Badge variant="outline" className={`${statusInfo.color} border-2 font-medium`}>
                                                                        {statusInfo.label}
                                                                    </Badge>
                                                                </div>
                                                            </td>
                                                            <td className="py-4 px-6">
                                                                <select
                                                                    value={alert.status}
                                                                    onChange={(e) => handleStatusChange(alert.id, e.target.value)}
                                                                    className="px-3 py-2 border-2 border-purple-200 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white shadow-sm font-medium hover:border-purple-300 transition-colors"
                                                                >
                                                                    {statusOptions.map(status => (
                                                                        <option key={status.id} value={status.id}>
                                                                            {status.label}
                                                                        </option>
                                                                    ))}
                                                                </select>
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Enhanced No alerts message */}
                            {sortedAlerts.length === 0 && (
                                <Card className="border-0 bg-gradient-to-br from-green-50 to-green-100">
                                    <CardContent className="text-center py-12">
                                        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                                        <h3 className="text-lg font-semibold text-green-800 mb-2">All Clear!</h3>
                                        <p className="text-green-600">No alerts match the selected filters</p>
                                        <Button variant="outline" className="mt-4 border-green-300 text-green-700 hover:bg-green-50">
                                            Reset Filters
                                        </Button>
                                    </CardContent>
                                </Card>
                            )}
                        </div>
                    )}

                    {/* Enhanced Data Quality Tab */}
                    {activeTab === 'data_quality' && (
                        <div className="space-y-6">
                            {/* Enhanced Data Quality Overview */}
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                <Card className="relative overflow-hidden group hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-white via-blue-50/30 to-white">
                                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-blue-600 opacity-5 group-hover:opacity-10 transition-opacity duration-300"></div>
                                    <CardContent className="p-6 relative z-10">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm font-medium text-blue-600">Data Completeness</p>
                                                <p className="text-3xl font-bold text-blue-700 tracking-tight">91%</p>
                                            </div>
                                            <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg">
                                                <Database className="w-8 h-8 text-white" />
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card className="relative overflow-hidden group hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-white via-yellow-50/30 to-white">
                                    <div className="absolute inset-0 bg-gradient-to-br from-yellow-500 to-yellow-600 opacity-5 group-hover:opacity-10 transition-opacity duration-300"></div>
                                    <CardContent className="p-6 relative z-10">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm font-medium text-yellow-600">GPS Errors</p>
                                                <p className="text-3xl font-bold text-yellow-700 tracking-tight">3.0%</p>
                                            </div>
                                            <div className="p-3 rounded-xl bg-gradient-to-br from-yellow-500 to-yellow-600 shadow-lg">
                                                <MapPin className="w-8 h-8 text-white" />
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card className="relative overflow-hidden group hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-white via-red-50/30 to-white">
                                    <div className="absolute inset-0 bg-gradient-to-br from-red-500 to-red-600 opacity-5 group-hover:opacity-10 transition-opacity duration-300"></div>
                                    <CardContent className="p-6 relative z-10">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm font-medium text-red-600">Outliers Detected</p>
                                                <p className="text-3xl font-bold text-red-700 tracking-tight">5.0%</p>
                                            </div>
                                            <div className="p-3 rounded-xl bg-gradient-to-br from-red-500 to-red-600 shadow-lg">
                                                <Target className="w-8 h-8 text-white" />
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card className="relative overflow-hidden group hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-white via-green-50/30 to-white">
                                    <div className="absolute inset-0 bg-gradient-to-br from-green-500 to-green-600 opacity-5 group-hover:opacity-10 transition-opacity duration-300"></div>
                                    <CardContent className="p-6 relative z-10">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm font-medium text-green-600">Overall Quality</p>
                                                <p className="text-3xl font-bold text-green-700 tracking-tight">91%</p>
                                            </div>
                                            <div className="p-3 rounded-xl bg-gradient-to-br from-green-500 to-green-600 shadow-lg">
                                                <Activity className="w-8 h-8 text-white" />
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Enhanced Charts Row */}
                            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                                {/* Enhanced Data Completeness Pie Chart */}
                                <Card className="shadow-xl border-0 bg-gradient-to-br from-white via-green-50/20 to-white">
                                    <CardHeader className="pb-4">
                                        <CardTitle className="text-xl flex items-center">
                                            <BarChart3 className="w-6 h-6 mr-3 text-green-600" />
                                            Data Completeness
                                        </CardTitle>
                                        <CardDescription>
                                            Overall data quality and completeness metrics
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="h-80">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <PieChart>
                                                    <Pie
                                                        data={dataQualityMetrics.completeness}
                                                        cx="50%"
                                                        cy="50%"
                                                        outerRadius={100}
                                                        innerRadius={40}
                                                        dataKey="value"
                                                        label={({ field, value }) => `${field}: ${value}%`}
                                                        stroke="#fff"
                                                        strokeWidth={2}
                                                    >
                                                        {dataQualityMetrics.completeness.map((entry, index) => (
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
                                        </div>
                                        <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                                            <Card className="border-0 bg-gradient-to-r from-green-50 to-green-100">
                                                <CardContent className="p-3">
                                                    <p className="font-semibold text-green-800">Valid Records</p>
                                                    <p className="text-green-600 font-bold">{dataQualityMetrics.overview.validRecords.toLocaleString()}</p>
                                                </CardContent>
                                            </Card>
                                            <Card className="border-0 bg-gradient-to-r from-red-50 to-red-100">
                                                <CardContent className="p-3">
                                                    <p className="font-semibold text-red-800">Missing Values</p>
                                                    <p className="text-red-600 font-bold">{dataQualityMetrics.overview.missingValues.toLocaleString()}</p>
                                                </CardContent>
                                            </Card>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Enhanced Errors by Category Bar Chart */}
                                <Card className="shadow-xl border-0 bg-gradient-to-br from-white via-orange-50/20 to-white">
                                    <CardHeader className="pb-4">
                                        <CardTitle className="text-xl flex items-center">
                                            <AlertTriangle className="w-6 h-6 mr-3 text-orange-600" />
                                            Errors by Category
                                        </CardTitle>
                                        <CardDescription>
                                            Breakdown of data quality issues by error type
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="h-80">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <BarChart data={dataQualityMetrics.errorsByCategory} margin={{ top: 20, right: 30, left: 20, bottom: 80 }}>
                                                    <CartesianGrid strokeDasharray="3 3" stroke="#e0e7ff" />
                                                    <XAxis
                                                        dataKey="category"
                                                        angle={-45}
                                                        textAnchor="end"
                                                        height={80}
                                                        tick={{ fontSize: 12, fill: '#6b7280' }}
                                                        axisLine={{ stroke: '#d1d5db' }}
                                                    />
                                                    <YAxis 
                                                        tick={{ fontSize: 12, fill: '#6b7280' }}
                                                        axisLine={{ stroke: '#d1d5db' }}
                                                    />
                                                    <Tooltip
                                                        content={({ active, payload, label }) => {
                                                            if (active && payload && payload.length) {
                                                                const data = payload[0].payload;
                                                                return (
                                                                    <Card className="border border-gray-200 shadow-xl backdrop-blur-sm bg-white/95">
                                                                        <CardContent className="p-3">
                                                                            <p className="font-semibold text-gray-800 mb-2">{label}</p>
                                                                            <div className="space-y-1">
                                                                                <p className="text-sm text-gray-600">Count: <span className="font-semibold">{data.count.toLocaleString()}</span></p>
                                                                                <p className="text-sm text-gray-600">Percentage: <span className="font-semibold">{data.percentage}%</span></p>
                                                                            </div>
                                                                        </CardContent>
                                                                    </Card>
                                                                );
                                                            }
                                                            return null;
                                                        }}
                                                    />
                                                    <Bar dataKey="count" radius={[6, 6, 0, 0]} stroke="#8b7cf6" strokeWidth={1}>
                                                        {dataQualityMetrics.errorsByCategory.map((entry, index) => (
                                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                                        ))}
                                                    </Bar>
                                                </BarChart>
                                            </ResponsiveContainer>
                                        </div>
                                        <div className="mt-4 text-center">
                                            <Badge variant="outline" className="bg-orange-100 text-orange-700 border-orange-300 text-sm px-3 py-1">
                                                Total Error Records: {dataQualityMetrics.errorsByCategory.reduce((sum, item) => sum + item.count, 0).toLocaleString()}
                                            </Badge>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Enhanced Quality Trend Line Chart */}
                            <Card className="shadow-xl border-0 bg-gradient-to-br from-white via-purple-50/20 to-white">
                                <CardHeader className="pb-4">
                                    <CardTitle className="text-xl flex items-center">
                                        <TrendingUp className="w-6 h-6 mr-3 text-purple-600" />
                                        Data Quality Trend (Last 7 Days)
                                    </CardTitle>
                                    <CardDescription>
                                        Historical data quality metrics and error trends
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="h-80">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <LineChart data={dataQualityMetrics.qualityTrend} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                                <CartesianGrid strokeDasharray="3 3" stroke="#e0e7ff" />
                                                <XAxis 
                                                    dataKey="date" 
                                                    tick={{ fontSize: 12, fill: '#6b7280' }}
                                                    axisLine={{ stroke: '#d1d5db' }}
                                                />
                                                <YAxis 
                                                    yAxisId="quality" 
                                                    orientation="left" 
                                                    domain={[85, 95]} 
                                                    tick={{ fontSize: 12, fill: '#6b7280' }}
                                                    axisLine={{ stroke: '#d1d5db' }}
                                                />
                                                <YAxis 
                                                    yAxisId="errors" 
                                                    orientation="right" 
                                                    tick={{ fontSize: 12, fill: '#6b7280' }}
                                                    axisLine={{ stroke: '#d1d5db' }}
                                                />
                                                <Tooltip content={<CustomTooltip />} />
                                                <Legend 
                                                    formatter={(value, entry) => (
                                                        <span className="text-gray-700 font-medium">{value}</span>
                                                    )}
                                                />
                                                <Line
                                                    yAxisId="quality"
                                                    type="monotone"
                                                    dataKey="quality"
                                                    stroke="#10B981"
                                                    strokeWidth={3}
                                                    dot={{ r: 5, fill: '#10B981', strokeWidth: 2 }}
                                                    activeDot={{ r: 7, stroke: '#10B981', strokeWidth: 2 }}
                                                    name="Data Quality"
                                                />
                                                <Line
                                                    yAxisId="errors"
                                                    type="monotone"
                                                    dataKey="errors"
                                                    stroke="#EF4444"
                                                    strokeWidth={3}
                                                    strokeDasharray="5 5"
                                                    dot={{ r: 5, fill: '#EF4444', strokeWidth: 2 }}
                                                    activeDot={{ r: 7, stroke: '#EF4444', strokeWidth: 2 }}
                                                    name="Error Count"
                                                />
                                            </LineChart>
                                        </ResponsiveContainer>
                                    </div>
                                    <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                                        <Card className="border-0 bg-gradient-to-r from-green-50 to-green-100">
                                            <CardContent className="p-3">
                                                <p className="font-semibold text-green-800">Average Quality</p>
                                                <p className="text-green-600 font-bold">90.4%</p>
                                            </CardContent>
                                        </Card>
                                        <Card className="border-0 bg-gradient-to-r from-blue-50 to-blue-100">
                                            <CardContent className="p-3">
                                                <p className="font-semibold text-blue-800">Quality Trend</p>
                                                <p className="text-blue-600 font-bold">+2.1% this week</p>
                                            </CardContent>
                                        </Card>
                                        <Card className="border-0 bg-gradient-to-r from-purple-50 to-purple-100">
                                            <CardContent className="p-3">
                                                <p className="font-semibold text-purple-800">Target Quality</p>
                                                <p className="text-purple-600 font-bold">95% (Goal)</p>
                                            </CardContent>
                                        </Card>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Enhanced Data Quality Actions */}
                            <Card className="shadow-xl border-0 bg-gradient-to-br from-white via-yellow-50/20 to-white">
                                <CardHeader className="pb-4">
                                    <CardTitle className="text-xl flex items-center">
                                        <Zap className="w-6 h-6 mr-3 text-yellow-600" />
                                        Recommended Actions
                                    </CardTitle>
                                    <CardDescription>
                                        Prioritized action items to improve data quality
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <Card className="border-0 bg-gradient-to-br from-red-50 to-red-100 hover:shadow-lg transition-all duration-300">
                                            <CardContent className="p-6">
                                                <div className="flex items-center mb-4">
                                                    <div className="p-2 rounded-lg bg-gradient-to-r from-red-500 to-red-600 text-white mr-3">
                                                        <AlertTriangle className="w-5 h-5" />
                                                    </div>
                                                    <h4 className="font-bold text-red-800">High Priority</h4>
                                                </div>
                                                <ul className="text-sm text-red-700 space-y-2">
                                                    <li className="flex items-start">
                                                        <div className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-2 flex-shrink-0"></div>
                                                        Fix GPS accuracy issues on Blue/Yellow lines
                                                    </li>
                                                    <li className="flex items-start">
                                                        <div className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-2 flex-shrink-0"></div>
                                                        Implement data validation for trip origins
                                                    </li>
                                                    <li className="flex items-start">
                                                        <div className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-2 flex-shrink-0"></div>
                                                        Review API timeout configurations
                                                    </li>
                                                </ul>
                                            </CardContent>
                                        </Card>

                                        <Card className="border-0 bg-gradient-to-br from-yellow-50 to-yellow-100 hover:shadow-lg transition-all duration-300">
                                            <CardContent className="p-6">
                                                <div className="flex items-center mb-4">
                                                    <div className="p-2 rounded-lg bg-gradient-to-r from-yellow-500 to-yellow-600 text-white mr-3">
                                                        <Clock className="w-5 h-5" />
                                                    </div>
                                                    <h4 className="font-bold text-yellow-800">Medium Priority</h4>
                                                </div>
                                                <ul className="text-sm text-yellow-700 space-y-2">
                                                    <li className="flex items-start">
                                                        <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 mr-2 flex-shrink-0"></div>
                                                        Set up automated duplicate detection
                                                    </li>
                                                    <li className="flex items-start">
                                                        <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 mr-2 flex-shrink-0"></div>
                                                        Improve timestamp validation rules
                                                    </li>
                                                    <li className="flex items-start">
                                                        <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 mr-2 flex-shrink-0"></div>
                                                        Monitor destination data completeness
                                                    </li>
                                                </ul>
                                            </CardContent>
                                        </Card>

                                        <Card className="border-0 bg-gradient-to-br from-green-50 to-green-100 hover:shadow-lg transition-all duration-300">
                                            <CardContent className="p-6">
                                                <div className="flex items-center mb-4">
                                                    <div className="p-2 rounded-lg bg-gradient-to-r from-green-500 to-green-600 text-white mr-3">
                                                        <Shield className="w-5 h-5" />
                                                    </div>
                                                    <h4 className="font-bold text-green-800">Preventive</h4>
                                                </div>
                                                <ul className="text-sm text-green-700 space-y-2">
                                                    <li className="flex items-start">
                                                        <div className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-2 flex-shrink-0"></div>
                                                        Implement real-time quality monitoring
                                                    </li>
                                                    <li className="flex items-start">
                                                        <div className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-2 flex-shrink-0"></div>
                                                        Set up quality score alerts
                                                    </li>
                                                    <li className="flex items-start">
                                                        <div className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-2 flex-shrink-0"></div>
                                                        Regular data quality audits
                                                    </li>
                                                </ul>
                                            </CardContent>
                                        </Card>
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

export default Alerts;
