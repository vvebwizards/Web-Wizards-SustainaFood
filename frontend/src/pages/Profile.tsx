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
import defaultProfileImage from "../assets/images/default_user_img.jpg";
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
    }
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
    }
  }
};

const Profile = () => {
  const { user } = useAuth();
  const { 
    totalDonations, 
    expiredQuantity, 
    averageShelfLife, 
    donationCountsByFoodItem,
    loading,
    error,
    refetchStatistics,
    totalUsers,
    activeVolunteers,
    monthlyDonations,
    monthlyGrowth,
    userTypes,
    receivedDonations,
    pendingDeliveries,
    completedDeliveries,
    monthlyReceived,
    categoryLabels,
    categoryData,
    statusCounts,
    monthlyDeliveries,
    totalOrders
  } = useStatistics();

  const defaultImage = 'https://via.placeholder.com/150';

  const getImageUrl = (profileImage: string | undefined) => {
    if (!profileImage) return defaultImage;
    if (profileImage.startsWith('http')) return profileImage;
    return `https://foodreduce-backend.azurewebsites.net${profileImage}?t=${new Date().getTime()}`;
  };

  const [profileImageUrl, setProfileImageUrl] = useState(getImageUrl(user?.profileImage));

  useEffect(() => {
    if (user?.profileImage) {
      setProfileImageUrl(getImageUrl(user.profileImage));
    }
  }, [user?.profileImage]);

  const theme = roleConfigs[user?.role as keyof typeof roleConfigs]?.theme || roleConfigs.donor.theme;

  const renderRoleSpecificStats = () => {
    if (!user) return null;

    switch (user.role) {
      case 'admin':
        return (
          <>
            <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:border-gray-300">
              <div className="flex items-start">
                <div className={`flex items-center justify-center w-12 h-12 rounded-lg bg-${theme.primary}-100 ${theme.colors.text}`}>
                  <Users />
                </div>
                <div className="ml-4">
                  <h3 className="text-base font-medium text-gray-700">Total Users</h3>
                  <p className={`text-2xl font-bold ${theme.colors.text} mt-1`}>{totalUsers}</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:border-gray-300">
              <div className="flex items-start">
                <div className={`flex items-center justify-center w-12 h-12 rounded-lg bg-${theme.primary}-100 ${theme.colors.text}`}>
                  <HandHeart />
                </div>
                <div className="ml-4">
                  <h3 className="text-base font-medium text-gray-700">Active Volunteers</h3>
                  <p className={`text-2xl font-bold ${theme.colors.text} mt-1`}>{activeVolunteers}</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:border-gray-300">
              <div className="flex items-start">
                <div className={`flex items-center justify-center w-12 h-12 rounded-lg bg-${theme.primary}-100 ${theme.colors.text}`}>
                  <Package />
                </div>
                <div className="ml-4">
                  <h3 className="text-base font-medium text-gray-700">Monthly Donations</h3>
                  <p className={`text-2xl font-bold ${theme.colors.text} mt-1`}>{monthlyDonations} kg</p>
                </div>
              </div>
            </div>
          </>
        );

      case 'donor':
        return (
          <>
            <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:border-gray-300">
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

            <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:border-gray-300">
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

            <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:border-gray-300">
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
            <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:border-gray-300">
              <div className="flex items-start">
                <div className={`flex items-center justify-center w-12 h-12 rounded-lg bg-${theme.primary}-100 ${theme.colors.text}`}>
                  <Package />
                </div>
                <div className="ml-4">
                  <h3 className="text-base font-medium text-gray-700">Received Donations</h3>
                  <p className={`text-2xl font-bold ${theme.colors.text} mt-1`}>{receivedDonations || 0} kg</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:border-gray-300">
              <div className="flex items-start">
                <div className={`flex items-center justify-center w-12 h-12 rounded-lg bg-${theme.primary}-100 ${theme.colors.text}`}>
                  <Truck />
                </div>
                <div className="ml-4">
                  <h3 className="text-base font-medium text-gray-700">Pending Deliveries</h3>
                  <p className={`text-2xl font-bold ${theme.colors.text} mt-1`}>{pendingDeliveries || 0}</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:border-gray-300">
              <div className="flex items-start">
                <div className={`flex items-center justify-center w-12 h-12 rounded-lg bg-${theme.primary}-100 ${theme.colors.text}`}>
                  <CheckCircle />
                </div>
                <div className="ml-4">
                  <h3 className="text-base font-medium text-gray-700">Completed Deliveries</h3>
                  <p className={`text-2xl font-bold ${theme.colors.text} mt-1`}>{completedDeliveries || 0}</p>
                </div>
              </div>
            </div>
          </>
        );

      case 'volunteer':
        return (
          <>
            <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:border-gray-300">
              <div className="flex items-start">
                <div className={`flex items-center justify-center w-12 h-12 rounded-lg bg-${theme.primary}-100 ${theme.colors.text}`}>
                  <Truck />
                </div>
                <div className="ml-4">
                  <h3 className="text-base font-medium text-gray-700">Total Orders</h3>
                  <p className={`text-2xl font-bold ${theme.colors.text} mt-1`}>{totalOrders || 0}</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:border-gray-300">
              <div className="flex items-start">
                <div className={`flex items-center justify-center w-12 h-12 rounded-lg bg-${theme.primary}-100 ${theme.colors.text}`}>
                  <Clock />
                </div>
                <div className="ml-4">
                  <h3 className="text-base font-medium text-gray-700">Active Orders</h3>
                  <p className={`text-2xl font-bold ${theme.colors.text} mt-1`}>{statusCounts?.pending || 0}</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:border-gray-300">
              <div className="flex items-start">
                <div className={`flex items-center justify-center w-12 h-12 rounded-lg bg-${theme.primary}-100 ${theme.colors.text}`}>
                  <ShieldCheck />
                </div>
                <div className="ml-4">
                  <h3 className="text-base font-medium text-gray-700">Completed Orders</h3>
                  <p className={`text-2xl font-bold ${theme.colors.text} mt-1`}>{statusCounts?.delivered || 0}</p>
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
    if (!user) return null;

    const currentColors = chartColors[user.role as keyof typeof chartColors] || chartColors.donor;
    const currentPieColors = pieColors[user.role as keyof typeof pieColors] || pieColors.donor;

    switch (user.role) {
      case 'admin':
        const monthlyGrowthData = {
          labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
          datasets: [{
            label: 'Monthly Donations Growth',
            data: monthlyGrowth || [],
            borderColor: currentColors.border,
            backgroundColor: currentColors.background,
            tension: 0.4,
          }]
        };

        const userDistributionData = {
          labels: ['Donors', 'Recipients', 'Volunteers'],
          datasets: [{
            data: [userTypes?.donors || 0, userTypes?.recipients || 0, userTypes?.volunteers || 0],
            backgroundColor: [
              'rgba(239, 68, 68, 0.6)',
              'rgba(59, 130, 246, 0.6)',
              'rgba(139, 92, 246, 0.6)',
            ],
          }]
        };

        return (
          <>
            <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200 transition-all duration-300 hover:shadow-lg">
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

            <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200 transition-all duration-300 hover:shadow-lg">
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
            <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200 transition-all duration-300 hover:shadow-lg">
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

            <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200 transition-all duration-300 hover:shadow-lg">
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
        const recipientChartData = {
          labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
          datasets: [{
            label: 'Monthly Received Donations',
            data: monthlyReceived || [],
            borderColor: currentColors.border,
            backgroundColor: currentColors.background,
            tension: 0.4,
          }]
        };

        const recipientPieData = {
          labels: categoryLabels || [],
          datasets: [{
            data: categoryData || [],
            backgroundColor: [
              'rgba(59, 130, 246, 0.6)',
              'rgba(16, 185, 129, 0.6)',
              'rgba(239, 68, 68, 0.6)',
              'rgba(245, 158, 11, 0.6)',
              'rgba(139, 92, 246, 0.6)',
              'rgba(236, 72, 153, 0.6)',
            ],
          }]
        };

        return (
          <>
            <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200 transition-all duration-300 hover:shadow-lg">
              <div className="flex items-center gap-2 mb-4">
                <LineChart className={theme.colors.text} size={24} />
                <h3 className={`text-xl font-semibold ${theme.colors.text}`}>Monthly Received Donations</h3>
              </div>
              <div className="h-80">
                <Line
                  data={recipientChartData}
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

            <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200 transition-all duration-300 hover:shadow-lg">
              <div className="flex items-center gap-2 mb-4">
                <ChartPie className={theme.colors.text} size={24} />
                <h3 className={`text-xl font-semibold ${theme.colors.text}`}>Food Categories Distribution</h3>
              </div>
              <div className="h-80">
                <Pie
                  data={recipientPieData}
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
        const volunteerChartData = {
          labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
          datasets: [{
            label: 'Monthly Deliveries',
            data: monthlyDeliveries || [],
            borderColor: currentColors.border,
            backgroundColor: currentColors.background,
            tension: 0.4,
          }]
        };

        // Get all possible statuses from the backend
        const statusLabels = statusCounts ? Object.keys(statusCounts) : [];
        const statusData = statusCounts ? Object.values(statusCounts) : [];

        const volunteerPieData = {
          labels: statusLabels,
          datasets: [{
            data: statusData,
            backgroundColor: [
              'rgba(139, 92, 246, 0.6)',  // pending
              'rgba(59, 130, 246, 0.6)',  // processing
              'rgba(16, 185, 129, 0.6)',  // packed
              'rgba(245, 158, 11, 0.6)',  // shipped
              'rgba(239, 68, 68, 0.6)',   // delivered
              'rgba(236, 72, 153, 0.6)',  // cancelled
              'rgba(168, 85, 247, 0.6)',  // returned
            ],
          }]
        };

        return (
          <>
            <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200 transition-all duration-300 hover:shadow-lg">
              <div className="flex items-center gap-2 mb-4">
                <LineChart className={theme.colors.text} size={24} />
                <h3 className={`text-xl font-semibold ${theme.colors.text}`}>Monthly Deliveries</h3>
              </div>
              <div className="h-80">
                <Line
                  data={volunteerChartData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                      y: {
                        beginAtZero: true,
                        title: { display: true, text: 'Number of Deliveries' }
                      }
                    }
                  }}
                />
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200 transition-all duration-300 hover:shadow-lg">
              <div className="flex items-center gap-2 mb-4">
                <ChartPie className={theme.colors.text} size={24} />
                <h3 className={`text-xl font-semibold ${theme.colors.text}`}>Order Status Distribution</h3>
              </div>
              <div className="h-80">
                <Pie
                  data={volunteerPieData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: { 
                        position: 'bottom',
                        labels: {
                          // Capitalize first letter of each status
                          generateLabels: (chart: any) => {
                            const datasets = chart.data.datasets;
                            return chart.data.labels.map((label: string, i: number) => ({
                              text: label.charAt(0).toUpperCase() + label.slice(1),
                              fillStyle: datasets[0].backgroundColor[i],
                              hidden: false,
                              lineCap: 'butt',
                              lineDash: [],
                              lineDashOffset: 0,
                              lineJoin: 'miter',
                              lineWidth: 1,
                              strokeStyle: '#fff',
                              pointStyle: 'circle',
                              rotation: 0
                            }));
                          }
                        }
                      }
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
                      onError={(e) => { (e.target as HTMLImageElement).src = defaultProfileImage; }}
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