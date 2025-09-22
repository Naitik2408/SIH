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
    FileText,
    Download,
    Filter,
    Calendar,
    Clock,
    Users,
    MapPin,
    BarChart3,
    PieChart as PieChartIcon,
    Settings,
    ChevronRight,
    ChevronLeft,
    Eye,
    FileSpreadsheet,
    FileType,
    Printer,
    Share2,
    CheckCircle,
    AlertCircle,
    Layers,
    Target,
    Database,
    TrendingUp,
    Activity
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

// Enhanced Report types with purple theme
const reportTypes = [
    {
        id: 'mode_share',
        label: 'Mode Share Analysis',
        description: 'Transportation mode distribution and trends',
        icon: PieChartIcon,
        gradient: 'from-purple-500 to-purple-600'
    },
    {
        id: 'trip_purpose',
        label: 'Trip Purpose Report',
        description: 'Analysis of trip purposes and patterns',
        icon: Target,
        gradient: 'from-blue-500 to-blue-600'
    },
    {
        id: 'od_matrix',
        label: 'Origin-Destination Analysis',
        description: 'OD matrix and corridor analysis',
        icon: MapPin,
        gradient: 'from-indigo-500 to-indigo-600'
    },
    {
        id: 'demographics',
        label: 'Demographics Report',
        description: 'User demographics and equity analysis',
        icon: Users,
        gradient: 'from-violet-500 to-violet-600'
    },
    {
        id: 'temporal',
        label: 'Temporal Analysis',
        description: 'Time-based patterns and trends',
        icon: Clock,
        gradient: 'from-pink-500 to-pink-600'
    }
];

// Enhanced Export formats
const exportFormats = [
    { id: 'pdf', label: 'PDF Report', icon: FileType, gradient: 'from-red-500 to-red-600', description: 'Formatted report with charts' },
    { id: 'csv', label: 'CSV Data', icon: FileSpreadsheet, gradient: 'from-green-500 to-green-600', description: 'Raw data export' },
    { id: 'excel', label: 'Excel Workbook', icon: Database, gradient: 'from-blue-500 to-blue-600', description: 'Multiple sheets with data and charts' }
];

// Enhanced sample data with purple theme colors
const sampleData = {
    mode_share: {
        chart: [
            { mode: 'Metro', value: 45, color: '#a28ef9' },
            { mode: 'Bus', value: 30, color: '#8b7cf6' },
            { mode: 'Auto', value: 15, color: '#7c3aed' },
            { mode: 'Walk', value: 10, color: '#c084fc' }
        ],
        table: [
            { mode: 'Metro', trips: 45000, percentage: 45, growth: '+12%' },
            { mode: 'Bus', trips: 30000, percentage: 30, growth: '+8%' },
            { mode: 'Auto', trips: 15000, percentage: 15, growth: '-2%' },
            { mode: 'Walk', trips: 10000, percentage: 10, growth: '+5%' }
        ]
    },
    trip_purpose: {
        chart: [
            { purpose: 'Work', trips: 40000, color: '#a28ef9' },
            { purpose: 'Education', trips: 25000, color: '#8b7cf6' },
            { purpose: 'Shopping', trips: 15000, color: '#7c3aed' },
            { purpose: 'Social', trips: 12000, color: '#c084fc' },
            { purpose: 'Medical', trips: 8000, color: '#e879f9' }
        ]
    },
    demographics: {
        chart: [
            { age: '18-25', trips: 25000, color: '#a28ef9' },
            { age: '26-35', trips: 35000, color: '#8b7cf6' },
            { age: '36-45', trips: 20000, color: '#7c3aed' },
            { age: '46-55', trips: 15000, color: '#c084fc' },
            { age: '56+', trips: 5000, color: '#e879f9' }
        ]
    },
    temporal: {
        chart: [
            { hour: '6AM', trips: 5000 },
            { hour: '7AM', trips: 12000 },
            { hour: '8AM', trips: 18000 },
            { hour: '9AM', trips: 15000 },
            { hour: '10AM', trips: 8000 },
            { hour: '11AM', trips: 7000 },
            { hour: '12PM', trips: 10000 },
            { hour: '1PM', trips: 9000 },
            { hour: '2PM', trips: 8000 },
            { hour: '3PM', trips: 11000 },
            { hour: '4PM', trips: 13000 },
            { hour: '5PM', trips: 16000 },
            { hour: '6PM', trips: 20000 },
            { hour: '7PM', trips: 14000 },
            { hour: '8PM', trips: 8000 }
        ]
    }
};

// Report builder steps
const reportSteps = [
    { id: 1, title: 'Dataset', description: 'Select data source and time range' },
    { id: 2, title: 'Metrics', description: 'Choose metrics and dimensions' },
    { id: 3, title: 'Export', description: 'Generate and download report' }
];

// Dataset options
const datasets = [
    { id: 'current_week', label: 'Current Week', description: 'Sep 15-21, 2025' },
    { id: 'current_month', label: 'Current Month', description: 'September 2025' },
    { id: 'last_quarter', label: 'Last Quarter', description: 'Q2 2025' },
    { id: 'custom_range', label: 'Custom Range', description: 'Select specific dates' }
];

// Metrics options
const metricsOptions = {
    mode_share: ['Total Trips', 'Mode Distribution', 'Peak Hour Analysis', 'Route Efficiency'],
    trip_purpose: ['Purpose Distribution', 'Time Patterns', 'Distance Analysis', 'Frequency Trends'],
    od_matrix: ['Top Corridors', 'Flow Analysis', 'Congestion Metrics', 'Network Performance'],
    demographics: ['Age Distribution', 'Income Analysis', 'Gender Patterns', 'Equity Metrics'],
    temporal: ['Hourly Patterns', 'Daily Trends', 'Seasonal Variations', 'Peak Hour Analysis']
};

// Custom Tooltip Component for better styling
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
                            <span className="text-sm text-gray-600">{entry.name || entry.dataKey}:</span>
                            <span className="text-sm font-semibold text-gray-800">{entry.value}</span>
                        </div>
                    ))}
                </CardContent>
            </Card>
        );
    }
    return null;
};

const Reports = () => {
    const [selectedReportType, setSelectedReportType] = useState('mode_share');
    const [selectedDataset, setSelectedDataset] = useState('current_week');
    const [selectedMetrics, setSelectedMetrics] = useState([]);
    const [currentStep, setCurrentStep] = useState(1);
    const [dateRange, setDateRange] = useState({ start: '2025-09-15', end: '2025-09-21' });
    const [showWizard, setShowWizard] = useState(false);

    const currentReportType = reportTypes.find(type => type.id === selectedReportType);

    // Export functions (dummy implementations)
    const handleExport = (format) => {
        console.log(`Exporting ${selectedReportType} report as ${format.toUpperCase()}...`);
        console.log('Report configuration:', {
            type: selectedReportType,
            dataset: selectedDataset,
            metrics: selectedMetrics,
            dateRange,
            format
        });

        // Simulate export process
        setTimeout(() => {
            alert(`${format.toUpperCase()} export completed! (This is a demo - check console for details)`);
        }, 1000);
    };

    const handleMetricToggle = (metric) => {
        setSelectedMetrics(prev =>
            prev.includes(metric)
                ? prev.filter(m => m !== metric)
                : [...prev, metric]
        );
    };

    const nextStep = () => {
        if (currentStep < 3) setCurrentStep(prev => prev + 1);
    };

    const prevStep = () => {
        if (currentStep > 1) setCurrentStep(prev => prev - 1);
    };

    const renderChart = () => {
        const data = sampleData[selectedReportType];

        switch (selectedReportType) {
            case 'mode_share':
                return (
                    <ResponsiveContainer width="100%" height={350}>
                        <PieChart>
                            <Pie
                                data={data.chart}
                                cx="50%"
                                cy="50%"
                                outerRadius={120}
                                innerRadius={50}
                                dataKey="value"
                                label={({ name, value }) => `${name}: ${value}%`}
                                stroke="#fff"
                                strokeWidth={2}
                            >
                                {data.chart.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                            <Tooltip content={<CustomTooltip />} />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                );

            case 'trip_purpose':
                return (
                    <ResponsiveContainer width="100%" height={350}>
                        <BarChart data={data.chart}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                            <XAxis 
                                dataKey="purpose" 
                                tick={{ fontSize: 12, fill: '#64748b' }}
                                axisLine={{ stroke: '#e2e8f0' }}
                            />
                            <YAxis 
                                tick={{ fontSize: 12, fill: '#64748b' }}
                                axisLine={{ stroke: '#e2e8f0' }}
                            />
                            <Tooltip content={<CustomTooltip />} />
                            <Bar dataKey="trips" radius={[6, 6, 0, 0]}>
                                {data.chart.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                );

            case 'demographics':
                return (
                    <ResponsiveContainer width="100%" height={350}>
                        <BarChart data={data.chart}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                            <XAxis 
                                dataKey="age" 
                                tick={{ fontSize: 12, fill: '#64748b' }}
                                axisLine={{ stroke: '#e2e8f0' }}
                            />
                            <YAxis 
                                tick={{ fontSize: 12, fill: '#64748b' }}
                                axisLine={{ stroke: '#e2e8f0' }}
                            />
                            <Tooltip content={<CustomTooltip />} />
                            <Bar dataKey="trips" radius={[6, 6, 0, 0]}>
                                {data.chart.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                );

            case 'temporal':
                return (
                    <ResponsiveContainer width="100%" height={350}>
                        <LineChart data={data.chart}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                            <XAxis 
                                dataKey="hour" 
                                tick={{ fontSize: 12, fill: '#64748b' }}
                                axisLine={{ stroke: '#e2e8f0' }}
                            />
                            <YAxis 
                                tick={{ fontSize: 12, fill: '#64748b' }}
                                axisLine={{ stroke: '#e2e8f0' }}
                            />
                            <Tooltip content={<CustomTooltip />} />
                            <Line
                                type="monotone"
                                dataKey="trips"
                                stroke="#8b7cf6"
                                strokeWidth={3}
                                dot={{ r: 5, fill: '#8b7cf6', strokeWidth: 2 }}
                                activeDot={{ r: 7, stroke: '#8b7cf6', strokeWidth: 2 }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                );

            default:
                return (
                    <div className="h-80 flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg border border-gray-200">
                        <div className="text-center">
                            <Activity className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                            <p className="text-gray-500 font-medium">Select a report type to view preview</p>
                        </div>
                    </div>
                );
        }
    };

    const renderTable = () => {
        if (selectedReportType === 'mode_share') {
            const data = sampleData.mode_share.table;
            return (
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-gray-200">
                                <th className="text-left py-3 font-semibold text-gray-700">Mode</th>
                                <th className="text-right py-3 font-semibold text-gray-700">Trips</th>
                                <th className="text-right py-3 font-semibold text-gray-700">Share</th>
                                <th className="text-right py-3 font-semibold text-gray-700">Growth</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.map((row, index) => (
                                <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                                    <td className="py-3 font-medium text-gray-800">{row.mode}</td>
                                    <td className="py-3 text-right text-gray-600">{row.trips.toLocaleString()}</td>
                                    <td className="py-3 text-right text-gray-600">
                                        <Badge variant="secondary">{row.percentage}%</Badge>
                                    </td>
                                    <td className={`py-3 text-right font-medium ${
                                        row.growth.startsWith('+') ? 'text-green-600' : 'text-red-600'
                                    }`}>
                                        {row.growth}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            );
        }
        return (
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-6 rounded-lg border border-gray-200">
                <div className="text-center">
                    <BarChart3 className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500 font-medium">Summary statistics will appear here</p>
                </div>
            </div>
        );
    };

    return (
        <div className="p-6 space-y-8 bg-gradient-to-br from-purple-50/30 via-white to-blue-50/30 min-h-screen">
            {/* Enhanced Header */}
            <div className="mb-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 via-purple-700 to-blue-600 bg-clip-text text-transparent">
                            Reports & Analytics
                        </h1>
                        <p className="text-gray-600 mt-2 text-lg">Generate comprehensive analytical reports and export data</p>
                    </div>
                    <div className="flex space-x-3">
                        <Button variant="outline" className="border-purple-200 text-purple-700 hover:bg-purple-50">
                            <Download className="w-4 h-4 mr-2" />
                            Quick Export
                        </Button>
                        <Button 
                            onClick={() => setShowWizard(!showWizard)}
                            className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800"
                        >
                            <Settings className="w-4 h-4 mr-2" />
                            {showWizard ? 'Close' : 'Open'} Report Builder
                        </Button>
                    </div>
                </div>
            </div>

            {/* Enhanced Report Builder Wizard */}
            {showWizard && (
                <Card className="shadow-xl border-0 bg-gradient-to-br from-white via-purple-50/20 to-white">
                    <CardHeader className="pb-4">
                        <CardTitle className="flex items-center text-xl">
                            <Settings className="w-5 h-5 mr-2 text-purple-600" />
                            Report Builder Wizard
                        </CardTitle>
                        <CardDescription>
                            Follow the steps to configure and generate your custom report
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {/* Enhanced Step Indicator */}
                        <div className="flex items-center justify-center mb-8">
                            {reportSteps.map((step, index) => (
                                <div key={step.id} className="flex items-center">
                                    <div className={`flex items-center justify-center w-12 h-12 rounded-full border-2 transition-all duration-300 ${
                                        currentStep >= step.id
                                            ? 'bg-gradient-to-r from-purple-600 to-purple-700 border-purple-600 text-white shadow-lg'
                                            : 'border-gray-300 text-gray-400 bg-white'
                                    }`}>
                                        {currentStep > step.id ? (
                                            <CheckCircle className="w-6 h-6" />
                                        ) : (
                                            <span className="font-bold">{step.id}</span>
                                        )}
                                    </div>
                                    <div className="ml-4 mr-8">
                                        <p className={`font-semibold transition-colors ${
                                            currentStep >= step.id ? 'text-gray-900' : 'text-gray-400'
                                        }`}>
                                            {step.title}
                                        </p>
                                        <p className="text-sm text-gray-500">{step.description}</p>
                                    </div>
                                    {index < reportSteps.length - 1 && (
                                        <ChevronRight className="w-5 h-5 text-gray-400 mr-8" />
                                    )}
                                </div>
                            ))}
                        </div>

                        {/* Step Content */}
                        <div className="min-h-[300px]">
                            {currentStep === 1 && (
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Select Dataset & Time Range</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Dataset</label>
                                            <div className="space-y-2">
                                                {datasets.map(dataset => (
                                                    <label key={dataset.id} className="flex items-center p-3 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                                                        <input
                                                            type="radio"
                                                            name="dataset"
                                                            value={dataset.id}
                                                            checked={selectedDataset === dataset.id}
                                                            onChange={(e) => setSelectedDataset(e.target.value)}
                                                            className="mr-3"
                                                        />
                                                        <div>
                                                            <p className="font-medium text-gray-800">{dataset.label}</p>
                                                            <p className="text-sm text-gray-500">{dataset.description}</p>
                                                        </div>
                                                    </label>
                                                ))}
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Custom Date Range</label>
                                            <div className="space-y-3">
                                                <div>
                                                    <label className="block text-xs text-gray-500 mb-1">Start Date</label>
                                                    <input
                                                        type="date"
                                                        value={dateRange.start}
                                                        onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                                                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-xs text-gray-500 mb-1">End Date</label>
                                                    <input
                                                        type="date"
                                                        value={dateRange.end}
                                                        onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                                                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {currentStep === 2 && (
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Select Metrics & Dimensions</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Report Type</label>
                                            <div className="space-y-2">
                                                {reportTypes.map(type => (
                                                    <label key={type.id} className="flex items-center p-3 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                                                        <input
                                                            type="radio"
                                                            name="reportType"
                                                            value={type.id}
                                                            checked={selectedReportType === type.id}
                                                            onChange={(e) => setSelectedReportType(e.target.value)}
                                                            className="mr-3"
                                                        />
                                                        <div className={`p-2 rounded-lg mr-3 bg-gradient-to-r ${type.gradient} text-white`}>
                                                            <type.icon className="w-4 h-4" />
                                                        </div>
                                                        <div>
                                                            <p className="font-medium text-gray-800">{type.label}</p>
                                                            <p className="text-sm text-gray-500">{type.description}</p>
                                                        </div>
                                                    </label>
                                                ))}
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Available Metrics</label>
                                            <div className="space-y-2 max-h-64 overflow-y-auto">
                                                {metricsOptions[selectedReportType]?.map(metric => (
                                                    <label key={metric} className="flex items-center p-2 hover:bg-gray-50 rounded cursor-pointer transition-colors">
                                                        <input
                                                            type="checkbox"
                                                            checked={selectedMetrics.includes(metric)}
                                                            onChange={() => handleMetricToggle(metric)}
                                                            className="mr-3"
                                                        />
                                                        <span className="text-gray-700">{metric}</span>
                                                    </label>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {currentStep === 3 && (
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Export Configuration</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        {exportFormats.map(format => (
                                            <Card key={format.id} className="border border-gray-200 hover:shadow-lg transition-shadow cursor-pointer">
                                                <CardContent className="p-4">
                                                    <div className="flex items-center mb-3">
                                                        <div className={`p-2 rounded-lg bg-gradient-to-r ${format.gradient} text-white mr-3`}>
                                                            <format.icon className="w-5 h-5" />
                                                        </div>
                                                        <h4 className="font-semibold text-gray-800">{format.label}</h4>
                                                    </div>
                                                    <p className="text-sm text-gray-600 mb-4">{format.description}</p>
                                                    <Button
                                                        onClick={() => handleExport(format.id)}
                                                        className={`w-full bg-gradient-to-r ${format.gradient} hover:opacity-90 transition-opacity text-white`}
                                                    >
                                                        Export {format.label}
                                                    </Button>
                                                </CardContent>
                                            </Card>
                                        ))}
                                    </div>

                                    {/* Export Summary */}
                                    <Card className="mt-6 bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200">
                                        <CardContent className="p-4">
                                            <h4 className="font-semibold text-gray-800 mb-2 flex items-center">
                                                <Eye className="w-4 h-4 mr-2" />
                                                Export Summary
                                            </h4>
                                            <div className="text-sm text-gray-600 space-y-1">
                                                <p><strong>Report Type:</strong> {currentReportType?.label}</p>
                                                <p><strong>Dataset:</strong> {datasets.find(d => d.id === selectedDataset)?.label}</p>
                                                <p><strong>Date Range:</strong> {dateRange.start} to {dateRange.end}</p>
                                                <p><strong>Selected Metrics:</strong> {selectedMetrics.length > 0 ? selectedMetrics.join(', ') : 'All metrics'}</p>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>
                            )}
                        </div>

                        {/* Navigation */}
                        <div className="flex justify-between mt-6">
                            <Button
                                variant="outline"
                                onClick={prevStep}
                                disabled={currentStep === 1}
                                className="border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <ChevronLeft className="w-4 h-4 mr-1" />
                                Previous
                            </Button>
                            <Button
                                onClick={nextStep}
                                disabled={currentStep === 3}
                                className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Next
                                <ChevronRight className="w-4 h-4 ml-1" />
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Main Layout */}
            <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
                {/* Enhanced Left Sidebar - Filters */}
                <div className="xl:col-span-1">
                    <Card className="border-0 shadow-lg sticky top-6">
                        <CardHeader className="pb-4">
                            <CardTitle className="flex items-center text-lg">
                                <Filter className="w-5 h-5 mr-2 text-purple-600" />
                                Report Filters
                            </CardTitle>
                            <CardDescription>
                                Configure your report parameters
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* Report Type Filter */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-3">Report Type</label>
                                <div className="space-y-2">
                                    {reportTypes.map(type => {
                                        const Icon = type.icon;
                                        return (
                                            <Button
                                                key={type.id}
                                                variant={selectedReportType === type.id ? "default" : "outline"}
                                                onClick={() => setSelectedReportType(type.id)}
                                                className={`w-full justify-start h-auto p-3 ${
                                                    selectedReportType === type.id 
                                                        ? 'bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white' 
                                                        : 'border-gray-200 hover:bg-purple-50'
                                                }`}
                                            >
                                                <div className={`p-2 rounded-lg mr-3 ${
                                                    selectedReportType === type.id 
                                                        ? 'bg-white/20' 
                                                        : `bg-gradient-to-r ${type.gradient} text-white`
                                                }`}>
                                                    <Icon className="w-4 h-4" />
                                                </div>
                                                <div className="text-left">
                                                    <p className="font-medium">{type.label}</p>
                                                    <p className={`text-xs ${
                                                        selectedReportType === type.id ? 'text-purple-100' : 'text-gray-500'
                                                    }`}>
                                                        {type.description}
                                                    </p>
                                                </div>
                                            </Button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Date Range Filter */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Date Range</label>
                                <div className="space-y-2">
                                    <input
                                        type="date"
                                        value={dateRange.start}
                                        onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                                        className="w-full p-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                                    />
                                    <input
                                        type="date"
                                        value={dateRange.end}
                                        onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                                        className="w-full p-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                                    />
                                </div>
                            </div>

                            {/* Quick Export Buttons */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Quick Export</label>
                                <div className="space-y-2">
                                    {exportFormats.map(format => (
                                        <Button
                                            key={format.id}
                                            onClick={() => handleExport(format.id)}
                                            className={`w-full bg-gradient-to-r ${format.gradient} hover:opacity-90 transition-opacity text-white`}
                                        >
                                            <format.icon className="w-4 h-4 mr-2" />
                                            {format.label}
                                        </Button>
                                    ))}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Enhanced Main Content Area */}
                <div className="xl:col-span-3">
                    <Card className="border-0 shadow-lg">
                        {/* Report Preview Header */}
                        <CardHeader className="pb-4 border-b border-gray-200">
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle className="flex items-center text-xl">
                                        <Eye className="w-5 h-5 mr-2 text-purple-600" />
                                        Report Preview - {currentReportType?.label}
                                    </CardTitle>
                                    <CardDescription className="mt-1">
                                        {dateRange.start} to {dateRange.end}
                                    </CardDescription>
                                </div>
                                <div className="flex space-x-2">
                                    {exportFormats.map(format => (
                                        <Button
                                            key={format.id}
                                            onClick={() => handleExport(format.id)}
                                            className={`bg-gradient-to-r ${format.gradient} hover:opacity-90 transition-opacity text-white`}
                                            size="sm"
                                        >
                                            <format.icon className="w-4 h-4 mr-1" />
                                            {format.id.toUpperCase()}
                                        </Button>
                                    ))}
                                </div>
                            </div>
                        </CardHeader>

                        {/* Report Content */}
                        <CardContent className="p-6">
                            {/* Chart Section */}
                            <div className="mb-8">
                                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                                    <BarChart3 className="w-5 h-5 mr-2 text-purple-600" />
                                    {currentReportType?.label} Visualization
                                </h3>
                                <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-4 border border-gray-200">
                                    {renderChart()}
                                </div>
                            </div>

                            {/* Table Section */}
                            <div className="mb-8">
                                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                                    <Database className="w-5 h-5 mr-2 text-purple-600" />
                                    Summary Statistics
                                </h3>
                                <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-4 border border-gray-200">
                                    {renderTable()}
                                </div>
                            </div>

                            {/* Enhanced Insights Section */}
                            <div>
                                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                                    <TrendingUp className="w-5 h-5 mr-2 text-purple-600" />
                                    Key Insights
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <Card className="border border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100">
                                        <CardContent className="p-4">
                                            <div className="flex items-center mb-2">
                                                <CheckCircle className="w-5 h-5 text-blue-600 mr-2" />
                                                <p className="font-semibold text-blue-800">Primary Finding</p>
                                            </div>
                                            <p className="text-blue-700 text-sm">
                                                {selectedReportType === 'mode_share' && 'Metro dominates with 45% mode share'}
                                                {selectedReportType === 'trip_purpose' && 'Work trips account for 40% of all journeys'}
                                                {selectedReportType === 'demographics' && 'Most active age group is 26-35 years'}
                                                {selectedReportType === 'temporal' && 'Peak hours are 8AM and 6PM'}
                                                {selectedReportType === 'od_matrix' && 'Central corridors show highest traffic'}
                                            </p>
                                        </CardContent>
                                    </Card>
                                    
                                    <Card className="border border-green-200 bg-gradient-to-br from-green-50 to-green-100">
                                        <CardContent className="p-4">
                                            <div className="flex items-center mb-2">
                                                <AlertCircle className="w-5 h-5 text-green-600 mr-2" />
                                                <p className="font-semibold text-green-800">Recommendation</p>
                                            </div>
                                            <p className="text-green-700 text-sm">
                                                {selectedReportType === 'mode_share' && 'Consider increasing bus capacity to balance load'}
                                                {selectedReportType === 'trip_purpose' && 'Optimize schedules for work commute patterns'}
                                                {selectedReportType === 'demographics' && 'Target services for young professional demographic'}
                                                {selectedReportType === 'temporal' && 'Implement dynamic pricing for peak hours'}
                                                {selectedReportType === 'od_matrix' && 'Focus infrastructure improvements on high-traffic corridors'}
                                            </p>
                                        </CardContent>
                                    </Card>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default Reports;
