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

    const mostPopularMode = Object.entries(summaryStats.topMode).sort(([, a], [, b]) => b - a)[0]?.[0] || 'N/A';

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
                                    <UsersIcon className="w-8 h-8 text-white" />
                                </div>
                                <div className="absolute -top-1 -right-1 p-1 bg-green-500 rounded-full">
                                    <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                                </div>
                            </div>
                            <div>
                                <h1 className="text-3xl lg:text-5xl font-bold bg-gradient-to-r from-purple-600 via-purple-700 to-blue-600 bg-clip-text text-transparent leading-tight">
                                    Users & Cohorts
                                </h1>
                                <p className="text-gray-600 text-base lg:text-lg mt-2 font-medium">User analytics, cohort analysis, and behavioral insights</p>
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
                                <UserCheck className="w-4 h-4 text-blue-600" />
                                <span className="text-gray-700 font-medium">{filteredUsers.length} Active Users</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Enhanced Summary Stats with Glass Effect */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-6 lg:mb-8 relative z-10">
                <div className="bg-white/70 backdrop-blur-xl rounded-2xl shadow-xl border-0 p-6 hover:shadow-2xl transition-all duration-300 transform hover:scale-105 group overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-blue-600/5"></div>
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-blue-600"></div>
                    <div className="flex items-center justify-between relative z-10">
                        <div>
                            <p className="text-sm font-medium text-gray-600 mb-1">Total Users</p>
                            <p className="text-3xl font-bold text-gray-900">{summaryStats.totalUsers}</p>
                            <p className="text-xs text-green-600 font-medium mt-1">+12% from last month</p>
                        </div>
                        <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg group-hover:scale-110 transition-transform duration-300">
                            <UsersIcon className="w-7 h-7 text-white" />
                        </div>
                    </div>
                </div>

                <div className="bg-white/70 backdrop-blur-xl rounded-2xl shadow-xl border-0 p-6 hover:shadow-2xl transition-all duration-300 transform hover:scale-105 group overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-green-600/5"></div>
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-500 to-green-600"></div>
                    <div className="flex items-center justify-between relative z-10">
                        <div>
                            <p className="text-sm font-medium text-gray-600 mb-1">Active Today</p>
                            <p className="text-3xl font-bold text-gray-900">{summaryStats.activeToday}</p>
                            <p className="text-xs text-green-600 font-medium mt-1">+5% from yesterday</p>
                        </div>
                        <div className="p-4 rounded-2xl bg-gradient-to-br from-green-500 to-green-600 shadow-lg group-hover:scale-110 transition-transform duration-300">
                            <Activity className="w-7 h-7 text-white" />
                        </div>
                    </div>
                </div>

                <div className="bg-white/70 backdrop-blur-xl rounded-2xl shadow-xl border-0 p-6 hover:shadow-2xl transition-all duration-300 transform hover:scale-105 group overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-purple-600/5"></div>
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 to-purple-600"></div>
                    <div className="flex items-center justify-between relative z-10">
                        <div>
                            <p className="text-sm font-medium text-gray-600 mb-1">Avg Trips</p>
                            <p className="text-3xl font-bold text-gray-900">{summaryStats.avgTrips}</p>
                            <p className="text-xs text-purple-600 font-medium mt-1">Per user monthly</p>
                        </div>
                        <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-500 to-purple-600 shadow-lg group-hover:scale-110 transition-transform duration-300">
                            <TrendingUp className="w-7 h-7 text-white" />
                        </div>
                    </div>
                </div>

                <div className="bg-white/70 backdrop-blur-xl rounded-2xl shadow-xl border-0 p-6 hover:shadow-2xl transition-all duration-300 transform hover:scale-105 group overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-orange-600/5"></div>
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-500 to-orange-600"></div>
                    <div className="flex items-center justify-between relative z-10">
                        <div>
                            <p className="text-sm font-medium text-gray-600 mb-1">Top Mode</p>
                            <p className="text-3xl font-bold text-gray-900">{mostPopularMode}</p>
                            <p className="text-xs text-orange-600 font-medium mt-1">Most preferred</p>
                        </div>
                        <div className="p-4 rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 shadow-lg group-hover:scale-110 transition-transform duration-300">
                            <MapPin className="w-7 h-7 text-white" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Enhanced Filters with Glass Effect */}
            <div className="bg-white/70 backdrop-blur-xl rounded-2xl shadow-2xl border-0 p-6 hover:shadow-3xl transition-all duration-500 relative z-10 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-blue-500/5 to-purple-500/10"></div>
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 via-blue-500 to-purple-500"></div>

                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6 relative z-10">
                    <div className="flex items-center space-x-3">
                        <div className="p-2 rounded-lg bg-gradient-to-br from-purple-600 to-blue-600 shadow-lg">
                            <Filter className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">Advanced Filters</h2>
                            <p className="text-gray-600 text-sm">Filter and analyze user data</p>
                        </div>
                    </div>
                    <button
                        onClick={handleExportCohort}
                        className="bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-3 rounded-xl hover:from-green-700 hover:to-green-800 transition-all duration-300 flex items-center shadow-lg hover:shadow-xl transform hover:scale-105"
                    >
                        <Download className="w-5 h-5 mr-2" />
                        Export Cohort Data
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 lg:gap-6 relative z-10">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">Search</label>
                        <div className="relative">
                            <Search className="w-5 h-5 absolute left-4 top-1/2 transform -translate-y-1/2 text-purple-400" />
                            <input
                                type="text"
                                placeholder="Search users..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 border-0 bg-white/80 backdrop-blur-sm rounded-xl text-sm focus:ring-2 focus:ring-purple-500 shadow-lg hover:shadow-xl transition-all duration-300 focus:bg-white placeholder-gray-400"
                            />
                            <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-500/10 to-blue-500/10 pointer-events-none"></div>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">Gender</label>
                        <div className="relative">
                            <select
                                value={selectedGender}
                                onChange={(e) => setSelectedGender(e.target.value)}
                                className="w-full px-4 py-3 border-0 bg-white/80 backdrop-blur-sm rounded-xl focus:ring-2 focus:ring-purple-500 shadow-lg hover:shadow-xl transition-all duration-300 focus:bg-white appearance-none cursor-pointer"
                            >
                                {genderOptions.map(option => (
                                    <option key={option} value={option}>{option}</option>
                                ))}
                            </select>
                            <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-500/10 to-blue-500/10 pointer-events-none"></div>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">Age Group</label>
                        <div className="relative">
                            <select
                                value={selectedAgeGroup}
                                onChange={(e) => setSelectedAgeGroup(e.target.value)}
                                className="w-full px-4 py-3 border-0 bg-white/80 backdrop-blur-sm rounded-xl focus:ring-2 focus:ring-purple-500 shadow-lg hover:shadow-xl transition-all duration-300 focus:bg-white appearance-none cursor-pointer"
                            >
                                {ageGroupOptions.map(option => (
                                    <option key={option} value={option}>{option}</option>
                                ))}
                            </select>
                            <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-500/10 to-blue-500/10 pointer-events-none"></div>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">Occupation</label>
                        <div className="relative">
                            <select
                                value={selectedOccupation}
                                onChange={(e) => setSelectedOccupation(e.target.value)}
                                className="w-full px-4 py-3 border-0 bg-white/80 backdrop-blur-sm rounded-xl focus:ring-2 focus:ring-purple-500 shadow-lg hover:shadow-xl transition-all duration-300 focus:bg-white appearance-none cursor-pointer"
                            >
                                {occupationOptions.map(option => (
                                    <option key={option} value={option}>{option}</option>
                                ))}
                            </select>
                            <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-500/10 to-blue-500/10 pointer-events-none"></div>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">Mode Preference</label>
                        <div className="relative">
                            <select
                                value={selectedMode}
                                onChange={(e) => setSelectedMode(e.target.value)}
                                className="w-full px-4 py-3 border-0 bg-white/80 backdrop-blur-sm rounded-xl focus:ring-2 focus:ring-purple-500 shadow-lg hover:shadow-xl transition-all duration-300 focus:bg-white appearance-none cursor-pointer"
                            >
                                {modeOptions.map(option => (
                                    <option key={option} value={option}>{option}</option>
                                ))}
                            </select>
                            <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-500/10 to-blue-500/10 pointer-events-none"></div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Enhanced Users Table with Glass Effect */}
            <div className="bg-white/70 backdrop-blur-xl rounded-2xl shadow-2xl border-0 hover:shadow-3xl transition-all duration-500 relative z-10 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-blue-500/5 to-purple-500/5"></div>
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 via-blue-500 to-purple-500"></div>

                <div className="p-6 border-b border-gray-200/30 relative z-10">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <div className="p-2 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 shadow-lg">
                                <User className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h2 className="text-xl lg:text-2xl font-bold text-gray-900">
                                    User Directory
                                </h2>
                                <p className="text-gray-600 text-sm">
                                    {filteredUsers.length} users found
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-2">
                            <div className="flex items-center space-x-2 px-3 py-2 bg-white/60 backdrop-blur-sm rounded-full border border-white/20">
                                <Activity className="w-4 h-4 text-green-600" />
                                <span className="text-green-600 font-medium text-sm">Live Data</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="overflow-x-auto relative z-10">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-gray-200/50 bg-gradient-to-r from-purple-50/50 to-blue-50/50">
                                <th
                                    className="text-left py-4 px-6 font-bold text-gray-700 cursor-pointer hover:bg-white/50 transition-colors duration-200 rounded-tl-xl"
                                    onClick={() => handleSort('id')}
                                >
                                    <div className="flex items-center space-x-2">
                                        <span>User ID</span>
                                        {sortField === 'id' && (
                                            sortDirection === 'asc' ?
                                                <ArrowUp className="w-4 h-4 text-purple-600" /> :
                                                <ArrowDown className="w-4 h-4 text-purple-600" />
                                        )}
                                    </div>
                                </th>
                                <th
                                    className="text-left py-4 px-6 font-bold text-gray-700 cursor-pointer hover:bg-white/50 transition-colors duration-200"
                                    onClick={() => handleSort('name')}
                                >
                                    <div className="flex items-center space-x-2">
                                        <span>Name</span>
                                        {sortField === 'name' && (
                                            sortDirection === 'asc' ?
                                                <ArrowUp className="w-4 h-4 text-purple-600" /> :
                                                <ArrowDown className="w-4 h-4 text-purple-600" />
                                        )}
                                    </div>
                                </th>
                                <th
                                    className="text-left py-4 px-6 font-bold text-gray-700 cursor-pointer hover:bg-white/50 transition-colors duration-200"
                                    onClick={() => handleSort('age')}
                                >
                                    <div className="flex items-center space-x-2">
                                        <span>Age</span>
                                        {sortField === 'age' && (
                                            sortDirection === 'asc' ?
                                                <ArrowUp className="w-4 h-4 text-purple-600" /> :
                                                <ArrowDown className="w-4 h-4 text-purple-600" />
                                        )}
                                    </div>
                                </th>
                                <th className="text-left py-4 px-6 font-bold text-gray-700">Mode Preference</th>
                                <th
                                    className="text-left py-4 px-6 font-bold text-gray-700 cursor-pointer hover:bg-white/50 transition-colors duration-200"
                                    onClick={() => handleSort('tripsCount')}
                                >
                                    <div className="flex items-center space-x-2">
                                        <span>Trips Count</span>
                                        {sortField === 'tripsCount' && (
                                            sortDirection === 'asc' ?
                                                <ArrowUp className="w-4 h-4 text-purple-600" /> :
                                                <ArrowDown className="w-4 h-4 text-purple-600" />
                                        )}
                                    </div>
                                </th>
                                <th
                                    className="text-left py-4 px-6 font-bold text-gray-700 cursor-pointer hover:bg-white/50 transition-colors duration-200 rounded-tr-xl"
                                    onClick={() => handleSort('lastActive')}
                                >
                                    <div className="flex items-center space-x-2">
                                        <span>Last Active</span>
                                        {sortField === 'lastActive' && (
                                            sortDirection === 'asc' ?
                                                <ArrowUp className="w-4 h-4 text-purple-600" /> :
                                                <ArrowDown className="w-4 h-4 text-purple-600" />
                                        )}
                                    </div>
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginatedUsers.map((user, index) => (
                                <tr key={user.id} className="border-b border-gray-100/50 hover:bg-white/70 transition-all duration-200 group">
                                    <td className="py-5 px-6">
                                        <div className="flex items-center space-x-3">
                                            <div className="w-2 h-2 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full"></div>
                                            <span className="font-bold text-blue-600 group-hover:text-blue-700">{user.id}</span>
                                        </div>
                                    </td>
                                    <td className="py-5 px-6">
                                        <div className="flex items-center space-x-3">
                                            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl flex items-center justify-center shadow-lg">
                                                <span className="text-white font-bold text-sm">{user.name.split(' ').map(n => n[0]).join('')}</span>
                                            </div>
                                            <div>
                                                <p className="font-bold text-gray-800 group-hover:text-gray-900">{user.name}</p>
                                                <p className="text-xs text-gray-500 font-medium">{user.occupation}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-5 px-6">
                                        <span className="font-semibold text-gray-700 px-3 py-1 bg-gray-100 rounded-full">{user.age}</span>
                                    </td>
                                    <td className="py-5 px-6">
                                        <span className={`px-4 py-2 rounded-xl text-sm font-bold shadow-sm ${user.modePreference === 'Metro' ? 'bg-gradient-to-r from-blue-100 to-blue-200 text-blue-700' :
                                                user.modePreference === 'Bus' ? 'bg-gradient-to-r from-green-100 to-green-200 text-green-700' :
                                                    user.modePreference === 'Auto' ? 'bg-gradient-to-r from-yellow-100 to-yellow-200 text-yellow-700' :
                                                        'bg-gradient-to-r from-purple-100 to-purple-200 text-purple-700'
                                            }`}>
                                            {user.modePreference}
                                        </span>
                                    </td>
                                    <td className="py-5 px-6">
                                        <div className="flex items-center space-x-2">
                                            <TrendingUp className="w-4 h-4 text-purple-500" />
                                            <span className="font-bold text-gray-800">{user.tripsCount}</span>
                                        </div>
                                    </td>
                                    <td className="py-5 px-6">
                                        <div>
                                            <p className="font-semibold text-gray-700">{new Date(user.lastActive).toLocaleDateString()}</p>
                                            <p className="text-xs text-gray-500 font-medium">
                                                {Math.floor((new Date() - new Date(user.lastActive)) / (1000 * 60 * 60 * 24))} days ago
                                            </p>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Enhanced Pagination */}
                <div className="p-6 border-t border-gray-200/30 flex flex-col md:flex-row md:items-center md:justify-between gap-4 relative z-10">
                    <div className="text-sm font-medium text-gray-700 px-4 py-2 bg-white/60 backdrop-blur-sm rounded-full border border-white/20">
                        Showing <span className="font-bold text-purple-600">{startIndex + 1}</span> to <span className="font-bold text-purple-600">{Math.min(startIndex + usersPerPage, sortedUsers.length)}</span> of <span className="font-bold text-purple-600">{sortedUsers.length}</span> users
                    </div>
                    <div className="flex items-center space-x-3">
                        <button
                            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                            disabled={currentPage === 1}
                            className="px-4 py-2 border-0 bg-white/80 backdrop-blur-sm rounded-xl hover:bg-white shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 font-medium"
                        >
                            Previous
                        </button>
                        <div className="px-6 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-bold shadow-lg">
                            {currentPage} of {totalPages}
                        </div>
                        <button
                            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                            disabled={currentPage === totalPages}
                            className="px-4 py-2 border-0 bg-white/80 backdrop-blur-sm rounded-xl hover:bg-white shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 font-medium"
                        >
                            Next
                        </button>
                    </div>
                </div>
            </div>

            {/* Enhanced Charts Row with Glass Effect - Stacked Layout */}
            <div className="grid grid-cols-1 gap-6 lg:gap-8 relative z-10">
                {/* Cohort Retention Curve */}
                <div className="bg-white/70 backdrop-blur-xl rounded-2xl shadow-2xl border-0 p-6 hover:shadow-3xl transition-all duration-500 overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-blue-500/5 to-purple-500/10"></div>
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 via-blue-500 to-purple-500"></div>

                    <div className="flex items-center justify-between mb-6 relative z-10">
                        <div className="flex items-center space-x-3">
                            <div className="p-3 rounded-xl bg-gradient-to-br from-purple-600 to-blue-600 shadow-lg">
                                <TrendingUp className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h3 className="text-xl lg:text-2xl font-bold text-gray-900">Cohort Retention Analysis</h3>
                                <p className="text-gray-600 text-sm">User retention over time</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-2 px-3 py-2 bg-white/60 backdrop-blur-sm rounded-full border border-white/20">
                            <Activity className="w-4 h-4 text-green-600" />
                            <span className="text-green-600 font-medium text-sm">Live</span>
                        </div>
                    </div>
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
                    <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm relative z-10">
                        <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-xl border border-purple-200/50 shadow-lg">
                            <div className="flex items-center space-x-2 mb-2">
                                <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                                <p className="font-bold text-purple-800">Week 1 Retention</p>
                            </div>
                            <p className="text-2xl font-bold text-purple-600">100%</p>
                            <p className="text-xs text-purple-500 font-medium">Baseline</p>
                        </div>
                        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-xl border border-blue-200/50 shadow-lg">
                            <div className="flex items-center space-x-2 mb-2">
                                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                                <p className="font-bold text-blue-800">Month 1 Retention</p>
                            </div>
                            <p className="text-2xl font-bold text-blue-600">68%</p>
                            <p className="text-xs text-blue-500 font-medium">Active Users</p>
                        </div>
                        <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-xl border border-green-200/50 shadow-lg">
                            <div className="flex items-center space-x-2 mb-2">
                                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                                <p className="font-bold text-green-800">Long-term Retention</p>
                            </div>
                            <p className="text-2xl font-bold text-green-600">36%</p>
                            <p className="text-xs text-green-500 font-medium">9 months</p>
                        </div>
                    </div>
                </div>

                {/* Segment Distribution */}
                <div className="bg-white/70 backdrop-blur-xl rounded-2xl shadow-2xl border-0 p-6 hover:shadow-3xl transition-all duration-500 overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 via-pink-500/5 to-orange-500/10"></div>
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-500 via-pink-500 to-orange-500"></div>

                    <div className="flex items-center justify-between mb-6 relative z-10">
                        <div className="flex items-center space-x-3">
                            <div className="p-3 rounded-xl bg-gradient-to-br from-orange-600 to-pink-600 shadow-lg">
                                <UserCheck className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h3 className="text-xl lg:text-2xl font-bold text-gray-900">User Segment Distribution</h3>
                                <p className="text-gray-600 text-sm">Breakdown by user categories</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-2 px-3 py-2 bg-white/60 backdrop-blur-sm rounded-full border border-white/20">
                            <UsersIcon className="w-4 h-4 text-orange-600" />
                            <span className="text-orange-600 font-medium text-sm">Segments</span>
                        </div>
                    </div>
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
                    <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm relative z-10">
                        {segmentData.map((segment, index) => (
                            <div key={index} className="flex items-center justify-between p-4 bg-white/60 backdrop-blur-sm rounded-xl border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                                <div className="flex items-center space-x-3">
                                    <div
                                        className="w-4 h-4 rounded-full shadow-lg"
                                        style={{ backgroundColor: segment.color }}
                                    ></div>
                                    <span className="font-bold text-gray-800">{segment.segment}</span>
                                </div>
                                <div className="text-right">
                                    <div className="font-bold text-lg text-gray-900">{segment.count.toLocaleString()}</div>
                                    <div className="text-xs font-medium text-gray-600">({segment.percentage}%)</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Enhanced Key Insights with Glass Effect */}
            <div className="bg-white/70 backdrop-blur-xl rounded-2xl shadow-2xl border-0 p-6 lg:p-8 hover:shadow-3xl transition-all duration-500 relative z-10 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-emerald-500/10"></div>
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-500"></div>

                <div className="flex items-center justify-between mb-8 relative z-10">
                    <div className="flex items-center space-x-4">
                        <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-600 shadow-lg">
                            <Eye className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h3 className="text-2xl lg:text-3xl font-bold text-gray-900">Key Insights & Recommendations</h3>
                            <p className="text-gray-600">AI-powered analytics and strategic insights</p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-2 px-4 py-2 bg-white/60 backdrop-blur-sm rounded-full border border-white/20">
                        <Activity className="w-4 h-4 text-emerald-600" />
                        <span className="text-emerald-600 font-bold text-sm">AI Generated</span>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 relative z-10">
                    <div className="bg-gradient-to-br from-blue-50 via-blue-100/50 to-blue-200/30 p-6 rounded-2xl border border-blue-200/50 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                        <div className="flex items-center mb-4">
                            <div className="p-3 rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 shadow-lg">
                                <Activity className="w-6 h-6 text-white" />
                            </div>
                            <div className="ml-4">
                                <h4 className="font-bold text-blue-800 text-lg">User Engagement</h4>
                                <div className="w-12 h-1 bg-blue-500 rounded-full mt-1"></div>
                            </div>
                        </div>
                        <ul className="text-sm text-blue-700 space-y-2 font-medium">
                            <li className="flex items-start space-x-2">
                                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                                <span>68% retention rate after first month showing strong initial engagement</span>
                            </li>
                            <li className="flex items-start space-x-2">
                                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                                <span>Employees show highest trip frequency with consistent usage patterns</span>
                            </li>
                            <li className="flex items-start space-x-2">
                                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                                <span>Metro is the preferred mode (45% users) indicating infrastructure preference</span>
                            </li>
                        </ul>
                    </div>

                    <div className="bg-gradient-to-br from-green-50 via-green-100/50 to-emerald-200/30 p-6 rounded-2xl border border-green-200/50 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                        <div className="flex items-center mb-4">
                            <div className="p-3 rounded-xl bg-gradient-to-br from-green-600 to-emerald-600 shadow-lg">
                                <UsersIcon className="w-6 h-6 text-white" />
                            </div>
                            <div className="ml-4">
                                <h4 className="font-bold text-green-800 text-lg">Segment Insights</h4>
                                <div className="w-12 h-1 bg-green-500 rounded-full mt-1"></div>
                            </div>
                        </div>
                        <ul className="text-sm text-green-700 space-y-2 font-medium">
                            <li className="flex items-start space-x-2">
                                <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                                <span>Employees dominate (52.3% of users) representing primary user base</span>
                            </li>
                            <li className="flex items-start space-x-2">
                                <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                                <span>Students are second largest segment (24.4%) with growth potential</span>
                            </li>
                            <li className="flex items-start space-x-2">
                                <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                                <span>Strong potential in homemaker segment for off-peak optimization</span>
                            </li>
                        </ul>
                    </div>

                    <div className="bg-gradient-to-br from-purple-50 via-purple-100/50 to-pink-200/30 p-6 rounded-2xl border border-purple-200/50 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                        <div className="flex items-center mb-4">
                            <div className="p-3 rounded-xl bg-gradient-to-br from-purple-600 to-pink-600 shadow-lg">
                                <TrendingUp className="w-6 h-6 text-white" />
                            </div>
                            <div className="ml-4">
                                <h4 className="font-bold text-purple-800 text-lg">Strategic Actions</h4>
                                <div className="w-12 h-1 bg-purple-500 rounded-full mt-1"></div>
                            </div>
                        </div>
                        <ul className="text-sm text-purple-700 space-y-2 font-medium">
                            <li className="flex items-start space-x-2">
                                <div className="w-1.5 h-1.5 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                                <span>Focus on improving month 2-3 retention through engagement campaigns</span>
                            </li>
                            <li className="flex items-start space-x-2">
                                <div className="w-1.5 h-1.5 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                                <span>Create targeted campaigns for students with special pricing</span>
                            </li>
                            <li className="flex items-start space-x-2">
                                <div className="w-1.5 h-1.5 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                                <span>Expand metro connectivity options to capture more market share</span>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Users;
