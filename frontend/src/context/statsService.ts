// src/context/statsService.ts
export interface Stats {
    userMetrics: {
      totalUsers: number;
      usersByRole: Record<string, number>;
    };
    categoryMetrics: {
      totalCategories: number;
      avgItemsPerCategory: number;
    };
    foodItemMetrics: {
      totalInStock: number;
      expiringInNext7Days: number;
    };
    donationMetrics: {
      totalDonations: number;
      donationsByStatus: Record<'Pending' | 'Donated' | 'Expired' | 'Damaged', number>;
    };
    orderMetrics: {
      totalOrders: number;
      ordersByStatus: Record<'pending' | 'delivered', number>;
    };
    notificationMetrics: {
      totalNotifications: number;
      unreadNotifications: number;
    };
    settingsMetrics: {
      usersWithCustomSchedules: number;
    };
    donationsByCategory: Array<{ _id: string; count: number }>;
    topDonors: Array<{ _id: string; totalQuantity: number }>;
    avgDonationSize: Array<{ _id: string; avgSize: number }>;
    ordersByLocation: Array<{ _id: string; count: number }>;
    stockVsDonation: {
      totalStock: number;
      totalDonated: number;
      ratio: number;
    };
    expiryConversion: {
      donatedBeforeExpiry: number;
      donatedAfterExpiry: number;
      rateBeforeExpiry: number;
    };
  }
  
  export async function fetchStats(): Promise<Stats> {
    const res = await fetch('https://foodreduce-backend.azurewebsites.net/api/stats');
    if (!res.ok) {
      throw new Error(`Failed to load stats: ${res.statusText}`);
    }
    return res.json();
  }
  