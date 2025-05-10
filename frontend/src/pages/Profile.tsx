import React, { useState, useEffect } from 'react';
import { Heart, Hourglass, Timer, Edit2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Bar, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { useAuth } from '../context/AuthContext';
import { useStatistics } from '../context/StatisticsContext';
import defaultProfileImage from '../assets/images/default_user_img.jpg';
import { getUserId } from '../utils/chatHelpers';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend);

const Profile = () => {
  const { user } = useAuth();
  const { totalDonations, expiredQuantity, averageShelfLife, donationCountsByFoodItem, loading, error } = useStatistics();

  const defaultImage = defaultProfileImage;

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

  const chartData = {
    labels: donationCountsByFoodItem.map((item) => item.foodItem),
    datasets: [
      {
        label: 'Donation Count',
        data: donationCountsByFoodItem.map((item) => item.count),
        backgroundColor: 'rgba(22, 163, 74, 0.6)',
        borderColor: 'rgba(22, 163, 74, 1)',
        borderWidth: 1,
      },
    ],
  };

  const pieChartData = {
    labels: ['Donated', 'Wasted'],
    datasets: [
      {
        label: 'Wasted vs Donated',
        data: [totalDonations - expiredQuantity, expiredQuantity],
        backgroundColor: ['#4CAF50', '#FF5733'],
        borderColor: ['#4CAF50', '#FF5733'],
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top' as const },
      title: {
        display: true,
        text: 'Donations by Food Item',
        font: { size: 18 },
        color: '#1f2937',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: { display: true, text: 'Quantity Donated' },
      },
      x: {
        title: { display: true, text: 'Food Item' },
      },
    },
  };

  const pieChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top' as const },
      title: {
        display: true,
        text: 'Wasted vs Donated Ratio',
        font: { size: 18 },
        color: '#1f2937',
      },
    },
  };

  if (loading) {
    return <div className="p-6 text-center text-gray-600">Loading statistics...</div>;
  }

  if (error) {
    return <div className="p-6 text-center text-red-600">Error: {error}</div>;
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-8">
      <h1 className="text-3xl font-semibold text-gray-900 mb-4">Profile</h1>

      <div className="flex items-center space-x-6">
        <div>
          <img
            key={profileImageUrl}
            src={profileImageUrl}
            alt="Profile"
            className="h-24 w-24 rounded-full border-2 border-gray-300 object-cover"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = defaultImage;
            }}
          />
        </div>

        <div>
          <h2 className="text-2xl font-medium text-gray-900">{user?.username}</h2>
          <p className="text-gray-500">{user?.email}</p>

          <div className="mt-2">
            <Link
              to={`/dashboard/UpdateProfile/${getUserId(user)}`}
              className="flex items-center text-blue-600 hover:underline"
            >
              <Edit2 className="h-4 w-4 mr-1" />
              <span>Edit Profile</span>
            </Link>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="p-6 bg-green-50 rounded-lg shadow hover:shadow-lg transform hover:-translate-y-1 transition">
          <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-full mb-4">
            <Heart className="h-6 w-6 text-green-600" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Total Donations</h3>
          <p className="text-2xl font-semibold text-green-600">{totalDonations} kg</p>
        </div>

        <div className="p-6 bg-green-50 rounded-lg shadow hover:shadow-lg transform hover:-translate-y-1 transition">
          <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-full mb-4">
            <Hourglass className="h-6 w-6 text-green-600" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Average Shelf-Life Before Donation</h3>
          <p className="text-2xl font-semibold text-green-600">{averageShelfLife} days</p>
        </div>

        <div className="p-6 bg-green-50 rounded-lg shadow hover:shadow-lg transform hover:-translate-y-1 transition">
          <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-full mb-4">
            <Timer className="h-6 w-6 text-green-600" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Expired Donations</h3>
          <p className="text-2xl font-semibold text-green-600">{expiredQuantity} kg</p>
        </div>
      </div>

      <div className="bg-white rounded-lg border p-6 shadow-sm">
        <h3 className="text-xl font-medium text-gray-900 mb-4">Donations by Food Item</h3>
        {donationCountsByFoodItem.length > 0 ? (
          <div className="h-80">
            <Bar data={chartData} options={chartOptions} />
          </div>
        ) : (
          <p className="text-gray-600">No donation data available.</p>
        )}
      </div>

      <div className="bg-white rounded-lg border p-6 shadow-sm mt-6">
        <h3 className="text-xl font-medium text-gray-900 mb-4">Donated vs Wasted Food Proportion</h3>
        <div className="h-80">
          <Pie data={pieChartData} options={pieChartOptions} />
        </div>
      </div>
    </div>
  );
};

export default Profile;
