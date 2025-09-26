import React, { useState, useRef, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useSmartPrefetch, usePerformanceMonitor, useBackgroundSync } from '../hooks/usePrefetchStrategies';
import PerformanceMonitor from '../components/PerformanceMonitor';
import {
    LayoutDashboard,
    MapPin,
    Route,
    Car,
    Clock,
    Users,
    TrendingUp,
    FileText,
    AlertTriangle,
    User,
    Settings,
    Menu,
    ChevronDown,
    Calendar,
    LogOut,
    Activity
} from 'lucide-react';

const MainLayout = () => {
    const navigate = useNavigate();
    const { logout, user } = useAuth();
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [startDate, setStartDate] = useState('2025-09-01');
    const [endDate, setEndDate] = useState('2025-09-20');
    const [showPerformanceMonitor, setShowPerformanceMonitor] = useState(false);
    const location = useLocation();

    // Smart prefetching hooks
    const { prefetchOnHover, prefetchRelatedData } = useSmartPrefetch();
    usePerformanceMonitor();
    useBackgroundSync();

    // Prefetch related data when route changes
    useEffect(() => {
        prefetchRelatedData(location.pathname);
    }, [location.pathname, prefetchRelatedData]);

    // Map paths to prefetch types
    const getPageType = (path) => {
        if (path === '/') return 'dashboard';
        if (path.startsWith('/geospatial')) return 'geospatial';
        if (path.startsWith('/demographics')) return 'demographics';
        if (path.startsWith('/temporal')) return 'temporal';
        if (path.startsWith('/od-matrix')) return 'odmatrix';
        return null;
    };

    // Debug route changes
    useEffect(() => {
        console.log('🛣️ Route changed to:', location.pathname);
    }, [location.pathname]);

    // Refs for date inputs
    const startDateRef = useRef(null);
    const endDateRef = useRef(null);



    const navigationItems = [
        { name: 'Dashboard', path: '/', icon: LayoutDashboard },
        { name: 'Geospatial', path: '/geospatial', icon: MapPin },
        { name: 'OD Matrix', path: '/od-matrix', icon: Route },
        { name: 'Mode & Purpose', path: '/mode-purpose', icon: Car },
        { name: 'Temporal', path: '/temporal', icon: Clock },
        { name: 'Demographics', path: '/demographics', icon: Users },
        // { name: 'Demand Modeling', path: '/demand-modeling', icon: TrendingUp },
        { name: 'Reports', path: '/reports', icon: FileText },
        // { name: 'Alerts', path: '/alerts', icon: AlertTriangle },
        { name: 'Users', path: '/users', icon: User },
        // { name: 'Admin', path: '/admin', icon: Settings },
    ];

    const isActivePath = (path) => {
        if (path === '/') {
            return location.pathname === '/';
        }
        return location.pathname.startsWith(path);
    };

    return (
        <div className="flex h-screen transition-all duration-300 bg-gradient-to-br from-purple-50 via-white to-blue-50">
            {/* Enhanced Modern Sidebar */}
            <div className={`shadow-2xl transition-all duration-300 backdrop-blur-sm bg-gradient-to-b from-white via-gray-50 to-gray-100 border-r border-gray-200
                ${sidebarOpen ? 'w-80' : 'w-0 md:w-20'} 
                ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
                fixed md:relative z-30 h-full md:z-auto
            `}>
                <div className="p-4 md:hidden transition-all duration-300 border-gray-200/50 bg-gradient-to-r from-purple-100/50 to-blue-100/50">
                    <div className="flex justify-end">
                        <button
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                            className="p-2.5 rounded-xl transition-all duration-200 flex-shrink-0 hover:bg-gray-200 hover:text-gray-800 border border-gray-300 text-gray-600"
                        >
                            <Menu className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                <nav className="mt-6 flex-1 overflow-y-auto px-4">
                    {/* GetWay section label */}
                    <div className={`mb-4 px-2`}>
                        <div className="flex items-center">
                            <div className="flex-shrink-0 mr-3">
                                <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-gradient-to-br from-purple-500 via-purple-600 to-blue-600 flex items-center justify-center shadow-lg border border-purple-400/30">
                                    <img src="/logo.png" alt="GetWay" className="w-5 h-5 md:w-6 md:h-6 object-contain" />
                                </div>
                            </div>
                            <span className={`${sidebarOpen ? 'block' : 'hidden md:block'} truncate transition-all duration-300 text-gray-800 text-sm md:text-lg font-extrabold`}>
                                GetWay
                            </span>
                        </div>
                    </div>
                    <ul className="space-y-2">
                        {navigationItems.map((item) => (
                            <li key={item.path}>
                                <Link
                                    to={item.path}
                                    onMouseEnter={() => {
                                        // Prefetch data when user hovers over navigation link
                                        const pageType = getPageType(item.path);
                                        if (pageType) {
                                            prefetchOnHover(pageType);
                                        }
                                    }}
                                    onClick={(e) => {
                                        console.log('🔗 Navigation clicked:', item.name, '→', item.path);
                                        // Close sidebar on mobile after navigation
                                        if (window.innerWidth < 768) {
                                            setSidebarOpen(false);
                                        }
                                    }}
                                    className={`group flex items-center px-4 py-3.5 rounded-2xl transition-all duration-300 ${isActivePath(item.path)
                                        ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-xl shadow-purple-500/25 transform scale-105'
                                        : 'text-gray-600 hover:bg-gray-200 hover:text-gray-800 hover:shadow-lg hover:shadow-gray-200/50 hover:transform hover:scale-105'
                                        }`}
                                >
                                    <item.icon className={`w-6 h-6 mr-4 flex-shrink-0 transition-all duration-300 ${isActivePath(item.path)
                                        ? 'text-white drop-shadow-sm'
                                        : 'text-gray-500 group-hover:text-gray-800'
                                        }`} />
                                    <span className={`${sidebarOpen ? 'block' : 'hidden md:block'} text-sm font-semibold truncate transition-all duration-300`}>
                                        {item.name}
                                    </span>
                                    {isActivePath(item.path) && (
                                        <div className="ml-auto w-2 h-2 bg-white rounded-full shadow-lg"></div>
                                    )}
                                </Link>
                            </li>
                        ))}
                    </ul>

                    {/* Enhanced Sign Out Button */}
                    <div className="px-2 mt-8 mb-6 pt-6 transition-all duration-300 border-t border-gray-200/50">
                        <button
                            onClick={() => {
                                logout();
                                navigate('/signin');
                            }}
                            className="w-full group flex items-center px-4 py-3.5 rounded-2xl transition-all duration-300 hover:bg-gradient-to-r hover:from-red-500/20 hover:to-pink-500/20 hover:shadow-lg hover:shadow-red-500/20 hover:border-red-500/50 text-gray-600 hover:text-gray-800 border border-gray-300"
                        >
                            <LogOut className="w-6 h-6 mr-4 group-hover:transform group-hover:scale-110 transition-all duration-300 flex-shrink-0 group-hover:text-red-400 text-gray-500" />
                            <span className={`font-semibold text-sm ${sidebarOpen ? 'block' : 'hidden md:block'} transition-all duration-300`}>
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
                {/* Header */}
                <header className="shadow-xl transition-all duration-300 bg-gradient-to-r from-white via-gray-50 to-gray-50 border-b border-gray-200/50">
                    <div className="flex items-center justify-between px-4 md:px-6 py-4 md:py-5">
                        <div className="flex items-center space-x-4 flex-1 min-w-0">
                            <button
                                onClick={() => setSidebarOpen(!sidebarOpen)}
                                className="p-2.5 rounded-xl transition-all duration-200 md:hidden flex-shrink-0 hover:bg-gray-200 hover:text-gray-800 border border-gray-300 text-gray-600"
                            >
                                <Menu className="w-5 h-5" />
                            </button>

                            {/* Premium Date Range Picker */}
                            <div className="flex items-center space-x-3">
                                <Calendar className="w-5 h-5 flex-shrink-0 transition-all duration-300 text-purple-600" />
                                <div className="flex items-center space-x-2">
                                    <div className="relative group">
                                        <input
                                            ref={startDateRef}
                                            type="date"
                                            value={startDate}
                                            onChange={(e) => setStartDate(e.target.value)}
                                            onFocus={(e) => e.target.blur()}
                                            className="pl-3 pr-2 py-2 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-purple-400 transition-all font-semibold w-36 cursor-pointer hover:shadow-md border border-gray-300 bg-gray-50 hover:bg-white text-gray-800 placeholder-gray-500"
                                            readOnly
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
                                    <span className="font-bold text-sm px-1 transition-all duration-300 text-purple-600">—</span>
                                    <div className="relative group">
                                        <input
                                            ref={endDateRef}
                                            type="date"
                                            value={endDate}
                                            onChange={(e) => setEndDate(e.target.value)}
                                            onFocus={(e) => e.target.blur()}
                                            className="pl-3 pr-2 py-2 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-purple-400 transition-all font-semibold w-36 cursor-pointer hover:shadow-md border border-gray-300 bg-gray-50 hover:bg-white text-gray-800 placeholder-gray-500"
                                            readOnly
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

                        <div className="flex items-center space-x-3 flex-shrink-0">
                            {/* Performance Monitor Toggle */}
                            <button
                                onClick={() => setShowPerformanceMonitor(!showPerformanceMonitor)}
                                className={`p-2 rounded-xl transition-all duration-200 border ${showPerformanceMonitor
                                        ? 'bg-green-100 text-green-700 border-green-300'
                                        : 'text-gray-600 hover:text-gray-800 hover:bg-gray-200 border-gray-300'
                                    }`}
                                title="Toggle Performance Monitor"
                            >
                                <Activity className="w-5 h-5" />
                            </button>

                            {/* Profile Icon Only */}
                            <div className="p-2 transition-all duration-200 group text-gray-600 hover:text-gray-800 hover:bg-gray-200">
                                <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-br from-purple-500 via-purple-600 to-blue-600 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-xl group-hover:scale-105 transition-transform border border-purple-400/30">
                                    {user?.name ? user.name.split(' ').map(n => n[0]).join('').toUpperCase() : 'SC'}
                                </div>
                            </div>
                        </div>
                    </div>
                </header>



                {/* Main Content */}
                <main className="flex-1 overflow-y-auto bg-gradient-to-br from-gray-50 via-white to-purple-50 p-2 md:p-4 lg:p-6">
                    <div className="max-w-full">
                        <Outlet />
                    </div>
                </main>
            </div>

            {/* Performance Monitor */}
            <PerformanceMonitor isVisible={showPerformanceMonitor} />
        </div>
    );
};

export default MainLayout;
