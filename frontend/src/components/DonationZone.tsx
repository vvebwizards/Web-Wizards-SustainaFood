import React from 'react';
import { Heart, X } from 'lucide-react';
import { toast } from 'react-toastify';
import { FoodItem } from '../components/FoodItemModal';

interface DonationItem {
  item: FoodItem;
  quantity: number;
  quantityToDonation: number;
}

interface DonationZoneProps {
  donationItems: DonationItem[];
  setDonationItems: React.Dispatch<React.SetStateAction<DonationItem[]>>;
  handleDrop: (e: React.DragEvent<HTMLDivElement>) => void;
  handleDragOver: (e: React.DragEvent<HTMLDivElement>) => void;
}

const DonationZone: React.FC<DonationZoneProps> = ({ donationItems, setDonationItems, handleDrop, handleDragOver }) => {
  const handleDonationInputChange = (index: number, value: number) => {
    setDonationItems(prev => {
      const updated = [...prev];
      const maxQuantity = updated[index].item.quantity + updated[index].quantityToDonation;
      updated[index].quantityToDonation = value > maxQuantity ? maxQuantity : value < 0 ? 0 : value;
      updated[index].quantity = maxQuantity - updated[index].quantityToDonation;
      return updated;
    });
  };

  const handleRemoveDonationItem = (index: number) => {
    setDonationItems(prev => prev.filter((_, i) => i !== index));
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
            <div key={index} className="mb-4 p-3 bg-white border border-green-600 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-900">
                  {`${donation.item.title} to donate - ${donation.quantityToDonation} ${donation.item.unit} (Remaining: ${donation.quantity} ${donation.item.unit})`}
                </span>
                <button onClick={() => handleRemoveDonationItem(index)} className="text-red-600 hover:text-red-900">
                  <X size={16} />
                </button>
              </div>
              <div className="mt-2">
                <input
                  type="number"
                  min="0"
                  max={donation.quantity + donation.quantityToDonation}
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