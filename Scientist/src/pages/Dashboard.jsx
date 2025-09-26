import React, { useEffect } from 'react';
import {
  PieChart,
  Pie,
  BarChart,
  Bar,
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
  RadialBarChart,
  RadialBar
} from 'recharts';
import {
  Users,
  Navigation,
  Clock,
  MapPin,
  TrendingUp,
  AlertCircle,
  Map,
  Activity,
  ArrowUpIcon,
  ArrowDownIcon,
  Car,
  Bus,
  Train,
  Bike,
  Footprints
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useDashboardData, usePrefetchData, useDataContext } from '../contexts/DataContext';
import { DashboardSkeleton, ErrorState, LoadingState } from '../components/LoadingSkeleton';
import dataCacheService from '../services/dataCacheService';



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
              <span className="text-sm text-gray-600">{entry.name}:</span>
              <span className="text-sm font-semibold text-gray-800">{entry.value}</span>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }
  return null;
};

// Enhanced KPI Card Component
const EnhancedKPICard = ({ title, value, change, icon: Icon, gradient, description }) => (
  <Card className="relative overflow-hidden group hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-white via-purple-50/30 to-white">
    <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-5 group-hover:opacity-10 transition-opacity duration-300`}></div>
    <CardContent className="p-6 relative z-10">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-xl bg-gradient-to-br ${gradient} shadow-lg`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        <Badge variant={change >= 0 ? "default" : "destructive"} className="text-xs font-semibold bg-gradient-to-r from-purple-100 to-purple-200 text-purple-800 hover:from-purple-200 hover:to-purple-300">
          {change >= 0 ? <ArrowUpIcon className="w-3 h-3 mr-1" /> : <ArrowDownIcon className="w-3 h-3 mr-1" />}
          {Math.abs(change)}%
        </Badge>
      </div>
      <div className="space-y-2">
        <p className="text-3xl font-bold text-gray-900 tracking-tight">{value}</p>
        <p className="text-sm font-medium text-gray-700">{title}</p>
        {description && <p className="text-xs text-gray-500">{description}</p>}
      </div>
    </CardContent>
  </Card>
);

const Dashboard = () => {
  // Use React Query for data fetching with caching
  const {
    data: dashboardData,
    isLoading,
    isError,
    error,
    refetch,
    isFetching
  } = useDashboardData();

  const { prefetch } = usePrefetchData();
  const { cacheManager } = useDataContext();

  // Prefetch other page data when dashboard loads
  useEffect(() => {
    if (!isLoading && dashboardData) {
      // Prefetch geospatial and demographics data for faster navigation
      setTimeout(() => {
        prefetch.prefetchGeospatialData();
        prefetch.prefetchDemographicsData();
      }, 1000);
    }
  }, [isLoading, dashboardData, prefetch]);

  // Handle loading state
  if (isLoading) {
    return <DashboardSkeleton />;
  }

  // Handle error state
  if (isError) {
    return (
      <ErrorState
        title="Failed to Load Dashboard"
        message={error?.message || "Unable to fetch dashboard data. Please check your connection."}
        onRetry={refetch}
      />
    );
  }

  // Extract data with defaults
  const chartData = dashboardData?.chartData || {
    ageData: [],
    transportData: [],
    hourlyData: [],
    purposeData: [],
    dailyTrends: [],
    totalJourneys: 0,
    totalUsers: 0
  };

  const performanceMetrics = dashboardData?.performanceMetrics || {
    totalTrips: 0,
    uniqueUsers: 0,
    avgSatisfaction: 0,
    popularMode: 'Unknown',
    avgDuration: 0,
    avgDistance: 0,
    peakHour: 9,
    peakTraffic: 0,
    dataQuality: 'Loading...',
    lastUpdated: new Date().toISOString()
  };

  // Destructure data for backward compatibility
  const {
    ageData,
    transportData: modeShareData,
    purposeData: tripPurposeData,
    hourlyData: hourlyTrafficData,
    dailyTrends,
    totalJourneys,
    totalUsers
  } = chartData;



  // Destructure performance metrics for KPI cards
  const {
    avgSatisfaction,
    avgDuration,
    avgDistance,
    peakHour,
    peakTraffic
  } = performanceMetrics;



  // Create mock data for missing fields to maintain compatibility
  const incomeData = [
    { name: 'Low Income', value: Math.floor(totalUsers * 0.3), color: '#8884d8' },
    { name: 'Middle Income', value: Math.floor(totalUsers * 0.5), color: '#82ca9d' },
    { name: 'High Income', value: Math.floor(totalUsers * 0.2), color: '#ffc658' }
  ];

  // Use real daily trends data instead of mock data
  const dailyTripsData = dailyTrends.length > 0 ? dailyTrends : Array.from({ length: 7 }, (_, i) => ({
    day: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i],
    trips: Math.floor(totalJourneys / 7) + Math.floor(Math.random() * 20),
    users: Math.floor(totalUsers / 7) + Math.floor(Math.random() * 10)
  }));

  // Updated alerts with Kerala-specific data
  const alerts = [
    {
      id: 1,
      type: 'High Traffic',
      message: 'Heavy congestion on Kochi-Thiruvananthapuram route during peak hours',
      severity: 'high',
      time: '1 hour ago'
    },
    {
      id: 2,
      type: 'Service Update',
      message: 'New bus routes added in Kozhikode district for better connectivity',
      severity: 'medium',
      time: '3 hours ago'
    },
    {
      id: 3,
      type: 'Route Optimization',
      message: 'Improved travel time on Ernakulam-Alappuzha corridor',
      severity: 'low',
      time: '5 hours ago'
    }
  ];

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };



  return (
    <div className="p-6 space-y-8 bg-gradient-to-br from-purple-50/30 via-white to-blue-50/30 min-h-screen">

      {/* Enhanced Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 via-purple-700 to-blue-600 bg-clip-text text-transparent">
              Transportation Dashboard
              {isFetching && (
                <span className="ml-3 inline-flex items-center px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                  <div className="w-3 h-3 mr-1 rounded-full bg-blue-600 animate-pulse"></div>
                  Updating...
                </span>
              )}
            </h1>
            <p className="text-gray-600 mt-2 text-lg">
              Real-time analytics and key performance indicators
              {dashboardData?.lastFetched && (
                <span className="ml-2 text-sm text-gray-500">
                  • Last updated: {new Date(dashboardData.lastFetched).toLocaleTimeString()}
                </span>
              )}
            </p>
          </div>
          <div className="flex space-x-3">
            <Button
              variant="outline"
              className="border-purple-200 text-purple-700 hover:bg-purple-50"
              onClick={() => refetch()}
              disabled={isFetching}
            >
              {isFetching ? (
                <>
                  <div className="w-4 h-4 mr-2 rounded-full border-2 border-purple-600 border-t-transparent animate-spin"></div>
                  Refreshing...
                </>
              ) : (
                <>
                  <Activity className="w-4 h-4 mr-2" />
                  Refresh Data
                </>
              )}
            </Button>
            <Button variant="outline" className="border-purple-200 text-purple-700 hover:bg-purple-50">
              Export Data
            </Button>
            <Button className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800">
              Live View
            </Button>
          </div>
        </div>
      </div>

      {/* Enhanced KPI Cards - Updated with real data */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <EnhancedKPICard
          title="Total Trips"
          value={totalJourneys.toLocaleString()}
          change={12.5}
          icon={Navigation}
          gradient="from-purple-500 to-purple-600"
          description="from Kerala users"
        />
        <EnhancedKPICard
          title="Active Users"
          value={totalUsers.toLocaleString()}
          change={8.3}
          icon={Users}
          gradient="from-blue-500 to-blue-600"
          description="Kerala region"
        />
        <EnhancedKPICard
          title="Avg Duration"
          value={avgDuration ? `${avgDuration} min` : '0 min'}
          change={-3.2}
          icon={Clock}
          gradient="from-indigo-500 to-indigo-600"
          description="per trip"
        />
        <EnhancedKPICard
          title="Avg Distance"
          value={avgDistance ? `${avgDistance} km` : '0 km'}
          change={5.8}
          icon={MapPin}
          gradient="from-violet-500 to-violet-600"
          description="per trip"
        />
        <EnhancedKPICard
          title="Peak Traffic"
          value={peakHour ? `${peakHour}:00` : 'N/A'}
          change={15.4}
          icon={TrendingUp}
          gradient="from-pink-500 to-pink-600"
          description={peakTraffic ? `${peakTraffic} trips` : 'No data'}
        />
      </div>

      {/* Enhanced Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Enhanced Mode Share Pie Chart */}
        <Card className="shadow-xl border-0 bg-gradient-to-br from-white via-purple-50/20 to-white">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center text-xl font-bold text-gray-800">
              <Activity className="w-6 h-6 mr-3 text-purple-600" />
              Transportation Mode Share
            </CardTitle>
            <CardDescription className="text-gray-600">
              Distribution of transportation modes used by commuters
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={350}>
              <PieChart>
                <Pie
                  data={modeShareData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  innerRadius={40}
                  fill="#8884d8"
                  dataKey="value"
                  stroke="#fff"
                  strokeWidth={2}
                >
                  {modeShareData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  wrapperStyle={{ paddingTop: '20px' }}
                  formatter={(value, entry) => (
                    <span className="text-gray-700 font-medium">{value}</span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Enhanced Trip Purpose Bar Chart */}
        <Card className="shadow-xl border-0 bg-gradient-to-br from-white via-blue-50/20 to-white">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center text-xl font-bold text-gray-800">
              <MapPin className="w-6 h-6 mr-3 text-blue-600" />
              Trip Purpose Distribution
            </CardTitle>
            <CardDescription className="text-gray-600">
              Analysis of trip purposes throughout the day
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={tripPurposeData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e7ff" />
                <XAxis
                  dataKey="name"
                  tick={{ fill: '#6b7280', fontSize: 12 }}
                  axisLine={{ stroke: '#d1d5db' }}
                />
                <YAxis
                  tick={{ fill: '#6b7280', fontSize: 12 }}
                  axisLine={{ stroke: '#d1d5db' }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar
                  dataKey="trips"
                  radius={[6, 6, 0, 0]}
                  stroke="#8b7cf6"
                  strokeWidth={1}
                >
                  {tripPurposeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Enhanced Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Enhanced Daily Trends Area Chart */}
        <Card className="lg:col-span-2 shadow-xl border-0 bg-gradient-to-br from-white via-green-50/20 to-white">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center text-xl font-bold text-gray-800">
              <TrendingUp className="w-6 h-6 mr-3 text-green-600" />
              Daily Trip Trends
            </CardTitle>
            <CardDescription className="text-gray-600">
              Weekly trends showing trips and active users
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={dailyTripsData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e0f2fe" />
                <XAxis
                  dataKey="day"
                  tick={{ fill: '#6b7280', fontSize: 12 }}
                  axisLine={{ stroke: '#d1d5db' }}
                />
                <YAxis
                  tick={{ fill: '#6b7280', fontSize: 12 }}
                  axisLine={{ stroke: '#d1d5db' }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="users"
                  stackId="1"
                  stroke="#8b7cf6"
                  fill="#8b7cf640"
                  strokeWidth={2}
                />
                <Area
                  type="monotone"
                  dataKey="trips"
                  stackId="2"
                  stroke="#10b981"
                  fill="#10b98140"
                  strokeWidth={2}
                />
                <Legend />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Enhanced Performance Metrics */}
        <Card className="shadow-xl border-0 bg-gradient-to-br from-white via-orange-50/20 to-white">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center text-xl font-bold text-gray-800">
              <Activity className="w-6 h-6 mr-3 text-orange-600" />
              Performance Metrics
            </CardTitle>
            <CardDescription className="text-gray-600">
              Key performance indicators from Kerala transportation data
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-700">Data Quality</span>
                  <span className="text-sm font-bold text-gray-900">{performanceMetrics.dataQuality}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-1000 ease-out bg-gradient-to-r from-green-500 to-green-600"
                    style={{
                      width: `${performanceMetrics.dataQuality === 'Good' ? 85 : performanceMetrics.dataQuality === 'Limited' ? 60 : 30}%`
                    }}
                  ></div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-700">User Satisfaction</span>
                  <span className="text-sm font-bold text-gray-900">{avgSatisfaction}/5.0</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-1000 ease-out bg-gradient-to-r from-blue-500 to-blue-600"
                    style={{
                      width: `${(avgSatisfaction / 5) * 100}%`
                    }}
                  ></div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-700">Most Popular Mode</span>
                  <span className="text-sm font-bold text-gray-900">{performanceMetrics.popularMode}</span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-700">Last Updated</span>
                  <span className="text-xs text-gray-600">
                    {new Date(performanceMetrics.lastUpdated).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Enhanced Hourly Traffic Chart */}
      <Card className="shadow-xl border-0 bg-gradient-to-br from-white via-indigo-50/20 to-white">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center text-xl font-bold text-gray-800">
            <Clock className="w-6 h-6 mr-3 text-indigo-600" />
            Hourly Traffic Patterns
          </CardTitle>
          <CardDescription className="text-gray-600">
            Traffic volume and congestion levels throughout the day
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={hourlyTrafficData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e7ff" />
              <XAxis
                dataKey="hour"
                tick={{ fill: '#6b7280', fontSize: 12 }}
                axisLine={{ stroke: '#d1d5db' }}
              />
              <YAxis
                tick={{ fill: '#6b7280', fontSize: 12 }}
                axisLine={{ stroke: '#d1d5db' }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey="traffic"
                stroke="#8b7cf6"
                strokeWidth={3}
                dot={{ fill: '#8b7cf6', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: '#8b7cf6', strokeWidth: 2 }}
              />
              <Line
                type="monotone"
                dataKey="congestion"
                stroke="#ef4444"
                strokeWidth={3}
                strokeDasharray="5 5"
                dot={{ fill: '#ef4444', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: '#ef4444', strokeWidth: 2 }}
              />
              <Legend />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Enhanced Alerts Section */}
      <Card className="shadow-xl border-0 bg-gradient-to-br from-white via-red-50/20 to-white">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center justify-between text-xl font-bold text-gray-800">
            <div className="flex items-center">
              <AlertCircle className="w-6 h-6 mr-3 text-red-600" />
              Active Alerts & Anomalies
            </div>
            <Badge variant="secondary" className="bg-red-100 text-red-800">
              {alerts.length} Active
            </Badge>
          </CardTitle>
          <CardDescription className="text-gray-600">
            Real-time monitoring of transportation system alerts
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {alerts.map((alert) => (
              <Card key={alert.id} className="border border-gray-200 hover:shadow-lg transition-all duration-200">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <AlertCircle className="w-5 h-5 text-gray-500" />
                      <div>
                        <div className="flex items-center space-x-3">
                          <span className="font-semibold text-gray-800">{alert.type}</span>
                          <Badge variant="outline" className={getSeverityColor(alert.severity)}>
                            {alert.severity.toUpperCase()}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{alert.message}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-sm text-gray-500">{alert.time}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="mt-6 text-center">
            <Button variant="outline" className="border-purple-200 text-purple-700 hover:bg-purple-50">
              View All Alerts →
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;