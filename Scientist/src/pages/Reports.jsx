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
    Database
} from 'lucide-react';

// Report types
const reportTypes = [
    {
        id: 'mode_share',
        label: 'Mode Share Analysis',
        description: 'Transportation mode distribution and trends',
        icon: PieChartIcon,
        color: 'bg-blue-100 text-blue-600'
    },
    {
        id: 'trip_purpose',
        label: 'Trip Purpose Report',
        description: 'Analysis of trip purposes and patterns',
        icon: Target,
        color: 'bg-green-100 text-green-600'
    },
    {
        id: 'od_matrix',
        label: 'Origin-Destination Analysis',
        description: 'OD matrix and corridor analysis',
        icon: MapPin,
        color: 'bg-purple-100 text-purple-600'
    },
    {
        id: 'demographics',
        label: 'Demographics Report',
        description: 'User demographics and equity analysis',
        icon: Users,
        color: 'bg-orange-100 text-orange-600'
    },
    {
        id: 'temporal',
        label: 'Temporal Analysis',
        description: 'Time-based patterns and trends',
        icon: Clock,
        color: 'bg-pink-100 text-pink-600'
    }
];

// Export formats
const exportFormats = [
    { id: 'pdf', label: 'PDF Report', icon: FileType, color: 'bg-red-500', description: 'Formatted report with charts' },
    { id: 'csv', label: 'CSV Data', icon: FileSpreadsheet, color: 'bg-green-500', description: 'Raw data export' },
    { id: 'excel', label: 'Excel Workbook', icon: Database, color: 'bg-blue-500', description: 'Multiple sheets with data and charts' }
];

// Sample data for previews
const sampleData = {
    mode_share: {
        chart: [
            { mode: 'Metro', value: 45, color: '#3B82F6' },
            { mode: 'Bus', value: 30, color: '#10B981' },
            { mode: 'Auto', value: 15, color: '#F59E0B' },
            { mode: 'Walk', value: 10, color: '#8B5CF6' }
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
            { purpose: 'Work', trips: 40000, color: '#3B82F6' },
            { purpose: 'Education', trips: 25000, color: '#10B981' },
            { purpose: 'Shopping', trips: 15000, color: '#F59E0B' },
            { purpose: 'Social', trips: 12000, color: '#8B5CF6' },
            { purpose: 'Medical', trips: 8000, color: '#EF4444' }
        ]
    },
    demographics: {
        chart: [
            { age: '18-25', trips: 25000, color: '#3B82F6' },
            { age: '26-35', trips: 35000, color: '#10B981' },
            { age: '36-45', trips: 20000, color: '#F59E0B' },
            { age: '46-55', trips: 15000, color: '#8B5CF6' },
            { age: '56+', trips: 5000, color: '#EF4444' }
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
        if (currentStep < 3) setCurrentStep(currentStep + 1);
    };

    const prevStep = () => {
        if (currentStep > 1) setCurrentStep(currentStep - 1);
    };

    const renderChart = () => {
        const data = sampleData[selectedReportType];

        switch (selectedReportType) {
            case 'mode_share':
                return (
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                                data={data.chart}
                                cx="50%"
                                cy="50%"
                                outerRadius={100}
                                dataKey="value"
                                label={({ name, value }) => `${name}: ${value}%`}
                            >
                                {data.chart.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                            <Tooltip />
                        </PieChart>
                    </ResponsiveContainer>
                );

            case 'trip_purpose':
                return (
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={data.chart}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="purpose" />
                            <YAxis />
                            <Tooltip formatter={(value) => [value.toLocaleString(), 'Trips']} />
                            <Bar dataKey="trips" radius={[4, 4, 0, 0]}>
                                {data.chart.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                );

            case 'demographics':
                return (
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={data.chart}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="age" />
                            <YAxis />
                            <Tooltip formatter={(value) => [value.toLocaleString(), 'Trips']} />
                            <Bar dataKey="trips" radius={[4, 4, 0, 0]}>
                                {data.chart.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                );

            case 'temporal':
                return (
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={data.chart}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="hour" />
                            <YAxis />
                            <Tooltip formatter={(value) => [value.toLocaleString(), 'Trips']} />
                            <Line
                                type="monotone"
                                dataKey="trips"
                                stroke="#3B82F6"
                                strokeWidth={3}
                                dot={{ r: 4, fill: '#3B82F6' }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                );

            default:
                return (
                    <div className="h-72 flex items-center justify-center bg-gray-50 rounded-lg">
                        <p className="text-gray-500">Select a report type to view preview</p>
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
                                <th className="text-left py-2 font-medium text-gray-700">Mode</th>
                                <th className="text-right py-2 font-medium text-gray-700">Trips</th>
                                <th className="text-right py-2 font-medium text-gray-700">Share</th>
                                <th className="text-right py-2 font-medium text-gray-700">Growth</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.map((row, index) => (
                                <tr key={index} className="border-b border-gray-100">
                                    <td className="py-2 font-medium text-gray-800">{row.mode}</td>
                                    <td className="py-2 text-right text-gray-600">{row.trips.toLocaleString()}</td>
                                    <td className="py-2 text-right text-gray-600">{row.percentage}%</td>
                                    <td className={`py-2 text-right font-medium ${row.growth.startsWith('+') ? 'text-green-600' : 'text-red-600'
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
            <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-500 text-center">Summary statistics will appear here</p>
            </div>
        );
    };

    return (
        <div className="p-6">
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900">Reports & Exports</h1>
                <p className="text-gray-600 mt-2">Generate comprehensive analytical reports and export data</p>
            </div>

            {/* Report Builder Toggle */}
            <div className="mb-6">
                <button
                    onClick={() => setShowWizard(!showWizard)}
                    className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
                >
                    <Settings className="w-5 h-5 mr-2" />
                    {showWizard ? 'Close' : 'Open'} Report Builder
                </button>
            </div>

            {/* Report Builder Wizard */}
            {showWizard && (
                <div className="bg-white rounded-2xl shadow-lg border p-6 mb-6">
                    <h2 className="text-xl font-semibold text-gray-800 mb-6">Report Builder Wizard</h2>

                    {/* Step Indicator */}
                    <div className="flex items-center justify-center mb-8">
                        {reportSteps.map((step, index) => (
                            <div key={step.id} className="flex items-center">
                                <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${currentStep >= step.id
                                        ? 'bg-blue-600 border-blue-600 text-white'
                                        : 'border-gray-300 text-gray-400'
                                    }`}>
                                    {currentStep > step.id ? (
                                        <CheckCircle className="w-5 h-5" />
                                    ) : (
                                        step.id
                                    )}
                                </div>
                                <div className="ml-3 mr-8">
                                    <p className={`font-medium ${currentStep >= step.id ? 'text-gray-900' : 'text-gray-400'
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
                                                <label key={dataset.id} className="flex items-center p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
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
                                                    className="w-full p-2 border border-gray-300 rounded-lg"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs text-gray-500 mb-1">End Date</label>
                                                <input
                                                    type="date"
                                                    value={dateRange.end}
                                                    onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                                                    className="w-full p-2 border border-gray-300 rounded-lg"
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
                                                <label key={type.id} className="flex items-center p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                                                    <input
                                                        type="radio"
                                                        name="reportType"
                                                        value={type.id}
                                                        checked={selectedReportType === type.id}
                                                        onChange={(e) => setSelectedReportType(e.target.value)}
                                                        className="mr-3"
                                                    />
                                                    <div className={`p-2 rounded-lg mr-3 ${type.color}`}>
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
                                                <label key={metric} className="flex items-center p-2 hover:bg-gray-50 rounded cursor-pointer">
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
                                        <div key={format.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                                            <div className="flex items-center mb-3">
                                                <div className={`p-2 rounded-lg ${format.color} text-white mr-3`}>
                                                    <format.icon className="w-5 h-5" />
                                                </div>
                                                <h4 className="font-medium text-gray-800">{format.label}</h4>
                                            </div>
                                            <p className="text-sm text-gray-600 mb-4">{format.description}</p>
                                            <button
                                                onClick={() => handleExport(format.id)}
                                                className={`w-full py-2 px-4 rounded-lg text-white ${format.color} hover:opacity-90 transition-opacity`}
                                            >
                                                Export {format.label}
                                            </button>
                                        </div>
                                    ))}
                                </div>

                                {/* Export Summary */}
                                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                                    <h4 className="font-medium text-gray-800 mb-2">Export Summary</h4>
                                    <div className="text-sm text-gray-600 space-y-1">
                                        <p><strong>Report Type:</strong> {currentReportType?.label}</p>
                                        <p><strong>Dataset:</strong> {datasets.find(d => d.id === selectedDataset)?.label}</p>
                                        <p><strong>Date Range:</strong> {dateRange.start} to {dateRange.end}</p>
                                        <p><strong>Selected Metrics:</strong> {selectedMetrics.length > 0 ? selectedMetrics.join(', ') : 'All metrics'}</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Navigation */}
                    <div className="flex justify-between mt-6">
                        <button
                            onClick={prevStep}
                            disabled={currentStep === 1}
                            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                        >
                            <ChevronLeft className="w-4 h-4 mr-1" />
                            Previous
                        </button>
                        <button
                            onClick={nextStep}
                            disabled={currentStep === 3}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                        >
                            Next
                            <ChevronRight className="w-4 h-4 ml-1" />
                        </button>
                    </div>
                </div>
            )}

            {/* Main Layout */}
            <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
                {/* Left Sidebar - Filters */}
                <div className="xl:col-span-1">
                    <div className="bg-white rounded-2xl shadow-md border p-6 sticky top-6">
                        <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                            <Filter className="w-5 h-5 mr-2 text-blue-600" />
                            Report Filters
                        </h2>

                        {/* Report Type Filter */}
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 mb-3">Report Type</label>
                            <div className="space-y-2">
                                {reportTypes.map(type => {
                                    const Icon = type.icon;
                                    return (
                                        <button
                                            key={type.id}
                                            onClick={() => setSelectedReportType(type.id)}
                                            className={`w-full p-3 rounded-lg border text-left transition-colors ${selectedReportType === type.id
                                                    ? 'border-blue-500 bg-blue-50'
                                                    : 'border-gray-200 hover:bg-gray-50'
                                                }`}
                                        >
                                            <div className="flex items-center">
                                                <div className={`p-2 rounded-lg mr-3 ${type.color}`}>
                                                    <Icon className="w-4 h-4" />
                                                </div>
                                                <div>
                                                    <p className="font-medium text-gray-800 text-sm">{type.label}</p>
                                                    <p className="text-xs text-gray-500">{type.description}</p>
                                                </div>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Date Range Filter */}
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Date Range</label>
                            <div className="space-y-2">
                                <input
                                    type="date"
                                    value={dateRange.start}
                                    onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                                    className="w-full p-2 border border-gray-300 rounded-lg text-sm"
                                />
                                <input
                                    type="date"
                                    value={dateRange.end}
                                    onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                                    className="w-full p-2 border border-gray-300 rounded-lg text-sm"
                                />
                            </div>
                        </div>

                        {/* Quick Export Buttons */}
                        <div className="space-y-2">
                            <p className="text-sm font-medium text-gray-700 mb-2">Quick Export</p>
                            {exportFormats.map(format => (
                                <button
                                    key={format.id}
                                    onClick={() => handleExport(format.id)}
                                    className={`w-full p-2 rounded-lg text-white text-sm font-medium ${format.color} hover:opacity-90 transition-opacity flex items-center justify-center`}
                                >
                                    <format.icon className="w-4 h-4 mr-2" />
                                    {format.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right Side - Preview Panel */}
                <div className="xl:col-span-3">
                    <div className="bg-white rounded-2xl shadow-md border">
                        {/* Header with Export Buttons */}
                        <div className="p-6 border-b border-gray-200">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h2 className="text-xl font-semibold text-gray-800 flex items-center">
                                        <Eye className="w-5 h-5 mr-2 text-green-600" />
                                        Report Preview - {currentReportType?.label}
                                    </h2>
                                    <p className="text-gray-600 text-sm mt-1">
                                        {dateRange.start} to {dateRange.end}
                                    </p>
                                </div>
                                <div className="flex space-x-2">
                                    {exportFormats.map(format => (
                                        <button
                                            key={format.id}
                                            onClick={() => handleExport(format.id)}
                                            className={`px-4 py-2 rounded-lg text-white text-sm font-medium ${format.color} hover:opacity-90 transition-opacity flex items-center`}
                                        >
                                            <format.icon className="w-4 h-4 mr-2" />
                                            {format.id.toUpperCase()}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Preview Content */}
                        <div className="p-6">
                            {/* Chart Section */}
                            <div className="mb-8">
                                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                                    {currentReportType?.label} Visualization
                                </h3>
                                <div className="bg-gray-50 rounded-lg p-4">
                                    {renderChart()}
                                </div>
                            </div>

                            {/* Table Section */}
                            <div className="mb-8">
                                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                                    Summary Statistics
                                </h3>
                                <div className="bg-gray-50 rounded-lg p-4">
                                    {renderTable()}
                                </div>
                            </div>

                            {/* Key Insights */}
                            <div>
                                <h3 className="text-lg font-semibold text-gray-800 mb-4">Key Insights</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="bg-blue-50 p-4 rounded-lg">
                                        <div className="flex items-center mb-2">
                                            <CheckCircle className="w-5 h-5 text-blue-600 mr-2" />
                                            <p className="font-medium text-blue-800">Primary Finding</p>
                                        </div>
                                        <p className="text-blue-700 text-sm">
                                            {selectedReportType === 'mode_share' && 'Metro dominates with 45% mode share'}
                                            {selectedReportType === 'trip_purpose' && 'Work trips account for 40% of all journeys'}
                                            {selectedReportType === 'demographics' && 'Most active age group is 26-35 years'}
                                            {selectedReportType === 'temporal' && 'Peak hours are 8AM and 6PM'}
                                            {selectedReportType === 'od_matrix' && 'Central corridors show highest traffic'}
                                        </p>
                                    </div>
                                    <div className="bg-green-50 p-4 rounded-lg">
                                        <div className="flex items-center mb-2">
                                            <AlertCircle className="w-5 h-5 text-green-600 mr-2" />
                                            <p className="font-medium text-green-800">Recommendation</p>
                                        </div>
                                        <p className="text-green-700 text-sm">
                                            {selectedReportType === 'mode_share' && 'Consider increasing bus capacity to balance load'}
                                            {selectedReportType === 'trip_purpose' && 'Optimize schedules for work commute patterns'}
                                            {selectedReportType === 'demographics' && 'Target services for young professional demographic'}
                                            {selectedReportType === 'temporal' && 'Implement dynamic pricing for peak hours'}
                                            {selectedReportType === 'od_matrix' && 'Focus infrastructure improvements on high-traffic corridors'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Reports;
