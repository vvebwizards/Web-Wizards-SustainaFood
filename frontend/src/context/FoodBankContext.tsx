import React, { createContext, useState, useContext } from 'react';
import { FoodItem } from '../components/FoodItemModal';

const FOOD_ITEM_API_URL = "http://localhost:5000/api/foodItem";

interface FoodBankContextType {
  toDonationFood: FoodItem[];
  fetchToDonationFood: () => Promise<void>;
  error: string | null;
}

const FoodBankContext = createContext<FoodBankContextType | undefined>(undefined);

export const FoodBankProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toDonationFood, setToDonationFood] = useState<FoodItem[]>([]);
  const [error, setError] = useState<string | null>(null);

  const fetchToDonationFood = async () => {
    try {
      const response = await fetch(`${FOOD_ITEM_API_URL}/foodBank`, {
        method: 'GET',
        credentials: 'include',
      });
      if (!response.ok) throw new Error(`Failed to fetch ToDonation food: ${response.status}`);
      const data = await response.json();
      setToDonationFood(data);
    } catch (err) {
      setError(err.message || 'Error fetching ToDonation food');
      console.error('Error:', err);
      throw err;
    }
  };

  return (
    <FoodBankContext.Provider value={{ toDonationFood, fetchToDonationFood, error }}>
      {children}
    </FoodBankContext.Provider>
  );
};

export const useFoodBank = () => {
  const context = useContext(FoodBankContext);
  if (!context) throw new Error('useFoodBank must be used within a FoodBankProvider');
  return context;
};