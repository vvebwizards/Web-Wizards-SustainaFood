import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { FoodItem } from '../components/FoodItemModal';
import { Category } from '../components/CategoryModal';

const FOOD_ITEM_API_URL = "https://foodreduce-backend.azurewebsites.net/api/foodItem";
const CATEGORY_API_URL = "https://foodreduce-backend.azurewebsites.net/api/category";

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
  cancelDonation: (id: string) => Promise<void>; 
  predictQuantityRequested: (foodItem: string,
    startDate: string,
    endDate: string) => Promise<number>;

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
          axios.get(`${FOOD_ITEM_API_URL}/getAll`, { withCredentials: true }),
          axios.get(`${CATEGORY_API_URL}/getAll`, { withCredentials: true }),
        ]);

        setInventory(foodItemResponse.data);
        setCategories(categoryResponse.data);
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
      formData.append('quantityInStock', item.quantityInStock.toString());
      formData.append('unit', item.unit);
      formData.append('expirationDate', item.expirationDate);
      if (item.nutritionalInfo) formData.append('nutritionalInfo', item.nutritionalInfo);
      if (item.storageRequirements) formData.append('storageRequirements', item.storageRequirements);
      if (item.notes) formData.append('notes', item.notes);
      formData.append('status', item.status || 'In Stock');
      if (item.imageFile) formData.append('imageUrl', item.imageFile);

      const response = await axios.post(`${FOOD_ITEM_API_URL}/add`, formData, {
        withCredentials: true,
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setInventory(prev => [...prev, response.data.foodItem]);
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
      if (item.quantityInStock !== undefined) formData.append('quantity', item.quantityInStock.toString());
      if (item.unit !== undefined) formData.append('unit', item.unit);
      if (item.expirationDate !== undefined) formData.append('expirationDate', item.expirationDate);
      if (item.nutritionalInfo !== undefined) formData.append('nutritionalInfo', item.nutritionalInfo);
      if (item.storageRequirements !== undefined) formData.append('storageRequirements', item.storageRequirements);
      if (item.notes !== undefined) formData.append('notes', item.notes);
      if (item.status !== undefined) formData.append('status', item.status);
      if (item.imageFile) formData.append('imageUrl', item.imageFile);

      const response = await axios.put(`${FOOD_ITEM_API_URL}/updateOne/${id}`, formData, {
        withCredentials: true,
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setInventory(prev => prev.map(i => (i._id === id ? response.data.foodItem : i)));
    } catch (err) {
      setError(err.message || 'Error updating food item');
      console.warn('Error:', err);
      throw err;
    }
  };

  const addCategory = async (category: Omit<Category, '_id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const response = await axios.post(`${CATEGORY_API_URL}/add`, category, {
        withCredentials: true,
      });
      setCategories(prev => [...prev, response.data.category]);
    } catch (err) {
      setError(err.message || 'Error adding category');
      console.warn('Error:', err);
      throw err;
    }
  };

  const deleteFoodItem = async (id: string) => {
    try {
      await axios.delete(`${FOOD_ITEM_API_URL}/deleteOne/${id}`, {
        withCredentials: true,
      });
      setInventory(prev => prev.filter(item => item._id !== id));
    } catch (err) {
      setError(err.message || 'Error deleting food item');
      console.warn('Error:', err);
      throw err;
    }
  };

  const deleteCategory = async (id: string) => {
    try {
      await axios.delete(`${CATEGORY_API_URL}/deleteOne/${id}`, {
        withCredentials: true,
      });
      setCategories(prev => prev.filter(item => item._id !== id));
    } catch (err) {
      setError(err.message || 'Error deleting category');
      console.warn('Error:', err);
      throw err;
    }
  };

  const donateFoodItem = async (id: string, quantityToDonation: number) => {
    try {
      const response = await axios.put(`${FOOD_ITEM_API_URL}/donate/${id}`, 
        { quantityToDonation },
        { withCredentials: true }
      );
      setInventory(prev => prev.map(item => (item._id === id ? response.data.foodItem : item)));
    } catch (err) {
      setError(err.message || 'Error donating food item');
      console.warn('Error:', err);
      throw err;
    }
  };

  const cancelDonation = async (id: string) => {
    try {
      await axios.put(`${FOOD_ITEM_API_URL}/cancelDonation/${id}`, {}, {
        withCredentials: true,
      });

      const foodItemResponse = await axios.get(`${FOOD_ITEM_API_URL}/getAll`, {
        withCredentials: true,
      });
      setInventory(foodItemResponse.data);

      const donationResponse = await axios.get(`${FOOD_ITEM_API_URL}/toBeDonatedFoodByDonor`, {
        withCredentials: true,
      });
      return donationResponse.data;
    } catch (err) {
      setError(err.message || 'Error cancelling donation');
      console.warn('Error:', err);
      throw err;
    }
  };

  const fetchFoodAvailableForDonation = async (): Promise<FoodItem[]> => {
    try {
      const response = await axios.get(`${FOOD_ITEM_API_URL}/toBedonatedFoodByDonor`, {
        withCredentials: true,
      });
      return response.data.foodItems;
    } catch (err) {
      setError(err.message || 'Error fetching food items for donation');
      console.warn('Error:', err);
      throw err;
    }
  };

  const predictQuantityRequested = async (foodItem: string, startDate: string, endDate: string): Promise<number> => {
    try {
      const response = await axios.post(`${FOOD_ITEM_API_URL}/predict-quantity-requested`,
        { foodItem, startDate, endDate },
        { withCredentials: true }
      );
      
      if (typeof response.data.predictedQuantityRequested === 'number') {
        return response.data.predictedQuantityRequested;
      } else {
        throw new Error('Invalid response from backend');
      }
    } catch (err) {
      console.warn('Error:', err);
      throw err;
    }
  };

  return (
    <InventoryContext.Provider
      value={{
        inventory,
        categories,
        addFoodItem,
        addCategory,
        updateFoodItem,
        deleteFoodItem,
        deleteCategory,
        donateFoodItem,
        fetchFoodAvailableForDonation,
        cancelDonation,
        predictQuantityRequested, 
        error,
      }}
    >
      {children}
    </InventoryContext.Provider>
  );
};


export const useInventory = () => {
  const context = useContext(InventoryContext);
  if (!context) throw new Error('useInventory must be used within an InventoryProvider');
  return context;
};