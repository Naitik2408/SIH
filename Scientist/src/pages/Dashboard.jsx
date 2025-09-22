import React from 'react';
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

// Enhanced sample data with purple theme colors
const modeShareData = [
  { name: 'Car', value: 45, color: '#a28ef9', icon: Car },
  { name: 'Bus', value: 25, color: '#8b7cf6', icon: Bus },
  { name: 'Train', value: 15, color: '#7c3aed', icon: Train },
  { name: 'Walk', value: 10, color: '#c084fc', icon: Footprints },
  { name: 'Bike', value: 5, color: '#e879f9', icon: Bike }
];

const tripPurposeData = [
  { name: 'Work', trips: 1200, fill: '#a28ef9' },
  { name: 'Shopping', trips: 800, fill: '#8b7cf6' },
  { name: 'Education', trips: 600, fill: '#7c3aed' },
  { name: 'Recreation', trips: 400, fill: '#c084fc' },
  { name: 'Medical', trips: 200, fill: '#e879f9' },
  { name: 'Other', trips: 300, fill: '#ddd6fe' }
];

const dailyTripsData = [
  { day: 'Mon', trips: 1250, users: 850 },
  { day: 'Tue', trips: 1380, users: 920 },
  { day: 'Wed', trips: 1420, users: 980 },
  { day: 'Thu', trips: 1390, users: 965 },
  { day: 'Fri', trips: 1580, users: 1120 },
  { day: 'Sat', trips: 980, users: 720 },
  { day: 'Sun', trips: 720, users: 540 }
];

const hourlyTrafficData = [
  { hour: '6AM', traffic: 20, congestion: 15 },
  { hour: '7AM', traffic: 45, congestion: 35 },
  { hour: '8AM', traffic: 85, congestion: 75 },
  { hour: '9AM', traffic: 65, congestion: 50 },
  { hour: '10AM', traffic: 40, congestion: 25 },
  { hour: '11AM', traffic: 50, congestion: 30 },
  { hour: '12PM', traffic: 70, congestion: 55 },
  { hour: '1PM', traffic: 60, congestion: 45 },
  { hour: '2PM', traffic: 45, congestion: 30 },
  { hour: '3PM', traffic: 55, congestion: 40 },
  { hour: '4PM', traffic: 75, congestion: 60 },
  { hour: '5PM', traffic: 90, congestion: 80 },
  { hour: '6PM', traffic: 95, congestion: 85 },
  { hour: '7PM', traffic: 80, congestion: 65 },
  { hour: '8PM', traffic: 60, congestion: 40 }
];

const performanceMetrics = [
  { name: 'Efficiency', value: 85, fill: '#a28ef9' },
  { name: 'Coverage', value: 92, fill: '#8b7cf6' },
  { name: 'Satisfaction', value: 78, fill: '#7c3aed' },
  { name: 'Reliability', value: 88, fill: '#c084fc' }
];

const alerts = [
  {
    id: 1,
    type: 'High Traffic',
    message: 'Unusual congestion detected on Route 101',
    severity: 'high',
    time: '2 hours ago'
  },
  {
    id: 2,
    type: 'Service Disruption',
    message: 'Bus route 45 experiencing delays',
    severity: 'medium',
    time: '4 hours ago'
  },
  {
    id: 3,
    type: 'Data Quality',
    message: 'GPS accuracy below threshold in Zone 3',
    severity: 'low',
    time: '6 hours ago'
  }
];

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
    <div className="p-3 md:p-6 space-y-6 md:space-y-8 bg-gradient-to-br from-purple-50/30 via-white to-blue-50/30 min-h-screen">
      {/* Enhanced Header - Responsive */}
      <div className="mb-6 md:mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0">
          <div>
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-purple-600 via-purple-700 to-blue-600 bg-clip-text text-transparent">
              Transportation Dashboard
            </h1>
            <p className="text-gray-600 mt-2 text-base md:text-lg">Real-time analytics and key performance indicators</p>
          </div>
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
            <Button variant="outline" className="border-purple-200 text-purple-700 hover:bg-purple-50 text-sm md:text-base">
              Export Data
            </Button>
            <Button className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-sm md:text-base">
              Live View
            </Button>
          </div>
        </div>
      </div>

      {/* Enhanced KPI Cards - Improved responsive grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 md:gap-6">
        <EnhancedKPICard
          title="Total Trips"
          value="15,432"
          change={12.5}
          icon={Navigation}
          gradient="from-purple-500 to-purple-600"
          description="vs last week"
        />
        <EnhancedKPICard
          title="Active Users"
          value="8,901"
          change={8.3}
          icon={Users}
          gradient="from-blue-500 to-blue-600"
          description="vs last week"
        />
        <EnhancedKPICard
          title="Avg Duration"
          value="24.5 min"
          change={-3.2}
          icon={Clock}
          gradient="from-indigo-500 to-indigo-600"
          description="vs last week"
        />
        <EnhancedKPICard
          title="Avg Distance"
          value="8.7 km"
          change={5.8}
          icon={MapPin}
          gradient="from-violet-500 to-violet-600"
          description="vs last week"
        />
        <EnhancedKPICard
          title="Peak Traffic"
          value="6,234"
          change={15.4}
          icon={TrendingUp}
          gradient="from-pink-500 to-pink-600"
          description="vs last week"
        />
      </div>

      {/* Enhanced Charts Row 1 - Responsive */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 md:gap-8">
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
            <ResponsiveContainer width="100%" height={300}>
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

      {/* Enhanced Charts Row 2 - Responsive */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
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
              Key performance indicators
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {performanceMetrics.map((metric, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700">{metric.name}</span>
                    <span className="text-sm font-bold text-gray-900">{metric.value}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-1000 ease-out"
                      style={{
                        width: `${metric.value}%`,
                        background: `linear-gradient(90deg, ${metric.fill}, ${metric.fill}dd)`
                      }}
                    ></div>
                  </div>
                </div>
              ))}
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
