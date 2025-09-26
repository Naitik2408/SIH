import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import {
    Activity,
    Database,
    Zap,
    Wifi,
    Clock,
    RefreshCw,
    CheckCircle,
    AlertCircle,
    TrendingUp,
    BarChart3
} from 'lucide-react';
import { useDataContext, CACHE_KEYS } from '../contexts/DataContext';
import dataCacheService from '../services/dataCacheService';

const PerformanceMonitor = ({ isVisible = false }) => {
    const [stats, setStats] = useState({});
    const [networkInfo, setNetworkInfo] = useState({});
    const [cacheStats, setCacheStats] = useState({});
    const { cacheManager } = useDataContext();

    useEffect(() => {
        const updateStats = () => {
            // React Query cache stats
            const queryStats = {
                queries: 0,
                mutations: 0,
                isFetching: false,
                isStale: false
            };

            // Local cache stats
            const localStats = dataCacheService.getStats();
            setCacheStats(localStats);

            // Network information
            if ('connection' in navigator) {
                const connection = navigator.connection;
                setNetworkInfo({
                    effectiveType: connection.effectiveType,
                    downlink: connection.downlink,
                    rtt: connection.rtt,
                    saveData: connection.saveData
                });
            }

            setStats(queryStats);
        };

        updateStats();
        const interval = setInterval(updateStats, 2000);
        return () => clearInterval(interval);
    }, []);

    const getHealthColor = (value, thresholds) => {
        if (value < thresholds.good) return 'text-green-600 bg-green-50';
        if (value < thresholds.warning) return 'text-yellow-600 bg-yellow-50';
        return 'text-red-600 bg-red-50';
    };

    const formatBytes = (bytes) => {
        return `${(bytes / 1024).toFixed(2)} KB`;
    };

    const formatMs = (ms) => {
        return `${ms}ms`;
    };

    if (!isVisible) return null;

    return (
        <div className="fixed bottom-4 right-4 z-50 max-w-sm">
            <Card className="bg-white/95 backdrop-blur-sm shadow-xl border-0">
                <CardHeader className="pb-3">
                    <CardTitle className="flex items-center text-sm">
                        <Activity className="w-4 h-4 mr-2" />
                        Performance Monitor
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {/* Cache Performance */}
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-medium text-gray-600">Cache Performance</span>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => dataCacheService.clear()}
                                className="h-6 px-2 text-xs"
                            >
                                Clear Cache
                            </Button>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-xs">
                            <div className="flex items-center justify-between">
                                <span className="text-gray-500">Entries:</span>
                                <Badge variant="secondary" className="text-xs">
                                    {cacheStats.totalEntries || 0}
                                </Badge>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-gray-500">Active:</span>
                                <Badge
                                    variant="secondary"
                                    className={getHealthColor(
                                        cacheStats.activeEntries / (cacheStats.totalEntries || 1),
                                        { good: 0.8, warning: 0.6 }
                                    )}
                                >
                                    {cacheStats.activeEntries || 0}
                                </Badge>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-gray-500">Size:</span>
                                <Badge variant="secondary" className="text-xs">
                                    {formatBytes(cacheStats.totalSize || 0)}
                                </Badge>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-gray-500">Hit Rate:</span>
                                <Badge
                                    variant="secondary"
                                    className={getHealthColor(
                                        (cacheStats.activeEntries / (cacheStats.totalEntries || 1)) * 100,
                                        { good: 80, warning: 60 }
                                    )}
                                >
                                    {((cacheStats.activeEntries / (cacheStats.totalEntries || 1)) * 100).toFixed(1)}%
                                </Badge>
                            </div>
                        </div>
                    </div>

                    {/* Network Information */}
                    {Object.keys(networkInfo).length > 0 && (
                        <div className="space-y-2">
                            <div className="flex items-center">
                                <Wifi className="w-3 h-3 mr-2" />
                                <span className="text-xs font-medium text-gray-600">Network</span>
                            </div>

                            <div className="grid grid-cols-2 gap-2 text-xs">
                                <div className="flex items-center justify-between">
                                    <span className="text-gray-500">Type:</span>
                                    <Badge
                                        variant="secondary"
                                        className={
                                            networkInfo.effectiveType === '4g' ? 'text-green-600 bg-green-50' :
                                                networkInfo.effectiveType === '3g' ? 'text-yellow-600 bg-yellow-50' :
                                                    'text-red-600 bg-red-50'
                                        }
                                    >
                                        {networkInfo.effectiveType}
                                    </Badge>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-gray-500">Speed:</span>
                                    <Badge variant="secondary" className="text-xs">
                                        {networkInfo.downlink} Mbps
                                    </Badge>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-gray-500">RTT:</span>
                                    <Badge
                                        variant="secondary"
                                        className={getHealthColor(networkInfo.rtt, { good: 100, warning: 300 })}
                                    >
                                        {formatMs(networkInfo.rtt)}
                                    </Badge>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-gray-500">Save Data:</span>
                                    <Badge
                                        variant="secondary"
                                        className={networkInfo.saveData ? 'text-orange-600 bg-orange-50' : 'text-green-600 bg-green-50'}
                                    >
                                        {networkInfo.saveData ? 'On' : 'Off'}
                                    </Badge>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Cache Keys Status */}
                    <div className="space-y-2">
                        <div className="flex items-center">
                            <Database className="w-3 h-3 mr-2" />
                            <span className="text-xs font-medium text-gray-600">Data Status</span>
                        </div>

                        <div className="space-y-1">
                            {Object.values(CACHE_KEYS).map(key => {
                                const cached = dataCacheService.get(key, { updateAccess: false });
                                const isActive = cached && !cached.isExpired;

                                return (
                                    <div key={key} className="flex items-center justify-between text-xs">
                                        <span className="text-gray-500 truncate">{key.split('-')[0]}:</span>
                                        <div className="flex items-center space-x-1">
                                            {isActive ? (
                                                <CheckCircle className="w-3 h-3 text-green-600" />
                                            ) : (
                                                <AlertCircle className="w-3 h-3 text-gray-400" />
                                            )}
                                            {cached && (
                                                <span className="text-xs text-gray-500">
                                                    {Math.floor(cached.age / 1000)}s
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Performance Score */}
                    <div className="pt-2 border-t">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <TrendingUp className="w-3 h-3 mr-2" />
                                <span className="text-xs font-medium text-gray-600">Score</span>
                            </div>
                            <div className="text-right">
                                <div className="text-lg font-bold text-green-600">
                                    {Math.min(100, Math.round(
                                        (cacheStats.activeEntries / (cacheStats.totalEntries || 1)) * 50 +
                                        (networkInfo.effectiveType === '4g' ? 50 :
                                            networkInfo.effectiveType === '3g' ? 30 : 20)
                                    ))}
                                </div>
                                <div className="text-xs text-gray-500">Performance</div>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default PerformanceMonitor;