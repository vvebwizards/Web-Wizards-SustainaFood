import React, { createContext, useState, useEffect, useContext } from 'react';
import { FoodItem } from '../components/FoodItemModal';
import { Category } from '../components/CategoryModal'; // Ensure this path is correct

const FOOD_ITEM_API_URL = "http://localhost:5000/api/foodItem";
const CATEGORY_API_URL = "http://localhost:5000/api/category"; // Corrected from /api/category

interface InventoryContextType {
  inventory: FoodItem[];
  categories: Category[];
  addFoodItem: (item: Omit<FoodItem, '_id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  addCategory: (category: Omit<Category, '_id' | 'createdAt' | 'updatedAt'>) => Promise<void>; // Updated to accept Category object
  updateFoodItem: (id: string, item: Partial<Omit<FoodItem, '_id' | 'createdAt' | 'updatedAt'>>) => Promise<void>;
  deleteFoodItem: (id: string) => Promise<void>;
  error: string | null;
}

const InventoryContext = createContext<InventoryContextType | undefined>(undefined);

export const InventoryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [inventory, setInventory] = useState<FoodItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Fetch all food items and categories on mount
  useEffect(() => {
    const fetchInventory = async () => {
      try {
        const [foodItemResponse, categoryResponse] = await Promise.all([
          fetch(`${FOOD_ITEM_API_URL}/getAll`, {
            method: 'GET',
            credentials: 'include',
          }),
          fetch(`${CATEGORY_API_URL}/getAll`, { // Fetch all categories
            method: 'GET',
            credentials: 'include',
          })
        ]);

        if (!foodItemResponse.ok) throw new Error(`Failed to fetch inventory: ${foodItemResponse.status} ${foodItemResponse.statusText}`);
        if (!categoryResponse.ok) throw new Error(`Failed to fetch categories: ${categoryResponse.status} ${categoryResponse.statusText}`);

        const foodItemData = await foodItemResponse.json();
        const categoryData = await categoryResponse.json();

        setInventory(foodItemData);
        setCategories(categoryData); // Store full Category objects
      } catch (err) {
        setError(err.message || 'Error fetching data');
        console.error('Error:', err);
      }
    };
    fetchInventory();
  }, []);

  const addFoodItem = async (item: Omit<FoodItem, '_id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const response = await fetch(`${FOOD_ITEM_API_URL}/add`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item),
        credentials: 'include',
      });
      if (!response.ok) throw new Error(`Failed to add food item: ${response.status} ${response.statusText}`);
      const data = await response.json();
      setInventory(prev => [...prev, data.foodItem]);
    } catch (err) {
      setError(err.message || 'Error adding food item');
      console.warn('Error:', err);
      throw err;
    }
  };

  const addCategory = async (category: Omit<Category, '_id' | 'createdAt' | 'updatedAt'>) => {
    try {
      console.log('Adding category:', category); // Debug log
      const response = await fetch(`${CATEGORY_API_URL}/add`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(category), // Send the full category object (only name is used in backend)
        credentials: 'include',
      });
      if (!response.ok) {
        const errorText = await response.text(); // Get error details
        throw new Error(`Failed to add category: ${response.status} ${response.statusText} - ${errorText}`);
      }
      const data = await response.json();
      setCategories(prev => [...prev, data.category]); // Add the new category object
    } catch (err) {
      setError(err.message || 'Error adding category');
      console.warn('Error:', err);
      throw err;
    }
  };

  const updateFoodItem = async (id: string, item: Partial<Omit<FoodItem, '_id' | 'createdAt' | 'updatedAt'>>) => {
    try {
      const response = await fetch(`${FOOD_ITEM_API_URL}/updateOne/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item),
        credentials: 'include',
      });
      if (!response.ok) throw new Error(`Failed to update food item: ${response.status} ${response.statusText}`);
      const data = await response.json();
      setInventory(prev => prev.map(i => (i._id === id ? data.foodItem : i)));
    } catch (err) {
      setError(err.message || 'Error updating food item');
      console.warn('Error:', err);
      throw err;
    }
  };

  const deleteFoodItem = async (id: string) => {
    try {
      const response = await fetch(`${FOOD_ITEM_API_URL}/deleteOne/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!response.ok) throw new Error(`Failed to delete food item: ${response.status} ${response.statusText}`);
      setInventory(prev => prev.filter(item => item._id !== id));
    } catch (err) {
      setError(err.message || 'Error deleting food item');
      console.warn('Error:', err);
      throw err;
    }
  };

  return (
    <InventoryContext.Provider value={{ inventory, categories, addFoodItem, addCategory, updateFoodItem, deleteFoodItem, error }}>
      {children}
    </InventoryContext.Provider>
  );
};

export const useInventory = () => {
  const context = useContext(InventoryContext);
  if (!context) throw new Error('useInventory must be used within an InventoryProvider');
  return context;
};