import { DonorStatistics, RecipientStatistics, VolunteerStatistics, AdminStatistics } from '../types/statistics';

// Always use the backend URL for API requests
const API_BASE_URL = 'https://foodreduce-backend.azurewebsites.net/api';

/**
 * Fetch donor statistics from the backend
 * @param userId The ID of the donor
 * @returns Promise with donor statistics
 */
export const fetchDonorStatistics = async (userId: string): Promise<DonorStatistics> => {
  try {
    const response = await fetch(`${API_BASE_URL}/statistics/donor?userId=${userId}`);
    
    if (!response.ok) {
      throw new Error(`Error fetching donor statistics: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Failed to fetch donor statistics:', error);
    throw error;
  }
};

/**
 * Fetch recipient statistics from the backend
 * @param userId The ID of the recipient
 * @returns Promise with recipient statistics
 */
export const fetchRecipientStatistics = async (userId: string): Promise<RecipientStatistics> => {
  try {
    const response = await fetch(`${API_BASE_URL}/statistics/recipient?userId=${userId}`);
    
    if (!response.ok) {
      throw new Error(`Error fetching recipient statistics: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Failed to fetch recipient statistics:', error);
    throw error;
  }
};

/**
 * Fetch volunteer statistics from the backend
 * @param userId The ID of the volunteer
 * @returns Promise with volunteer statistics
 */
export const fetchVolunteerStatistics = async (userId: string): Promise<VolunteerStatistics> => {
  try {
    const response = await fetch(`${API_BASE_URL}/statistics/volunteer?userId=${userId}`);
    
    if (!response.ok) {
      throw new Error(`Error fetching volunteer statistics: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Failed to fetch volunteer statistics:', error);
    throw error;
  }
};

/**
 * Fetch admin statistics from the backend
 * @returns Promise with admin statistics
 */
export const fetchAdminStatistics = async (): Promise<AdminStatistics> => {
  try {
    const response = await fetch(`${API_BASE_URL}/statistics/admin`);
    
    if (!response.ok) {
      throw new Error(`Error fetching admin statistics: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Failed to fetch admin statistics:', error);
    throw error;
  }
};