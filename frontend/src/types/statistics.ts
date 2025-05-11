export interface DonationByFoodItem {
  foodItem: string;
  count: number;
}

export interface DonorStatistics {
  totalDonations: number;
  expiredQuantity: number;
  averageShelfLife: number;
  donationCountsByFoodItem: DonationByFoodItem[];
}

export interface RecipientStatistics {
  receivedDonations: number;
  pendingDeliveries: number;
  completedDeliveries: number;
  deliveryHistory: number[];
  foodCategories: Record<string, number>;
}

export interface VolunteerStatistics {
  deliveriesMade: number;
  hoursVolunteered: number;
  activeAssignments: number;
  weeklyDeliveries: number[];
  deliveryTypes: Record<string, number>;
}

export interface AdminStatistics {
  totalUsers: number;
  activeVolunteers: number;
  monthlyDonations: number;
  monthlyGrowth: number[];
  userTypes: {
    donors: number;
    recipients: number;
    volunteers: number;
  };
}

export type Statistics = 
  | DonorStatistics 
  | RecipientStatistics 
  | VolunteerStatistics 
  | AdminStatistics;

export interface StatisticsContextType {
  // Common fields
  loading: boolean;
  error: string | null;
  refetchStatistics: () => Promise<void>;
  
  // Donor statistics
  totalDonations?: number;
  expiredQuantity?: number;
  averageShelfLife?: number;
  donationCountsByFoodItem?: DonationByFoodItem[];
  
  // Recipient statistics
  receivedDonations?: number;
  pendingDeliveries?: number;
  completedDeliveries?: number;
  deliveryHistory?: number[];
  foodCategories?: Record<string, number>;
  
  // Volunteer statistics
  deliveriesMade?: number;
  hoursVolunteered?: number;
  activeAssignments?: number;
  weeklyDeliveries?: number[];
  deliveryTypes?: Record<string, number>;
  
  // Admin statistics
  totalUsers?: number;
  activeVolunteers?: number;
  monthlyDonations?: number;
  monthlyGrowth?: number[];
  userTypes?: {
    donors: number;
    recipients: number;
    volunteers: number;
  };
}