import React from 'react';
import { Heart, X } from 'lucide-react';
import { useInventory } from '../context/InventoryContext';
import { toast } from 'react-toastify';

interface DonationItem {
  item: {
    _id: string;
    title: string;
    quantityToDonation: number;
    unit?: string;
  };
  quantityInStock?: number;
  quantityToDonation: number;
}

interface DonationZoneProps {
  donationItems: DonationItem[];
  setDonationItems: React.Dispatch<React.SetStateAction<DonationItem[]>>;
  handleDrop: (e: React.DragEvent<HTMLDivElement>) => void;
  handleDragOver: (e: React.DragEvent<HTMLDivElement>) => void;
  onCancel?: (itemId: string) => void;
}

const DonationZone: React.FC<DonationZoneProps> = ({ donationItems, setDonationItems, handleDrop, handleDragOver, onCancel }) => {
  const { cancelDonation, fetchFoodAvailableForDonation } = useInventory();

  console.log('DonationZone donationItems:', donationItems);

  const handleDonationInputChange = (index: number, value: number) => {
    setDonationItems(prev => {
      const updated = [...prev];
      const maxQuantity = updated[index].quantityToDonation;
      updated[index].quantityToDonation = value > maxQuantity ? maxQuantity : value < 0 ? 0 : value;
      return updated;
    });
  };

  const handleRemoveDonationItem = async (index: number) => {
    const donation = donationItems[index];
    if (!donation.item._id) {
      console.error('Cannot cancel donation: item._id is undefined', donation);
      setDonationItems(prev => prev.filter((_, i) => i !== index));
      return;
    }
    try {
      await cancelDonation(donation.item._id);
      const availableFoodItems = await fetchFoodAvailableForDonation();
      const updatedDonationItems = availableFoodItems.map(foodItem => ({
        item: foodItem,
        quantityInStock: foodItem.quantityInStock,
        quantityToDonation: foodItem.quantityToDonation || 0,
      }));
      setDonationItems(updatedDonationItems);
      console.log('Updated donationItems after removal:', updatedDonationItems);
      if (onCancel) {
        onCancel(donation.item._id);
      }
    } catch (err) {
      console.error('Error cancelling donation:', err);
      toast.error('Failed to cancel donation');
    }
  };

  return (
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
            <div
              key={donation.item._id || `donation-${index}`}
              className="mb-4 p-3 bg-white border border-green-600 rounded-lg"
            >
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-900">
                  {`${donation.item.title || 'Unknown Item'} to donate - ${donation.quantityToDonation} ${donation.item.unit || 'units'}`}
                </span>
                <button onClick={() => handleRemoveDonationItem(index)} className="text-red-600 hover:text-red-900">
                  <X size={16} />
                </button>
              </div>
              <div className="mt-2">
                <input
                  type="number"
                  min="0"
                  max={donation.quantityToDonation}
                  value={donation.quantityToDonation}
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
  );
};

export default DonationZone;