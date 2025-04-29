import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Filter, Search, GripVertical, Settings } from 'lucide-react';
import { FoodItem } from '../components/FoodItemModal';
import { useInventory } from '../context/InventoryContext';
import { toast } from 'react-toastify';
import AddCategoryForm from "../components/AddCategoryForm";
import AddFoodItemForm from '../components/AddFoodItemForm';
import DonationZone from '../components/DonationZone';

interface Category {
  _id: string;
  name: string;
}

interface DonationItem {
  item: FoodItem;
  quantityInStock: number;
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
            quantityInStock: foodItem.quantityInStock,
            quantityToDonation: foodItem.quantityToDonation || 0
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

  const handleEdit = (item: FoodItem) => {
    setEditingItem(item);
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
      quantityInStock: itemData.quantityInStock,
      quantityToDonation: itemData.quantityToDonation || 0
    };
    setPendingDonation(donationItem);
    setDonationQuantity(itemData.quantityToDonation || 0);
    setShowConfirmModal(true);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleConfirmDonation = async () => {
    if (!pendingDonation) return;

    if (donationQuantity <= 0 || donationQuantity > pendingDonation.item.quantityInStock) {
      toast.error('Please enter a valid quantity (greater than 0 and not exceeding available amount)');
      return;
    }

    try {
      await donateFoodItem(pendingDonation.item._id, donationQuantity);

      // Manually update the FoodItem based on donation logic
      const updatedFoodItem = {
        ...pendingDonation.item,
        quantityToDonation: (pendingDonation.item.quantityToDonation || 0) + donationQuantity,
        quantityInStock: pendingDonation.item.quantityInStock - donationQuantity,
        status: pendingDonation.item.quantityInStock - donationQuantity === 0 ? 'Pending Donation' : pendingDonation.item.status
      };

      setDonationItems(prev => {
        const updated = prev.filter(d => d.item._id !== pendingDonation.item._id);
        return [...updated, {
          item: updatedFoodItem,
          quantityInStock: updatedFoodItem.quantityInStock,
          quantityToDonation: updatedFoodItem.quantityToDonation || 0
        }];
      });
      toast.success('Item marked for donation successfully');
    } catch (err: any) {
      console.error('Error in handleConfirmDonation:', err);
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
                          {item.quantityInStock} {item.unit}
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

        <DonationZone
          donationItems={donationItems}
          setDonationItems={setDonationItems}
          handleDrop={handleDrop}
          handleDragOver={handleDragOver}
        />
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
                Quantity to Donate (Max: {pendingDonation.item.quantityInStock} {pendingDonation.item.unit || ''})
              </label>
              <input
                type="number"
                min="1"
                max={pendingDonation.item.quantityInStock}
                value={donationQuantity}
                onChange={(e) => setDonationQuantity(parseInt(e.target.value) || 0)}
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
        <AddFoodItemForm
          categories={categories}
          editingItem={editingItem}
          onClose={() => {
            setShowAddModal(false);
            setEditingItem(null);
          }}
          addFoodItem={addFoodItem}
          updateFoodItem={updateFoodItem}
        />
      )}

      {showCategoryModal && (
        <AddCategoryForm
          categories={categories}
          addCategory={addCategory}
          deleteCategory={deleteCategory}
          onClose={() => setShowCategoryModal(false)}
        />
      )}
    </div>
  );
};

export default Inventory;