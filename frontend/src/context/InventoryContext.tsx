import React, { createContext, useState, useEffect, useContext } from 'react';
import axiosInstance from '../services/axiosConfig';
import { FoodItem } from '../components/FoodItemModal';
import { Category } from '../components/CategoryModal';

const FOOD_ITEM_PATH = "/foodItem";
const CATEGORY_PATH = "/category";

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
          axiosInstance.get(`${FOOD_ITEM_PATH}/getAll`),
          axiosInstance.get(`${CATEGORY_PATH}/getAll`),
        ]);

        setInventory(foodItemResponse.data);
        setCategories(categoryResponse.data);
      } catch (err) {
        setError(err.message || 'Error fetching data');
        console.error('Error fetching inventory data:', err);
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

      const response = await axiosInstance.post(`${FOOD_ITEM_PATH}/add`, formData, {
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

      const response = await axiosInstance.put(`${FOOD_ITEM_PATH}/update/${id}`, formData, {
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
      const response = await axiosInstance.post(`${CATEGORY_PATH}/add`, category);
      setCategories(prev => [...prev, response.data.category]);
    } catch (err) {
      setError(err.message || 'Error adding category');
      console.warn('Error:', err);
      throw err;
    }
  };

  const deleteFoodItem = async (id: string) => {
    try {
      await axiosInstance.delete(`${FOOD_ITEM_PATH}/deleteOne/${id}`);
      setInventory(prev => prev.filter(item => item._id !== id));
    } catch (err) {
      setError(err.message || 'Error deleting food item');
      console.warn('Error:', err);
      throw err;
    }
  };

  const deleteCategory = async (id: string) => {
    try {
      await axiosInstance.delete(`${CATEGORY_PATH}/deleteOne/${id}`);
      setCategories(prev => prev.filter(item => item._id !== id));
    } catch (err) {
      setError(err.message || 'Error deleting category');
      console.warn('Error:', err);
      throw err;
    }
  };

  const donateFoodItem = async (id: string, quantityToDonation: number) => {
    try {
      const response = await axiosInstance.put(`${FOOD_ITEM_PATH}/donate/${id}`, 
        { quantityToDonation }
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
      await axiosInstance.put(`${FOOD_ITEM_PATH}/cancelDonation/${id}`, {});

      const foodItemResponse = await axiosInstance.get(`${FOOD_ITEM_PATH}/getAll`);
      setInventory(foodItemResponse.data);

      const donationResponse = await axiosInstance.get(`${FOOD_ITEM_PATH}/toBeDonatedFoodByDonor`);
      return donationResponse.data;
    } catch (err) {
      setError(err.message || 'Error cancelling donation');
      console.warn('Error:', err);
      throw err;
    }
  };

  const fetchFoodAvailableForDonation = async (): Promise<FoodItem[]> => {
    try {
      const response = await axiosInstance.get(`${FOOD_ITEM_PATH}/toBedonatedFoodByDonor`);
      return response.data.foodItems;
    } catch (err) {
      setError(err.message || 'Error fetching food items for donation');
      console.warn('Error:', err);
      throw err;
    }
  };

  const predictQuantityRequested = async (foodItem: string, startDate: string, endDate: string): Promise<number> => {
    try {
      const response = await axiosInstance.post(`${FOOD_ITEM_PATH}/predict-quantity-requested`,
        { foodItem, startDate, endDate }
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