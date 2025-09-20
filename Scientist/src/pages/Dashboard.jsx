import React from 'react';
import {
  PieChart,
  Pie,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell
} from 'recharts';
import {
  Users,
  Navigation,
  Clock,
  MapPin,
  TrendingUp,
  AlertCircle,
  Map,
  Activity
} from 'lucide-react';

// Sample data
const modeShareData = [
  { name: 'Car', value: 45, color: '#3B82F6' },
  { name: 'Bus', value: 25, color: '#10B981' },
  { name: 'Train', value: 15, color: '#F59E0B' },
  { name: 'Walk', value: 10, color: '#8B5CF6' },
  { name: 'Bike', value: 5, color: '#EF4444' }
];

const tripPurposeData = [
  { name: 'Work', trips: 1200 },
  { name: 'Shopping', trips: 800 },
  { name: 'Education', trips: 600 },
  { name: 'Recreation', trips: 400 },
  { name: 'Medical', trips: 200 },
  { name: 'Other', trips: 300 }
];

const dailyTripsData = [
  { day: 'Mon', trips: 1250 },
  { day: 'Tue', trips: 1380 },
  { day: 'Wed', trips: 1420 },
  { day: 'Thu', trips: 1390 },
  { day: 'Fri', trips: 1580 },
  { day: 'Sat', trips: 980 },
  { day: 'Sun', trips: 720 }
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

const KPICard = ({ title, value, change, icon: Icon, color, bgColor }) => (
  <div className="bg-white rounded-2xl shadow-md p-4 border border-gray-100">
    <div className="flex items-center justify-between mb-3">
      <div className={`p-2 rounded-lg ${bgColor}`}>
        <Icon className={`w-5 h-5 ${color}`} />
      </div>
      <div className={`text-xs px-2 py-1 rounded-full ${change >= 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
        {change >= 0 ? '↑' : '↓'} {Math.abs(change)}%
      </div>
    </div>
    <div>
      <p className="text-2xl font-bold text-gray-900 mb-1">{value}</p>
      <p className="text-sm text-gray-600">{title}</p>
      <p className="text-xs text-gray-500 mt-1">vs last week</p>
    </div>
  </div>
);

const Dashboard = () => {
  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Transportation Dashboard</h1>
        <p className="text-gray-600 mt-2">Real-time analytics and key performance indicators</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <KPICard
          title="Total Trips"
          value="15,432"
          change={12.5}
          icon={Navigation}
          color="text-blue-600"
          bgColor="bg-blue-100"
        />
        <KPICard
          title="Active Users"
          value="8,901"
          change={8.3}
          icon={Users}
          color="text-green-600"
          bgColor="bg-green-100"
        />
        <KPICard
          title="Avg Trip Duration"
          value="24.5 min"
          change={-3.2}
          icon={Clock}
          color="text-purple-600"
          bgColor="bg-purple-100"
        />
        <KPICard
          title="Avg Trip Distance"
          value="8.7 km"
          change={5.8}
          icon={MapPin}
          color="text-orange-600"
          bgColor="bg-orange-100"
        />
        <KPICard
          title="Peak Hour Traffic"
          value="6,234"
          change={15.4}
          icon={TrendingUp}
          color="text-red-600"
          bgColor="bg-red-100"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Mode Share Pie Chart */}
        <div className="bg-white rounded-2xl shadow-md p-4">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
            <Activity className="w-5 h-5 mr-2" />
            Transportation Mode Share
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={modeShareData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {modeShareData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => [`${value}%`, 'Share']} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Trip Purpose Bar Chart */}
        <div className="bg-white rounded-2xl shadow-md p-4">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
            <MapPin className="w-5 h-5 mr-2" />
            Trip Purpose Distribution
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={tripPurposeData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={(value) => [value, 'Trips']} />
              <Bar dataKey="trips" fill="#3B82F6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Trips by Day & Heatmap Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Daily Trips Sparkline */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-md p-4">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
            <TrendingUp className="w-5 h-5 mr-2" />
            Daily Trip Trends
          </h2>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={dailyTripsData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip formatter={(value) => [value, 'Trips']} />
              <Line
                type="monotone"
                dataKey="trips"
                stroke="#10B981"
                strokeWidth={3}
                dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: '#10B981', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Heatmap Preview */}
        <div className="bg-white rounded-2xl shadow-md p-4">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <Map className="w-5 h-5 mr-2" />
            Traffic Heatmap
          </h2>
          <div className="bg-gradient-to-br from-blue-100 via-green-100 to-red-100 h-40 rounded-lg flex items-center justify-center mb-4">
            <div className="text-center">
              <Map className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-500">Interactive heatmap</p>
              <p className="text-xs text-gray-400">Click to expand</p>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-gray-600">High Traffic</span>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-red-400 rounded mr-1"></div>
                <span>25 zones</span>
              </div>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-gray-600">Medium Traffic</span>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-yellow-400 rounded mr-1"></div>
                <span>42 zones</span>
              </div>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-gray-600">Low Traffic</span>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-400 rounded mr-1"></div>
                <span>68 zones</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Alerts & Anomalies */}
      <div className="bg-white rounded-2xl shadow-md p-4">
        <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
          <AlertCircle className="w-5 h-5 mr-2" />
          Active Alerts & Anomalies
        </h2>
        <div className="space-y-3">
          {alerts.map((alert) => (
            <div key={alert.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
              <div className="flex items-center space-x-3">
                <AlertCircle className="w-5 h-5 text-gray-400" />
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-medium text-gray-800">{alert.type}</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(alert.severity)}`}>
                      {alert.severity.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">{alert.message}</p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-sm text-gray-500">{alert.time}</span>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 text-center">
          <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
            View All Alerts →
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
