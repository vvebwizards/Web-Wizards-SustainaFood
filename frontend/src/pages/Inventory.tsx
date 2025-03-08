import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Filter, Search, Heart, GripVertical, X, Settings } from 'lucide-react';
import { FoodItem } from '../components/FoodItemModal';
import { useInventory } from '../context/InventoryContext';
import { toast } from 'react-toastify';

interface Category {
  _id: string;
  name: string;
}

interface DonationItem {
  item: FoodItem;
  quantity: number; 
  quantityToDonation: number; 
}

const Inventory: React.FC = () => {
  const { inventory, categories, addFoodItem, updateFoodItem, deleteFoodItem, donateFoodItem, fetchFoodAvailableForDonation, addCategory, deleteCategory, error } = useInventory();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingItem, setEditingItem] = useState<FoodItem | null>(null);
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [newCategory, setNewCategory] = useState('');
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [donationItems, setDonationItems] = useState<DonationItem[]>([]);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [pendingDonation, setPendingDonation] = useState<DonationItem | null>(null);
  const [donationQuantity, setDonationQuantity] = useState<number>(0);


  useEffect(() => {
    const initializeDonationItems = async () => {
      try {
    
        const storedDonationItems = localStorage.getItem('donationItems');
        let initialDonationItems: DonationItem[] = storedDonationItems ? JSON.parse(storedDonationItems) : [];
        const availableFoodItems = await fetchFoodAvailableForDonation();
   
        const mergedDonationItems = availableFoodItems.map(foodItem => {
          const existing = initialDonationItems.find(d => d.item._id === foodItem._id);
          if (existing) {
            return existing; 
          }
          return {
            item: foodItem,
            quantity: foodItem.quantity,
            quantityToDonation: 0 
          };
        });

       
        initialDonationItems.forEach(localItem => {
          if (!mergedDonationItems.some(d => d.item._id === localItem.item._id)) {
            mergedDonationItems.push(localItem);
          }
        });

        setDonationItems(mergedDonationItems);
      } catch (err) {
        console.error('Error initializing donation items:', err);
        toast.error('Failed to load food items for donation');
      }
    };

    initializeDonationItems();
  }, [fetchFoodAvailableForDonation]);

 
  useEffect(() => {
    localStorage.setItem('donationItems', JSON.stringify(donationItems));
  }, [donationItems]);

  const filteredInventory = inventory.filter(item => {
    const matchesSearch = item.title ? item.title.toLowerCase().includes(searchTerm.toLowerCase()) : false;
    const matchesCategory = filterCategory ? item.category === filterCategory : true;
    return matchesSearch && matchesCategory;
  });

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
    status: 'In Stock',
    type: 'free',
    quantityToDonation: 0,
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name === 'quantity' || name === 'quantityToDonation') {
      setFormData(prev => ({ ...prev, [name]: parseInt(value) || 0 }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.quantity <= 0) {
      toast.error('The quantity must be greater than 0');
      return;
    }
    const currentDate = new Date();
    const expirationDate = new Date(formData.expirationDate);
    if (expirationDate <= currentDate) {
      toast.error('The expiration date must be later than the current date.');
      return;
    }
    try {
      if (editingItem) {
        await updateFoodItem(editingItem._id, formData);
        toast.success('Article mis à jour avec succès.');
      } else {
        await addFoodItem(formData);
        toast.success('Article ajouté avec succès.');
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
        status: 'In Stock',
        type: 'free',
        quantityToDonation: 0,
      });
      setShowAddModal(false);
      setEditingItem(null);
    } catch (err) {
      console.error('Erreur :', err);
      toast.error('Une erreur s\'est produite. Veuillez réessayer.');
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
      status: item.status || 'In Stock',
      type: item.type || 'free',
      quantityToDonation: item.quantityToDonation || 0,
    });
    setShowAddModal(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteFoodItem(id);
      toast.success('Item deleted successfully');
    
      setDonationItems(prev => prev.filter(d => d.item._id !== id));
    } catch (err) {
      console.error('Error deleting item:', err);
    }
  };

  const handleDragStart = (e: React.DragEvent<HTMLTableRowElement>, item: FoodItem) => {
    if (item.status !== 'In Stock') {
      e.preventDefault();
      toast.warn(`Cannot donate "${item.title}". Only items with "In Stock" status can be donated.`);
      return;
    }
    e.dataTransfer.setData('text/plain', JSON.stringify(item));
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const itemData = JSON.parse(e.dataTransfer.getData('text/plain')) as FoodItem;
    if (itemData.status !== 'In Stock') {
      toast.warn(`Cannot donate "${itemData.title}". Only items with "In Stock" status can be donated.`);
      return;
    }
    const donationItem: DonationItem = {
      item: itemData,
      quantity: itemData.quantity,
      quantityToDonation: itemData.quantityToDonation || 0
    };
    setPendingDonation(donationItem);
    setDonationQuantity(itemData.quantity);
    setShowConfirmModal(true);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleConfirmDonation = async () => {
    if (!pendingDonation) return;

    if (donationQuantity <= 0 || donationQuantity > pendingDonation.item.quantity) {
      toast.error('Please enter a valid quantity (greater than 0 and not exceeding available amount)');
      return;
    }

    try {
      await donateFoodItem(pendingDonation.item._id, donationQuantity);
      setDonationItems(prev => {
        const updated = prev.filter(d => d.item._id !== pendingDonation.item._id); // Remove if already present
        return [...updated, { 
          item: pendingDonation.item, 
          quantity: pendingDonation.item.quantity - donationQuantity, 
          quantityToDonation: donationQuantity 
        }];
      });
      toast.success('Item marked for donation successfully');
    } catch (err) {
      toast.error(err.message || 'Failed to mark item for donation');
    } finally {
      setShowConfirmModal(false);
      setPendingDonation(null);
      setDonationQuantity(0);
    }
  };

  const handleCancelDonation = () => {
    setShowConfirmModal(false);
    setPendingDonation(null);
    setDonationQuantity(0);
  };

  const handleDonationInputChange = (index: number, value: number) => {
    setDonationItems(prev => {
      const updated = [...prev];
      const maxQuantity = updated[index].item.quantity + updated[index].quantityToDonation; // Original total
      updated[index].quantityToDonation = value > maxQuantity ? maxQuantity : value;
      updated[index].quantity = maxQuantity - updated[index].quantityToDonation;
      return updated;
    });
  };

  const handleRemoveDonationItem = (index: number) => {
    setDonationItems(prev => prev.filter((_, i) => i !== index));
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
      await addCategory({ name: newCategory });
      toast.success('Category added successfully');
      setNewCategory('');
      setShowCategoryModal(false);
    } catch (err) {
      console.error('Error adding category:', err);
      toast.error('Failed to add category');
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

  const formatCategory = (category: string) => {
    return category.charAt(0).toUpperCase() + category.slice(1);
  };

  const handleRowClick = (id: string) => {
    setExpandedRow(expandedRow === id ? null : id);
  };

  const getExpirationColor = (date: string) => {
    const exp = new Date(date);
    const now = new Date();
    const diffHours = (exp.getTime() - now.getTime()) / (1000 * 60 * 60);
    if (diffHours <= 24) return 'text-red-600 border-l-4 border-red-600';
    if (diffHours <= 72) return 'text-yellow-600 border-l-4 border-yellow-600';
    return 'text-green-600';
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
                status: 'In Stock',
                type: 'free',
                quantityToDonation: 0,
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-2 py-3"></th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Image</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity In Stock</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Expiration Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredInventory.length > 0 ? (
                  filteredInventory.map((item) => (
                    <React.Fragment key={item._id}>
                      <tr
                        draggable={item.status === 'In Stock'}
                        onDragStart={(e) => handleDragStart(e, item)}
                        onClick={() => handleRowClick(item._id)}
                        className={`cursor-pointer hover:bg-gray-50 ${getExpirationColor(item.expirationDate || '')}`}
                      >
                        <td className="px-2 py-4">
                          <GripVertical size={18} className="text-gray-400 opacity-0 hover:opacity-100" />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {item.imageUrl ? (
                            <img
                              src={`http://localhost:5000${item.imageUrl}`}
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
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
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
                                : item.status === 'Pending Donation'
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
                          </div>
                        </td>
                      </tr>
                      {expandedRow === item._id && (
                        <tr>
                          <td colSpan={7} className="px-6 py-4 bg-gray-50">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <p className="text-sm font-medium text-gray-700">Category:</p>
                                <p className="text-gray-900">{formatCategory(item.category)}</p>
                              </div>
                              <div>
                                <p className="text-sm font-medium text-gray-700">Storage:</p>
                                <p className="text-gray-900">{item.storageRequirements ? formatCategory(item.storageRequirements) : 'N/A'}</p>
                              </div>
                              <div>
                                <p className="text-sm font-medium text-gray-700">Quantity to Donate:</p>
                                <p className="text-gray-900">{item.quantityToDonation || 0} {item.unit}</p>
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
                    <td colSpan={7} className="px-6 py-4 text-center text-sm text-gray-500">
                      No inventory items found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="lg:col-span-1 bg-green-100 rounded-lg shadow p-4 flex flex-col">
          <h3 className="text-lg font-semibold text-green-800 mb-4 flex items-center">
            <Heart size={20} className="mr-2" /> Donation Zone
          </h3>
          <div
            className="flex-1 overflow-y-auto border-2 border-dashed border-green-600 rounded-lg p-4"
            onDrop={handleDrop}
            onDragOver={handleDragOver}
          >
            {donationItems.length === 0 ? (
              <p className="text-gray-500 text-sm text-center">No items available for donation</p>
            ) : (
              donationItems.map((donation, index) => (
                <div key={index} className="mb-4 p-3 bg-white border border-green-600 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-900">
                      {donation.item.title} - {donation.quantityToDonation} {donation.item.unit} (Remaining: {donation.quantity})
                    </span>
                    <button onClick={() => handleRemoveDonationItem(index)} className="text-red-600 hover:text-red-900">
                      <X size={16} />
                    </button>
                  </div>
                  <div className="mt-2">
                    <input
                      type="number"
                      min="0"
                      max={donation.item.quantity + donation.item.quantityToDonation}
                      value={donation.item.quantityToDonation}
                      onChange={(e) => handleDonationInputChange(index, parseInt(e.target.value) || 0)}
                      className="w-full px-2 py-1 border border-gray-300 rounded-md text-sm"
                      placeholder="Quantity to Donate"
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

    
      {showConfirmModal && pendingDonation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Confirm Donation</h3>
            <p className="text-gray-700 mb-2">
              Are you sure you want to donate <strong>{pendingDonation.item.title}</strong>?
            </p>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Quantity to Donate (Max: {pendingDonation.item.quantity} {pendingDonation.item.unit})
              </label>
              <input
                type="number"
                min="1"
                max={pendingDonation.item.quantity}
                value={donationQuantity}
                onChange={(e) => setDonationQuantity(parseInt(e.target.value) || 1)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            <div className="flex justify-end space-x-3">
              <button
                onClick={handleCancelDonation}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDonation}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

     
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
                  <div className="relative">
                    <input
                      type="file"
                      name="image"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          setFormData((prev) => ({ ...prev, imageFile: e.target.files[0] }));
                        }
                      }}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <div className="flex items-center space-x-2">
                      <div className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 bg-gray-600 text-white hover:bg-gray-50">
                        Choisir un fichier
                      </div>
                      {formData.imageFile && (
                        <span className="text-sm text-gray-600">
                          {formData.imageFile.name}
                        </span>
                      )}
                    </div>
                  </div>
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