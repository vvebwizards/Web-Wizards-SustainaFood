import React, { useState, useEffect } from 'react';
import { Heart, Hourglass, Timer, UserCircle, Edit2, Award, Users, Calendar, CheckCircle, Clock, Package, Truck, HandHeart, ShieldCheck, PieChart as ChartPie, BarChart3, LineChart, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Bar, Pie, Line } from 'react-chartjs-2';
import { useAuth } from '../context/AuthContext';
import { useStatistics } from '../context/StatisticsContext';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
} from 'chart.js';
import { getUserId } from "../utils/chatHelpers";
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const roleConfigs = {
  admin: {
    theme: {
      primary: "red",
      colors: {
        bg: "bg-red-50",
        text: "text-red-700",
        hover: "hover:bg-red-100",
        button: "bg-red-600 hover:bg-red-700",
      },
    },
    stats: {
      totalUsers: 1250,
      activeVolunteers: 85,
      monthlyDonations: 4500,
      monthlyGrowth: [2800, 3200, 3800, 4100, 4500],
      userTypes: {
        donors: 450,
        recipients: 650,
        volunteers: 150
      }
    }
  },
  donor: {
    theme: {
      primary: "green",
      colors: {
        bg: "bg-green-50",
        text: "text-green-700",
        hover: "hover:bg-green-100",
        button: "bg-green-600 hover:bg-green-700",
      },
    },
  },
  recipient: {
    theme: {
      primary: "blue",
      colors: {
        bg: "bg-blue-50",
        text: "text-blue-700",
        hover: "hover:bg-blue-100",
        button: "bg-blue-600 hover:bg-blue-700",
      },
    },
    stats: {
      receivedDonations: 45,
      pendingDeliveries: 3,
      completedDeliveries: 42,
      deliveryHistory: [32, 35, 38, 40, 42],
      foodCategories: {
        vegetables: 15,
        fruits: 12,
        dairy: 8,
        grains: 10
      }
    }
  },
  volunteer: {
    theme: {
      primary: "purple",
      colors: {
        bg: "bg-purple-50",
        text: "text-purple-700",
        hover: "hover:bg-purple-100",
        button: "bg-purple-600 hover:bg-purple-700",
      },
    },
    stats: {
      deliveriesMade: 128,
      hoursVolunteered: 156,
      activeAssignments: 4,
      weeklyDeliveries: [22, 25, 28, 26, 27],
      deliveryTypes: {
        standard: 85,
        express: 30,
        scheduled: 13
      }
    }
  },
};

const Profile = () => {
  const { user } = useAuth();
  const { totalDonations, expiredQuantity, averageShelfLife, donationCountsByFoodItem, loading, error } = useStatistics();

  const defaultImage = 'https://via.placeholder.com/150';

  const getImageUrl = (profileImage: string | undefined) => {
    if (!profileImage) return defaultImage;
    if (profileImage.startsWith('http')) return profileImage;
    return `http://localhost:5000${profileImage}?t=${new Date().getTime()}`;
  };

  const [profileImageUrl, setProfileImageUrl] = useState(getImageUrl(user?.profileImage));

  useEffect(() => {
    if (user?.profileImage) {
      setProfileImageUrl(getImageUrl(user.profileImage));
    }
  }, [user?.profileImage]);
  const theme = roleConfigs[user?.role as keyof typeof roleConfigs]?.theme || roleConfigs.donor.theme;


  const renderRoleSpecificStats = () => {
    switch (user?.role) {
      case 'admin':
        return (
          <>
            <div className={`${theme.colors.bg} p-6 rounded-xl shadow-md border border-${theme.primary}-200 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:border-${theme.primary}-300`}>
              <div className="flex items-start">
                <div className={`flex items-center justify-center w-12 h-12 rounded-lg bg-${theme.primary}-100 ${theme.colors.text}`}>
                  <Users />
                </div>
                <div className="ml-4">
                  <h3 className="text-base font-medium text-gray-700">Total Users</h3>
                  <p className={`text-2xl font-bold ${theme.colors.text} mt-1`}>{roleConfigs.admin.stats.totalUsers}</p>
                </div>
              </div>
            </div>
            
            <div className={`${theme.colors.bg} p-6 rounded-xl shadow-md border border-${theme.primary}-200 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:border-${theme.primary}-300`}>
              <div className="flex items-start">
                <div className={`flex items-center justify-center w-12 h-12 rounded-lg bg-${theme.primary}-100 ${theme.colors.text}`}>
                  <HandHeart />
                </div>
                <div className="ml-4">
                  <h3 className="text-base font-medium text-gray-700">Active Volunteers</h3>
                  <p className={`text-2xl font-bold ${theme.colors.text} mt-1`}>{roleConfigs.admin.stats.activeVolunteers}</p>
                </div>
              </div>
            </div>
            
            <div className={`${theme.colors.bg} p-6 rounded-xl shadow-md border border-${theme.primary}-200 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:border-${theme.primary}-300`}>
              <div className="flex items-start">
                <div className={`flex items-center justify-center w-12 h-12 rounded-lg bg-${theme.primary}-100 ${theme.colors.text}`}>
                  <Package />
                </div>
                <div className="ml-4">
                  <h3 className="text-base font-medium text-gray-700">Monthly Donations</h3>
                  <p className={`text-2xl font-bold ${theme.colors.text} mt-1`}>{roleConfigs.admin.stats.monthlyDonations} kg</p>
                </div>
              </div>
            </div>
          </>
        );

      case 'donor':
        return (
          <>
            <div className={`${theme.colors.bg} p-6 rounded-xl shadow-md border border-${theme.primary}-200 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:border-${theme.primary}-300`}>
              <div className="flex items-start">
                <div className={`flex items-center justify-center w-12 h-12 rounded-lg bg-${theme.primary}-100 ${theme.colors.text}`}>
                  <Heart />
                </div>
                <div className="ml-4">
                  <h3 className="text-base font-medium text-gray-700">Total Donations</h3>
                  <p className={`text-2xl font-bold ${theme.colors.text} mt-1`}>{totalDonations} kg</p>
                </div>
              </div>
            </div>
            
            <div className={`${theme.colors.bg} p-6 rounded-xl shadow-md border border-${theme.primary}-200 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:border-${theme.primary}-300`}>
              <div className="flex items-start">
                <div className={`flex items-center justify-center w-12 h-12 rounded-lg bg-${theme.primary}-100 ${theme.colors.text}`}>
                  <Hourglass />
                </div>
                <div className="ml-4">
                  <h3 className="text-base font-medium text-gray-700">Average Shelf-Life</h3>
                  <p className={`text-2xl font-bold ${theme.colors.text} mt-1`}>{averageShelfLife} days</p>
                </div>
              </div>
            </div>
            
            <div className={`${theme.colors.bg} p-6 rounded-xl shadow-md border border-${theme.primary}-200 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:border-${theme.primary}-300`}>
              <div className="flex items-start">
                <div className={`flex items-center justify-center w-12 h-12 rounded-lg bg-${theme.primary}-100 ${theme.colors.text}`}>
                  <Timer />
                </div>
                <div className="ml-4">
                  <h3 className="text-base font-medium text-gray-700">Expired Donations</h3>
                  <p className={`text-2xl font-bold ${theme.colors.text} mt-1`}>{expiredQuantity} kg</p>
                </div>
              </div>
            </div>
          </>
        );

      case 'recipient':
        return (
          <>
            <div className={`${theme.colors.bg} p-6 rounded-xl shadow-md border border-${theme.primary}-200 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:border-${theme.primary}-300`}>
              <div className="flex items-start">
                <div className={`flex items-center justify-center w-12 h-12 rounded-lg bg-${theme.primary}-100 ${theme.colors.text}`}>
                  <Package />
                </div>
                <div className="ml-4">
                  <h3 className="text-base font-medium text-gray-700">Received Donations</h3>
                  <p className={`text-2xl font-bold ${theme.colors.text} mt-1`}>{roleConfigs.recipient.stats.receivedDonations} kg</p>
                </div>
              </div>
            </div>
            
            <div className={`${theme.colors.bg} p-6 rounded-xl shadow-md border border-${theme.primary}-200 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:border-${theme.primary}-300`}>
              <div className="flex items-start">
                <div className={`flex items-center justify-center w-12 h-12 rounded-lg bg-${theme.primary}-100 ${theme.colors.text}`}>
                  <Truck />
                </div>
                <div className="ml-4">
                  <h3 className="text-base font-medium text-gray-700">Pending Deliveries</h3>
                  <p className={`text-2xl font-bold ${theme.colors.text} mt-1`}>{roleConfigs.recipient.stats.pendingDeliveries}</p>
                </div>
              </div>
            </div>
            
            <div className={`${theme.colors.bg} p-6 rounded-xl shadow-md border border-${theme.primary}-200 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:border-${theme.primary}-300`}>
              <div className="flex items-start">
                <div className={`flex items-center justify-center w-12 h-12 rounded-lg bg-${theme.primary}-100 ${theme.colors.text}`}>
                  <CheckCircle />
                </div>
                <div className="ml-4">
                  <h3 className="text-base font-medium text-gray-700">Completed Deliveries</h3>
                  <p className={`text-2xl font-bold ${theme.colors.text} mt-1`}>{roleConfigs.recipient.stats.completedDeliveries}</p>
                </div>
              </div>
            </div>
          </>
        );

      case 'volunteer':
        return (
          <>
            <div className={`${theme.colors.bg} p-6 rounded-xl shadow-md border border-${theme.primary}-200 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:border-${theme.primary}-300`}>
              <div className="flex items-start">
                <div className={`flex items-center justify-center w-12 h-12 rounded-lg bg-${theme.primary}-100 ${theme.colors.text}`}>
                  <Truck />
                </div>
                <div className="ml-4">
                  <h3 className="text-base font-medium text-gray-700">Deliveries Made</h3>
                  <p className={`text-2xl font-bold ${theme.colors.text} mt-1`}>{roleConfigs.volunteer.stats.deliveriesMade}</p>
                </div>
              </div>
            </div>
            
            <div className={`${theme.colors.bg} p-6 rounded-xl shadow-md border border-${theme.primary}-200 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:border-${theme.primary}-300`}>
              <div className="flex items-start">
                <div className={`flex items-center justify-center w-12 h-12 rounded-lg bg-${theme.primary}-100 ${theme.colors.text}`}>
                  <Clock />
                </div>
                <div className="ml-4">
                  <h3 className="text-base font-medium text-gray-700">Hours Volunteered</h3>
                  <p className={`text-2xl font-bold ${theme.colors.text} mt-1`}>{roleConfigs.volunteer.stats.hoursVolunteered}</p>
                </div>
              </div>
            </div>
            
            <div className={`${theme.colors.bg} p-6 rounded-xl shadow-md border border-${theme.primary}-200 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:border-${theme.primary}-300`}>
              <div className="flex items-start">
                <div className={`flex items-center justify-center w-12 h-12 rounded-lg bg-${theme.primary}-100 ${theme.colors.text}`}>
                  <ShieldCheck />
                </div>
                <div className="ml-4">
                  <h3 className="text-base font-medium text-gray-700">Active Assignments</h3>
                  <p className={`text-2xl font-bold ${theme.colors.text} mt-1`}>{roleConfigs.volunteer.stats.activeAssignments}</p>
                </div>
              </div>
            </div>
          </>
        );

      default:
        return null;
    }
  };

  const renderRoleSpecificCharts = () => {
    const currentColors = chartColors[user?.role as keyof typeof chartColors] || chartColors.donor;
    const currentPieColors = pieColors[user?.role as keyof typeof pieColors] || pieColors.donor;

    switch (user?.role) {
      case 'admin':
        const monthlyGrowthData = {
          labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May'],
          datasets: [{
            label: 'Monthly Donations Growth',
            data: roleConfigs.admin.stats.monthlyGrowth,
            borderColor: currentColors.border,
            backgroundColor: currentColors.background,
            tension: 0.4,
          }]
        };

        const userDistributionData = {
          labels: ['Donors', 'Recipients', 'Volunteers'],
          datasets: [{
            data: [
              roleConfigs.admin.stats.userTypes.donors,
              roleConfigs.admin.stats.userTypes.recipients,
              roleConfigs.admin.stats.userTypes.volunteers,
            ],
            backgroundColor: [
              'rgba(239, 68, 68, 0.6)',
              'rgba(59, 130, 246, 0.6)',
              'rgba(139, 92, 246, 0.6)',
            ],
          }]
        };

        return (
          <>
            <div className={`${theme.colors.bg} p-6 rounded-xl shadow-md border border-${theme.primary}-200 transition-all duration-300 hover:shadow-lg`}>
              <div className="flex items-center gap-2 mb-4">
                <LineChart className={theme.colors.text} size={24} />
                <h3 className={`text-xl font-semibold ${theme.colors.text}`}>Monthly Donations Growth</h3>
              </div>
              <div className="h-80">
                <Line
                  data={monthlyGrowthData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                      y: {
                        beginAtZero: true,
                        title: { display: true, text: 'Donations (kg)' }
                      }
                    }
                  }}
                />
              </div>
            </div>

            <div className={`${theme.colors.bg} p-6 rounded-xl shadow-md border border-${theme.primary}-200 transition-all duration-300 hover:shadow-lg`}>
              <div className="flex items-center gap-2 mb-4">
                <ChartPie className={theme.colors.text} size={24} />
                <h3 className={`text-xl font-semibold ${theme.colors.text}`}>User Distribution</h3>
              </div>
              <div className="h-80">
                <Pie
                  data={userDistributionData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: { position: 'bottom' }
                    }
                  }}
                />
              </div>
            </div>
          </>
        );

      case 'donor':
        return (
          <>
            <div className={`${theme.colors.bg} p-6 rounded-xl shadow-md border border-${theme.primary}-200 transition-all duration-300 hover:shadow-lg`}>
              <div className="flex items-center gap-2 mb-4">
                <BarChart3 className={theme.colors.text} size={24} />
                <h3 className={`text-xl font-semibold ${theme.colors.text}`}>Donations by Food Item</h3>
              </div>
              <div className="h-80">
                <Bar
                  data={{
                    labels: donationCountsByFoodItem.map(item => item.foodItem),
                    datasets: [{
                      label: 'Quantity',
                      data: donationCountsByFoodItem.map(item => item.count),
                      backgroundColor: currentColors.background,
                      borderColor: currentColors.border,
                      borderWidth: 1,
                    }]
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                      y: {
                        beginAtZero: true,
                        title: { display: true, text: 'Quantity (kg)' }
                      }
                    }
                  }}
                />
              </div>
            </div>

            <div className={`${theme.colors.bg} p-6 rounded-xl shadow-md border border-${theme.primary}-200 transition-all duration-300 hover:shadow-lg`}>
              <div className="flex items-center gap-2 mb-4">
                <ChartPie className={theme.colors.text} size={24} />
                <h3 className={`text-xl font-semibold ${theme.colors.text}`}>Donation Status</h3>
              </div>
              <div className="h-80">
                <Pie
                  data={{
                    labels: ['Active', 'Expired'],
                    datasets: [{
                      data: [totalDonations - expiredQuantity, expiredQuantity],
                      backgroundColor: currentPieColors,
                    }]
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: { position: 'bottom' }
                    }
                  }}
                />
              </div>
            </div>
          </>
        );

      case 'recipient':
        const deliveryHistoryData = {
          labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5'],
          datasets: [{
            label: 'Completed Deliveries',
            data: roleConfigs.recipient.stats.deliveryHistory,
            borderColor: currentColors.border,
            backgroundColor: currentColors.background,
            tension: 0.4,
          }]
        };

        const foodCategoriesData = {
          labels: Object.keys(roleConfigs.recipient.stats.foodCategories),
          datasets: [{
            data: Object.values(roleConfigs.recipient.stats.foodCategories),
            backgroundColor: [
              'rgba(59, 130, 246, 0.6)',
              'rgba(16, 185, 129, 0.6)',
              'rgba(239, 68, 68, 0.6)',
              'rgba(245, 158, 11, 0.6)',
            ],
          }]
        };

        return (
          <>
            <div className={`${theme.colors.bg} p-6 rounded-xl shadow-md border border-${theme.primary}-200 transition-all duration-300 hover:shadow-lg`}>
              <div className="flex items-center gap-2 mb-4">
                <LineChart className={theme.colors.text} size={24} />
                <h3 className={`text-xl font-semibold ${theme.colors.text}`}>Delivery History</h3>
              </div>
              <div className="h-80">
                <Line
                  data={deliveryHistoryData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                      y: {
                        beginAtZero: true,
                        title: { display: true, text: 'Deliveries' }
                      }
                    }
                  }}
                />
              </div>
            </div>

            <div className={`${theme.colors.bg} p-6 rounded-xl shadow-md border border-${theme.primary}-200 transition-all duration-300 hover:shadow-lg`}>
              <div className="flex items-center gap-2 mb-4">
                <ChartPie className={theme.colors.text} size={24} />
                <h3 className={`text-xl font-semibold ${theme.colors.text}`}>Food Categories</h3>
              </div>
              <div className="h-80">
                <Pie
                  data={foodCategoriesData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: { position: 'bottom' }
                    }
                  }}
                />
              </div>
            </div>
          </>
        );

      case 'volunteer':
        const weeklyDeliveriesData = {
          labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5'],
          datasets: [{
            label: 'Weekly Deliveries',
            data: roleConfigs.volunteer.stats.weeklyDeliveries,
            borderColor: currentColors.border,
            backgroundColor: currentColors.background,
            tension: 0.4,
          }]
        };

        const deliveryTypesData = {
          labels: Object.keys(roleConfigs.volunteer.stats.deliveryTypes),
          datasets: [{
            data: Object.values(roleConfigs.volunteer.stats.deliveryTypes),
            backgroundColor: [
              'rgba(139, 92, 246, 0.6)',
              'rgba(239, 68, 68, 0.6)',
              'rgba(16, 185, 129, 0.6)',
            ],
          }]
        };

        return (
          <>
            <div className={`${theme.colors.bg} p-6 rounded-xl shadow-md border border-${theme.primary}-200 transition-all duration-300 hover:shadow-lg`}>
              <div className="flex items-center gap-2 mb-4">
                <LineChart className={theme.colors.text} size={24} />
                <h3 className={`text-xl font-semibold ${theme.colors.text}`}>Weekly Deliveries</h3>
              </div>
              <div className="h-80">
                <Line
                  data={weeklyDeliveriesData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                      y: {
                        beginAtZero: true,
                        title: { display: true, text: 'Deliveries' }
                      }
                    }
                  }}
                />
              </div>
            </div>

            <div className={`${theme.colors.bg} p-6 rounded-xl shadow-md border border-${theme.primary}-200 transition-all duration-300 hover:shadow-lg`}>
              <div className="flex items-center gap-2 mb-4">
                <ChartPie className={theme.colors.text} size={24} />
                <h3 className={`text-xl font-semibold ${theme.colors.text}`}>Delivery Types</h3>
              </div>
              <div className="h-80">
                <Pie
                  data={deliveryTypesData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: { position: 'bottom' }
                    }
                  }}
                />
              </div>
            </div>
          </>
        );

      default:
        return null;
    }
  };

  const chartColors = {
    admin: { background: 'rgba(239, 68, 68, 0.6)', border: 'rgba(239, 68, 68, 1)' },
    donor: { background: 'rgba(16, 185, 129, 0.6)', border: 'rgba(16, 185, 129, 1)' },
    recipient: { background: 'rgba(59, 130, 246, 0.6)', border: 'rgba(59, 130, 246, 1)' },
    volunteer: { background: 'rgba(139, 92, 246, 0.6)', border: 'rgba(139, 92, 246, 1)' }
  };

  const pieColors = {
    admin: ['#ef4444', '#fca5a5'],
    donor: ['#10b981', '#6ee7b7'],
    recipient: ['#3b82f6', '#93c5fd'],
    volunteer: ['#8b5cf6', '#c4b5fd']
  };

   if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-500 text-center">
          <h2 className="text-2xl font-bold mb-2">Error</h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${theme.colors.bg} transition-colors duration-300`}>
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
        {/* Profile Header */}
        <div className={`relative p-6 rounded-xl shadow-lg bg-white border border-${theme.primary}-200 transition-all duration-300`}>
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            <div className="relative">
              <div className={`h-28 w-28 rounded-full border-4 border-${theme.primary}-400 overflow-hidden transition-all duration-300 hover:scale-105 flex items-center justify-center bg-gray-100`}>
                {profileImageUrl
                  ? <img
                      src={profileImageUrl}
                      alt="Profile"
                      className="h-full w-full object-cover"
                      onError={(e) => { (e.target as HTMLImageElement).src = ''; }}
                    />
                  : <UserCircle className="h-16 w-16 text-gray-400" />
                }
              </div>
            </div>

            <div className="flex-1 text-center sm:text-left">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                <h1 className="text-2xl font-bold text-gray-900">{user?.username}</h1>
                <div className={`inline-flex items-center px-3 py-1 rounded-full ${theme.colors.bg} ${theme.colors.text} text-sm font-medium`}>
                  <Award className="h-4 w-4 mr-1" />
                  <span className="capitalize">{user?.role}</span>
                </div>
              </div>
              <p className="text-gray-500 mt-1">{user?.email}</p>

              <div className="mt-4 flex flex-wrap gap-2 justify-center sm:justify-start">
                <Link
                  to={`/dashboard/UpdateProfile/${getUserId(user)}`}
                  className={`px-4 py-2 rounded-lg ${theme.colors.button} text-white transition-all duration-200 hover:shadow-md flex items-center`}
                >
                  <Edit2 className="h-4 w-4 mr-1" />
                  <span>Edit Profile</span>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6">
          {renderRoleSpecificStats()}
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {renderRoleSpecificCharts()}
        </div>
      </div>
    </div>
  );
};

export default Profile;