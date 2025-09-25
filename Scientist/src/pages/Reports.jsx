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
    { id: 'pdf', label: 'PDF Report', icon: FileType, gradient: 'from-red-500 to-red-600', description: 'Formatted report with charts and insights' },
    { id: 'csv', label: 'CSV Data', icon: FileSpreadsheet, gradient: 'from-green-500 to-green-600', description: 'Raw data export for analysis' },
    { id: 'excel', label: 'Excel Workbook', icon: Database, gradient: 'from-blue-500 to-blue-600', description: 'Spreadsheet with formatted data' },
    { id: 'json', label: 'JSON Data', icon: Database, gradient: 'from-purple-500 to-purple-600', description: 'Structured data format' },
    { id: 'print', label: 'Print Report', icon: Printer, gradient: 'from-gray-500 to-gray-600', description: 'Print-friendly version' }
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
    const [exportingFormats, setExportingFormats] = useState(new Set());
    const [isQuickExporting, setIsQuickExporting] = useState(false);

    const currentReportType = reportTypes.find(type => type.id === selectedReportType);

    // Utility function to convert data to CSV format
    const convertToCSV = (data, headers) => {
        const csvHeaders = headers.join(',');
        const csvRows = data.map(row =>
            headers.map(header => {
                const value = row[header.toLowerCase().replace(/\s+/g, '_')] || row[header.toLowerCase()] || '';
                return typeof value === 'string' && value.includes(',') ? `"${value}"` : value;
            }).join(',')
        );
        return [csvHeaders, ...csvRows].join('\n');
    };

    // Function to download file with error handling
    const downloadFile = (content, filename, mimeType) => {
        try {
            if (!content) {
                throw new Error('No content to export');
            }

            const blob = new Blob([content], { type: mimeType });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = filename;
            link.style.display = 'none';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Download failed:', error);
            throw new Error(`Failed to download ${filename}: ${error.message}`);
        }
    };

    // Function to generate PDF content
    const generatePDFContent = () => {
        const reportData = sampleData[selectedReportType];
        const reportTypeInfo = reportTypes.find(type => type.id === selectedReportType);

        let content = `
# ${reportTypeInfo.label}
**Generated**: ${new Date().toLocaleDateString()}
**Date Range**: ${dateRange.start} to ${dateRange.end}
**Report Type**: ${reportTypeInfo.description}

## Summary
`;

        if (selectedReportType === 'mode_share' && reportData.table) {
            content += `
### Mode Share Distribution
`;
            reportData.table.forEach(row => {
                content += `- ${row.mode}: ${row.trips.toLocaleString()} trips (${row.percentage}%) - Growth: ${row.growth}\n`;
            });
        } else if (reportData.chart) {
            content += `
### Data Summary
`;
            reportData.chart.forEach(item => {
                const key = Object.keys(item)[0]; // First key (mode, purpose, age, etc.)
                const value = Object.keys(item)[1]; // Second key (value, trips, etc.)
                content += `- ${item[key]}: ${item[value]?.toLocaleString ? item[value].toLocaleString() : item[value]}\n`;
            });
        }

        content += `

## Key Insights
`;
        if (selectedReportType === 'mode_share') {
            content += `- Metro dominates with 45% mode share
- Bus usage is second at 30%
- Auto rickshaw shows negative growth (-2%)
- Walking trips are growing (+5%)`;
        } else if (selectedReportType === 'trip_purpose') {
            content += `- Work trips account for 40% of all journeys
- Education trips are significant at 25%
- Shopping and social trips combined make up 27%
- Medical trips represent 8% of total trips`;
        } else if (selectedReportType === 'demographics') {
            content += `- Most active age group is 26-35 years (35,000 trips)
- Young adults (18-25) represent 25,000 trips
- Senior citizens (56+) have lowest usage (5,000 trips)
- Middle-aged groups show moderate usage`;
        } else if (selectedReportType === 'temporal') {
            content += `- Peak hours are 8AM (18,000 trips) and 6PM (20,000 trips)
- Morning rush starts at 7AM (12,000 trips)
- Evening peak extends to 7PM (14,000 trips)
- Lowest activity between 10-11AM (7,000-8,000 trips)`;
        }

        return content;
    };

    // Export functions with real functionality
    const handleExport = async (format) => {
        // Track export status
        setExportingFormats(prev => new Set([...prev, format]));

        const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
        const reportTypeInfo = reportTypes.find(type => type.id === selectedReportType);
        const filename = `${selectedReportType}_report_${timestamp}`;

        try {
            switch (format) {
                case 'pdf':
                    // For PDF, we'll create an HTML content that can be printed as PDF
                    const pdfContent = generatePDFContent();
                    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <title>${reportTypeInfo.label}</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; line-height: 1.6; }
        h1 { color: #7c3aed; border-bottom: 2px solid #7c3aed; padding-bottom: 10px; }
        h2 { color: #5b21b6; margin-top: 30px; }
        h3 { color: #6d28d9; }
        strong { color: #581c87; }
        li { margin: 5px 0; }
        .header { background: linear-gradient(135deg, #7c3aed, #3b82f6); color: white; padding: 20px; margin: -40px -40px 30px -40px; }
        .summary { background: #f8fafc; padding: 15px; border-left: 4px solid #7c3aed; margin: 20px 0; }
    </style>
</head>
<body>
    <div class="header">
        <h1 style="color: white; border: none; margin: 0;">${reportTypeInfo.label}</h1>
        <p style="margin: 10px 0 0 0; opacity: 0.9;">Generated on ${new Date().toLocaleDateString()} | Date Range: ${dateRange.start} to ${dateRange.end}</p>
    </div>
    <div class="summary">
        <strong>Report Description:</strong> ${reportTypeInfo.description}
    </div>
    <pre style="white-space: pre-wrap; font-family: Arial, sans-serif;">${pdfContent}</pre>
    <script>
        window.onload = function() {
            window.print();
        }
    </script>
</body>
</html>`;

                    // Open in new window for printing
                    const printWindow = window.open('', '_blank');
                    if (printWindow) {
                        printWindow.document.write(htmlContent);
                        printWindow.document.close();
                    } else {
                        alert('Pop-up blocked! Please allow pop-ups for this site to export PDF reports.');
                    }
                    break;

                case 'csv':
                    const reportData = sampleData[selectedReportType];
                    let csvContent = '';
                    let headers = [];
                    let data = [];

                    if (selectedReportType === 'mode_share' && reportData.table) {
                        headers = ['Mode', 'Trips', 'Percentage', 'Growth'];
                        data = reportData.table.map(row => ({
                            mode: row.mode,
                            trips: row.trips,
                            percentage: row.percentage,
                            growth: row.growth
                        }));
                    } else if (reportData.chart) {
                        // Generic chart data export
                        const firstItem = reportData.chart[0];
                        headers = Object.keys(firstItem).filter(key => key !== 'color');
                        data = reportData.chart.map(item => {
                            const newItem = { ...item };
                            delete newItem.color;
                            return newItem;
                        });
                    }

                    csvContent = convertToCSV(data, headers);
                    downloadFile(csvContent, `${filename}.csv`, 'text/csv');
                    break;

                case 'excel':
                    // For Excel, we'll create a more detailed CSV that can be opened in Excel
                    const excelData = sampleData[selectedReportType];
                    let excelContent = `${reportTypeInfo.label}\n`;
                    excelContent += `Generated: ${new Date().toLocaleDateString()}\n`;
                    excelContent += `Date Range: ${dateRange.start} to ${dateRange.end}\n\n`;

                    if (selectedReportType === 'mode_share' && excelData.table) {
                        excelContent += 'Mode,Trips,Percentage,Growth\n';
                        excelData.table.forEach(row => {
                            excelContent += `${row.mode},${row.trips},${row.percentage}%,${row.growth}\n`;
                        });
                    } else if (excelData.chart) {
                        const firstItem = excelData.chart[0];
                        const headers = Object.keys(firstItem).filter(key => key !== 'color');
                        excelContent += headers.join(',') + '\n';
                        excelData.chart.forEach(item => {
                            const values = headers.map(header => item[header] || '');
                            excelContent += values.join(',') + '\n';
                        });
                    }

                    downloadFile(excelContent, `${filename}.csv`, 'application/vnd.ms-excel');
                    break;

                case 'json':
                    // Export as JSON with complete report data
                    const jsonData = {
                        reportInfo: {
                            type: selectedReportType,
                            label: reportTypeInfo.label,
                            description: reportTypeInfo.description,
                            generated: new Date().toISOString(),
                            dateRange: dateRange,
                            dataset: selectedDataset,
                            metrics: selectedMetrics
                        },
                        data: sampleData[selectedReportType],
                        insights: {
                            mode_share: [
                                "Metro dominates with 45% mode share",
                                "Bus usage is second at 30%",
                                "Auto rickshaw shows negative growth (-2%)",
                                "Walking trips are growing (+5%)"
                            ],
                            trip_purpose: [
                                "Work trips account for 40% of all journeys",
                                "Education trips are significant at 25%",
                                "Shopping and social trips combined make up 27%",
                                "Medical trips represent 8% of total trips"
                            ],
                            demographics: [
                                "Most active age group is 26-35 years (35,000 trips)",
                                "Young adults (18-25) represent 25,000 trips",
                                "Senior citizens (56+) have lowest usage (5,000 trips)",
                                "Middle-aged groups show moderate usage"
                            ],
                            temporal: [
                                "Peak hours are 8AM (18,000 trips) and 6PM (20,000 trips)",
                                "Morning rush starts at 7AM (12,000 trips)",
                                "Evening peak extends to 7PM (14,000 trips)",
                                "Lowest activity between 10-11AM (7,000-8,000 trips)"
                            ]
                        }[selectedReportType] || []
                    };

                    const jsonContent = JSON.stringify(jsonData, null, 2);
                    downloadFile(jsonContent, `${filename}.json`, 'application/json');
                    break;

                case 'print':
                    // Create a print-friendly version
                    const printContent = generatePDFContent();
                    const printHtml = `
<!DOCTYPE html>
<html>
<head>
    <title>${reportTypeInfo.label} - Print Version</title>
    <style>
        @media print {
            body { margin: 0; }
            .no-print { display: none !important; }
        }
        body { 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
            margin: 20px; 
            line-height: 1.6; 
            color: #333;
        }
        .header { 
            background: linear-gradient(135deg, #7c3aed, #3b82f6); 
            color: white; 
            padding: 30px; 
            margin: -20px -20px 30px -20px; 
            border-radius: 0 0 15px 15px;
            text-align: center;
        }
        h1 { margin: 0; font-size: 2.5em; font-weight: bold; }
        h2 { color: #7c3aed; border-bottom: 2px solid #7c3aed; padding-bottom: 8px; margin-top: 25px; }
        h3 { color: #5b21b6; margin-top: 20px; }
        .summary { 
            background: #f8fafc; 
            padding: 20px; 
            border-left: 5px solid #7c3aed; 
            margin: 20px 0; 
            border-radius: 0 8px 8px 0;
        }
        .insights { 
            background: #fef7ff; 
            padding: 20px; 
            border: 1px solid #e9d5ff; 
            border-radius: 8px; 
            margin: 20px 0; 
        }
        ul { padding-left: 20px; }
        li { margin: 8px 0; }
        .footer { 
            margin-top: 40px; 
            text-align: center; 
            color: #6b7280; 
            font-size: 0.9em; 
            border-top: 1px solid #e5e7eb; 
            padding-top: 20px;
        }
        .no-print { margin-top: 20px; text-align: center; }
        button {
            background: linear-gradient(135deg, #7c3aed, #3b82f6);
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 8px;
            cursor: pointer;
            font-size: 16px;
            font-weight: 600;
            margin: 0 10px;
        }
        button:hover { opacity: 0.9; }
    </style>
</head>
<body>
    <div class="header">
        <h1>${reportTypeInfo.label}</h1>
        <p style="margin: 15px 0 0 0; font-size: 1.2em; opacity: 0.9;">
            Generated on ${new Date().toLocaleDateString()} | ${dateRange.start} to ${dateRange.end}
        </p>
    </div>
    
    <div class="summary">
        <strong>📊 Report Overview:</strong> ${reportTypeInfo.description}
    </div>
    
    <div style="white-space: pre-wrap; font-family: inherit;">${printContent}</div>
    
    <div class="footer">
        <p>This report was generated by the Transportation Analytics System</p>
        <p>${new Date().toLocaleString()}</p>
    </div>
    
    <div class="no-print">
        <button onclick="window.print()">🖨️ Print Report</button>
        <button onclick="window.close()">❌ Close</button>
    </div>
</body>
</html>`;

                    const printPreviewWindow = window.open('', '_blank', 'width=800,height=600');
                    if (printPreviewWindow) {
                        printPreviewWindow.document.write(printHtml);
                        printPreviewWindow.document.close();
                        printPreviewWindow.focus();
                    } else {
                        alert('Pop-up blocked! Please allow pop-ups for this site to use print preview.');
                    }
                    break;

                default:
                    console.warn('Unsupported export format:', format);
            }

            // Show success notification
            const notification = document.createElement('div');
            notification.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                background: linear-gradient(135deg, #10b981, #059669);
                color: white;
                padding: 16px 24px;
                border-radius: 12px;
                box-shadow: 0 10px 25px rgba(0,0,0,0.1);
                z-index: 10000;
                font-weight: 600;
                animation: slideIn 0.3s ease-out;
            `;
            notification.innerHTML = `
                <div style="display: flex; align-items: center; gap: 8px;">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="20,6 9,17 4,12"></polyline>
                    </svg>
                    ${format.toUpperCase()} export completed successfully!
                </div>
            `;

            // Add animation keyframes
            if (!document.getElementById('export-animation-styles')) {
                const style = document.createElement('style');
                style.id = 'export-animation-styles';
                style.textContent = `
                    @keyframes slideIn {
                        from { transform: translateX(100%); opacity: 0; }
                        to { transform: translateX(0); opacity: 1; }
                    }
                `;
                document.head.appendChild(style);
            }

            document.body.appendChild(notification);
            setTimeout(() => {
                if (notification && notification.parentNode) {
                    notification.style.animation = 'slideIn 0.3s ease-out reverse';
                    setTimeout(() => {
                        document.body.removeChild(notification);
                    }, 300);
                }
            }, 3000);

        } catch (error) {
            console.error('Export failed:', error);
            alert(`Export failed: ${error.message}`);
        } finally {
            // Clear export status
            setExportingFormats(prev => {
                const newSet = new Set(prev);
                newSet.delete(format);
                return newSet;
            });
        }
    };

    // Quick export function that exports all formats
    const handleQuickExport = async () => {
        setIsQuickExporting(true);
        const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
        const reportTypeInfo = reportTypes.find(type => type.id === selectedReportType);

        try {
            // Show loading notification
            const loadingNotification = document.createElement('div');
            loadingNotification.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                background: linear-gradient(135deg, #7c3aed, #3b82f6);
                color: white;
                padding: 16px 24px;
                border-radius: 12px;
                box-shadow: 0 10px 25px rgba(0,0,0,0.1);
                z-index: 10000;
                font-weight: 600;
            `;
            loadingNotification.innerHTML = `
                <div style="display: flex; align-items: center; gap: 8px;">
                    <div style="width: 20px; height: 20px; border: 2px solid rgba(255,255,255,0.3); border-top: 2px solid white; border-radius: 50%; animation: spin 1s linear infinite;"></div>
                    Preparing quick export...
                </div>
            `;

            // Add spin animation
            if (!document.getElementById('spin-animation-styles')) {
                const style = document.createElement('style');
                style.id = 'spin-animation-styles';
                style.textContent = `
                    @keyframes spin {
                        0% { transform: rotate(0deg); }
                        100% { transform: rotate(360deg); }
                    }
                `;
                document.head.appendChild(style);
            }

            document.body.appendChild(loadingNotification);

            // Export all formats with small delays (excluding print as it opens in new window)
            await new Promise(resolve => setTimeout(resolve, 500));
            await handleExport('csv');
            await new Promise(resolve => setTimeout(resolve, 500));
            await handleExport('excel');
            await new Promise(resolve => setTimeout(resolve, 500));
            await handleExport('json');
            await new Promise(resolve => setTimeout(resolve, 500));
            await handleExport('pdf');

            // Remove loading notification
            if (loadingNotification && loadingNotification.parentNode) {
                document.body.removeChild(loadingNotification);
            }

            // Show completion notification
            const notification = document.createElement('div');
            notification.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                background: linear-gradient(135deg, #10b981, #059669);
                color: white;
                padding: 16px 24px;
                border-radius: 12px;
                box-shadow: 0 10px 25px rgba(0,0,0,0.1);
                z-index: 10000;
                font-weight: 600;
            `;
            notification.innerHTML = `
                <div style="display: flex; align-items: center; gap: 8px;">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="20,6 9,17 4,12"></polyline>
                    </svg>
                    Quick export completed! PDF, CSV, Excel & JSON downloaded.
                </div>
            `;

            document.body.appendChild(notification);
            setTimeout(() => {
                if (notification && notification.parentNode) {
                    document.body.removeChild(notification);
                }
            }, 4000);

        } catch (error) {
            console.error('Quick export failed:', error);
            alert(`Quick export failed: ${error.message}`);
        } finally {
            setIsQuickExporting(false);
        }
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
                                    <td className={`py-3 text-right font-medium ${row.growth.startsWith('+') ? 'text-green-600' : 'text-red-600'
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
        <div className="p-4 lg:p-6 space-y-6 lg:space-y-8 bg-gradient-to-br from-slate-50 via-purple-50/40 to-blue-50/40 min-h-screen relative overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 bg-grid-slate-900/[0.04] bg-[size:75px_75px] pointer-events-none"></div>
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-blue-500/5 pointer-events-none"></div>

            {/* Enhanced Header with Animation */}
            <div className="mb-6 lg:mb-8 relative z-10">
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
                    <div className="space-y-4">
                        <div className="flex items-center space-x-4">
                            <div className="relative">
                                <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-600 via-purple-700 to-blue-600 shadow-2xl transform hover:scale-105 transition-transform duration-300">
                                    <FileText className="w-8 h-8 text-white" />
                                </div>
                                <div className="absolute -top-1 -right-1 p-1 bg-green-500 rounded-full">
                                    <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                                </div>
                            </div>
                            <div>
                                <h1 className="text-3xl lg:text-5xl font-bold bg-gradient-to-r from-purple-600 via-purple-700 to-blue-600 bg-clip-text text-transparent leading-tight">
                                    Reports & Analytics
                                </h1>
                                <p className="text-gray-600 text-base lg:text-lg mt-2 font-medium">Generate comprehensive analytical reports and export data</p>
                            </div>
                        </div>

                        {/* Stats Row */}
                        <div className="flex items-center space-x-6 text-sm">
                            <div className="flex items-center space-x-2 px-3 py-2 bg-white/60 backdrop-blur-sm rounded-full border border-white/20 shadow-sm">
                                <Calendar className="w-4 h-4 text-purple-600" />
                                <span className="text-gray-700 font-medium">Last updated: Sept 26, 2025</span>
                            </div>
                            <div className="flex items-center space-x-2 px-3 py-2 bg-white/60 backdrop-blur-sm rounded-full border border-white/20 shadow-sm">
                                <Activity className="w-4 h-4 text-green-600" />
                                <span className="text-gray-700 font-medium">Real-time data</span>
                            </div>
                            <div className="flex items-center space-x-2 px-3 py-2 bg-white/60 backdrop-blur-sm rounded-full border border-white/20 shadow-sm">
                                <Users className="w-4 h-4 text-blue-600" />
                                <span className="text-gray-700 font-medium">5 Active Reports</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 lg:mt-4">
                        <Button
                            onClick={handleQuickExport}
                            disabled={isQuickExporting}
                            variant="outline"
                            className="border-purple-200 text-purple-700 hover:bg-purple-50 hover:border-purple-300 transition-all duration-300 shadow-lg hover:shadow-xl backdrop-blur-sm bg-white/80 hover:scale-105 transform disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                        >
                            {isQuickExporting ? (
                                <>
                                    <div className="w-4 h-4 mr-2 border-2 border-purple-300 border-t-purple-700 rounded-full animate-spin"></div>
                                    Exporting...
                                </>
                            ) : (
                                <>
                                    <Download className="w-4 h-4 mr-2" />
                                    Quick Export
                                </>
                            )}
                        </Button>
                        <Button
                            onClick={() => setShowWizard(!showWizard)}
                            className="bg-gradient-to-r from-purple-600 via-purple-700 to-blue-600 hover:from-purple-700 hover:via-purple-800 hover:to-blue-700 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
                        >
                            <Settings className="w-4 h-4 mr-2" />
                            {showWizard ? 'Close' : 'Open'} Report Builder
                        </Button>
                    </div>
                </div>
            </div>

            {/* Enhanced Report Builder Wizard with Glass Effect */}
            {showWizard && (
                <Card className="shadow-2xl border-0 bg-white/70 backdrop-blur-xl relative z-10 animate-in slide-in-from-top-5 duration-500 overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-blue-500/5 to-purple-500/10"></div>
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 via-blue-500 to-purple-500"></div>

                    <CardHeader className="pb-6 relative z-10">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                                <div className="p-3 rounded-xl bg-gradient-to-br from-purple-600 to-blue-600 shadow-lg">
                                    <Settings className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <CardTitle className="text-2xl lg:text-3xl font-bold text-gray-900">
                                        Report Builder Wizard
                                    </CardTitle>
                                    <CardDescription className="text-base text-gray-600 mt-1">
                                        Follow the steps to configure and generate your custom report
                                    </CardDescription>
                                </div>
                            </div>
                            <div className="flex items-center space-x-3">
                                <Badge variant="secondary" className="bg-gradient-to-r from-purple-100 to-blue-100 text-purple-800 px-4 py-2 text-sm font-semibold">
                                    Step {currentStep} of 3
                                </Badge>
                                <div className="flex items-center space-x-1">
                                    <div className={`w-2 h-2 rounded-full transition-colors ${currentStep >= 1 ? 'bg-purple-500' : 'bg-gray-300'}`}></div>
                                    <div className={`w-2 h-2 rounded-full transition-colors ${currentStep >= 2 ? 'bg-purple-500' : 'bg-gray-300'}`}></div>
                                    <div className={`w-2 h-2 rounded-full transition-colors ${currentStep >= 3 ? 'bg-purple-500' : 'bg-gray-300'}`}></div>
                                </div>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="relative z-10">
                        {/* Modern Step Indicator with Progress Bar */}
                        <div className="relative mb-12">
                            {/* Progress Line */}
                            <div className="absolute top-8 left-8 right-8 h-0.5 bg-gray-200 rounded-full"></div>
                            <div
                                className="absolute top-8 left-8 h-0.5 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full transition-all duration-700 ease-out"
                                style={{ width: `${((currentStep - 1) / (reportSteps.length - 1)) * 100}%` }}
                            ></div>

                            {/* Step Circles */}
                            <div className="flex justify-between items-start px-8">
                                {reportSteps.map((step, index) => (
                                    <div key={step.id} className="flex flex-col items-center relative bg-white px-6">
                                        <div className={`flex items-center justify-center w-16 h-16 rounded-2xl border-2 transition-all duration-500 transform ${currentStep >= step.id
                                            ? 'bg-gradient-to-br from-purple-600 to-blue-600 border-purple-600 text-white shadow-2xl scale-110 rotate-3'
                                            : currentStep === step.id - 1
                                                ? 'border-purple-300 text-purple-400 bg-purple-50 animate-pulse scale-105'
                                                : 'border-gray-300 text-gray-400 bg-white hover:border-gray-400'
                                            }`}>
                                            {currentStep > step.id ? (
                                                <CheckCircle className="w-8 h-8" />
                                            ) : (
                                                <span className="font-bold text-lg">{step.id}</span>
                                            )}
                                        </div>
                                        <div className="mt-4 text-center max-w-32">
                                            <p className={`font-bold text-sm transition-colors ${currentStep >= step.id ? 'text-gray-900' : 'text-gray-400'
                                                }`}>
                                                {step.title}
                                            </p>
                                            <p className="text-xs text-gray-500 mt-1 leading-tight">{step.description}</p>
                                        </div>

                                        {/* Floating Animation for Current Step */}
                                        {currentStep === step.id && (
                                            <div className="absolute -top-2 -right-2 w-4 h-4 bg-green-500 rounded-full animate-ping"></div>
                                        )}
                                    </div>
                                ))}
                            </div>
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

            {/* Main Layout with Glass Effect */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 lg:gap-6 relative z-10">
                {/* Enhanced Left Sidebar - Filters with Glass Effect */}
                <div className="lg:col-span-1">
                    <Card className="border-0 shadow-2xl bg-white/70 backdrop-blur-xl sticky top-6 hover:shadow-3xl transition-all duration-500 overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-blue-500/5 to-purple-500/10"></div>
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 via-blue-500 to-purple-500"></div>

                        <CardHeader className="pb-6 relative z-10">
                            <div className="flex items-center space-x-3">
                                <div className="p-2 rounded-lg bg-gradient-to-br from-purple-600 to-blue-600 shadow-lg">
                                    <Filter className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <CardTitle className="text-xl font-bold text-gray-900">
                                        Report Filters
                                    </CardTitle>
                                    <CardDescription className="text-gray-600">
                                        Configure your report parameters
                                    </CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-6 relative z-10">
                            {/* Report Type Filter with Enhanced Cards */}
                            <div>
                                <label className="flex items-center text-sm font-bold text-gray-700 mb-4">
                                    <BarChart3 className="w-4 h-4 mr-2 text-purple-600" />
                                    Report Type
                                </label>
                                <div className="space-y-3">
                                    {reportTypes.map(type => {
                                        const Icon = type.icon;
                                        return (
                                            <Card
                                                key={type.id}
                                                className={`cursor-pointer transition-all duration-300 transform hover:scale-105 border-0 shadow-lg hover:shadow-xl ${selectedReportType === type.id
                                                    ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-2xl scale-105'
                                                    : 'bg-white/80 backdrop-blur-sm hover:bg-gradient-to-r hover:from-purple-50 hover:to-blue-50 border border-gray-200/50'
                                                    }`}
                                                onClick={() => setSelectedReportType(type.id)}
                                            >
                                                <CardContent className="p-4">
                                                    <div className="flex items-center space-x-3">
                                                        <div className={`p-3 rounded-xl shadow-lg transition-all duration-300 ${selectedReportType === type.id
                                                            ? 'bg-white/20 backdrop-blur-sm scale-110'
                                                            : `bg-gradient-to-r ${type.gradient} text-white`
                                                            }`}>
                                                            <Icon className="w-5 h-5" />
                                                        </div>
                                                        <div className="flex-1">
                                                            <p className="font-bold text-sm">{type.label}</p>
                                                            <p className={`text-xs mt-1 ${selectedReportType === type.id ? 'text-purple-100' : 'text-gray-500'
                                                                }`}>
                                                                {type.description}
                                                            </p>
                                                        </div>
                                                        {selectedReportType === type.id && (
                                                            <CheckCircle className="w-5 h-5 text-white animate-pulse" />
                                                        )}
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Date Range Filter with Enhanced Styling */}
                            <div>
                                <label className="flex items-center text-sm font-bold text-gray-700 mb-4">
                                    <Calendar className="w-4 h-4 mr-2 text-purple-600" />
                                    Date Range
                                </label>
                                <div className="space-y-4">
                                    <div className="relative">
                                        <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">Start Date</label>
                                        <div className="relative">
                                            <input
                                                type="date"
                                                value={dateRange.start}
                                                onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                                                className="w-full p-3 border-0 bg-white/80 backdrop-blur-sm rounded-xl text-sm focus:ring-2 focus:ring-purple-500 shadow-lg hover:shadow-xl transition-all duration-300 focus:bg-white"
                                            />
                                            <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-500/10 to-blue-500/10 pointer-events-none"></div>
                                        </div>
                                    </div>
                                    <div className="relative">
                                        <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">End Date</label>
                                        <div className="relative">
                                            <input
                                                type="date"
                                                value={dateRange.end}
                                                onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                                                className="w-full p-3 border-0 bg-white/80 backdrop-blur-sm rounded-xl text-sm focus:ring-2 focus:ring-purple-500 shadow-lg hover:shadow-xl transition-all duration-300 focus:bg-white"
                                            />
                                            <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-500/10 to-blue-500/10 pointer-events-none"></div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Quick Export Buttons with Enhanced Design */}
                            <div>
                                <label className="flex items-center text-sm font-bold text-gray-700 mb-4">
                                    <Download className="w-4 h-4 mr-2 text-purple-600" />
                                    Quick Export
                                </label>
                                <div className="space-y-3">
                                    {exportFormats.map(format => (
                                        <Card
                                            key={format.id}
                                            className="cursor-pointer transition-all duration-300 transform hover:scale-105 border-0 bg-white/80 backdrop-blur-sm shadow-lg hover:shadow-2xl"
                                            onClick={() => handleExport(format.id)}
                                        >
                                            <CardContent className="p-4">
                                                <div className="flex items-center space-x-3">
                                                    <div className={`p-3 rounded-xl bg-gradient-to-r ${format.gradient} shadow-lg`}>
                                                        <format.icon className="w-5 h-5 text-white" />
                                                    </div>
                                                    <div className="flex-1">
                                                        <p className="font-bold text-sm text-gray-800">{format.label}</p>
                                                        <p className="text-xs text-gray-500 mt-1">{format.description}</p>
                                                    </div>
                                                    <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-purple-500 transition-colors" />
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Enhanced Main Content Area with Glass Effect */}
                <div className="lg:col-span-3">
                    <Card className="border-0 shadow-2xl bg-white/70 backdrop-blur-xl hover:shadow-3xl transition-all duration-500 overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-blue-500/5 to-purple-500/5"></div>
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 via-blue-500 to-purple-500"></div>

                        {/* Report Preview Header */}
                        <CardHeader className="pb-6 border-b border-gray-200/30 relative z-10">
                            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                                <div className="space-y-3">
                                    <div className="flex items-center space-x-4">
                                        <div className="p-3 rounded-xl bg-gradient-to-br from-purple-600 to-blue-600 shadow-lg">
                                            <Eye className="w-6 h-6 text-white" />
                                        </div>
                                        <div>
                                            <CardTitle className="text-2xl lg:text-3xl font-bold text-gray-900">
                                                Report Preview
                                            </CardTitle>
                                            <Badge variant="secondary" className="mt-2 bg-gradient-to-r from-purple-100 to-blue-100 text-purple-800 px-3 py-1">
                                                {currentReportType?.label}
                                            </Badge>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-6 text-sm ml-16 lg:ml-0">
                                        <div className="flex items-center space-x-2 px-3 py-2 bg-white/60 backdrop-blur-sm rounded-full border border-white/20">
                                            <Calendar className="w-4 h-4 text-purple-600" />
                                            <span className="text-gray-700 font-medium">{dateRange.start} to {dateRange.end}</span>
                                        </div>
                                        <div className="flex items-center space-x-2 px-3 py-2 bg-white/60 backdrop-blur-sm rounded-full border border-white/20">
                                            <Activity className="w-4 h-4 text-green-600" />
                                            <span className="text-green-600 font-medium">Live Data</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {exportFormats.map(format => {
                                        const isExporting = exportingFormats.has(format.id);
                                        return (
                                            <Button
                                                key={format.id}
                                                onClick={() => handleExport(format.id)}
                                                disabled={isExporting}
                                                className={`bg-gradient-to-r ${format.gradient} hover:opacity-90 transition-all duration-300 text-white shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none`}
                                                size="sm"
                                            >
                                                {isExporting ? (
                                                    <>
                                                        <div className="w-4 h-4 mr-1 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                                        Exporting...
                                                    </>
                                                ) : (
                                                    <>
                                                        <format.icon className="w-4 h-4 mr-1" />
                                                        {format.id.toUpperCase()}
                                                    </>
                                                )}
                                            </Button>
                                        );
                                    })}
                                </div>
                            </div>
                        </CardHeader>

                        {/* Report Content */}
                        <CardContent className="p-4 lg:p-6 relative z-10">
                            {/* Chart Section with Enhanced Design */}
                            <div className="mb-8">
                                <div className="flex items-center justify-between mb-6">
                                    <div className="flex items-center space-x-3">
                                        <div className="p-3 rounded-xl bg-gradient-to-br from-purple-600 to-blue-600 shadow-lg">
                                            <BarChart3 className="w-6 h-6 text-white" />
                                        </div>
                                        <div>
                                            <h3 className="text-xl lg:text-2xl font-bold text-gray-800">
                                                {currentReportType?.label} Visualization
                                            </h3>
                                            <p className="text-gray-600 text-sm">Interactive data visualization</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <Badge variant="outline" className="border-green-200 text-green-700 bg-green-50/80 backdrop-blur-sm">
                                            <Activity className="w-3 h-3 mr-1" />
                                            Real-time
                                        </Badge>
                                        <Badge variant="outline" className="border-blue-200 text-blue-700 bg-blue-50/80 backdrop-blur-sm">
                                            <TrendingUp className="w-3 h-3 mr-1" />
                                            Updated
                                        </Badge>
                                    </div>
                                </div>
                                <Card className="bg-white/60 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-500">
                                    <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-blue-500/5 rounded-lg"></div>
                                    <CardContent className="p-6 relative z-10">
                                        {renderChart()}
                                    </CardContent>
                                </Card>
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
