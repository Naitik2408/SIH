import React, { useState, useRef } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
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
    LogOut
} from 'lucide-react';

const MainLayout = () => {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [startDate, setStartDate] = useState('2025-09-01');
    const [endDate, setEndDate] = useState('2025-09-20');
    const [selectedRegion, setSelectedRegion] = useState('');
    const [selectedMode, setSelectedMode] = useState('');
    const location = useLocation();
    
    // Refs for date inputs
    const startDateRef = useRef(null);
    const endDateRef = useRef(null);

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
            {/* Sidebar - Increased width to accommodate GetWay text */}
            <div className={`bg-gradient-to-b from-white to-gray-50 shadow-lg transition-all duration-300 ${sidebarOpen ? 'w-80' : 'w-16'} ${sidebarOpen ? '' : 'lg:w-80'} border-r border-gray-200`}>
                <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-blue-50">
                    <div className="flex items-center justify-between">
                        <div className={`flex items-center space-x-3 ${sidebarOpen ? 'block' : 'hidden lg:block'}`}>
                            <div className="flex-shrink-0">
                                <img 
                                    src="/logo.png" 
                                    alt="GetWay Logo" 
                                    className="w-12 h-12 object-contain rounded-lg shadow-md bg-white p-1 border border-purple-200"
                                />
                            </div>
                            <div className="min-w-0 flex-1">
                                <h1 className="font-bold text-xl text-gray-800 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent whitespace-nowrap">
                                    GetWay
                                </h1>
                                <p className="text-xs text-gray-600 font-medium whitespace-nowrap">Transportation Analytics</p>
                            </div>
                        </div>
                        <button
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                            className="p-2 rounded-lg hover:bg-purple-100 hover:text-purple-700 transition-colors lg:hidden flex-shrink-0 ml-2"
                        >
                            <Menu className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                <nav className="mt-4 flex-1">
                    <ul className="space-y-1 px-2">
                        {navigationItems.map((item) => (
                            <li key={item.path}>
                                <Link
                                    to={item.path}
                                    className={`flex items-center px-4 py-3 rounded-xl transition-all duration-200 ${isActivePath(item.path)
                                        ? 'bg-gradient-to-r from-purple-100 to-purple-50 text-purple-700 border-r-4 border-purple-500 shadow-sm'
                                        : 'text-gray-600 hover:bg-gradient-to-r hover:from-purple-50 hover:to-transparent hover:text-purple-600 hover:shadow-sm'
                                        }`}
                                >
                                    <item.icon className="w-5 h-5 mr-3" />
                                    <span className={`${sidebarOpen ? 'block' : 'hidden lg:block'}`}>
                                        {item.name}
                                    </span>
                                </Link>
                            </li>
                        ))}
                    </ul>
                    
                    {/* Sign Out Button */}
                    <div className="px-2 mt-auto mb-4 border-t border-gray-200 pt-4">
                        <button className="w-full flex items-center px-4 py-3 rounded-xl transition-all duration-200 text-gray-600 hover:bg-gradient-to-r hover:from-red-50 hover:to-red-100 hover:text-red-600 hover:shadow-md border border-transparent hover:border-red-200 group">
                            <LogOut className="w-5 h-5 mr-3 group-hover:transform group-hover:scale-110 transition-transform" />
                            <span className={`font-semibold ${sidebarOpen ? 'block' : 'hidden lg:block'}`}>
                                Sign Out
                            </span>
                        </button>
                    </div>
                </nav>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Top Bar - Adjusted for wider sidebar */}
                <header className="bg-white shadow-lg border-b border-gray-200 backdrop-blur-sm">
                    <div className="flex items-center justify-between px-4 py-4">
                        <div className="flex items-center space-x-4">
                            <button
                                onClick={() => setSidebarOpen(!sidebarOpen)}
                                className="p-2 rounded-lg hover:bg-purple-50 hover:text-purple-600 transition-colors lg:hidden"
                            >
                                <Menu className="w-5 h-5" />
                            </button>

                            {/* Enhanced Date Range Picker - Made more compact */}
                            <div className="flex items-center space-x-3 bg-gradient-to-r from-purple-50 to-blue-50 px-4 py-3 rounded-xl border border-purple-200 shadow-lg">
                                <label className="text-sm font-bold text-purple-800 whitespace-nowrap">Date Range:</label>
                                <div className="flex items-center space-x-2">
                                    <div className="relative group">
                                        <input
                                            ref={startDateRef}
                                            type="date"
                                            value={startDate}
                                            onChange={(e) => setStartDate(e.target.value)}
                                            onClick={(e) => e.preventDefault()}
                                            onFocus={(e) => e.target.blur()}
                                            className="pl-9 pr-3 py-2 border border-purple-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all bg-white shadow-sm hover:shadow-md text-gray-800 font-medium focus-purple w-36 cursor-default"
                                            readOnly
                                        />
                                        <Calendar 
                                            className="absolute left-2.5 top-1/2 transform -translate-y-1/2 w-4 h-4 text-purple-500 group-hover:text-purple-600 transition-colors cursor-pointer" 
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
                                    <span className="text-purple-700 font-bold text-sm">to</span>
                                    <div className="relative group">
                                        <input
                                            ref={endDateRef}
                                            type="date"
                                            value={endDate}
                                            onChange={(e) => setEndDate(e.target.value)}
                                            onClick={(e) => e.preventDefault()}
                                            onFocus={(e) => e.target.blur()}
                                            className="pl-9 pr-3 py-2 border border-purple-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all bg-white shadow-sm hover:shadow-md text-gray-800 font-medium focus-purple w-36 cursor-default"
                                            readOnly
                                        />
                                        <Calendar 
                                            className="absolute left-2.5 top-1/2 transform -translate-y-1/2 w-4 h-4 text-purple-500 group-hover:text-purple-600 transition-colors cursor-pointer" 
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

                        <div className="flex items-center space-x-3">
                            {/* Enhanced Filter Dropdowns with highlighted label */}
                            <div className="hidden md:flex items-center space-x-3 bg-gradient-to-r from-blue-50 to-indigo-50 px-4 py-3 rounded-xl border border-blue-200 shadow-lg">
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

                            {/* Notifications - More compact */}
                            <button className="relative p-2 text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-xl transition-all duration-200 group shadow-sm hover:shadow-md">
                                <Bell className="w-5 h-5 group-hover:animate-pulse" />
                                <span className="absolute -top-1 -right-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center shadow-lg animate-pulse">
                                    3
                                </span>
                            </button>

                            {/* User Profile Menu - More compact */}
                            <div className="relative">
                                <button className="flex items-center space-x-2 p-2 text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-xl transition-all duration-200 shadow-sm hover:shadow-md group">
                                    <div className="w-9 h-9 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-lg group-hover:scale-105 transition-transform">
                                        GW
                                    </div>
                                    <div className="hidden lg:block min-w-0">
                                        <span className="text-sm font-bold text-gray-700 group-hover:text-purple-600 block whitespace-nowrap">GetWay Admin</span>
                                    </div>
                                    <ChevronDown className="w-4 h-4 group-hover:text-purple-600 transition-colors" />
                                </button>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Main Content */}
                <main className="flex-1 overflow-y-auto bg-gradient-to-br from-gray-50 via-white to-purple-50">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default MainLayout;
