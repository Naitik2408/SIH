import React, { useState } from 'react';
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
    Legend,
    Cell
} from 'recharts';
import {
    Users as UsersIcon,
    Filter,
    Download,
    Calendar,
    MapPin,
    Clock,
    TrendingUp,
    UserCheck,
    Activity,
    Briefcase,
    GraduationCap,
    Home,
    Eye,
    ArrowUp,
    ArrowDown,
    Search,
    MoreHorizontal,
    FileSpreadsheet,
    User,
    Mail,
    Phone
} from 'lucide-react';

// Sample users data
const usersData = [
    {
        id: 'U001',
        name: 'Arjun Sharma',
        age: 28,
        gender: 'Male',
        occupation: 'Employee',
        modePreference: 'Metro',
        tripsCount: 245,
        lastActive: '2025-09-21',
        signupDate: '2025-01-15',
        email: 'arjun.sharma@example.com',
        phone: '+91-9876543210',
        cohort: 'Q1-2025'
    },
    {
        id: 'U002',
        name: 'Priya Patel',
        age: 22,
        gender: 'Female',
        occupation: 'Student',
        modePreference: 'Bus',
        tripsCount: 189,
        lastActive: '2025-09-20',
        signupDate: '2025-02-08',
        email: 'priya.patel@example.com',
        phone: '+91-9765432109',
        cohort: 'Q1-2025'
    },
    {
        id: 'U003',
        name: 'Rajesh Kumar',
        age: 35,
        gender: 'Male',
        occupation: 'Employee',
        modePreference: 'Auto',
        tripsCount: 156,
        lastActive: '2025-09-19',
        signupDate: '2025-03-22',
        email: 'rajesh.kumar@example.com',
        phone: '+91-9654321098',
        cohort: 'Q1-2025'
    },
    {
        id: 'U004',
        name: 'Sneha Singh',
        age: 26,
        gender: 'Female',
        occupation: 'Employee',
        modePreference: 'Metro',
        tripsCount: 298,
        lastActive: '2025-09-21',
        signupDate: '2025-01-10',
        email: 'sneha.singh@example.com',
        phone: '+91-9543210987',
        cohort: 'Q1-2025'
    },
    {
        id: 'U005',
        name: 'Amit Verma',
        age: 31,
        gender: 'Male',
        occupation: 'Employee',
        modePreference: 'Bus',
        tripsCount: 203,
        lastActive: '2025-09-20',
        signupDate: '2025-04-05',
        email: 'amit.verma@example.com',
        phone: '+91-9432109876',
        cohort: 'Q2-2025'
    },
    {
        id: 'U006',
        name: 'Kavya Reddy',
        age: 20,
        gender: 'Female',
        occupation: 'Student',
        modePreference: 'Metro',
        tripsCount: 134,
        lastActive: '2025-09-18',
        signupDate: '2025-05-18',
        email: 'kavya.reddy@example.com',
        phone: '+91-9321098765',
        cohort: 'Q2-2025'
    },
    {
        id: 'U007',
        name: 'Vikram Mehta',
        age: 42,
        gender: 'Male',
        occupation: 'Employee',
        modePreference: 'Auto',
        tripsCount: 167,
        lastActive: '2025-09-17',
        signupDate: '2025-06-12',
        email: 'vikram.mehta@example.com',
        phone: '+91-9210987654',
        cohort: 'Q2-2025'
    },
    {
        id: 'U008',
        name: 'Anita Joshi',
        age: 65,
        gender: 'Female',
        occupation: 'Retired',
        modePreference: 'Bus',
        tripsCount: 98,
        lastActive: '2025-09-16',
        signupDate: '2025-07-08',
        email: 'anita.joshi@example.com',
        phone: '+91-9109876543',
        cohort: 'Q3-2025'
    },
    {
        id: 'U009',
        name: 'Rohit Gupta',
        age: 24,
        gender: 'Male',
        occupation: 'Student',
        modePreference: 'Metro',
        tripsCount: 178,
        lastActive: '2025-09-21',
        signupDate: '2025-08-15',
        email: 'rohit.gupta@example.com',
        phone: '+91-8998765432',
        cohort: 'Q3-2025'
    },
    {
        id: 'U010',
        name: 'Meera Nair',
        age: 29,
        gender: 'Female',
        occupation: 'Homemaker',
        modePreference: 'Bus',
        tripsCount: 112,
        lastActive: '2025-09-15',
        signupDate: '2025-09-01',
        email: 'meera.nair@example.com',
        phone: '+91-8887654321',
        cohort: 'Q3-2025'
    }
];

// Cohort retention data (weeks since signup)
const cohortRetentionData = [
    { week: 'Week 1', retention: 100, activeUsers: 2500 },
    { week: 'Week 2', retention: 85, activeUsers: 2125 },
    { week: 'Week 3', retention: 72, activeUsers: 1800 },
    { week: 'Week 4', retention: 68, activeUsers: 1700 },
    { week: 'Week 8', retention: 58, activeUsers: 1450 },
    { week: 'Week 12', retention: 52, activeUsers: 1300 },
    { week: 'Week 16', retention: 48, activeUsers: 1200 },
    { week: 'Week 20', retention: 45, activeUsers: 1125 },
    { week: 'Week 24', retention: 42, activeUsers: 1050 },
    { week: 'Week 28', retention: 40, activeUsers: 1000 },
    { week: 'Week 32', retention: 38, activeUsers: 950 },
    { week: 'Week 36', retention: 36, activeUsers: 900 }
];

// Segment distribution data
const segmentData = [
    { segment: 'Employees', count: 4580, percentage: 52.3, color: '#3B82F6' },
    { segment: 'Students', count: 2140, percentage: 24.4, color: '#10B981' },
    { segment: 'Homemakers', count: 1250, percentage: 14.3, color: '#F59E0B' },
    { segment: 'Retired', count: 780, percentage: 8.9, color: '#8B5CF6' }
];

// Filter options
const genderOptions = ['All', 'Male', 'Female'];
const ageGroupOptions = ['All', '18-25', '26-35', '36-45', '46-55', '56+'];
const occupationOptions = ['All', 'Student', 'Employee', 'Homemaker', 'Retired'];
const modeOptions = ['All', 'Metro', 'Bus', 'Auto', 'Walk'];

// Helper function to get age group
const getAgeGroup = (age) => {
    if (age <= 25) return '18-25';
    if (age <= 35) return '26-35';
    if (age <= 45) return '36-45';
    if (age <= 55) return '46-55';
    return '56+';
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
                        {entry.name === 'retention' && '%'}
                        {entry.name === 'activeUsers' && ' users'}
                    </p>
                ))}
            </div>
        );
    }
    return null;
};

const Users = () => {
    const [selectedGender, setSelectedGender] = useState('All');
    const [selectedAgeGroup, setSelectedAgeGroup] = useState('All');
    const [selectedOccupation, setSelectedOccupation] = useState('All');
    const [selectedMode, setSelectedMode] = useState('All');
    const [searchTerm, setSearchTerm] = useState('');
    const [sortField, setSortField] = useState('name');
    const [sortDirection, setSortDirection] = useState('asc');
    const [currentPage, setCurrentPage] = useState(1);
    const usersPerPage = 5;

    // Filter users based on selected filters
    const filteredUsers = usersData.filter(user => {
        if (selectedGender !== 'All' && user.gender !== selectedGender) return false;
        if (selectedAgeGroup !== 'All' && getAgeGroup(user.age) !== selectedAgeGroup) return false;
        if (selectedOccupation !== 'All' && user.occupation !== selectedOccupation) return false;
        if (selectedMode !== 'All' && user.modePreference !== selectedMode) return false;
        if (searchTerm && !user.name.toLowerCase().includes(searchTerm.toLowerCase()) && 
            !user.id.toLowerCase().includes(searchTerm.toLowerCase())) return false;
        return true;
    });

    // Sort users
    const sortedUsers = [...filteredUsers].sort((a, b) => {
        let aValue = a[sortField];
        let bValue = b[sortField];
        
        if (sortField === 'lastActive') {
            aValue = new Date(aValue);
            bValue = new Date(bValue);
        }
        
        if (sortDirection === 'asc') {
            return aValue > bValue ? 1 : -1;
        } else {
            return aValue < bValue ? 1 : -1;
        }
    });

    // Pagination
    const totalPages = Math.ceil(sortedUsers.length / usersPerPage);
    const startIndex = (currentPage - 1) * usersPerPage;
    const paginatedUsers = sortedUsers.slice(startIndex, startIndex + usersPerPage);

    // Handle sort
    const handleSort = (field) => {
        if (sortField === field) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortDirection('asc');
        }
    };

    // Export cohort data function
    const handleExportCohort = () => {
        const cohortExportData = {
            retentionCurve: cohortRetentionData,
            segmentDistribution: segmentData,
            filteredUsers: filteredUsers,
            exportDate: new Date().toISOString(),
            filters: {
                gender: selectedGender,
                ageGroup: selectedAgeGroup,
                occupation: selectedOccupation,
                mode: selectedMode
            }
        };
        
        console.log('Exporting cohort data:', cohortExportData);
        
        // Simulate export process
        setTimeout(() => {
            alert('Cohort data exported successfully! (Check console for details)');
        }, 1000);
    };

    // Calculate summary stats
    const summaryStats = {
        totalUsers: filteredUsers.length,
        activeToday: filteredUsers.filter(u => u.lastActive === '2025-09-21').length,
        avgTrips: Math.round(filteredUsers.reduce((sum, u) => sum + u.tripsCount, 0) / filteredUsers.length || 0),
        topMode: filteredUsers.reduce((acc, user) => {
            acc[user.modePreference] = (acc[user.modePreference] || 0) + 1;
            return acc;
        }, {})
    };

    const mostPopularMode = Object.entries(summaryStats.topMode).sort(([,a], [,b]) => b - a)[0]?.[0] || 'N/A';

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900">Users & Cohorts</h1>
                <p className="text-gray-600 mt-2">User analytics, cohort analysis, and behavioral insights</p>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-white rounded-xl shadow-md border p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Total Users</p>
                            <p className="text-2xl font-bold text-gray-900">{summaryStats.totalUsers}</p>
                        </div>
                        <div className="p-3 rounded-lg bg-blue-100 text-blue-600">
                            <UsersIcon className="w-6 h-6" />
                        </div>
                    </div>
                </div>
                
                <div className="bg-white rounded-xl shadow-md border p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Active Today</p>
                            <p className="text-2xl font-bold text-green-600">{summaryStats.activeToday}</p>
                        </div>
                        <div className="p-3 rounded-lg bg-green-100 text-green-600">
                            <Activity className="w-6 h-6" />
                        </div>
                    </div>
                </div>
                
                <div className="bg-white rounded-xl shadow-md border p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Avg Trips</p>
                            <p className="text-2xl font-bold text-purple-600">{summaryStats.avgTrips}</p>
                        </div>
                        <div className="p-3 rounded-lg bg-purple-100 text-purple-600">
                            <TrendingUp className="w-6 h-6" />
                        </div>
                    </div>
                </div>
                
                <div className="bg-white rounded-xl shadow-md border p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Top Mode</p>
                            <p className="text-2xl font-bold text-orange-600">{mostPopularMode}</p>
                        </div>
                        <div className="p-3 rounded-lg bg-orange-100 text-orange-600">
                            <MapPin className="w-6 h-6" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-2xl shadow-md border p-6">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                        <Filter className="w-5 h-5 mr-2 text-gray-500" />
                        <h2 className="text-lg font-semibold text-gray-800">Filters</h2>
                    </div>
                    <button
                        onClick={handleExportCohort}
                        className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center"
                    >
                        <Download className="w-4 h-4 mr-2" />
                        Export Cohort Data
                    </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
                        <div className="relative">
                            <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search users..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                        <select
                            value={selectedGender}
                            onChange={(e) => setSelectedGender(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            {genderOptions.map(option => (
                                <option key={option} value={option}>{option}</option>
                            ))}
                        </select>
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Age Group</label>
                        <select
                            value={selectedAgeGroup}
                            onChange={(e) => setSelectedAgeGroup(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            {ageGroupOptions.map(option => (
                                <option key={option} value={option}>{option}</option>
                            ))}
                        </select>
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Occupation</label>
                        <select
                            value={selectedOccupation}
                            onChange={(e) => setSelectedOccupation(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            {occupationOptions.map(option => (
                                <option key={option} value={option}>{option}</option>
                            ))}
                        </select>
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Mode Preference</label>
                        <select
                            value={selectedMode}
                            onChange={(e) => setSelectedMode(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            {modeOptions.map(option => (
                                <option key={option} value={option}>{option}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Users Table */}
            <div className="bg-white rounded-2xl shadow-md border">
                <div className="p-6 border-b border-gray-200">
                    <h2 className="text-xl font-semibold text-gray-800 flex items-center">
                        <User className="w-5 h-5 mr-2 text-blue-600" />
                        Users ({filteredUsers.length})
                    </h2>
                </div>
                
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-gray-200">
                                <th 
                                    className="text-left py-3 px-4 font-medium text-gray-700 cursor-pointer hover:bg-gray-50"
                                    onClick={() => handleSort('id')}
                                >
                                    <div className="flex items-center">
                                        User ID
                                        {sortField === 'id' && (
                                            sortDirection === 'asc' ? <ArrowUp className="w-4 h-4 ml-1" /> : <ArrowDown className="w-4 h-4 ml-1" />
                                        )}
                                    </div>
                                </th>
                                <th 
                                    className="text-left py-3 px-4 font-medium text-gray-700 cursor-pointer hover:bg-gray-50"
                                    onClick={() => handleSort('name')}
                                >
                                    <div className="flex items-center">
                                        Name
                                        {sortField === 'name' && (
                                            sortDirection === 'asc' ? <ArrowUp className="w-4 h-4 ml-1" /> : <ArrowDown className="w-4 h-4 ml-1" />
                                        )}
                                    </div>
                                </th>
                                <th 
                                    className="text-left py-3 px-4 font-medium text-gray-700 cursor-pointer hover:bg-gray-50"
                                    onClick={() => handleSort('age')}
                                >
                                    <div className="flex items-center">
                                        Age
                                        {sortField === 'age' && (
                                            sortDirection === 'asc' ? <ArrowUp className="w-4 h-4 ml-1" /> : <ArrowDown className="w-4 h-4 ml-1" />
                                        )}
                                    </div>
                                </th>
                                <th className="text-left py-3 px-4 font-medium text-gray-700">Mode Preference</th>
                                <th 
                                    className="text-left py-3 px-4 font-medium text-gray-700 cursor-pointer hover:bg-gray-50"
                                    onClick={() => handleSort('tripsCount')}
                                >
                                    <div className="flex items-center">
                                        Trips Count
                                        {sortField === 'tripsCount' && (
                                            sortDirection === 'asc' ? <ArrowUp className="w-4 h-4 ml-1" /> : <ArrowDown className="w-4 h-4 ml-1" />
                                        )}
                                    </div>
                                </th>
                                <th 
                                    className="text-left py-3 px-4 font-medium text-gray-700 cursor-pointer hover:bg-gray-50"
                                    onClick={() => handleSort('lastActive')}
                                >
                                    <div className="flex items-center">
                                        Last Active
                                        {sortField === 'lastActive' && (
                                            sortDirection === 'asc' ? <ArrowUp className="w-4 h-4 ml-1" /> : <ArrowDown className="w-4 h-4 ml-1" />
                                        )}
                                    </div>
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginatedUsers.map((user) => (
                                <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50">
                                    <td className="py-4 px-4">
                                        <span className="font-medium text-blue-600">{user.id}</span>
                                    </td>
                                    <td className="py-4 px-4">
                                        <div>
                                            <p className="font-medium text-gray-800">{user.name}</p>
                                            <p className="text-xs text-gray-500">{user.occupation}</p>
                                        </div>
                                    </td>
                                    <td className="py-4 px-4">
                                        <span className="text-gray-700">{user.age}</span>
                                    </td>
                                    <td className="py-4 px-4">
                                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                                            user.modePreference === 'Metro' ? 'bg-blue-100 text-blue-600' :
                                            user.modePreference === 'Bus' ? 'bg-green-100 text-green-600' :
                                            user.modePreference === 'Auto' ? 'bg-yellow-100 text-yellow-600' :
                                            'bg-purple-100 text-purple-600'
                                        }`}>
                                            {user.modePreference}
                                        </span>
                                    </td>
                                    <td className="py-4 px-4">
                                        <span className="font-medium text-gray-800">{user.tripsCount}</span>
                                    </td>
                                    <td className="py-4 px-4">
                                        <div>
                                            <p className="text-gray-700">{new Date(user.lastActive).toLocaleDateString()}</p>
                                            <p className="text-xs text-gray-500">
                                                {Math.floor((new Date() - new Date(user.lastActive)) / (1000 * 60 * 60 * 24))} days ago
                                            </p>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                
                {/* Pagination */}
                <div className="p-4 border-t border-gray-200 flex items-center justify-between">
                    <div className="text-sm text-gray-700">
                        Showing {startIndex + 1} to {Math.min(startIndex + usersPerPage, sortedUsers.length)} of {sortedUsers.length} users
                    </div>
                    <div className="flex space-x-2">
                        <button
                            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                            disabled={currentPage === 1}
                            className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Previous
                        </button>
                        <span className="px-3 py-2 bg-blue-600 text-white rounded-lg">
                            {currentPage} of {totalPages}
                        </span>
                        <button
                            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                            disabled={currentPage === totalPages}
                            className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Next
                        </button>
                    </div>
                </div>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                {/* Cohort Retention Curve */}
                <div className="bg-white rounded-2xl shadow-md border p-6">
                    <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                        <TrendingUp className="w-5 h-5 mr-2 text-purple-600" />
                        Cohort Retention Analysis
                    </h3>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={cohortRetentionData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="week" />
                                <YAxis yAxisId="left" orientation="left" domain={[0, 100]} />
                                <YAxis yAxisId="right" orientation="right" />
                                <Tooltip content={<CustomTooltip />} />
                                <Legend />
                                <Line
                                    yAxisId="left"
                                    type="monotone"
                                    dataKey="retention"
                                    stroke="#8B5CF6"
                                    strokeWidth={3}
                                    dot={{ r: 5, fill: '#8B5CF6' }}
                                    name="Retention %"
                                />
                                <Line
                                    yAxisId="right"
                                    type="monotone"
                                    dataKey="activeUsers"
                                    stroke="#10B981"
                                    strokeWidth={2}
                                    strokeDasharray="5 5"
                                    dot={{ r: 4, fill: '#10B981' }}
                                    name="Active Users"
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div className="bg-purple-50 p-3 rounded-lg">
                            <p className="font-medium text-purple-800">Week 1 Retention</p>
                            <p className="text-purple-600">100% (Baseline)</p>
                        </div>
                        <div className="bg-blue-50 p-3 rounded-lg">
                            <p className="font-medium text-blue-800">Month 1 Retention</p>
                            <p className="text-blue-600">68% Active</p>
                        </div>
                        <div className="bg-green-50 p-3 rounded-lg">
                            <p className="font-medium text-green-800">Long-term Retention</p>
                            <p className="text-green-600">36% (9 months)</p>
                        </div>
                    </div>
                </div>

                {/* Segment Distribution */}
                <div className="bg-white rounded-2xl shadow-md border p-6">
                    <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                        <UserCheck className="w-5 h-5 mr-2 text-orange-600" />
                        User Segment Distribution
                    </h3>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={segmentData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="segment" />
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
                                    {segmentData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                        {segmentData.map((segment, index) => (
                            <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                                <div className="flex items-center space-x-2">
                                    <div 
                                        className="w-3 h-3 rounded-full"
                                        style={{ backgroundColor: segment.color }}
                                    ></div>
                                    <span className="font-medium text-gray-700">{segment.segment}</span>
                                </div>
                                <div className="text-right">
                                    <span className="font-semibold text-gray-800">{segment.count.toLocaleString()}</span>
                                    <span className="text-xs text-gray-500 ml-2">({segment.percentage}%)</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Key Insights */}
            <div className="bg-white rounded-2xl shadow-md border p-6">
                <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                    <Eye className="w-5 h-5 mr-2 text-green-600" />
                    Key Insights
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-lg">
                        <h4 className="font-semibold text-blue-800 mb-2">User Engagement</h4>
                        <ul className="text-sm text-blue-700 space-y-1">
                            <li>• 68% retention rate after first month</li>
                            <li>• Employees show highest trip frequency</li>
                            <li>• Metro is the preferred mode (45% users)</li>
                        </ul>
                    </div>
                    
                    <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-lg">
                        <h4 className="font-semibold text-green-800 mb-2">Segment Insights</h4>
                        <ul className="text-sm text-green-700 space-y-1">
                            <li>• Employees dominate (52.3% of users)</li>
                            <li>• Students are second largest segment (24.4%)</li>
                            <li>• Strong potential in homemaker segment</li>
                        </ul>
                    </div>
                    
                    <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-4 rounded-lg">
                        <h4 className="font-semibold text-purple-800 mb-2">Recommendations</h4>
                        <ul className="text-sm text-purple-700 space-y-1">
                            <li>• Focus on improving month 2-3 retention</li>
                            <li>• Create targeted campaigns for students</li>
                            <li>• Expand metro connectivity options</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Users;
