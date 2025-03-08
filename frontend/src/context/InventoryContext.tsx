import React, { createContext, useState, useEffect, useContext } from 'react';
import { FoodItem } from '../components/FoodItemModal';
import { Category } from '../components/CategoryModal'; 

const FOOD_ITEM_API_URL = "http://localhost:5000/api/foodItem";
const CATEGORY_API_URL = "http://localhost:5000/api/category"; 

interface InventoryContextType {
  inventory: FoodItem[];
  categories: Category[];
  addFoodItem: (item: Omit<FoodItem, '_id' | 'createdAt' | 'updatedAt'> & { imageFile?: File }) => Promise<void>;
  addCategory: (category: Omit<Category, '_id' | 'createdAt' | 'updatedAt'>) => Promise<void>; 
  updateFoodItem: (id: string, item: Partial<Omit<FoodItem, '_id' | 'createdAt' | 'updatedAt'>> & { imageFile?: File }) => Promise<void>;
  deleteFoodItem: (id: string) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  donateFoodItem: (id: string, quantityToDonation: number) => Promise<void>; 
  fetchFoodAvailableForDonation: () => Promise<FoodItem[]>;
  error: string | null;
}

const InventoryContext = createContext<InventoryContextType | undefined>(undefined);

export const InventoryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [inventory, setInventory] = useState<FoodItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchInventory = async () => {
      try {
        const [foodItemResponse, categoryResponse] = await Promise.all([
          fetch(`${FOOD_ITEM_API_URL}/getAll`, { method: 'GET', credentials: 'include' }),
          fetch(`${CATEGORY_API_URL}/getAll`, { method: 'GET', credentials: 'include' }),
        ]);

        if (!foodItemResponse.ok) throw new Error(`Failed to fetch inventory: ${foodItemResponse.status}`);
        if (!categoryResponse.ok) throw new Error(`Failed to fetch categories: ${categoryResponse.status}`);

        const foodItemData = await foodItemResponse.json();
        const categoryData = await categoryResponse.json();

        setInventory(foodItemData);
        setCategories(categoryData); 
      } catch (err) {
        setError(err.message || 'Error fetching data');
        console.error('Error:', err);
      }
    };
    fetchInventory();
  }, []);

  const addFoodItem = async (item: Omit<FoodItem, '_id' | 'createdAt' | 'updatedAt'> & { imageFile?: File }) => {
    try {
      const formData = new FormData();
      formData.append('title', item.title);
      formData.append('category', item.category);
      formData.append('quantity', item.quantity.toString());
      formData.append('unit', item.unit);
      formData.append('expirationDate', item.expirationDate);
      if (item.nutritionalInfo) formData.append('nutritionalInfo', item.nutritionalInfo);
      if (item.storageRequirements) formData.append('storageRequirements', item.storageRequirements);
      if (item.notes) formData.append('notes', item.notes);
      formData.append('status', item.status || 'In Stock');
      if (item.imageFile) formData.append('imageUrl', item.imageFile);

      const response = await fetch(`${FOOD_ITEM_API_URL}/add`, {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to add food item: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      setInventory(prev => [...prev, data.foodItem]);
    } catch (err) {
      setError(err.message || 'Error adding food item');
      console.warn('Error:', err);
      throw err;
    }
  };

  const updateFoodItem = async (id: string, item: Partial<Omit<FoodItem, '_id' | 'createdAt' | 'updatedAt'>> & { imageFile?: File }) => {
    try {
      const formData = new FormData();
      if (item.title !== undefined) formData.append('title', item.title);
      if (item.category !== undefined) formData.append('category', item.category);
      if (item.quantity !== undefined) formData.append('quantity', item.quantity.toString());
      if (item.unit !== undefined) formData.append('unit', item.unit);
      if (item.expirationDate !== undefined) formData.append('expirationDate', item.expirationDate);
      if (item.nutritionalInfo !== undefined) formData.append('nutritionalInfo', item.nutritionalInfo);
      if (item.storageRequirements !== undefined) formData.append('storageRequirements', item.storageRequirements);
      if (item.notes !== undefined) formData.append('notes', item.notes);
      if (item.status !== undefined) formData.append('status', item.status);
      if (item.imageFile) formData.append('imageUrl', item.imageFile);

      const response = await fetch(`${FOOD_ITEM_API_URL}/updateOne/${id}`, {
        method: 'PUT',
        body: formData,
        credentials: 'include',
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to update food item: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      setInventory(prev => prev.map(i => (i._id === id ? data.foodItem : i)));
    } catch (err) {
      setError(err.message || 'Error updating food item');
      console.warn('Error:', err);
      throw err;
    }
  };

  const addCategory = async (category: Omit<Category, '_id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const response = await fetch(`${CATEGORY_API_URL}/add`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(category),
        credentials: 'include',
      });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to add category: ${response.status} - ${errorText}`);
      }
      const data = await response.json();
      setCategories(prev => [...prev, data.category]);
    } catch (err) {
      setError(err.message || 'Error adding category');
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
      if (!response.ok) throw new Error(`Failed to delete food item: ${response.status}`);
      setInventory(prev => prev.filter(item => item._id !== id));
    } catch (err) {
      setError(err.message || 'Error deleting food item');
      console.warn('Error:', err);
      throw err;
    }
  };

  const deleteCategory = async (id: string) => {
    try {
      const response = await fetch(`${CATEGORY_API_URL}/deleteOne/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!response.ok) throw new Error(`Failed to delete category: ${response.status}`);
      setCategories(prev => prev.filter(item => item._id !== id));
    } catch (err) {
      setError(err.message || 'Error deleting category');
      console.warn('Error:', err);
      throw err;
    }
  };

  const donateFoodItem = async (id: string, quantityToDonation: number) => {
    try {
      const response = await fetch(`${FOOD_ITEM_API_URL}/donate/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantityToDonation }),
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to donate food item: ${response.status}`);
      }

      const data = await response.json();
      setInventory(prev => prev.map(item => (item._id === id ? data.foodItem : item)));
    } catch (err) {
      setError(err.message || 'Error donating food item');
      console.warn('Error:', err);
      throw err;
    }
  };

  return (
    <InventoryContext.Provider value={{ inventory, categories, addFoodItem, addCategory, updateFoodItem, deleteFoodItem, deleteCategory, donateFoodItem,fetchFoodAvailableForDonation, error }}>
      {children}
    </InventoryContext.Provider>
  );
};

const fetchFoodAvailableForDonation = async (): Promise<FoodItem[]> => {
  try {
    const response = await fetch(`${FOOD_ITEM_API_URL}/toBedonatedFoodByDonor`, {
      method: 'GET',
      credentials: 'include',
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to fetch food items for donation: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    return data.foodItems; // Return the array of food items
  } catch (err) {
    setError(err.message || 'Error fetching food items for donation');
    console.warn('Error:', err);
    throw err;
  }
};

export const useInventory = () => {
  const context = useContext(InventoryContext);
  if (!context) throw new Error('useInventory must be used within an InventoryProvider');
  return context;
};