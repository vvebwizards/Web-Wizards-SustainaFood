import React, { useState } from 'react';
import { Plus, Edit, Trash2, Filter, Search, Calendar, Settings } from 'lucide-react';
import { FoodItem } from '../components/FoodItemModal';
import { useInventory } from '../context/InventoryContext';
import { toast } from 'react-toastify';
import { Category } from '../components/CategoryModal'; // Ensure this path is correct

interface Category {
  _id: string;
  name: string;
}

const Inventory: React.FC = () => {
  const { inventory, categories, addFoodItem, updateFoodItem, deleteFoodItem, addCategory, deleteCategory, error } = useInventory();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingItem, setEditingItem] = useState<FoodItem | null>(null);
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [newCategory, setNewCategory] = useState('');
  const [isAddingCategory, setIsAddingCategory] = useState(false);

  const filteredInventory = inventory.filter(item => {
    const matchesSearch = item.title ? item.title.toLowerCase().includes(searchTerm.toLowerCase()) : false;
    const matchesCategory = filterCategory ? item.category === filterCategory : true;
    return matchesSearch && matchesCategory;
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name === 'allergens') {
      const allergensArray = value.split(',').map(item => item.trim());
      setFormData(prev => ({ ...prev, [name]: allergensArray }));
    } else if (name === 'quantity') {
      setFormData(prev => ({ ...prev, [name]: parseInt(value) || 0 }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const [formData, setFormData] = useState<Omit<FoodItem, '_id' | 'createdAt' | 'updatedAt'>>({
    title: '',
    category: categories[0]?.name || 'produce',
    quantity: 0,
    unit: 'kg',
    expirationDate: '',
    nutritionalInfo: '',
    storageRequirements: 'room-temperature',
    notes: '',
    imageUrl: '',
    status: 'In Stock'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingItem) {
        await updateFoodItem(editingItem._id, formData);
        toast.success('Item updated successfully');
      } else {
        await addFoodItem(formData);
        toast.success('Item added successfully');
      }
      setFormData({
        title: '',
        category: categories[0]?.name || 'produce',
        quantity: 0,
        unit: 'kg',
        expirationDate: '',
        nutritionalInfo: '',
        storageRequirements: 'room-temperature',
        notes: '',
        imageUrl: '',
        status: 'In Stock'
      });
      setShowAddModal(false);
      setEditingItem(null);
    } catch (err) {
      console.error('Error:', err);
    }
  };

  const handleEdit = (item: FoodItem) => {
    setEditingItem(item);
    setFormData({
      title: item.title || '',
      category: item.category || categories[0]?.name || 'produce',
      quantity: item.quantity || 0,
      unit: item.unit || 'kg',
      expirationDate: item.expirationDate || '',
      nutritionalInfo: item.nutritionalInfo || '',
      storageRequirements: item.storageRequirements || 'room-temperature',
      notes: item.notes || '',
      imageUrl: item.imageUrl || '',
      status: item.status || 'In Stock'
    });
    setShowAddModal(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteFoodItem(id);
      toast.success('Item deleted successfully');
    } catch (err) {
      console.error('Error deleting item:', err);
    }
  };

  const handleSchedule = (item: FoodItem) => {
    console.log('Schedule pickup for:', item); // Placeholder
  };

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategory.trim()) return;
    if (categories.map(c => c.name.toLowerCase()).includes(newCategory.toLowerCase())) {
      toast.error('Category already exists');
      return;
    }
    setIsAddingCategory(true);
    try {
      await addCategory({ name: newCategory }); // Pass as Category object with name
      toast.success('Category added successfully');
      setNewCategory('');
      setShowCategoryModal(false);
    } catch (err) {
      console.error('Error adding category:', err);
      if (err.message.includes('Failed to add category')) {
        toast.error('Failed to add category. Please check your connection or authentication.');
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
      if (err.message.includes('Failed to delete category')) {
        toast.error('Failed to delete category. Please check your connection or authentication.');
      }
    }
  };

  const formatCategory = (category: string) => {
    return category.charAt(0).toUpperCase() + category.slice(1);
  };

  const handleRowClick = (id: string) => {
    setExpandedRow(expandedRow === id ? null : id);
  };

  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 space-y-4 md:space-y-0">
        <h2 className="text-xl font-semibold text-gray-800">Inventory Management</h2>
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
          <div className="relative">
            <input
              type="text"
              placeholder="Search inventory..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          </div>
          <div className="relative">
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 appearance-none"
            >
              <option value="">All Categories</option>
              {categories.map((category) => (
                <option key={category._id} value={category.name}>
                  {formatCategory(category.name)}
                </option>
              ))}
            </select>
            <Filter size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          </div>
          <button
            onClick={() => {
              setEditingItem(null);
              setFormData({
                title: '',
                category: categories[0]?.name || 'produce',
                quantity: 0,
                unit: 'kg',
                expirationDate: '',
                nutritionalInfo: '',
                storageRequirements: 'room-temperature',
                notes: '',
                imageUrl: '',
                status: 'In Stock'
              });
              setShowAddModal(true);
            }}
            className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            <Plus size={18} />
            <span>Add Item</span>
          </button>
          <button
            onClick={() => setShowCategoryModal(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Settings size={18} />
            <span>Manage Categories</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Image</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Expiration Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredInventory.length > 0 ? (
                filteredInventory.map((item) => (
                  <React.Fragment key={item._id}>
                    <tr onClick={() => handleRowClick(item._id)} className="cursor-pointer hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        {item.imageUrl ? (
                          <img
                            src={item.imageUrl}
                            alt={item.title || 'No Title'}
                            className="h-8 w-8 object-cover rounded"
                            onError={(e) => (e.currentTarget.src = '/placeholder-image.jpg')}
                          />
                        ) : (
                          <div className="h-8 w-8 bg-gray-200 rounded flex items-center justify-center text-gray-500 text-xs">
                            N/A
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {item.title || 'Untitled'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {item.quantity} {item.unit}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {item.expirationDate ? new Date(item.expirationDate).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            item.status === 'Donated'
                              ? 'bg-green-100 text-green-800'
                              : item.status === 'Expired'
                              ? 'bg-red-100 text-red-800'
                              : item.status === 'Scheduled'
                              ? 'bg-yellow-100 text-yellow-800'
                              : item.status === 'Damaged'
                              ? 'bg-orange-100 text-orange-800'
                              : item.status === 'ToDonation'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {item.status || 'In Stock'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={(e) => { e.stopPropagation(); handleEdit(item); }}
                            className="text-indigo-600 hover:text-indigo-900"
                            title="Edit"
                          >
                            <Edit size={18} />
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); handleDelete(item._id); }}
                            className="text-red-600 hover:text-red-900"
                            title="Delete"
                          >
                            <Trash2 size={18} />
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); handleSchedule(item); }}
                            className="text-green-600 hover:text-green-900"
                            title="Schedule Pickup"
                          >
                            <Calendar size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                    {expandedRow === item._id && (
                      <tr>
                        <td colSpan={6} className="px-6 py-4 bg-gray-50">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <p className="text-sm font-medium text-gray-700">Category:</p>
                              <p className="text-gray-900">{formatCategory(item.category)}</p>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-700">Storage:</p>
                              <p className="text-gray-900">{item.storageRequirements ? formatCategory(item.storageRequirements) : 'N/A'}</p>
                            </div>
                            {item.nutritionalInfo && (
                              <div className="md:col-span-2">
                                <p className="text-sm font-medium text-gray-700">Nutritional Info:</p>
                                <p className="text-gray-900">{item.nutritionalInfo}</p>
                              </div>
                            )}
                            {item.notes && (
                              <div className="md:col-span-2">
                                <p className="text-sm font-medium text-gray-700">Notes:</p>
                                <p className="text-gray-900">{item.notes}</p>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">
                    No inventory items found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
                  <input
                    type="url"
                    name="imageUrl"
                    value={formData.imageUrl || ''}
                    onChange={handleInputChange}
                    placeholder="https://example.com/image.jpg"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category*</label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="">Select Category</option>
                    {categories.map((category) => (
                      <option key={category._id} value={category.name}>
                        {formatCategory(category.name)}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Quantity*</label>
                  <input
                    type="number"
                    name="quantity"
                    value={formData.quantity}
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
                  onClick={() => setShowAddModal(false)}
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
      )}

      {/* Category Management Modal */}
      {showCategoryModal && (
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
                  onClick={() => setShowCategoryModal(false)}
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
      )}
    </div>
  );
};

export default Inventory;