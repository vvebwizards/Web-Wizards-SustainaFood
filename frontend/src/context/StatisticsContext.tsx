import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';

const STATISTICS_API_URL = 'http://localhost:5000/api/statistics';

interface DonationCount {
  foodItemTitle: string;
  unit: string;
  totalDonations: number;
}

interface Statistics {
  totalDonations: number;
  averageShelfLife: number;
  expiredQuantity: number;
  donationCountsByFoodItem: { foodItem: string; count: number }[];
}

interface StatisticsContextType {
  totalDonations: number;
  averageShelfLife: number;
  expiredQuantity: number;
  donationCountsByFoodItem: { foodItem: string; count: number }[];
  loading: boolean;
  error: string | null;
}

const StatisticsContext = createContext<StatisticsContextType | undefined>(undefined);

export const useStatistics = (): StatisticsContextType => {
  const context = useContext(StatisticsContext);
  if (!context) {
    throw new Error('useStatistics must be used within a StatisticsProvider');
  }
  return context;
};

interface StatisticsProviderProps {
  children: ReactNode;
}

export const StatisticsProvider: React.FC<StatisticsProviderProps> = ({ children }) => {
  const [statistics, setStatistics] = useState<Statistics>({
    totalDonations: 0,
    averageShelfLife: 0,
    expiredQuantity: 0,
    donationCountsByFoodItem: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStatistics = async () => {
      try {
        setLoading(true);
        setError(null);

        const [totalDonationsRes, avgShelfLifeRes, expiredQuantityRes, donationCountsRes] = await Promise.all([
          fetch(`${STATISTICS_API_URL}/countTotalDonations`, {
            method: 'GET',
            credentials: 'include',
          }),
          fetch(`${STATISTICS_API_URL}/averageShelfLife`, {
            method: 'GET',
            credentials: 'include',
          }),
          fetch(`${STATISTICS_API_URL}/expiredQuantityByUnit`, {
            method: 'GET',
            credentials: 'include',
          }),
          fetch(`${STATISTICS_API_URL}/countDonationsByFoodItem`, {
            method: 'GET',
            credentials: 'include',
          }),
        ]);

        if (totalDonationsRes.status === 401 || avgShelfLifeRes.status === 401 || expiredQuantityRes.status === 401 || donationCountsRes.status === 401) {
          throw new Error('Authentication failed. Please log in again.');
        }

        if (!totalDonationsRes.ok) throw new Error(`Failed to fetch total donations: ${totalDonationsRes.status}`);
        if (!avgShelfLifeRes.ok) throw new Error(`Failed to fetch average shelf life: ${avgShelfLifeRes.status}`);
        if (!expiredQuantityRes.ok) throw new Error(`Failed to fetch expired quantity: ${expiredQuantityRes.status}`);
        if (!donationCountsRes.ok) throw new Error(`Failed to fetch donation counts: ${donationCountsRes.status}`);

        const [totalDonationsData, avgShelfLifeData, expiredQuantityData, donationCountsData] = await Promise.all([
          totalDonationsRes.json(),
          avgShelfLifeRes.json(),
          expiredQuantityRes.json(),
          donationCountsRes.json(),
        ]);

      
        const totalDonations = totalDonationsData.reduce((sum: number, item: { totalQuantity: number }) => sum + item.totalQuantity, 0);

        
        const expiredQuantity = expiredQuantityData.reduce((sum: number, item: { totalExpiredQuantity: number }) => sum + item.totalExpiredQuantity, 0);

    
        const averageShelfLife = parseFloat(avgShelfLifeData.averageShelfLife.replace(' days', ''));

       
        const donationCountsByFoodItem = donationCountsData.map((item: DonationCount) => ({
          foodItem: item.foodItemTitle,
          count: item.totalDonations,
        }));

        setStatistics({
          totalDonations,
          averageShelfLife,
          expiredQuantity,
          donationCountsByFoodItem,
        });
      } catch (err) {
        const errorMessage = err.message || 'Error fetching statistics';
        setError(errorMessage);
        console.error('Error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStatistics();
  }, []);

  return (
    <StatisticsContext.Provider value={{ ...statistics, loading, error }}>
      {children}
    </StatisticsContext.Provider>
  );
};
