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
        <div className="flex h-screen bg-gray-100">
            {/* Sidebar */}
            <div className={`bg-white shadow-lg transition-all duration-300 ${sidebarOpen ? 'w-64' : 'w-16'} ${sidebarOpen ? '' : 'lg:w-64'}`}>
                <div className="p-4 border-b">
                    <div className="flex items-center justify-between">
                        <h1 className={`font-bold text-xl text-gray-800 ${sidebarOpen ? 'block' : 'hidden lg:block'}`}>
                            Transport Analytics
                        </h1>
                        <button
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                            className="p-1 rounded-lg hover:bg-gray-100 lg:hidden"
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
                                    className={`flex items-center px-3 py-2 rounded-lg transition-colors ${isActivePath(item.path)
                                        ? 'bg-blue-100 text-blue-700 border-r-2 border-blue-700'
                                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
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
                <header className="bg-white shadow-sm border-b">
                    <div className="flex items-center justify-between px-6 py-4">
                        <div className="flex items-center space-x-4">
                            <button
                                onClick={() => setSidebarOpen(!sidebarOpen)}
                                className="p-2 rounded-lg hover:bg-gray-100 lg:hidden"
                            >
                                <Menu className="w-5 h-5" />
                            </button>

                            {/* Date Picker */}
                            <div className="flex items-center space-x-2">
                                <label className="text-sm text-gray-600">Date Range:</label>
                                <input
                                    type="date"
                                    className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    defaultValue="2025-09-01"
                                />
                                <span className="text-gray-400">to</span>
                                <input
                                    type="date"
                                    className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    defaultValue="2025-09-20"
                                />
                            </div>
                        </div>

                        <div className="flex items-center space-x-4">
                            {/* Global Filters Placeholder */}
                            <div className="hidden md:flex items-center space-x-2">
                                <select className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                                    <option>All Regions</option>
                                    <option>North</option>
                                    <option>South</option>
                                    <option>East</option>
                                    <option>West</option>
                                </select>

                                <select className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                                    <option>All Modes</option>
                                    <option>Car</option>
                                    <option>Bus</option>
                                    <option>Train</option>
                                    <option>Walk</option>
                                </select>
                            </div>

                            {/* Notifications */}
                            <button className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg">
                                <Bell className="w-5 h-5" />
                                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                                    3
                                </span>
                            </button>

                            {/* User Profile Menu */}
                            <div className="relative">
                                <button className="flex items-center space-x-2 p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg">
                                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                                        JS
                                    </div>
                                    <span className="hidden md:block text-sm font-medium">John Scientist</span>
                                    <ChevronDown className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Main Content */}
                <main className="flex-1 overflow-y-auto bg-gray-50">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default MainLayout;
