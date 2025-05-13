import React, { useState, useEffect } from 'react';
import { Cpu, Loader2, PlusCircle } from 'lucide-react';
import { toast } from 'react-toastify';
import { FoodItem } from '../components/FoodItemModal';
import { useCategoryManager } from '../utils/categoryUtils';

interface Category {
  _id: string;
  name: string;
}

interface AddFoodItemFormProps {
  categories: Category[];
  editingItem: FoodItem | null;
  onClose: () => void;
  addFoodItem: (formData: Omit<FoodItem, '_id' | 'createdAt' | 'updatedAt'> & { imageFile?: File }) => Promise<void>;
  updateFoodItem: (id: string, formData: Omit<FoodItem, '_id' | 'createdAt' | 'updatedAt'> & { imageFile?: File }) => Promise<void>;
}

const AddFoodItemForm: React.FC<AddFoodItemFormProps> = ({ categories, editingItem, onClose, addFoodItem, updateFoodItem }) => {
  const [formData, setFormData] = useState<Omit<FoodItem, '_id' | 'createdAt' | 'updatedAt'> & { imageFile?: File }>({
    title: editingItem?.title || '',
    category: editingItem?.category || categories[0]?.name || 'produce',
    quantityInStock: editingItem?.quantityInStock || 0,
    unit: editingItem?.unit || 'kg',
    expirationDate: editingItem?.expirationDate || '',
    nutritionalInfo: editingItem?.nutritionalInfo || '',
    storageRequirements: editingItem?.storageRequirements || 'room-temperature',
    notes: editingItem?.notes || '',
    imageUrl: editingItem?.imageUrl || '',
    status: editingItem?.status || 'In Stock',
    type: editingItem?.type || 'free',
    quantityToDonation: editingItem?.quantityToDonation || 0,
    imageFile: undefined,
  });
  const [isDetectingFreshness, setIsDetectingFreshness] = useState(false);
  const [isFoodRotten, setIsFoodRotten] = useState(false);
  const [showNewCategoryInput, setShowNewCategoryInput] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const { ensureCategoryExists } = useCategoryManager();

  const formatCategory = (category: string) => {
    if (!category) return '';
    return category.charAt(0).toUpperCase() + category.slice(1).toLowerCase();
  };

  // Sort categories alphabetically
  const sortedCategories = [...categories].sort((a, b) => 
    a.name.localeCompare(b.name)
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name === 'quantityInStock' || name === 'quantityToDonation') {
      setFormData(prev => ({ ...prev, [name]: parseInt(value) || 0 }));
    } else if (name === 'image' && e.target instanceof HTMLInputElement && e.target.files) {
      setFormData(prev => ({ ...prev, imageFile: e.target.files[0] }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleAddNewCategory = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) {
      toast.error('Please enter a category name');
      return;
    }

    try {
      await ensureCategoryExists(newCategoryName);
      setFormData(prev => ({ ...prev, category: newCategoryName }));
      setNewCategoryName('');
      setShowNewCategoryInput(false);
      toast.success('Category added successfully');
    } catch (error) {
      console.error('Error adding category:', error);
      toast.error('Failed to add category');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsFoodRotten(false);

    // If user is adding a new category but didn't save it
    if (showNewCategoryInput && newCategoryName) {
      toast.error('Please save the new category or select an existing one');
      return;
    }

    if (formData.quantityInStock <= 0) {
      toast.error('The quantity must be greater than 0');
      return;
    }

    const currentDate = new Date();
    const expirationDate = new Date(formData.expirationDate);
    if (expirationDate <= currentDate) {
      toast.error('The expiration date must be later than the current date.');
      return;
    }

    if (!editingItem && !formData.imageFile) {
      toast.error('Please upload an image for the new item.');
      return;
    }

    try {
      const categoryLower = formData.category.toLowerCase();
      if (!editingItem && (categoryLower === 'fruits' || categoryLower === 'vegetables')) {
        setIsDetectingFreshness(true);
      }

      if (editingItem) {
        await updateFoodItem(editingItem._id, formData);
        toast.success('Article mis à jour avec succès.');
      } else {
        await addFoodItem(formData);
        toast.success('Article ajouté avec succès.');
      }

      setIsDetectingFreshness(false);
      setIsFoodRotten(false);
      onClose();
    } catch (err: any) {
      setIsDetectingFreshness(false);
      const errorMsg = err.response?.data?.error || err.response?.data || err.message || 'An unknown error occurred.';
      if (errorMsg.toLowerCase().includes("rotten")) {
        setIsFoodRotten(true);
        toast.error("Food item is rotten and can't be donated.");
      } else {
        toast.error('An error occurred. Please try again.');
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="relative bg-white rounded-lg shadow-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {isDetectingFreshness && (
          <div className="absolute inset-0 flex items-center justify-center bg-green-100 bg-opacity-80 z-50">
            <div className="flex flex-col items-center space-y-4 p-6 bg-white rounded-lg border-2 border-dashed border-green-600 shadow-lg">
              <Cpu className="h-8 w-8 text-green-600" />
              <Loader2 className="animate-spin h-12 w-12 text-green-600" />
              <p className="text-green-600 text-xl font-semibold">
                AI Detecting Freshness...
              </p>
            </div>
          </div>
        )}
        {isFoodRotten && (
          <div className="absolute inset-0 flex items-center justify-center bg-red-100 bg-opacity-80 z-50">
            <div className="flex flex-col items-center space-y-4 p-6 bg-white rounded-lg border-2 border-dashed border-red-600 shadow-lg">
              <img
                src="https://thumbs.dreamstime.com/b/grumpy-rotten-red-apple-fruit-cartoon-mascot-character-grumpy-rotten-red-apple-fruit-cartoon-mascot-character-illustration-94818152.jpg"
                alt="Rotten Food"
                className="h-40 w-40 object-contain"
              />
              <p className="text-red-600 text-xl font-semibold">
                Rotten food can't be donated.
              </p>
            </div>
          </div>
        )}

        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          {editingItem ? 'Edit Inventory Item' : 'Add New Inventory Item'}
        </h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Item Title*</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Image*{editingItem ? ' (Optional)' : ''}</label>
              <div className="relative">
                <input
                  type="file"
                  name="image"
                  onChange={handleInputChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  required={!editingItem}
                />
                <div className="flex items-center space-x-2">
                  <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-600 text-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-500 z-0">
                    {formData.imageFile ? formData.imageFile.name : "choose file"}
                  </div>
                </div>
              </div>
            </div>
            <div className="mb-4">
              <div className="flex justify-between items-center mb-1">
                <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                  Category
                </label>
                <button
                  type="button"
                  onClick={() => setShowNewCategoryInput(!showNewCategoryInput)}
                  className="text-xs text-green-600 hover:text-green-800 flex items-center"
                >
                  <PlusCircle className="w-4 h-4 mr-1" />
                  {showNewCategoryInput ? 'Cancel' : 'New Category'}
                </button>
              </div>
              {showNewCategoryInput ? (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    placeholder="Enter new category name"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                  <button
                    type="button"
                    onClick={handleAddNewCategory}
                    className="px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                  >
                    Add
                  </button>
                </div>
              ) : (
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  required
                >
                  {sortedCategories.map((category) => (
                    <option key={category._id} value={category.name}>
                      {formatCategory(category.name)}
                    </option>
                  ))}
                </select>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Quantity*</label>
              <input
                type="number"
                name="quantityInStock"
                value={formData.quantityInStock}
                onChange={handleInputChange}
                required
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Unit*</label>
              <select
                name="unit"
                value={formData.unit}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="kg">Kilograms (kg)</option>
                <option value="lbs">Pounds (lbs)</option>
                <option value="items">Items</option>
                <option value="boxes">Boxes</option>
                <option value="pallets">Pallets</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Expiration Date*</label>
              <input
                type="date"
                name="expirationDate"
                value={formData.expirationDate}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Storage Requirements</label>
              <select
                name="storageRequirements"
                value={formData.storageRequirements || ''}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="room-temperature">Room Temperature</option>
                <option value="refrigerated">Refrigerated</option>
                <option value="frozen">Frozen</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Nutritional Information</label>
              <textarea
                name="nutritionalInfo"
                value={formData.nutritionalInfo || ''}
                onChange={handleInputChange}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
              <textarea
                name="notes"
                value={formData.notes || ''}
                onChange={handleInputChange}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
          </div>
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
            >
              {editingItem ? 'Update Item' : 'Add Item'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddFoodItemForm;