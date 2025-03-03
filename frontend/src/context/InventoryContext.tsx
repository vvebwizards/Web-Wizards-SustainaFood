import React, { createContext, useState, useEffect, useContext } from 'react';
import { FoodItem } from '../components/FoodItemModal'; 

const API_BASE_URL = "http://localhost:5000/api/foodItem";

interface InventoryContextType {
  inventory: FoodItem[];
  addFoodItem: (item: Omit<FoodItem, '_id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  error: string | null;
}

const InventoryContext = createContext<InventoryContextType | undefined>(undefined);

export const InventoryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [inventory, setInventory] = useState<FoodItem[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchInventory = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/getAll`, {
          method: 'GET',
          credentials: 'include',
        });
        if (!response.ok) throw new Error('Failed to fetch inventory');
        const data = await response.json();
        setInventory(data);
      } catch (err) {
        setError(err.message || 'Error fetching inventory');
        console.error('Error:', err);
      }
    };
    fetchInventory();
  }, []); 

  const addFoodItem = async (item: Omit<FoodItem, '_id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const response = await fetch(`${API_BASE_URL}/add`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item),
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Failed to add food item');
      const data = await response.json();
      setInventory(prev => [...prev, data.foodItem]);
    } catch (err) {
      console.warn(err.message || 'Error adding food item');
      setError(err.message || 'Error adding food item'); 
      throw err;
    }
  };

  return (
    <InventoryContext.Provider value={{ inventory, addFoodItem, error }}>
      {children}
    </InventoryContext.Provider>
  );
};

export const useInventory = () => {
  const context = useContext(InventoryContext);
  if (!context) throw new Error('useInventory must be used within an InventoryProvider');
  return context;
};