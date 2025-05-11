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
  totalDonations: 0,
  expiredQuantity: 0,
  averageShelfLife: 0,
  donationCountsByFoodItem: [],
  loading: false,
  error: null,
  refetchStatistics: async () => {}
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
  
  // We can add more state variables for other roles if needed

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
      if (userId) {
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
          // We'd update recipient statistics here if needed in the UI
          updateDonorStatistics(data); // Fallback to donor stats for now
          break;
        case 'volunteer':
          // We'd update volunteer statistics here if needed in the UI
          updateDonorStatistics(data); // Fallback to donor stats for now
          break;
        case 'admin':
          // We'd update admin statistics here if needed in the UI
          updateDonorStatistics(data); // Fallback to donor stats for now
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

  // We can add more update functions for other roles if needed

  useEffect(() => {
    fetchStatistics();
  }, [user]);

  // For use when we need to manually trigger a refresh
  const refetchStatistics = async () => {
    await fetchStatistics();
  };

  // Combine all statistics into one context value
  const contextValue: StatisticsContextType = {
    totalDonations,
    expiredQuantity,
    averageShelfLife,
    donationCountsByFoodItem,
    loading,
    error,
    refetchStatistics
  };

  return (
    <StatisticsContext.Provider value={contextValue}>
      {children}
    </StatisticsContext.Provider>
  );
};