import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { Heart, User, History, Settings, LogOut, Truck, BookOpen, Bell, FileText, BarChart } from 'lucide-react';

const Layout = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Heart className="h-6 w-6 text-green-600" />
            <span className="text-xl font-semibold text-gray-900">Food Rescue</span>
          </div>
          <div className="flex items-center space-x-4">
            <img
              src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
              alt="Profile"
              className="h-8 w-8 rounded-full"
            />
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* Sidebar */}
          <nav className="w-64 space-y-1">
            <NavLink
              to="/dashboard/profile"
              className={({ isActive }) =>
                `flex items-center px-4 py-2 text-sm font-medium rounded-md ${
                  isActive
                    ? 'bg-green-50 text-green-700'
                    : 'text-gray-600 hover:bg-gray-50'
                }`
              }
            >
              <User className="mr-3 h-5 w-5" />
              Profile
            </NavLink>
            <NavLink
              to="/dashboard/donations"
              className={({ isActive }) =>
                `flex items-center px-4 py-2 text-sm font-medium rounded-md ${
                  isActive
                    ? 'bg-green-50 text-green-700'
                    : 'text-gray-600 hover:bg-gray-50'
                }`
              }
            >
              <Heart className="mr-3 h-5 w-5" />
              My Donations
            </NavLink>
            <NavLink
              to="/dashboard/make-donation"
              className={({ isActive }) =>
                `flex items-center px-4 py-2 text-sm font-medium rounded-md ${
                  isActive
                    ? 'bg-green-50 text-green-700'
                    : 'text-gray-600 hover:bg-gray-50'
                }`
              }
            >
              <Truck className="mr-3 h-5 w-5" />
              Make Donation
            </NavLink>
            <NavLink
              to="/dashboard/notifications"
              className={({ isActive }) =>
                `flex items-center px-4 py-2 text-sm font-medium rounded-md ${
                  isActive
                    ? 'bg-green-50 text-green-700'
                    : 'text-gray-600 hover:bg-gray-50'
                }`
              }
            >
              <Bell className="mr-3 h-5 w-5" />
              Notifications
            </NavLink>
            <NavLink
              to="/dashboard/activity-logs"
              className={({ isActive }) =>
                `flex items-center px-4 py-2 text-sm font-medium rounded-md ${
                  isActive
                    ? 'bg-green-50 text-green-700'
                    : 'text-gray-600 hover:bg-gray-50'
                }`
              }
            >
              <FileText className="mr-3 h-5 w-5" />
              Activity Logs
            </NavLink>
            <NavLink
              to="/dashboard/statistics"
              className={({ isActive }) =>
                `flex items-center px-4 py-2 text-sm font-medium rounded-md ${
                  isActive
                    ? 'bg-green-50 text-green-700'
                    : 'text-gray-600 hover:bg-gray-50'
                }`
              }
            >
              <BarChart className="mr-3 h-5 w-5" />
              Statistics
            </NavLink>
            <NavLink
              to="/dashboard/history"
              className={({ isActive }) =>
                `flex items-center px-4 py-2 text-sm font-medium rounded-md ${
                  isActive
                    ? 'bg-green-50 text-green-700'
                    : 'text-gray-600 hover:bg-gray-50'
                }`
              }
            >
              <History className="mr-3 h-5 w-5" />
              History
            </NavLink>
            <NavLink
              to="/dashboard/settings"
              className={({ isActive }) =>
                `flex items-center px-4 py-2 text-sm font-medium rounded-md ${
                  isActive
                    ? 'bg-green-50 text-green-700'
                    : 'text-gray-600 hover:bg-gray-50'
                }`
              }
            >
              <Settings className="mr-3 h-5 w-5" />
              Settings
            </NavLink>
            <button className="w-full flex items-center px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 rounded-md">
              <LogOut className="mr-3 h-5 w-5" />
              Sign Out
            </button>
          </nav>

          {/* Main Content */}
          <main className="flex-1 bg-white rounded-lg shadow">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
};

export default Layout;