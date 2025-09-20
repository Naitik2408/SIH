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

// Alert categories
const alertCategories = [
    { id: 'data_quality', label: 'Data Quality', color: 'bg-blue-100 text-blue-600', icon: Database },
    { id: 'anomalies', label: 'Anomalies', color: 'bg-yellow-100 text-yellow-600', icon: TrendingUp },
    { id: 'system_alerts', label: 'System Alerts', color: 'bg-red-100 text-red-600', icon: Shield }
];

// Severity levels
const severityLevels = [
    { id: 'critical', label: 'Critical', color: 'bg-red-500 text-white', textColor: 'text-red-600' },
    { id: 'high', label: 'High', color: 'bg-orange-500 text-white', textColor: 'text-orange-600' },
    { id: 'medium', label: 'Medium', color: 'bg-yellow-500 text-white', textColor: 'text-yellow-600' },
    { id: 'low', label: 'Low', color: 'bg-green-500 text-white', textColor: 'text-green-600' }
];

// Status options
const statusOptions = [
    { id: 'active', label: 'Active', color: 'bg-red-100 text-red-600', icon: AlertCircle },
    { id: 'reviewing', label: 'Under Review', color: 'bg-yellow-100 text-yellow-600', icon: Eye },
    { id: 'resolved', label: 'Resolved', color: 'bg-green-100 text-green-600', icon: CheckCircle },
    { id: 'dismissed', label: 'Dismissed', color: 'bg-gray-100 text-gray-600', icon: XCircle }
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

// Custom tooltip component
const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
                <p className="font-medium text-gray-800 mb-1">{label}</p>
                {payload.map((entry, index) => (
                    <p key={index} style={{ color: entry.color }} className="text-sm">
                        {entry.name}: {entry.value}
                        {entry.name.includes('quality') && '%'}
                        {entry.name.includes('errors') && ' errors'}
                    </p>
                ))}
            </div>
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
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900">Alerts & Data Quality</h1>
                <p className="text-gray-600 mt-2">Monitor system alerts and data quality metrics</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-white rounded-xl shadow-md border p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Total Alerts</p>
                            <p className="text-2xl font-bold text-gray-900">{alertStats.total}</p>
                        </div>
                        <div className="p-3 rounded-lg bg-blue-100 text-blue-600">
                            <Bell className="w-6 h-6" />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-md border p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Active Alerts</p>
                            <p className="text-2xl font-bold text-red-600">{alertStats.active}</p>
                        </div>
                        <div className="p-3 rounded-lg bg-red-100 text-red-600">
                            <AlertCircle className="w-6 h-6" />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-md border p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Critical Issues</p>
                            <p className="text-2xl font-bold text-orange-600">{alertStats.critical}</p>
                        </div>
                        <div className="p-3 rounded-lg bg-orange-100 text-orange-600">
                            <AlertTriangle className="w-6 h-6" />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-md border p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Resolved Today</p>
                            <p className="text-2xl font-bold text-green-600">{alertStats.resolved}</p>
                        </div>
                        <div className="p-3 rounded-lg bg-green-100 text-green-600">
                            <CheckCircle className="w-6 h-6" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Tab Navigation */}
            <div className="bg-white rounded-2xl shadow-md border">
                <div className="border-b border-gray-200">
                    <nav className="flex space-x-8 px-6">
                        <button
                            onClick={() => setActiveTab('alerts')}
                            className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'alerts'
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                        >
                            <div className="flex items-center">
                                <AlertTriangle className="w-5 h-5 mr-2" />
                                Alerts ({filteredAlerts.length})
                            </div>
                        </button>
                        <button
                            onClick={() => setActiveTab('data_quality')}
                            className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'data_quality'
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                        >
                            <div className="flex items-center">
                                <Database className="w-5 h-5 mr-2" />
                                Data Quality
                            </div>
                        </button>
                    </nav>
                </div>

                <div className="p-6">
                    {/* Alerts Tab */}
                    {activeTab === 'alerts' && (
                        <div className="space-y-6">
                            {/* Filters */}
                            <div className="flex flex-wrap gap-4 items-center">
                                <div className="flex items-center space-x-2">
                                    <Filter className="w-4 h-4 text-gray-500" />
                                    <span className="text-sm font-medium text-gray-700">Filters:</span>
                                </div>

                                <select
                                    value={selectedSeverity}
                                    onChange={(e) => setSelectedSeverity(e.target.value)}
                                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    <option value="all">All Severities</option>
                                    {severityLevels.map(level => (
                                        <option key={level.id} value={level.id}>{level.label}</option>
                                    ))}
                                </select>

                                <select
                                    value={selectedCategory}
                                    onChange={(e) => setSelectedCategory(e.target.value)}
                                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    <option value="all">All Categories</option>
                                    {alertCategories.map(category => (
                                        <option key={category.id} value={category.id}>{category.label}</option>
                                    ))}
                                </select>

                                <select
                                    value={selectedStatus}
                                    onChange={(e) => setSelectedStatus(e.target.value)}
                                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    <option value="all">All Statuses</option>
                                    {statusOptions.map(status => (
                                        <option key={status.id} value={status.id}>{status.label}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Alerts Table */}
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b border-gray-200">
                                            <th
                                                className="text-left py-3 px-4 font-medium text-gray-700 cursor-pointer hover:bg-gray-50"
                                                onClick={() => handleSort('date')}
                                            >
                                                <div className="flex items-center">
                                                    Date & Time
                                                    {sortField === 'date' && (
                                                        sortDirection === 'asc' ? <ArrowUp className="w-4 h-4 ml-1" /> : <ArrowDown className="w-4 h-4 ml-1" />
                                                    )}
                                                </div>
                                            </th>
                                            <th
                                                className="text-left py-3 px-4 font-medium text-gray-700 cursor-pointer hover:bg-gray-50"
                                                onClick={() => handleSort('severity')}
                                            >
                                                <div className="flex items-center">
                                                    Severity
                                                    {sortField === 'severity' && (
                                                        sortDirection === 'asc' ? <ArrowUp className="w-4 h-4 ml-1" /> : <ArrowDown className="w-4 h-4 ml-1" />
                                                    )}
                                                </div>
                                            </th>
                                            <th className="text-left py-3 px-4 font-medium text-gray-700">Category</th>
                                            <th className="text-left py-3 px-4 font-medium text-gray-700">Description</th>
                                            <th className="text-left py-3 px-4 font-medium text-gray-700">Status</th>
                                            <th className="text-left py-3 px-4 font-medium text-gray-700">Actions</th>
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
                                                <tr key={alert.id} className="border-b border-gray-100 hover:bg-gray-50">
                                                    <td className="py-4 px-4">
                                                        <div>
                                                            <p className="font-medium text-gray-800">
                                                                {new Date(alert.date).toLocaleDateString()}
                                                            </p>
                                                            <p className="text-xs text-gray-500">
                                                                {new Date(alert.date).toLocaleTimeString()}
                                                            </p>
                                                        </div>
                                                    </td>
                                                    <td className="py-4 px-4">
                                                        <span className={`px-2 py-1 rounded text-xs font-medium ${severityInfo.color}`}>
                                                            {severityInfo.label}
                                                        </span>
                                                    </td>
                                                    <td className="py-4 px-4">
                                                        <div className="flex items-center">
                                                            <div className={`p-1 rounded ${categoryInfo.color} mr-2`}>
                                                                <CategoryIcon className="w-3 h-3" />
                                                            </div>
                                                            <span className="text-gray-700">{categoryInfo.label}</span>
                                                        </div>
                                                    </td>
                                                    <td className="py-4 px-4">
                                                        <div>
                                                            <p className="font-medium text-gray-800">{alert.title}</p>
                                                            <p className="text-sm text-gray-600">{alert.description}</p>
                                                            {alert.affectedRoutes.length > 0 && (
                                                                <p className="text-xs text-blue-600 mt-1">
                                                                    Routes: {alert.affectedRoutes.join(', ')}
                                                                </p>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="py-4 px-4">
                                                        <div className="flex items-center">
                                                            <StatusIcon className={`w-4 h-4 mr-2 ${statusInfo.color.replace('bg-', 'text-').replace('100', '600')}`} />
                                                            <span className={`text-sm font-medium ${statusInfo.color.replace('bg-', 'text-').replace('100', '600')}`}>
                                                                {statusInfo.label}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="py-4 px-4">
                                                        <select
                                                            value={alert.status}
                                                            onChange={(e) => handleStatusChange(alert.id, e.target.value)}
                                                            className="px-2 py-1 border border-gray-300 rounded text-xs focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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

                            {/* No alerts message */}
                            {sortedAlerts.length === 0 && (
                                <div className="text-center py-12">
                                    <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
                                    <p className="text-gray-500">No alerts match the selected filters</p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Data Quality Tab */}
                    {activeTab === 'data_quality' && (
                        <div className="space-y-6">
                            {/* Data Quality Overview */}
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-lg">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm text-blue-600">Data Completeness</p>
                                            <p className="text-2xl font-bold text-blue-700">91%</p>
                                        </div>
                                        <Database className="w-8 h-8 text-blue-600" />
                                    </div>
                                </div>

                                <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 p-4 rounded-lg">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm text-yellow-600">GPS Errors</p>
                                            <p className="text-2xl font-bold text-yellow-700">3.0%</p>
                                        </div>
                                        <MapPin className="w-8 h-8 text-yellow-600" />
                                    </div>
                                </div>

                                <div className="bg-gradient-to-r from-red-50 to-red-100 p-4 rounded-lg">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm text-red-600">Outliers Detected</p>
                                            <p className="text-2xl font-bold text-red-700">5.0%</p>
                                        </div>
                                        <Target className="w-8 h-8 text-red-600" />
                                    </div>
                                </div>

                                <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-lg">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm text-green-600">Overall Quality</p>
                                            <p className="text-2xl font-bold text-green-700">91%</p>
                                        </div>
                                        <Activity className="w-8 h-8 text-green-600" />
                                    </div>
                                </div>
                            </div>

                            {/* Charts Row */}
                            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                                {/* Data Completeness Pie Chart */}
                                <div className="bg-white border rounded-2xl shadow-md p-6">
                                    <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                                        <BarChart3 className="w-5 h-5 mr-2 text-green-600" />
                                        Data Completeness
                                    </h3>
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
                                                >
                                                    {dataQualityMetrics.completeness.map((entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                                    ))}
                                                </Pie>
                                                <Tooltip />
                                                <Legend />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    </div>
                                    <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                                        <div className="bg-green-50 p-3 rounded-lg">
                                            <p className="font-medium text-green-800">Valid Records</p>
                                            <p className="text-green-600">{dataQualityMetrics.overview.validRecords.toLocaleString()}</p>
                                        </div>
                                        <div className="bg-red-50 p-3 rounded-lg">
                                            <p className="font-medium text-red-800">Missing Values</p>
                                            <p className="text-red-600">{dataQualityMetrics.overview.missingValues.toLocaleString()}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Errors by Category Bar Chart */}
                                <div className="bg-white border rounded-2xl shadow-md p-6">
                                    <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                                        <AlertTriangle className="w-5 h-5 mr-2 text-orange-600" />
                                        Errors by Category
                                    </h3>
                                    <div className="h-80">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart data={dataQualityMetrics.errorsByCategory}>
                                                <CartesianGrid strokeDasharray="3 3" />
                                                <XAxis
                                                    dataKey="category"
                                                    angle={-45}
                                                    textAnchor="end"
                                                    height={80}
                                                />
                                                <YAxis />
                                                <Tooltip
                                                    content={({ active, payload, label }) => {
                                                        if (active && payload && payload.length) {
                                                            const data = payload[0].payload;
                                                            return (
                                                                <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
                                                                    <p className="font-medium text-gray-800 mb-1">{label}</p>
                                                                    <p className="text-sm text-gray-600">Count: {data.count.toLocaleString()}</p>
                                                                    <p className="text-sm text-gray-600">Percentage: {data.percentage}%</p>
                                                                </div>
                                                            );
                                                        }
                                                        return null;
                                                    }}
                                                />
                                                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                                                    {dataQualityMetrics.errorsByCategory.map((entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                                    ))}
                                                </Bar>
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                    <div className="mt-4 text-center">
                                        <p className="text-sm text-gray-600">
                                            Total Error Records: {dataQualityMetrics.errorsByCategory.reduce((sum, item) => sum + item.count, 0).toLocaleString()}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Quality Trend Line Chart */}
                            <div className="bg-white border rounded-2xl shadow-md p-6">
                                <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                                    <TrendingUp className="w-5 h-5 mr-2 text-purple-600" />
                                    Data Quality Trend (Last 7 Days)
                                </h3>
                                <div className="h-80">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart data={dataQualityMetrics.qualityTrend}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="date" />
                                            <YAxis yAxisId="quality" orientation="left" domain={[85, 95]} />
                                            <YAxis yAxisId="errors" orientation="right" />
                                            <Tooltip content={<CustomTooltip />} />
                                            <Legend />
                                            <Line
                                                yAxisId="quality"
                                                type="monotone"
                                                dataKey="quality"
                                                stroke="#10B981"
                                                strokeWidth={3}
                                                dot={{ r: 5, fill: '#10B981' }}
                                                name="Data Quality"
                                            />
                                            <Line
                                                yAxisId="errors"
                                                type="monotone"
                                                dataKey="errors"
                                                stroke="#EF4444"
                                                strokeWidth={3}
                                                dot={{ r: 5, fill: '#EF4444' }}
                                                name="Error Count"
                                            />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>
                                <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                                    <div className="bg-green-50 p-3 rounded-lg">
                                        <p className="font-medium text-green-800">Average Quality</p>
                                        <p className="text-green-600">90.4%</p>
                                    </div>
                                    <div className="bg-blue-50 p-3 rounded-lg">
                                        <p className="font-medium text-blue-800">Quality Trend</p>
                                        <p className="text-blue-600">+2.1% this week</p>
                                    </div>
                                    <div className="bg-purple-50 p-3 rounded-lg">
                                        <p className="font-medium text-purple-800">Target Quality</p>
                                        <p className="text-purple-600">95% (Goal)</p>
                                    </div>
                                </div>
                            </div>

                            {/* Data Quality Actions */}
                            <div className="bg-white border rounded-2xl shadow-md p-6">
                                <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                                    <Zap className="w-5 h-5 mr-2 text-yellow-600" />
                                    Recommended Actions
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="bg-gradient-to-r from-red-50 to-red-100 p-4 rounded-lg">
                                        <h4 className="font-semibold text-red-800 mb-2">High Priority</h4>
                                        <ul className="text-sm text-red-700 space-y-1">
                                            <li>• Fix GPS accuracy issues on Blue/Yellow lines</li>
                                            <li>• Implement data validation for trip origins</li>
                                            <li>• Review API timeout configurations</li>
                                        </ul>
                                    </div>

                                    <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 p-4 rounded-lg">
                                        <h4 className="font-semibold text-yellow-800 mb-2">Medium Priority</h4>
                                        <ul className="text-sm text-yellow-700 space-y-1">
                                            <li>• Set up automated duplicate detection</li>
                                            <li>• Improve timestamp validation rules</li>
                                            <li>• Monitor destination data completeness</li>
                                        </ul>
                                    </div>

                                    <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-lg">
                                        <h4 className="font-semibold text-green-800 mb-2">Preventive</h4>
                                        <ul className="text-sm text-green-700 space-y-1">
                                            <li>• Implement real-time quality monitoring</li>
                                            <li>• Set up quality score alerts</li>
                                            <li>• Regular data quality audits</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Alerts;
