import React, { useState, useRef, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
    BarChart3,
    Map,
    ArrowRightLeft,
    Car,
    Clock,
    Users,
    TrendingUp,
    FileText,
    AlertTriangle,
    User,
    Settings,
    Menu,
    Bell,
    ChevronDown,
    Calendar,
    LogOut,
    Filter
} from 'lucide-react';

const MainLayout = () => {
    const navigate = useNavigate();
    const { logout, user } = useAuth();
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
    const [startDate, setStartDate] = useState('2025-09-01');
    const [endDate, setEndDate] = useState('2025-09-20');
    const [selectedRegion, setSelectedRegion] = useState('');
    const [selectedMode, setSelectedMode] = useState('');
    const location = useLocation();
    
    // Refs for date inputs
    const startDateRef = useRef(null);
    const endDateRef = useRef(null);

    // Close mobile filters when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (mobileFiltersOpen && !event.target.closest('.mobile-filters-container')) {
                setMobileFiltersOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [mobileFiltersOpen]);

    const navigationItems = [
        { name: 'Dashboard', path: '/', icon: BarChart3 },
        { name: 'Geospatial', path: '/geospatial', icon: Map },
        { name: 'OD Matrix', path: '/od-matrix', icon: ArrowRightLeft },
        { name: 'Mode & Purpose', path: '/mode-purpose', icon: Car },
        { name: 'Temporal', path: '/temporal', icon: Clock },
        { name: 'Demographics', path: '/demographics', icon: Users },
        { name: 'Demand Modeling', path: '/demand-modeling', icon: TrendingUp },
        { name: 'Reports', path: '/reports', icon: FileText },
        { name: 'Alerts', path: '/alerts', icon: AlertTriangle },
        { name: 'Users', path: '/users', icon: User },
        { name: 'Admin', path: '/admin', icon: Settings },
    ];

    const isActivePath = (path) => {
        if (path === '/') {
            return location.pathname === '/';
        }
        return location.pathname.startsWith(path);
    };

    return (
        <div className="flex h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
            {/* Sidebar - Responsive design */}
            <div className={`bg-gradient-to-b from-white to-gray-50 shadow-lg transition-all duration-300 border-r border-gray-200 
                ${sidebarOpen ? 'w-80' : 'w-0 md:w-16'} 
                ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
                fixed md:relative z-30 h-full md:z-auto
            `}>
                <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-blue-50">
                    <div className="flex items-center justify-between">
                        <div className={`flex items-center space-x-3 ${sidebarOpen ? 'block' : 'hidden md:block'}`}>
                            <div className="flex-shrink-0">
                                <img 
                                    src="/logo.png" 
                                    alt="GetWay Logo" 
                                    className="w-10 h-10 md:w-12 md:h-12 object-contain rounded-lg shadow-md bg-white p-1 border border-purple-200"
                                />
                            </div>
                            <div className="min-w-0 flex-1">
                                <h1 className="font-bold text-lg md:text-xl text-gray-800 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent whitespace-nowrap">
                                    GetWay
                                </h1>
                                <p className="text-xs text-gray-600 font-medium whitespace-nowrap">Transportation Analytics</p>
                            </div>
                        </div>
                        <button
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                            className="p-2 rounded-lg hover:bg-purple-100 hover:text-purple-700 transition-colors md:hidden flex-shrink-0 ml-2"
                        >
                            <Menu className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                <nav className="mt-4 flex-1 overflow-y-auto">
                    <ul className="space-y-1 px-2">
                        {navigationItems.map((item) => (
                            <li key={item.path}>
                                <Link
                                    to={item.path}
                                    onClick={() => {
                                        // Close sidebar on mobile after navigation
                                        if (window.innerWidth < 768) {
                                            setSidebarOpen(false);
                                        }
                                    }}
                                    className={`flex items-center px-3 md:px-4 py-2 md:py-3 rounded-xl transition-all duration-200 ${isActivePath(item.path)
                                        ? 'bg-gradient-to-r from-purple-100 to-purple-50 text-purple-700 border-r-4 border-purple-500 shadow-sm'
                                        : 'text-gray-600 hover:bg-gradient-to-r hover:from-purple-50 hover:to-transparent hover:text-purple-600 hover:shadow-sm'
                                        }`}
                                >
                                    <item.icon className="w-5 h-5 mr-3 flex-shrink-0" />
                                    <span className={`${sidebarOpen ? 'block' : 'hidden md:block'} text-sm md:text-base truncate`}>
                                        {item.name}
                                    </span>
                                </Link>
                            </li>
                        ))}
                    </ul>
                    
                    {/* Sign Out Button */}
                    <div className="px-2 mt-auto mb-4 border-t border-gray-200 pt-4">
                        <button 
                            onClick={() => {
                                logout();
                                navigate('/signin');
                            }}
                            className="w-full flex items-center px-3 md:px-4 py-2 md:py-3 rounded-xl transition-all duration-200 text-gray-600 hover:bg-gradient-to-r hover:from-red-50 hover:to-red-100 hover:text-red-600 hover:shadow-md border border-transparent hover:border-red-200 group"
                        >
                            <LogOut className="w-5 h-5 mr-3 group-hover:transform group-hover:scale-110 transition-transform flex-shrink-0" />
                            <span className={`font-semibold text-sm md:text-base ${sidebarOpen ? 'block' : 'hidden md:block'}`}>
                                Sign Out
                            </span>
                        </button>
                    </div>
                </nav>
            </div>

            {/* Overlay for mobile sidebar */}
            {sidebarOpen && (
                <div 
                    className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Top Bar - Responsive */}
                <header className="bg-white shadow-lg border-b border-gray-200 backdrop-blur-sm">
                    <div className="flex items-center justify-between px-2 md:px-4 py-3 md:py-4">
                        <div className="flex items-center space-x-2 md:space-x-4 flex-1 min-w-0">
                            <button
                                onClick={() => setSidebarOpen(!sidebarOpen)}
                                className="p-2 rounded-lg hover:bg-purple-50 hover:text-purple-600 transition-colors md:hidden flex-shrink-0"
                            >
                                <Menu className="w-5 h-5" />
                            </button>

                            {/* Enhanced Date Range Picker - More responsive */}
                            <div className="flex items-center space-x-2 md:space-x-3 bg-gradient-to-r from-purple-50 to-blue-50 px-2 md:px-4 py-2 md:py-3 rounded-lg md:rounded-xl border border-purple-200 shadow-lg flex-shrink-0">
                                <label className="text-xs md:text-sm font-bold text-purple-800 whitespace-nowrap hidden sm:block">Date Range:</label>
                                <label className="text-xs font-bold text-purple-800 whitespace-nowrap sm:hidden">Dates:</label>
                                <div className="flex items-center space-x-1 md:space-x-2">
                                    <div className="relative group">
                                        <input
                                            ref={startDateRef}
                                            type="date"
                                            value={startDate}
                                            onChange={(e) => setStartDate(e.target.value)}
                                            onClick={(e) => e.preventDefault()}
                                            onFocus={(e) => e.target.blur()}
                                            className="pl-7 md:pl-9 pr-2 md:pr-3 py-1.5 md:py-2 border border-purple-300 rounded-md md:rounded-lg text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all bg-white shadow-sm hover:shadow-md text-gray-800 font-medium focus-purple w-24 sm:w-32 md:w-36 cursor-default"
                                            readOnly
                                        />
                                        <Calendar 
                                            className="absolute left-1.5 md:left-2.5 top-1/2 transform -translate-y-1/2 w-3 h-3 md:w-4 md:h-4 text-purple-500 group-hover:text-purple-600 transition-colors cursor-pointer" 
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                const input = startDateRef.current;
                                                if (input) {
                                                    input.removeAttribute('readonly');
                                                    input.showPicker?.();
                                                    setTimeout(() => input.setAttribute('readonly', true), 100);
                                                }
                                            }}
                                        />
                                    </div>
                                    <span className="text-purple-700 font-bold text-xs md:text-sm px-1">to</span>
                                    <div className="relative group">
                                        <input
                                            ref={endDateRef}
                                            type="date"
                                            value={endDate}
                                            onChange={(e) => setEndDate(e.target.value)}
                                            onClick={(e) => e.preventDefault()}
                                            onFocus={(e) => e.target.blur()}
                                            className="pl-7 md:pl-9 pr-2 md:pr-3 py-1.5 md:py-2 border border-purple-300 rounded-md md:rounded-lg text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all bg-white shadow-sm hover:shadow-md text-gray-800 font-medium focus-purple w-24 sm:w-32 md:w-36 cursor-default"
                                            readOnly
                                        />
                                        <Calendar 
                                            className="absolute left-1.5 md:left-2.5 top-1/2 transform -translate-y-1/2 w-3 h-3 md:w-4 md:h-4 text-purple-500 group-hover:text-purple-600 transition-colors cursor-pointer" 
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                const input = endDateRef.current;
                                                if (input) {
                                                    input.removeAttribute('readonly');
                                                    input.showPicker?.();
                                                    setTimeout(() => input.setAttribute('readonly', true), 100);
                                                }
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center space-x-1 md:space-x-3 flex-shrink-0">
                            {/* Mobile Filter Button - Shows only on small/medium screens */}
                            <div className="lg:hidden relative mobile-filters-container">
                                <button
                                    onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
                                    className="p-1.5 md:p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg md:rounded-xl transition-all duration-200 shadow-sm hover:shadow-md"
                                >
                                    <Filter className="w-4 h-4 md:w-5 md:h-5" />
                                </button>
                                
                                {/* Mobile Filters Dropdown */}
                                {mobileFiltersOpen && (
                                    <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-xl shadow-xl border border-gray-200 z-50 p-4">
                                        <div className="space-y-4">
                                            <h3 className="font-semibold text-gray-800 text-sm">Filters</h3>
                                            
                                            <div className="space-y-3">
                                                <div>
                                                    <label className="block text-xs font-medium text-gray-700 mb-1">Region</label>
                                                    <div className="relative">
                                                        <select 
                                                            value={selectedRegion}
                                                            onChange={(e) => setSelectedRegion(e.target.value)}
                                                            className={`w-full appearance-none bg-white border border-gray-300 rounded-lg px-3 py-2 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${
                                                                selectedRegion === '' ? 'text-gray-500' : 'text-gray-800'
                                                            }`}
                                                        >
                                                            <option value="">Select Region</option>
                                                            <option value="all">All Regions</option>
                                                            <option value="north">North</option>
                                                            <option value="south">South</option>
                                                            <option value="east">East</option>
                                                            <option value="west">West</option>
                                                            <option value="central">Central</option>
                                                        </select>
                                                        <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                                                    </div>
                                                </div>
                                                
                                                <div>
                                                    <label className="block text-xs font-medium text-gray-700 mb-1">Mode</label>
                                                    <div className="relative">
                                                        <select 
                                                            value={selectedMode}
                                                            onChange={(e) => setSelectedMode(e.target.value)}
                                                            className={`w-full appearance-none bg-white border border-gray-300 rounded-lg px-3 py-2 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${
                                                                selectedMode === '' ? 'text-gray-500' : 'text-gray-800'
                                                            }`}
                                                        >
                                                            <option value="">Select Mode</option>
                                                            <option value="all">All</option>
                                                            <option value="car">🚗 Car</option>
                                                            <option value="bus">🚌 Bus</option>
                                                            <option value="train">🚆 Train</option>
                                                            <option value="walk">🚶 Walk</option>
                                                            <option value="bike">🚴 Bike</option>
                                                        </select>
                                                        <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Enhanced Filter Dropdowns - Hidden on small screens, collapsible on medium */}
                            <div className="hidden lg:flex items-center space-x-3 bg-gradient-to-r from-blue-50 to-indigo-50 px-4 py-3 rounded-xl border border-blue-200 shadow-lg">
                                <label className="text-sm font-bold text-blue-800 whitespace-nowrap">Filters:</label>
                                <div className="flex items-center space-x-2">
                                    <div className="relative group">
                                        <select 
                                            value={selectedRegion}
                                            onChange={(e) => setSelectedRegion(e.target.value)}
                                            className={`appearance-none bg-white border border-blue-300 rounded-lg px-3 py-2 pr-7 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all cursor-pointer shadow-sm hover:shadow-md font-medium dropdown-hover focus-blue w-32 ${
                                                selectedRegion === '' ? 'text-gray-500' : 'text-gray-800'
                                            }`}
                                            required
                                        >
                                            <option value="" disabled hidden className="text-gray-500">Region</option>
                                            <option value="all" className="text-gray-800 bg-white">All Regions</option>
                                            <option value="north" className="text-gray-800 bg-white">North</option>
                                            <option value="south" className="text-gray-800 bg-white">South</option>
                                            <option value="east" className="text-gray-800 bg-white">East</option>
                                            <option value="west" className="text-gray-800 bg-white">West</option>
                                            <option value="central" className="text-gray-800 bg-white">Central</option>
                                        </select>
                                        <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-blue-500 pointer-events-none group-hover:text-blue-600 transition-colors" />
                                    </div>

                                    <div className="relative group">
                                        <select 
                                            value={selectedMode}
                                            onChange={(e) => setSelectedMode(e.target.value)}
                                            className={`appearance-none bg-white border border-blue-300 rounded-lg px-3 py-2 pr-7 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all cursor-pointer shadow-sm hover:shadow-md font-medium dropdown-hover focus-blue w-28 ${
                                                selectedMode === '' ? 'text-gray-500' : 'text-gray-800'
                                            }`}
                                            required
                                        >
                                            <option value="" disabled hidden className="text-gray-500">Mode</option>
                                            <option value="all" className="text-gray-800 bg-white">All</option>
                                            <option value="car" className="text-gray-800 bg-white">🚗 Car</option>
                                            <option value="bus" className="text-gray-800 bg-white">🚌 Bus</option>
                                            <option value="train" className="text-gray-800 bg-white">🚆 Train</option>
                                            <option value="walk" className="text-gray-800 bg-white">🚶 Walk</option>
                                            <option value="bike" className="text-gray-800 bg-white">🚴 Bike</option>
                                        </select>
                                        <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-blue-500 pointer-events-none group-hover:text-blue-600 transition-colors" />
                                    </div>
                                </div>
                            </div>

                            {/* Notifications - Responsive */}
                            <button className="relative p-1.5 md:p-2 text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-lg md:rounded-xl transition-all duration-200 group shadow-sm hover:shadow-md">
                                <Bell className="w-4 h-4 md:w-5 md:h-5 group-hover:animate-pulse" />
                                <span className="absolute -top-1 -right-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs rounded-full h-4 w-4 md:h-5 md:w-5 flex items-center justify-center shadow-lg animate-pulse">
                                    3
                                </span>
                            </button>

                            {/* User Profile Menu - Responsive */}
                            <div className="relative">
                                <button className="flex items-center space-x-1 md:space-x-2 p-1.5 md:p-2 text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-lg md:rounded-xl transition-all duration-200 shadow-sm hover:shadow-md group">
                                    <div className="w-7 h-7 md:w-9 md:h-9 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white text-xs md:text-sm font-bold shadow-lg group-hover:scale-105 transition-transform">
                                        {user?.name ? user.name.split(' ').map(n => n[0]).join('').toUpperCase() : 'SC'}
                                    </div>
                                    <div className="hidden lg:block min-w-0">
                                        <span className="text-sm font-bold text-gray-700 group-hover:text-purple-600 block whitespace-nowrap">
                                            {user?.name || 'Scientist'}
                                        </span>
                                        <span className="text-xs text-gray-500 block">
                                            {user?.orgId || 'Organization'}
                                        </span>
                                    </div>
                                    <ChevronDown className="w-3 h-3 md:w-4 md:h-4 group-hover:text-purple-600 transition-colors hidden md:block" />
                                </button>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Mobile Filters - Responsive */}
                {mobileFiltersOpen && (
                    <div className="lg:hidden fixed inset-x-0 top-16 z-40 bg-white shadow-md border-t border-gray-200 p-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-bold text-gray-800">Filters</h2>
                            <button
                                onClick={() => setMobileFiltersOpen(false)}
                                className="p-2 rounded-md text-gray-600 hover:bg-purple-50 hover:text-purple-700 transition-colors"
                            >
                                <LogOut className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="mt-4">
                            {/* Date Range Picker - Mobile */}
                            <div className="flex flex-col space-y-2">
                                <div className="flex items-center justify-between">
                                    <label className="text-xs font-bold text-purple-800">Start Date</label>
                                    <label className="text-xs font-bold text-purple-800">End Date</label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <div className="relative flex-1">
                                        <input
                                            ref={startDateRef}
                                            type="date"
                                            value={startDate}
                                            onChange={(e) => setStartDate(e.target.value)}
                                            onClick={(e) => e.preventDefault()}
                                            onFocus={(e) => e.target.blur()}
                                            className="pl-7 pr-2 py-2 border border-purple-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all bg-white shadow-sm hover:shadow-md text-gray-800 font-medium cursor-default"
                                            readOnly
                                        />
                                        <Calendar 
                                            className="absolute left-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-purple-500 cursor-pointer" 
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                const input = startDateRef.current;
                                                if (input) {
                                                    input.removeAttribute('readonly');
                                                    input.showPicker?.();
                                                    setTimeout(() => input.setAttribute('readonly', true), 100);
                                                }
                                            }}
                                        />
                                    </div>
                                    <div className="relative flex-1">
                                        <input
                                            ref={endDateRef}
                                            type="date"
                                            value={endDate}
                                            onChange={(e) => setEndDate(e.target.value)}
                                            onClick={(e) => e.preventDefault()}
                                            onFocus={(e) => e.target.blur()}
                                            className="pl-7 pr-2 py-2 border border-purple-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all bg-white shadow-sm hover:shadow-md text-gray-800 font-medium cursor-default"
                                            readOnly
                                        />
                                        <Calendar 
                                            className="absolute left-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-purple-500 cursor-pointer" 
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                const input = endDateRef.current;
                                                if (input) {
                                                    input.removeAttribute('readonly');
                                                    input.showPicker?.();
                                                    setTimeout(() => input.setAttribute('readonly', true), 100);
                                                }
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Region and Mode Filters - Mobile */}
                            <div className="mt-4">
                                <div className="flex items-center justify-between">
                                    <label className="text-xs font-bold text-purple-800">Region</label>
                                    <label className="text-xs font-bold text-purple-800">Mode</label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <div className="relative flex-1">
                                        <select 
                                            value={selectedRegion}
                                            onChange={(e) => setSelectedRegion(e.target.value)}
                                            className={`appearance-none bg-white border border-blue-300 rounded-lg px-3 py-2 pr-7 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all cursor-pointer shadow-sm hover:shadow-md font-medium dropdown-hover focus-blue w-full ${
                                                selectedRegion === '' ? 'text-gray-500' : 'text-gray-800'
                                            }`}
                                            required
                                        >
                                            <option value="" disabled hidden className="text-gray-500">Region</option>
                                            <option value="all" className="text-gray-800 bg-white">All Regions</option>
                                            <option value="north" className="text-gray-800 bg-white">North</option>
                                            <option value="south" className="text-gray-800 bg-white">South</option>
                                            <option value="east" className="text-gray-800 bg-white">East</option>
                                            <option value="west" className="text-gray-800 bg-white">West</option>
                                            <option value="central" className="text-gray-800 bg-white">Central</option>
                                        </select>
                                        <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-blue-500 pointer-events-none group-hover:text-blue-600 transition-colors" />
                                    </div>

                                    <div className="relative flex-1">
                                        <select 
                                            value={selectedMode}
                                            onChange={(e) => setSelectedMode(e.target.value)}
                                            className={`appearance-none bg-white border border-blue-300 rounded-lg px-3 py-2 pr-7 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all cursor-pointer shadow-sm hover:shadow-md font-medium dropdown-hover focus-blue w-full ${
                                                selectedMode === '' ? 'text-gray-500' : 'text-gray-800'
                                            }`}
                                            required
                                        >
                                            <option value="" disabled hidden className="text-gray-500">Mode</option>
                                            <option value="all" className="text-gray-800 bg-white">All</option>
                                            <option value="car" className="text-gray-800 bg-white">🚗 Car</option>
                                            <option value="bus" className="text-gray-800 bg-white">🚌 Bus</option>
                                            <option value="train" className="text-gray-800 bg-white">🚆 Train</option>
                                            <option value="walk" className="text-gray-800 bg-white">🚶 Walk</option>
                                            <option value="bike" className="text-gray-800 bg-white">🚴 Bike</option>
                                        </select>
                                        <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-blue-500 pointer-events-none group-hover:text-blue-600 transition-colors" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Main Content */}
                <main className="flex-1 overflow-y-auto bg-gradient-to-br from-gray-50 via-white to-purple-50 p-2 md:p-4 lg:p-6">
                    <div className="max-w-full">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
};

export default MainLayout;
