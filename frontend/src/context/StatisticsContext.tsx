import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { 
  StatisticsContextType, 
  DonationByFoodItem,
  DonorStatistics,
  RecipientStatistics,
  VolunteerStatistics,
  AdminStatistics
} from '../types/statistics';

// Default values for the context
const defaultStatisticsContext: StatisticsContextType = {
  loading: false,
  error: null,
  refetchStatistics: async () => {},
  // Donor defaults
  totalDonations: 0,
  expiredQuantity: 0,
  averageShelfLife: 0,
  donationCountsByFoodItem: [],
  // Recipient defaults
  receivedDonations: 0,
  pendingDeliveries: 0,
  completedDeliveries: 0,
  monthlyReceived: [],
  categoryLabels: [],
  categoryData: [],
  // Volunteer defaults
  statusCounts: {},
  monthlyDeliveries: [],
  totalOrders: 0,
  // Admin defaults
  totalUsers: 0,
  activeVolunteers: 0,
  monthlyDonations: 0,
  monthlyGrowth: [],
  userTypes: {
    donors: 0,
    recipients: 0,
    volunteers: 0
  }
};

// Create the context
const StatisticsContext = createContext<StatisticsContextType>(defaultStatisticsContext);

// Custom hook to use the statistics context
export const useStatistics = () => useContext(StatisticsContext);

interface StatisticsProviderProps {
  children: ReactNode;
}

export const StatisticsProvider: React.FC<StatisticsProviderProps> = ({ children }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Donor statistics
  const [totalDonations, setTotalDonations] = useState<number>(0);
  const [expiredQuantity, setExpiredQuantity] = useState<number>(0);
  const [averageShelfLife, setAverageShelfLife] = useState<number>(0);
  const [donationCountsByFoodItem, setDonationCountsByFoodItem] = useState<DonationByFoodItem[]>([]);
  
  // Recipient statistics
  const [receivedDonations, setReceivedDonations] = useState<number>(0);
  const [pendingDeliveries, setPendingDeliveries] = useState<number>(0);
  const [completedDeliveries, setCompletedDeliveries] = useState<number>(0);
  const [monthlyReceived, setMonthlyReceived] = useState<number[]>([]);
  const [categoryLabels, setCategoryLabels] = useState<string[]>([]);
  const [categoryData, setCategoryData] = useState<number[]>([]);
  
  // Volunteer statistics
  const [statusCounts, setStatusCounts] = useState<Record<string, number>>({});
  const [monthlyDeliveries, setMonthlyDeliveries] = useState<number[]>([]);
  const [totalOrders, setTotalOrders] = useState<number>(0);
  
  // Admin statistics
  const [totalUsers, setTotalUsers] = useState<number>(0);
  const [activeVolunteers, setActiveVolunteers] = useState<number>(0);
  const [monthlyDonations, setMonthlyDonations] = useState<number>(0);
  const [monthlyGrowth, setMonthlyGrowth] = useState<number[]>([]);
  const [userTypes, setUserTypes] = useState<{donors: number; recipients: number; volunteers: number}>({
    donors: 0,
    recipients: 0,
    volunteers: 0
  });

  const fetchStatistics = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      let endpoint = '';

      // Determine the appropriate endpoint based on user role
      switch (user.role) {
        case 'donor':
          endpoint = '/api/statistics/donor';
          break;
        case 'recipient':
          endpoint = '/api/statistics/recipient';
          break;
        case 'volunteer':
          endpoint = '/api/statistics/volunteer';
          break;
        case 'admin':
          endpoint = '/api/statistics/admin';
          break;
        default:
          setError('Unknown user role');
          setLoading(false);
          return;
      }

      // Add user ID to the request if available
      const userId = user.id || user._id;
      if (user.role !== 'admin' && userId) {
        endpoint += `?userId=${userId}`;
      }

      const response = await fetch(endpoint);
      
      if (!response.ok) {
        throw new Error('Failed to fetch statistics');
      }

      const data = await response.json();

      // Update state based on user role
      switch (user.role) {
        case 'donor':
          updateDonorStatistics(data);
          break;
        case 'recipient':
          updateRecipientStatistics(data);
          break;
        case 'volunteer':
          updateVolunteerStatistics(data);
          break;
        case 'admin':
          updateAdminStatistics(data);
          break;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      console.error('Error fetching statistics:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateDonorStatistics = (data: DonorStatistics) => {
    setTotalDonations(data.totalDonations || 0);
    setExpiredQuantity(data.expiredQuantity || 0);
    setAverageShelfLife(data.averageShelfLife || 0);
    setDonationCountsByFoodItem(data.donationCountsByFoodItem || []);
  };

  const updateRecipientStatistics = (data: RecipientStatistics) => {
    setReceivedDonations(data.receivedDonations || 0);
    setPendingDeliveries(data.pendingDeliveries || 0);
    setCompletedDeliveries(data.completedDeliveries || 0);
    setMonthlyReceived(data.monthlyReceived || []);
    setCategoryLabels(data.categoryLabels || []);
    setCategoryData(data.categoryData || []);
  };

  const updateVolunteerStatistics = (data: VolunteerStatistics) => {
    setStatusCounts(data.statusCounts || {});
    setMonthlyDeliveries(data.monthlyDeliveries || []);
    setTotalOrders(data.totalOrders || 0);
  };

  const updateAdminStatistics = (data: AdminStatistics) => {
    setTotalUsers(data.totalUsers || 0);
    setActiveVolunteers(data.activeVolunteers || 0);
    setMonthlyDonations(data.monthlyDonations || 0);
    setMonthlyGrowth(data.monthlyGrowth || []);
    setUserTypes(data.userTypes || { donors: 0, recipients: 0, volunteers: 0 });
  };

  useEffect(() => {
    fetchStatistics();
  }, [user]);

  // For use when we need to manually trigger a refresh
  const refetchStatistics = async () => {
    await fetchStatistics();
  };

  // Combine all statistics into one context value
  const contextValue: StatisticsContextType = {
    // Common fields
    loading,
    error,
    refetchStatistics,
    
    // Donor statistics
    totalDonations,
    expiredQuantity,
    averageShelfLife,
    donationCountsByFoodItem,
    
    // Recipient statistics
    receivedDonations,
    pendingDeliveries,
    completedDeliveries,
    monthlyReceived,
    categoryLabels,
    categoryData,
    
    // Volunteer statistics
    statusCounts,
    monthlyDeliveries,
    totalOrders,
    
    // Admin statistics
    totalUsers,
    activeVolunteers,
    monthlyDonations,
    monthlyGrowth,
    userTypes
  };

  return (
    <StatisticsContext.Provider value={contextValue}>
      {children}
    </StatisticsContext.Provider>
  );
};