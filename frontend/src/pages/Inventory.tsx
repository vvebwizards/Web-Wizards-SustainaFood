import React, { useState } from 'react';
import { Plus, Edit, Trash2, Filter, Search, AlertCircle, Calendar } from 'lucide-react';
import { FoodItem } from '../components/FoodItemModal';



interface InventoryProps {
  inventory: FoodItem[];
  onAddItem: (item: Omit<FoodItem, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onUpdateItem: (id: string, item: Partial<FoodItem>) => void;
  onDeleteItem: (id: string) => void;
}

// Test item for demonstration
const testItem: FoodItem = {
  id: "1",
  name: "Peanut Butter",
  category: "pantry",
  quantity: 5,
  unit: "jars",
  expirationDate: "2025-12-31",
  nutritionalInfo: "Calories: 190, Protein: 7g, Fat: 16g, Carbs: 7g per 2 tbsp",
  allergens: ["peanuts"],
  storageRequirements: "room-temperature",
  notes: "High-quality brand, donated by Community Drive",
  status: "Available",
  imageUrl: "https://example.com/peanut-butter.jpg",
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

const Inventory: React.FC<InventoryProps> = ({ 
  inventory = [testItem], // Default to test item if no inventory provided
  onAddItem, 
  onUpdateItem, 
  onDeleteItem 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingItem, setEditingItem] = useState<FoodItem | null>(null);
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [categories, setCategories] = useState<string[]>([
    'produce', 'dairy', 'bakery', 'meat', 'pantry', 'prepared', 'other'
  ]);
  const [showPickupModal, setShowPickupModal] = useState(false);
  const [selectedItemForPickup, setSelectedItemForPickup] = useState<FoodItem | null>(null);
  
  const [formData, setFormData] = useState<Omit<FoodItem, 'id' | 'createdAt' | 'updatedAt'>>({
    name: '',
    category: 'produce',
    quantity: 0,
    unit: 'kg',
    expirationDate: '',
    nutritionalInfo: '',
    allergens: [],
    storageRequirements: 'room-temperature',
    notes: '',
    imageUrl: '',
    status: 'Available'
  });

  const handleAddCategory = (newCategory: string) => {
    if (newCategory && !categories.includes(newCategory)) {
      setCategories((prev) => [...prev, newCategory]);
    }
  };

  const filteredInventory = inventory.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingItem) {
      onUpdateItem(editingItem.id, formData);
    } else {
      onAddItem(formData);
    }
    setFormData({
      name: '',
      category: 'produce',
      quantity: 0,
      unit: 'kg',
      expirationDate: '',
      nutritionalInfo: '',
      allergens: [],
      storageRequirements: 'room-temperature',
      notes: '',
      imageUrl: '',
      status: 'Available'
    });
    setShowAddModal(false);
    setEditingItem(null);
  };

  const handleEdit = (item: FoodItem) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      category: item.category,
      quantity: item.quantity,
      unit: item.unit,
      expirationDate: item.expirationDate,
      nutritionalInfo: item.nutritionalInfo || '',
      allergens: item.allergens || [],
      storageRequirements: item.storageRequirements || 'room-temperature',
      notes: item.notes || '',
      imageUrl: item.imageUrl || '',
      status: item.status || 'Available'
    });
    setShowAddModal(true);
  };

  const handleSchedulePickup = (item: FoodItem) => {
    setSelectedItemForPickup(item);
    setShowPickupModal(true);
  };

  const formatCategory = (category: string) => {
    return category.charAt(0).toUpperCase() + category.slice(1);
  };

  const isExpiringSoon = (expirationDate: string) => {
    const today = new Date();
    const expDate = new Date(expirationDate);
    const diffTime = expDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 7 && diffDays >= 0;
  };

  return (
    <div className="p-6">
      {/* Inventory Header */}
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
                <option key={category} value={category}>
                  {formatCategory(category)}
                </option>
              ))}
            </select>
            <Filter size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          </div>
          <button
            onClick={() => {
              setEditingItem(null);
              setFormData({
                name: '',
                category: 'produce',
                quantity: 0,
                unit: 'kg',
                expirationDate: '',
                nutritionalInfo: '',
                allergens: [],
                storageRequirements: 'room-temperature',
                notes: '',
                imageUrl: '',
                status: 'Available'
              });
              setShowAddModal(true);
            }}
            className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            <Plus size={18} />
            <span>Add Item</span>
          </button>
        </div>
      </div>
      
      {/* Inventory Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Image</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Expiration Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Details</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredInventory.length > 0 ? (
                filteredInventory.map((item) => (
                  <React.Fragment key={item.id}>
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {item.imageUrl ? (
                          <img 
                            src={item.imageUrl} 
                            alt={item.name} 
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
                        {item.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {item.quantity} {item.unit}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {isExpiringSoon(item.expirationDate) && (
                            <AlertCircle size={16} className="text-amber-500 mr-1" />
                          )}
                          <span className={`text-sm ${isExpiringSoon(item.expirationDate) ? 'text-amber-600' : 'text-gray-500'}`}>
                            {new Date(item.expirationDate).toLocaleDateString()}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            item.status === 'Donated'
                              ? 'bg-green-100 text-green-800'
                              : item.status === 'Expired'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {item.status || 'Available'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <button
                          onClick={() => setExpandedRow(expandedRow === item.id ? null : item.id)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          {expandedRow === item.id ? '-' : '+'}
                        </button>
                      </td>
                    </tr>
                    {expandedRow === item.id && (
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
                            {item.allergens && item.allergens.length > 0 && (
                              <div className="md:col-span-2">
                                <p className="text-sm font-medium text-gray-700">Allergens:</p>
                                <p className="text-gray-900">{item.allergens.join(', ')}</p>
                              </div>
                            )}
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
                            <div className="md:col-span-2 flex space-x-2 mt-2">
                              <button
                                onClick={() => handleEdit(item)}
                                className="text-indigo-600 hover:text-indigo-900"
                                title="Edit"
                              >
                                <Edit size={18} />
                              </button>
                              <button
                                onClick={() => onDeleteItem(item.id)}
                                className="text-red-600 hover:text-red-900"
                                title="Delete"
                              >
                                <Trash2 size={18} />
                              </button>
                              <button
                                onClick={() => handleSchedulePickup(item)}
                                className="text-green-600 hover:text-green-900"
                                title="Schedule Pickup"
                              >
                                <Calendar size={18} />
                              </button>
                            </div>
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
      
      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              {editingItem ? 'Edit Inventory Item' : 'Add New Inventory Item'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Item Name*</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
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
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {formatCategory(category)}
                      </option>
                    ))}
                  </select>
                  <div className="mt-2">
                    <input
                      type="text"
                      placeholder="Add a new category..."
                      onBlur={(e) => handleAddCategory(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">Allergens (comma separated)</label>
                  <input
                    type="text"
                    name="allergens"
                    value={formData.allergens?.join(', ') || ''}
                    onChange={handleInputChange}
                    placeholder="e.g., milk, nuts, wheat"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
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

      {/* Pickup Modal */}
      {showPickupModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Schedule Pickup for {selectedItemForPickup?.name}
            </h3>
            <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Pickup Date*</label>
                <input
                  type="date"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Pickup Time*</label>
                <input
                  type="time"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setShowPickupModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                >
                  Schedule Pickup
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inventory;