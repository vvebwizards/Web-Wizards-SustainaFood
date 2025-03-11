import React from 'react';
import { Calendar, Heart, Package, Tag, User } from 'lucide-react';
import { FoodItem } from "../components/FoodItemModal";

interface FoodCardProps {
  item: FoodItem;
  onOrder: (item: FoodItem) => void;
}

export function FoodCard({ item, onOrder }: FoodCardProps) {
  const isExpiringSoon = new Date(item.expirationDate).getTime() - new Date().getTime() < 7 * 24 * 60 * 60 * 1000;

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      <img 
        src={`http://localhost:5000${item.imageUrl}`} 
        alt={item.title} 
        className="w-full h-48 object-cover"
      />
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-semibold">{item.title}</h3>
          <span className={`px-2 py-1 rounded-full text-sm ${
            item.type === 'free' 
              ? 'bg-green-100 text-green-800' 
              : 'bg-blue-100 text-blue-800'
          }`}>
            {item.type === 'free' ? 'Free' : `$${item.price?.toFixed(2)}`}
          </span>
        </div>

        <p className="text-gray-600 text-sm mb-4">{item.notes}</p>

        <div className="space-y-2 text-sm">
          <div className="flex items-center text-gray-600">
            <Calendar className="w-4 h-4 mr-2" />
            <span className={isExpiringSoon ? 'text-red-600 font-semibold' : ''}>
              Expires: {new Date(item.expirationDate).toLocaleDateString()}
              {isExpiringSoon && ' (Expiring Soon!)'}
            </span>
          </div>

          <div className="flex items-center text-gray-600">
            <User className="w-4 h-4 mr-2" />
            <span>Donor: {item.donorId?.username}</span>
          </div>

          <div className="flex items-center text-gray-600">
            <Tag className="w-4 h-4 mr-2" />
            <span>Category: {item.category}</span>
          </div>
          <div className="flex items-center text-gray-600">
            <Package className="w-4 h-4 mr-2" />
            <span>Quantity Available: {item.quantityToDonation} {item.unit}</span>
          </div>
          {item.quantityToDonation > 0 ? (
            <button
              onClick={() => onOrder(item)}
              className="mt-4 w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center"
            >
              <Heart className="w-4 h-4 mr-2" />
              {item.type === 'free' ? 'Request Item' : 'Purchase Item'}
            </button>
          ) : (
            <div className="mt-4 text-center text-red-600 font-semibold">
              Out of Stock
            </div>
          )}
        </div>
      </div>
    </div>
  );
}