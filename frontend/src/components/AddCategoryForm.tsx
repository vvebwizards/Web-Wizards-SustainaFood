import React, { useState } from 'react';
import { Trash2 } from 'lucide-react';
import { toast } from 'react-toastify';

interface Category {
  _id: string;
  name: string;
}

interface AddCategoryFormProps {
  categories: Category[];
  addCategory: (category: { name: string }) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  onClose: () => void;
}

const AddCategoryForm: React.FC<AddCategoryFormProps> = ({ categories, addCategory, deleteCategory, onClose }) => {
  const [newCategory, setNewCategory] = useState('');
  const [isAddingCategory, setIsAddingCategory] = useState(false);

  const formatCategory = (category: string) => {
    return category.charAt(0).toUpperCase() + category.slice(1);
  };

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedCategory = newCategory.trim();
    
    if (!trimmedCategory) {
      toast.error('Category name cannot be empty');
      return;
    }
    
    if (categories.map(c => c.name.toLowerCase()).includes(trimmedCategory.toLowerCase())) {
      toast.error('Category already exists');
      return;
    }
    
    setIsAddingCategory(true);
    try {
      await addCategory({ name: formatCategory(trimmedCategory) });
      toast.success('Category added successfully');
      setNewCategory('');
      onClose();
    } catch (err: any) {
      console.error('Error adding category:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Failed to add category';
      toast.error(errorMessage);
      if (err.response?.status === 500) {
        console.error('Server error details:', err.response.data);
      }
    } finally {
      setIsAddingCategory(false);
    }
  };

  const handleDeleteCategory = async (id: string) => {
    try {
      await deleteCategory(id);
      toast.success('Category deleted successfully');
    } catch (err) {
      console.error('Error deleting category:', err);
      toast.error('Failed to delete category');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Manage Categories</h3>
        <form onSubmit={handleAddCategory} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">New Category*</label>
            <input
              type="text"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              required
              disabled={isAddingCategory}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
            />
          </div>
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isAddingCategory}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isAddingCategory}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-400"
            >
              {isAddingCategory ? 'Adding...' : 'Add Category'}
            </button>
          </div>
        </form>
        <div className="mt-4">
          <h4 className="text-sm font-medium text-gray-700">Current Categories:</h4>
          <div className="mt-2 flex flex-wrap gap-2">
            {categories.map((category) => (
              <div key={category._id} className="flex items-center px-2 py-1 bg-gray-100 text-gray-800 text-sm rounded-full border border-gray-300">
                {formatCategory(category.name)}
                <button
                  onClick={() => handleDeleteCategory(category._id)}
                  className="ml-2 text-red-600 hover:text-red-800"
                  title="Delete Category"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddCategoryForm;