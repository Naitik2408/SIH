import React, { useState } from 'react';
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
    ChevronDown
} from 'lucide-react';

const MainLayout = () => {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const location = useLocation();

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
            {/* Sidebar */}
            <div className={`bg-gradient-to-b from-white to-gray-50 shadow-lg transition-all duration-300 ${sidebarOpen ? 'w-64' : 'w-16'} ${sidebarOpen ? '' : 'lg:w-64'} border-r border-gray-200`}>
                <div className="p-4 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                        <div className={`flex items-center space-x-3 ${sidebarOpen ? 'block' : 'hidden lg:block'}`}>
                            <img 
                                src="/logo.png" 
                                alt="GetWay Logo" 
                                className="w-8 h-8 object-contain"
                            />
                            <h1 className="font-bold text-xl text-gray-800 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                                GetWay
                            </h1>
                        </div>
                        <button
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                            className="p-2 rounded-lg hover:bg-purple-50 hover:text-purple-600 transition-colors lg:hidden"
                        >
                            <Menu className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                <nav className="mt-4">
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
                </nav>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Top Bar */}
                <header className="bg-white shadow-lg border-b border-gray-200 backdrop-blur-sm">
                    <div className="flex items-center justify-between px-6 py-4">
                        <div className="flex items-center space-x-4">
                            <button
                                onClick={() => setSidebarOpen(!sidebarOpen)}
                                className="p-2 rounded-lg hover:bg-purple-50 hover:text-purple-600 transition-colors lg:hidden"
                            >
                                <Menu className="w-5 h-5" />
                            </button>

                            {/* Date Picker */}
                            <div className="flex items-center space-x-3 bg-gray-50 px-4 py-2 rounded-xl border border-gray-200">
                                <label className="text-sm font-medium text-gray-700">Date Range:</label>
                                <input
                                    type="date"
                                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                                    defaultValue="2025-09-01"
                                />
                                <span className="text-gray-400 font-medium">to</span>
                                <input
                                    type="date"
                                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                                    defaultValue="2025-09-20"
                                />
                            </div>
                        </div>

                        <div className="flex items-center space-x-4">
                            {/* Global Filters Placeholder */}
                            <div className="hidden md:flex items-center space-x-3">
                                <select className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white transition-colors">
                                    <option>All Regions</option>
                                    <option>North</option>
                                    <option>South</option>
                                    <option>East</option>
                                    <option>West</option>
                                </select>

                                <select className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white transition-colors">
                                    <option>All Modes</option>
                                    <option>Car</option>
                                    <option>Bus</option>
                                    <option>Train</option>
                                    <option>Walk</option>
                                </select>
                            </div>

                            {/* Notifications */}
                            <button className="relative p-3 text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-xl transition-colors">
                                <Bell className="w-5 h-5" />
                                <span className="absolute -top-1 -right-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center shadow-lg">
                                    3
                                </span>
                            </button>

                            {/* User Profile Menu */}
                            <div className="relative">
                                <button className="flex items-center space-x-3 p-3 text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-xl transition-colors">
                                    <div className="w-9 h-9 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-lg">
                                        GW
                                    </div>
                                    <span className="hidden md:block text-sm font-semibold text-gray-700">GetWay Admin</span>
                                    <ChevronDown className="w-4 h-4" />
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
