import React, { useEffect, useState } from 'react';
import { fetchStats, Stats } from '../context/statsService';
import { roleConfigs } from '../utils/roleConfigs';
import {
  Users,
  Tag,
  Archive,
  Package,
  Clock,
  CheckCircle,
  AlertTriangle,
  ShoppingCart,
  Truck,
  Bell,
  Settings
} from 'lucide-react';

export const Overview: React.FC = () => {
  const [stats, setStats] = useState<Stats | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchStats()
      .then(data => setStats(data))
      .catch(err => setError(err.message));
  }, []);

  if (error) return (
    <div className="p-6 bg-red-50 rounded-lg border border-red-200">
      <p className="text-red-600">Error: {error}</p>
    </div>
  );
  
  if (!stats) return (
    <div className="p-6">
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-gray-200 rounded w-1/4"></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
          {[...Array(12)].map((_, i) => (
            <div key={i} className="bg-gray-200 h-32 rounded-xl"></div>
          ))}
        </div>
      </div>
    </div>
  );

  const StatCard = ({ icon: Icon, title, value, subValue, color, trend }: any) => (
    <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 p-6 border border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-xl bg-opacity-10 ${color}`}>
          <Icon className={`h-6 w-6 ${color.replace('bg-', 'text-')}`} />
        </div>
        {trend && (
          <span className={`text-sm font-medium ${
            trend > 0 ? 'text-green-600' : 'text-red-600'
          }`}>
            {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}%
          </span>
        )}
      </div>
      <h3 className="text-sm font-medium text-gray-600 mb-1">{title}</h3>
      <p className="text-2xl font-bold tracking-tight">{value}</p>
      {subValue && (
        <p className="mt-2 text-sm text-gray-500">{subValue}</p>
      )}
    </div>
  );

  return (
    <div className="p-6 max-w-[1600px] mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h2 className={`text-2xl font-bold ${roleConfigs.admin.theme.colors.text}`}>Dashboard Overview</h2>
        <div className="flex items-center space-x-4">
          <select className="bg-white border border-gray-200 rounded-lg px-4 py-2 text-sm">
            <option>Last 7 days</option>
            <option>Last 30 days</option>
            <option>Last 90 days</option>
          </select>
          <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-indigo-700 transition-colors">
            Export Report
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
        <StatCard
          icon={Users}
          title="Total Users"
          value={stats.userMetrics.totalUsers}
          color="bg-blue-500"
          trend={12}
        />

        <StatCard
          icon={Tag}
          title="Categories"
          value={stats.categoryMetrics.totalCategories}
          subValue={`Avg ${stats.categoryMetrics.avgItemsPerCategory.toFixed(1)} items/category`}
          color="bg-green-500"
        />

        <StatCard
          icon={Archive}
          title="In Stock"
          value={stats.foodItemMetrics.totalInStock}
          subValue={`${stats.foodItemMetrics.expiringInNext7Days} expiring soon`}
          color="bg-yellow-500"
          trend={-5}
        />

        <StatCard
          icon={Package}
          title="Total Donations"
          value={stats.donationMetrics.totalDonations}
          color="bg-purple-500"
          trend={8}
        />

        <StatCard
          icon={Clock}
          title="Pending Donations"
          value={stats.donationMetrics.donationsByStatus.Pending}
          color="bg-gray-500"
        />

        <StatCard
          icon={CheckCircle}
          title="Donated"
          value={stats.donationMetrics.donationsByStatus.Donated}
          color="bg-emerald-500"
          trend={15}
        />

        <StatCard
          icon={AlertTriangle}
          title="Expired"
          value={stats.donationMetrics.donationsByStatus.Expired}
          color="bg-red-500"
          trend={-3}
        />

        <StatCard
          icon={ShoppingCart}
          title="Total Orders"
          value={stats.orderMetrics.totalOrders}
          color="bg-indigo-500"
        />

        <StatCard
          icon={Clock}
          title="Pending Orders"
          value={stats.orderMetrics.ordersByStatus.pending}
          color="bg-orange-500"
        />

        <StatCard
          icon={Truck}
          title="Delivered Orders"
          value={stats.orderMetrics.ordersByStatus.delivered}
          color="bg-teal-500"
          trend={10}
        />

        <StatCard
          icon={Bell}
          title="Notifications"
          value={stats.notificationMetrics.totalNotifications}
          subValue={`${stats.notificationMetrics.unreadNotifications} unread`}
          color="bg-pink-500"
        />

        <StatCard
          icon={Settings}
          title="Custom Schedules"
          value={stats.settingsMetrics.usersWithCustomSchedules}
          color="bg-violet-500"
        />
      </div>
    </div>
  );
};