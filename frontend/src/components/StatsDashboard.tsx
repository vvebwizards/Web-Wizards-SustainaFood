import React, { useEffect, useState } from 'react';
import { fetchStats, Stats } from '../context/statsService';
import {
  PieChart, Pie, Cell,
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  LineChart, Line, CartesianGrid, Legend
} from 'recharts';
import {
  TrendingUp, Users, Package, ClipboardList,
  Tag, ShoppingCart, Bell, Settings, Clock, Award,
  AlertCircle, ChevronRight, Zap, ArrowUpRight, Activity
} from 'lucide-react';

// Enhanced color palette
const COLORS = ['#6366f1', '#14b8a6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];
const GRADIENTS = {
  indigo: 'from-indigo-500 to-blue-600',
  emerald: 'from-emerald-500 to-teal-600',
  amber: 'from-amber-500 to-orange-600',
  rose: 'from-rose-500 to-pink-600',
  purple: 'from-purple-500 to-violet-600'
};

// Custom tooltip for charts
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
        <p className="text-sm font-medium text-gray-900">{`${label}`}</p>
        <p className="text-sm font-semibold text-indigo-600">{`${payload[0].value}`}</p>
      </div>
    );
  }
  return null;
};

// Card component for consistent styling
const StatsCard = ({ 
  title, 
  value, 
  icon: Icon, 
  color = 'indigo', 
  gradient = false,
  children 
}: { 
  title: string; 
  value?: string | number; 
  icon: React.ElementType; 
  color?: 'indigo' | 'emerald' | 'amber' | 'rose' | 'purple';
  gradient?: boolean;
  children?: React.ReactNode 
}) => {
  const colorMap = {
    indigo: {
      bg: 'bg-indigo-100',
      text: 'text-indigo-600',
      border: 'border-indigo-200',
      iconBg: 'bg-indigo-500',
      gradientClass: GRADIENTS.indigo
    },
    emerald: {
      bg: 'bg-emerald-100',
      text: 'text-emerald-600',
      border: 'border-emerald-200',
      iconBg: 'bg-emerald-500',
      gradientClass: GRADIENTS.emerald
    },
    amber: {
      bg: 'bg-amber-100',
      text: 'text-amber-600',
      border: 'border-amber-200',
      iconBg: 'bg-amber-500',
      gradientClass: GRADIENTS.amber
    },
    rose: {
      bg: 'bg-rose-100',
      text: 'text-rose-600',
      border: 'border-rose-200',
      iconBg: 'bg-rose-500',
      gradientClass: GRADIENTS.rose
    },
    purple: {
      bg: 'bg-purple-100',
      text: 'text-purple-600',
      border: 'border-purple-200',
      iconBg: 'bg-purple-500',
      gradientClass: GRADIENTS.purple
    }
  };

  const { bg, text, border, iconBg, gradientClass } = colorMap[color];

  return (
    <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-1 overflow-hidden">
      {gradient && (
        <div className={`h-1.5 w-full bg-gradient-to-r ${gradientClass}`}></div>
      )}
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className={`${bg} p-3 rounded-lg`}>
              <Icon className={`h-6 w-6 ${text}`} />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          </div>
          {value !== undefined && (
            <span className={`text-2xl font-bold ${text}`}>
              {value}
            </span>
          )}
        </div>
        {children}
      </div>
    </div>
  );
};

// Progress bar component
const ProgressBar = ({ 
  label, 
  value, 
  total, 
  color 
}: { 
  label: string; 
  value: number; 
  total: number;
  color: string;
}) => {
  const percentage = (value / total) * 100;
  return (
    <div className="mb-4">
      <div className="flex justify-between items-center mb-1">
        <span className="text-sm text-gray-600">{label}</span>
        <span className={`text-sm font-semibold ${color}`}>
          {value}
        </span>
      </div>
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={`h-2 rounded-full bg-opacity-90 transition-all duration-500 ease-in-out ${
            color === 'text-emerald-600' ? 'bg-emerald-500' : 
            color === 'text-amber-600' ? 'bg-amber-500' : 
            color === 'text-rose-600' ? 'bg-rose-500' : 
            'bg-indigo-500'
          }`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

export const StatsDashboard: React.FC = () => {
  const [stats, setStats] = useState<Stats | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchStats()
        .then(data => {
          setStats(data);
          setIsLoading(false);
        })
        .catch(err => {
          setError(err.message);
          setIsLoading(false);
        });
    }, 800); // Simulate loading for better UX

    return () => clearTimeout(timer);
  }, []);

  if (error) return (
    <div className="flex items-center justify-center h-96">
      <div className="bg-rose-50 border border-rose-200 rounded-lg p-6 shadow-sm max-w-md">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <AlertCircle className="h-6 w-6 text-rose-500" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-rose-700">Error loading dashboard data</h3>
            <p className="mt-2 text-sm text-rose-600">{error}</p>
            <button 
              className="mt-4 px-4 py-2 bg-rose-100 hover:bg-rose-200 text-rose-700 rounded-md text-sm font-medium transition-colors"
              onClick={() => window.location.reload()}
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const tabs = [
    { id: 'overview',     label: 'Overview',     icon: TrendingUp },
    { id: 'users',        label: 'Users',        icon: Users },
    { id: 'donations',    label: 'Donations',    icon: Package },
    { id: 'inventory',    label: 'Inventory',    icon: ClipboardList },
    { id: 'categories',   label: 'Categories',   icon: Tag },
    { id: 'orders',       label: 'Orders',       icon: ShoppingCart },
    { id: 'notifications',label: 'Notifications',icon: Bell },
    { id: 'settings',     label: 'Settings',     icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 space-y-4 sm:space-y-0">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Analytics Dashboard
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Monitor and analyze your food bank operations
            </p>
          </div>
          <div className="flex items-center space-x-4 bg-white py-2 px-4 rounded-lg shadow-sm">
            <Clock className="text-gray-400" size={18} />
            <span className="text-sm text-gray-500">
              Last updated: {new Date().toLocaleString()}
            </span>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm mb-6 overflow-hidden">
          <div className="overflow-x-auto scrollbar-hide">
            <nav className="flex border-b border-gray-100 min-w-max">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    py-4 px-6 min-w-max flex items-center justify-center text-sm font-medium transition-all duration-200
                    ${activeTab === tab.id
                      ? 'text-indigo-600 border-b-2 border-indigo-500 bg-indigo-50/50'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50 border-b-2 border-transparent'}
                  `}
                >
                  <tab.icon size={18} className="mr-2" />
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Loading State */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((_, i) => (
              <div key={i} className="bg-white rounded-xl shadow-sm p-6 h-[300px]">
                <div className="animate-pulse space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="rounded-lg bg-gray-200 h-10 w-10"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                  </div>
                  <div className="h-4 bg-gray-200 rounded w-1/4 ml-auto"></div>
                  <div className="h-[180px] bg-gray-100 rounded-lg mt-6"></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <section className="space-y-6">
            {/* Overview */}
            {activeTab === 'overview' && stats && (
              <div className="space-y-6">
                {/* Summary cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="bg-white rounded-xl shadow-sm p-5 hover:shadow-md transition-all duration-300">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-500">Total Users</p>
                        <p className="text-2xl font-bold text-gray-900 mt-1">
                          {stats.userMetrics.totalUsers}
                        </p>
                      </div>
                      <div className="rounded-full bg-indigo-100 p-3">
                        <Users className="h-5 w-5 text-indigo-600" />
                      </div>
                    </div>
                    <div className="flex items-center mt-4 text-xs text-indigo-600 font-medium">
                      <ArrowUpRight className="h-3 w-3 mr-1" />
                      <span>4.5% increase</span>
                    </div>
                  </div>
                  
                  <div className="bg-white rounded-xl shadow-sm p-5 hover:shadow-md transition-all duration-300">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-500">Inventory Items</p>
                        <p className="text-2xl font-bold text-gray-900 mt-1">
                          {stats.foodItemMetrics.totalInStock}
                        </p>
                      </div>
                      <div className="rounded-full bg-emerald-100 p-3">
                        <Package className="h-5 w-5 text-emerald-600" />
                      </div>
                    </div>
                    <div className="flex items-center mt-4 text-xs text-emerald-600 font-medium">
                      <ArrowUpRight className="h-3 w-3 mr-1" />
                      <span>2.7% increase</span>
                    </div>
                  </div>
                  
                  <div className="bg-white rounded-xl shadow-sm p-5 hover:shadow-md transition-all duration-300">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-500">Active Donations</p>
                        <p className="text-2xl font-bold text-gray-900 mt-1">
                          {stats.donationMetrics.donationsByStatus.active || 0}
                        </p>
                      </div>
                      <div className="rounded-full bg-amber-100 p-3">
                        <Award className="h-5 w-5 text-amber-600" />
                      </div>
                    </div>
                    <div className="flex items-center mt-4 text-xs text-amber-600 font-medium">
                      <ArrowUpRight className="h-3 w-3 mr-1" />
                      <span>3.2% increase</span>
                    </div>
                  </div>
                  
                  <div className="bg-white rounded-xl shadow-sm p-5 hover:shadow-md transition-all duration-300">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-500">Orders Pending</p>
                        <p className="text-2xl font-bold text-gray-900 mt-1">
                          {stats.orderMetrics.ordersByStatus.pending}
                        </p>
                      </div>
                      <div className="rounded-full bg-rose-100 p-3">
                        <ShoppingCart className="h-5 w-5 text-rose-600" />
                      </div>
                    </div>
                    <div className="flex items-center mt-4 text-xs text-rose-600 font-medium">
                      <ArrowUpRight className="h-3 w-3 mr-1" />
                      <span>1.8% increase</span>
                    </div>
                  </div>
                </div>
                
                {/* Main charts */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Total Users */}
                  <StatsCard 
                    title="User Composition" 
                    icon={Users} 
                    color="indigo"
                    gradient={true}
                  >
                    <div className="h-48">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={Object.entries(stats.userMetrics.usersByRole).map(([name, value]) => ({ name, value }))}
                            innerRadius={40}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                            animationDuration={1000}
                            animationBegin={200}
                          >
                            {Object.entries(stats.userMetrics.usersByRole).map((_, i) => (
                              <Cell 
                                key={i} 
                                fill={COLORS[i % COLORS.length]} 
                                strokeWidth={1}
                              />
                            ))}
                          </Pie>
                          <Tooltip content={<CustomTooltip />} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="grid grid-cols-2 gap-2 mt-4">
                      {Object.entries(stats.userMetrics.usersByRole).map(([role, count], i) => (
                        <div key={role} className="flex items-center space-x-2">
                          <div 
                            className="w-3 h-3 rounded-full" 
                            style={{ backgroundColor: COLORS[i % COLORS.length] }}
                          ></div>
                          <span className="text-xs text-gray-600 capitalize">{role}</span>
                        </div>
                      ))}
                    </div>
                  </StatsCard>

                  {/* Inventory Status */}
                  <StatsCard 
                    title="Inventory Status" 
                    icon={Package} 
                    color="emerald"
                    gradient={true}
                  >
                    <div className="space-y-3 mt-2">
                      <ProgressBar
                        label="In Stock"
                        value={stats.foodItemMetrics.totalInStock}
                        total={stats.foodItemMetrics.totalInStock + stats.foodItemMetrics.expiringInNext7Days}
                        color="text-emerald-600"
                      />
                      <ProgressBar
                        label="Expiring Soon"
                        value={stats.foodItemMetrics.expiringInNext7Days}
                        total={stats.foodItemMetrics.totalInStock + stats.foodItemMetrics.expiringInNext7Days}
                        color="text-amber-600"
                      />
                      
                      <div className="mt-6">
                        <h4 className="text-sm font-medium text-gray-700 mb-3">Inventory Health</h4>
                        <ResponsiveContainer width="100%" height={80}>
                          <LineChart
                            data={[
                              { name: 'Mon', value: 340 },
                              { name: 'Tue', value: 390 },
                              { name: 'Wed', value: 410 },
                              { name: 'Thu', value: 380 },
                              { name: 'Fri', value: 430 },
                              { name: 'Sat', value: 450 },
                              { name: 'Sun', value: 420 },
                            ]}
                          >
                            <Line 
                              type="monotone" 
                              dataKey="value" 
                              stroke="#10b981" 
                              strokeWidth={2}
                              dot={false}
                              activeDot={{ r: 4, fill: '#10b981', stroke: '#fff', strokeWidth: 2 }}
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </StatsCard>

                  {/* Donations Overview */}
                  <StatsCard 
                    title="Donations Status" 
                    icon={Award}
                    color="purple"
                    gradient={true}
                  >
                    <div className="h-48">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={Object.entries(stats.donationMetrics.donationsByStatus).map(
                            ([status, count]) => ({ status, count })
                          )}
                          margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
                        >
                          <XAxis 
                            dataKey="status" 
                            angle={-45} 
                            textAnchor="end" 
                            height={60}
                            tick={{ fontSize: 12, fill: '#4b5563' }}
                          />
                          <YAxis tick={{ fontSize: 12, fill: '#4b5563' }} />
                          <Tooltip content={<CustomTooltip />} />
                          <Bar 
                            dataKey="count" 
                            radius={[4, 4, 0, 0]} 
                            animationDuration={1500}
                          >
                            {Object.entries(stats.donationMetrics.donationsByStatus).map((_, i) => (
                              <Cell key={`cell-${i}`} fill={COLORS[i % COLORS.length]} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </StatsCard>
                </div>
                
                {/* Activity Timeline */}
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-gray-900">
                      <div className="flex items-center space-x-2">
                        <Activity className="h-5 w-5 text-indigo-500" />
                        <span>Recent Activity</span>
                      </div>
                    </h3>
                    <button className="text-sm text-indigo-600 hover:text-indigo-800 font-medium flex items-center">
                      <span>View all</span>
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </button>
                  </div>
                  
                  <div className="space-y-4">
                    {[
                      { time: '2 hours ago', event: 'New donation received', type: 'donation' },
                      { time: '4 hours ago', event: 'Item #3421 marked as delivered', type: 'delivery' },
                      { time: '8 hours ago', event: 'New volunteer registration', type: 'user' },
                      { time: '12 hours ago', event: 'Inventory updated', type: 'inventory' },
                    ].map((activity, i) => (
                      <div key={i} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                        <div className={`p-2 rounded-full
                          ${activity.type === 'donation' ? 'bg-purple-100' : 
                           activity.type === 'delivery' ? 'bg-emerald-100' :
                           activity.type === 'user' ? 'bg-indigo-100' : 'bg-amber-100'}
                        `}>
                          {activity.type === 'donation' ? <Award className="h-4 w-4 text-purple-600" /> :
                           activity.type === 'delivery' ? <ShoppingCart className="h-4 w-4 text-emerald-600" /> :
                           activity.type === 'user' ? <Users className="h-4 w-4 text-indigo-600" /> :
                           <Package className="h-4 w-4 text-amber-600" />}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium text-gray-900">{activity.event}</p>
                            <span className="text-xs text-gray-500">{activity.time}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Users */}
            {activeTab === 'users' && stats && (
              <div className="space-y-6">
                <div className="p-6 bg-white rounded-xl shadow-sm">
                  <h3 className="text-lg font-semibold text-gray-900 mb-6">User Distribution</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={Object.entries(stats.userMetrics.usersByRole).map(([name, value]) => ({ name, value }))}
                            innerRadius={70}
                            outerRadius={90}
                            paddingAngle={5}
                            dataKey="value"
                            animationDuration={800}
                            animationBegin={300}
                          >
                            {Object.entries(stats.userMetrics.usersByRole).map((_, i) => (
                              <Cell 
                                key={i} 
                                fill={COLORS[i % COLORS.length]} 
                                strokeWidth={1}
                              />
                            ))}
                          </Pie>
                          <Tooltip content={<CustomTooltip />} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    
                    <div className="space-y-4">
                      {Object.entries(stats.userMetrics.usersByRole).map(([role, count], i) => (
                        <div 
                          key={role} 
                          className="bg-white p-4 rounded-lg border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <div
                                className="p-3 rounded-lg"
                                style={{ backgroundColor: `${COLORS[i % COLORS.length]}20` }}
                              >
                                <Users
                                  className="h-5 w-5"
                                  style={{ color: COLORS[i % COLORS.length] }}
                                />
                              </div>
                              <div>
                                <h3 className="text-base font-semibold text-gray-900 capitalize">
                                  {role}s
                                </h3>
                                <p className="text-xs text-gray-500 mt-0.5">
                                  {role === 'volunteer' ? 'Help manage donations' :
                                   role === 'donor' ? 'Provide food items' :
                                   role === 'recipient' ? 'Receive food donations' : 'Manage system'}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center">
                              <span
                                className="text-xl font-bold mr-2"
                                style={{ color: COLORS[i % COLORS.length] }}
                              >
                                {count}
                              </span>
                              <span className="text-xs text-gray-500">
                                {((count / stats.userMetrics.totalUsers) * 100).toFixed(1)}%
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Donations */}
            {activeTab === 'donations' && stats && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* By Status */}
                <StatsCard title="Donations by Status" icon={Award} color="purple">
                  <div className="h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={Object.entries(stats.donationMetrics.donationsByStatus).map(
                          ([status, count]) => ({ status, count })
                        )}
                        margin={{ top: 0, right: 0, left: 0, bottom: 0 }}
                      >
                        <XAxis dataKey="status" />
                        <YAxis />
                        <Tooltip content={<CustomTooltip />} />
                        <Bar 
                          dataKey="count" 
                          radius={[4, 4, 0, 0]} 
                          animationDuration={1500}
                        >
                          {Object.entries(stats.donationMetrics.donationsByStatus).map((_, i) => (
                            <Cell key={`cell-${i}`} fill={COLORS[i % COLORS.length]} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </StatsCard>

                {/* By Category */}
                <StatsCard title="Donations by Category" icon={Tag} color="amber">
                  <ul className="space-y-2 mt-2">
                    {stats.donationsByCategory.map((d, i) => (
                      <li key={i} className="flex justify-between items-center p-2 rounded-lg hover:bg-amber-50 transition-colors">
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }}></div>
                          <span className="text-sm text-gray-700">{d._id}</span>
                        </div>
                        <div className="flex items-center">
                          <span className="text-sm font-semibold text-amber-600">{d.count}</span>
                          <div className="ml-2 w-16 bg-gray-100 h-1.5 rounded-full">
                            <div 
                              className="h-1.5 rounded-full bg-amber-500"
                              style={{ 
                                width: `${(d.count / Math.max(...stats.donationsByCategory.map(x => x.count))) * 100}%` 
                              }}
                            ></div>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </StatsCard>

                {/* Avg Size */}
                <StatsCard title="Avg Donation Size" icon={Package} color="emerald">
                  <ul className="space-y-2 mt-2">
                    {stats.avgDonationSize.map((d, i) => (
                      <li key={i} className="flex justify-between items-center p-2 rounded-lg hover:bg-emerald-50 transition-colors">
                        <span className="text-sm text-gray-700">Item {d._id}</span>
                        <span className="text-sm font-semibold text-emerald-600">{d.avgSize.toFixed(2)} kg</span>
                      </li>
                    ))}
                  </ul>
                </StatsCard>
              </div>
            )}

            {/* Inventory */}
            {activeTab === 'inventory' && stats && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Stock vs Donated */}
                <StatsCard title="Stock vs Donated" icon={Package} color="indigo">
                  <div className="space-y-3 mt-3">
                    <div className="flex justify-between items-center p-3 bg-indigo-50 rounded-lg">
                      <span className="text-sm text-gray-700">Total Stock</span>
                      <span className="text-base font-semibold text-indigo-600">
                        {stats.stockVsDonation.totalStock} items
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                      <span className="text-sm text-gray-700">Total Donated</span>
                      <span className="text-base font-semibold text-purple-600">
                        {stats.stockVsDonation.totalDonated} items
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg mt-2">
                      <span className="text-sm font-medium text-gray-700">Efficiency Ratio</span>
                      <div className="flex items-center">
                        <span className="text-base font-semibold text-gray-900">
                          {stats.stockVsDonation.ratio.toFixed(2)}
                        </span>
                        {stats.stockVsDonation.ratio > 1 ? (
                          <ArrowUpRight className="h-4 w-4 text-emerald-500 ml-1" />
                        ) : (
                          <ArrowUpRight className="h-4 w-4 text-amber-500 ml-1 transform rotate-90" />
                        )}
                      </div>
                    </div>
                  </div>
                </StatsCard>

                {/* Expiry Conversion */}
                <StatsCard title="Expiry Conversion" icon={Zap} color="amber">
                  <div className="space-y-3 mt-2">
                    <ProgressBar
                      label="Donated Before Expiry"
                      value={stats.expiryConversion.donatedBeforeExpiry}
                      total={stats.expiryConversion.donatedBeforeExpiry + stats.expiryConversion.donatedAfterExpiry}
                      color="text-emerald-600"
                    />
                    <ProgressBar
                      label="Donated After Expiry"
                      value={stats.expiryConversion.donatedAfterExpiry}
                      total={stats.expiryConversion.donatedBeforeExpiry + stats.expiryConversion.donatedAfterExpiry}
                      color="text-rose-600"
                    />
                    
                    <div className="flex justify-between items-center p-3 bg-emerald-50 rounded-lg mt-4">
                      <span className="text-sm font-medium text-gray-700">Success Rate</span>
                      <div className="flex items-center">
                        <span className="text-lg font-semibold text-emerald-600">
                          {(stats.expiryConversion.rateBeforeExpiry * 100).toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  </div>
                </StatsCard>
              </div>
            )}

            {/* Categories */}
            {activeTab === 'categories' && stats && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <StatsCard title="Categories Overview" icon={Tag} color="purple">
                  <div className="space-y-3 mt-3">
                    <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                      <span className="text-sm text-gray-700">Total Categories</span>
                      <span className="text-base font-semibold text-purple-600">
                        {stats.categoryMetrics.totalCategories}
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-indigo-50 rounded-lg">
                      <span className="text-sm text-gray-700">Avg Items/Category</span>
                      <span className="text-base font-semibold text-indigo-600">
                        {stats.categoryMetrics.avgItemsPerCategory.toFixed(2)}
                      </span>
                    </div>
                    
                    <h4 className="text-sm font-medium text-gray-700 mt-4 mb-2">Top Categories</h4>
                    <ul className="space-y-2">
                      {stats.donationsByCategory.slice(0, 5).map((d, i) => (
                        <li key={i} className="flex justify-between items-center">
                          <div className="flex items-center space-x-2">
                            <div 
                              className="w-2 h-2 rounded-full" 
                              style={{ backgroundColor: COLORS[i % COLORS.length] }}
                            ></div>
                            <span className="text-sm text-gray-700">{d._id}</span>
                          </div>
                          <span className="text-sm font-medium text-gray-900">{d.count}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </StatsCard>
                
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Category Distribution</h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={stats.donationsByCategory.map(d => ({ name: d._id, value: d.count }))}
                          innerRadius={60}
                          outerRadius={90}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {stats.donationsByCategory.map((_, i) => (
                            <Cell key={i} fill={COLORS[i % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            )}

            {/* Orders */}
            {activeTab === 'orders' && stats && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* By Status */}
                <StatsCard title="Orders Overview" icon={ShoppingCart} color="rose">
                  <div className="space-y-3 mt-3">
                    <div className="flex justify-between items-center p-3 bg-rose-50 rounded-lg">
                      <span className="text-sm text-gray-700">Total Orders</span>
                      <span className="text-base font-semibold text-rose-600">
                        {stats.orderMetrics.totalOrders}
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-amber-50 rounded-lg">
                      <span className="text-sm text-gray-700">Pending</span>
                      <span className="text-base font-semibold text-amber-600">
                        {stats.orderMetrics.ordersByStatus.pending}
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-emerald-50 rounded-lg">
                      <span className="text-sm text-gray-700">Delivered</span>
                      <span className="text-base font-semibold text-emerald-600">
                        {stats.orderMetrics.ordersByStatus.delivered}
                      </span>
                    </div>
                    
                    <div className="mt-4 bg-gray-50 rounded-lg p-3">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-xs text-gray-500">Delivery Rate</span>
                        <span className="text-xs font-medium text-emerald-600">
                          {((stats.orderMetrics.ordersByStatus.delivered / stats.orderMetrics.totalOrders) * 100).toFixed(1)}%
                        </span>
                      </div>
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-2 bg-emerald-500 rounded-full"
                          style={{ 
                            width: `${(stats.orderMetrics.ordersByStatus.delivered / stats.orderMetrics.totalOrders) * 100}%` 
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </StatsCard>

                {/* By Location */}
                <StatsCard title="Orders by Location" icon={Package} color="indigo">
                  <div className="mt-2">
                    <div className="h-48">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={stats.ordersByLocation.map(o => ({ location: o._id, count: o.count }))}
                          margin={{ top: 0, right: 0, left: 0, bottom: 0 }}
                          layout="vertical"
                        >
                          <XAxis type="number" />
                          <YAxis 
                            dataKey="location" 
                            type="category" 
                            tick={{ fontSize: 12 }}
                            width={100}
                          />
                          <Tooltip content={<CustomTooltip />} />
                          <Bar 
                            dataKey="count" 
                            fill={COLORS[2]} 
                            radius={[0, 4, 4, 0]}
                            barSize={20}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </StatsCard>
              </div>
            )}

            {/* Notifications */}
            {activeTab === 'notifications' && stats && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <StatsCard title="Notification Metrics" icon={Bell} color="amber">
                  <div className="space-y-3 mt-3">
                    <div className="flex justify-between items-center p-3 bg-amber-50 rounded-lg">
                      <span className="text-sm text-gray-700">Total Sent</span>
                      <span className="text-base font-semibold text-amber-600">
                        {stats.notificationMetrics.totalNotifications}
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-indigo-50 rounded-lg">
                      <span className="text-sm text-gray-700">Unread</span>
                      <span className="text-base font-semibold text-indigo-600">
                        {stats.notificationMetrics.unreadNotifications}
                      </span>
                    </div>
                    
                    <div className="mt-4 bg-gray-50 rounded-lg p-3">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-xs text-gray-500">Read Rate</span>
                        <span className="text-xs font-medium text-emerald-600">
                          {(((stats.notificationMetrics.totalNotifications - stats.notificationMetrics.unreadNotifications) / 
                           stats.notificationMetrics.totalNotifications) * 100).toFixed(1)}%
                        </span>
                      </div>
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-2 bg-emerald-500 rounded-full"
                          style={{ 
                            width: `${((stats.notificationMetrics.totalNotifications - stats.notificationMetrics.unreadNotifications) / 
                                    stats.notificationMetrics.totalNotifications) * 100}%` 
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </StatsCard>
                
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Notifications</h3>
                  <div className="space-y-3">
                    {[
                      { title: 'New Donation', message: 'A new donation was received', time: '2 hours ago', read: false },
                      { title: 'Order Updated', message: 'Order #1234 status changed to delivered', time: '4 hours ago', read: true },
                      { title: 'Inventory Alert', message: 'Some items are about to expire', time: '1 day ago', read: true },
                      { title: 'New User', message: 'New volunteer registration needs approval', time: '2 days ago', read: true },
                    ].map((notification, i) => (
                      <div 
                        key={i} 
                        className={`p-3 rounded-lg border ${notification.read ? 'border-gray-200' : 'border-amber-200 bg-amber-50'}`}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="text-sm font-medium text-gray-900">{notification.title}</h4>
                            <p className="text-xs text-gray-500 mt-1">{notification.message}</p>
                          </div>
                          <div className="flex items-center">
                            {!notification.read && (
                              <span className="w-2 h-2 bg-amber-500 rounded-full mr-2"></span>
                            )}
                            <span className="text-xs text-gray-400">{notification.time}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Settings */}
            {activeTab === 'settings' && stats && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <StatsCard title="Custom Schedules" icon={Settings} color="indigo">
                  <div className="flex items-center justify-between mt-2">
                    <p className="text-sm text-gray-600">Users with custom donation schedules</p>
                    <span className="text-2xl font-bold text-indigo-600">
                      {stats.settingsMetrics.usersWithCustomSchedules}
                    </span>
                  </div>
                  <div className="mt-4 h-32">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={[
                          { name: 'Jan', value: 4 },
                          { name: 'Feb', value: 6 },
                          { name: 'Mar', value: 8 },
                          { name: 'Apr', value: 10 },
                          { name: 'May', value: 15 },
                          { name: 'Jun', value: stats.settingsMetrics.usersWithCustomSchedules },
                        ]}
                      >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.2} />
                        <XAxis 
                          dataKey="name" 
                          axisLine={false}
                          tickLine={false}
                        />
                        <YAxis 
                          axisLine={false}
                          tickLine={false}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Line 
                          type="monotone" 
                          dataKey="value" 
                          stroke="#6366f1"
                          strokeWidth={2}
                          activeDot={{ r: 6, fill: '#6366f1', stroke: '#fff', strokeWidth: 2 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </StatsCard>
                
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">System Performance</h3>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-gray-600">Database</span>
                        <span className="text-sm font-medium text-emerald-600">Good</span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full">
                        <div className="h-2 bg-emerald-500 rounded-full w-[85%]" />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-gray-600">API Response</span>
                        <span className="text-sm font-medium text-emerald-600">Excellent</span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full">
                        <div className="h-2 bg-emerald-500 rounded-full w-[95%]" />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-gray-600">Storage</span>
                        <span className="text-sm font-medium text-amber-600">Moderate</span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full">
                        <div className="h-2 bg-amber-500 rounded-full w-[65%]" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </section>
        )}
      </div>
    </div>
  );
};